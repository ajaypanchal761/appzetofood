/**
 * API Configuration
 * Centralized configuration for API base URL and endpoints
 */

// Get API base URL from environment variable or use default
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// API endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    SEND_OTP: '/auth/send-otp',
    VERIFY_OTP: '/auth/verify-otp',
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    FIREBASE_GOOGLE_LOGIN: '/auth/firebase/google-login',
    REFRESH_TOKEN: '/auth/refresh-token',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },
  // User endpoints
  USER: {
    PROFILE: '/user/profile',
    ADDRESSES: '/user/addresses',
    PREFERENCES: '/user/preferences',
    WALLET: '/user/wallet',
    ORDERS: '/user/orders',
  },
  // Restaurant endpoints
  RESTAURANT: {
    PROFILE: '/restaurant/profile',
    MENU: '/restaurant/menu',
    ORDERS: '/restaurant/orders',
    WALLET: '/restaurant/wallet',
    ANALYTICS: '/restaurant/analytics',
    LIST: '/restaurant/list',
    BY_ID: '/restaurant/:id',
    BY_OWNER: '/restaurant/owner/me',
  },
  // Delivery endpoints
  DELIVERY: {
    PROFILE: '/delivery/profile',
    ORDERS: '/delivery/orders',
    EARNINGS: '/delivery/earnings',
    LOCATION: '/delivery/location',
  },
  // Admin endpoints
  ADMIN: {
    USERS: '/admin/users',
    RESTAURANTS: '/admin/restaurants',
    DELIVERY: '/admin/delivery',
    ORDERS: '/admin/orders',
    ANALYTICS: '/admin/analytics',
  },
  // Order endpoints
  ORDER: {
    CREATE: '/order',
    LIST: '/order',
    DETAILS: '/order/:id',
    UPDATE_STATUS: '/order/:id/status',
    VERIFY_PAYMENT: '/order/verify-payment',
  },
  // Payment endpoints
  PAYMENT: {
    METHODS: '/payment/methods',
    PROCESS: '/payment/process',
    WALLET: '/payment/wallet',
  },
  // Menu endpoints
  MENU: {
    CATEGORIES: '/menu/categories',
    ITEMS: '/menu/items',
    SEARCH: '/menu/search',
  },
  // Upload / media endpoints
  UPLOAD: {
    MEDIA: '/upload/media',
  },
  // Hero Banner endpoints
  HERO_BANNER: {
    PUBLIC: '/hero-banners/public',
    LIST: '/hero-banners',
    CREATE: '/hero-banners',
    DELETE: '/hero-banners/:id',
    UPDATE_ORDER: '/hero-banners/:id/order',
    TOGGLE_STATUS: '/hero-banners/:id/status',
  },
};

export default {
  API_BASE_URL,
  API_ENDPOINTS,
};

