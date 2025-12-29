/**
 * API Client
 * Centralized API client for all modules (user, restaurant, delivery, admin)
 * 
 * Usage:
 * import api from '@/lib/api'
 * 
 * // GET request
 * const response = await api.get('/user/profile')
 * 
 * // POST request
 * const response = await api.post('/auth/login', { email, password })
 * 
 * // PUT request
 * const response = await api.put('/user/profile', { name, email })
 * 
 * // DELETE request
 * const response = await api.delete('/user/addresses/:id')
 */

import apiClient from './axios.js';
import { API_ENDPOINTS } from './config.js';

// Export the configured axios instance
export default apiClient;

// Export API endpoints for convenience
export { API_ENDPOINTS };

// Export helper functions for common operations
export const api = {
  // GET request
  get: (url, config = {}) => {
    return apiClient.get(url, config);
  },

  // POST request
  post: (url, data = {}, config = {}) => {
    return apiClient.post(url, data, config);
  },

  // PUT request
  put: (url, data = {}, config = {}) => {
    return apiClient.put(url, data, config);
  },

  // PATCH request
  patch: (url, data = {}, config = {}) => {
    return apiClient.patch(url, data, config);
  },

  // DELETE request
  delete: (url, config = {}) => {
    return apiClient.delete(url, config);
  },
};

// Export auth helper functions
export const authAPI = {
  // Send OTP (supports both phone and email)
  sendOTP: (phone = null, purpose = 'login', email = null) => {
    const payload = { purpose };
    if (phone) payload.phone = phone;
    if (email) payload.email = email;
    return apiClient.post(API_ENDPOINTS.AUTH.SEND_OTP, payload);
  },

  // Verify OTP (supports both phone and email)
  // 'password' is used only for email/password registrations (e.g. admin signup)
  verifyOTP: (phone = null, otp, purpose = 'login', name = null, email = null, role = 'user', password = null) => {
    const payload = {
      otp,
      purpose,
      role,
    };
    if (phone != null) payload.phone = phone;
    if (email != null) payload.email = email;
    if (name != null) payload.name = name;
    if (password != null) payload.password = password; // don't send null, Joi expects string
    return apiClient.post(API_ENDPOINTS.AUTH.VERIFY_OTP, payload);
  },

  // Register with email/password
  register: (name, email, password, phone = null, role = 'user') => {
    return apiClient.post(API_ENDPOINTS.AUTH.REGISTER, {
      name,
      email,
      password,
      phone,
      role,
    });
  },

  // Login with email/password
  login: (email, password, role = null) => {
    const payload = { email, password };
    if (role) payload.role = role;
    return apiClient.post(API_ENDPOINTS.AUTH.LOGIN, payload);
  },

  // Login/Register via Firebase Google ID token
  firebaseGoogleLogin: (idToken, role = 'restaurant') => {
    return apiClient.post(API_ENDPOINTS.AUTH.FIREBASE_GOOGLE_LOGIN, { idToken, role });
  },

  // Refresh token
  refreshToken: () => {
    return apiClient.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN);
  },

  // Logout
  logout: () => {
    return apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
  },

  // Get current user
  getCurrentUser: () => {
    return apiClient.get(API_ENDPOINTS.AUTH.ME);
  },
};

// Export user API helper functions
export const userAPI = {
  // Get user profile
  getProfile: () => {
    return apiClient.get(API_ENDPOINTS.USER.PROFILE);
  },

  // Update user profile
  updateProfile: (data) => {
    return apiClient.put(API_ENDPOINTS.USER.PROFILE, data);
  },

  // Upload profile image
  uploadProfileImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return apiClient.post('/user/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Get user addresses
  getAddresses: () => {
    return apiClient.get(API_ENDPOINTS.USER.ADDRESSES);
  },

  // Add address
  addAddress: (address) => {
    return apiClient.post(API_ENDPOINTS.USER.ADDRESSES, address);
  },

  // Update address
  updateAddress: (addressId, address) => {
    return apiClient.put(`${API_ENDPOINTS.USER.ADDRESSES}/${addressId}`, address);
  },

  // Delete address
  deleteAddress: (addressId) => {
    return apiClient.delete(`${API_ENDPOINTS.USER.ADDRESSES}/${addressId}`);
  },

  // Get user preferences
  getPreferences: () => {
    return apiClient.get(API_ENDPOINTS.USER.PREFERENCES);
  },

  // Update preferences
  updatePreferences: (preferences) => {
    return apiClient.put(API_ENDPOINTS.USER.PREFERENCES, preferences);
  },

  // Get wallet
  getWallet: () => {
    return apiClient.get(API_ENDPOINTS.USER.WALLET);
  },

  // Get user orders
  getOrders: (params = {}) => {
    return apiClient.get(API_ENDPOINTS.USER.ORDERS, { params });
  },
};

// Export restaurant API helper functions
export const restaurantAPI = {
  // Restaurant Authentication
  sendOTP: (phone = null, purpose = 'login', email = null) => {
    const payload = { purpose };
    if (phone) payload.phone = phone;
    if (email) payload.email = email;
    return apiClient.post(API_ENDPOINTS.RESTAURANT.AUTH.SEND_OTP, payload);
  },

  verifyOTP: (phone = null, otp, purpose = 'login', name = null, email = null, password = null) => {
    const payload = {
      otp,
      purpose,
    };
    if (phone != null) payload.phone = phone;
    if (email != null) payload.email = email;
    if (name != null) payload.name = name;
    if (password != null) payload.password = password;
    return apiClient.post(API_ENDPOINTS.RESTAURANT.AUTH.VERIFY_OTP, payload);
  },

  register: (name, email, password, phone = null, ownerName = null, ownerEmail = null, ownerPhone = null) => {
    return apiClient.post(API_ENDPOINTS.RESTAURANT.AUTH.REGISTER, {
      name,
      email,
      password,
      phone,
      ownerName,
      ownerEmail,
      ownerPhone,
    });
  },

  login: (email, password) => {
    return apiClient.post(API_ENDPOINTS.RESTAURANT.AUTH.LOGIN, { email, password });
  },

  firebaseGoogleLogin: (idToken) => {
    return apiClient.post(API_ENDPOINTS.RESTAURANT.AUTH.FIREBASE_GOOGLE_LOGIN, { idToken });
  },

  refreshToken: () => {
    return apiClient.post(API_ENDPOINTS.RESTAURANT.AUTH.REFRESH_TOKEN);
  },

  logout: () => {
    return apiClient.post(API_ENDPOINTS.RESTAURANT.AUTH.LOGOUT);
  },

  getCurrentRestaurant: () => {
    return apiClient.get(API_ENDPOINTS.RESTAURANT.AUTH.ME);
  },

  resetPassword: (email, otp, newPassword) => {
    return apiClient.post(API_ENDPOINTS.RESTAURANT.AUTH.RESET_PASSWORD, {
      email,
      otp,
      newPassword,
    });
  },

  // Get restaurant profile
  getProfile: () => {
    return apiClient.get(API_ENDPOINTS.RESTAURANT.PROFILE);
  },

  // Update restaurant profile
  updateProfile: (data) => {
    return apiClient.put(API_ENDPOINTS.RESTAURANT.PROFILE, data);
  },

  // Get menu
  getMenu: () => {
    return apiClient.get(API_ENDPOINTS.RESTAURANT.MENU);
  },

  // Get orders
  getOrders: (params = {}) => {
    return apiClient.get(API_ENDPOINTS.RESTAURANT.ORDERS, { params });
  },

  // Get wallet
  getWallet: () => {
    return apiClient.get(API_ENDPOINTS.RESTAURANT.WALLET);
  },

  // Get analytics
  getAnalytics: (params = {}) => {
    return apiClient.get(API_ENDPOINTS.RESTAURANT.ANALYTICS, { params });
  },

  // Get all restaurants (for user module)
  getRestaurants: (params = {}) => {
    return apiClient.get(API_ENDPOINTS.RESTAURANT.LIST, { params });
  },

  // Get restaurant by ID or slug
  getRestaurantById: (id) => {
    return apiClient.get(API_ENDPOINTS.RESTAURANT.BY_ID.replace(':id', id));
  },

  // Get restaurant by owner (for restaurant module)
  getRestaurantByOwner: () => {
    return apiClient.get(API_ENDPOINTS.RESTAURANT.BY_OWNER);
  },

  // Menu operations (for restaurant module)
  getMenu: () => {
    return apiClient.get(API_ENDPOINTS.RESTAURANT.MENU);
  },
  updateMenu: (menuData) => {
    return apiClient.put(API_ENDPOINTS.RESTAURANT.MENU, menuData);
  },
  getMenuByRestaurantId: (restaurantId) => {
    return apiClient.get(API_ENDPOINTS.RESTAURANT.MENU_BY_RESTAURANT_ID.replace(':id', restaurantId));
  },

  // Inventory operations (for restaurant module)
  getInventory: () => {
    return apiClient.get(API_ENDPOINTS.RESTAURANT.INVENTORY);
  },
  updateInventory: (inventoryData) => {
    return apiClient.put(API_ENDPOINTS.RESTAURANT.INVENTORY, inventoryData);
  },
  getInventoryByRestaurantId: (restaurantId) => {
    return apiClient.get(API_ENDPOINTS.RESTAURANT.INVENTORY_BY_RESTAURANT_ID.replace(':id', restaurantId));
  },
};

// Export delivery API helper functions
export const deliveryAPI = {
  // Get delivery profile
  getProfile: () => {
    return apiClient.get(API_ENDPOINTS.DELIVERY.PROFILE);
  },

  // Update delivery profile
  updateProfile: (data) => {
    return apiClient.put(API_ENDPOINTS.DELIVERY.PROFILE, data);
  },

  // Get orders
  getOrders: (params = {}) => {
    return apiClient.get(API_ENDPOINTS.DELIVERY.ORDERS, { params });
  },

  // Get earnings
  getEarnings: (params = {}) => {
    return apiClient.get(API_ENDPOINTS.DELIVERY.EARNINGS, { params });
  },

  // Update location
  updateLocation: (latitude, longitude) => {
    return apiClient.post(API_ENDPOINTS.DELIVERY.LOCATION, {
      latitude,
      longitude,
    });
  },
};

// Export admin API helper functions
export const adminAPI = {
  // Admin Auth
  signup: (name, email, password, phone = null) => {
    const payload = { name, email, password };
    if (phone) payload.phone = phone;
    return apiClient.post(API_ENDPOINTS.ADMIN.AUTH.SIGNUP, payload);
  },

  signupWithOTP: (name, email, password, otp, phone = null) => {
    const payload = { name, email, password, otp };
    if (phone) payload.phone = phone;
    return apiClient.post(API_ENDPOINTS.ADMIN.AUTH.SIGNUP_OTP, payload);
  },

  login: (email, password) => {
    return apiClient.post(API_ENDPOINTS.ADMIN.AUTH.LOGIN, { email, password });
  },

  logout: () => {
    return apiClient.post(API_ENDPOINTS.ADMIN.AUTH.LOGOUT);
  },

  getCurrentAdmin: () => {
    return apiClient.get(API_ENDPOINTS.ADMIN.AUTH.ME);
  },

  // Get admin profile
  getAdminProfile: () => {
    return apiClient.get(API_ENDPOINTS.ADMIN.PROFILE);
  },

  // Update admin profile
  updateAdminProfile: (profileData) => {
    return apiClient.put(API_ENDPOINTS.ADMIN.PROFILE, profileData);
  },

  // Change admin password
  changePassword: (currentPassword, newPassword) => {
    return apiClient.put(API_ENDPOINTS.ADMIN.CHANGE_PASSWORD, {
      currentPassword,
      newPassword
    });
  },

  // Get dashboard stats
  getDashboardStats: () => {
    return apiClient.get(API_ENDPOINTS.ADMIN.DASHBOARD_STATS);
  },

  // Get users
  getUsers: (params = {}) => {
    return apiClient.get(API_ENDPOINTS.ADMIN.USERS, { params });
  },

  // Get restaurants
  getRestaurants: (params = {}) => {
    return apiClient.get(API_ENDPOINTS.ADMIN.RESTAURANTS, { params });
  },

  // Get delivery partners
  getDelivery: (params = {}) => {
    return apiClient.get(API_ENDPOINTS.ADMIN.DELIVERY, { params });
  },

  // Get orders
  getOrders: (params = {}) => {
    return apiClient.get(API_ENDPOINTS.ADMIN.ORDERS, { params });
  },

  // Get analytics
  getAnalytics: (params = {}) => {
    return apiClient.get(API_ENDPOINTS.ADMIN.ANALYTICS, { params });
  },
};

// Upload / media helper functions
export const uploadAPI = {
  /**
   * Upload a single image/video file to Cloudinary via backend
   * @param {File} file - Browser File object
   * @param {Object} options - Optional { folder }
   */
  uploadMedia: (file, options = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    if (options.folder) {
      formData.append('folder', options.folder);
    }

    return apiClient.post(API_ENDPOINTS.UPLOAD.MEDIA, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Export order API helper functions
export const orderAPI = {
  // Create order and get Razorpay order
  createOrder: (orderData) => {
    return apiClient.post(API_ENDPOINTS.ORDER.CREATE, orderData);
  },

  // Verify payment
  verifyPayment: (paymentData) => {
    return apiClient.post(API_ENDPOINTS.ORDER.VERIFY_PAYMENT, paymentData);
  },

  // Get user orders
  getOrders: (params = {}) => {
    return apiClient.get(API_ENDPOINTS.ORDER.LIST, { params });
  },

  // Get order details
  getOrderDetails: (orderId) => {
    return apiClient.get(API_ENDPOINTS.ORDER.DETAILS.replace(':id', orderId));
  },
};

