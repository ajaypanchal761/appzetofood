import express from 'express';
import {
  createOrder,
  verifyOrderPayment,
  getUserOrders,
  getOrderDetails,
  calculateOrder
} from '../controllers/orderController.js';
import { authenticate } from '../../auth/middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Calculate order pricing (must be before /:id route)
router.post('/calculate', calculateOrder);

// Create order and initiate payment
router.post('/', createOrder);

// Verify payment
router.post('/verify-payment', verifyOrderPayment);

// Get user orders
router.get('/', getUserOrders);

// Get order details
router.get('/:id', getOrderDetails);

export default router;

