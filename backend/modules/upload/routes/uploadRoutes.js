import express from 'express';
import { uploadMiddleware } from '../../../shared/utils/cloudinaryService.js';
import { uploadSingleMedia } from '../controllers/uploadController.js';
import jwtService from '../../auth/services/jwtService.js';
import User from '../../auth/models/User.js';
import Admin from '../../admin/models/Admin.js';
import { errorResponse } from '../../../shared/utils/response.js';

const router = express.Router();

/**
 * Flexible authentication middleware
 * Accepts both admin and regular user tokens
 */
const authenticateFlexible = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 401, 'No token provided');
    }

    const token = authHeader.substring(7);
    
    // Verify token
    const decoded = jwtService.verifyAccessToken(token);

    // Check if token is for admin
    if (decoded.role === 'admin') {
      const admin = await Admin.findById(decoded.userId).select('-password');
      
      if (!admin) {
        return errorResponse(res, 401, 'Admin not found');
      }

      if (!admin.isActive) {
        return errorResponse(res, 401, 'Admin account is inactive');
      }

      req.user = admin;
      req.token = decoded;
      return next();
    }

    // Otherwise, try regular user authentication
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return errorResponse(res, 401, 'User not found');
    }

    if (!user.isActive) {
      return errorResponse(res, 401, 'User account is inactive');
    }

    req.user = user;
    req.token = decoded;
    next();
  } catch (error) {
    return errorResponse(res, 401, error.message || 'Invalid token');
  }
};

// POST /api/upload/media - Accepts both admin and user tokens
router.post(
  '/media',
  authenticateFlexible,
  uploadMiddleware.single('file'),
  uploadSingleMedia
);

export default router;


