import axios from 'axios';
import { toast } from 'sonner';
import { API_BASE_URL } from './config.js';
import { getRoleFromToken, clearModuleAuth } from '../utils/auth.js';

/**
 * Create axios instance with default configuration
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies for refresh token
});

/**
 * Get the appropriate module token based on the current route
 * @returns {string|null} - Access token for the current module or null
 */
function getTokenForCurrentRoute() {
  const path = window.location.pathname;
  
  if (path.startsWith('/admin')) {
    return localStorage.getItem('admin_accessToken');
  } else if (path.startsWith('/restaurant-panel') || path.startsWith('/restaurant')) {
    return localStorage.getItem('restaurant_accessToken');
  } else if (path.startsWith('/delivery')) {
    return localStorage.getItem('delivery_accessToken');
  } else if (path.startsWith('/user') || path === '/' || (!path.startsWith('/admin') && !path.startsWith('/restaurant') && !path.startsWith('/restaurant-panel') && !path.startsWith('/delivery'))) {
    return localStorage.getItem('user_accessToken');
  }
  
  // Fallback to legacy token for backward compatibility
  return localStorage.getItem('accessToken');
}

/**
 * Request Interceptor
 * Adds authentication token to requests based on current route
 */
apiClient.interceptors.request.use(
  (config) => {
    // Get access token for the current module based on route
    const accessToken = getTokenForCurrentRoute();
    
    // Add token to Authorization header if available
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handles token refresh and error responses
 */
apiClient.interceptors.response.use(
  (response) => {
    // If response contains new access token, store it for the current module
    if (response.data?.accessToken) {
      const currentPath = window.location.pathname;
      let tokenKey = 'accessToken'; // fallback
      let expectedRole = 'user';
      
      if (currentPath.startsWith('/admin')) {
        tokenKey = 'admin_accessToken';
        expectedRole = 'admin';
      } else if (currentPath.startsWith('/restaurant-panel') || currentPath.startsWith('/restaurant')) {
        tokenKey = 'restaurant_accessToken';
        expectedRole = 'restaurant';
      } else if (currentPath.startsWith('/delivery')) {
        tokenKey = 'delivery_accessToken';
        expectedRole = 'delivery';
      } else if (currentPath.startsWith('/user') || currentPath === '/') {
        tokenKey = 'user_accessToken';
        expectedRole = 'user';
      }
      
      const token = response.data.accessToken;
      const role = getRoleFromToken(token);

      // Only store the token if the role matches the current module
      if (!role || role !== expectedRole) {
        clearModuleAuth(tokenKey.replace('_accessToken', ''));
      } else {
        localStorage.setItem(tokenKey, token);
      }
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        // The refresh token is sent via httpOnly cookie automatically
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          {},
          {
            withCredentials: true,
          }
        );

        const { accessToken } = response.data.data || response.data;
        
        if (accessToken) {
          // Determine which module's token to update based on current route
          const currentPath = window.location.pathname;
          let tokenKey = 'accessToken'; // fallback
          let expectedRole = 'user';
          
          if (currentPath.startsWith('/admin')) {
            tokenKey = 'admin_accessToken';
            expectedRole = 'admin';
          } else if (currentPath.startsWith('/restaurant-panel') || currentPath.startsWith('/restaurant')) {
            tokenKey = 'restaurant_accessToken';
            expectedRole = 'restaurant';
          } else if (currentPath.startsWith('/delivery')) {
            tokenKey = 'delivery_accessToken';
            expectedRole = 'delivery';
          } else if (currentPath.startsWith('/user') || currentPath === '/') {
            tokenKey = 'user_accessToken';
            expectedRole = 'user';
          }
          
          const role = getRoleFromToken(accessToken);

          // Only store token if role matches expected module; otherwise treat as invalid for this module
          if (!role || role !== expectedRole) {
            clearModuleAuth(tokenKey.replace('_accessToken', ''));
            throw new Error('Role mismatch on refreshed token');
          }

          // Store new access token for the current module
          localStorage.setItem(tokenKey, accessToken);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Show error toast in development mode for refresh errors
        if (import.meta.env.DEV) {
          const refreshErrorMessage = 
            refreshError.response?.data?.message ||
            refreshError.response?.data?.error ||
            refreshError.message ||
            'Token refresh failed';
          
          toast.error(refreshErrorMessage, {
            duration: 3000,
            style: {
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: '#ffffff',
              border: '1px solid #b91c1c',
              borderRadius: '12px',
              padding: '16px',
              fontSize: '14px',
              fontWeight: '500',
              boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.3), 0 8px 10px -6px rgba(239, 68, 68, 0.2)',
            },
            className: 'error-toast',
          });
        }
        
        // Refresh failed, clear module-specific token and redirect to login
        const currentPath = window.location.pathname;
        if (currentPath.startsWith('/admin')) {
          localStorage.removeItem('admin_accessToken');
          localStorage.removeItem('admin_authenticated');
          localStorage.removeItem('admin_user');
          window.location.href = '/admin/login';
        } else if (currentPath.startsWith('/restaurant-panel') || currentPath.startsWith('/restaurant')) {
          localStorage.removeItem('restaurant_accessToken');
          localStorage.removeItem('restaurant_authenticated');
          localStorage.removeItem('restaurant_user');
          window.location.href = '/restaurant/login';
        } else if (currentPath.startsWith('/delivery')) {
          localStorage.removeItem('delivery_accessToken');
          localStorage.removeItem('delivery_authenticated');
          localStorage.removeItem('delivery_user');
          window.location.href = '/delivery/login';
        } else {
          localStorage.removeItem('user_accessToken');
          localStorage.removeItem('user_authenticated');
          localStorage.removeItem('user');
          window.location.href = '/user/auth/sign-in';
        }
        
        return Promise.reject(refreshError);
      }
    }

    // Show error toast in development mode only
    if (import.meta.env.DEV) {
      // Extract error messages from various possible locations
      const errorData = error.response?.data;
      
      // Handle array of error messages (common in validation errors)
      let errorMessages = [];
      
      if (Array.isArray(errorData?.message)) {
        errorMessages = errorData.message;
      } else if (Array.isArray(errorData?.errors)) {
        errorMessages = errorData.errors.map(err => err.message || err);
      } else if (errorData?.message) {
        errorMessages = [errorData.message];
      } else if (errorData?.error) {
        errorMessages = [errorData.error];
      } else if (errorData?.data?.message) {
        errorMessages = Array.isArray(errorData.data.message) 
          ? errorData.data.message 
          : [errorData.data.message];
      } else if (error.message) {
        errorMessages = [error.message];
      } else {
        errorMessages = ['An error occurred'];
      }
      
      // Show beautiful error toast for each error message
      errorMessages.forEach((errorMessage, index) => {
        // Add slight delay for multiple toasts to appear sequentially
        setTimeout(() => {
          toast.error(errorMessage, {
            duration: 5000,
            style: {
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: '#ffffff',
              border: '1px solid #b91c1c',
              borderRadius: '12px',
              padding: '16px',
              fontSize: '14px',
              fontWeight: '500',
              boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.3), 0 8px 10px -6px rgba(239, 68, 68, 0.2)',
            },
            className: 'error-toast',
          });
        }, index * 100); // Stagger multiple toasts by 100ms
      });
    }

    // Handle other errors
    return Promise.reject(error);
  }
);

export default apiClient;

