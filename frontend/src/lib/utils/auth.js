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
 * Get module-specific access token
 * @param {string} module - Module name (admin, restaurant, delivery, user)
 * @returns {string|null} - Access token or null
 */
export function getModuleToken(module) {
  return localStorage.getItem(`${module}_accessToken`);
}

/**
 * Get current user's role from a specific module's token
 * @param {string} module - Module name (admin, restaurant, delivery, user)
 * @returns {string|null} - Current user role or null
 */
export function getCurrentUserRole(module = null) {
  // If module is specified, check that module's token
  if (module) {
    const token = getModuleToken(module);
    if (!token) return null;
    
    if (isTokenExpired(token)) {
      // Token expired, clear it
      clearModuleAuth(module);
      return null;
    }
    
    return getRoleFromToken(token);
  }
  
  // Legacy: check all modules and return the first valid role found
  // This is for backward compatibility but should be avoided
  const modules = ['user', 'restaurant', 'delivery', 'admin'];
  for (const mod of modules) {
    const token = getModuleToken(mod);
    if (token && !isTokenExpired(token)) {
      return getRoleFromToken(token);
    }
  }
  
  return null;
}

/**
 * Check if user is authenticated for a specific module
 * @param {string} module - Module name (admin, restaurant, delivery, user)
 * @returns {boolean} - True if authenticated
 */
export function isModuleAuthenticated(module) {
  const token = getModuleToken(module);
  if (!token) return false;
  
  if (isTokenExpired(token)) {
    clearModuleAuth(module);
    return false;
  }
  
  return true;
}

/**
 * Clear authentication data for a specific module
 * @param {string} module - Module name (admin, restaurant, delivery, user)
 */
export function clearModuleAuth(module) {
  localStorage.removeItem(`${module}_accessToken`);
  localStorage.removeItem(`${module}_authenticated`);
  localStorage.removeItem(`${module}_user`);
}

/**
 * Clear all authentication data for all modules
 */
export function clearAuthData() {
  const modules = ['admin', 'restaurant', 'delivery', 'user'];
  modules.forEach(module => {
    clearModuleAuth(module);
  });
  // Also clear legacy token if it exists
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
}

/**
 * Set authentication data for a specific module
 * @param {string} module - Module name (admin, restaurant, delivery, user)
 * @param {string} token - Access token
 * @param {Object} user - User data
 */
export function setAuthData(module, token, user) {
  // Store module-specific token (don't clear other modules)
  localStorage.setItem(`${module}_accessToken`, token);
  localStorage.setItem(`${module}_authenticated`, 'true');
  if (user) {
    localStorage.setItem(`${module}_user`, JSON.stringify(user));
  }
}

