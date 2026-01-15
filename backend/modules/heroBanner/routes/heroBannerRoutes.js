import express from 'express';
import { uploadMiddleware } from '../../../shared/utils/cloudinaryService.js';
import { authenticateAdmin } from '../../../modules/admin/middleware/adminAuth.js';
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
  updateLandingSettings,
  getUnder250Banners,
  getAllUnder250Banners,
  createUnder250Banner,
  createMultipleUnder250Banners,
  deleteUnder250Banner,
  updateUnder250BannerOrder,
  toggleUnder250BannerStatus,
  getDiningBanners,
  getAllDiningBanners,
  createDiningBanner,
  createMultipleDiningBanners,
  deleteDiningBanner,
  updateDiningBannerOrder,
  toggleDiningBannerStatus
} from '../controllers/heroBannerController.js';

const router = express.Router();

// Public routes
router.get('/public', getHeroBanners);
router.get('/landing/public', getLandingConfig);

router.get('/under-250/public', getUnder250Banners);
router.get('/dining/public', getDiningBanners);

// Admin routes - Hero Banners
router.get('/', authenticateAdmin, getAllHeroBanners);
router.post(
  '/',
  authenticateAdmin,
  uploadMiddleware.single('image'),
  createHeroBanner
);
router.post(
  '/multiple',
  authenticateAdmin,
  uploadMiddleware.array('images', 5),
  createMultipleHeroBanners
);
router.delete('/:id', authenticateAdmin, deleteHeroBanner);
router.patch('/:id/order', authenticateAdmin, updateBannerOrder);
router.patch('/:id/status', authenticateAdmin, toggleBannerStatus);

// Admin routes - Landing Page Categories
router.get('/landing/categories', authenticateAdmin, getLandingCategories);
router.post(
  '/landing/categories',
  authenticateAdmin,
  uploadMiddleware.single('image'),
  createLandingCategory
);
router.delete('/landing/categories/:id', authenticateAdmin, deleteLandingCategory);
router.patch('/landing/categories/:id/order', authenticateAdmin, updateLandingCategoryOrder);
router.patch('/landing/categories/:id/status', authenticateAdmin, toggleLandingCategoryStatus);

// Admin routes - Landing Page Explore More
router.get('/landing/explore-more', authenticateAdmin, getLandingExploreMore);
router.post(
  '/landing/explore-more',
  authenticateAdmin,
  uploadMiddleware.single('image'),
  createLandingExploreMore
);
router.delete('/landing/explore-more/:id', authenticateAdmin, deleteLandingExploreMore);
router.patch('/landing/explore-more/:id/order', authenticateAdmin, updateLandingExploreMoreOrder);
router.patch('/landing/explore-more/:id/status', authenticateAdmin, toggleLandingExploreMoreStatus);

// Admin routes - Landing Page Settings
router.get('/landing/settings', authenticateAdmin, getLandingSettings);
router.patch('/landing/settings', authenticateAdmin, updateLandingSettings);

// Admin routes - Under 250 Banners
router.get('/under-250', authenticateAdmin, getAllUnder250Banners);
router.post(
  '/under-250',
  authenticateAdmin,
  uploadMiddleware.single('image'),
  createUnder250Banner
);
router.post(
  '/under-250/multiple',
  authenticateAdmin,
  uploadMiddleware.array('images', 5),
  createMultipleUnder250Banners
);
router.delete('/under-250/:id', authenticateAdmin, deleteUnder250Banner);
router.patch('/under-250/:id/order', authenticateAdmin, updateUnder250BannerOrder);




// Admin routes - Dining Banners
router.get('/dining', authenticateAdmin, getAllDiningBanners);
router.post(
  '/dining',
  authenticateAdmin,
  uploadMiddleware.single('image'),
  createDiningBanner
);
router.post(
  '/dining/multiple',
  authenticateAdmin,
  uploadMiddleware.array('images', 5),
  createMultipleDiningBanners
);
router.delete('/dining/:id', authenticateAdmin, deleteDiningBanner);
router.patch('/dining/:id/order', authenticateAdmin, updateDiningBannerOrder);
router.patch('/dining/:id/status', authenticateAdmin, toggleDiningBannerStatus);

export default router;

