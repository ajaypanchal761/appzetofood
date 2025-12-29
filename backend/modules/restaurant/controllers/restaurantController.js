import Restaurant from '../models/Restaurant.js';
import { successResponse, errorResponse } from '../../../shared/utils/response.js';
import mongoose from 'mongoose';

// Get all restaurants (for user module)
export const getRestaurants = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    const restaurants = await Restaurant.find({ isActive: true })
      .select('-owner -createdAt -updatedAt')
      .sort({ createdAt: -1 }) // Latest first
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .lean();

    console.log(`Fetched ${restaurants.length} restaurants from database`);

    return successResponse(res, 200, 'Restaurants retrieved successfully', {
      restaurants,
      total: restaurants.length,
    });
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    return errorResponse(res, 500, 'Failed to fetch restaurants');
  }
};

// Get restaurant by ID or slug
export const getRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Build query conditions - only include _id if it's a valid ObjectId
    const queryConditions = {
      isActive: true,
    };
    
    const orConditions = [
      { restaurantId: id },
      { slug: id },
    ];
    
    // Only add _id condition if the id is a valid ObjectId
    if (mongoose.Types.ObjectId.isValid(id) && id.length === 24) {
      orConditions.push({ _id: new mongoose.Types.ObjectId(id) });
    }
    
    queryConditions.$or = orConditions;
    
    const restaurant = await Restaurant.findOne(queryConditions)
      .select('-owner -createdAt -updatedAt')
      .lean();

    if (!restaurant) {
      return errorResponse(res, 404, 'Restaurant not found');
    }

    return successResponse(res, 200, 'Restaurant retrieved successfully', {
      restaurant,
    });
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    return errorResponse(res, 500, 'Failed to fetch restaurant');
  }
};

// Get restaurant by owner (for restaurant module)
export const getRestaurantByOwner = async (req, res) => {
  try {
    const restaurantId = req.restaurant._id;
    
    const restaurant = await Restaurant.findById(restaurantId)
      .lean();

    if (!restaurant) {
      return errorResponse(res, 404, 'Restaurant not found');
    }

    return successResponse(res, 200, 'Restaurant retrieved successfully', {
      restaurant,
    });
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    return errorResponse(res, 500, 'Failed to fetch restaurant');
  }
};

// Create/Update restaurant from onboarding data
export const createRestaurantFromOnboarding = async (onboardingData, restaurantId) => {
  try {
    const { step1, step2, step4 } = onboardingData;
    
    if (!step1 || !step2) {
      throw new Error('Incomplete onboarding data: Missing step1 or step2');
    }

    // Validate required fields
    if (!step1.restaurantName) {
      throw new Error('Restaurant name is required');
    }

    // Find existing restaurant
    const existing = await Restaurant.findById(restaurantId);
    
    if (!existing) {
      throw new Error('Restaurant not found');
    }

    // Generate slug from restaurant name
    let baseSlug = step1.restaurantName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if slug needs to be unique (if it's different from existing)
    let slug = baseSlug;
    if (existing.slug !== baseSlug) {
      // Check if the new slug already exists for another restaurant
      const existingBySlug = await Restaurant.findOne({ slug: baseSlug, _id: { $ne: existing._id } });
      if (existingBySlug) {
        // Make slug unique by appending a number
        let counter = 1;
        let uniqueSlug = `${baseSlug}-${counter}`;
        while (await Restaurant.findOne({ slug: uniqueSlug, _id: { $ne: existing._id } })) {
          counter++;
          uniqueSlug = `${baseSlug}-${counter}`;
        }
        slug = uniqueSlug;
        console.log(`Slug already exists, using unique slug: ${slug}`);
      }
    } else {
      slug = existing.slug; // Keep existing slug
    }
    
    // Update existing restaurant with latest onboarding data
    existing.name = step1.restaurantName;
    existing.slug = slug;
    existing.ownerName = step1.ownerName || existing.ownerName;
    existing.ownerEmail = step1.ownerEmail || existing.ownerEmail;
    existing.ownerPhone = step1.ownerPhone || existing.ownerPhone;
    existing.primaryContactNumber = step1.primaryContactNumber || existing.primaryContactNumber;
    if (step1.location) existing.location = step1.location;
    if (step2.profileImageUrl) existing.profileImage = step2.profileImageUrl;
    if (step2.menuImageUrls && step2.menuImageUrls.length > 0) existing.menuImages = step2.menuImageUrls;
    if (step2.cuisines && step2.cuisines.length > 0) existing.cuisines = step2.cuisines;
    if (step2.deliveryTimings) existing.deliveryTimings = step2.deliveryTimings;
    if (step2.openDays && step2.openDays.length > 0) existing.openDays = step2.openDays;
    
    // Update step4 data if available
    if (step4) {
      if (step4.estimatedDeliveryTime) existing.estimatedDeliveryTime = step4.estimatedDeliveryTime;
      if (step4.distance) existing.distance = step4.distance;
      if (step4.priceRange) existing.priceRange = step4.priceRange;
      if (step4.featuredDish) existing.featuredDish = step4.featuredDish;
      if (step4.featuredPrice !== undefined) existing.featuredPrice = step4.featuredPrice;
      if (step4.offer) existing.offer = step4.offer;
    }
    
    existing.isActive = true; // Ensure it's active
    existing.isAcceptingOrders = true; // Ensure it's accepting orders
    
    try {
      await existing.save();
    } catch (saveError) {
      if (saveError.code === 11000 && saveError.keyPattern && saveError.keyPattern.slug) {
        // Slug conflict - try to make it unique
        let counter = 1;
        let uniqueSlug = `${slug}-${counter}`;
        while (await Restaurant.findOne({ slug: uniqueSlug, _id: { $ne: existing._id } })) {
          counter++;
          uniqueSlug = `${slug}-${counter}`;
        }
        existing.slug = uniqueSlug;
        await existing.save();
        console.log(`Updated slug to unique value: ${uniqueSlug}`);
      } else {
        throw saveError;
      }
    }
    console.log('✅ Restaurant updated successfully:', {
      restaurantId: existing.restaurantId,
      _id: existing._id,
      name: existing.name,
      isActive: existing.isActive,
    });
    return existing;

  } catch (error) {
    console.error('Error creating restaurant from onboarding:', error);
    console.error('Error stack:', error.stack);
    console.error('Onboarding data received:', {
      hasStep1: !!onboardingData?.step1,
      hasStep2: !!onboardingData?.step2,
      step1Keys: onboardingData?.step1 ? Object.keys(onboardingData.step1) : [],
      step2Keys: onboardingData?.step2 ? Object.keys(onboardingData.step2) : [],
    });
    throw error;
  }
};

