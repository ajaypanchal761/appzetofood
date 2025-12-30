import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  uploadProfileImage,
  updateUserLocation,
  getUserLocation
} from '../controllers/userController.js';
import { authenticate } from '../../auth/middleware/auth.js';
import { uploadMiddleware } from '../../../shared/utils/cloudinaryService.js';

const router = express.Router();

// All routes require user authentication
router.use(authenticate);

// Profile routes
router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);

// Profile image upload
router.post(
  '/profile/avatar',
  uploadMiddleware.single('image'),
  uploadProfileImage
);

// Location routes
router.get('/location', getUserLocation);
router.put('/location', updateUserLocation);

export default router;

