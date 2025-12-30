import jwtService from '../../auth/services/jwtService.js';
import Restaurant from '../models/Restaurant.js';
import { errorResponse } from '../../../shared/utils/response.js';

/**
 * Restaurant Authentication Middleware
 * Verifies JWT access token and attaches restaurant to request
 */
export const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 401, 'No token provided');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwtService.verifyAccessToken(token);

    // Ensure it's a restaurant token
    if (decoded.role !== 'restaurant') {
      return errorResponse(res, 403, 'Invalid token. Restaurant access required.');
    }

    // Get restaurant from database
    const restaurant = await Restaurant.findById(decoded.userId).select('-password');
    
    if (!restaurant) {
      console.error('❌ Restaurant not found in database:', {
        userId: decoded.userId,
        role: decoded.role,
        email: decoded.email,
      });
      return errorResponse(res, 401, 'Restaurant not found');
    }

    if (!restaurant.isActive) {
      console.error('❌ Restaurant account is inactive:', {
        restaurantId: restaurant._id,
        restaurantName: restaurant.name,
        isActive: restaurant.isActive,
      });
      return errorResponse(res, 401, 'Restaurant account is inactive');
    }

    // Attach restaurant to request
    req.restaurant = restaurant;
    req.token = decoded;
    
    next();
  } catch (error) {
    return errorResponse(res, 401, error.message || 'Invalid token');
  }
};

export default { authenticate };

