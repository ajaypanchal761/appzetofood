// Restaurant module
import express from 'express';
import { authenticate, authorize } from '../auth/middleware/auth.js';
import { getOnboarding, upsertOnboarding, createRestaurantFromOnboardingManual } from './controllers/restaurantOnboardingController.js';
import { getRestaurants, getRestaurantById, getRestaurantByOwner } from './controllers/restaurantController.js';

const router = express.Router();

// Onboarding routes for restaurant role
router.get('/onboarding', authenticate, authorize('restaurant'), getOnboarding);
router.put('/onboarding', authenticate, authorize('restaurant'), upsertOnboarding);
router.post('/onboarding/create-restaurant', authenticate, authorize('restaurant'), createRestaurantFromOnboardingManual);

// Restaurant routes (public - for user module)
router.get('/list', getRestaurants);
router.get('/:id', getRestaurantById);

// Restaurant routes (authenticated - for restaurant module)
router.get('/owner/me', authenticate, authorize('restaurant'), getRestaurantByOwner);

export default router;