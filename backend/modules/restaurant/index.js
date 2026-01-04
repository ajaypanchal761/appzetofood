// Restaurant module
import express from 'express';
import { authenticate } from './middleware/restaurantAuth.js';
import { uploadMiddleware } from '../../shared/utils/cloudinaryService.js';
import restaurantAuthRoutes from './routes/restaurantAuthRoutes.js';
import { getOnboarding, upsertOnboarding, createRestaurantFromOnboardingManual } from './controllers/restaurantOnboardingController.js';
import { getRestaurants, getRestaurantById, getRestaurantByOwner, updateRestaurantProfile, uploadProfileImage, uploadMenuImage, deleteRestaurantAccount, updateDeliveryStatus, getRestaurantsWithDishesUnder250 } from './controllers/restaurantController.js';
import { getMenu, updateMenu, getMenuByRestaurantId, addSection, addItemToSection, addSubsectionToSection, addItemToSubsection } from './controllers/menuController.js';
import { scheduleItemAvailability, cancelScheduledAvailability, getItemSchedule } from './controllers/menuScheduleController.js';
import { getInventory, updateInventory, getInventoryByRestaurantId } from './controllers/inventoryController.js';
import { addStaff, getStaff, getStaffById, updateStaff, deleteStaff } from './controllers/staffManagementController.js';
import categoryRoutes from './routes/categoryRoutes.js';

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
router.post('/menu/section', authenticate, addSection);
router.post('/menu/section/item', authenticate, addItemToSection);
router.post('/menu/section/subsection', authenticate, addSubsectionToSection);
router.post('/menu/subsection/item', authenticate, addItemToSubsection);
// Menu item scheduling routes
router.post('/menu/item/schedule', authenticate, scheduleItemAvailability);
router.delete('/menu/item/schedule/:scheduleId', authenticate, cancelScheduledAvailability);
router.get('/menu/item/schedule/:sectionId/:itemId', authenticate, getItemSchedule);

// Inventory routes (authenticated - for restaurant module)
router.get('/inventory', authenticate, getInventory);
router.put('/inventory', authenticate, updateInventory);

// Category routes (authenticated - for restaurant module)
router.use('/categories', categoryRoutes);

// Staff Management routes (authenticated - for restaurant module)
// Must come before /:id to avoid route conflicts
router.post('/staff', authenticate, uploadMiddleware.single('photo'), addStaff);
router.get('/staff', authenticate, getStaff);
router.get('/staff/:id', authenticate, getStaffById);
router.put('/staff/:id', authenticate, updateStaff);
router.delete('/staff/:id', authenticate, deleteStaff);

// Restaurant routes (public - for user module)
router.get('/list', getRestaurants);
router.get('/under-250', getRestaurantsWithDishesUnder250);
// Menu and inventory routes must come before /:id to avoid route conflicts
router.get('/:id/menu', getMenuByRestaurantId);
router.get('/:id/inventory', getInventoryByRestaurantId);
router.get('/:id', getRestaurantById);

// Restaurant routes (authenticated - for restaurant module)
router.get('/owner/me', authenticate, getRestaurantByOwner);

// Profile routes (authenticated - for restaurant module)
router.put('/profile', authenticate, updateRestaurantProfile);
router.delete('/profile', authenticate, deleteRestaurantAccount);
router.post('/profile/image', authenticate, uploadMiddleware.single('file'), uploadProfileImage);
router.post('/profile/menu-image', authenticate, uploadMiddleware.single('file'), uploadMenuImage);

// Delivery status route (authenticated - for restaurant module)
router.put('/delivery-status', authenticate, updateDeliveryStatus);

export default router;