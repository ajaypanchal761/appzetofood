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

  // Get user location
  getLocation: () => {
    return apiClient.get(API_ENDPOINTS.USER.LOCATION);
  },

  // Update user location
  updateLocation: (locationData) => {
    return apiClient.put(API_ENDPOINTS.USER.LOCATION, locationData);
  },
};

// Export location API helper functions
export const locationAPI = {
  // Reverse geocode coordinates to address
  reverseGeocode: (lat, lng) => {
    return apiClient.get(API_ENDPOINTS.LOCATION.REVERSE_GEOCODE, {
      params: { lat, lng }
    });
  },
  // Get nearby locations
  getNearbyLocations: (lat, lng, radius = 500, query = '') => {
    return apiClient.get(API_ENDPOINTS.LOCATION.NEARBY, {
      params: { lat, lng, radius, query }
    });
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

  reverify: () => {
    return apiClient.post(API_ENDPOINTS.RESTAURANT.AUTH.REVERIFY);
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

  // Delete restaurant account
  deleteAccount: () => {
    return apiClient.delete(API_ENDPOINTS.RESTAURANT.PROFILE);
  },

  // Update delivery status (isAcceptingOrders)
  updateDeliveryStatus: (isAcceptingOrders) => {
    return apiClient.put(API_ENDPOINTS.RESTAURANT.DELIVERY_STATUS, { isAcceptingOrders });
  },

  // Upload profile image
  uploadProfileImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post(`${API_ENDPOINTS.RESTAURANT.PROFILE}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Upload menu image
  uploadMenuImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post(`${API_ENDPOINTS.RESTAURANT.PROFILE}/menu-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Staff Management
  addStaff: (data) => {
    // If data is FormData, set appropriate headers
    const config = data instanceof FormData
      ? {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
      : {};
    return apiClient.post(API_ENDPOINTS.RESTAURANT.STAFF, data, config);
  },
  getStaff: (role) => {
    const url = role ? `${API_ENDPOINTS.RESTAURANT.STAFF}?role=${role}` : API_ENDPOINTS.RESTAURANT.STAFF;
    return apiClient.get(url);
  },
  getStaffById: (id) => {
    return apiClient.get(`${API_ENDPOINTS.RESTAURANT.STAFF}/${id}`);
  },
  updateStaff: (id, data) => {
    return apiClient.put(`${API_ENDPOINTS.RESTAURANT.STAFF}/${id}`, data);
  },
  deleteStaff: (id) => {
    return apiClient.delete(`${API_ENDPOINTS.RESTAURANT.STAFF}/${id}`);
  },

  // Menu operations
  getMenu: () => {
    return apiClient.get(API_ENDPOINTS.RESTAURANT.MENU);
  },
  updateMenu: (menuData) => {
    return apiClient.put(API_ENDPOINTS.RESTAURANT.MENU, menuData);
  },
  addSection: (name) => {
    return apiClient.post(`${API_ENDPOINTS.RESTAURANT.MENU}/section`, { name });
  },
  addItemToSection: (sectionId, item) => {
    return apiClient.post(`${API_ENDPOINTS.RESTAURANT.MENU}/section/item`, { sectionId, item });
  },
  addSubsectionToSection: (sectionId, name) => {
    return apiClient.post(`${API_ENDPOINTS.RESTAURANT.MENU}/section/subsection`, { sectionId, name });
  },
  addItemToSubsection: (sectionId, subsectionId, item) => {
    return apiClient.post(`${API_ENDPOINTS.RESTAURANT.MENU}/subsection/item`, { sectionId, subsectionId, item });
  },
  getMenuByRestaurantId: (restaurantId) => {
    return apiClient.get(API_ENDPOINTS.RESTAURANT.MENU_BY_RESTAURANT_ID.replace(':id', restaurantId));
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

  // Get restaurants with dishes under ₹250
  getRestaurantsUnder250: () => {
    return apiClient.get(API_ENDPOINTS.RESTAURANT.UNDER_250);
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
  addSection: (name) => {
    return apiClient.post(`${API_ENDPOINTS.RESTAURANT.MENU}/section`, { name });
  },
  addItemToSection: (sectionId, item) => {
    return apiClient.post(`${API_ENDPOINTS.RESTAURANT.MENU}/section/item`, { sectionId, item });
  },
  addSubsectionToSection: (sectionId, name) => {
    return apiClient.post(`${API_ENDPOINTS.RESTAURANT.MENU}/section/subsection`, { sectionId, name });
  },
  addItemToSubsection: (sectionId, subsectionId, item) => {
    return apiClient.post(`${API_ENDPOINTS.RESTAURANT.MENU}/subsection/item`, { sectionId, subsectionId, item });
  },
  getMenuByRestaurantId: (restaurantId) => {
    return apiClient.get(API_ENDPOINTS.RESTAURANT.MENU_BY_RESTAURANT_ID.replace(':id', restaurantId));
  },

  // Menu item scheduling operations
  scheduleItemAvailability: (scheduleData) => {
    return apiClient.post(API_ENDPOINTS.RESTAURANT.MENU_ITEM_SCHEDULE, scheduleData);
  },
  cancelScheduledAvailability: (scheduleId) => {
    return apiClient.delete(API_ENDPOINTS.RESTAURANT.MENU_ITEM_SCHEDULE_BY_ID.replace(':scheduleId', scheduleId));
  },
  getItemSchedule: (sectionId, itemId) => {
    return apiClient.get(
      API_ENDPOINTS.RESTAURANT.MENU_ITEM_SCHEDULE_BY_ITEM
        .replace(':sectionId', sectionId)
        .replace(':itemId', itemId)
    );
  },

  // Category operations (for restaurant module)
  getCategories: () => {
    return apiClient.get(API_ENDPOINTS.RESTAURANT.CATEGORIES);
  },
  getAllCategories: () => {
    return apiClient.get(API_ENDPOINTS.RESTAURANT.CATEGORIES_ALL);
  },
  createCategory: (categoryData) => {
    return apiClient.post(API_ENDPOINTS.RESTAURANT.CATEGORIES, categoryData);
  },
  updateCategory: (id, categoryData) => {
    return apiClient.put(API_ENDPOINTS.RESTAURANT.CATEGORY_BY_ID.replace(':id', id), categoryData);
  },
  deleteCategory: (id) => {
    return apiClient.delete(API_ENDPOINTS.RESTAURANT.CATEGORY_BY_ID.replace(':id', id));
  },
  reorderCategories: (categories) => {
    return apiClient.put(API_ENDPOINTS.RESTAURANT.CATEGORIES_REORDER, { categories });
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
  // Delivery Authentication
  sendOTP: (phone, purpose = 'login') => {
    return apiClient.post(API_ENDPOINTS.DELIVERY.AUTH.SEND_OTP, { phone, purpose });
  },
  verifyOTP: (phone, otp, purpose = 'login', name = null) => {
    const payload = { phone, otp, purpose };
    // Only include name if it's provided and is a string
    if (name && typeof name === 'string' && name.trim()) {
      payload.name = name.trim();
    }
    return apiClient.post(API_ENDPOINTS.DELIVERY.AUTH.VERIFY_OTP, payload);
  },
  refreshToken: () => {
    return apiClient.post(API_ENDPOINTS.DELIVERY.AUTH.REFRESH_TOKEN);
  },
  logout: () => {
    return apiClient.post(API_ENDPOINTS.DELIVERY.AUTH.LOGOUT);
  },
  getCurrentDelivery: () => {
    return apiClient.get(API_ENDPOINTS.DELIVERY.AUTH.ME);
  },

  // Dashboard
  getDashboard: () => {
    return apiClient.get(API_ENDPOINTS.DELIVERY.DASHBOARD);
  },

  // Wallet
  getWallet: () => {
    return apiClient.get(API_ENDPOINTS.DELIVERY.WALLET);
  },
  getWalletBalance: () => {
    // Backward compatibility - use getWallet instead
    return apiClient.get(API_ENDPOINTS.DELIVERY.WALLET);
  },
  getWalletTransactions: (params = {}) => {
    return apiClient.get(API_ENDPOINTS.DELIVERY.WALLET_TRANSACTIONS, { params });
  },
  getWalletStats: (params = {}) => {
    return apiClient.get(API_ENDPOINTS.DELIVERY.WALLET_STATS, { params });
  },
  createWithdrawalRequest: (data) => {
    return apiClient.post(API_ENDPOINTS.DELIVERY.WALLET_WITHDRAW, data);
  },
  addEarning: (data) => {
    return apiClient.post(API_ENDPOINTS.DELIVERY.WALLET_EARNINGS, data);
  },
  collectPayment: (data) => {
    return apiClient.post(API_ENDPOINTS.DELIVERY.WALLET_COLLECT_PAYMENT, data);
  },
  claimJoiningBonus: () => {
    return apiClient.post(API_ENDPOINTS.DELIVERY.CLAIM_JOINING_BONUS);
  },
  getOrderStats: (period = 'all') => {
    return apiClient.get(API_ENDPOINTS.DELIVERY.ORDER_STATS, { params: { period } });
  },

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

  // Get trip history
  getTripHistory: (params = {}) => {
    return apiClient.get(API_ENDPOINTS.DELIVERY.TRIP_HISTORY, { params });
  },

  // Get earnings
  getEarnings: (params = {}) => {
    return apiClient.get(API_ENDPOINTS.DELIVERY.EARNINGS, { params });
  },

  // Get active earning addon offers
  getActiveEarningAddons: () => {
    const endpoint = API_ENDPOINTS.DELIVERY.EARNINGS_ACTIVE_OFFERS;
    if (import.meta.env.DEV) {
      console.log('📡 Fetching active earning addons from:', endpoint);
    }
    return apiClient.get(endpoint);
  },

  // Update location
  updateLocation: (latitude, longitude, isOnline = null) => {
    const payload = {
      latitude,
      longitude,
    };
    if (typeof isOnline === 'boolean') {
      payload.isOnline = isOnline;
    }
    return apiClient.post(API_ENDPOINTS.DELIVERY.LOCATION, payload);
  },

  // Update online status
  updateOnlineStatus: (isOnline) => {
    return apiClient.post(API_ENDPOINTS.DELIVERY.LOCATION, {
      isOnline,
    });
  },

  // Signup
  submitSignupDetails: (data) => {
    return apiClient.post(API_ENDPOINTS.DELIVERY.SIGNUP.DETAILS, data);
  },
  submitSignupDocuments: (data) => {
    return apiClient.post(API_ENDPOINTS.DELIVERY.SIGNUP.DOCUMENTS, data);
  },

  // Reverify (resubmit for approval)
  reverify: () => {
    return apiClient.post(API_ENDPOINTS.DELIVERY.REVERIFY);
  },
};

// Export dining API helper functions
export const diningAPI = {
  getRestaurants: (params = {}) => {
    return apiClient.get(API_ENDPOINTS.DINING.RESTAURANTS, { params });
  },
  getRestaurantBySlug: (slug) => {
    return apiClient.get(API_ENDPOINTS.DINING.RESTAURANT_DETAILS.replace(':slug', slug));
  },
  getCategories: () => {
    return apiClient.get(API_ENDPOINTS.DINING.CATEGORIES);
  },
  getLimelight: () => {
    return apiClient.get(API_ENDPOINTS.DINING.LIMELIGHT);
  },
  getBankOffers: () => {
    return apiClient.get(API_ENDPOINTS.DINING.BANK_OFFERS);
  },
  getMustTries: () => {
    return apiClient.get(API_ENDPOINTS.DINING.MUST_TRIES);
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

  // Get user by ID
  getUserById: (id) => {
    return apiClient.get(API_ENDPOINTS.ADMIN.USER_BY_ID.replace(':id', id));
  },

  // Update user status
  updateUserStatus: (id, isActive) => {
    return apiClient.put(API_ENDPOINTS.ADMIN.USER_STATUS.replace(':id', id), { isActive });
  },

  // Get restaurants
  getRestaurants: (params = {}) => {
    return apiClient.get(API_ENDPOINTS.ADMIN.RESTAURANTS, { params });
  },

  // Get restaurant by ID
  getRestaurantById: (id) => {
    return apiClient.get(API_ENDPOINTS.ADMIN.RESTAURANT_BY_ID.replace(':id', id));
  },

  // Update restaurant status
  updateRestaurantStatus: (id, isActive) => {
    return apiClient.put(API_ENDPOINTS.ADMIN.RESTAURANT_STATUS.replace(':id', id), { isActive });
  },

  // Get restaurant join requests
  getRestaurantJoinRequests: (params = {}) => {
    return apiClient.get(API_ENDPOINTS.ADMIN.RESTAURANT_REQUESTS, { params });
  },

  // Approve restaurant
  approveRestaurant: (id) => {
    return apiClient.post(API_ENDPOINTS.ADMIN.RESTAURANT_APPROVE.replace(':id', id));
  },

  // Reject restaurant
  rejectRestaurant: (id, reason) => {
    return apiClient.post(API_ENDPOINTS.ADMIN.RESTAURANT_REJECT.replace(':id', id), { reason });
  },

  // Delete restaurant
  deleteRestaurant: (id) => {
    return apiClient.delete(API_ENDPOINTS.ADMIN.RESTAURANT_DELETE.replace(':id', id));
  },

  // Restaurant Commission Management
  getRestaurantCommissions: (params = {}) => {
    return apiClient.get(API_ENDPOINTS.ADMIN.RESTAURANT_COMMISSION, { params });
  },

  getApprovedRestaurants: (params = {}) => {
    return apiClient.get(API_ENDPOINTS.ADMIN.RESTAURANT_COMMISSION_APPROVED_RESTAURANTS, { params });
  },

  getRestaurantCommissionById: (id) => {
    return apiClient.get(API_ENDPOINTS.ADMIN.RESTAURANT_COMMISSION_BY_ID.replace(':id', id));
  },

  getCommissionByRestaurantId: (restaurantId) => {
    return apiClient.get(API_ENDPOINTS.ADMIN.RESTAURANT_COMMISSION_BY_RESTAURANT_ID.replace(':restaurantId', restaurantId));
  },

  createRestaurantCommission: (data) => {
    return apiClient.post(API_ENDPOINTS.ADMIN.RESTAURANT_COMMISSION, data);
  },

  updateRestaurantCommission: (id, data) => {
    return apiClient.put(API_ENDPOINTS.ADMIN.RESTAURANT_COMMISSION_BY_ID.replace(':id', id), data);
  },

  deleteRestaurantCommission: (id) => {
    return apiClient.delete(API_ENDPOINTS.ADMIN.RESTAURANT_COMMISSION_BY_ID.replace(':id', id));
  },

  toggleRestaurantCommissionStatus: (id) => {
    return apiClient.patch(API_ENDPOINTS.ADMIN.RESTAURANT_COMMISSION_STATUS.replace(':id', id));
  },

  calculateRestaurantCommission: (restaurantId, orderAmount) => {
    return apiClient.post(API_ENDPOINTS.ADMIN.RESTAURANT_COMMISSION_CALCULATE, {
      restaurantId,
      orderAmount
    });
  },

  // Get delivery partners
  getDelivery: (params = {}) => {
    return apiClient.get(API_ENDPOINTS.ADMIN.DELIVERY, { params });
  },

  // Get delivery partner join requests
  getDeliveryPartnerJoinRequests: (params = {}) => {
    return apiClient.get(API_ENDPOINTS.ADMIN.DELIVERY_PARTNERS_REQUESTS, { params });
  },

  // Get delivery partner by ID
  getDeliveryPartnerById: (id) => {
    return apiClient.get(API_ENDPOINTS.ADMIN.DELIVERY_PARTNER_BY_ID.replace(':id', id));
  },

  // Approve delivery partner
  approveDeliveryPartner: (id) => {
    return apiClient.post(API_ENDPOINTS.ADMIN.DELIVERY_PARTNER_APPROVE.replace(':id', id));
  },

  // Reject delivery partner
  rejectDeliveryPartner: (id, reason) => {
    return apiClient.post(API_ENDPOINTS.ADMIN.DELIVERY_PARTNER_REJECT.replace(':id', id), { reason });
  },

  // Reverify delivery partner
  reverifyDeliveryPartner: (id) => {
    return apiClient.post(API_ENDPOINTS.ADMIN.DELIVERY_PARTNER_REVERIFY.replace(':id', id));
  },

  // Get all delivery partners
  getDeliveryPartners: (params = {}) => {
    return apiClient.get(API_ENDPOINTS.ADMIN.DELIVERY_PARTNERS, { params });
  },

  // Update delivery partner status
  updateDeliveryPartnerStatus: (id, status, isActive = null) => {
    const payload = {};
    if (status) payload.status = status;
    if (isActive !== null) payload.isActive = isActive;
    return apiClient.patch(API_ENDPOINTS.ADMIN.DELIVERY_PARTNER_STATUS.replace(':id', id), payload);
  },

  // Delete delivery partner
  deleteDeliveryPartner: (id) => {
    return apiClient.delete(API_ENDPOINTS.ADMIN.DELIVERY_PARTNER_DELETE.replace(':id', id));
  },

  // Add bonus to delivery partner
  addDeliveryPartnerBonus: (deliveryPartnerId, amount, reference = '') => {
    return apiClient.post(API_ENDPOINTS.ADMIN.DELIVERY_PARTNER_BONUS, {
      deliveryPartnerId,
      amount: parseFloat(amount),
      reference
    });
  },

  // Get bonus transactions
  getDeliveryPartnerBonusTransactions: (params = {}) => {
    return apiClient.get(API_ENDPOINTS.ADMIN.DELIVERY_PARTNER_BONUS_TRANSACTIONS, { params });
  },

  // Get orders
  getOrders: (params = {}) => {
    return apiClient.get(API_ENDPOINTS.ADMIN.ORDERS, { params });
  },

  // Get analytics
  getAnalytics: (params = {}) => {
    return apiClient.get(API_ENDPOINTS.ADMIN.ANALYTICS, { params });
  },

  // Category Management
  getCategories: (params = {}) => {
    return apiClient.get(API_ENDPOINTS.ADMIN.CATEGORIES, { params });
  },

  getCategoryById: (id) => {
    return apiClient.get(API_ENDPOINTS.ADMIN.CATEGORY_BY_ID.replace(':id', id));
  },

  createCategory: (data) => {
    // Axios will automatically handle FormData headers (including boundary)
    // No need to manually set Content-Type for FormData
    return apiClient.post(API_ENDPOINTS.ADMIN.CATEGORIES, data);
  },

  updateCategory: (id, data) => {
    // Axios will automatically handle FormData headers (including boundary)
    // No need to manually set Content-Type for FormData
    return apiClient.put(API_ENDPOINTS.ADMIN.CATEGORY_BY_ID.replace(':id', id), data);
  },

  deleteCategory: (id) => {
    return apiClient.delete(API_ENDPOINTS.ADMIN.CATEGORY_BY_ID.replace(':id', id));
  },

  toggleCategoryStatus: (id) => {
    return apiClient.patch(API_ENDPOINTS.ADMIN.CATEGORY_STATUS.replace(':id', id));
  },

  updateCategoryPriority: (id, priority) => {
    return apiClient.patch(API_ENDPOINTS.ADMIN.CATEGORY_PRIORITY.replace(':id', id), { priority });
  },

  // Earning Addon Management
  createEarningAddon: (data) => {
    return apiClient.post(API_ENDPOINTS.ADMIN.EARNING_ADDON, data);
  },

  getEarningAddons: (params = {}) => {
    return apiClient.get(API_ENDPOINTS.ADMIN.EARNING_ADDON, { params });
  },

  getEarningAddonById: (id) => {
    return apiClient.get(API_ENDPOINTS.ADMIN.EARNING_ADDON_BY_ID.replace(':id', id));
  },

  updateEarningAddon: (id, data) => {
    return apiClient.put(API_ENDPOINTS.ADMIN.EARNING_ADDON_BY_ID.replace(':id', id), data);
  },

  deleteEarningAddon: (id) => {
    return apiClient.delete(API_ENDPOINTS.ADMIN.EARNING_ADDON_BY_ID.replace(':id', id));
  },

  toggleEarningAddonStatus: (id, status) => {
    return apiClient.patch(API_ENDPOINTS.ADMIN.EARNING_ADDON_STATUS.replace(':id', id), { status });
  },

  checkEarningAddonCompletions: (deliveryPartnerId) => {
    return apiClient.post(API_ENDPOINTS.ADMIN.EARNING_ADDON_CHECK_COMPLETIONS, { deliveryPartnerId });
  },

  // Earning Addon History Management
  getEarningAddonHistory: (params = {}) => {
    return apiClient.get(API_ENDPOINTS.ADMIN.EARNING_ADDON_HISTORY, { params });
  },

  getEarningAddonHistoryById: (id) => {
    return apiClient.get(API_ENDPOINTS.ADMIN.EARNING_ADDON_HISTORY_BY_ID.replace(':id', id));
  },

  creditEarningToWallet: (id, notes = '') => {
    return apiClient.post(API_ENDPOINTS.ADMIN.EARNING_ADDON_HISTORY_CREDIT.replace(':id', id), { notes });
  },

  cancelEarningAddonHistory: (id, reason = '') => {
    return apiClient.patch(API_ENDPOINTS.ADMIN.EARNING_ADDON_HISTORY_CANCEL.replace(':id', id), { reason });
  },

  getEarningAddonHistoryStatistics: (params = {}) => {
    return apiClient.get(API_ENDPOINTS.ADMIN.EARNING_ADDON_HISTORY_STATISTICS, { params });
  },

  // Environment Variables Management
  getEnvVariables: () => {
    return apiClient.get(API_ENDPOINTS.ADMIN.ENV_VARIABLES);
  },

  saveEnvVariables: (envData) => {
    return apiClient.post(API_ENDPOINTS.ADMIN.ENV_VARIABLES, envData);
  },

  // Public Environment Variables (for frontend use)
  getPublicEnvVariables: () => {
    return apiClient.get('/env/public');
  },

  // Delivery Boy Commission Management
  getCommissionRules: (params = {}) => {
    return apiClient.get(API_ENDPOINTS.ADMIN.DELIVERY_BOY_COMMISSION, { params });
  },

  getCommissionRuleById: (id) => {
    return apiClient.get(API_ENDPOINTS.ADMIN.DELIVERY_BOY_COMMISSION_BY_ID.replace(':id', id));
  },

  createCommissionRule: (data) => {
    return apiClient.post(API_ENDPOINTS.ADMIN.DELIVERY_BOY_COMMISSION, data);
  },

  updateCommissionRule: (id, data) => {
    return apiClient.put(API_ENDPOINTS.ADMIN.DELIVERY_BOY_COMMISSION_BY_ID.replace(':id', id), data);
  },

  deleteCommissionRule: (id) => {
    return apiClient.delete(API_ENDPOINTS.ADMIN.DELIVERY_BOY_COMMISSION_BY_ID.replace(':id', id));
  },

  toggleCommissionRuleStatus: (id, status) => {
    return apiClient.patch(API_ENDPOINTS.ADMIN.DELIVERY_BOY_COMMISSION_STATUS.replace(':id', id), { status });
  },

  calculateCommission: (distance) => {
    return apiClient.post(API_ENDPOINTS.ADMIN.DELIVERY_BOY_COMMISSION_CALCULATE, { distance });
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
  // Calculate order pricing
  calculateOrder: (orderData) => {
    return apiClient.post(API_ENDPOINTS.ORDER.CALCULATE, orderData);
  },

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

