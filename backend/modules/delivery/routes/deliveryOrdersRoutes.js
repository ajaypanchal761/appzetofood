import express from 'express';
import { getOrders, getOrderDetails } from '../controllers/deliveryOrdersController.js';
import { authenticate } from '../middleware/deliveryAuth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Orders routes
router.get('/orders', getOrders);
router.get('/orders/:orderId', getOrderDetails);

export default router;

