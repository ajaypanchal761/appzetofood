import { asyncHandler } from '../../../shared/middleware/asyncHandler.js';
import { successResponse, errorResponse } from '../../../shared/utils/response.js';
import Delivery from '../models/Delivery.js';
import Order from '../../order/models/Order.js';
import Restaurant from '../../restaurant/models/Restaurant.js';
import DeliveryWallet from '../models/DeliveryWallet.js';
import DeliveryBoyCommission from '../../admin/models/DeliveryBoyCommission.js';
import { calculateRoute } from '../../order/services/routeCalculationService.js';
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
 * Get Delivery Partner Orders
 * GET /api/delivery/orders
 * Query params: status, page, limit
 */
export const getOrders = asyncHandler(async (req, res) => {
  try {
    const delivery = req.delivery;
    const { status, page = 1, limit = 20 } = req.query;

    // Build query
    const query = { deliveryPartnerId: delivery._id };

    if (status) {
      query.status = status;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch orders
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('restaurantId', 'name slug profileImage')
      .populate('userId', 'name phone')
      .lean();

    // Get total count
    const total = await Order.countDocuments(query);

    return successResponse(res, 200, 'Orders retrieved successfully', {
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error(`Error fetching delivery orders: ${error.message}`);
    return errorResponse(res, 500, 'Failed to fetch orders');
  }
});

/**
 * Get Single Order Details
 * GET /api/delivery/orders/:orderId
 */
export const getOrderDetails = asyncHandler(async (req, res) => {
  try {
    const delivery = req.delivery;
    const { orderId } = req.params;

    const order = await Order.findOne({
      _id: orderId,
      deliveryPartnerId: delivery._id
    })
      .populate('restaurantId', 'name slug profileImage address phone')
      .populate('userId', 'name phone email')
      .lean();

    if (!order) {
      return errorResponse(res, 404, 'Order not found');
    }

    return successResponse(res, 200, 'Order details retrieved successfully', {
      order
    });
  } catch (error) {
    logger.error(`Error fetching order details: ${error.message}`);
    return errorResponse(res, 500, 'Failed to fetch order details');
  }
});

/**
 * Accept Order (Delivery Boy accepts the assigned order)
 * PATCH /api/delivery/orders/:orderId/accept
 */
export const acceptOrder = asyncHandler(async (req, res) => {
  try {
    const delivery = req.delivery;
    const { orderId } = req.params;
    const { currentLat, currentLng } = req.body; // Delivery boy's current location

    console.log(`📦 Delivery partner ${delivery._id} attempting to accept order ${orderId}`);
    console.log(`📍 Location provided: lat=${currentLat}, lng=${currentLng}`);

    // Find order - try both by _id and orderId
    // First check if order exists (without deliveryPartnerId filter)
    let order = await Order.findOne({
      $or: [
        { _id: orderId },
        { orderId: orderId }
      ]
    })
      .populate('restaurantId', 'name location address phone')
      .populate('userId', 'name phone')
      .lean();

    if (!order) {
      console.error(`❌ Order ${orderId} not found in database`);
      return errorResponse(res, 404, 'Order not found');
    }

    // Check if order is assigned to this delivery partner
    const orderDeliveryPartnerId = order.deliveryPartnerId?.toString();
    const currentDeliveryId = delivery._id.toString();

    if (!orderDeliveryPartnerId) {
      console.error(`❌ Order ${order.orderId} is not assigned to any delivery partner`);
      return errorResponse(res, 400, 'Order is not assigned to any delivery partner yet. Please wait for assignment.');
    }

    if (orderDeliveryPartnerId !== currentDeliveryId) {
      console.error(`❌ Order ${order.orderId} is assigned to ${orderDeliveryPartnerId}, but current delivery partner is ${currentDeliveryId}`);
      return errorResponse(res, 403, 'Order is assigned to another delivery partner');
    }

    console.log(`✅ Order ${order.orderId} is assigned to current delivery partner`);

    console.log(`✅ Order found: ${order.orderId}, Status: ${order.status}, Delivery Partner: ${order.deliveryPartnerId}`);

    // Check if order is in valid state to accept
    const validStatuses = ['preparing', 'ready'];
    if (!validStatuses.includes(order.status)) {
      console.warn(`⚠️ Order ${order.orderId} cannot be accepted. Current status: ${order.status}, Valid statuses: ${validStatuses.join(', ')}`);
      return errorResponse(res, 400, `Order cannot be accepted. Current status: ${order.status}. Order must be in 'preparing' or 'ready' status.`);
    }

    // Get restaurant location
    let restaurantLat, restaurantLng;
    if (order.restaurantId && order.restaurantId.location && order.restaurantId.location.coordinates) {
      [restaurantLng, restaurantLat] = order.restaurantId.location.coordinates;
    } else {
      // Try to fetch restaurant from database
      const restaurant = await Restaurant.findById(order.restaurantId?._id || order.restaurantId);
      if (restaurant && restaurant.location && restaurant.location.coordinates) {
        [restaurantLng, restaurantLat] = restaurant.location.coordinates;
      } else {
        return errorResponse(res, 400, 'Restaurant location not found');
      }
    }

    // Get delivery boy's current location
    let deliveryLat = currentLat;
    let deliveryLng = currentLng;

    if (!deliveryLat || !deliveryLng) {
      // Try to get from delivery partner's current location
      const deliveryPartner = await Delivery.findById(delivery._id)
        .select('availability.currentLocation')
        .lean();
      
      if (deliveryPartner?.availability?.currentLocation?.coordinates) {
        [deliveryLng, deliveryLat] = deliveryPartner.availability.currentLocation.coordinates;
      } else {
        return errorResponse(res, 400, 'Delivery partner location not found. Please enable location services.');
      }
    }

    // Calculate route from delivery boy to restaurant
    const routeData = await calculateRoute(deliveryLat, deliveryLng, restaurantLat, restaurantLng);

    // Update order status and tracking
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        $set: {
          'deliveryState.status': 'accepted',
          'deliveryState.acceptedAt': new Date(),
          'deliveryState.currentPhase': 'en_route_to_pickup',
          'deliveryState.routeToPickup': {
            coordinates: routeData.coordinates,
            distance: routeData.distance,
            duration: routeData.duration,
            calculatedAt: new Date()
          }
        }
      },
      { new: true }
    )
      .populate('restaurantId', 'name location address phone')
      .populate('userId', 'name phone')
      .lean();

    console.log(`✅ Order ${order.orderId} accepted by delivery partner ${delivery._id}`);
    console.log(`📍 Route calculated: ${routeData.distance.toFixed(2)} km, ${routeData.duration.toFixed(1)} mins`);

    return successResponse(res, 200, 'Order accepted successfully', {
      order: updatedOrder,
      route: {
        coordinates: routeData.coordinates,
        distance: routeData.distance,
        duration: routeData.duration,
        method: routeData.method
      }
    });
  } catch (error) {
    logger.error(`Error accepting order: ${error.message}`);
    console.error('Error stack:', error.stack);
    return errorResponse(res, 500, 'Failed to accept order');
  }
});

/**
 * Confirm Reached Pickup
 * PATCH /api/delivery/orders/:orderId/reached-pickup
 */
export const confirmReachedPickup = asyncHandler(async (req, res) => {
  try {
    const delivery = req.delivery;
    const { orderId } = req.params;

    const order = await Order.findOne({
      _id: orderId,
      deliveryPartnerId: delivery._id
    });

    if (!order) {
      return errorResponse(res, 404, 'Order not found or not assigned to you');
    }

    // Check if order is in valid state
    if (order.deliveryState?.currentPhase !== 'en_route_to_pickup' && 
        order.deliveryState?.status !== 'accepted') {
      return errorResponse(res, 400, `Order is not in valid state for reached pickup. Current phase: ${order.deliveryState?.currentPhase}`);
    }

    // Update order state
    order.deliveryState.status = 'reached_pickup';
    order.deliveryState.currentPhase = 'at_pickup';
    order.deliveryState.reachedPickupAt = new Date();
    await order.save();

    console.log(`✅ Delivery partner ${delivery._id} reached pickup for order ${order.orderId}`);

    // After 10 seconds, trigger order ID confirmation request
    setTimeout(async () => {
      try {
        const freshOrder = await Order.findById(orderId);
        if (freshOrder && freshOrder.deliveryState?.currentPhase === 'at_pickup') {
          // Emit socket event to request order ID confirmation
          let getIO;
          try {
            const serverModule = await import('../../../server.js');
            getIO = serverModule.getIO;
          } catch (importError) {
            console.error('Error importing server module:', importError);
            return;
          }
          
          if (getIO) {
            const io = getIO();
            if (io) {
              const deliveryNamespace = io.of('/delivery');
              const deliveryId = delivery._id.toString();
              deliveryNamespace.to(`delivery:${deliveryId}`).emit('request_order_id_confirmation', {
                orderId: freshOrder.orderId,
                orderMongoId: freshOrder._id.toString()
              });
              console.log(`📢 Requested order ID confirmation for order ${freshOrder.orderId} to delivery ${deliveryId}`);
            }
          }
        }
      } catch (error) {
        console.error('Error sending order ID confirmation request:', error);
      }
    }, 10000); // 10 seconds delay

    return successResponse(res, 200, 'Reached pickup confirmed', {
      order,
      message: 'Order ID confirmation will be requested in 10 seconds'
    });
  } catch (error) {
    logger.error(`Error confirming reached pickup: ${error.message}`);
    return errorResponse(res, 500, 'Failed to confirm reached pickup');
  }
});

/**
 * Confirm Order ID
 * PATCH /api/delivery/orders/:orderId/confirm-order-id
 */
export const confirmOrderId = asyncHandler(async (req, res) => {
  try {
    const delivery = req.delivery;
    const { orderId } = req.params;
    const { confirmedOrderId } = req.body; // Order ID confirmed by delivery boy
    const { currentLat, currentLng } = req.body; // Current location for route calculation

    const order = await Order.findOne({
      _id: orderId,
      deliveryPartnerId: delivery._id
    })
      .populate('userId', 'name phone')
      .lean();

    if (!order) {
      return errorResponse(res, 404, 'Order not found or not assigned to you');
    }

    // Verify order ID matches
    if (confirmedOrderId && confirmedOrderId !== order.orderId) {
      return errorResponse(res, 400, 'Order ID does not match');
    }

    // Check if order is in valid state
    if (order.deliveryState?.currentPhase !== 'at_pickup') {
      return errorResponse(res, 400, `Order is not at pickup. Current phase: ${order.deliveryState?.currentPhase}`);
    }

    // Get customer location
    if (!order.address?.location?.coordinates || order.address.location.coordinates.length < 2) {
      return errorResponse(res, 400, 'Customer location not found');
    }

    const [customerLng, customerLat] = order.address.location.coordinates;

    // Get delivery boy's current location (should be at restaurant)
    let deliveryLat = currentLat;
    let deliveryLng = currentLng;

    if (!deliveryLat || !deliveryLng) {
      // Try to get from delivery partner's current location
      const deliveryPartner = await Delivery.findById(delivery._id)
        .select('availability.currentLocation')
        .lean();
      
      if (deliveryPartner?.availability?.currentLocation?.coordinates) {
        [deliveryLng, deliveryLat] = deliveryPartner.availability.currentLocation.coordinates;
      } else {
        // Use restaurant location as fallback
        const restaurant = await Restaurant.findById(order.restaurantId)
          .select('location')
          .lean();
        if (restaurant?.location?.coordinates) {
          [deliveryLng, deliveryLat] = restaurant.location.coordinates;
        } else {
          return errorResponse(res, 400, 'Location not found for route calculation');
        }
      }
    }

    // Calculate route from restaurant to customer using Dijkstra algorithm
    const routeData = await calculateRoute(deliveryLat, deliveryLng, customerLat, customerLng, {
      useDijkstra: true
    });

    // Update order state
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        $set: {
          'deliveryState.status': 'order_confirmed',
          'deliveryState.currentPhase': 'en_route_to_delivery',
          'deliveryState.orderIdConfirmedAt': new Date(),
          'deliveryState.routeToDelivery': {
            coordinates: routeData.coordinates,
            distance: routeData.distance,
            duration: routeData.duration,
            calculatedAt: new Date(),
            method: routeData.method
          },
          status: 'out_for_delivery',
          'tracking.outForDelivery': {
            status: true,
            timestamp: new Date()
          }
        }
      },
      { new: true }
    )
      .populate('userId', 'name phone')
      .populate('restaurantId', 'name location address')
      .lean();

    console.log(`✅ Order ID confirmed for order ${order.orderId}`);
    console.log(`📍 Route to delivery calculated: ${routeData.distance.toFixed(2)} km, ${routeData.duration.toFixed(1)} mins`);

    // Send response first, then handle socket notification asynchronously
    const responseData = {
      order: updatedOrder,
      route: {
        coordinates: routeData.coordinates,
        distance: routeData.distance,
        duration: routeData.duration,
        method: routeData.method
      }
    };

    const response = successResponse(res, 200, 'Order ID confirmed', responseData);

    // Emit socket event to customer asynchronously (don't block response)
    (async () => {
      try {
        // Get IO instance dynamically to avoid circular dependencies
        const serverModule = await import('../../../server.js');
        const getIO = serverModule.getIO;
        const io = getIO ? getIO() : null;

        if (io) {
          // Emit to customer tracking this order
          // Format matches server.js: order:${orderId}
          io.to(`order:${updatedOrder._id.toString()}`).emit('order_status_update', {
            title: "Order Update",
            message: "Your delivery partner is on the way! 🏍️",
            status: 'out_for_delivery',
            orderId: updatedOrder.orderId,
            deliveryStartedAt: new Date(),
            estimatedDeliveryTime: routeData.duration || null
          });

          console.log(`📢 Notified customer for order ${updatedOrder.orderId} - Delivery partner on the way`);
        } else {
          console.warn('⚠️ Socket.IO not initialized, skipping customer notification');
        }
      } catch (notifError) {
        console.error('Error sending customer notification:', notifError);
        // Don't fail the response if notification fails
      }
    })();

    return response;
  } catch (error) {
    logger.error(`Error confirming order ID: ${error.message}`);
    console.error('Error stack:', error.stack);
    return errorResponse(res, 500, 'Failed to confirm order ID');
  }
});

/**
 * Confirm Reached Drop (Delivery Boy reached customer location)
 * PATCH /api/delivery/orders/:orderId/reached-drop
 */
export const confirmReachedDrop = asyncHandler(async (req, res) => {
  try {
    const delivery = req.delivery;
    const { orderId } = req.params;

    const order = await Order.findOne({
      $or: [
        { _id: orderId },
        { orderId: orderId }
      ],
      deliveryPartnerId: delivery._id
    });

    if (!order) {
      return errorResponse(res, 404, 'Order not found or not assigned to you');
    }

    // Initialize deliveryState if it doesn't exist
    if (!order.deliveryState) {
      order.deliveryState = {
        status: 'pending',
        currentPhase: 'assigned'
      };
    }

    // Check if order is in valid state
    // Allow reached drop if order is out_for_delivery OR if currentPhase is en_route_to_delivery OR status is order_confirmed
    const isValidState = order.status === 'out_for_delivery' || 
                         order.deliveryState?.currentPhase === 'en_route_to_delivery' ||
                         order.deliveryState?.status === 'order_confirmed' ||
                         order.deliveryState?.currentPhase === 'at_delivery'; // Allow if already at delivery (idempotent)

    if (!isValidState) {
      return errorResponse(res, 400, `Order is not in valid state for reached drop. Current status: ${order.status}, Phase: ${order.deliveryState?.currentPhase || 'unknown'}`);
    }

    // Update order state - only if not already at delivery (idempotent)
    let finalOrder = order;
    if (order.deliveryState.currentPhase !== 'at_delivery') {
      // Use findByIdAndUpdate to properly update nested fields
      const updatedOrder = await Order.findByIdAndUpdate(
        order._id,
        {
          $set: {
            'deliveryState.status': 'en_route_to_delivery',
            'deliveryState.currentPhase': 'at_delivery'
          }
        },
        { new: true, runValidators: true }
      )
      .populate('restaurantId', 'name location address phone')
      .populate('userId', 'name phone');

      if (!updatedOrder) {
        return errorResponse(res, 500, 'Failed to update order state');
      }

      // Convert to plain object for response
      finalOrder = updatedOrder.toObject ? updatedOrder.toObject() : updatedOrder;
    } else {
      // If already at delivery, populate the order for response
      const populatedOrder = await Order.findById(order._id)
        .populate('restaurantId', 'name location address phone')
        .populate('userId', 'name phone');
      
      finalOrder = populatedOrder?.toObject ? populatedOrder.toObject() : populatedOrder || order;
    }

    console.log(`✅ Delivery partner ${delivery._id} reached drop location for order ${finalOrder.orderId}`);

    return successResponse(res, 200, 'Reached drop confirmed', {
      order: finalOrder,
      message: 'Reached drop location confirmed'
    });
  } catch (error) {
    logger.error(`Error confirming reached drop: ${error.message}`);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      orderId: req.params?.orderId,
      deliveryId: req.delivery?._id
    });
    return errorResponse(res, 500, `Failed to confirm reached drop: ${error.message}`);
  }
});

/**
 * Confirm Delivery Complete
 * PATCH /api/delivery/orders/:orderId/complete-delivery
 */
export const completeDelivery = asyncHandler(async (req, res) => {
  try {
    const delivery = req.delivery;
    const { orderId } = req.params;
    const { rating, review } = req.body; // Optional rating and review from delivery boy

    if (!delivery) {
      return errorResponse(res, 401, 'Delivery partner not authenticated');
    }

    if (!orderId) {
      return errorResponse(res, 400, 'Order ID is required');
    }

    // Find order - try both by _id and orderId
    let order = await Order.findOne({
      $or: [
        { _id: orderId },
        { orderId: orderId }
      ],
      deliveryPartnerId: delivery._id
    })
      .populate('restaurantId', 'name location address phone')
      .populate('userId', 'name phone')
      .lean();

    if (!order) {
      return errorResponse(res, 404, 'Order not found or not assigned to you');
    }

    // Check if order is in valid state
    if (order.status !== 'out_for_delivery' && 
        order.deliveryState?.currentPhase !== 'at_delivery') {
      return errorResponse(res, 400, `Order cannot be completed. Current status: ${order.status}, Phase: ${order.deliveryState?.currentPhase}`);
    }

    // Update order to delivered
    const updatedOrder = await Order.findByIdAndUpdate(
      order._id,
      {
        $set: {
          status: 'delivered',
          'tracking.delivered': {
            status: true,
            timestamp: new Date()
          },
          deliveredAt: new Date(),
          'deliveryState.status': 'delivered',
          'deliveryState.currentPhase': 'completed'
        }
      },
      { new: true }
    )
      .populate('restaurantId', 'name location address phone')
      .populate('userId', 'name phone')
      .lean();

    console.log(`✅ Order ${order.orderId} marked as delivered by delivery partner ${delivery._id}`);

    // Calculate delivery earnings based on admin's commission rules
    // Get delivery distance (in km) from order
    let deliveryDistance = 0;
    
    // Priority 1: Get distance from routeToDelivery (most accurate)
    if (order.deliveryState?.routeToDelivery?.distance) {
      deliveryDistance = order.deliveryState.routeToDelivery.distance;
    }
    // Priority 2: Get distance from assignmentInfo
    else if (order.assignmentInfo?.distance) {
      deliveryDistance = order.assignmentInfo.distance;
    }
    // Priority 3: Calculate distance from restaurant to customer if coordinates available
    else if (order.restaurantId?.location?.coordinates && order.address?.location?.coordinates) {
      const [restaurantLng, restaurantLat] = order.restaurantId.location.coordinates;
      const [customerLng, customerLat] = order.address.location.coordinates;
      
      // Calculate distance using Haversine formula
      const R = 6371; // Earth radius in km
      const dLat = (customerLat - restaurantLat) * Math.PI / 180;
      const dLng = (customerLng - restaurantLng) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(restaurantLat * Math.PI / 180) * Math.cos(customerLat * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      deliveryDistance = R * c;
    }
    
    console.log(`📏 Delivery distance: ${deliveryDistance.toFixed(2)} km for order ${order.orderId}`);

    // Calculate earnings using admin's commission rules
    let totalEarning = 0;
    let commissionBreakdown = null;
    
    try {
      // Use DeliveryBoyCommission model to calculate commission based on distance
      const commissionResult = await DeliveryBoyCommission.calculateCommission(deliveryDistance);
      totalEarning = commissionResult.commission;
      commissionBreakdown = commissionResult.breakdown;
      
      console.log(`💰 Delivery earnings calculated using commission rules: ₹${totalEarning.toFixed(2)} for order ${order.orderId}`);
      console.log(`📊 Commission breakdown:`, {
        rule: commissionResult.rule.name,
        basePayout: commissionResult.breakdown.basePayout,
        distance: commissionResult.breakdown.distance,
        commissionPerKm: commissionResult.breakdown.commissionPerKm,
        distanceCommission: commissionResult.breakdown.distanceCommission,
        total: totalEarning
      });
    } catch (commissionError) {
      console.error('⚠️ Error calculating commission using rules:', commissionError.message);
      // Fallback: Use delivery fee as earnings if commission calculation fails
      totalEarning = order.pricing?.deliveryFee || 0;
      console.warn(`⚠️ Using fallback earnings (delivery fee): ₹${totalEarning.toFixed(2)}`);
    }

    // Add earning to delivery boy's wallet
    let walletTransaction = null;
    try {
      // Find or create wallet for delivery boy
      let wallet = await DeliveryWallet.findOrCreateByDeliveryId(delivery._id);
      
      // Check if transaction already exists for this order
      const existingTransaction = wallet.transactions.find(
        t => t.orderId && t.orderId.toString() === order._id.toString() && t.type === 'payment'
      );

      if (existingTransaction) {
        console.warn(`⚠️ Earning already added for order ${order.orderId}, skipping wallet update`);
      } else {
        // Add payment transaction to wallet
        walletTransaction = wallet.addTransaction({
          amount: totalEarning,
          type: 'payment',
          status: 'Completed',
          description: `Delivery earnings for Order #${order.orderId} (Distance: ${deliveryDistance.toFixed(2)} km)`,
          orderId: order._id,
          paymentCollected: order.payment?.method === 'cash' // If COD, payment was collected
        });

        await wallet.save();

        logger.info(`💰 Earning added to wallet for delivery: ${delivery._id}`, {
          deliveryId: delivery.deliveryId || delivery._id.toString(),
          orderId: order.orderId,
          amount: totalEarning,
          distance: deliveryDistance,
          transactionId: walletTransaction._id,
          walletBalance: wallet.totalBalance
        });

        console.log(`✅ Earning ₹${totalEarning.toFixed(2)} added to delivery boy's wallet`);
        console.log(`💰 New wallet balance: ₹${wallet.totalBalance.toFixed(2)}`);
      }
    } catch (walletError) {
      logger.error('❌ Error adding earning to wallet:', walletError);
      console.error('❌ Error processing delivery wallet:', walletError);
      // Don't fail the delivery completion if wallet update fails
      // But log it for investigation
    }

    // Send response first, then handle notifications asynchronously
    // This prevents timeouts if notifications take too long
    const responseData = {
      order: updatedOrder,
      earnings: {
        amount: totalEarning,
        currency: 'INR',
        distance: deliveryDistance,
        breakdown: commissionBreakdown || {
          basePayout: 0,
          distance: deliveryDistance,
          commissionPerKm: 0,
          distanceCommission: 0
        }
      },
      wallet: walletTransaction ? {
        transactionId: walletTransaction._id,
        balance: walletTransaction.amount
      } : null,
      message: 'Delivery completed successfully'
    };

    // Send response immediately
    const response = successResponse(res, 200, 'Delivery completed successfully', responseData);

    // Handle notifications asynchronously (don't block response)
    Promise.all([
      // Notify restaurant about delivery completion
      (async () => {
        try {
          const { notifyRestaurantOrderUpdate } = await import('../../order/services/restaurantNotificationService.js');
          await notifyRestaurantOrderUpdate(order._id.toString(), 'delivered');
        } catch (notifError) {
          console.error('Error sending restaurant notification:', notifError);
        }
      })(),
      // Notify user about delivery completion
      (async () => {
        try {
          const { notifyUserOrderUpdate } = await import('../../order/services/userNotificationService.js');
          if (notifyUserOrderUpdate) {
            await notifyUserOrderUpdate(order._id.toString(), 'delivered');
          }
        } catch (notifError) {
          console.error('Error sending user notification:', notifError);
        }
      })()
    ]).catch(error => {
      console.error('Error in notification promises:', error);
    });

    return response;
  } catch (error) {
    logger.error(`Error completing delivery: ${error.message}`);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      orderId: req.params?.orderId,
      deliveryId: req.delivery?._id
    });
    return errorResponse(res, 500, `Failed to complete delivery: ${error.message}`);
  }
});

