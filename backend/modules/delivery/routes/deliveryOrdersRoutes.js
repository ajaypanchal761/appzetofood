import express from 'express';
import { getOrders, getOrderDetails } from '../controllers/deliveryOrdersController.js';
import { getTripHistory } from '../controllers/deliveryTripHistoryController.js';
import { authenticate } from '../middleware/deliveryAuth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Orders routes
router.get('/orders', getOrders);
router.get('/orders/:orderId', getOrderDetails);

// Trip History route
router.get('/trip-history', getTripHistory);

export default router;

