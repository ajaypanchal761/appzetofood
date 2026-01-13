import Zone from '../models/Zone.js';
import { successResponse, errorResponse } from '../../../shared/utils/response.js';
import asyncHandler from '../../../shared/middleware/asyncHandler.js';
import mongoose from 'mongoose';

/**
 * Get all zones
 * GET /api/admin/zones
 */
export const getZones = asyncHandler(async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50,
      search,
      restaurantId,
      isActive
    } = req.query;

    // Build query
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { serviceLocation: { $regex: search, $options: 'i' } }
      ];
    }

    if (restaurantId) {
      query.restaurantId = new mongoose.Types.ObjectId(restaurantId);
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch zones with restaurant details
    const zones = await Zone.find(query)
      .populate('restaurantId', 'name email phone')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    // Get total count
    const total = await Zone.countDocuments(query);

    return successResponse(res, 200, 'Zones retrieved successfully', {
      zones,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching zones:', error);
    return errorResponse(res, 500, 'Failed to fetch zones');
  }
});

/**
 * Get zone by ID
 * GET /api/admin/zones/:id
 */
export const getZoneById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const zone = await Zone.findById(id)
      .populate('restaurantId', 'name email phone')
      .populate('createdBy', 'name email')
      .lean();

    if (!zone) {
      return errorResponse(res, 404, 'Zone not found');
    }

    return successResponse(res, 200, 'Zone retrieved successfully', {
      zone
    });
  } catch (error) {
    console.error('Error fetching zone:', error);
    return errorResponse(res, 500, 'Failed to fetch zone');
  }
});

/**
 * Create new zone
 * POST /api/admin/zones
 */
export const createZone = asyncHandler(async (req, res) => {
  try {
    const {
      name,
      serviceLocation,
      restaurantId,
      unit,
      coordinates,
      peakZoneRideCount,
      peakZoneRadius,
      peakZoneSelectionDuration,
      peakZoneDuration,
      peakZoneSurgePercentage,
      isActive
    } = req.body;

    // Validation
    if (!name || !serviceLocation || !restaurantId || !coordinates) {
      return errorResponse(res, 400, 'Name, service location, restaurant ID, and coordinates are required');
    }

    if (!Array.isArray(coordinates) || coordinates.length < 3) {
      return errorResponse(res, 400, 'Zone must have at least 3 coordinates');
    }

    // Validate coordinates
    for (const coord of coordinates) {
      if (!coord.latitude || !coord.longitude) {
        return errorResponse(res, 400, 'Each coordinate must have latitude and longitude');
      }
      if (coord.latitude < -90 || coord.latitude > 90) {
        return errorResponse(res, 400, 'Invalid latitude value');
      }
      if (coord.longitude < -180 || coord.longitude > 180) {
        return errorResponse(res, 400, 'Invalid longitude value');
      }
    }

    // Check if restaurant exists
    const Restaurant = mongoose.model('Restaurant');
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return errorResponse(res, 404, 'Restaurant not found');
    }

    // Create zone
    const zoneData = {
      name,
      serviceLocation,
      restaurantId: new mongoose.Types.ObjectId(restaurantId),
      unit: unit || 'kilometer',
      coordinates,
      peakZoneRideCount: peakZoneRideCount || 0,
      peakZoneRadius: peakZoneRadius || 0,
      peakZoneSelectionDuration: peakZoneSelectionDuration || 0,
      peakZoneDuration: peakZoneDuration || 0,
      peakZoneSurgePercentage: peakZoneSurgePercentage || 0,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.admin?._id || null
    };

    const zone = new Zone(zoneData);
    await zone.save();

    // Populate before returning
    await zone.populate('restaurantId', 'name email phone');
    if (zone.createdBy) {
      await zone.populate('createdBy', 'name email');
    }

    return successResponse(res, 201, 'Zone created successfully', {
      zone
    });
  } catch (error) {
    console.error('Error creating zone:', error);
    if (error.name === 'ValidationError') {
      return errorResponse(res, 400, error.message);
    }
    return errorResponse(res, 500, 'Failed to create zone');
  }
});

/**
 * Update zone
 * PUT /api/admin/zones/:id
 */
export const updateZone = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const zone = await Zone.findById(id);
    if (!zone) {
      return errorResponse(res, 404, 'Zone not found');
    }

    // If coordinates are being updated, validate them
    if (updateData.coordinates) {
      if (!Array.isArray(updateData.coordinates) || updateData.coordinates.length < 3) {
        return errorResponse(res, 400, 'Zone must have at least 3 coordinates');
      }

      // Validate coordinates
      for (const coord of updateData.coordinates) {
        if (!coord.latitude || !coord.longitude) {
          return errorResponse(res, 400, 'Each coordinate must have latitude and longitude');
        }
      }
    }

    // Update zone
    Object.assign(zone, updateData);
    await zone.save();

    // Populate before returning
    await zone.populate('restaurantId', 'name email phone');
    if (zone.createdBy) {
      await zone.populate('createdBy', 'name email');
    }

    return successResponse(res, 200, 'Zone updated successfully', {
      zone
    });
  } catch (error) {
    console.error('Error updating zone:', error);
    if (error.name === 'ValidationError') {
      return errorResponse(res, 400, error.message);
    }
    return errorResponse(res, 500, 'Failed to update zone');
  }
});

/**
 * Delete zone
 * DELETE /api/admin/zones/:id
 */
export const deleteZone = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const zone = await Zone.findByIdAndDelete(id);
    if (!zone) {
      return errorResponse(res, 404, 'Zone not found');
    }

    return successResponse(res, 200, 'Zone deleted successfully');
  } catch (error) {
    console.error('Error deleting zone:', error);
    return errorResponse(res, 500, 'Failed to delete zone');
  }
});

/**
 * Toggle zone status
 * PATCH /api/admin/zones/:id/status
 */
export const toggleZoneStatus = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const zone = await Zone.findById(id);
    if (!zone) {
      return errorResponse(res, 404, 'Zone not found');
    }

    zone.isActive = !zone.isActive;
    await zone.save();

    return successResponse(res, 200, `Zone ${zone.isActive ? 'activated' : 'deactivated'} successfully`, {
      zone
    });
  } catch (error) {
    console.error('Error toggling zone status:', error);
    return errorResponse(res, 500, 'Failed to toggle zone status');
  }
});

/**
 * Get zones by restaurant ID
 * GET /api/admin/zones/restaurant/:restaurantId
 */
export const getZonesByRestaurant = asyncHandler(async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const zones = await Zone.find({ 
      restaurantId: new mongoose.Types.ObjectId(restaurantId),
      isActive: true 
    })
      .populate('restaurantId', 'name email phone')
      .sort({ createdAt: -1 })
      .lean();

    return successResponse(res, 200, 'Zones retrieved successfully', {
      zones
    });
  } catch (error) {
    console.error('Error fetching zones by restaurant:', error);
    return errorResponse(res, 500, 'Failed to fetch zones');
  }
});

/**
 * Check if a location is within any zone for a restaurant
 * POST /api/admin/zones/check-location
 */
export const checkLocationInZone = asyncHandler(async (req, res) => {
  try {
    const { latitude, longitude, restaurantId } = req.body;

    if (!latitude || !longitude || !restaurantId) {
      return errorResponse(res, 400, 'Latitude, longitude, and restaurant ID are required');
    }

    // Find zones for the restaurant
    const zones = await Zone.find({
      restaurantId: new mongoose.Types.ObjectId(restaurantId),
      isActive: true
    });

    // Check if point is within any zone using GeoJSON
    const point = {
      type: 'Point',
      coordinates: [parseFloat(longitude), parseFloat(latitude)]
    };

    const matchingZones = zones.filter(zone => {
      if (!zone.boundary || !zone.boundary.coordinates) {
        return false;
      }
      // Use MongoDB's $geoWithin for accurate spatial query
      // For now, use the method we defined
      return zone.containsPoint(parseFloat(latitude), parseFloat(longitude));
    });

    return successResponse(res, 200, 'Location check completed', {
      isInZone: matchingZones.length > 0,
      zones: matchingZones.map(zone => ({
        _id: zone._id,
        name: zone.name,
        serviceLocation: zone.serviceLocation
      }))
    });
  } catch (error) {
    console.error('Error checking location in zone:', error);
    return errorResponse(res, 500, 'Failed to check location');
  }
});

