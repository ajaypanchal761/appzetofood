import { asyncHandler } from '../../../shared/middleware/asyncHandler.js';
import { successResponse, errorResponse } from '../../../shared/utils/response.js';
import Delivery from '../models/Delivery.js';
import { validate } from '../../../shared/middleware/validate.js';
import Joi from 'joi';
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
 * Update Delivery Partner Location
 * POST /api/delivery/location
 */
const updateLocationSchema = Joi.object({
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
  isOnline: Joi.boolean().optional()
});

export const updateLocation = asyncHandler(async (req, res) => {
  try {
    const delivery = req.delivery;
    const { latitude, longitude, isOnline } = req.body;

    // Validate input
    const { error } = updateLocationSchema.validate({ latitude, longitude, isOnline });
    if (error) {
      return errorResponse(res, 400, error.details[0].message);
    }

    // Update location
    const updateData = {
      'availability.currentLocation': {
        type: 'Point',
        coordinates: [longitude, latitude] // MongoDB uses [longitude, latitude]
      },
      'availability.lastLocationUpdate': new Date()
    };

    // Update online status if provided
    if (typeof isOnline === 'boolean') {
      updateData['availability.isOnline'] = isOnline;
    }

    const updatedDelivery = await Delivery.findByIdAndUpdate(
      delivery._id,
      { $set: updateData },
      { new: true }
    ).select('-password -refreshToken');

    if (!updatedDelivery) {
      return errorResponse(res, 404, 'Delivery partner not found');
    }

    return successResponse(res, 200, 'Location updated successfully', {
      location: {
        latitude,
        longitude,
        isOnline: updatedDelivery.availability?.isOnline || false,
        lastUpdate: updatedDelivery.availability?.lastLocationUpdate
      }
    });
  } catch (error) {
    logger.error(`Error updating delivery location: ${error.message}`);
    return errorResponse(res, 500, 'Failed to update location');
  }
});

/**
 * Get Delivery Partner Current Location
 * GET /api/delivery/location
 */
export const getLocation = asyncHandler(async (req, res) => {
  try {
    const delivery = req.delivery;

    const deliveryData = await Delivery.findById(delivery._id)
      .select('availability')
      .lean();

    if (!deliveryData) {
      return errorResponse(res, 404, 'Delivery partner not found');
    }

    const location = deliveryData.availability?.currentLocation;
    
    return successResponse(res, 200, 'Location retrieved successfully', {
      location: location ? {
        latitude: location.coordinates[1],
        longitude: location.coordinates[0],
        isOnline: deliveryData.availability?.isOnline || false,
        lastUpdate: deliveryData.availability?.lastLocationUpdate
      } : null
    });
  } catch (error) {
    logger.error(`Error fetching delivery location: ${error.message}`);
    return errorResponse(res, 500, 'Failed to fetch location');
  }
});

