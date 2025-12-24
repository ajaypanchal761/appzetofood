import Admin from '../models/Admin.js';
import Order from '../../order/models/Order.js';
import Restaurant from '../../restaurant/models/Restaurant.js';
import { successResponse, errorResponse } from '../../../shared/utils/response.js';
import { asyncHandler } from '../../../shared/middleware/asyncHandler.js';
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
 * Get Admin Dashboard Statistics
 * GET /api/admin/dashboard/stats
 */
export const getDashboardStats = asyncHandler(async (req, res) => {
  try {
    // Calculate date ranges
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get total revenue (sum of all completed orders)
    const revenueStats = await Order.aggregate([
      {
        $match: {
          status: 'delivered',
          'pricing.total': { $exists: true }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$pricing.total' },
          last30DaysRevenue: {
            $sum: {
              $cond: [
                { $gte: ['$createdAt', last30Days] },
                '$pricing.total',
                0
              ]
            }
          }
        }
      }
    ]);

    // Get commission earned (assuming 10% commission, adjust as needed)
    const commissionRate = 0.10;
    const revenueData = revenueStats[0] || { totalRevenue: 0, last30DaysRevenue: 0 };
    const totalCommission = revenueData.totalRevenue * commissionRate;
    const last30DaysCommission = revenueData.last30DaysRevenue * commissionRate;

    // Get order statistics
    const orderStats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const orderStatusMap = {};
    orderStats.forEach(stat => {
      orderStatusMap[stat._id] = stat.count;
    });

    // Get total orders processed
    const totalOrders = await Order.countDocuments({ status: 'delivered' });

    // Get active partners count
    const activeRestaurants = await Restaurant.countDocuments({ isActive: true });
    // Note: Delivery partners are stored in User model
    const User = (await import('../../auth/models/User.js')).default;
    const activeDeliveryPartners = await User.countDocuments({ 
      role: 'delivery', 
      isActive: true 
    });
    const activePartners = activeRestaurants + activeDeliveryPartners;

    // Get recent activity (last 24 hours)
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const recentOrders = await Order.countDocuments({
      createdAt: { $gte: last24Hours }
    });
    const recentRestaurants = await Restaurant.countDocuments({
      createdAt: { $gte: last24Hours },
      isActive: true
    });

    return successResponse(res, 200, 'Dashboard stats retrieved successfully', {
      revenue: {
        total: revenueData.totalRevenue || 0,
        last30Days: revenueData.last30DaysRevenue || 0,
        currency: 'INR'
      },
      commission: {
        total: totalCommission,
        last30Days: last30DaysCommission,
        currency: 'INR',
        rate: commissionRate * 100 // Percentage
      },
      orders: {
        total: totalOrders,
        byStatus: {
          pending: orderStatusMap.pending || 0,
          confirmed: orderStatusMap.confirmed || 0,
          preparing: orderStatusMap.preparing || 0,
          ready: orderStatusMap.ready || 0,
          out_for_delivery: orderStatusMap.out_for_delivery || 0,
          delivered: orderStatusMap.delivered || 0,
          cancelled: orderStatusMap.cancelled || 0
        }
      },
      partners: {
        total: activePartners,
        restaurants: activeRestaurants,
        delivery: activeDeliveryPartners
      },
      recentActivity: {
        orders: recentOrders,
        restaurants: recentRestaurants,
        period: 'last24Hours'
      }
    });
  } catch (error) {
    logger.error(`Error fetching dashboard stats: ${error.message}`);
    return errorResponse(res, 500, 'Failed to fetch dashboard statistics');
  }
});

/**
 * Get All Admins
 * GET /api/admin/admins
 */
export const getAdmins = asyncHandler(async (req, res) => {
  try {
    const { limit = 50, offset = 0, search } = req.query;

    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const admins = await Admin.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .lean();

    const total = await Admin.countDocuments(query);

    return successResponse(res, 200, 'Admins retrieved successfully', {
      admins,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    logger.error(`Error fetching admins: ${error.message}`);
    return errorResponse(res, 500, 'Failed to fetch admins');
  }
});

/**
 * Get Admin by ID
 * GET /api/admin/admins/:id
 */
export const getAdminById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await Admin.findById(id)
      .select('-password')
      .lean();

    if (!admin) {
      return errorResponse(res, 404, 'Admin not found');
    }

    return successResponse(res, 200, 'Admin retrieved successfully', { admin });
  } catch (error) {
    logger.error(`Error fetching admin: ${error.message}`);
    return errorResponse(res, 500, 'Failed to fetch admin');
  }
});

/**
 * Create Admin (only by existing admin)
 * POST /api/admin/admins
 */
export const createAdmin = asyncHandler(async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Validation
    if (!name || !email || !password) {
      return errorResponse(res, 400, 'Name, email, and password are required');
    }

    if (password.length < 6) {
      return errorResponse(res, 400, 'Password must be at least 6 characters long');
    }

    // Check if admin already exists with this email
    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
    if (existingAdmin) {
      return errorResponse(res, 400, 'Admin already exists with this email');
    }

    // Create new admin
    const adminData = {
      name,
      email: email.toLowerCase(),
      password,
      isActive: true,
      phoneVerified: false
    };

    if (phone) {
      adminData.phone = phone;
    }

    const admin = await Admin.create(adminData);

    // Remove password from response
    const adminResponse = admin.toObject();
    delete adminResponse.password;

    logger.info(`Admin created: ${admin._id}`, { email, createdBy: req.user._id });

    return successResponse(res, 201, 'Admin created successfully', {
      admin: adminResponse
    });
  } catch (error) {
    logger.error(`Error creating admin: ${error.message}`);
    
    if (error.code === 11000) {
      return errorResponse(res, 400, 'Admin with this email already exists');
    }
    
    return errorResponse(res, 500, 'Failed to create admin');
  }
});

/**
 * Update Admin
 * PUT /api/admin/admins/:id
 */
export const updateAdmin = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, isActive } = req.body;

    const admin = await Admin.findById(id);

    if (!admin) {
      return errorResponse(res, 404, 'Admin not found');
    }

    // Prevent updating own account's isActive status
    if (id === req.user._id.toString() && isActive === false) {
      return errorResponse(res, 400, 'You cannot deactivate your own account');
    }

    // Update fields
    if (name) admin.name = name;
    if (email) admin.email = email.toLowerCase();
    if (phone !== undefined) admin.phone = phone;
    if (isActive !== undefined) admin.isActive = isActive;

    await admin.save();

    const adminResponse = admin.toObject();
    delete adminResponse.password;

    logger.info(`Admin updated: ${id}`, { updatedBy: req.user._id });

    return successResponse(res, 200, 'Admin updated successfully', {
      admin: adminResponse
    });
  } catch (error) {
    logger.error(`Error updating admin: ${error.message}`);
    
    if (error.code === 11000) {
      return errorResponse(res, 400, 'Admin with this email already exists');
    }
    
    return errorResponse(res, 500, 'Failed to update admin');
  }
});

/**
 * Delete Admin
 * DELETE /api/admin/admins/:id
 */
export const deleteAdmin = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting own account
    if (id === req.user._id.toString()) {
      return errorResponse(res, 400, 'You cannot delete your own account');
    }

    const admin = await Admin.findById(id);

    if (!admin) {
      return errorResponse(res, 404, 'Admin not found');
    }

    await Admin.deleteOne({ _id: id });

    logger.info(`Admin deleted: ${id}`, { deletedBy: req.user._id });

    return successResponse(res, 200, 'Admin deleted successfully');
  } catch (error) {
    logger.error(`Error deleting admin: ${error.message}`);
    return errorResponse(res, 500, 'Failed to delete admin');
  }
});

/**
 * Get Current Admin Profile
 * GET /api/admin/profile
 */
export const getAdminProfile = asyncHandler(async (req, res) => {
  try {
    const admin = await Admin.findById(req.user._id)
      .select('-password')
      .lean();

    if (!admin) {
      return errorResponse(res, 404, 'Admin profile not found');
    }

    return successResponse(res, 200, 'Admin profile retrieved successfully', {
      admin
    });
  } catch (error) {
    logger.error(`Error fetching admin profile: ${error.message}`);
    return errorResponse(res, 500, 'Failed to fetch admin profile');
  }
});

/**
 * Update Current Admin Profile
 * PUT /api/admin/profile
 */
export const updateAdminProfile = asyncHandler(async (req, res) => {
  try {
    const { name, phone, profileImage } = req.body;

    const admin = await Admin.findById(req.user._id);

    if (!admin) {
      return errorResponse(res, 404, 'Admin profile not found');
    }

    // Update fields (email cannot be changed via profile update)
    if (name !== undefined && name !== null) {
      admin.name = name.trim();
    }
    
    if (phone !== undefined) {
      // Allow empty string to clear phone number
      admin.phone = phone ? phone.trim() : null;
    }
    
    if (profileImage !== undefined) {
      // Allow empty string to clear profile image
      admin.profileImage = profileImage || null;
    }

    // Save to database
    await admin.save();

    // Remove password from response
    const adminResponse = admin.toObject();
    delete adminResponse.password;

    logger.info(`Admin profile updated: ${admin._id}`, {
      updatedFields: { name, phone, profileImage: profileImage ? 'updated' : 'not changed' }
    });

    return successResponse(res, 200, 'Profile updated successfully', {
      admin: adminResponse
    });
  } catch (error) {
    logger.error(`Error updating admin profile: ${error.message}`, { error: error.stack });
    return errorResponse(res, 500, 'Failed to update profile');
  }
});

/**
 * Change Admin Password
 * PUT /api/admin/settings/change-password
 */
export const changeAdminPassword = asyncHandler(async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword) {
      return errorResponse(res, 400, 'Current password and new password are required');
    }

    if (newPassword.length < 6) {
      return errorResponse(res, 400, 'New password must be at least 6 characters long');
    }

    // Get admin with password field
    const admin = await Admin.findById(req.user._id).select('+password');

    if (!admin) {
      return errorResponse(res, 404, 'Admin not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await admin.comparePassword(currentPassword);

    if (!isCurrentPasswordValid) {
      return errorResponse(res, 401, 'Current password is incorrect');
    }

    // Check if new password is same as current
    const isSamePassword = await admin.comparePassword(newPassword);
    if (isSamePassword) {
      return errorResponse(res, 400, 'New password must be different from current password');
    }

    // Update password (pre-save hook will hash it)
    admin.password = newPassword;
    await admin.save();

    logger.info(`Admin password changed: ${admin._id}`);

    return successResponse(res, 200, 'Password changed successfully');
  } catch (error) {
    logger.error(`Error changing admin password: ${error.message}`, { error: error.stack });
    return errorResponse(res, 500, 'Failed to change password');
  }
});

