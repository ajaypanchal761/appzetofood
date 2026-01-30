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
 * Check if delivery partner is connected to socket
 * @param {string} deliveryPartnerId - Delivery partner ID
 * @returns {Promise<{connected: boolean, room: string|null, socketCount: number}>}
 */
async function checkDeliveryPartnerConnection(deliveryPartnerId) {
  try {
    const io = await getIOInstance();
    if (!io) {
      return { connected: false, room: null, socketCount: 0 };
    }

    const deliveryNamespace = io.of('/delivery');
    const normalizedId = deliveryPartnerId?.toString() || deliveryPartnerId;
    
    const roomVariations = [
      `delivery:${normalizedId}`,
      `delivery:${deliveryPartnerId}`,
      ...(mongoose.Types.ObjectId.isValid(normalizedId) 
        ? [`delivery:${new mongoose.Types.ObjectId(normalizedId).toString()}`]
        : [])
    ];

    for (const room of roomVariations) {
      const sockets = await deliveryNamespace.in(room).fetchSockets();
      if (sockets.length > 0) {
        return { connected: true, room, socketCount: sockets.length };
      }
    }

    return { connected: false, room: null, socketCount: 0 };
  } catch (error) {
    console.error('Error checking delivery partner connection:', error);
    return { connected: false, room: null, socketCount: 0 };
  }
}

/**
 * Notify delivery boy about new order assignment via Socket.IO
 * @param {Object} order - Order document
 * @param {string} deliveryPartnerId - Delivery partner ID
 */
export async function notifyDeliveryBoyNewOrder(order, deliveryPartnerId) {
  // CRITICAL: Don't notify if order is cancelled
  if (order.status === 'cancelled') {
    console.log(`⚠️ Order ${order.orderId} is cancelled. Cannot notify delivery partner.`);
    return { success: false, reason: 'Order is cancelled' };
  }
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
      .select('name phone availability.currentLocation availability.isOnline status isActive')
      .lean();

    if (!deliveryPartner) {
      console.error(`❌ Delivery partner not found: ${deliveryPartnerId}`);
      return;
    }

    // Verify delivery partner is online and active
    if (!deliveryPartner.availability?.isOnline) {
      console.warn(`⚠️ Delivery partner ${deliveryPartnerId} (${deliveryPartner.name}) is not online. Notification may not be received.`);
    }

    if (!deliveryPartner.isActive) {
      console.warn(`⚠️ Delivery partner ${deliveryPartnerId} (${deliveryPartner.name}) is not active.`);
    }

    if (!deliveryPartner.availability?.currentLocation?.coordinates || 
        deliveryPartner.availability.currentLocation.coordinates[0] === 0 && 
        deliveryPartner.availability.currentLocation.coordinates[1] === 0) {
      console.warn(`⚠️ Delivery partner ${deliveryPartnerId} (${deliveryPartner.name}) has no valid location.`);
    }

    console.log(`📋 Delivery partner details:`, {
      id: deliveryPartnerId,
      name: deliveryPartner.name,
      isOnline: deliveryPartner.availability?.isOnline,
      isActive: deliveryPartner.isActive,
      status: deliveryPartner.status,
      hasLocation: !!deliveryPartner.availability?.currentLocation?.coordinates
    });

    // Check if delivery partner is connected to socket BEFORE trying to notify
    const connectionStatus = await checkDeliveryPartnerConnection(deliveryPartnerId);
    console.log(`🔌 Delivery partner socket connection status:`, connectionStatus);
    
    if (!connectionStatus.connected) {
      console.warn(`⚠️ Delivery partner ${deliveryPartnerId} (${deliveryPartner.name}) is NOT connected to socket!`);
      console.warn(`⚠️ Notification will be sent but may not be received until they reconnect.`);
    } else {
      console.log(`✅ Delivery partner ${deliveryPartnerId} is connected via socket in room: ${connectionStatus.room}`);
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

    // Calculate estimated earnings; use order's delivery fee as fallback when 0 or distance missing
    const deliveryFeeFromOrder = order.pricing?.deliveryFee ?? 0;
    let estimatedEarnings = await calculateEstimatedEarnings(deliveryDistance || 0);
    const earnedValue = typeof estimatedEarnings === 'object' ? (estimatedEarnings.totalEarning ?? 0) : (Number(estimatedEarnings) || 0);
    if (earnedValue <= 0 && deliveryFeeFromOrder > 0) {
      estimatedEarnings = typeof estimatedEarnings === 'object'
        ? { ...estimatedEarnings, totalEarning: deliveryFeeFromOrder }
        : deliveryFeeFromOrder;
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
      deliveryFee: deliveryFeeFromOrder,
      customerName: orderWithUser.userId?.name || 'Customer',
      customerPhone: orderWithUser.userId?.phone || '',
      status: order.status,
      createdAt: order.createdAt,
      estimatedDeliveryTime: order.estimatedDeliveryTime || 30,
      note: order.note || '',
      pickupDistance: pickupDistance ? `${pickupDistance.toFixed(2)} km` : 'Distance not available',
      deliveryDistance: deliveryDistance ? `${deliveryDistance.toFixed(2)} km` : 'Calculating...',
      deliveryDistanceRaw: deliveryDistance || 0, // Raw distance number for calculations
      estimatedEarnings
    };

    // Get delivery namespace
    const deliveryNamespace = io.of('/delivery');
    
    // Normalize deliveryPartnerId to string
    const normalizedDeliveryPartnerId = deliveryPartnerId?.toString() || deliveryPartnerId;
    
    // Try multiple room formats to ensure we find the delivery partner
    const roomVariations = [
      `delivery:${normalizedDeliveryPartnerId}`,
      `delivery:${deliveryPartnerId}`,
      ...(mongoose.Types.ObjectId.isValid(normalizedDeliveryPartnerId) 
        ? [`delivery:${new mongoose.Types.ObjectId(normalizedDeliveryPartnerId).toString()}`]
        : [])
    ];
    
    // Get all connected sockets in the delivery partner room
    let socketsInRoom = [];
    let foundRoom = null;
    
    // First, get all connected sockets in delivery namespace for debugging
    const allSockets = await deliveryNamespace.fetchSockets();
    console.log(`📊 Total connected delivery sockets: ${allSockets.length}`);
    
    // Check each room variation
    for (const room of roomVariations) {
      const sockets = await deliveryNamespace.in(room).fetchSockets();
      if (sockets.length > 0) {
        socketsInRoom = sockets;
        foundRoom = room;
        console.log(`📢 Found ${sockets.length} socket(s) in room: ${room}`);
        console.log(`📢 Socket IDs in room:`, sockets.map(s => s.id));
        break;
      } else {
        // Check room size using adapter (alternative method)
        const roomSize = deliveryNamespace.adapter.rooms.get(room)?.size || 0;
        if (roomSize > 0) {
          console.log(`📢 Room ${room} has ${roomSize} socket(s) (checked via adapter)`);
        }
      }
    }
    
    const primaryRoom = roomVariations[0];
    
    console.log(`📢 Attempting to notify delivery partner ${normalizedDeliveryPartnerId} about order ${order.orderId}`);
    console.log(`📢 Delivery partner name: ${deliveryPartner.name}`);
    console.log(`📢 Room variations to try:`, roomVariations);
    console.log(`📢 Connected sockets in primary room ${primaryRoom}:`, socketsInRoom.length);
    console.log(`📢 Found room:`, foundRoom || 'none');
    
    // Emit new order notification to all room variations (even if no sockets found, in case they connect)
    let notificationSent = false;
    roomVariations.forEach(room => {
      deliveryNamespace.to(room).emit('new_order', orderNotification);
      deliveryNamespace.to(room).emit('play_notification_sound', {
        type: 'new_order',
        orderId: order.orderId,
        message: `New order assigned: ${order.orderId}`
      });
      notificationSent = true;
      console.log(`📤 Emitted notification to room: ${room}`);
    });

    // Also emit to all sockets in the delivery namespace (fallback if no specific room found)
    if (socketsInRoom.length === 0) {
      console.warn(`⚠️ No sockets connected in any delivery room for partner ${normalizedDeliveryPartnerId}`);
      console.warn(`⚠️ Delivery partner details:`, {
        id: normalizedDeliveryPartnerId,
        name: deliveryPartner.name,
        isOnline: deliveryPartner.availability?.isOnline,
        isActive: deliveryPartner.isActive,
        status: deliveryPartner.status
      });
      console.warn(`⚠️ This means the delivery partner is not currently connected to the app`);
      console.warn(`⚠️ Possible reasons:`);
      console.warn(`  1. Delivery partner app is closed or not running`);
      console.warn(`  2. Delivery partner is not logged in`);
      console.warn(`  3. Socket connection failed`);
      console.warn(`  4. Delivery partner needs to refresh their app`);
      console.warn(`  5. Delivery partner ID mismatch (check if ID used to join room matches ${normalizedDeliveryPartnerId})`);
      
      if (allSockets.length > 0) {
        console.log(`📊 Connected delivery socket IDs:`, allSockets.map(s => s.id));
        console.log(`📊 Checking all delivery rooms to see which partners are connected...`);
        
        // List all rooms in delivery namespace
        const allRooms = deliveryNamespace.adapter.rooms;
        console.log(`📊 All delivery rooms:`, Array.from(allRooms.keys()).filter(room => room.startsWith('delivery:')));
      } else {
        console.warn(`⚠️ No delivery partners are currently connected to the app!`);
      }
      
      // Still broadcast to all delivery sockets as fallback
      console.warn(`⚠️ Broadcasting to all delivery sockets as fallback (in case they connect later)`);
      deliveryNamespace.emit('new_order', orderNotification);
      deliveryNamespace.emit('play_notification_sound', {
        type: 'new_order',
        orderId: order.orderId,
        message: `New order assigned: ${order.orderId}`
      });
      notificationSent = true;
    } else {
      console.log(`✅ Successfully found ${socketsInRoom.length} connected socket(s) for delivery partner ${normalizedDeliveryPartnerId}`);
      console.log(`✅ Notification sent to room: ${foundRoom}`);
    }

    if (notificationSent) {
      console.log(`✅ Notification emitted for order ${order.orderId} to delivery partner ${normalizedDeliveryPartnerId}`);
    } else {
      console.error(`❌ Failed to send notification - no sockets found and broadcast failed`);
    }
    
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
 * Notify delivery boy that order is ready for pickup
 * @param {Object} order - Order document
 * @param {string} deliveryPartnerId - Delivery partner ID
 */
export async function notifyDeliveryBoyOrderReady(order, deliveryPartnerId) {
  try {
    const io = await getIOInstance();
    
    if (!io) {
      console.warn('Socket.IO not initialized, skipping delivery boy notification');
      return;
    }

    const deliveryNamespace = io.of('/delivery');
    const normalizedDeliveryPartnerId = deliveryPartnerId?.toString() || deliveryPartnerId;

    // Prepare order ready notification
    const coords = order.restaurantId?.location?.coordinates;
    const orderReadyNotification = {
      orderId: order.orderId || order._id,
      mongoId: order._id?.toString(),
      status: 'ready',
      restaurantName: order.restaurantName || order.restaurantId?.name,
      restaurantAddress: order.restaurantId?.address || order.restaurantId?.location?.address,
      message: `Order ${order.orderId} is ready for pickup`,
      timestamp: new Date().toISOString(),
      // Include restaurant coords so delivery app can show Reached Pickup when rider is near (coordinates: [lng, lat])
      restaurantLat: coords?.[1],
      restaurantLng: coords?.[0]
    };

    // Try to find delivery partner's room
    const roomVariations = [
      `delivery:${normalizedDeliveryPartnerId}`,
      `delivery:${deliveryPartnerId}`,
      ...(mongoose.Types.ObjectId.isValid(normalizedDeliveryPartnerId) 
        ? [`delivery:${new mongoose.Types.ObjectId(normalizedDeliveryPartnerId).toString()}`]
        : [])
    ];

    let notificationSent = false;
    let foundRoom = null;
    let socketsInRoom = [];

    for (const room of roomVariations) {
      const sockets = await deliveryNamespace.in(room).fetchSockets();
      if (sockets.length > 0) {
        foundRoom = room;
        socketsInRoom = sockets;
        break;
      }
    }

    if (foundRoom && socketsInRoom.length > 0) {
      // Send to specific delivery partner room
      deliveryNamespace.to(foundRoom).emit('order_ready', orderReadyNotification);
      notificationSent = true;
      console.log(`✅ Order ready notification sent to delivery partner ${normalizedDeliveryPartnerId} in room ${foundRoom}`);
    } else {
      // Fallback: broadcast to all delivery sockets
      console.warn(`⚠️ Delivery partner ${normalizedDeliveryPartnerId} not found in any room, broadcasting to all`);
      deliveryNamespace.emit('order_ready', orderReadyNotification);
      notificationSent = true;
    }

    return {
      success: notificationSent,
      deliveryPartnerId: normalizedDeliveryPartnerId,
      orderId: order.orderId
    };
  } catch (error) {
    console.error('Error notifying delivery boy about order ready:', error);
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
 * Calculate estimated earnings for delivery boy based on admin commission rules
 * Uses DeliveryBoyCommission model to calculate: Base Payout + (Distance × Per Km) if distance > minDistance
 */
async function calculateEstimatedEarnings(deliveryDistance) {
  try {
    if (!deliveryDistance || deliveryDistance <= 0) {
      // If no distance, return base payout only
      const DeliveryBoyCommission = (await import('../../admin/models/DeliveryBoyCommission.js')).default;
      const rules = await DeliveryBoyCommission.find({ status: true }).sort({ minDistance: 1 }).limit(1).lean();
      if (rules.length > 0) {
        return {
          basePayout: rules[0].basePayout,
          distance: 0,
          commissionPerKm: 0,
          distanceCommission: 0,
          totalEarning: rules[0].basePayout,
          breakdown: `Base payout: ₹${rules[0].basePayout}`
        };
      }
      return {
        basePayout: 10,
        distance: 0,
        commissionPerKm: 0,
        distanceCommission: 0,
        totalEarning: 10,
        breakdown: 'Base payout: ₹10'
      };
    }

    const DeliveryBoyCommission = (await import('../../admin/models/DeliveryBoyCommission.js')).default;
    const commissionResult = await DeliveryBoyCommission.calculateCommission(deliveryDistance);
    
    const basePayout = commissionResult.breakdown.basePayout;
    const distance = deliveryDistance;
    const commissionPerKm = commissionResult.breakdown.commissionPerKm;
    const distanceCommission = commissionResult.breakdown.distanceCommission;
    const totalEarning = commissionResult.commission;

    // Create breakdown text
    let breakdown = `Base payout: ₹${basePayout}`;
    if (distance > commissionResult.rule.minDistance) {
      breakdown += ` + Distance (${distance.toFixed(1)} km × ₹${commissionPerKm}/km) = ₹${distanceCommission.toFixed(0)}`;
    } else {
      breakdown += ` (Distance ${distance.toFixed(1)} km ≤ ${commissionResult.rule.minDistance} km, per km not applicable)`;
    }
    breakdown += ` = ₹${totalEarning.toFixed(0)}`;

    return {
      basePayout: Math.round(basePayout * 100) / 100,
      distance: Math.round(distance * 100) / 100,
      commissionPerKm: Math.round(commissionPerKm * 100) / 100,
      distanceCommission: Math.round(distanceCommission * 100) / 100,
      totalEarning: Math.round(totalEarning * 100) / 100,
      breakdown: breakdown,
      minDistance: commissionResult.rule.minDistance,
      maxDistance: commissionResult.rule.maxDistance
    };
  } catch (error) {
    console.error('Error calculating estimated earnings:', error);
    // Fallback to default calculation
    return {
      basePayout: 10,
      distance: deliveryDistance || 0,
      commissionPerKm: 5,
      distanceCommission: deliveryDistance && deliveryDistance > 4 ? deliveryDistance * 5 : 0,
      totalEarning: 10 + (deliveryDistance && deliveryDistance > 4 ? deliveryDistance * 5 : 0),
      breakdown: 'Default calculation'
    };
  }
}

