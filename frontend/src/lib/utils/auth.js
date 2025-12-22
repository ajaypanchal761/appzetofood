/**
 * JWT Token Utilities
 * Decode and extract information from JWT tokens
 */

/**
 * Decode JWT token without verification (client-side only)
 * @param {string} token - JWT token
 * @returns {Object|null} - Decoded token payload or null if invalid
 */
export function decodeToken(token) {
  if (!token) return null;

  try {
    // JWT format: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    // Decode base64url encoded payload
    const payload = parts[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    
    return decoded;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

/**
 * Get user role from token
 * @param {string} token - JWT token
 * @returns {string|null} - User role or null if not found
 */
export function getRoleFromToken(token) {
  const decoded = decodeToken(token);
  return decoded?.role || null;
}

/**
 * Check if token is expired
 * @param {string} token - JWT token
 * @returns {boolean} - True if expired or invalid
 */
export function isTokenExpired(token) {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  
  // exp is in seconds, Date.now() is in milliseconds
  return decoded.exp * 1000 < Date.now();
}

/**
 * Get user ID from token
 * @param {string} token - JWT token
 * @returns {string|null} - User ID or null if not found
 */
export function getUserIdFromToken(token) {
  const decoded = decodeToken(token);
  return decoded?.userId || decoded?.id || null;
}

/**
 * Check if user has access to a module based on role
 * @param {string} role - User role
 * @param {string} module - Module name (admin, restaurant, delivery, user)
 * @returns {boolean} - True if user has access
 */
export function hasModuleAccess(role, module) {
  const roleModuleMap = {
    'admin': 'admin',
    'restaurant': 'restaurant',
    'delivery': 'delivery',
    'user': 'user'
  };

  return roleModuleMap[role] === module;
}

/**
 * Get current user's role from localStorage
 * @returns {string|null} - Current user role or null
 */
export function getCurrentUserRole() {
  const token = localStorage.getItem('accessToken');
  if (!token) return null;
  
  if (isTokenExpired(token)) {
    // Token expired, clear it
    localStorage.removeItem('accessToken');
    localStorage.removeItem('admin_authenticated');
    localStorage.removeItem('restaurant_authenticated');
    localStorage.removeItem('delivery_authenticated');
    localStorage.removeItem('user_authenticated');
    return null;
  }
  
  return getRoleFromToken(token);
}

/**
 * Clear all authentication data
 */
export function clearAuthData() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('admin_authenticated');
  localStorage.removeItem('restaurant_authenticated');
  localStorage.removeItem('delivery_authenticated');
  localStorage.removeItem('user_authenticated');
  localStorage.removeItem('admin_user');
  localStorage.removeItem('restaurant_user');
  localStorage.removeItem('delivery_user');
  localStorage.removeItem('user');
}

/**
 * Set authentication data for a specific role
 * @param {string} role - User role
 * @param {string} token - Access token
 * @param {Object} user - User data
 */
export function setAuthData(role, token, user) {
  // Clear old auth data first
  clearAuthData();
  
  // Set new auth data
  localStorage.setItem('accessToken', token);
  localStorage.setItem(`${role}_authenticated`, 'true');
  if (user) {
    localStorage.setItem(`${role}_user`, JSON.stringify(user));
  }
}

