import { asyncHandler } from '../../../shared/middleware/asyncHandler.js';
import { successResponse, errorResponse } from '../../../shared/utils/response.js';
import Delivery from '../models/Delivery.js';
import Order from '../../order/models/Order.js';
import Restaurant from '../../restaurant/models/Restaurant.js';
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

    return successResponse(res, 200, 'Order ID confirmed', {
      order: updatedOrder,
      route: {
        coordinates: routeData.coordinates,
        distance: routeData.distance,
        duration: routeData.duration,
        method: routeData.method
      }
    });
  } catch (error) {
    logger.error(`Error confirming order ID: ${error.message}`);
    console.error('Error stack:', error.stack);
    return errorResponse(res, 500, 'Failed to confirm order ID');
  }
});

