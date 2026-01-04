import { asyncHandler } from '../../../shared/middleware/asyncHandler.js';
import { successResponse, errorResponse } from '../../../shared/utils/response.js';
import Delivery from '../models/Delivery.js';
import Order from '../../order/models/Order.js';
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

