/**
 * API Configuration
 * Centralized configuration for API base URL and endpoints
 */

// Get API base URL from environment variable or use default
// IMPORTANT: Backend runs on port 5000, frontend on port 5173
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Validate API base URL
if (API_BASE_URL.includes('5173')) {
  console.error('❌ ERROR: API_BASE_URL is pointing to frontend port (5173) instead of backend port (5000)');
  console.error('💡 Fix: Set VITE_API_BASE_URL=http://localhost:5000/api in .env file');
  console.error('💡 Or remove VITE_API_BASE_URL to use default: http://localhost:5000/api');
}

// Log API base URL in development for debugging
if (import.meta.env.DEV) {
  console.log('🌐 API Base URL:', API_BASE_URL);
  console.log('🌐 Backend URL:', API_BASE_URL.replace('/api', ''));
  console.log('🌐 Frontend URL:', window.location.origin);
  console.log('🌐 Environment:', import.meta.env.MODE);
  
  // Verify backend is accessible
  fetch(`${API_BASE_URL.replace('/api', '')}/health`)
    .then(r => r.json())
    .then(data => console.log('✅ Backend health check:', data))
    .catch(err => {
      console.error('❌ Backend not accessible at:', API_BASE_URL.replace('/api', ''));
      console.error('💡 Start backend: cd appzetofood/backend && npm run dev');
    });
}

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
    LOCATION: '/user/location',
  },
  // Location endpoints
  LOCATION: {
    REVERSE_GEOCODE: '/location/reverse',
    NEARBY: '/location/nearby',
  },
  // Restaurant endpoints
  RESTAURANT: {
    AUTH: {
      SEND_OTP: '/restaurant/auth/send-otp',
      VERIFY_OTP: '/restaurant/auth/verify-otp',
      REGISTER: '/restaurant/auth/register',
      LOGIN: '/restaurant/auth/login',
      FIREBASE_GOOGLE_LOGIN: '/restaurant/auth/firebase/google-login',
      REFRESH_TOKEN: '/restaurant/auth/refresh-token',
      LOGOUT: '/restaurant/auth/logout',
      ME: '/restaurant/auth/me',
      RESET_PASSWORD: '/restaurant/auth/reset-password',
    },
    PROFILE: '/restaurant/profile',
    DELIVERY_STATUS: '/restaurant/delivery-status',
    STAFF: '/restaurant/staff',
    MENU: '/restaurant/menu',
    MENU_BY_RESTAURANT_ID: '/restaurant/:id/menu',
    MENU_ITEM_SCHEDULE: '/restaurant/menu/item/schedule',
    MENU_ITEM_SCHEDULE_BY_ID: '/restaurant/menu/item/schedule/:scheduleId',
    MENU_ITEM_SCHEDULE_BY_ITEM: '/restaurant/menu/item/schedule/:sectionId/:itemId',
    CATEGORIES: '/restaurant/categories',
    CATEGORIES_ALL: '/restaurant/categories/all',
    CATEGORY_BY_ID: '/restaurant/categories/:id',
    CATEGORIES_REORDER: '/restaurant/categories/reorder',
    INVENTORY: '/restaurant/inventory',
    INVENTORY_BY_RESTAURANT_ID: '/restaurant/:id/inventory',
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
    AUTH: {
      SIGNUP: '/admin/auth/signup',
      SIGNUP_OTP: '/admin/auth/signup/otp',
      LOGIN: '/admin/auth/login',
      LOGOUT: '/admin/auth/logout',
      ME: '/admin/auth/me',
    },
    PROFILE: '/admin/profile',
    CHANGE_PASSWORD: '/admin/settings/change-password',
    USERS: '/admin/users',
    USER_BY_ID: '/admin/users/:id',
    USER_STATUS: '/admin/users/:id/status',
    RESTAURANTS: '/admin/restaurants',
    DELIVERY: '/admin/delivery',
    ORDERS: '/admin/orders',
    ANALYTICS: '/admin/analytics',
    DASHBOARD_STATS: '/admin/dashboard/stats',
    CATEGORIES: '/admin/categories',
    CATEGORY_BY_ID: '/admin/categories/:id',
    CATEGORY_STATUS: '/admin/categories/:id/status',
    CATEGORY_PRIORITY: '/admin/categories/:id/priority',
  },
  // Order endpoints
  ORDER: {
    CREATE: '/order',
    LIST: '/order',
    DETAILS: '/order/:id',
    UPDATE_STATUS: '/order/:id/status',
    VERIFY_PAYMENT: '/order/verify-payment',
    CALCULATE: '/order/calculate',
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

