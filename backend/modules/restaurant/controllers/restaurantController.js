import Restaurant from '../models/Restaurant.js';
import { successResponse, errorResponse } from '../../../shared/utils/response.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../../../shared/utils/cloudinaryService.js';
import asyncHandler from '../../../shared/middleware/asyncHandler.js';
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
    existing.name = step1.restaurantName || existing.name;
    existing.slug = slug;
    existing.ownerName = step1.ownerName || existing.ownerName;
    existing.ownerEmail = step1.ownerEmail || existing.ownerEmail;
    existing.ownerPhone = step1.ownerPhone || existing.ownerPhone;
    existing.primaryContactNumber = step1.primaryContactNumber || existing.primaryContactNumber;
    if (step1.location) existing.location = step1.location;
    
    // Update step2 data - always update even if empty arrays
    if (step2) {
      if (step2.profileImageUrl) {
        existing.profileImage = step2.profileImageUrl;
      }
      if (step2.menuImageUrls) {
        existing.menuImages = step2.menuImageUrls; // Update even if empty array
      }
      if (step2.cuisines) {
        existing.cuisines = step2.cuisines; // Update even if empty array
      }
      if (step2.deliveryTimings) {
        existing.deliveryTimings = step2.deliveryTimings;
      }
      if (step2.openDays) {
        existing.openDays = step2.openDays; // Update even if empty array
      }
    }
    
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

/**
 * Update restaurant profile
 * PUT /api/restaurant/profile
 */
export const updateRestaurantProfile = asyncHandler(async (req, res) => {
  try {
    const restaurantId = req.restaurant._id;
    const { profileImage, menuImages, name, cuisines, location, ownerName, ownerEmail, ownerPhone } = req.body;

    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      return errorResponse(res, 404, 'Restaurant not found');
    }

    const updateData = {};

    // Update profile image if provided
    if (profileImage) {
      updateData.profileImage = profileImage;
    }

    // Update menu images if provided
    if (menuImages !== undefined) {
      updateData.menuImages = menuImages;
    }

    // Update name if provided
    if (name) {
      updateData.name = name;
      // Regenerate slug if name changed
      if (name !== restaurant.name) {
        let baseSlug = name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        
        // Check if slug already exists for another restaurant
        let slug = baseSlug;
        const existingBySlug = await Restaurant.findOne({ slug: baseSlug, _id: { $ne: restaurantId } });
        if (existingBySlug) {
          let counter = 1;
          let uniqueSlug = `${baseSlug}-${counter}`;
          while (await Restaurant.findOne({ slug: uniqueSlug, _id: { $ne: restaurantId } })) {
            counter++;
            uniqueSlug = `${baseSlug}-${counter}`;
          }
          slug = uniqueSlug;
        }
        updateData.slug = slug;
      }
    }

    // Update cuisines if provided
    if (cuisines !== undefined) {
      updateData.cuisines = cuisines;
    }

    // Update location if provided
    if (location) {
      updateData.location = location;
    }

    // Update owner details if provided
    if (ownerName !== undefined) {
      updateData.ownerName = ownerName;
    }
    if (ownerEmail !== undefined) {
      updateData.ownerEmail = ownerEmail;
    }
    if (ownerPhone !== undefined) {
      updateData.ownerPhone = ownerPhone;
    }

    // Update restaurant
    Object.assign(restaurant, updateData);
    await restaurant.save();

    return successResponse(res, 200, 'Restaurant profile updated successfully', {
      restaurant: {
        id: restaurant._id,
        restaurantId: restaurant.restaurantId,
        name: restaurant.name,
        slug: restaurant.slug,
        profileImage: restaurant.profileImage,
        menuImages: restaurant.menuImages,
        cuisines: restaurant.cuisines,
        location: restaurant.location,
        ownerName: restaurant.ownerName,
        ownerEmail: restaurant.ownerEmail,
        ownerPhone: restaurant.ownerPhone,
      }
    });
  } catch (error) {
    console.error('Error updating restaurant profile:', error);
    return errorResponse(res, 500, 'Failed to update restaurant profile');
  }
});

/**
 * Upload restaurant profile image
 * POST /api/restaurant/profile/image
 */
export const uploadProfileImage = asyncHandler(async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 400, 'No image file provided');
    }

    const restaurantId = req.restaurant._id;
    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      return errorResponse(res, 404, 'Restaurant not found');
    }

    // Upload to Cloudinary
    const folder = 'appzeto/restaurant/profile';
    const result = await uploadToCloudinary(req.file.buffer, {
      folder,
      resource_type: 'image',
      transformation: [
        { width: 800, height: 800, crop: 'fill', gravity: 'auto' },
        { quality: 'auto' }
      ]
    });

    // Update restaurant profile image
    restaurant.profileImage = {
      url: result.secure_url,
      publicId: result.public_id
    };
    await restaurant.save();

    return successResponse(res, 200, 'Profile image uploaded successfully', {
      profileImage: restaurant.profileImage
    });
  } catch (error) {
    console.error('Error uploading profile image:', error);
    return errorResponse(res, 500, 'Failed to upload profile image');
  }
});

/**
 * Upload restaurant menu image
 * POST /api/restaurant/profile/menu-image
 */
export const uploadMenuImage = asyncHandler(async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 400, 'No image file provided');
    }

    const restaurantId = req.restaurant._id;
    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      return errorResponse(res, 404, 'Restaurant not found');
    }

    // Upload to Cloudinary
    const folder = 'appzeto/restaurant/menu';
    const result = await uploadToCloudinary(req.file.buffer, {
      folder,
      resource_type: 'image',
      transformation: [
        { width: 1200, height: 800, crop: 'fill', gravity: 'auto' },
        { quality: 'auto' }
      ]
    });

    // Replace first menu image (main banner) or add if none exists
    if (!restaurant.menuImages) {
      restaurant.menuImages = [];
    }
    
    // Replace the first menu image (main banner) instead of adding a new one
    const newMenuImage = {
      url: result.secure_url,
      publicId: result.public_id
    };
    
    if (restaurant.menuImages.length > 0) {
      // Replace the first image (main banner)
      restaurant.menuImages[0] = newMenuImage;
    } else {
      // Add as first image if array is empty
      restaurant.menuImages.push(newMenuImage);
    }
    
    await restaurant.save();

    return successResponse(res, 200, 'Menu image uploaded successfully', {
      menuImage: {
        url: result.secure_url,
        publicId: result.public_id
      },
      menuImages: restaurant.menuImages
    });
  } catch (error) {
    console.error('Error uploading menu image:', error);
    return errorResponse(res, 500, 'Failed to upload menu image');
  }
});

/**
 * Update restaurant delivery status (isAcceptingOrders)
 * PUT /api/restaurant/delivery-status
 */
export const updateDeliveryStatus = asyncHandler(async (req, res) => {
  try {
    const restaurantId = req.restaurant._id;
    const { isAcceptingOrders } = req.body;

    if (typeof isAcceptingOrders !== 'boolean') {
      return errorResponse(res, 400, 'isAcceptingOrders must be a boolean value');
    }

    const restaurant = await Restaurant.findByIdAndUpdate(
      restaurantId,
      { isAcceptingOrders },
      { new: true }
    ).select('-password');

    if (!restaurant) {
      return errorResponse(res, 404, 'Restaurant not found');
    }

    return successResponse(res, 200, 'Delivery status updated successfully', {
      restaurant: {
        id: restaurant._id,
        isAcceptingOrders: restaurant.isAcceptingOrders
      }
    });
  } catch (error) {
    console.error('Error updating delivery status:', error);
    return errorResponse(res, 500, 'Failed to update delivery status');
  }
});

/**
 * Delete restaurant account
 * DELETE /api/restaurant/profile
 */
export const deleteRestaurantAccount = asyncHandler(async (req, res) => {
  try {
    const restaurantId = req.restaurant._id;
    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      return errorResponse(res, 404, 'Restaurant not found');
    }

    // Delete Cloudinary images if they exist
    try {
      // Delete profile image
      if (restaurant.profileImage?.publicId) {
        try {
          await deleteFromCloudinary(restaurant.profileImage.publicId);
        } catch (error) {
          console.error('Error deleting profile image from Cloudinary:', error);
          // Continue with account deletion even if image deletion fails
        }
      }

      // Delete menu images
      if (restaurant.menuImages && Array.isArray(restaurant.menuImages)) {
        for (const menuImage of restaurant.menuImages) {
          if (menuImage?.publicId) {
            try {
              await deleteFromCloudinary(menuImage.publicId);
            } catch (error) {
              console.error('Error deleting menu image from Cloudinary:', error);
              // Continue with account deletion even if image deletion fails
            }
          }
        }
      }
    } catch (error) {
      console.error('Error deleting images from Cloudinary:', error);
      // Continue with account deletion even if image deletion fails
    }

    // Delete the restaurant from database
    await Restaurant.findByIdAndDelete(restaurantId);

    console.log(`Restaurant account deleted: ${restaurantId}`, { 
      restaurantId: restaurant.restaurantId,
      name: restaurant.name 
    });

    return successResponse(res, 200, 'Restaurant account deleted successfully');
  } catch (error) {
    console.error('Error deleting restaurant account:', error);
    return errorResponse(res, 500, 'Failed to delete restaurant account');
  }
});

