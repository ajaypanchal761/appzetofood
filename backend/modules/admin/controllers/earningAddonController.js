import { asyncHandler } from '../../../shared/middleware/asyncHandler.js';
import { successResponse, errorResponse } from '../../../shared/utils/response.js';
import EarningAddon from '../models/EarningAddon.js';
import EarningAddonHistory from '../models/EarningAddonHistory.js';
import Delivery from '../../delivery/models/Delivery.js';
import DeliveryWallet from '../../delivery/models/DeliveryWallet.js';
import Order from '../../order/models/Order.js';
import mongoose from 'mongoose';
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
 * Create Earning Addon Offer
 * POST /api/admin/earning-addon
 */
export const createEarningAddon = asyncHandler(async (req, res) => {
  try {
    const {
      title,
      description,
      requiredOrders,
      earningAmount,
      startDate,
      endDate,
      maxRedemptions,
      applicableZones,
      minDeliveryRating,
      metadata
    } = req.body;

    const adminId = req.user?._id || req.user?.id;

    // Validation
    if (!title || !title.trim()) {
      return errorResponse(res, 400, 'Title is required');
    }

    if (!requiredOrders || requiredOrders < 1) {
      return errorResponse(res, 400, 'Required orders must be at least 1');
    }

    if (!earningAmount || earningAmount <= 0) {
      return errorResponse(res, 400, 'Earning amount must be greater than 0');
    }

    if (!startDate || !endDate) {
      return errorResponse(res, 400, 'Start date and end date are required');
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    // Validate dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return errorResponse(res, 400, 'Invalid date format');
    }

    // Start date should be today or future
    const today = new Date(now.setHours(0, 0, 0, 0));
    if (start < today) {
      return errorResponse(res, 400, 'Start date must be today or in the future');
    }

    // End date must be after start date
    if (end <= start) {
      return errorResponse(res, 400, 'End date must be after start date');
    }

    // Create earning addon
    const earningAddon = await EarningAddon.create({
      title: title.trim(),
      description: description?.trim(),
      requiredOrders: parseInt(requiredOrders),
      earningAmount: parseFloat(earningAmount),
      startDate: start,
      endDate: end,
      maxRedemptions: maxRedemptions ? parseInt(maxRedemptions) : null,
      applicableZones: applicableZones || [],
      minDeliveryRating: minDeliveryRating ? parseFloat(minDeliveryRating) : 0,
      createdBy: adminId,
      metadata: metadata || {},
      status: start > now ? 'inactive' : 'active'
    });

    logger.info(`Earning addon created: ${earningAddon._id} by admin ${adminId}`);

    return successResponse(res, 201, 'Earning addon created successfully', {
      earningAddon
    });
  } catch (error) {
    logger.error(`Error creating earning addon: ${error.message}`, { error: error.stack });
    return errorResponse(res, 500, `Failed to create earning addon: ${error.message}`);
  }
});

/**
 * Get All Earning Addons
 * GET /api/admin/earning-addon
 */
export const getEarningAddons = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } }
      ];
      // Add description to search if it exists in schema
      const descriptionField = EarningAddon.schema.path('description');
      if (descriptionField) {
        query.$or.push({ description: { $regex: search, $options: 'i' } });
      }
    }

    // Sort
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Check if model exists
    if (!EarningAddon) {
      logger.error('EarningAddon model is not defined');
      return errorResponse(res, 500, 'EarningAddon model not found');
    }

    const [earningAddons, total] = await Promise.all([
      EarningAddon.find(query)
        .populate('createdBy', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      EarningAddon.countDocuments(query)
    ]);
    
    // Populate zones separately if they exist (optional)
    if (earningAddons.length > 0) {
      try {
        // Check if Zone model exists
        if (mongoose.models.Zone) {
          await EarningAddon.populate(earningAddons, {
            path: 'applicableZones',
            select: 'name',
            model: 'Zone'
          });
        }
      } catch (zoneError) {
        // Zone model doesn't exist or populate failed, continue without zones
        logger.debug('Zone populate skipped:', zoneError.message);
      }
    }

    // Check validity for each addon
    const now = new Date();
    const addonsWithValidity = earningAddons.map(addon => {
      const isValid = addon.status === 'active' &&
        now >= new Date(addon.startDate) &&
        now <= new Date(addon.endDate) &&
        (addon.maxRedemptions === null || addon.currentRedemptions < addon.maxRedemptions);
      
      return {
        ...addon,
        isValid
      };
    });

    return successResponse(res, 200, 'Earning addons retrieved successfully', {
      earningAddons: addonsWithValidity,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error(`Error fetching earning addons: ${error.message}`, { 
      error: error.stack,
      name: error.name,
      code: error.code
    });
    return errorResponse(res, 500, `Failed to fetch earning addons: ${error.message}`);
  }
});

/**
 * Get Earning Addon by ID
 * GET /api/admin/earning-addon/:id
 */
export const getEarningAddonById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 400, 'Invalid earning addon ID');
    }

    const earningAddon = await EarningAddon.findById(id)
      .populate('createdBy', 'name email')
      .populate('applicableZones', 'name')
      .lean();

    if (!earningAddon) {
      return errorResponse(res, 404, 'Earning addon not found');
    }

    // Check validity
    const now = new Date();
    const isValid = earningAddon.status === 'active' &&
      now >= new Date(earningAddon.startDate) &&
      now <= new Date(earningAddon.endDate) &&
      (earningAddon.maxRedemptions === null || earningAddon.currentRedemptions < earningAddon.maxRedemptions);

    // Get completion statistics
    const [totalCompletions, pendingCompletions, creditedCompletions] = await Promise.all([
      EarningAddonHistory.countDocuments({ earningAddonId: id }),
      EarningAddonHistory.countDocuments({ earningAddonId: id, status: 'pending' }),
      EarningAddonHistory.countDocuments({ earningAddonId: id, status: 'credited' })
    ]);

    return successResponse(res, 200, 'Earning addon retrieved successfully', {
      earningAddon: {
        ...earningAddon,
        isValid
      },
      statistics: {
        totalCompletions,
        pendingCompletions,
        creditedCompletions
      }
    });
  } catch (error) {
    logger.error(`Error fetching earning addon: ${error.message}`, { error: error.stack });
    return errorResponse(res, 500, 'Failed to fetch earning addon');
  }
});

/**
 * Update Earning Addon
 * PUT /api/admin/earning-addon/:id
 */
export const updateEarningAddon = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 400, 'Invalid earning addon ID');
    }

    const earningAddon = await EarningAddon.findById(id);
    if (!earningAddon) {
      return errorResponse(res, 404, 'Earning addon not found');
    }

    // Validate dates if provided
    if (updateData.startDate || updateData.endDate) {
      const start = updateData.startDate ? new Date(updateData.startDate) : earningAddon.startDate;
      const end = updateData.endDate ? new Date(updateData.endDate) : earningAddon.endDate;

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return errorResponse(res, 400, 'Invalid date format');
      }

      if (end <= start) {
        return errorResponse(res, 400, 'End date must be after start date');
      }

      updateData.startDate = start;
      updateData.endDate = end;
    }

    // Validate numbers
    if (updateData.requiredOrders !== undefined && updateData.requiredOrders < 1) {
      return errorResponse(res, 400, 'Required orders must be at least 1');
    }

    if (updateData.earningAmount !== undefined && updateData.earningAmount <= 0) {
      return errorResponse(res, 400, 'Earning amount must be greater than 0');
    }

    // Update
    Object.assign(earningAddon, updateData);
    await earningAddon.save();

    logger.info(`Earning addon updated: ${id}`);

    return successResponse(res, 200, 'Earning addon updated successfully', {
      earningAddon
    });
  } catch (error) {
    logger.error(`Error updating earning addon: ${error.message}`, { error: error.stack });
    return errorResponse(res, 500, `Failed to update earning addon: ${error.message}`);
  }
});

/**
 * Delete Earning Addon
 * DELETE /api/admin/earning-addon/:id
 */
export const deleteEarningAddon = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 400, 'Invalid earning addon ID');
    }

    const earningAddon = await EarningAddon.findById(id);
    if (!earningAddon) {
      return errorResponse(res, 404, 'Earning addon not found');
    }

    // Check if there are any completions
    const completionsCount = await EarningAddonHistory.countDocuments({ earningAddonId: id });
    if (completionsCount > 0) {
      // Soft delete - just mark as inactive
      earningAddon.status = 'inactive';
      await earningAddon.save();
      logger.info(`Earning addon soft deleted (marked inactive): ${id}`);
      return successResponse(res, 200, 'Earning addon deactivated successfully (has completion history)');
    }

    // Hard delete if no completions
    await EarningAddon.findByIdAndDelete(id);
    logger.info(`Earning addon deleted: ${id}`);

    return successResponse(res, 200, 'Earning addon deleted successfully');
  } catch (error) {
    logger.error(`Error deleting earning addon: ${error.message}`, { error: error.stack });
    return errorResponse(res, 500, 'Failed to delete earning addon');
  }
});

/**
 * Toggle Earning Addon Status
 * PATCH /api/admin/earning-addon/:id/status
 */
export const toggleEarningAddonStatus = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 400, 'Invalid earning addon ID');
    }

    if (!['active', 'inactive'].includes(status)) {
      return errorResponse(res, 400, 'Status must be either active or inactive');
    }

    const earningAddon = await EarningAddon.findById(id);
    if (!earningAddon) {
      return errorResponse(res, 404, 'Earning addon not found');
    }

    earningAddon.status = status;
    await earningAddon.save();

    logger.info(`Earning addon status updated: ${id} to ${status}`);

    return successResponse(res, 200, 'Earning addon status updated successfully', {
      earningAddon
    });
  } catch (error) {
    logger.error(`Error updating earning addon status: ${error.message}`, { error: error.stack });
    return errorResponse(res, 500, 'Failed to update earning addon status');
  }
});

/**
 * Check and Process Earning Addon Completions
 * This should be called periodically or when an order is completed
 * POST /api/admin/earning-addon/check-completions
 */
export const checkEarningAddonCompletions = asyncHandler(async (req, res) => {
  try {
    const { deliveryPartnerId } = req.body;

    if (!deliveryPartnerId) {
      return errorResponse(res, 400, 'Delivery partner ID is required');
    }

    if (!mongoose.Types.ObjectId.isValid(deliveryPartnerId)) {
      return errorResponse(res, 400, 'Invalid delivery partner ID');
    }

    const deliveryPartner = await Delivery.findById(deliveryPartnerId);
    if (!deliveryPartner) {
      return errorResponse(res, 404, 'Delivery partner not found');
    }

    // Get active earning addons
    const now = new Date();
    const activeAddons = await EarningAddon.getActiveOffers(now);

    const completions = [];

    for (const addon of activeAddons) {
      // Check if already completed for this addon
      const existingCompletion = await EarningAddonHistory.findOne({
        earningAddonId: addon._id,
        deliveryPartnerId: deliveryPartnerId,
        status: { $in: ['pending', 'credited'] }
      });

      if (existingCompletion) {
        continue; // Already completed
      }

      // Get orders completed in the date range
      const startDate = new Date(addon.startDate);
      const endDate = new Date(addon.endDate);
      endDate.setHours(23, 59, 59, 999); // End of day

      const completedOrders = await Order.countDocuments({
        deliveryPartnerId: deliveryPartnerId,
        status: 'delivered',
        deliveredAt: {
          $gte: startDate,
          $lte: endDate
        }
      });

      // Check if requirement is met
      if (completedOrders >= addon.requiredOrders) {
        // Get order IDs
        const orders = await Order.find({
          deliveryPartnerId: deliveryPartnerId,
          status: 'delivered',
          deliveredAt: {
            $gte: startDate,
            $lte: endDate
          }
        })
        .sort({ deliveredAt: 1 })
        .limit(addon.requiredOrders)
        .select('orderId')
        .lean();

        const orderIds = orders.map(o => o.orderId);

        // Create completion record
        const completion = await EarningAddonHistory.create({
          earningAddonId: addon._id,
          deliveryPartnerId: deliveryPartnerId,
          offerSnapshot: {
            title: addon.title,
            requiredOrders: addon.requiredOrders,
            earningAmount: addon.earningAmount,
            startDate: addon.startDate,
            endDate: addon.endDate
          },
          ordersCompleted: completedOrders,
          ordersRequired: addon.requiredOrders,
          earningAmount: addon.earningAmount,
          completedAt: now,
          status: 'pending',
          contributingOrders: orderIds,
          metadata: {
            zone: deliveryPartner.availability?.zones?.[0]?.toString() || 'N/A',
            deliveryRating: deliveryPartner.metrics?.rating || 0
          }
        });

        // Increment redemption count
        addon.currentRedemptions += 1;
        await addon.save();

        completions.push(completion);
      }
    }

    return successResponse(res, 200, 'Completions checked successfully', {
      completionsFound: completions.length,
      completions
    });
  } catch (error) {
    logger.error(`Error checking earning addon completions: ${error.message}`, { error: error.stack });
    return errorResponse(res, 500, 'Failed to check completions');
  }
});

