import express from 'express';
import {
  getWallet,
  getTransactions,
  createWithdrawalRequest,
  addEarning,
  collectPayment,
  claimJoiningBonus,
  getWalletStats
} from '../controllers/deliveryWalletController.js';
import { authenticate } from '../middleware/deliveryAuth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Wallet routes
router.get('/', getWallet); // GET /api/delivery/wallet
router.get('/transactions', getTransactions); // GET /api/delivery/wallet/transactions
router.get('/stats', getWalletStats); // GET /api/delivery/wallet/stats
router.post('/withdraw', createWithdrawalRequest); // POST /api/delivery/wallet/withdraw
router.post('/earnings', addEarning); // POST /api/delivery/wallet/earnings
router.post('/collect-payment', collectPayment); // POST /api/delivery/wallet/collect-payment
router.post('/claim-joining-bonus', claimJoiningBonus); // POST /api/delivery/wallet/claim-joining-bonus

export default router;

