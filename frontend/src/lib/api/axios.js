import axios from 'axios';
import { toast } from 'sonner';
import { API_BASE_URL } from './config.js';

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
 * Request Interceptor
 * Adds authentication token to requests
 */
apiClient.interceptors.request.use(
  (config) => {
    // Get access token from localStorage
    const accessToken = localStorage.getItem('accessToken');
    
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
    // If response contains new access token, store it
    if (response.data?.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
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
          // Store new access token
          localStorage.setItem('accessToken', accessToken);
          
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
        
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        
        // Redirect to appropriate login page based on current route
        const currentPath = window.location.pathname;
        if (currentPath.startsWith('/restaurant')) {
          window.location.href = '/restaurant/login';
        } else if (currentPath.startsWith('/delivery')) {
          window.location.href = '/delivery/login';
        } else if (currentPath.startsWith('/admin')) {
          window.location.href = '/admin/login';
        } else {
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

