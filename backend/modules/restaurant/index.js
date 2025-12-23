// Restaurant module - to be implemented
import express from 'express';
import { authenticate, authorize } from '../auth/middleware/auth.js';
import { getOnboarding, upsertOnboarding } from './controllers/restaurantOnboardingController.js';

const router = express.Router();

// Onboarding routes for restaurant role
router.get('/onboarding', authenticate, authorize('restaurant'), getOnboarding);
router.put('/onboarding', authenticate, authorize('restaurant'), upsertOnboarding);

export default router;

