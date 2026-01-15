import express from 'express';
import {
  getRestaurantOrders,
  getRestaurantOrderById,
  acceptOrder,
  rejectOrder,
  markOrderPreparing,
  markOrderReady
} from '../controllers/restaurantOrderController.js';
import { authenticate } from '../middleware/restaurantAuth.js';

const router = express.Router();

// Order routes - each route requires restaurant authentication
router.get('/orders', authenticate, getRestaurantOrders);
router.get('/orders/:id', authenticate, getRestaurantOrderById);
router.patch('/orders/:id/accept', authenticate, acceptOrder);
router.patch('/orders/:id/reject', authenticate, rejectOrder);
router.patch('/orders/:id/preparing', authenticate, markOrderPreparing);
router.patch('/orders/:id/ready', authenticate, markOrderReady);

export default router;

