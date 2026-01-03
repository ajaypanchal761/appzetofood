import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  uploadProfileImage,
  updateUserLocation,
  getUserLocation,
  getUserAddresses,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress
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

// Address routes
router.get('/addresses', getUserAddresses);
router.post('/addresses', addUserAddress);
router.put('/addresses/:id', updateUserAddress);
router.delete('/addresses/:id', deleteUserAddress);

export default router;

