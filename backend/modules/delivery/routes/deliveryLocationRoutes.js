import express from 'express';
import { updateLocation, getLocation } from '../controllers/deliveryLocationController.js';
import { authenticate } from '../middleware/deliveryAuth.js';
import { validate } from '../../../shared/middleware/validate.js';
import Joi from 'joi';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Location routes
router.post('/location', validate(Joi.object({
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
  isOnline: Joi.boolean().optional()
})), updateLocation);
router.get('/location', getLocation);

export default router;

