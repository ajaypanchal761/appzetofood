import express from 'express';
import { uploadMiddleware } from '../../../shared/utils/cloudinaryService.js';
import { authenticateAdmin } from '../../admin/middleware/adminAuth.js';
import {
    getAdminDiningCategories,
    createDiningCategory,
    deleteDiningCategory,
    getAdminDiningOfferBanners,
    createDiningOfferBanner,
    deleteDiningOfferBanner,
    getAdminDiningStories,
    createDiningStory,
    deleteDiningStory,
    getActiveRestaurants
} from '../controllers/diningAdminController.js';

const router = express.Router();

// Categories
router.get('/categories', authenticateAdmin, getAdminDiningCategories);
router.post('/categories', authenticateAdmin, uploadMiddleware.single('image'), createDiningCategory);
router.delete('/categories/:id', authenticateAdmin, deleteDiningCategory);

// Offer Banners
router.get('/offer-banners', authenticateAdmin, getAdminDiningOfferBanners);
router.post('/offer-banners', authenticateAdmin, uploadMiddleware.single('image'), createDiningOfferBanner);
router.delete('/offer-banners/:id', authenticateAdmin, deleteDiningOfferBanner);

// Restaurants helper for dropdown
router.get('/restaurants-list', authenticateAdmin, getActiveRestaurants);

// Stories
router.get('/stories', authenticateAdmin, getAdminDiningStories);
router.post('/stories', authenticateAdmin, uploadMiddleware.single('image'), createDiningStory);
router.delete('/stories/:id', authenticateAdmin, deleteDiningStory);

export default router;
