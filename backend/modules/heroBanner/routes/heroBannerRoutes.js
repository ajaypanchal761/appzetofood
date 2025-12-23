import express from 'express';
import { uploadMiddleware } from '../../../shared/utils/cloudinaryService.js';
import { authenticate, authorize } from '../../../modules/auth/middleware/auth.js';
import {
  getHeroBanners,
  getAllHeroBanners,
  createHeroBanner,
  createMultipleHeroBanners,
  deleteHeroBanner,
  updateBannerOrder,
  toggleBannerStatus,
  getLandingConfig,
  getLandingCategories,
  createLandingCategory,
  deleteLandingCategory,
  updateLandingCategoryOrder,
  toggleLandingCategoryStatus,
  getLandingExploreMore,
  createLandingExploreMore,
  deleteLandingExploreMore,
  updateLandingExploreMoreOrder,
  toggleLandingExploreMoreStatus,
  getLandingSettings,
  updateLandingSettings
} from '../controllers/heroBannerController.js';

const router = express.Router();

// Public routes
router.get('/public', getHeroBanners);
router.get('/landing/public', getLandingConfig);

// Admin routes - Hero Banners
router.get('/', authenticate, authorize('admin'), getAllHeroBanners);
router.post(
  '/',
  authenticate,
  authorize('admin'),
  uploadMiddleware.single('image'),
  createHeroBanner
);
router.post(
  '/multiple',
  authenticate,
  authorize('admin'),
  uploadMiddleware.array('images', 5),
  createMultipleHeroBanners
);
router.delete('/:id', authenticate, authorize('admin'), deleteHeroBanner);
router.patch('/:id/order', authenticate, authorize('admin'), updateBannerOrder);
router.patch('/:id/status', authenticate, authorize('admin'), toggleBannerStatus);

// Admin routes - Landing Page Categories
router.get('/landing/categories', authenticate, authorize('admin'), getLandingCategories);
router.post(
  '/landing/categories',
  authenticate,
  authorize('admin'),
  uploadMiddleware.single('image'),
  createLandingCategory
);
router.delete('/landing/categories/:id', authenticate, authorize('admin'), deleteLandingCategory);
router.patch('/landing/categories/:id/order', authenticate, authorize('admin'), updateLandingCategoryOrder);
router.patch('/landing/categories/:id/status', authenticate, authorize('admin'), toggleLandingCategoryStatus);

// Admin routes - Landing Page Explore More
router.get('/landing/explore-more', authenticate, authorize('admin'), getLandingExploreMore);
router.post(
  '/landing/explore-more',
  authenticate,
  authorize('admin'),
  uploadMiddleware.single('image'),
  createLandingExploreMore
);
router.delete('/landing/explore-more/:id', authenticate, authorize('admin'), deleteLandingExploreMore);
router.patch('/landing/explore-more/:id/order', authenticate, authorize('admin'), updateLandingExploreMoreOrder);
router.patch('/landing/explore-more/:id/status', authenticate, authorize('admin'), toggleLandingExploreMoreStatus);

// Admin routes - Landing Page Settings
router.get('/landing/settings', authenticate, authorize('admin'), getLandingSettings);
router.patch('/landing/settings', authenticate, authorize('admin'), updateLandingSettings);

export default router;

