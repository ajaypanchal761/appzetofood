import { asyncHandler } from '../../../shared/middleware/asyncHandler.js';
import { successResponse, errorResponse } from '../../../shared/utils/response.js';
import Delivery from '../models/Delivery.js';
import Order from '../../order/models/Order.js';
import EarningAddon from '../../admin/models/EarningAddon.js';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

/**
 * Get Delivery Partner Earnings
 * GET /api/delivery/earnings
 * Query params: period (today, week, month, all), page, limit
 */
export const getEarnings = asyncHandler(async (req, res) => {
  try {
    const delivery = req.delivery;
    const { period = 'all', page = 1, limit = 20 } = req.query;

    // Calculate date range based on period
    let startDate = null;
    const endDate = new Date();

    switch (period) {
      case 'today':
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'all':
      default:
        startDate = null;
        break;
    }

    // Build query
    const query = {
      deliveryPartnerId: delivery._id,
      status: 'delivered'
    };

    if (startDate) {
      query.deliveredAt = { $gte: startDate, $lte: endDate };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch orders with earnings
    const orders = await Order.find(query)
      .sort({ deliveredAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('orderId restaurantName pricing.deliveryFee pricing.tip deliveredAt status')
      .lean();

    // Calculate totals
    const totalOrders = await Order.countDocuments(query);
    
    const earningsData = await Order.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalDeliveryFee: { $sum: '$pricing.deliveryFee' },
          totalTips: { $sum: '$pricing.tip' },
          totalEarnings: {
            $sum: {
              $add: ['$pricing.deliveryFee', '$pricing.tip']
            }
          }
        }
      }
    ]);

    const totals = earningsData[0] || {
      totalDeliveryFee: 0,
      totalTips: 0,
      totalEarnings: 0
    };

    return successResponse(res, 200, 'Earnings retrieved successfully', {
      earnings: orders.map(order => ({
        orderId: order.orderId,
        restaurantName: order.restaurantName,
        deliveryFee: order.pricing?.deliveryFee || 0,
        tip: order.pricing?.tip || 0,
        total: (order.pricing?.deliveryFee || 0) + (order.pricing?.tip || 0),
        deliveredAt: order.deliveredAt
      })),
      summary: {
        period,
        totalOrders,
        totalDeliveryFee: totals.totalDeliveryFee,
        totalTips: totals.totalTips,
        totalEarnings: totals.totalEarnings
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalOrders,
        pages: Math.ceil(totalOrders / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error(`Error fetching delivery earnings: ${error.message}`);
    return errorResponse(res, 500, 'Failed to fetch earnings');
  }
});

/**
 * Get Active Earning Addon Offers for Delivery Partner
 * GET /api/delivery/earnings/active-offers
 */
export const getActiveEarningAddons = asyncHandler(async (req, res) => {
  try {
    const delivery = req.delivery;
    const now = new Date();

    // Get ALL active earning addons (not just those currently valid)
    // This includes offers that haven't started yet but are active
    const activeAddons = await EarningAddon.find({
      status: 'active',
      endDate: { $gte: now }, // Only show offers that haven't ended yet
      $or: [
        { maxRedemptions: null },
        { $expr: { $lt: ['$currentRedemptions', '$maxRedemptions'] } }
      ]
    })
      .select('title description requiredOrders earningAmount startDate endDate status maxRedemptions currentRedemptions createdAt')
      .sort({ createdAt: -1 }) // Get most recent first
      .lean();

    logger.info(`Found ${activeAddons.length} active earning addons for delivery partner ${delivery._id}`);

    // Check validity for each addon and add delivery partner's progress
    const addonsWithProgress = await Promise.all(
      activeAddons.map(async (addon) => {
        const startDate = new Date(addon.startDate);
        const endDate = new Date(addon.endDate);
        
        // Calculate delivery partner's order count for the offer period
        // Count orders from start date to now (or end date if offer hasn't started)
        const countStartDate = now > startDate ? startDate : now;
        const orderCount = await Order.countDocuments({
          deliveryPartnerId: delivery._id,
          status: 'delivered',
          deliveredAt: {
            $gte: countStartDate,
            $lte: now > endDate ? endDate : now
          }
        });

        // Check if offer is currently valid (started and not ended)
        const isValid = addon.status === 'active' &&
          now >= startDate &&
          now <= endDate &&
          (addon.maxRedemptions === null || addon.currentRedemptions < addon.maxRedemptions);

        // Check if offer is upcoming (not started yet)
        const isUpcoming = addon.status === 'active' && now < startDate;

        return {
          ...addon,
          isValid,
          isUpcoming,
          currentOrders: orderCount,
          progress: addon.requiredOrders > 0 ? Math.min(orderCount / addon.requiredOrders, 1) : 0
        };
      })
    );

    logger.info(`Returning ${addonsWithProgress.length} offers with progress data`);

    return successResponse(res, 200, 'Active earning addons retrieved successfully', {
      activeOffers: addonsWithProgress
    });
  } catch (error) {
    logger.error(`Error fetching active earning addons: ${error.message}`, { stack: error.stack });
    return errorResponse(res, 500, 'Failed to fetch active earning addons');
  }
});

