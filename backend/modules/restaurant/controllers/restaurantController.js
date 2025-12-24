import Restaurant from '../models/Restaurant.js';
import { successResponse, errorResponse } from '../../../shared/utils/response.js';

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
    
    const restaurant = await Restaurant.findOne({
      $or: [
        { restaurantId: id },
        { slug: id },
        { _id: id },
      ],
      isActive: true,
    })
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
    const slug = step1.restaurantName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if restaurant already exists
    const existing = await Restaurant.findOne({ owner: ownerId });
    if (existing) {
      console.log('Restaurant already exists for owner:', ownerId);
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
      existing.isActive = true; // Ensure it's active
      existing.isAcceptingOrders = true; // Ensure it's accepting orders
      await existing.save();
      console.log('✅ Restaurant updated successfully:', {
        restaurantId: existing.restaurantId,
        _id: existing._id,
        name: existing.name,
        isActive: existing.isActive,
      });
      return existing;
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

