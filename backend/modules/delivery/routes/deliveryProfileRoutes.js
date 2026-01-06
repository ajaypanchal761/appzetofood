import express from 'express';
import { getProfile, updateProfile, reverify } from '../controllers/deliveryProfileController.js';
import { authenticate } from '../middleware/deliveryAuth.js';
import { validate } from '../../../shared/middleware/validate.js';
import Joi from 'joi';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Profile routes
router.get('/profile', getProfile);
router.put('/profile', validate(Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
  email: Joi.string().email().lowercase().trim().optional().allow(null, ''),
  dateOfBirth: Joi.date().optional().allow(null),
  gender: Joi.string().valid('male', 'female', 'other', 'prefer-not-to-say').optional(),
  vehicle: Joi.object({
    type: Joi.string().valid('bike', 'scooter', 'bicycle', 'car').optional(),
    number: Joi.string().trim().optional().allow(null, ''),
    model: Joi.string().trim().optional().allow(null, ''),
    brand: Joi.string().trim().optional().allow(null, '')
  }).optional(),
  location: Joi.object({
    addressLine1: Joi.string().trim().optional().allow(null, ''),
    addressLine2: Joi.string().trim().optional().allow(null, ''),
    area: Joi.string().trim().optional().allow(null, ''),
    city: Joi.string().trim().optional().allow(null, ''),
    state: Joi.string().trim().optional().allow(null, ''),
    zipCode: Joi.string().trim().optional().allow(null, '')
  }).optional(),
  profileImage: Joi.object({
    url: Joi.string().uri().optional().allow(null, ''),
    publicId: Joi.string().trim().optional().allow(null, '')
  }).optional(),
  documents: Joi.object({
    bankDetails: Joi.object({
      accountHolderName: Joi.string().trim().min(2).max(100).optional().allow(null, ''),
      accountNumber: Joi.string().trim().min(9).max(18).optional().allow(null, ''),
      ifscCode: Joi.string().trim().length(11).uppercase().optional().allow(null, ''),
      bankName: Joi.string().trim().min(2).max(100).optional().allow(null, '')
    }).optional()
  }).optional()
})), updateProfile);

// Reverify route (resubmit for approval)
router.post('/reverify', reverify);

export default router;

