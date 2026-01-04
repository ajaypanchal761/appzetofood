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
 * Get Delivery Boy Dashboard Data
 * Returns wallet balance, stats, joining bonus status, and recent orders
 */
export const getDashboard = asyncHandler(async (req, res) => {
  try {
    const delivery = req.delivery; // From authenticate middleware

    // Get order statistics
    // Note: deliveryPartnerId in Order model references User, but we'll use delivery._id
    // In future, this should be updated to reference Delivery model
    let totalOrders = 0;
    let completedOrders = 0;
    let pendingOrders = 0;

    try {
      totalOrders = await Order.countDocuments({ 
        deliveryPartnerId: delivery._id 
      });
    } catch (error) {
      logger.warn(`Error counting total orders for delivery ${delivery._id}:`, error);
    }

    try {
      completedOrders = await Order.countDocuments({ 
        deliveryPartnerId: delivery._id,
        status: 'delivered'
      });
    } catch (error) {
      logger.warn(`Error counting completed orders for delivery ${delivery._id}:`, error);
    }

    try {
      pendingOrders = await Order.countDocuments({ 
        deliveryPartnerId: delivery._id,
        status: { $in: ['out_for_delivery', 'ready'] }
      });
    } catch (error) {
      logger.warn(`Error counting pending orders for delivery ${delivery._id}:`, error);
    }

    // Calculate joining bonus status
    // Joining bonus: ₹100, unlocked after completing 1 order
    const joiningBonusAmount = 100;
    const joiningBonusUnlockThreshold = 1; // Complete 1 order to unlock
    const joiningBonusUnlocked = completedOrders >= joiningBonusUnlockThreshold;
    const joiningBonusClaimed = delivery.wallet?.joiningBonusClaimed || false;
    const joiningBonusValidTill = new Date('2025-12-10'); // Valid till 10 December 2025

    // Calculate wallet balance
    const walletBalance = delivery.wallet?.balance || 0;
    const totalEarned = delivery.earnings?.totalEarned || 0;
    const currentBalance = delivery.earnings?.currentBalance || 0;
    const pendingPayout = delivery.earnings?.pendingPayout || 0;
    const tips = delivery.earnings?.tips || 0;

    // Calculate weekly earnings (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    let weeklyOrders = [];
    try {
      weeklyOrders = await Order.find({
        deliveryPartnerId: delivery._id,
        status: 'delivered',
        deliveredAt: { $gte: sevenDaysAgo }
      }).select('pricing.deliveryFee');
    } catch (error) {
      logger.warn(`Error fetching weekly orders for delivery ${delivery._id}:`, error);
    }

    const weeklyEarnings = weeklyOrders.reduce((sum, order) => {
      return sum + (order.pricing?.deliveryFee || 0);
    }, 0);

    // Get recent orders (last 5)
    let recentOrders = [];
    try {
      recentOrders = await Order.find({
        deliveryPartnerId: delivery._id
      })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('orderId status createdAt deliveredAt pricing.deliveryFee restaurantName')
        .lean();
    } catch (error) {
      logger.warn(`Error fetching recent orders for delivery ${delivery._id}:`, error);
    }

    // Calculate today's earnings
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    let todayOrders = [];
    try {
      todayOrders = await Order.find({
        deliveryPartnerId: delivery._id,
        status: 'delivered',
        deliveredAt: { $gte: todayStart }
      }).select('pricing.deliveryFee');
    } catch (error) {
      logger.warn(`Error fetching today's orders for delivery ${delivery._id}:`, error);
    }

    const todayEarnings = todayOrders.reduce((sum, order) => {
      return sum + (order.pricing?.deliveryFee || 0);
    }, 0);

    // Prepare dashboard data
    const dashboardData = {
      profile: {
        id: delivery._id,
        deliveryId: delivery.deliveryId,
        name: delivery.name,
        phone: delivery.phone,
        email: delivery.email,
        profileImage: delivery.profileImage?.url || null,
        status: delivery.status,
        level: delivery.level,
        rating: delivery.metrics?.rating || 0,
        ratingCount: delivery.metrics?.ratingCount || 0,
      },
      wallet: {
        balance: walletBalance,
        totalEarned: totalEarned,
        currentBalance: currentBalance,
        pendingPayout: pendingPayout,
        tips: tips,
        todayEarnings: todayEarnings,
        weeklyEarnings: weeklyEarnings,
      },
      stats: {
        totalOrders: totalOrders,
        completedOrders: completedOrders,
        pendingOrders: pendingOrders,
        cancelledOrders: delivery.metrics?.cancelledOrders || 0,
        onTimeDeliveryRate: delivery.metrics?.onTimeDeliveryRate || 0,
        averageDeliveryTime: delivery.metrics?.averageDeliveryTime || 0,
      },
      joiningBonus: {
        amount: joiningBonusAmount,
        unlocked: joiningBonusUnlocked,
        claimed: joiningBonusClaimed,
        unlockThreshold: joiningBonusUnlockThreshold,
        ordersCompleted: completedOrders,
        ordersRequired: joiningBonusUnlockThreshold,
        validTill: joiningBonusValidTill,
        message: joiningBonusUnlocked 
          ? (joiningBonusClaimed ? 'Bonus claimed' : 'Complete 1 order to unlock')
          : 'Complete 1 order to unlock',
      },
      recentOrders: recentOrders.map(order => ({
        orderId: order.orderId,
        status: order.status,
        restaurantName: order.restaurantName,
        deliveryFee: order.pricing?.deliveryFee || 0,
        createdAt: order.createdAt,
        deliveredAt: order.deliveredAt,
      })),
      availability: {
        isOnline: delivery.availability?.isOnline || false,
        lastLocationUpdate: delivery.availability?.lastLocationUpdate || null,
      }
    };

    logger.info(`Dashboard data retrieved for delivery: ${delivery._id}`, {
      deliveryId: delivery.deliveryId,
      totalOrders,
      completedOrders,
    });

    return successResponse(res, 200, 'Dashboard data retrieved successfully', dashboardData);
  } catch (error) {
    logger.error('Error fetching delivery dashboard:', error);
    return errorResponse(res, 500, 'Failed to fetch dashboard data');
  }
});

/**
 * Get Wallet Balance
 * Returns detailed wallet information
 */
export const getWalletBalance = asyncHandler(async (req, res) => {
  try {
    const delivery = req.delivery;

    const walletData = {
      balance: delivery.wallet?.balance || 0,
      totalEarned: delivery.earnings?.totalEarned || 0,
      currentBalance: delivery.earnings?.currentBalance || 0,
      pendingPayout: delivery.earnings?.pendingPayout || 0,
      tips: delivery.earnings?.tips || 0,
      transactions: delivery.wallet?.transactions || [],
      joiningBonusClaimed: delivery.wallet?.joiningBonusClaimed || false,
    };

    return successResponse(res, 200, 'Wallet balance retrieved successfully', walletData);
  } catch (error) {
    logger.error('Error fetching wallet balance:', error);
    return errorResponse(res, 500, 'Failed to fetch wallet balance');
  }
});

/**
 * Claim Joining Bonus
 * Claims the ₹100 joining bonus after completing first order
 */
export const claimJoiningBonus = asyncHandler(async (req, res) => {
  try {
    const delivery = req.delivery;

    // Check if already claimed
    if (delivery.wallet?.joiningBonusClaimed) {
      return errorResponse(res, 400, 'Joining bonus already claimed');
    }

    // Check if bonus is unlocked (completed at least 1 order)
    let completedOrders = 0;
    try {
      completedOrders = await Order.countDocuments({ 
        deliveryPartnerId: delivery._id,
        status: 'delivered'
      });
    } catch (error) {
      logger.warn(`Error counting completed orders for joining bonus:`, error);
    }

    if (completedOrders < 1) {
      return errorResponse(res, 400, 'Complete at least 1 order to unlock joining bonus');
    }

    // Check if bonus is still valid
    const joiningBonusValidTill = new Date('2025-12-10');
    if (new Date() > joiningBonusValidTill) {
      return errorResponse(res, 400, 'Joining bonus has expired');
    }

    // Add bonus to wallet
    const bonusAmount = 100;
    const currentBalance = delivery.wallet?.balance || 0;
    const newBalance = currentBalance + bonusAmount;

    // Update wallet
    delivery.wallet = {
      balance: newBalance,
      joiningBonusClaimed: true,
      transactions: [
        ...(delivery.wallet?.transactions || []),
        {
          amount: bonusAmount,
          type: 'deposit',
          reason: 'Joining bonus',
          date: new Date(),
        }
      ]
    };

    // Update earnings
    delivery.earnings = {
      ...delivery.earnings,
      totalEarned: (delivery.earnings?.totalEarned || 0) + bonusAmount,
      currentBalance: (delivery.earnings?.currentBalance || 0) + bonusAmount,
    };

    await delivery.save();

    logger.info(`Joining bonus claimed for delivery: ${delivery._id}`, {
      deliveryId: delivery.deliveryId,
      bonusAmount,
      newBalance,
    });

    return successResponse(res, 200, 'Joining bonus claimed successfully', {
      bonusAmount,
      newBalance,
      wallet: {
        balance: newBalance,
        totalEarned: delivery.earnings?.totalEarned,
        currentBalance: delivery.earnings?.currentBalance,
      }
    });
  } catch (error) {
    logger.error('Error claiming joining bonus:', error);
    return errorResponse(res, 500, 'Failed to claim joining bonus');
  }
});

/**
 * Get Order Statistics
 * Returns detailed order statistics
 */
export const getOrderStats = asyncHandler(async (req, res) => {
  try {
    const delivery = req.delivery;
    const { period = 'all' } = req.query; // 'today', 'week', 'month', 'all'

    // Calculate date range based on period
    let startDate = null;
    const now = new Date();

    switch (period) {
      case 'today':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      default:
        startDate = null; // All time
    }

    // Build query
    const query = { deliveryPartnerId: delivery._id };
    if (startDate) {
      query.createdAt = { $gte: startDate };
    }

    // Get order counts
    const totalOrders = await Order.countDocuments(query);
    const completedOrders = await Order.countDocuments({ ...query, status: 'delivered' });
    const pendingOrders = await Order.countDocuments({ 
      ...query, 
      status: { $in: ['out_for_delivery', 'ready'] } 
    });
    const cancelledOrders = await Order.countDocuments({ ...query, status: 'cancelled' });

    // Calculate earnings
    let orders = [];
    try {
      orders = await Order.find({
        ...query,
        status: 'delivered'
      }).select('pricing.deliveryFee deliveredAt');
    } catch (error) {
      logger.warn(`Error fetching orders for stats:`, error);
    }

    const totalEarnings = orders.reduce((sum, order) => {
      return sum + (order.pricing?.deliveryFee || 0);
    }, 0);

    const stats = {
      period,
      totalOrders,
      completedOrders,
      pendingOrders,
      cancelledOrders,
      totalEarnings,
      averageEarningsPerOrder: completedOrders > 0 ? totalEarnings / completedOrders : 0,
      completionRate: totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0,
    };

    return successResponse(res, 200, 'Order statistics retrieved successfully', stats);
  } catch (error) {
    logger.error('Error fetching order statistics:', error);
    return errorResponse(res, 500, 'Failed to fetch order statistics');
  }
});

