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
    // Try multiple restaurantId formats to handle different storage formats
    const restaurantIdVariations = [restaurantIdString];
    
    // Also add ObjectId string format if valid (both directions)
    if (mongoose.Types.ObjectId.isValid(restaurantIdString)) {
      const objectIdString = new mongoose.Types.ObjectId(restaurantIdString).toString();
      if (!restaurantIdVariations.includes(objectIdString)) {
        restaurantIdVariations.push(objectIdString);
      }
      
      // Also try the original ObjectId if restaurantIdString is already a string
      try {
        const objectId = new mongoose.Types.ObjectId(restaurantIdString);
        const objectIdStr = objectId.toString();
        if (!restaurantIdVariations.includes(objectIdStr)) {
          restaurantIdVariations.push(objectIdStr);
        }
      } catch (e) {
        // Ignore if not a valid ObjectId
      }
    }
    
    // Also try direct match without ObjectId conversion
    restaurantIdVariations.push(restaurantIdString);

    // Build query - search for orders with any matching restaurantId variation
    // Use $in for multiple variations and also try direct match as fallback
    const query = {
      $or: [
        { restaurantId: { $in: restaurantIdVariations } },
        // Direct match fallback
        { restaurantId: restaurantIdString }
      ]
    };

    // If status filter is provided, add it to query
    if (status && status !== 'all') {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    console.log('🔍 Fetching orders for restaurant:', {
      restaurantId: restaurantIdString,
      restaurant_id: restaurant._id?.toString(),
      restaurant_restaurantId: restaurant.restaurantId,
      restaurantIdVariations: restaurantIdVariations,
      query: JSON.stringify(query),
      status: status || 'all'
    });

    const orders = await Order.find(query)
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    const total = await Order.countDocuments(query);

    // Log detailed order info for debugging
    console.log('✅ Found orders:', {
      count: orders.length,
      total,
      restaurantId: restaurantIdString,
      queryUsed: JSON.stringify(query),
      orders: orders.map(o => ({ 
        orderId: o.orderId, 
        status: o.status, 
        restaurantId: o.restaurantId,
        restaurantIdType: typeof o.restaurantId,
        createdAt: o.createdAt
      }))
    });
    
    // If no orders found, log a warning with more details
    if (orders.length === 0 && total === 0) {
      console.warn('⚠️ No orders found for restaurant:', {
        restaurantId: restaurantIdString,
        restaurant_id: restaurant._id?.toString(),
        variationsTried: restaurantIdVariations,
        query: JSON.stringify(query)
      });
      
      // Try to find ANY orders in database for debugging
      const allOrdersCount = await Order.countDocuments({});
      console.log(`📊 Total orders in database: ${allOrdersCount}`);
      
      // Check if orders exist with similar restaurantId
      const sampleOrders = await Order.find({}).limit(5).select('orderId restaurantId status').lean();
      if (sampleOrders.length > 0) {
        console.log('📊 Sample orders in database (first 5):', sampleOrders.map(o => ({
          orderId: o.orderId,
          restaurantId: o.restaurantId,
          restaurantIdType: typeof o.restaurantId,
          status: o.status
        })));
      }
    }

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
          console.error(`❌ Restaurant not found for restaurantId: ${restaurantId}`);
        } else if (!restaurantDoc.location || !restaurantDoc.location.coordinates ||
          restaurantDoc.location.coordinates.length < 2 ||
          (restaurantDoc.location.coordinates[0] === 0 && restaurantDoc.location.coordinates[1] === 0)) {
          console.error(`❌ Restaurant location not found or invalid for restaurant ${restaurantId}`);
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
            // Assign to nearest delivery boy (with zone-based filtering)
            const assignmentResult = await assignOrderToDeliveryBoy(freshOrder, restaurantLat, restaurantLng, restaurantId);

            if (assignmentResult && assignmentResult.deliveryPartnerId) {
              // Reload order with populated userId after assignment
              const populatedOrder = await Order.findById(freshOrder._id)
                .populate('userId', 'name phone')
                .lean();

              if (!populatedOrder) {
                console.error(`❌ Could not reload order ${order.orderId} after assignment`);
              } else {
                // Notify delivery boy about the new order
                try {
                  await notifyDeliveryBoyNewOrder(populatedOrder, assignmentResult.deliveryPartnerId);
                  console.log(`✅ Order ${order.orderId} assigned to delivery boy ${assignmentResult.deliveryPartnerId} and notification sent`);
                } catch (notifyError) {
                  console.error(`❌ Error notifying delivery boy:`, notifyError);
                  console.warn(`⚠️ Order assigned but notification failed. Delivery boy may need to refresh.`);
                }
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

    // Allow marking as preparing if status is 'confirmed', 'pending', or already 'preparing' (for retry scenarios)
    // If already preparing, we allow it to retry delivery assignment if no delivery partner is assigned
    const allowedStatuses = ['confirmed', 'pending', 'preparing'];
    if (!allowedStatuses.includes(order.status)) {
      return errorResponse(res, 400, `Order cannot be marked as preparing. Current status: ${order.status}`);
    }

    // Only update status if it's not already preparing
    // If already preparing, we're just retrying delivery assignment
    const wasAlreadyPreparing = order.status === 'preparing';
    if (!wasAlreadyPreparing) {
      order.status = 'preparing';
      order.tracking.preparing = { status: true, timestamp: new Date() };
      await order.save();
    }

    // Notify about status update only if status actually changed
    if (!wasAlreadyPreparing) {
      try {
        await notifyRestaurantOrderUpdate(order._id.toString(), 'preparing');
      } catch (notifError) {
        console.error('Error sending notification:', notifError);
      }
    }

    // Assign order to nearest delivery boy and notify them (if not already assigned)
    // This is critical - even if order is already preparing, we need to assign delivery partner
    // Reload order first to get the latest state (in case it was updated elsewhere)
    const freshOrder = await Order.findById(order._id);
    if (!freshOrder) {
      console.error(`❌ Order ${order.orderId} not found after save`);
      return errorResponse(res, 404, 'Order not found after update');
    }

    // Check if delivery partner is already assigned (after reload)
    if (!freshOrder.deliveryPartnerId) {
      try {
        console.log(`🔄 Attempting to assign order ${freshOrder.orderId} to delivery boy (status: ${freshOrder.status})...`);

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
          console.error(`❌ Restaurant not found for restaurantId: ${restaurantId}`);
          return errorResponse(res, 500, 'Restaurant location not found. Cannot assign delivery partner.');
        }

        if (!restaurantDoc.location || !restaurantDoc.location.coordinates ||
          restaurantDoc.location.coordinates.length < 2 ||
          (restaurantDoc.location.coordinates[0] === 0 && restaurantDoc.location.coordinates[1] === 0)) {
          console.error(`❌ Restaurant location not found or invalid for restaurant ${restaurantId}`);
          return errorResponse(res, 500, 'Restaurant location is invalid. Please update restaurant location.');
        }

        const [restaurantLng, restaurantLat] = restaurantDoc.location.coordinates;
        console.log(`📍 Restaurant location: ${restaurantLat}, ${restaurantLng}`);

        // Check if order already has delivery partner assigned
        const orderCheck = await Order.findById(freshOrder._id).select('deliveryPartnerId');
        const isResendRequest = req.query.resend === 'true' || req.body.resend === true;

        // If order already has delivery partner and it's a resend request, resend notification to existing partner
        if (orderCheck && orderCheck.deliveryPartnerId && isResendRequest) {
          console.log(`🔄 Resend request detected - resending notification to existing delivery partner ${orderCheck.deliveryPartnerId}`);

          // Reload order with populated userId
          const populatedOrder = await Order.findById(freshOrder._id)
            .populate('userId', 'name phone')
            .lean();

          if (!populatedOrder) {
            console.error(`❌ Could not reload order ${freshOrder.orderId} for resend`);
            return errorResponse(res, 500, 'Could not reload order for resend');
          }

          // Resend notification to existing delivery partner
          try {
            await notifyDeliveryBoyNewOrder(populatedOrder, orderCheck.deliveryPartnerId);
            console.log(`✅ Resent notification to delivery partner ${orderCheck.deliveryPartnerId} for order ${freshOrder.orderId}`);

            const finalOrder = await Order.findById(freshOrder._id);
            return successResponse(res, 200, 'Notification resent to delivery partner', {
              order: finalOrder,
              resend: true,
              deliveryPartnerId: orderCheck.deliveryPartnerId
            });
          } catch (notifyError) {
            console.error(`❌ Error resending notification:`, notifyError);
            // Continue to try reassignment if notification fails
            console.log(`🔄 Notification failed, attempting to reassign to new delivery partner...`);
          }
        }

        // If order already has delivery partner and it's NOT a resend request, just return
        if (orderCheck && orderCheck.deliveryPartnerId && !isResendRequest) {
          console.log(`⚠️ Order ${freshOrder.orderId} was assigned delivery partner ${orderCheck.deliveryPartnerId} by another process`);
          // Reload full order for response
          const updatedOrder = await Order.findById(freshOrder._id);
          return successResponse(res, 200, 'Order marked as preparing', {
            order: updatedOrder
          });
        }

        // If resend request failed notification, or no partner assigned, try to assign/reassign
        // Clear existing assignment if resend request
        if (isResendRequest && orderCheck && orderCheck.deliveryPartnerId) {
          console.log(`🔄 Resend request - clearing existing delivery partner to allow reassignment`);
          freshOrder.deliveryPartnerId = null;
          freshOrder.assignmentInfo = undefined;
          await freshOrder.save();
          // Reload to get fresh state
          const reloadedOrder = await Order.findById(freshOrder._id);
          if (reloadedOrder) {
            freshOrder = reloadedOrder;
          }
        }

        // Assign to nearest delivery boy
        const assignmentResult = await assignOrderToDeliveryBoy(freshOrder, restaurantLat, restaurantLng, restaurantId);

        if (assignmentResult && assignmentResult.deliveryPartnerId) {
          // Reload order with populated userId after assignment
          const populatedOrder = await Order.findById(freshOrder._id)
            .populate('userId', 'name phone')
            .lean();

          if (!populatedOrder) {
            console.error(`❌ Could not reload order ${freshOrder.orderId} after assignment`);
            return errorResponse(res, 500, 'Order assignment succeeded but could not reload order');
          } else {
            // Notify delivery boy about the new order
            try {
              await notifyDeliveryBoyNewOrder(populatedOrder, assignmentResult.deliveryPartnerId);
              console.log(`✅ Order ${freshOrder.orderId} assigned to delivery boy ${assignmentResult.deliveryPartnerId} and notification sent`);
            } catch (notifyError) {
              console.error(`❌ Error notifying delivery boy:`, notifyError);
              console.error(`❌ Notification error details:`, {
                message: notifyError.message,
                stack: notifyError.stack
              });
              // Assignment succeeded but notification failed - still return success but log error
              console.warn(`⚠️ Order assigned but notification failed. Delivery boy may need to refresh.`);
            }

            // Reload full order for response
            const finalOrder = await Order.findById(freshOrder._id);
            return successResponse(res, 200, 'Order marked as preparing and assigned to delivery partner', {
              order: finalOrder,
              assignment: assignmentResult
            });
          }
        } else {
          console.warn(`⚠️ Could not assign order ${freshOrder.orderId} to delivery boy - no available delivery partners`);
          // Return success but warn about no delivery partners
          const finalOrder = await Order.findById(freshOrder._id);
          return successResponse(res, 200, 'Order marked as preparing, but no delivery partners available', {
            order: finalOrder,
            warning: 'No delivery partners available. Order will be assigned when a delivery partner comes online.'
          });
        }
      } catch (assignmentError) {
        console.error('❌ Error assigning order to delivery boy:', assignmentError);
        console.error('❌ Error stack:', assignmentError.stack);
        // Return error so restaurant knows assignment failed
        const finalOrder = await Order.findById(freshOrder._id);
        return errorResponse(res, 500, `Order marked as preparing, but delivery assignment failed: ${assignmentError.message}`, {
          order: finalOrder
        });
      }
    } else {
      console.log(`ℹ️ Order ${freshOrder.orderId} already has delivery partner assigned: ${freshOrder.deliveryPartnerId}`);
      // Reload full order for response
      const finalOrder = await Order.findById(freshOrder._id);
      return successResponse(res, 200, 'Order marked as preparing', {
        order: finalOrder
      });
    }
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

    // Update order status and tracking
    const now = new Date();
    order.status = 'ready';
    if (!order.tracking) {
      order.tracking = {};
    }
    order.tracking.ready = {
      status: true,
      timestamp: now
    };
    await order.save();

    // Populate order for notifications
    const populatedOrder = await Order.findById(order._id)
      .populate('restaurantId', 'name location address phone')
      .populate('userId', 'name phone')
      .populate('deliveryPartnerId', 'name phone')
      .lean();

    try {
      await notifyRestaurantOrderUpdate(order._id.toString(), 'ready');
    } catch (notifError) {
      console.error('Error sending restaurant notification:', notifError);
    }

    // Notify delivery boy that order is ready for pickup
    if (populatedOrder.deliveryPartnerId) {
      try {
        const { notifyDeliveryBoyOrderReady } = await import('../../order/services/deliveryNotificationService.js');
        const deliveryPartnerId = populatedOrder.deliveryPartnerId._id || populatedOrder.deliveryPartnerId;
        await notifyDeliveryBoyOrderReady(populatedOrder, deliveryPartnerId);
        console.log(`✅ Order ready notification sent to delivery partner ${deliveryPartnerId}`);
      } catch (deliveryNotifError) {
        console.error('Error sending delivery boy notification:', deliveryNotifError);
      }
    }

    return successResponse(res, 200, 'Order marked as ready', {
      order: populatedOrder || order
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return errorResponse(res, 500, 'Failed to update order status');
  }
});

