/**
 * Delivery Wallet State Management Utility
 * Fetches wallet data from API instead of using localStorage/default data
 */

import { deliveryAPI } from '@/lib/api'

// Empty wallet state structure (no default data)
const EMPTY_WALLET_STATE = {
  totalBalance: 0,
  cashInHand: 0,
  totalWithdrawn: 0,
  totalEarned: 0,
  transactions: [],
  joiningBonusClaimed: false,
  joiningBonusAmount: 0
}

/**
 * Fetch wallet data from API
 * @returns {Promise<Object>} - Wallet state object
 */
export const fetchDeliveryWallet = async () => {
  try {
    const response = await deliveryAPI.getWallet()
    if (response?.data?.success && response?.data?.data?.wallet) {
      const walletData = response.data.data.wallet
      
      // Transform API response to match expected format
      // Backend now returns all transactions in 'transactions' field for weekly calculations
      return {
        totalBalance: walletData.totalBalance || 0,
        cashInHand: walletData.cashInHand || 0,
        totalWithdrawn: walletData.totalWithdrawn || 0,
        totalEarned: walletData.totalEarned || 0,
        pocketBalance: walletData.pocketBalance || (walletData.totalBalance - walletData.cashInHand),
        pendingWithdrawals: walletData.pendingWithdrawals || 0,
        joiningBonusClaimed: walletData.joiningBonusClaimed || false,
        joiningBonusAmount: walletData.joiningBonusAmount || 0,
        // Use 'transactions' field (all transactions) for weekly calculations, fallback to recentTransactions for backward compatibility
        transactions: walletData.transactions || walletData.recentTransactions || [],
        totalTransactions: walletData.totalTransactions || 0
      }
    }
    return EMPTY_WALLET_STATE
  } catch (error) {
    console.error('Error fetching wallet data:', error)
    return EMPTY_WALLET_STATE
  }
}

/**
 * Get delivery wallet state (deprecated - use fetchDeliveryWallet instead)
 * Kept for backward compatibility but returns empty state
 * @returns {Object} - Wallet state object
 */
export const getDeliveryWalletState = () => {
  // Return empty state - should use fetchDeliveryWallet() instead
  console.warn('getDeliveryWalletState is deprecated. Use fetchDeliveryWallet() instead.')
  return EMPTY_WALLET_STATE
}

/**
 * Save delivery wallet state (deprecated - data is managed by backend)
 * @param {Object} state - Wallet state object
 */
export const setDeliveryWalletState = (state) => {
  // No-op - data is managed by backend
  console.warn('setDeliveryWalletState is deprecated. Wallet data is managed by backend.')
}

/**
 * Calculate all balances dynamically
 * @param {Object} state - Wallet state
 * @returns {Object} - Calculated balances
 */
export const calculateDeliveryBalances = (state) => {
  if (!state || !state.transactions) {
    return {
      totalBalance: state?.totalBalance || 0,
      cashInHand: state?.cashInHand || 0,
      totalWithdrawn: state?.totalWithdrawn || 0,
      pendingWithdrawals: state?.pendingWithdrawals || 0,
      totalEarnings: state?.totalEarned || 0
    }
  }

  // Calculate total withdrawn from completed withdrawal transactions
  const totalWithdrawnFromTransactions = state.transactions
    .filter(t => t.type === 'withdrawal' && t.status === 'Completed')
    .reduce((sum, t) => sum + (t.amount || 0), 0)
  
  // Calculate pending withdrawals
  const pendingWithdrawals = state.transactions
    .filter(t => t.type === 'withdrawal' && t.status === 'Pending')
    .reduce((sum, t) => sum + (t.amount || 0), 0)
  
  // Calculate total earnings from payment and bonus transactions
  const totalEarningsFromTransactions = state.transactions
    .filter(t => (t.type === 'payment' || t.type === 'bonus') && t.status === 'Completed')
    .reduce((sum, t) => sum + (t.amount || 0), 0)
  
  return {
    totalBalance: state.totalBalance || 0,
    cashInHand: state.cashInHand || 0,
    totalWithdrawn: totalWithdrawnFromTransactions || state.totalWithdrawn || 0,
    pendingWithdrawals: pendingWithdrawals || state.pendingWithdrawals || 0,
    totalEarnings: totalEarningsFromTransactions || state.totalEarned || state.totalBalance || 0
  }
}

/**
 * Calculate earnings for a specific time period
 * @param {Object} state - Wallet state
 * @param {string} period - Period: 'today', 'week', 'month'
 * @returns {number} - Earnings for the period
 */
export const calculatePeriodEarnings = (state, period) => {
  if (!state || !state.transactions || !Array.isArray(state.transactions)) {
    return 0
  }

  const now = new Date()
  let startDate = new Date()
  
  switch (period) {
    case 'today':
      startDate.setHours(0, 0, 0, 0)
      break
    case 'week':
      startDate.setDate(now.getDate() - now.getDay()) // Start of week (Sunday)
      startDate.setHours(0, 0, 0, 0)
      break
    case 'month':
      startDate.setDate(1) // First day of month
      startDate.setHours(0, 0, 0, 0)
      break
    default:
      return 0
  }
  
  return state.transactions
    .filter(t => {
      if (t.type !== 'payment' && t.type !== 'bonus') return false
      if (t.status !== 'Completed') return false
      
      const transactionDate = t.date ? new Date(t.date) : (t.createdAt ? new Date(t.createdAt) : null)
      if (!transactionDate) return false
      
      return transactionDate >= startDate && transactionDate <= now
    })
    .reduce((sum, t) => sum + (t.amount || 0), 0)
}

/**
 * Fetch wallet transactions from API
 * @param {Object} params - Query params (type, status, page, limit)
 * @returns {Promise<Array>} - Array of transactions
 */
export const fetchWalletTransactions = async (params = {}) => {
  try {
    const response = await deliveryAPI.getWalletTransactions(params)
    if (response?.data?.success && response?.data?.data?.transactions) {
      return response.data.data.transactions
    }
    return []
  } catch (error) {
    console.error('Error fetching wallet transactions:', error)
    return []
  }
}

/**
 * Create withdrawal request
 * @param {number} amount - Withdrawal amount
 * @param {string} paymentMethod - Payment method (bank_transfer, upi, card)
 * @param {Object} details - Additional details (bankDetails, upiId, etc.)
 * @returns {Promise<Object>} - Created transaction
 */
export const createWithdrawalRequest = async (amount, paymentMethod, details = {}) => {
  try {
    const response = await deliveryAPI.createWithdrawalRequest({
      amount,
      paymentMethod,
      ...details
    })
    if (response?.data?.success) {
      return response.data.data
    }
    throw new Error(response?.data?.message || 'Failed to create withdrawal request')
  } catch (error) {
    console.error('Error creating withdrawal request:', error)
    throw error
  }
}

/**
 * Collect payment (mark COD payment as collected)
 * @param {string} orderId - Order ID
 * @param {number} amount - Payment amount (optional)
 * @returns {Promise<Object>} - Updated transaction
 */
export const collectPayment = async (orderId, amount = null) => {
  try {
    const response = await deliveryAPI.collectPayment({
      orderId,
      amount
    })
    if (response?.data?.success) {
      return response.data.data
    }
    throw new Error(response?.data?.message || 'Failed to collect payment')
  } catch (error) {
    console.error('Error collecting payment:', error)
    throw error
  }
}

/**
 * Get transactions by type (deprecated - use fetchWalletTransactions instead)
 * @param {string} type - Transaction type (withdrawal, payment, all)
 * @returns {Array} - Filtered transactions
 */
export const getDeliveryTransactionsByType = (type = 'all') => {
  console.warn('getDeliveryTransactionsByType is deprecated. Use fetchWalletTransactions() instead.')
  return []
}

/**
 * Get transactions by status (deprecated - use fetchWalletTransactions instead)
 * @param {string} status - Transaction status (Pending, Completed, Failed)
 * @returns {Array} - Filtered transactions
 */
export const getDeliveryTransactionsByStatus = (status) => {
  console.warn('getDeliveryTransactionsByStatus is deprecated. Use fetchWalletTransactions() instead.')
  return []
}

/**
 * Get order payment amount from wallet transactions (deprecated - use API)
 * @param {string|number} orderId - Order ID
 * @returns {number|null} - Payment amount if found, null otherwise
 */
export const getDeliveryOrderPaymentAmount = (orderId) => {
  console.warn('getDeliveryOrderPaymentAmount is deprecated. Use API to fetch transactions instead.')
  return null
}

/**
 * Get payment status for an order (deprecated - use API)
 * @param {string|number} orderId - Order ID
 * @returns {string} - Payment status ("Paid" or "Unpaid")
 */
export const getDeliveryOrderPaymentStatus = (orderId) => {
  console.warn('getDeliveryOrderPaymentStatus is deprecated. Use API to fetch transactions instead.')
  return "Unpaid"
}

/**
 * Check if payment is collected for an order (deprecated - use API)
 * @param {string|number} orderId - Order ID
 * @returns {boolean} - Whether payment is collected
 */
export const isPaymentCollected = (orderId) => {
  console.warn('isPaymentCollected is deprecated. Use API to fetch transactions instead.')
  return false
}

/**
 * Add delivery transaction (deprecated - use API instead)
 * @param {Object} transaction - Transaction object
 */
export const addDeliveryTransaction = (transaction) => {
  console.warn('addDeliveryTransaction is deprecated. Use API endpoints instead.')
  return null
}

/**
 * Create a withdraw request (deprecated - use createWithdrawalRequest instead)
 * @param {number} amount - Withdrawal amount
 * @param {string} paymentMethod - Payment method
 * @returns {Object} - Created transaction
 */
export const createDeliveryWithdrawRequest = (amount, paymentMethod) => {
  console.warn('createDeliveryWithdrawRequest is deprecated. Use createWithdrawalRequest() instead.')
  return createWithdrawalRequest(amount, paymentMethod)
}

/**
 * Add delivery earnings from completed order (deprecated - use API instead)
 * @param {number} amount - Delivery earnings amount
 * @param {string} orderId - Order ID
 * @param {string} description - Payment description
 * @param {boolean} paymentCollected - Whether payment is collected (for COD)
 */
export const addDeliveryEarnings = (amount, orderId, description, paymentCollected = false) => {
  console.warn('addDeliveryEarnings is deprecated. Use deliveryAPI.addEarning() instead.')
  return deliveryAPI.addEarning({
    amount,
    orderId,
    description,
    paymentCollected
  })
}
