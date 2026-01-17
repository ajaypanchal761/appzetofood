import express from 'express';
import {
  getDashboardStats,
  getAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
  getUsers,
  getUserById,
  updateUserStatus,
  getRestaurants,
  updateRestaurantStatus,
  getRestaurantJoinRequests,
  approveRestaurant,
  rejectRestaurant,
  reverifyRestaurant,
  deleteRestaurant,
  getAllOffers
} from '../controllers/adminController.js';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
  updateCategoryPriority
} from '../controllers/categoryController.js';
import {
  getJoinRequests,
  getDeliveryPartnerById,
  approveDeliveryPartner,
  rejectDeliveryPartner,
  getDeliveryPartners,
  updateDeliveryPartnerStatus,
  deleteDeliveryPartner,
  reverifyDeliveryPartner
} from '../controllers/deliveryPartnerController.js';
import {
  addBonus,
  getBonusTransactions
} from '../controllers/deliveryBonusController.js';
import {
  createEarningAddon,
  getEarningAddons,
  getEarningAddonById,
  updateEarningAddon,
  deleteEarningAddon,
  toggleEarningAddonStatus,
  checkEarningAddonCompletions
} from '../controllers/earningAddonController.js';
import {
  getEarningAddonHistory,
  getEarningAddonHistoryById,
  creditEarningToWallet,
  cancelEarningAddonHistory,
  getEarningAddonHistoryStatistics
} from '../controllers/earningAddonHistoryController.js';
import {
  getEnvVariables,
  saveEnvVariables
} from '../controllers/envVariablesController.js';
import {
  getCommissionRules,
  getCommissionRuleById,
  createCommissionRule,
  updateCommissionRule,
  deleteCommissionRule,
  toggleCommissionRuleStatus,
  calculateCommission
} from '../controllers/deliveryBoyCommissionController.js';
import {
  getRestaurantCommissions,
  getApprovedRestaurants,
  getRestaurantCommissionById,
  getCommissionByRestaurantId,
  createRestaurantCommission,
  updateRestaurantCommission,
  deleteRestaurantCommission,
  toggleRestaurantCommissionStatus,
  calculateCommission as calculateRestaurantCommission
} from '../controllers/restaurantCommissionController.js';
import {
  getPendingFoodApprovals,
  approveFoodItem,
  rejectFoodItem
} from '../controllers/foodApprovalController.js';
import {
  getAbout,
  updateAbout
} from '../controllers/aboutController.js';
import {
  getTerms,
  updateTerms
} from '../controllers/termsAndConditionController.js';
import {
  getPrivacy,
  updatePrivacy
} from '../controllers/privacyPolicyController.js';
import {
  getRefund,
  updateRefund
} from '../controllers/refundPolicyController.js';
import {
  getShipping,
  updateShipping
} from '../controllers/shippingPolicyController.js';
import {
  getCancellation,
  updateCancellation
} from '../controllers/cancellationPolicyController.js';
import {
  getAllFeedbacks,
  getFeedbackById,
  updateFeedbackStatus,
  replyToFeedback,
  deleteFeedback
} from '../controllers/feedbackController.js';
import {
  getAllSafetyEmergencies,
  getSafetyEmergencyById,
  updateSafetyEmergencyStatus,
  updateSafetyEmergencyPriority,
  respondToSafetyEmergency,
  deleteSafetyEmergency
} from '../controllers/safetyEmergencyController.js';
import {
  getOrders,
  getOrderById
} from '../controllers/orderController.js';
import zoneRoutes from './zoneRoutes.js';
import { authenticateAdmin } from '../middleware/adminAuth.js';
import { uploadMiddleware } from '../../../shared/utils/cloudinaryService.js';

const router = express.Router();

// All admin routes require admin authentication
router.use(authenticateAdmin);

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

// Admin Management
router.get('/admins', getAdmins);
router.get('/admins/:id', getAdminById);
router.post('/admins', createAdmin);
router.put('/admins/:id', updateAdmin);
router.delete('/admins/:id', deleteAdmin);

// Profile Management
router.get('/profile', getAdminProfile);
router.put('/profile', updateAdminProfile);

// Settings Management
router.put('/settings/change-password', changeAdminPassword);

// User Management
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id/status', updateUserStatus);

// Restaurant Management
router.get('/restaurants', getRestaurants);
router.get('/restaurants/requests', getRestaurantJoinRequests);
router.post('/restaurants/:id/approve', approveRestaurant);
router.post('/restaurants/:id/reject', rejectRestaurant);
router.post('/restaurants/:id/reverify', reverifyRestaurant);
router.put('/restaurants/:id/status', updateRestaurantStatus);
router.delete('/restaurants/:id', deleteRestaurant);

// Category Management
router.get('/categories', getCategories);
router.get('/categories/:id', getCategoryById);
router.post('/categories', uploadMiddleware.single('image'), createCategory);
router.put('/categories/:id', uploadMiddleware.single('image'), updateCategory);
router.delete('/categories/:id', deleteCategory);
router.patch('/categories/:id/status', toggleCategoryStatus);
router.patch('/categories/:id/priority', updateCategoryPriority);

// Delivery Partner Management
router.get('/delivery-partners/requests', getJoinRequests);
router.get('/delivery-partners', getDeliveryPartners);
router.get('/delivery-partners/:id', getDeliveryPartnerById);
router.post('/delivery-partners/:id/approve', approveDeliveryPartner);
router.post('/delivery-partners/:id/reject', rejectDeliveryPartner);
router.post('/delivery-partners/:id/reverify', reverifyDeliveryPartner);
router.patch('/delivery-partners/:id/status', updateDeliveryPartnerStatus);
router.delete('/delivery-partners/:id', deleteDeliveryPartner);

// Delivery Partner Bonus Management
router.post('/delivery-partners/bonus', addBonus);
router.get('/delivery-partners/bonus/transactions', getBonusTransactions);

// Earning Addon Management
router.post('/earning-addon', createEarningAddon);
router.get('/earning-addon', getEarningAddons);
router.get('/earning-addon/:id', getEarningAddonById);
router.put('/earning-addon/:id', updateEarningAddon);
router.delete('/earning-addon/:id', deleteEarningAddon);
router.patch('/earning-addon/:id/status', toggleEarningAddonStatus);
router.post('/earning-addon/check-completions', checkEarningAddonCompletions);

// Earning Addon History Management
router.get('/earning-addon-history', getEarningAddonHistory);
router.get('/earning-addon-history/statistics', getEarningAddonHistoryStatistics);
router.get('/earning-addon-history/:id', getEarningAddonHistoryById);
router.post('/earning-addon-history/:id/credit', creditEarningToWallet);
router.patch('/earning-addon-history/:id/cancel', cancelEarningAddonHistory);

// Environment Variables Management
router.get('/env-variables', getEnvVariables);
router.post('/env-variables', saveEnvVariables);

// Delivery Boy Commission Management
router.get('/delivery-boy-commission', getCommissionRules);
router.post('/delivery-boy-commission', createCommissionRule);
router.post('/delivery-boy-commission/calculate', calculateCommission);
router.get('/delivery-boy-commission/:id', getCommissionRuleById);
router.put('/delivery-boy-commission/:id', updateCommissionRule);
router.delete('/delivery-boy-commission/:id', deleteCommissionRule);
router.patch('/delivery-boy-commission/:id/status', toggleCommissionRuleStatus);

// Restaurant Commission Management
router.get('/restaurant-commission', getRestaurantCommissions);
router.get('/restaurant-commission/approved-restaurants', getApprovedRestaurants);
router.get('/restaurant-commission/restaurant/:restaurantId', getCommissionByRestaurantId);
router.post('/restaurant-commission', createRestaurantCommission);
router.post('/restaurant-commission/calculate', calculateRestaurantCommission);
router.get('/restaurant-commission/:id', getRestaurantCommissionById);
router.put('/restaurant-commission/:id', updateRestaurantCommission);
router.delete('/restaurant-commission/:id', deleteRestaurantCommission);
router.patch('/restaurant-commission/:id/status', toggleRestaurantCommissionStatus);

// Food Approval Management
router.get('/food-approvals', getPendingFoodApprovals);
router.post('/food-approvals/:id/approve', approveFoodItem);
router.post('/food-approvals/:id/reject', rejectFoodItem);

// Offers Management
router.get('/offers', getAllOffers);

// Zone Management
router.use('/zones', zoneRoutes);

// About Page Management
router.get('/about', getAbout);
router.put('/about', updateAbout);

// Terms and Condition Management
router.get('/terms', getTerms);
router.put('/terms', updateTerms);

// Privacy Policy Management
router.get('/privacy', getPrivacy);
router.put('/privacy', updatePrivacy);

// Refund Policy Management
router.get('/refund', getRefund);
router.put('/refund', updateRefund);

// Shipping Policy Management
router.get('/shipping', getShipping);
router.put('/shipping', updateShipping);

// Cancellation Policy Management
router.get('/cancellation', getCancellation);
router.put('/cancellation', updateCancellation);

// Feedback Management
router.get('/feedback', getAllFeedbacks);
router.get('/feedback/:id', getFeedbackById);
router.put('/feedback/:id/status', updateFeedbackStatus);
router.put('/feedback/:id/reply', replyToFeedback);
router.delete('/feedback/:id', deleteFeedback);

// Safety Emergency Management
router.get('/safety-emergency', getAllSafetyEmergencies);
router.get('/safety-emergency/:id', getSafetyEmergencyById);
router.put('/safety-emergency/:id/status', updateSafetyEmergencyStatus);
router.put('/safety-emergency/:id/priority', updateSafetyEmergencyPriority);
router.put('/safety-emergency/:id/respond', respondToSafetyEmergency);
router.delete('/safety-emergency/:id', deleteSafetyEmergency);

// Order Management
router.get('/orders', getOrders);
router.get('/orders/:id', getOrderById);

export default router;

