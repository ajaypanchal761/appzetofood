// Restaurant module
import express from 'express';
import { authenticate } from './middleware/restaurantAuth.js';
import restaurantAuthRoutes from './routes/restaurantAuthRoutes.js';
import { getOnboarding, upsertOnboarding, createRestaurantFromOnboardingManual } from './controllers/restaurantOnboardingController.js';
import { getRestaurants, getRestaurantById, getRestaurantByOwner } from './controllers/restaurantController.js';
import { getMenu, updateMenu, getMenuByRestaurantId } from './controllers/menuController.js';
import { getInventory, updateInventory, getInventoryByRestaurantId } from './controllers/inventoryController.js';

const router = express.Router();

// Restaurant authentication routes
router.use('/auth', restaurantAuthRoutes);

// Onboarding routes for restaurant (authenticated)
router.get('/onboarding', authenticate, getOnboarding);
router.put('/onboarding', authenticate, upsertOnboarding);
router.post('/onboarding/create-restaurant', authenticate, createRestaurantFromOnboardingManual);

// Menu routes (authenticated - for restaurant module)
router.get('/menu', authenticate, getMenu);
router.put('/menu', authenticate, updateMenu);

// Inventory routes (authenticated - for restaurant module)
router.get('/inventory', authenticate, getInventory);
router.put('/inventory', authenticate, updateInventory);

// Restaurant routes (public - for user module)
router.get('/list', getRestaurants);
// Menu and inventory routes must come before /:id to avoid route conflicts
router.get('/:id/menu', getMenuByRestaurantId);
router.get('/:id/inventory', getInventoryByRestaurantId);
router.get('/:id', getRestaurantById);

// Restaurant routes (authenticated - for restaurant module)
router.get('/owner/me', authenticate, getRestaurantByOwner);

export default router;