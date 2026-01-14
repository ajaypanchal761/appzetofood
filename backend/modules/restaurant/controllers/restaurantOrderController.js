import Order from '../../order/models/Order.js';
import Restaurant from '../models/Restaurant.js';
import { successResponse, errorResponse } from '../../../shared/utils/response.js';
import asyncHandler from '../../../shared/middleware/asyncHandler.js';
import { notifyRestaurantOrderUpdate } from '../../order/services/restaurantNotificationService.js';
import { assignOrderToDeliveryBoy } from '../../order/services/deliveryAssignmentService.js';
import { notifyDeliveryBoyNewOrder } from '../../order/services/deliveryNotificationService.js';
import mongoose from 'mongoose';

/**
 * Get all orders for restaurant
 * GET /api/restaurant/orders
 */
export const getRestaurantOrders = asyncHandler(async (req, res) => {
  try {
    const restaurant = req.restaurant;
    const { status, page = 1, limit = 50 } = req.query;

    // Get restaurant ID - normalize to string (Order.restaurantId is String type)
    const restaurantIdString = restaurant._id?.toString() || 
                               restaurant.restaurantId?.toString() || 
                               restaurant.id?.toString();

    if (!restaurantIdString) {
      console.error('❌ No restaurant ID found:', restaurant);
      return errorResponse(res, 500, 'Restaurant ID not found');
    }

    // Query orders by restaurantId (stored as String in Order model)
    const query = { 
      restaurantId: restaurantIdString 
    };

    // If status filter is provided, add it to query
    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    console.log('🔍 Fetching orders for restaurant:', {
      restaurantId: restaurantIdString,
      restaurant_id: restaurant._id?.toString(),
      query,
      status
    });

    const orders = await Order.find(query)
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    const total = await Order.countDocuments(query);

    console.log('✅ Found orders:', {
      count: orders.length,
      total,
      restaurantId: restaurantIdString,
      orders: orders.map(o => ({ orderId: o.orderId, status: o.status, restaurantId: o.restaurantId }))
    });

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
    console.error('Error fetching restaurant orders:', error);
    return errorResponse(res, 500, 'Failed to fetch orders');
  }
});

/**
 * Get order by ID
 * GET /api/restaurant/orders/:id
 */
export const getRestaurantOrderById = asyncHandler(async (req, res) => {
  try {
    const restaurant = req.restaurant;
    const { id } = req.params;

    const restaurantId = restaurant._id?.toString() || 
                        restaurant.restaurantId || 
                        restaurant.id;

    // Try to find order by MongoDB _id or orderId (custom order ID)
    let order = null;
    
    // First try MongoDB _id if it's a valid ObjectId
    if (mongoose.Types.ObjectId.isValid(id) && id.length === 24) {
      order = await Order.findOne({
        _id: id,
        restaurantId
      })
        .populate('userId', 'name email phone')
        .lean();
    }
    
    // If not found, try by orderId (custom order ID like "ORD-123456-789")
    if (!order) {
      order = await Order.findOne({
        orderId: id,
        restaurantId
      })
        .populate('userId', 'name email phone')
        .lean();
    }

    if (!order) {
      return errorResponse(res, 404, 'Order not found');
    }

    return successResponse(res, 200, 'Order retrieved successfully', {
      order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    return errorResponse(res, 500, 'Failed to fetch order');
  }
});

/**
 * Accept order
 * PATCH /api/restaurant/orders/:id/accept
 */
export const acceptOrder = asyncHandler(async (req, res) => {
  try {
    const restaurant = req.restaurant;
    const { id } = req.params;
    const { preparationTime } = req.body;

    const restaurantId = restaurant._id?.toString() || 
                        restaurant.restaurantId || 
                        restaurant.id;

    // Try to find order by MongoDB _id or orderId (custom order ID)
    let order = null;
    
    // First try MongoDB _id if it's a valid ObjectId
    if (mongoose.Types.ObjectId.isValid(id) && id.length === 24) {
      order = await Order.findOne({
        _id: id,
        restaurantId
      });
    }
    
    // If not found, try by orderId (custom order ID like "ORD-123456-789")
    if (!order) {
      order = await Order.findOne({
        orderId: id,
        restaurantId
      });
    }

    if (!order) {
      return errorResponse(res, 404, 'Order not found');
    }

    // Allow accepting orders with status 'pending' or 'confirmed'
    // 'confirmed' status means payment is verified, restaurant can still accept
    if (!['pending', 'confirmed'].includes(order.status)) {
      return errorResponse(res, 400, `Order cannot be accepted. Current status: ${order.status}`);
    }

    // When restaurant accepts order, it means they're starting to prepare it
    // So set status to 'preparing' and mark as confirmed if it was pending
    if (order.status === 'pending') {
      order.tracking.confirmed = { status: true, timestamp: new Date() };
    }
    
    // Set status to 'preparing' when restaurant accepts
    order.status = 'preparing';
    order.tracking.preparing = { status: true, timestamp: new Date() };
    
    if (preparationTime) {
      order.estimatedDeliveryTime = preparationTime;
    }
    
    await order.save();

    // Notify about status update
    try {
      await notifyRestaurantOrderUpdate(order._id.toString(), 'preparing');
    } catch (notifError) {
      console.error('Error sending notification:', notifError);
    }

    // Assign order to nearest delivery boy and notify them (if not already assigned)
    if (!order.deliveryPartnerId) {
      try {
        console.log(`🔄 Attempting to assign order ${order.orderId} to delivery boy...`);
        
        // Get restaurant location
        let restaurantDoc = null;
        if (mongoose.Types.ObjectId.isValid(restaurantId)) {
          restaurantDoc = await Restaurant.findById(restaurantId).lean();
        }
        if (!restaurantDoc) {
          restaurantDoc = await Restaurant.findOne({
            $or: [
              { restaurantId: restaurantId },
              { _id: restaurantId }
            ]
          }).lean();
        }

        if (!restaurantDoc) {
          console.warn(`⚠️ Restaurant not found for restaurantId: ${restaurantId}`);
        } else if (!restaurantDoc.location || !restaurantDoc.location.coordinates) {
          console.warn(`⚠️ Restaurant location not found for restaurant ${restaurantId}`);
        } else {
          const [restaurantLng, restaurantLat] = restaurantDoc.location.coordinates;
          console.log(`📍 Restaurant location: ${restaurantLat}, ${restaurantLng}`);
          
          // Reload order to ensure we have the latest version
          const freshOrder = await Order.findById(order._id);
          if (!freshOrder) {
            console.error(`❌ Order ${order.orderId} not found after save`);
          } else if (freshOrder.deliveryPartnerId) {
            console.log(`⚠️ Order ${order.orderId} already has delivery partner: ${freshOrder.deliveryPartnerId}`);
          } else {
            // Assign to nearest delivery boy
            const assignmentResult = await assignOrderToDeliveryBoy(freshOrder, restaurantLat, restaurantLng);
            
            if (assignmentResult && assignmentResult.deliveryPartnerId) {
              // Reload order with populated userId after assignment
              const populatedOrder = await Order.findById(freshOrder._id)
                .populate('userId', 'name phone')
                .lean();
              
              if (!populatedOrder) {
                console.error(`❌ Could not reload order ${order.orderId} after assignment`);
              } else {
                // Notify delivery boy about the new order
                await notifyDeliveryBoyNewOrder(populatedOrder, assignmentResult.deliveryPartnerId);
                console.log(`✅ Order ${order.orderId} assigned to delivery boy ${assignmentResult.deliveryPartnerId} and notification sent`);
              }
            } else {
              console.warn(`⚠️ Could not assign order ${order.orderId} to delivery boy - no available delivery partners`);
            }
          }
        }
      } catch (assignmentError) {
        console.error('❌ Error assigning order to delivery boy:', assignmentError);
        console.error('❌ Error stack:', assignmentError.stack);
        // Don't fail the order acceptance if assignment fails
      }
    } else {
      console.log(`ℹ️ Order ${order.orderId} already has delivery partner assigned: ${order.deliveryPartnerId}`);
    }

    return successResponse(res, 200, 'Order accepted successfully', {
      order
    });
  } catch (error) {
    console.error('Error accepting order:', error);
    return errorResponse(res, 500, 'Failed to accept order');
  }
});

/**
 * Reject order
 * PATCH /api/restaurant/orders/:id/reject
 */
export const rejectOrder = asyncHandler(async (req, res) => {
  try {
    const restaurant = req.restaurant;
    const { id } = req.params;
    const { reason } = req.body;

    const restaurantId = restaurant._id?.toString() || 
                        restaurant.restaurantId || 
                        restaurant.id;

    // Try to find order by MongoDB _id or orderId (custom order ID)
    let order = null;
    
    // First try MongoDB _id if it's a valid ObjectId
    if (mongoose.Types.ObjectId.isValid(id) && id.length === 24) {
      order = await Order.findOne({
        _id: id,
        restaurantId
      });
    }
    
    // If not found, try by orderId (custom order ID like "ORD-123456-789")
    if (!order) {
      order = await Order.findOne({
        orderId: id,
        restaurantId
      });
    }

    if (!order) {
      return errorResponse(res, 404, 'Order not found');
    }

    // Allow rejecting orders with status 'pending' or 'confirmed'
    if (!['pending', 'confirmed'].includes(order.status)) {
      return errorResponse(res, 400, `Order cannot be rejected. Current status: ${order.status}`);
    }

    order.status = 'cancelled';
    order.cancellationReason = reason || 'Rejected by restaurant';
    order.cancelledAt = new Date();
    await order.save();

    // Notify about status update
    try {
      await notifyRestaurantOrderUpdate(order._id.toString(), 'cancelled');
    } catch (notifError) {
      console.error('Error sending notification:', notifError);
    }

    return successResponse(res, 200, 'Order rejected successfully', {
      order
    });
  } catch (error) {
    console.error('Error rejecting order:', error);
    return errorResponse(res, 500, 'Failed to reject order');
  }
});

/**
 * Update order status to preparing
 * PATCH /api/restaurant/orders/:id/preparing
 */
export const markOrderPreparing = asyncHandler(async (req, res) => {
  try {
    const restaurant = req.restaurant;
    const { id } = req.params;

    const restaurantId = restaurant._id?.toString() || 
                        restaurant.restaurantId || 
                        restaurant.id;

    // Try to find order by MongoDB _id or orderId (custom order ID)
    let order = null;
    
    // First try MongoDB _id if it's a valid ObjectId
    if (mongoose.Types.ObjectId.isValid(id) && id.length === 24) {
      order = await Order.findOne({
        _id: id,
        restaurantId
      });
    }
    
    // If not found, try by orderId (custom order ID like "ORD-123456-789")
    if (!order) {
      order = await Order.findOne({
        orderId: id,
        restaurantId
      });
    }

    if (!order) {
      return errorResponse(res, 404, 'Order not found');
    }

    if (!['confirmed', 'pending'].includes(order.status)) {
      return errorResponse(res, 400, `Order cannot be marked as preparing. Current status: ${order.status}`);
    }

    order.status = 'preparing';
    order.tracking.preparing = { status: true, timestamp: new Date() };
    await order.save();

    try {
      await notifyRestaurantOrderUpdate(order._id.toString(), 'preparing');
    } catch (notifError) {
      console.error('Error sending notification:', notifError);
    }

    // Assign order to nearest delivery boy and notify them (if not already assigned)
    if (!order.deliveryPartnerId) {
      try {
        console.log(`🔄 Attempting to assign order ${order.orderId} to delivery boy...`);
        
        // Get restaurant location
        let restaurantDoc = null;
        if (mongoose.Types.ObjectId.isValid(restaurantId)) {
          restaurantDoc = await Restaurant.findById(restaurantId).lean();
        }
        if (!restaurantDoc) {
          restaurantDoc = await Restaurant.findOne({
            $or: [
              { restaurantId: restaurantId },
              { _id: restaurantId }
            ]
          }).lean();
        }

        if (!restaurantDoc) {
          console.warn(`⚠️ Restaurant not found for restaurantId: ${restaurantId}`);
        } else if (!restaurantDoc.location || !restaurantDoc.location.coordinates) {
          console.warn(`⚠️ Restaurant location not found for restaurant ${restaurantId}`);
        } else {
          const [restaurantLng, restaurantLat] = restaurantDoc.location.coordinates;
          console.log(`📍 Restaurant location: ${restaurantLat}, ${restaurantLng}`);
          
          // Reload order to ensure we have the latest version
          const freshOrder = await Order.findById(order._id);
          if (!freshOrder) {
            console.error(`❌ Order ${order.orderId} not found after save`);
          } else if (freshOrder.deliveryPartnerId) {
            console.log(`⚠️ Order ${order.orderId} already has delivery partner: ${freshOrder.deliveryPartnerId}`);
          } else {
            // Assign to nearest delivery boy
            const assignmentResult = await assignOrderToDeliveryBoy(freshOrder, restaurantLat, restaurantLng);
            
            if (assignmentResult && assignmentResult.deliveryPartnerId) {
              // Reload order with populated userId after assignment
              const populatedOrder = await Order.findById(freshOrder._id)
                .populate('userId', 'name phone')
                .lean();
              
              if (!populatedOrder) {
                console.error(`❌ Could not reload order ${order.orderId} after assignment`);
              } else {
                // Notify delivery boy about the new order
                await notifyDeliveryBoyNewOrder(populatedOrder, assignmentResult.deliveryPartnerId);
                console.log(`✅ Order ${order.orderId} assigned to delivery boy ${assignmentResult.deliveryPartnerId} and notification sent`);
              }
            } else {
              console.warn(`⚠️ Could not assign order ${order.orderId} to delivery boy - no available delivery partners`);
            }
          }
        }
      } catch (assignmentError) {
        console.error('❌ Error assigning order to delivery boy:', assignmentError);
        console.error('❌ Error stack:', assignmentError.stack);
        // Don't fail the order status update if assignment fails
      }
    } else {
      console.log(`ℹ️ Order ${order.orderId} already has delivery partner assigned: ${order.deliveryPartnerId}`);
    }

    return successResponse(res, 200, 'Order marked as preparing', {
      order
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return errorResponse(res, 500, 'Failed to update order status');
  }
});

/**
 * Update order status to ready
 * PATCH /api/restaurant/orders/:id/ready
 */
export const markOrderReady = asyncHandler(async (req, res) => {
  try {
    const restaurant = req.restaurant;
    const { id } = req.params;

    const restaurantId = restaurant._id?.toString() || 
                        restaurant.restaurantId || 
                        restaurant.id;

    // Try to find order by MongoDB _id or orderId (custom order ID)
    let order = null;
    
    // First try MongoDB _id if it's a valid ObjectId
    if (mongoose.Types.ObjectId.isValid(id) && id.length === 24) {
      order = await Order.findOne({
        _id: id,
        restaurantId
      });
    }
    
    // If not found, try by orderId (custom order ID like "ORD-123456-789")
    if (!order) {
      order = await Order.findOne({
        orderId: id,
        restaurantId
      });
    }

    if (!order) {
      return errorResponse(res, 404, 'Order not found');
    }

    if (order.status !== 'preparing') {
      return errorResponse(res, 400, `Order cannot be marked as ready. Current status: ${order.status}`);
    }

    order.status = 'ready';
    await order.save();

    try {
      await notifyRestaurantOrderUpdate(order._id.toString(), 'ready');
    } catch (notifError) {
      console.error('Error sending notification:', notifError);
    }

    return successResponse(res, 200, 'Order marked as ready', {
      order
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return errorResponse(res, 500, 'Failed to update order status');
  }
});

