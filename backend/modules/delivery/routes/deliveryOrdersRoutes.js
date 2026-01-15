import express from 'express';
import { 
  getOrders, 
  getOrderDetails, 
  acceptOrder, 
  confirmReachedPickup, 
  confirmOrderId 
} from '../controllers/deliveryOrdersController.js';
import { getTripHistory } from '../controllers/deliveryTripHistoryController.js';
import { authenticate } from '../middleware/deliveryAuth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Orders routes
router.get('/orders', getOrders);
router.get('/orders/:orderId', getOrderDetails);
router.patch('/orders/:orderId/accept', acceptOrder);
router.patch('/orders/:orderId/reached-pickup', confirmReachedPickup);
router.patch('/orders/:orderId/confirm-order-id', confirmOrderId);

// Trip History route
router.get('/trip-history', getTripHistory);

export default router;

