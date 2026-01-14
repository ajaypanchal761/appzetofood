import Order from '../models/Order.js';
import Restaurant from '../../restaurant/models/Restaurant.js';
import mongoose from 'mongoose';

// Dynamic import to avoid circular dependency
let getIO = null;

async function getIOInstance() {
  if (!getIO) {
    const serverModule = await import('../../../server.js');
    getIO = serverModule.getIO;
  }
  return getIO ? getIO() : null;
}

/**
 * Notify restaurant about new order via Socket.IO
 * @param {Object} order - Order document
 * @param {string} restaurantId - Restaurant ID
 */
export async function notifyRestaurantNewOrder(order, restaurantId) {
  try {
    const io = await getIOInstance();
    
    if (!io) {
      console.warn('Socket.IO not initialized, skipping restaurant notification');
      return;
    }

    // Get restaurant details
    let restaurant = null;
    if (mongoose.Types.ObjectId.isValid(restaurantId)) {
      restaurant = await Restaurant.findById(restaurantId).lean();
    }
    if (!restaurant) {
      restaurant = await Restaurant.findOne({
        $or: [
          { restaurantId: restaurantId },
          { _id: restaurantId }
        ]
      }).lean();
    }

    // Prepare order notification data
    const orderNotification = {
      orderId: order.orderId,
      orderMongoId: order._id.toString(),
      restaurantId: restaurantId,
      restaurantName: order.restaurantName,
      items: order.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      total: order.pricing.total,
      customerAddress: {
        label: order.address.label,
        street: order.address.street,
        city: order.address.city,
        location: order.address.location
      },
      status: order.status,
      createdAt: order.createdAt,
      estimatedDeliveryTime: order.estimatedDeliveryTime || 30,
      note: order.note || '',
      sendCutlery: order.sendCutlery
    };

    // Get restaurant namespace
    const restaurantNamespace = io.of('/restaurant');
    
    // Normalize restaurantId to string (handle both ObjectId and string)
    const normalizedRestaurantId = restaurantId?.toString() || restaurantId;
    
    // Try multiple room formats to ensure we find the restaurant
    const roomVariations = [
      `restaurant:${normalizedRestaurantId}`,
      `restaurant:${restaurantId}`,
      ...(mongoose.Types.ObjectId.isValid(normalizedRestaurantId) 
        ? [`restaurant:${new mongoose.Types.ObjectId(normalizedRestaurantId).toString()}`]
        : [])
    ];
    
    // Get all connected sockets in the restaurant room
    let socketsInRoom = [];
    for (const room of roomVariations) {
      const sockets = await restaurantNamespace.in(room).fetchSockets();
      if (sockets.length > 0) {
        socketsInRoom = sockets;
        console.log(`📢 Found ${sockets.length} socket(s) in room: ${room}`);
        break;
      }
    }
    
    const primaryRoom = roomVariations[0];
    
    console.log(`📢 Attempting to notify restaurant ${normalizedRestaurantId} about order ${order.orderId}`);
    console.log(`📢 Room variations:`, roomVariations);
    console.log(`📢 Connected sockets in primary room ${primaryRoom}:`, socketsInRoom.length);
    
    // Emit new order notification to all room variations
    roomVariations.forEach(room => {
      restaurantNamespace.to(room).emit('new_order', orderNotification);
      restaurantNamespace.to(room).emit('play_notification_sound', {
        type: 'new_order',
        orderId: order.orderId,
        message: `New order received: ${order.orderId}`
      });
    });

    // Also emit to all sockets in the restaurant namespace (fallback if no specific room found)
    if (socketsInRoom.length === 0) {
      console.warn(`⚠️ No sockets connected in any restaurant room, broadcasting to all restaurant sockets`);
      restaurantNamespace.emit('new_order', orderNotification);
      restaurantNamespace.emit('play_notification_sound', {
        type: 'new_order',
        orderId: order.orderId,
        message: `New order received: ${order.orderId}`
      });
    }

    console.log(`✅ Notified restaurant ${normalizedRestaurantId} about new order ${order.orderId}`);
    
    return {
      success: true,
      restaurantId,
      orderId: order.orderId
    };
  } catch (error) {
    console.error('Error notifying restaurant:', error);
    throw error;
  }
}

/**
 * Notify restaurant about order status update
 * @param {string} orderId - Order ID
 * @param {string} status - New status
 */
export async function notifyRestaurantOrderUpdate(orderId, status) {
  try {
    const io = await getIOInstance();
    
    if (!io) {
      return;
    }

    const order = await Order.findById(orderId).lean();
    if (!order) {
      throw new Error('Order not found');
    }

    // Get restaurant namespace
    const restaurantNamespace = io.of('/restaurant');
    
    restaurantNamespace.to(`restaurant:${order.restaurantId}`).emit('order_status_update', {
      orderId: order.orderId,
      status,
      updatedAt: new Date()
    });

    console.log(`📢 Notified restaurant ${order.restaurantId} about order ${order.orderId} status: ${status}`);
  } catch (error) {
    console.error('Error notifying restaurant about order update:', error);
    throw error;
  }
}

