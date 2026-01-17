import Order from '../../order/models/Order.js';
import { successResponse, errorResponse } from '../../../shared/utils/response.js';
import asyncHandler from '../../../shared/middleware/asyncHandler.js';
import mongoose from 'mongoose';

/**
 * Get all orders for admin
 * GET /api/admin/orders
 * Query params: status, page, limit, search, fromDate, toDate, restaurant, paymentStatus
 */
export const getOrders = asyncHandler(async (req, res) => {
  try {
    const { 
      status, 
      page = 1, 
      limit = 50,
      search,
      fromDate,
      toDate,
      restaurant,
      paymentStatus,
      zone,
      customer
    } = req.query;

    // Build query
    const query = {};

    // Status filter
    if (status && status !== 'all') {
      // Map frontend status keys to backend status values
      const statusMap = {
        'scheduled': 'scheduled',
        'pending': 'pending',
        'accepted': 'confirmed',
        'processing': 'preparing',
        'food-on-the-way': 'out_for_delivery',
        'delivered': 'delivered',
        'canceled': 'cancelled',
        'payment-failed': 'pending', // Payment failed orders have pending status
        'refunded': 'cancelled', // Refunded orders might be cancelled
        'dine-in': 'dine_in',
        'offline-payments': 'pending' // Offline payment orders
      };
      
      const mappedStatus = statusMap[status] || status;
      query.status = mappedStatus;
    }

    // Payment status filter
    if (paymentStatus) {
      query['payment.status'] = paymentStatus.toLowerCase();
    }

    // Date range filter
    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) {
        const startDate = new Date(fromDate);
        startDate.setHours(0, 0, 0, 0);
        query.createdAt.$gte = startDate;
      }
      if (toDate) {
        const endDate = new Date(toDate);
        endDate.setHours(23, 59, 59, 999);
        query.createdAt.$lte = endDate;
      }
    }

    // Restaurant filter
    if (restaurant && restaurant !== 'All restaurants') {
      // Try to find restaurant by name or ID
      const Restaurant = (await import('../../restaurant/models/Restaurant.js')).default;
      const restaurantDoc = await Restaurant.findOne({
        $or: [
          { name: { $regex: restaurant, $options: 'i' } },
          { _id: mongoose.Types.ObjectId.isValid(restaurant) ? restaurant : null },
          { restaurantId: restaurant }
        ]
      }).select('_id restaurantId').lean();

      if (restaurantDoc) {
        query.restaurantId = restaurantDoc._id?.toString() || restaurantDoc.restaurantId;
      }
    }

    // Zone filter
    if (zone && zone !== 'All Zones') {
      // Find zone by name
      const Zone = (await import('../models/Zone.js')).default;
      const zoneDoc = await Zone.findOne({
        name: { $regex: zone, $options: 'i' }
      }).select('_id name').lean();

      if (zoneDoc) {
        query['assignmentInfo.zoneId'] = zoneDoc._id?.toString();
      }
    }

    // Customer filter
    if (customer && customer !== 'All customers') {
      const User = (await import('../../auth/models/User.js')).default;
      const userDoc = await User.findOne({
        name: { $regex: customer, $options: 'i' }
      }).select('_id').lean();

      if (userDoc) {
        query.userId = userDoc._id;
      }
    }

    // Search filter (orderId, customer name, customer phone)
    if (search) {
      query.$or = [
        { orderId: { $regex: search, $options: 'i' } }
      ];

      // If search looks like a phone number, search in customer data
      const phoneRegex = /[\d\s\+\-()]+/;
      if (phoneRegex.test(search)) {
        const User = (await import('../../auth/models/User.js')).default;
        const cleanSearch = search.replace(/\D/g, '');
        const userSearchQuery = { phone: { $regex: cleanSearch, $options: 'i' } };
        if (mongoose.Types.ObjectId.isValid(search)) {
          userSearchQuery._id = search;
        }
        const users = await User.find(userSearchQuery).select('_id').lean();
        const userIds = users.map(u => u._id);
        if (userIds.length > 0) {
          query.$or.push({ userId: { $in: userIds } });
        }
      }

      // Also search by customer name
      const User = (await import('../../auth/models/User.js')).default;
      const usersByName = await User.find({
        name: { $regex: search, $options: 'i' }
      }).select('_id').lean();
      const userIdsByName = usersByName.map(u => u._id);
      if (userIdsByName.length > 0) {
        if (!query.$or) query.$or = [];
        query.$or.push({ userId: { $in: userIdsByName } });
      }

      // Ensure $or array is not empty
      if (query.$or && query.$or.length === 0) {
        delete query.$or;
      }
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch orders with population
    const orders = await Order.find(query)
      .populate('userId', 'name email phone')
      .populate('restaurantId', 'name slug')
      .populate('deliveryPartnerId', 'name phone')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    // Get total count
    const total = await Order.countDocuments(query);

    // Transform orders to match frontend format
    const transformedOrders = orders.map((order, index) => {
      const orderDate = new Date(order.createdAt);
      const dateStr = orderDate.toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      }).toUpperCase();
      const timeStr = orderDate.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }).toUpperCase();

      // Get customer phone (masked)
      const customerPhone = order.userId?.phone || '';
      const maskedPhone = customerPhone ? 
        `+${customerPhone.slice(-2)}*********` : 
        '+8*********';

      // Map payment status
      const paymentStatusMap = {
        'completed': 'Paid',
        'pending': 'Pending',
        'failed': 'Failed',
        'refunded': 'Refunded',
        'processing': 'Processing'
      };
      const paymentStatusDisplay = paymentStatusMap[order.payment?.status] || 'Pending';

      // Map order status for display
      const statusMap = {
        'pending': 'Pending',
        'confirmed': 'Accepted',
        'preparing': 'Processing',
        'ready': 'Ready',
        'out_for_delivery': 'Food On The Way',
        'delivered': 'Delivered',
        'cancelled': 'Canceled',
        'scheduled': 'Scheduled',
        'dine_in': 'Dine In'
      };
      const orderStatusDisplay = statusMap[order.status] || order.status;

      // Determine delivery type
      const deliveryType = order.deliveryFleet === 'standard' ? 
        'Home Delivery' : 
        (order.deliveryFleet === 'fast' ? 'Fast Delivery' : 'Home Delivery');

      // Calculate report-specific fields
      const subtotal = order.pricing?.subtotal || 0;
      const discount = order.pricing?.discount || 0;
      const deliveryFee = order.pricing?.deliveryFee || 0;
      const tax = order.pricing?.tax || 0;
      const couponCode = order.pricing?.couponCode || null;
      
      // For report: itemDiscount is the discount applied to items
      const itemDiscount = discount;
      // Discounted amount is subtotal after discount
      const discountedAmount = Math.max(0, subtotal - discount);
      // Coupon discount (if coupon was applied, it's part of discount)
      const couponDiscount = couponCode ? discount : 0;
      // Referral discount (not currently in model, default to 0)
      const referralDiscount = 0;
      // VAT/Tax
      const vatTax = tax;
      // Delivery charge
      const deliveryCharge = deliveryFee;
      // Total item amount (subtotal before discounts)
      const totalItemAmount = subtotal;
      // Order amount (final total)
      const orderAmount = order.pricing?.total || 0;

      return {
        sl: skip + index + 1,
        orderId: order.orderId,
        id: order._id.toString(),
        date: dateStr,
        time: timeStr,
        customerName: order.userId?.name || 'Unknown',
        customerPhone: maskedPhone,
        customerEmail: order.userId?.email || '',
        restaurant: order.restaurantName || order.restaurantId?.name || 'Unknown Restaurant',
        restaurantId: order.restaurantId?.toString() || order.restaurantId || '',
        // Report-specific fields
        totalItemAmount: totalItemAmount,
        itemDiscount: itemDiscount,
        discountedAmount: discountedAmount,
        couponDiscount: couponDiscount,
        referralDiscount: referralDiscount,
        vatTax: vatTax,
        deliveryCharge: deliveryCharge,
        totalAmount: orderAmount,
        // Original fields
        paymentStatus: paymentStatusDisplay,
        orderStatus: orderStatusDisplay,
        status: order.status, // Backend status
        deliveryType: deliveryType,
        items: order.items || [],
        address: order.address || {},
        deliveryPartnerName: order.deliveryPartnerId?.name || null,
        deliveryPartnerPhone: order.deliveryPartnerId?.phone || null,
        estimatedDeliveryTime: order.estimatedDeliveryTime || 30,
        deliveredAt: order.deliveredAt,
        cancelledAt: order.cancelledAt,
        tracking: order.tracking || {},
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        // Zone info from assignmentInfo
        zoneId: order.assignmentInfo?.zoneId || null,
        zoneName: order.assignmentInfo?.zoneName || null
      };
    });

    return successResponse(res, 200, 'Orders retrieved successfully', {
      orders: transformedOrders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    return errorResponse(res, 500, 'Failed to fetch orders');
  }
});

/**
 * Get order by ID for admin
 * GET /api/admin/orders/:id
 */
export const getOrderById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    let order = null;
    
    // Try MongoDB _id first
    if (mongoose.Types.ObjectId.isValid(id) && id.length === 24) {
      order = await Order.findById(id)
        .populate('userId', 'name email phone')
        .populate('restaurantId', 'name slug location address phone')
        .populate('deliveryPartnerId', 'name phone availability')
        .lean();
    }
    
    // If not found, try by orderId
    if (!order) {
      order = await Order.findOne({ orderId: id })
        .populate('userId', 'name email phone')
        .populate('restaurantId', 'name slug location address phone')
        .populate('deliveryPartnerId', 'name phone availability')
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

