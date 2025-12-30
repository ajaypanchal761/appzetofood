import express from 'express';
import {
  getDashboardStats,
  getAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
  getUsers,
  getUserById,
  updateUserStatus
} from '../controllers/adminController.js';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
  updateCategoryPriority
} from '../controllers/categoryController.js';
import { authenticateAdmin } from '../middleware/adminAuth.js';
import { uploadMiddleware } from '../../../shared/utils/cloudinaryService.js';

const router = express.Router();

// All admin routes require admin authentication
router.use(authenticateAdmin);

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

// Admin Management
router.get('/admins', getAdmins);
router.get('/admins/:id', getAdminById);
router.post('/admins', createAdmin);
router.put('/admins/:id', updateAdmin);
router.delete('/admins/:id', deleteAdmin);

// Profile Management
router.get('/profile', getAdminProfile);
router.put('/profile', updateAdminProfile);

// Settings Management
router.put('/settings/change-password', changeAdminPassword);

// User Management
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id/status', updateUserStatus);

// Category Management
router.get('/categories', getCategories);
router.get('/categories/:id', getCategoryById);
router.post('/categories', uploadMiddleware.single('image'), createCategory);
router.put('/categories/:id', uploadMiddleware.single('image'), updateCategory);
router.delete('/categories/:id', deleteCategory);
router.patch('/categories/:id/status', toggleCategoryStatus);
router.patch('/categories/:id/priority', updateCategoryPriority);

export default router;

