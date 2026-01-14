import Order from '../models/Order.js';
import Delivery from '../../delivery/models/Delivery.js';
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
 * Notify delivery boy about new order assignment via Socket.IO
 * @param {Object} order - Order document
 * @param {string} deliveryPartnerId - Delivery partner ID
 */
export async function notifyDeliveryBoyNewOrder(order, deliveryPartnerId) {
  try {
    const io = await getIOInstance();
    
    if (!io) {
      console.warn('Socket.IO not initialized, skipping delivery boy notification');
      return;
    }

    // Populate userId if it's not already populated
    let orderWithUser = order;
    if (order.userId && typeof order.userId === 'object' && order.userId._id) {
      // Already populated
      orderWithUser = order;
    } else if (order.userId) {
      // Need to populate
      const OrderModel = await import('../models/Order.js');
      orderWithUser = await OrderModel.default.findById(order._id)
        .populate('userId', 'name phone')
        .lean();
    }

    // Get delivery partner details
    const deliveryPartner = await Delivery.findById(deliveryPartnerId)
      .select('name phone availability.currentLocation')
      .lean();

    if (!deliveryPartner) {
      console.error(`❌ Delivery partner not found: ${deliveryPartnerId}`);
      return;
    }

    // Get restaurant details for pickup location
    let restaurant = null;
    if (mongoose.Types.ObjectId.isValid(order.restaurantId)) {
      restaurant = await Restaurant.findById(order.restaurantId).lean();
    }
    if (!restaurant) {
      restaurant = await Restaurant.findOne({
        $or: [
          { restaurantId: order.restaurantId },
          { _id: order.restaurantId }
        ]
      }).lean();
    }

    // Calculate distances
    let pickupDistance = null;
    let deliveryDistance = null;
    
    if (deliveryPartner.availability?.currentLocation?.coordinates && restaurant?.location?.coordinates) {
      const [deliveryLng, deliveryLat] = deliveryPartner.availability.currentLocation.coordinates;
      const [restaurantLng, restaurantLat] = restaurant.location.coordinates;
      const [customerLng, customerLat] = order.address.location.coordinates;

      // Calculate pickup distance (delivery boy to restaurant)
      pickupDistance = calculateDistance(deliveryLat, deliveryLng, restaurantLat, restaurantLng);
      
      // Calculate delivery distance (restaurant to customer)
      deliveryDistance = calculateDistance(restaurantLat, restaurantLng, customerLat, customerLng);
    }

    // Prepare order notification data
    const orderNotification = {
      orderId: order.orderId,
      orderMongoId: order._id.toString(),
      restaurantId: order.restaurantId,
      restaurantName: order.restaurantName,
      restaurantLocation: restaurant?.location ? {
        latitude: restaurant.location.coordinates[1],
        longitude: restaurant.location.coordinates[0],
        address: restaurant.location.formattedAddress || restaurant.address || 'Restaurant address'
      } : null,
      customerLocation: {
        latitude: order.address.location.coordinates[1],
        longitude: order.address.location.coordinates[0],
        address: order.address.formattedAddress || `${order.address.street}, ${order.address.city}` || 'Customer address'
      },
      items: order.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      total: order.pricing.total,
      customerName: orderWithUser.userId?.name || 'Customer',
      customerPhone: orderWithUser.userId?.phone || '',
      status: order.status,
      createdAt: order.createdAt,
      estimatedDeliveryTime: order.estimatedDeliveryTime || 30,
      note: order.note || '',
      pickupDistance: pickupDistance ? `${pickupDistance.toFixed(2)} km` : 'Distance not available',
      deliveryDistance: deliveryDistance ? `${deliveryDistance.toFixed(2)} km` : 'Distance not available',
      estimatedEarnings: calculateEstimatedEarnings(order.pricing.total, deliveryDistance)
    };

    // Get delivery namespace
    const deliveryNamespace = io.of('/delivery');
    
    // Normalize deliveryPartnerId to string
    const normalizedDeliveryPartnerId = deliveryPartnerId?.toString() || deliveryPartnerId;
    
    // Get all connected sockets in the delivery partner room
    const room = `delivery:${normalizedDeliveryPartnerId}`;
    const socketsInRoom = await deliveryNamespace.in(room).fetchSockets();
    
    console.log(`📢 Attempting to notify delivery partner ${normalizedDeliveryPartnerId} about order ${order.orderId}`);
    console.log(`📢 Connected sockets in room ${room}:`, socketsInRoom.length);
    
    // Emit new order notification to delivery partner room
    deliveryNamespace.to(room).emit('new_order', orderNotification);
    
    // Emit sound notification event
    deliveryNamespace.to(room).emit('play_notification_sound', {
      type: 'new_order',
      orderId: order.orderId,
      message: `New order assigned: ${order.orderId}`
    });

    // Also emit to all sockets in the delivery namespace (fallback)
    if (socketsInRoom.length === 0) {
      console.warn(`⚠️ No sockets connected in room ${room}, broadcasting to all delivery sockets`);
      deliveryNamespace.emit('new_order', orderNotification);
    }

    console.log(`✅ Notified delivery partner ${normalizedDeliveryPartnerId} about new order ${order.orderId}`);
    
    return {
      success: true,
      deliveryPartnerId,
      orderId: order.orderId
    };
  } catch (error) {
    console.error('Error notifying delivery boy:', error);
    throw error;
  }
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
}

/**
 * Calculate estimated earnings for delivery boy
 * Simple calculation: 10% of order total + base fee
 */
function calculateEstimatedEarnings(orderTotal, deliveryDistance) {
  const baseFee = 20; // Base delivery fee
  const commissionRate = 0.10; // 10% commission
  const distanceFee = deliveryDistance ? deliveryDistance * 2 : 0; // ₹2 per km
  
  return Math.round((orderTotal * commissionRate) + baseFee + distanceFee);
}

