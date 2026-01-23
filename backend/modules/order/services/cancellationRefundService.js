import Order from '../models/Order.js';
import OrderSettlement from '../models/OrderSettlement.js';
import UserWallet from '../../user/models/UserWallet.js';
import RestaurantWallet from '../../restaurant/models/RestaurantWallet.js';
import AdminWallet from '../../admin/models/AdminWallet.js';
import AuditLog from '../../admin/models/AuditLog.js';

/**
 * Determine cancellation stage based on order status
 */
const getCancellationStage = (order) => {
  if (!order.tracking.confirmed.status) {
    return 'pre_accept';
  }
  if (!order.tracking.preparing.status) {
    return 'post_accept_pre_cook';
  }
  if (!order.tracking.ready.status) {
    return 'post_cook';
  }
  return 'post_pickup';
};

/**
 * Process cancellation refund based on cancellation stage
 */
export const processCancellationRefund = async (orderId, cancellationReason) => {
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status !== 'cancelled') {
      throw new Error('Order is not cancelled');
    }

    const settlement = await OrderSettlement.findOne({ orderId });
    if (!settlement) {
      throw new Error('Settlement not found');
    }

    const cancellationStage = getCancellationStage(order);
    const userPayment = settlement.userPayment;

    let refundAmount = 0;
    let restaurantCompensation = 0;

    // Calculate refund based on cancellation stage
    switch (cancellationStage) {
      case 'pre_accept':
        // Full refund to user
        refundAmount = userPayment.total;
        restaurantCompensation = 0;
        break;

      case 'post_accept_pre_cook':
        // Partial refund (refund everything except platform fee and GST on platform fee)
        // User gets: subtotal + delivery fee (if not used)
        refundAmount = userPayment.subtotal - userPayment.discount + userPayment.deliveryFee;
        restaurantCompensation = 0;
        break;

      case 'post_cook':
        // Restaurant compensated, partial refund to user
        // Restaurant gets: food cost - commission
        restaurantCompensation = settlement.restaurantEarning.netEarning;
        // User gets: delivery fee + platform fee back (or partial)
        refundAmount = userPayment.deliveryFee + (userPayment.platformFee * 0.5); // 50% platform fee refund
        break;

      case 'post_pickup':
        // No refund to user, restaurant compensated
        refundAmount = 0;
        restaurantCompensation = settlement.restaurantEarning.netEarning;
        break;

      default:
        refundAmount = 0;
        restaurantCompensation = 0;
    }

    // Update settlement with cancellation details
    settlement.cancellationDetails = {
      cancelled: true,
      cancelledAt: new Date(),
      cancellationStage: cancellationStage,
      refundAmount: refundAmount,
      restaurantCompensation: restaurantCompensation,
      refundStatus: 'pending'
    };

    settlement.escrowStatus = 'refunded';
    settlement.settlementStatus = 'cancelled';
    settlement.restaurantEarning.status = 'cancelled';
    settlement.deliveryPartnerEarning.status = 'cancelled';
    settlement.adminEarning.status = 'cancelled';

    await settlement.save();

    // Process refund to user
    if (refundAmount > 0) {
      await refundToUser(order.userId, orderId, refundAmount, settlement.orderNumber, cancellationReason);
      settlement.cancellationDetails.refundStatus = 'processed';
    }

    // Compensate restaurant if applicable
    if (restaurantCompensation > 0) {
      await compensateRestaurant(
        settlement.restaurantId,
        orderId,
        restaurantCompensation,
        settlement.orderNumber
      );
    }

    // Reverse admin earnings (if needed)
    // For pre_accept and post_accept_pre_cook, reverse admin earnings
    if (cancellationStage === 'pre_accept' || cancellationStage === 'post_accept_pre_cook') {
      await reverseAdminEarnings(orderId, settlement.adminEarning, settlement.orderNumber);
    }

    await settlement.save();

    // Create audit log
    await AuditLog.createLog({
      entityType: 'order',
      entityId: orderId,
      action: 'cancellation_refund',
      actionType: 'refund',
      performedBy: {
        type: 'system',
        name: 'System'
      },
      transactionDetails: {
        amount: refundAmount,
        type: 'refund',
        status: 'success',
        orderId: orderId
      },
      description: `Cancellation refund processed for order ${settlement.orderNumber}. Stage: ${cancellationStage}, Refund: ₹${refundAmount}, Restaurant Compensation: ₹${restaurantCompensation}`
    });

    return {
      cancellationStage,
      refundAmount,
      restaurantCompensation,
      settlement
    };
  } catch (error) {
    console.error('Error processing cancellation refund:', error);
    throw new Error(`Failed to process cancellation refund: ${error.message}`);
  }
};

/**
 * Refund amount to user wallet
 */
const refundToUser = async (userId, orderId, amount, orderNumber, reason) => {
  try {
    const wallet = await UserWallet.findOrCreateByUserId(userId);
    
    wallet.addTransaction({
      amount: amount,
      type: 'refund',
      status: 'Completed',
      description: `Refund for cancelled order ${orderNumber}. Reason: ${reason}`,
      orderId: orderId
    });
    
    await wallet.save();

    // Create audit log
    await AuditLog.createLog({
      entityType: 'user',
      entityId: userId,
      action: 'refund_credit',
      actionType: 'refund',
      performedBy: {
        type: 'system',
        name: 'System'
      },
      transactionDetails: {
        amount: amount,
        type: 'refund',
        status: 'success',
        orderId: orderId,
        walletType: 'user'
      },
      description: `User refunded for cancelled order ${orderNumber}`
    });
  } catch (error) {
    console.error('Error refunding to user:', error);
    throw error;
  }
};

/**
 * Compensate restaurant for cancelled order
 */
const compensateRestaurant = async (restaurantId, orderId, amount, orderNumber) => {
  try {
    const wallet = await RestaurantWallet.findOrCreateByRestaurantId(restaurantId);
    
    wallet.addTransaction({
      amount: amount,
      type: 'payment',
      status: 'Completed',
      description: `Compensation for cancelled order ${orderNumber}`,
      orderId: orderId
    });
    
    await wallet.save();

    // Create audit log
    await AuditLog.createLog({
      entityType: 'restaurant',
      entityId: restaurantId,
      action: 'cancellation_compensation',
      actionType: 'credit',
      performedBy: {
        type: 'system',
        name: 'System'
      },
      transactionDetails: {
        amount: amount,
        type: 'compensation',
        status: 'success',
        orderId: orderId,
        walletType: 'restaurant'
      },
      description: `Restaurant compensated for cancelled order ${orderNumber}`
    });
  } catch (error) {
    console.error('Error compensating restaurant:', error);
    throw error;
  }
};

/**
 * Reverse admin earnings for cancelled orders
 */
const reverseAdminEarnings = async (orderId, adminEarning, orderNumber) => {
  try {
    const wallet = await AdminWallet.findOrCreate();

    // Reverse commission
    if (adminEarning.commission > 0) {
      wallet.addTransaction({
        amount: -adminEarning.commission,
        type: 'deduction',
        status: 'Completed',
        description: `Commission reversal for cancelled order ${orderNumber}`,
        orderId: orderId
      });
    }

    // Reverse platform fee
    if (adminEarning.platformFee > 0) {
      wallet.addTransaction({
        amount: -adminEarning.platformFee,
        type: 'deduction',
        status: 'Completed',
        description: `Platform fee reversal for cancelled order ${orderNumber}`,
        orderId: orderId
      });
    }

    // Reverse delivery fee
    if (adminEarning.deliveryFee > 0) {
      wallet.addTransaction({
        amount: -adminEarning.deliveryFee,
        type: 'deduction',
        status: 'Completed',
        description: `Delivery fee reversal for cancelled order ${orderNumber}`,
        orderId: orderId
      });
    }

    // Reverse GST
    if (adminEarning.gst > 0) {
      wallet.addTransaction({
        amount: -adminEarning.gst,
        type: 'deduction',
        status: 'Completed',
        description: `GST reversal for cancelled order ${orderNumber}`,
        orderId: orderId
      });
    }

    await wallet.save();

    // Create audit log
    await AuditLog.createLog({
      entityType: 'order',
      entityId: orderId,
      action: 'admin_earning_reversal',
      actionType: 'deduction',
      performedBy: {
        type: 'system',
        name: 'System'
      },
      transactionDetails: {
        amount: adminEarning.totalEarning,
        type: 'reversal',
        status: 'success',
        orderId: orderId,
        walletType: 'admin'
      },
      description: `Admin earnings reversed for cancelled order ${orderNumber}`
    });
  } catch (error) {
    console.error('Error reversing admin earnings:', error);
    throw error;
  }
};

