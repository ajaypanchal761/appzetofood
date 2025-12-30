import { asyncHandler } from '../../../shared/middleware/asyncHandler.js';
import { successResponse, errorResponse } from '../../../shared/utils/response.js';
import User from '../../auth/models/User.js';
import { uploadToCloudinary } from '../../../shared/utils/cloudinaryService.js';
import axios from 'axios';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

/**
 * Get user profile
 * GET /api/user/profile
 */
export const getUserProfile = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .lean();

    if (!user) {
      return errorResponse(res, 404, 'User profile not found');
    }

    return successResponse(res, 200, 'User profile retrieved successfully', {
      user
    });
  } catch (error) {
    logger.error(`Error fetching user profile: ${error.message}`);
    return errorResponse(res, 500, 'Failed to fetch user profile');
  }
});

/**
 * Update user profile
 * PUT /api/user/profile
 */
export const updateUserProfile = asyncHandler(async (req, res) => {
  try {
    const { name, email, phone, dateOfBirth, anniversary, gender } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return errorResponse(res, 404, 'User profile not found');
    }

    // Update fields
    if (name !== undefined && name !== null) {
      user.name = name.trim();
    }
    
    if (email !== undefined && email !== null && email.trim() !== '') {
      // Check if email already exists for another user
      const existingUser = await User.findOne({ 
        email: email.toLowerCase().trim(),
        _id: { $ne: user._id },
        role: 'user'
      });
      
      if (existingUser) {
        return errorResponse(res, 400, 'Email already in use');
      }
      
      user.email = email.toLowerCase().trim();
    }
    
    if (phone !== undefined && phone !== null) {
      // Check if phone already exists for another user
      if (phone.trim() !== '') {
        const existingUser = await User.findOne({ 
          phone: phone.trim(),
          _id: { $ne: user._id },
          role: 'user'
        });
        
        if (existingUser) {
          return errorResponse(res, 400, 'Phone number already in use');
        }
      }
      
      user.phone = phone ? phone.trim() : null;
    }

    // Update additional profile fields (if they exist in schema)
    if (dateOfBirth !== undefined) {
      user.dateOfBirth = dateOfBirth || null;
    }

    if (anniversary !== undefined) {
      user.anniversary = anniversary || null;
    }

    if (gender !== undefined) {
      user.gender = gender || null;
    }

    // Save to database
    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    logger.info(`User profile updated: ${user._id}`, {
      updatedFields: { name, email, phone, dateOfBirth, anniversary, gender }
    });

    return successResponse(res, 200, 'Profile updated successfully', {
      user: userResponse
    });
  } catch (error) {
    logger.error(`Error updating user profile: ${error.message}`, { error: error.stack });
    return errorResponse(res, 500, 'Failed to update profile');
  }
});

/**
 * Upload profile image
 * POST /api/user/profile/avatar
 */
export const uploadProfileImage = asyncHandler(async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 400, 'No image file provided');
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    // Upload to Cloudinary
    const folder = 'appzeto/user-profiles';
    const result = await uploadToCloudinary(req.file.buffer, {
      folder,
      resource_type: 'image',
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto' }
      ]
    });

    // Update user profile image
    user.profileImage = result.secure_url;
    await user.save();

    logger.info(`Profile image uploaded for user: ${user._id}`, {
      imageUrl: result.secure_url
    });

    return successResponse(res, 200, 'Profile image uploaded successfully', {
      profileImage: result.secure_url,
      publicId: result.public_id
    });
  } catch (error) {
    logger.error(`Error uploading profile image: ${error.message}`, { error: error.stack });
    return errorResponse(res, 500, 'Failed to upload profile image');
  }
});

/**
 * Update user current location
 * PUT /api/user/location
 */
export const updateUserLocation = asyncHandler(async (req, res) => {
  try {
    const { latitude, longitude, address, city, state, area, formattedAddress } = req.body;

    if (!latitude || !longitude) {
      return errorResponse(res, 400, 'Latitude and longitude are required');
    }

    const latNum = parseFloat(latitude);
    const lngNum = parseFloat(longitude);

    if (isNaN(latNum) || isNaN(lngNum)) {
      return errorResponse(res, 400, 'Invalid latitude or longitude');
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    // Update current location
    user.currentLocation = {
      latitude: latNum,
      longitude: lngNum,
      address: address || user.currentLocation?.address || '',
      city: city || user.currentLocation?.city || '',
      state: state || user.currentLocation?.state || '',
      area: area || user.currentLocation?.area || '',
      formattedAddress: formattedAddress || user.currentLocation?.formattedAddress || '',
      lastUpdated: new Date(),
      location: {
        type: 'Point',
        coordinates: [lngNum, latNum] // [longitude, latitude] for GeoJSON
      }
    };

    await user.save();

    logger.info(`User location updated: ${user._id}`, {
      latitude: latNum,
      longitude: lngNum,
      city: user.currentLocation.city
    });

    const userResponse = user.toObject();
    delete userResponse.password;

    return successResponse(res, 200, 'Location updated successfully', {
      user: userResponse,
      location: user.currentLocation
    });
  } catch (error) {
    logger.error(`Error updating user location: ${error.message}`, { error: error.stack });
    return errorResponse(res, 500, 'Failed to update location');
  }
});

/**
 * Get user current location
 * GET /api/user/location
 */
export const getUserLocation = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('currentLocation')
      .lean();

    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    return successResponse(res, 200, 'Location retrieved successfully', {
      location: user.currentLocation || null
    });
  } catch (error) {
    logger.error(`Error fetching user location: ${error.message}`);
    return errorResponse(res, 500, 'Failed to fetch location');
  }
});

