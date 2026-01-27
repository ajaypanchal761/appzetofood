import express from 'express';
import { getEmergencyHelpPublic } from '../../admin/controllers/deliveryEmergencyHelpController.js';
import {
  getDashboard,
  getWalletBalance,
  claimJoiningBonus,
  getOrderStats
} from '../controllers/deliveryDashboardController.js';
import { authenticate } from '../middleware/deliveryAuth.js';

const router = express.Router();

// Public route - Emergency help (accessible without authentication)
router.get('/emergency-help', getEmergencyHelpPublic);

// All routes require authentication
router.use(authenticate);

// Dashboard routes
router.get('/dashboard', getDashboard);
router.get('/wallet', getWalletBalance);
router.post('/wallet/claim-joining-bonus', claimJoiningBonus);
router.get('/orders/stats', getOrderStats);

export default router;

