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
    const ownerId = req.user._id;
    
    const restaurant = await Restaurant.findOne({ owner: ownerId })
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

// Create restaurant from onboarding data
export const createRestaurantFromOnboarding = async (onboardingData, ownerId) => {
  try {
    const { step1, step2, step4 } = onboardingData;
    
    if (!step1 || !step2) {
      throw new Error('Incomplete onboarding data: Missing step1 or step2');
    }

    // Validate required fields
    if (!step1.restaurantName) {
      throw new Error('Restaurant name is required');
    }

    // Generate slug from restaurant name
    let baseSlug = step1.restaurantName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if restaurant already exists by owner OR by slug
    const existingByOwner = await Restaurant.findOne({ owner: ownerId });
    const existingBySlug = await Restaurant.findOne({ slug: baseSlug });
    
    // If restaurant exists by owner, update it
    if (existingByOwner) {
      console.log('Restaurant already exists for owner:', ownerId);
      
      // Check if slug needs to be unique (if it's different from existing)
      let slug = baseSlug;
      if (existingByOwner.slug !== baseSlug) {
        // Check if the new slug already exists for another restaurant
        if (existingBySlug && existingBySlug._id.toString() !== existingByOwner._id.toString()) {
          // Make slug unique by appending a number
          let counter = 1;
          let uniqueSlug = `${baseSlug}-${counter}`;
          while (await Restaurant.findOne({ slug: uniqueSlug, _id: { $ne: existingByOwner._id } })) {
            counter++;
            uniqueSlug = `${baseSlug}-${counter}`;
          }
          slug = uniqueSlug;
          console.log(`Slug already exists, using unique slug: ${slug}`);
        }
      } else {
        slug = existingByOwner.slug; // Keep existing slug
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
    }

    // Check if slug already exists and make it unique if needed
    let slug = baseSlug;
    const slugExists = await Restaurant.findOne({ slug: baseSlug });
    if (slugExists) {
      // Make slug unique by appending a number
      let counter = 1;
      let uniqueSlug = `${baseSlug}-${counter}`;
      while (await Restaurant.findOne({ slug: uniqueSlug })) {
        counter++;
        uniqueSlug = `${baseSlug}-${counter}`;
      }
      slug = uniqueSlug;
      console.log(`Slug already exists, using unique slug: ${slug}`);
    }

    // Generate restaurantId before creating the restaurant
    // This is needed because validation runs before pre-save hooks
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    const restaurantId = `REST-${timestamp}-${random}`;

    // Create new restaurant
    const restaurantData = {
      restaurantId, // Set restaurantId explicitly to pass validation
      owner: ownerId,
      name: step1.restaurantName,
      slug,
      ownerName: step1.ownerName || '',
      ownerEmail: step1.ownerEmail || '',
      ownerPhone: step1.ownerPhone || '',
      primaryContactNumber: step1.primaryContactNumber || step1.ownerPhone || '',
      location: step1.location || {},
      profileImage: step2.profileImageUrl || null,
      menuImages: step2.menuImageUrls || [],
      cuisines: step2.cuisines || [],
      deliveryTimings: step2.deliveryTimings || {
        openingTime: '09:00',
        closingTime: '22:00',
      },
      openDays: step2.openDays || [],
      isActive: true,
      isAcceptingOrders: true,
      // Step 4 data for user module display
      estimatedDeliveryTime: step4?.estimatedDeliveryTime || "25-30 mins",
      distance: step4?.distance || "1.2 km",
      priceRange: step4?.priceRange || "$$",
      featuredDish: step4?.featuredDish || "",
      featuredPrice: step4?.featuredPrice || 249,
      offer: step4?.offer || "Flat ₹50 OFF above ₹199",
    };

    console.log('Creating restaurant with data:', {
      name: restaurantData.name,
      owner: ownerId,
      hasLocation: !!restaurantData.location,
      hasProfileImage: !!restaurantData.profileImage,
      menuImagesCount: restaurantData.menuImages.length,
      cuisinesCount: restaurantData.cuisines.length,
    });

    const restaurant = new Restaurant(restaurantData);
    
    try {
      await restaurant.save();
      console.log('✅ Restaurant created successfully:', {
        restaurantId: restaurant.restaurantId,
        _id: restaurant._id,
        name: restaurant.name,
        slug: restaurant.slug,
        isActive: restaurant.isActive,
        isAcceptingOrders: restaurant.isAcceptingOrders,
      });
    } catch (saveError) {
      console.error('❌ Error saving restaurant to database:', saveError);
      console.error('Save error name:', saveError.name);
      console.error('Save error message:', saveError.message);
      if (saveError.code === 11000) {
        console.error('Duplicate key error - restaurant with this slug or restaurantId already exists');
        // If it's a duplicate slug error, try to find and update the existing restaurant
        if (saveError.keyPattern && saveError.keyPattern.slug) {
          console.log('Attempting to find existing restaurant by slug and update it...');
          const existingBySlug = await Restaurant.findOne({ slug: restaurantData.slug });
          if (existingBySlug) {
            // If it's the same owner, update it
            if (existingBySlug.owner.toString() === ownerId.toString()) {
              Object.assign(existingBySlug, restaurantData);
              existingBySlug.isActive = true;
              existingBySlug.isAcceptingOrders = true;
              await existingBySlug.save();
              console.log('✅ Updated existing restaurant instead of creating new one');
              return existingBySlug;
            } else {
              // Different owner - make slug unique and retry
              let counter = 1;
              let uniqueSlug = `${restaurantData.slug}-${counter}`;
              while (await Restaurant.findOne({ slug: uniqueSlug })) {
                counter++;
                uniqueSlug = `${restaurantData.slug}-${counter}`;
              }
              restaurantData.slug = uniqueSlug;
              const retryRestaurant = new Restaurant(restaurantData);
              await retryRestaurant.save();
              console.log(`✅ Created restaurant with unique slug: ${uniqueSlug}`);
              return retryRestaurant;
            }
          }
        }
      }
      throw saveError;
    }

    return restaurant;
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

