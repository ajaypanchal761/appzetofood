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
  changeAdminPassword
} from '../controllers/adminController.js';
import { authenticateAdmin } from '../middleware/adminAuth.js';

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

export default router;

