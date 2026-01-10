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

/**
 * Get All Users (Customers) with Order Statistics
 * GET /api/admin/users
 */
export const getUsers = asyncHandler(async (req, res) => {
  try {
    const { limit = 100, offset = 0, search, status, sortBy, orderDate, joiningDate } = req.query;
    const User = (await import('../../auth/models/User.js')).default;

    // Build query
    const query = { role: 'user' }; // Only get users, not restaurants/delivery/admins
    
    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    // Status filter
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    // Joining date filter
    if (joiningDate) {
      const startDate = new Date(joiningDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(joiningDate);
      endDate.setHours(23, 59, 59, 999);
      query.createdAt = { $gte: startDate, $lte: endDate };
    }

    // Get users
    const users = await User.find(query)
      .select('-password -__v')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .lean();

    // Get user IDs
    const userIds = users.map(user => user._id);

    // Get order statistics for each user
    const orderStats = await Order.aggregate([
      {
        $match: {
          userId: { $in: userIds }
        }
      },
      {
        $group: {
          _id: '$userId',
          totalOrders: { $sum: 1 },
          totalAmount: { $sum: '$pricing.total' }
        }
      }
    ]);

    // Create a map of userId -> stats
    const statsMap = {};
    orderStats.forEach(stat => {
      statsMap[stat._id.toString()] = {
        totalOrder: stat.totalOrders || 0,
        totalOrderAmount: stat.totalAmount || 0
      };
    });

    // Format users with order statistics
    const formattedUsers = users.map((user, index) => {
      const stats = statsMap[user._id.toString()] || { totalOrder: 0, totalOrderAmount: 0 };
      
      // Format joining date
      const joiningDate = new Date(user.createdAt);
      const formattedDate = joiningDate.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });

      return {
        sl: parseInt(offset) + index + 1,
        id: user._id.toString(),
        name: user.name || 'N/A',
        email: user.email || 'N/A',
        phone: user.phone || 'N/A',
        totalOrder: stats.totalOrder,
        totalOrderAmount: stats.totalOrderAmount,
        joiningDate: formattedDate,
        status: user.isActive !== false, // Default to true if not set
        createdAt: user.createdAt
      };
    });

    // Apply sorting
    if (sortBy) {
      if (sortBy === 'name-asc') {
        formattedUsers.sort((a, b) => a.name.localeCompare(b.name));
      } else if (sortBy === 'name-desc') {
        formattedUsers.sort((a, b) => b.name.localeCompare(a.name));
      } else if (sortBy === 'orders-asc') {
        formattedUsers.sort((a, b) => a.totalOrder - b.totalOrder);
      } else if (sortBy === 'orders-desc') {
        formattedUsers.sort((a, b) => b.totalOrder - a.totalOrder);
      }
    }

    // Order date filter (filter by order date after aggregation)
    let filteredUsers = formattedUsers;
    if (orderDate) {
      // This would require additional query to filter by order date
      // For now, we'll skip this as it's complex and may require different approach
    }

    const total = await User.countDocuments(query);

    return successResponse(res, 200, 'Users retrieved successfully', {
      users: filteredUsers,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    logger.error(`Error fetching users: ${error.message}`, { error: error.stack });
    return errorResponse(res, 500, 'Failed to fetch users');
  }
});

/**
 * Get User by ID with Full Details
 * GET /api/admin/users/:id
 */
export const getUserById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const User = (await import('../../auth/models/User.js')).default;

    const user = await User.findById(id)
      .select('-password -__v')
      .lean();

    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    // Get order statistics
    const orderStats = await Order.aggregate([
      {
        $match: { userId: user._id }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalAmount: { $sum: '$pricing.total' },
          orders: {
            $push: {
              orderId: '$orderId',
              status: '$status',
              total: '$pricing.total',
              createdAt: '$createdAt',
              restaurantName: '$restaurantName'
            }
          }
        }
      }
    ]);

    const stats = orderStats[0] || { totalOrders: 0, totalAmount: 0, orders: [] };

    // Format joining date
    const joiningDate = new Date(user.createdAt);
    const formattedDate = joiningDate.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    return successResponse(res, 200, 'User retrieved successfully', {
      user: {
        id: user._id.toString(),
        name: user.name || 'N/A',
        email: user.email || 'N/A',
        phone: user.phone || 'N/A',
        phoneVerified: user.phoneVerified || false,
        profileImage: user.profileImage || null,
        role: user.role,
        signupMethod: user.signupMethod,
        isActive: user.isActive !== false,
        addresses: user.addresses || [],
        preferences: user.preferences || {},
        wallet: user.wallet || {},
        dateOfBirth: user.dateOfBirth || null,
        anniversary: user.anniversary || null,
        gender: user.gender || null,
        joiningDate: formattedDate,
        createdAt: user.createdAt,
        totalOrders: stats.totalOrders,
        totalOrderAmount: stats.totalAmount,
        orders: stats.orders.slice(0, 10) // Last 10 orders
      }
    });
  } catch (error) {
    logger.error(`Error fetching user: ${error.message}`, { error: error.stack });
    return errorResponse(res, 500, 'Failed to fetch user');
  }
});

/**
 * Update User Status (Active/Inactive)
 * PUT /api/admin/users/:id/status
 */
export const updateUserStatus = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const User = (await import('../../auth/models/User.js')).default;

    if (typeof isActive !== 'boolean') {
      return errorResponse(res, 400, 'isActive must be a boolean value');
    }

    const user = await User.findById(id);

    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    user.isActive = isActive;
    await user.save();

    logger.info(`User status updated: ${id}`, {
      isActive,
      updatedBy: req.user._id
    });

    return successResponse(res, 200, 'User status updated successfully', {
      user: {
        id: user._id.toString(),
        name: user.name,
        isActive: user.isActive
      }
    });
  } catch (error) {
    logger.error(`Error updating user status: ${error.message}`, { error: error.stack });
    return errorResponse(res, 500, 'Failed to update user status');
  }
});

/**
 * Get All Restaurants
 * GET /api/admin/restaurants
 * Query params: page, limit, search, status, cuisine, zone
 */
export const getRestaurants = asyncHandler(async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50,
      search,
      status,
      cuisine,
      zone
    } = req.query;

    // Build query
    const query = {};

    // Status filter - Default to active only (approved restaurants)
    // Only show inactive if explicitly requested via status filter
    // IMPORTANT: Restaurants should only appear in main list AFTER admin approval
    // Inactive restaurants (pending approval) should only appear in "New Joining Request" section
    if (status === 'inactive') {
      query.isActive = false;
    } else {
      // Default: Show only active (approved) restaurants
      // This ensures that restaurants only appear in main list after admin approval
      query.isActive = true;
    }

    console.log('🔍 Admin Restaurants List Query:', {
      status,
      isActive: query.isActive,
      query: JSON.stringify(query, null, 2)
    });

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { ownerName: { $regex: search, $options: 'i' } },
        { ownerPhone: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Cuisine filter
    if (cuisine) {
      query.cuisines = { $in: [new RegExp(cuisine, 'i')] };
    }

    // Zone filter
    if (zone && zone !== 'All over the World') {
      query.$or = [
        { 'location.area': { $regex: zone, $options: 'i' } },
        { 'location.city': { $regex: zone, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch restaurants
    const restaurants = await Restaurant.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count
    const total = await Restaurant.countDocuments(query);

    return successResponse(res, 200, 'Restaurants retrieved successfully', {
      restaurants: restaurants,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error(`Error fetching restaurants: ${error.message}`, { error: error.stack });
    return errorResponse(res, 500, 'Failed to fetch restaurants');
  }
});

/**
 * Update Restaurant Status (Active/Inactive/Ban)
 * PUT /api/admin/restaurants/:id/status
 */
export const updateRestaurantStatus = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return errorResponse(res, 400, 'isActive must be a boolean value');
    }

    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      return errorResponse(res, 404, 'Restaurant not found');
    }

    restaurant.isActive = isActive;
    await restaurant.save();

    logger.info(`Restaurant status updated: ${id}`, {
      isActive,
      updatedBy: req.user._id
    });

    return successResponse(res, 200, 'Restaurant status updated successfully', {
      restaurant: {
        id: restaurant._id.toString(),
        name: restaurant.name,
        isActive: restaurant.isActive
      }
    });
  } catch (error) {
    logger.error(`Error updating restaurant status: ${error.message}`, { error: error.stack });
    return errorResponse(res, 500, 'Failed to update restaurant status');
  }
});

/**
 * Get Restaurant Join Requests
 * GET /api/admin/restaurants/requests
 * Query params: status (pending, rejected), page, limit, search
 */
export const getRestaurantJoinRequests = asyncHandler(async (req, res) => {
  try {
    const { 
      status = 'pending', 
      page = 1, 
      limit = 50,
      search
    } = req.query;

    // Build query
    const query = {};
    
    // Status filter
    // Pending = restaurants with ALL onboarding steps completed (step 4) but not yet active
    // Rejected = restaurants that have rejectionReason
    if (status === 'pending') {
      // Build conditions array for $and - ensures all conditions are met
      // Check for rejectionReason: either doesn't exist OR is null
      const conditions = [
        { isActive: false },
        {
          $or: [
            { 'rejectionReason': { $exists: false } },
            { 'rejectionReason': null }
          ]
        }
      ];
      
      // Only show restaurants that have completed ALL onboarding steps (all 4 steps)
      // Check if onboarding.completedSteps is 4, OR if restaurant has all required data filled
      // This handles both cases: restaurants with proper tracking AND restaurants that completed onboarding before tracking was added
      const completionCheck = {
        $or: [
          { 'onboarding.completedSteps': 4 },
          // Fallback: If completedSteps is not 4 (or doesn't exist), check if restaurant has all main fields filled
          // This matches restaurants that have completed onboarding even if completedSteps field wasn't set to 4
          {
            $and: [
              { 'name': { $exists: true, $ne: null, $ne: '' } }, // Has restaurant name
              { 'cuisines': { $exists: true, $ne: null, $not: { $size: 0 } } }, // Has cuisines (array with items)
              { 'openDays': { $exists: true, $ne: null, $not: { $size: 0 } } }, // Has open days (array with items)
              { 'estimatedDeliveryTime': { $exists: true, $ne: null, $ne: '' } }, // Has delivery time (from step 4)
              { 'featuredDish': { $exists: true, $ne: null, $ne: '' } } // Has featured dish (from step 4)
            ]
          }
        ]
      };
      
      conditions.push(completionCheck);
      query.$and = conditions;
    } else if (status === 'rejected') {
      query['rejectionReason'] = { $exists: true, $ne: null };
      // For rejected, also check if onboarding is complete
      query.$or = [
        { 'onboarding.completedSteps': 4 },
        {
          $and: [
            { 'name': { $exists: true, $ne: null, $ne: '' } },
            { 'estimatedDeliveryTime': { $exists: true, $ne: null, $ne: '' } }
          ]
        }
      ];
    }

    // Search filter - combine with $and if search is provided
    if (search && search.trim()) {
      const searchConditions = {
        $or: [
          { name: { $regex: search.trim(), $options: 'i' } },
          { ownerName: { $regex: search.trim(), $options: 'i' } },
          { ownerPhone: { $regex: search.trim(), $options: 'i' } },
          { phone: { $regex: search.trim(), $options: 'i' } },
          { email: { $regex: search.trim(), $options: 'i' } }
        ]
      };
      
      // If query already has $and, add search to it; otherwise create new $and
      if (query.$and) {
        query.$and.push(searchConditions);
      } else {
        // Convert existing query conditions to $and format
        const baseConditions = { ...query };
        query = {
          $and: [
            baseConditions,
            searchConditions
          ]
        };
      }
    }

    console.log('🔍 Restaurant Join Requests Query:', JSON.stringify(query, null, 2));

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch restaurants
    const restaurants = await Restaurant.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Debug: Log found restaurants with detailed info
    console.log(`📊 Found ${restaurants.length} restaurants matching query:`, {
      status,
      queryStructure: Object.keys(query).length,
      restaurantsFound: restaurants.length,
      sampleRestaurants: restaurants.slice(0, 5).map(r => ({
        _id: r._id.toString().substring(0, 10) + '...',
        name: r.name,
        isActive: r.isActive,
        completedSteps: r.onboarding?.completedSteps,
        hasRejectionReason: !!r.rejectionReason,
        hasName: !!r.name,
        hasCuisines: !!r.cuisines && r.cuisines.length > 0,
        hasOpenDays: !!r.openDays && r.openDays.length > 0,
        hasEstimatedDeliveryTime: !!r.estimatedDeliveryTime,
        hasFeaturedDish: !!r.featuredDish,
      }))
    });

    // Get total count
    const total = await Restaurant.countDocuments(query);
    
    console.log(`📊 Total count: ${total} restaurants`);
    
    // Also log a sample of ALL inactive restaurants (for debugging)
    if (status === 'pending' && restaurants.length === 0) {
      const allInactive = await Restaurant.find({ 
        isActive: false,
        $or: [
          { 'rejectionReason': { $exists: false } },
          { 'rejectionReason': null }
        ]
      })
      .select('name isActive onboarding.completedSteps cuisines openDays estimatedDeliveryTime featuredDish')
      .limit(10)
      .lean();
      
      const totalInactive = await Restaurant.countDocuments({ 
        isActive: false,
        $or: [
          { 'rejectionReason': { $exists: false } },
          { 'rejectionReason': null }
        ]
      });
      
      console.log('⚠️ No restaurants found with query. Debugging inactive restaurants:', {
        totalInactive,
        queryUsed: JSON.stringify(query, null, 2),
        samples: allInactive.map(r => ({
          _id: r._id.toString(),
          name: r.name,
          isActive: r.isActive,
          completedSteps: r.onboarding?.completedSteps,
          hasAllFields: {
            hasName: !!r.name && r.name !== '',
            hasCuisines: !!r.cuisines && Array.isArray(r.cuisines) && r.cuisines.length > 0,
            hasOpenDays: !!r.openDays && Array.isArray(r.openDays) && r.openDays.length > 0,
            hasEstimatedDeliveryTime: !!r.estimatedDeliveryTime && r.estimatedDeliveryTime !== '',
            hasFeaturedDish: !!r.featuredDish && r.featuredDish !== '',
          },
          fieldValues: {
            name: r.name || 'MISSING',
            cuisinesCount: r.cuisines?.length || 0,
            openDaysCount: r.openDays?.length || 0,
            estimatedDeliveryTime: r.estimatedDeliveryTime || 'MISSING',
            featuredDish: r.featuredDish || 'MISSING',
          },
          shouldMatch: (
            (!!r.name && r.name !== '') &&
            (!!r.cuisines && Array.isArray(r.cuisines) && r.cuisines.length > 0) &&
            (!!r.openDays && Array.isArray(r.openDays) && r.openDays.length > 0) &&
            (!!r.estimatedDeliveryTime && r.estimatedDeliveryTime !== '') &&
            (!!r.featuredDish && r.featuredDish !== '')
          ) || r.onboarding?.completedSteps === 4
        }))
      });
    }

    // Format response to match frontend expectations
    const formattedRequests = restaurants.map((restaurant, index) => {
      // Get zone from location
      let zone = 'All over the World';
      if (restaurant.location?.area) {
        zone = restaurant.location.area;
      } else if (restaurant.location?.city) {
        zone = restaurant.location.city;
      }

      // Get business model (could be from subscription or commission - defaulting for now)
      const businessModel = restaurant.businessModel || 'Commission Base';

      // Get status
      const requestStatus = restaurant.rejectionReason ? 'Rejected' : 'Pending';

      return {
        _id: restaurant._id.toString(),
        sl: skip + index + 1,
        restaurantName: restaurant.name || 'N/A',
        restaurantImage: restaurant.profileImage?.url || restaurant.onboarding?.step2?.profileImageUrl?.url || 'https://via.placeholder.com/40',
        ownerName: restaurant.ownerName || 'N/A',
        ownerPhone: restaurant.ownerPhone || restaurant.phone || 'N/A',
        zone: zone,
        businessModel: businessModel,
        status: requestStatus,
        rejectionReason: restaurant.rejectionReason || null,
        createdAt: restaurant.createdAt,
        // Include full data for view/details
        fullData: {
          ...restaurant,
          _id: restaurant._id.toString()
        }
      };
    });

    return successResponse(res, 200, 'Restaurant join requests retrieved successfully', {
      requests: formattedRequests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error(`Error fetching restaurant join requests: ${error.message}`, { error: error.stack });
    return errorResponse(res, 500, 'Failed to fetch restaurant join requests');
  }
});

/**
 * Approve Restaurant Join Request
 * POST /api/admin/restaurants/:id/approve
 */
export const approveRestaurant = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user._id;

    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      return errorResponse(res, 404, 'Restaurant not found');
    }

    if (restaurant.isActive) {
      return errorResponse(res, 400, 'Restaurant is already approved');
    }

    if (restaurant.rejectionReason) {
      return errorResponse(res, 400, 'Cannot approve a rejected restaurant. Please remove rejection reason first.');
    }

    // Activate restaurant
    restaurant.isActive = true;
    restaurant.approvedAt = new Date();
    restaurant.approvedBy = adminId;
    restaurant.rejectionReason = undefined; // Clear any previous rejection

    await restaurant.save();

    logger.info(`Restaurant approved: ${id}`, {
      approvedBy: adminId,
      restaurantName: restaurant.name
    });

    return successResponse(res, 200, 'Restaurant approved successfully', {
      restaurant: {
        id: restaurant._id.toString(),
        name: restaurant.name,
        isActive: restaurant.isActive,
        approvedAt: restaurant.approvedAt
      }
    });
  } catch (error) {
    logger.error(`Error approving restaurant: ${error.message}`, { error: error.stack });
    return errorResponse(res, 500, 'Failed to approve restaurant');
  }
});

/**
 * Reject Restaurant Join Request
 * POST /api/admin/restaurants/:id/reject
 */
export const rejectRestaurant = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.user._id;

    // Validate reason is provided
    if (!reason || !reason.trim()) {
      return errorResponse(res, 400, 'Rejection reason is required');
    }

    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      return errorResponse(res, 404, 'Restaurant not found');
    }

    // Set rejection details (allow updating if already rejected)
    restaurant.rejectionReason = reason.trim();
    restaurant.rejectedAt = new Date();
    restaurant.rejectedBy = adminId;
    restaurant.isActive = false; // Ensure it's inactive

    await restaurant.save();

    logger.info(`Restaurant rejected: ${id}`, {
      rejectedBy: adminId,
      reason: reason,
      restaurantName: restaurant.name
    });

    return successResponse(res, 200, 'Restaurant rejected successfully', {
      restaurant: {
        id: restaurant._id.toString(),
        name: restaurant.name,
        rejectionReason: restaurant.rejectionReason
      }
    });
  } catch (error) {
    logger.error(`Error rejecting restaurant: ${error.message}`, { error: error.stack });
    return errorResponse(res, 500, 'Failed to reject restaurant');
  }
});

/**
 * Reverify Restaurant (Resubmit for approval)
 * POST /api/admin/restaurants/:id/reverify
 */
export const reverifyRestaurant = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user._id;

    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      return errorResponse(res, 404, 'Restaurant not found');
    }

    // Check if restaurant was rejected
    if (!restaurant.rejectionReason) {
      return errorResponse(res, 400, 'Restaurant is not rejected. Only rejected restaurants can be reverified.');
    }

    // Clear rejection details and mark as pending again
    restaurant.rejectionReason = null;
    restaurant.rejectedAt = undefined;
    restaurant.rejectedBy = undefined;
    restaurant.isActive = false; // Keep inactive until approved

    await restaurant.save();

    logger.info(`Restaurant reverified: ${id}`, {
      reverifiedBy: adminId,
      restaurantName: restaurant.name
    });

    return successResponse(res, 200, 'Restaurant reverified successfully. Waiting for admin approval.', {
      restaurant: {
        id: restaurant._id.toString(),
        name: restaurant.name,
        isActive: restaurant.isActive,
        rejectionReason: null
      }
    });
  } catch (error) {
    logger.error(`Error reverifying restaurant: ${error.message}`, { error: error.stack });
    return errorResponse(res, 500, 'Failed to reverify restaurant');
  }
});

/**
 * Delete Restaurant
 * DELETE /api/admin/restaurants/:id
 */
export const deleteRestaurant = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user._id;

    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      return errorResponse(res, 404, 'Restaurant not found');
    }

    // Delete restaurant
    await Restaurant.findByIdAndDelete(id);

    logger.info(`Restaurant deleted: ${id}`, {
      deletedBy: adminId,
      restaurantName: restaurant.name
    });

    return successResponse(res, 200, 'Restaurant deleted successfully', {
      restaurant: {
        id: id,
        name: restaurant.name
      }
    });
  } catch (error) {
    logger.error(`Error deleting restaurant: ${error.message}`, { error: error.stack });
    return errorResponse(res, 500, 'Failed to delete restaurant');
  }
});

