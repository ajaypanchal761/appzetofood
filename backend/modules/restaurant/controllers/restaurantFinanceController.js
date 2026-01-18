import Order from '../../order/models/Order.js';
import RestaurantCommission from '../../admin/models/RestaurantCommission.js';
import { successResponse, errorResponse } from '../../../shared/utils/response.js';
import asyncHandler from '../../../shared/middleware/asyncHandler.js';
import mongoose from 'mongoose';

/**
 * Get restaurant finance/payout data
 * GET /api/restaurant/finance
 * Query params: startDate, endDate (for past cycles)
 */
export const getRestaurantFinance = asyncHandler(async (req, res) => {
  try {
    const restaurant = req.restaurant;
    const { startDate, endDate } = req.query;

    // Get restaurant ID
    const restaurantId = restaurant._id?.toString() || restaurant.restaurantId || restaurant.id;

    if (!restaurantId) {
      return errorResponse(res, 500, 'Restaurant ID not found');
    }

    // Calculate current cycle dates (default: Monday to Sunday of current week)
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1; // Convert Sunday (0) to 6
    
    // Start of current cycle (Monday)
    const currentCycleStart = new Date(now);
    currentCycleStart.setDate(now.getDate() - daysFromMonday);
    currentCycleStart.setHours(0, 0, 0, 0);
    
    // End of current cycle (Sunday)
    const currentCycleEnd = new Date(currentCycleStart);
    currentCycleEnd.setDate(currentCycleStart.getDate() + 6);
    currentCycleEnd.setHours(23, 59, 59, 999);

    // Query for restaurant orders - handle multiple restaurantId formats
    const restaurantIdVariations = [restaurantId];
    if (mongoose.Types.ObjectId.isValid(restaurantId)) {
      const objectIdString = new mongoose.Types.ObjectId(restaurantId).toString();
      if (!restaurantIdVariations.includes(objectIdString)) {
        restaurantIdVariations.push(objectIdString);
      }
    }

    const restaurantIdQuery = {
      $or: [
        { restaurantId: { $in: restaurantIdVariations } },
        { restaurantId: restaurantId }
      ]
    };

    // Get commission setup for restaurant
    let restaurantCommission = null;
    try {
      restaurantCommission = await RestaurantCommission.findOne({
        restaurant: restaurantId,
        status: true
      }).lean();
    } catch (commissionError) {
      console.warn('⚠️ Could not fetch commission setup:', commissionError.message);
    }

    // Helper function to calculate commission for an order
    const calculateCommissionForOrder = (orderAmount) => {
      if (!restaurantCommission || !restaurantCommission.status) {
        // Default 10% if no commission setup
        return {
          commission: (orderAmount * 10) / 100,
          type: 'percentage',
          value: 10
        };
      }

      // Find matching commission rule
      const sortedRules = [...(restaurantCommission.commissionRules || [])]
        .filter(rule => rule.isActive)
        .sort((a, b) => {
          if (b.priority !== a.priority) {
            return b.priority - a.priority;
          }
          return a.minOrderAmount - b.minOrderAmount;
        });

      let matchingRule = null;
      for (const rule of sortedRules) {
        if (orderAmount >= rule.minOrderAmount) {
          if (rule.maxOrderAmount === null || orderAmount <= rule.maxOrderAmount) {
            matchingRule = rule;
            break;
          }
        }
      }

      let commission = 0;
      let commissionType = 'percentage';
      let commissionValue = 10;

      if (matchingRule) {
        commissionType = matchingRule.type;
        commissionValue = matchingRule.value;
        if (matchingRule.type === 'percentage') {
          commission = (orderAmount * matchingRule.value) / 100;
        } else {
          commission = matchingRule.value;
        }
      } else if (restaurantCommission.defaultCommission) {
        commissionType = restaurantCommission.defaultCommission.type || 'percentage';
        commissionValue = restaurantCommission.defaultCommission.value || 10;
        if (commissionType === 'percentage') {
          commission = (orderAmount * commissionValue) / 100;
        } else {
          commission = commissionValue;
        }
      } else {
        // Default 10%
        commission = (orderAmount * 10) / 100;
      }

      return {
        commission: Math.round(commission * 100) / 100,
        type: commissionType,
        value: commissionValue
      };
    };

    // Get current cycle orders (delivered orders in current week)
    // Query orders that were delivered in the current cycle
    // First try with deliveredAt, if not found, use tracking.delivered.timestamp as fallback
    let currentCycleOrders = await Order.find({
      ...restaurantIdQuery,
      status: 'delivered',
      $or: [
        { deliveredAt: { $gte: currentCycleStart, $lte: currentCycleEnd } },
        { 'tracking.delivered.timestamp': { $gte: currentCycleStart, $lte: currentCycleEnd } }
      ]
    }).lean();

    // If no orders found with deliveredAt/tracking, check by createdAt as last resort
    if (currentCycleOrders.length === 0) {
      currentCycleOrders = await Order.find({
        ...restaurantIdQuery,
        status: 'delivered',
        createdAt: { $gte: currentCycleStart, $lte: currentCycleEnd }
      }).lean();
    }

    console.log(`📊 Finance API - Current cycle orders found: ${currentCycleOrders.length} for restaurant ${restaurantId}`);
    console.log(`📅 Date range: ${currentCycleStart.toISOString()} to ${currentCycleEnd.toISOString()}`);

    // Calculate current cycle payout
    let currentCycleTotal = 0;
    let currentCycleCommission = 0;
    const currentCycleOrdersData = currentCycleOrders.map(order => {
      const orderTotal = order.pricing?.total || 0;
      const commissionData = calculateCommissionForOrder(orderTotal);
      const payout = orderTotal - commissionData.commission;
      
      currentCycleTotal += orderTotal;
      currentCycleCommission += commissionData.commission;

      return {
        orderId: order.orderId || order._id,
        orderTotal,
        commission: commissionData.commission,
        payout,
        deliveredAt: order.deliveredAt || order.createdAt
      };
    });

    // Format current cycle dates
    const formatCycleDate = (date) => {
      const day = date.getDate();
      const month = date.toLocaleString('en-US', { month: 'short' });
      const year = date.getFullYear().toString().slice(-2);
      return { day: day.toString(), month, year };
    };

    const currentCycleStartFormatted = formatCycleDate(currentCycleStart);
    const currentCycleEndFormatted = formatCycleDate(currentCycleEnd);

    // Get past cycles orders if date range provided
    let pastCyclesData = null;
    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      // Query orders that were delivered in the past cycle
      // First try with deliveredAt, if not found, use tracking.delivered.timestamp as fallback
      let pastCycleOrders = await Order.find({
        ...restaurantIdQuery,
        status: 'delivered',
        $or: [
          { deliveredAt: { $gte: start, $lte: end } },
          { 'tracking.delivered.timestamp': { $gte: start, $lte: end } }
        ]
      }).lean();

      // If no orders found with deliveredAt/tracking, check by createdAt as last resort
      if (pastCycleOrders.length === 0) {
        pastCycleOrders = await Order.find({
          ...restaurantIdQuery,
          status: 'delivered',
          createdAt: { $gte: start, $lte: end }
        }).lean();
      }

      console.log(`📊 Finance API - Past cycle orders found: ${pastCycleOrders.length} for date range ${startDate} to ${endDate}`);

      let pastCycleTotal = 0;
      let pastCycleCommission = 0;
      const pastCycleOrdersData = pastCycleOrders.map(order => {
        const orderTotal = order.pricing?.total || 0;
        const commissionData = calculateCommissionForOrder(orderTotal);
        const payout = orderTotal - commissionData.commission;
        
        pastCycleTotal += orderTotal;
        pastCycleCommission += commissionData.commission;

        return {
          orderId: order.orderId || order._id,
          orderTotal,
          commission: commissionData.commission,
          payout,
          deliveredAt: order.deliveredAt || order.createdAt
        };
      });

      pastCyclesData = {
        dateRange: {
          start: formatCycleDate(start),
          end: formatCycleDate(end)
        },
        totalOrders: pastCycleOrders.length,
        totalOrderValue: Math.round(pastCycleTotal * 100) / 100,
        totalCommission: Math.round(pastCycleCommission * 100) / 100,
        estimatedPayout: Math.round((pastCycleTotal - pastCycleCommission) * 100) / 100,
        orders: pastCycleOrdersData
      };
    }

    // Calculate current cycle payout (total - commission)
    const currentCyclePayout = Math.round((currentCycleTotal - currentCycleCommission) * 100) / 100;

    return successResponse(res, 200, 'Finance data retrieved successfully', {
      currentCycle: {
        start: currentCycleStartFormatted,
        end: currentCycleEndFormatted,
        totalOrders: currentCycleOrders.length,
        totalOrderValue: Math.round(currentCycleTotal * 100) / 100,
        totalCommission: Math.round(currentCycleCommission * 100) / 100,
        estimatedPayout: currentCyclePayout,
        payoutDate: null, // Will be set when payout is processed
        orders: currentCycleOrdersData
      },
      pastCycles: pastCyclesData,
      restaurant: {
        name: restaurant.name || 'Restaurant',
        restaurantId: restaurant.restaurantId || restaurantId,
        address: restaurant.location?.address || restaurant.location?.formattedAddress || ''
      }
    });
  } catch (error) {
    console.error('Error fetching restaurant finance:', error);
    return errorResponse(res, 500, 'Failed to fetch finance data');
  }
});
