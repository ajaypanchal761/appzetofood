import Restaurant from '../../restaurant/models/Restaurant.js';
import mongoose from 'mongoose';

/**
 * Calculate delivery fee based on order value, distance, and restaurant settings
 */
export const calculateDeliveryFee = (orderValue, restaurant, deliveryAddress = null) => {
  // Base delivery fee
  let deliveryFee = 25; // Default ₹25
  
  // Check restaurant settings for free delivery threshold
  if (restaurant?.freeDeliveryAbove) {
    if (orderValue >= restaurant.freeDeliveryAbove) {
      return 0; // Free delivery
    }
  } else {
    // Default free delivery threshold
    if (orderValue >= 149) {
      return 0;
    }
  }
  
  // TODO: Add distance-based calculation when address coordinates are available
  // if (deliveryAddress?.location?.coordinates && restaurant?.location?.coordinates) {
  //   const distance = calculateDistance(
  //     restaurant.location.coordinates,
  //     deliveryAddress.location.coordinates
  //   );
  //   deliveryFee = baseFee + (distance * perKmFee);
  // }
  
  return deliveryFee;
};

/**
 * Calculate platform fee
 */
export const calculatePlatformFee = () => {
  return 5; // ₹5 platform fee per order
};

/**
 * Calculate GST (Goods and Services Tax)
 * GST is calculated on subtotal after discounts
 */
export const calculateGST = (subtotal, discount = 0) => {
  const taxableAmount = subtotal - discount;
  // GST rate is typically 5% for restaurants
  const gstRate = 0.05; // 5%
  return Math.round(taxableAmount * gstRate);
};

/**
 * Calculate discount based on coupon code
 */
export const calculateDiscount = (coupon, subtotal) => {
  if (!coupon) return 0;
  
  if (coupon.minOrder && subtotal < coupon.minOrder) {
    return 0; // Minimum order not met
  }
  
  if (coupon.type === 'percentage') {
    const maxDiscount = coupon.maxDiscount || Infinity;
    const discount = Math.min(
      Math.round(subtotal * (coupon.discount / 100)),
      maxDiscount
    );
    return discount;
  } else if (coupon.type === 'flat') {
    return Math.min(coupon.discount, subtotal); // Can't discount more than subtotal
  }
  
  // Default: flat discount
  return Math.min(coupon.discount || 0, subtotal);
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 * Returns distance in kilometers
 */
export const calculateDistance = (coord1, coord2) => {
  const [lng1, lat1] = coord1;
  const [lng2, lat2] = coord2;
  
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
};

/**
 * Main function to calculate order pricing
 */
export const calculateOrderPricing = async ({
  items,
  restaurantId,
  deliveryAddress = null,
  couponCode = null,
  deliveryFleet = 'standard'
}) => {
  try {
    // Calculate subtotal from items
    const subtotal = items.reduce((sum, item) => {
      return sum + (item.price || 0) * (item.quantity || 1);
    }, 0);
    
    if (subtotal <= 0) {
      throw new Error('Order subtotal must be greater than 0');
    }
    
    // Get restaurant details
    let restaurant = null;
    if (restaurantId) {
      if (mongoose.Types.ObjectId.isValid(restaurantId) && restaurantId.length === 24) {
        restaurant = await Restaurant.findById(restaurantId).lean();
      }
      if (!restaurant) {
        restaurant = await Restaurant.findOne({
          $or: [
            { restaurantId: restaurantId },
            { slug: restaurantId }
          ]
        }).lean();
      }
    }
    
    // Calculate coupon discount
    let discount = 0;
    let appliedCoupon = null;
    
    if (couponCode) {
      // TODO: Fetch coupon from database
      // For now, using hardcoded coupons
      const availableCoupons = [
        { code: 'GETOFF40ON249', discount: 40, minOrder: 249, type: 'flat' },
        { code: 'FIRST50', discount: 50, minOrder: 199, type: 'flat', maxDiscount: 50 },
        { code: 'FREEDEL', discount: 0, minOrder: 149, type: 'flat', freeDelivery: true },
      ];
      
      const coupon = availableCoupons.find(c => c.code === couponCode);
      if (coupon) {
        appliedCoupon = coupon;
        discount = calculateDiscount(coupon, subtotal);
      }
    }
    
    // Calculate delivery fee
    const deliveryFee = calculateDeliveryFee(
      subtotal,
      restaurant,
      deliveryAddress
    );
    
    // Apply free delivery from coupon
    const finalDeliveryFee = appliedCoupon?.freeDelivery ? 0 : deliveryFee;
    
    // Calculate platform fee
    const platformFee = calculatePlatformFee();
    
    // Calculate GST on subtotal after discount
    const gst = calculateGST(subtotal, discount);
    
    // Calculate total
    const total = subtotal - discount + finalDeliveryFee + platformFee + gst;
    
    // Calculate savings (discount + any delivery savings)
    const savings = discount + (deliveryFee > finalDeliveryFee ? deliveryFee - finalDeliveryFee : 0);
    
    return {
      subtotal: Math.round(subtotal),
      discount: Math.round(discount),
      deliveryFee: Math.round(finalDeliveryFee),
      platformFee: Math.round(platformFee),
      tax: gst, // Already rounded in calculateGST
      total: Math.round(total),
      savings: Math.round(savings),
      appliedCoupon: appliedCoupon ? {
        code: appliedCoupon.code,
        discount: discount,
        freeDelivery: appliedCoupon.freeDelivery || false
      } : null,
      breakdown: {
        itemTotal: Math.round(subtotal),
        discountAmount: Math.round(discount),
        deliveryFee: Math.round(finalDeliveryFee),
        platformFee: Math.round(platformFee),
        gst: gst,
        total: Math.round(total)
      }
    };
  } catch (error) {
    throw new Error(`Failed to calculate order pricing: ${error.message}`);
  }
};

