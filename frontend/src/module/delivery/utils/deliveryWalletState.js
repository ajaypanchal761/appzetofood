/**
 * Delivery Wallet State Management Utility
 * Centralized management for delivery earnings, cash in hand, and transactions
 */

import { usdToInr } from '../../restaurant/utils/currency'

// Default delivery wallet state structure (converted to INR)
const DEFAULT_DELIVERY_WALLET_STATE = {
  // Balance values (in INR)
  totalBalance: usdToInr(2480.80), // Total earnings balance
  cashInHand: usdToInr(2389.75), // Cash currently in hand
  totalWithdrawn: usdToInr(2011.00), // Total amount withdrawn
  
  // Transactions (in INR)
  transactions: [
    {
      id: 1,
      amount: usdToInr(68.00),
      description: "Transferred to Card",
      status: "Pending",
      date: "01 Jun 2023",
      type: "withdrawal"
    },
    {
      id: 2,
      amount: usdToInr(5000.00),
      description: "Transferred to Account",
      status: "Pending",
      date: "07 Feb 2023",
      type: "withdrawal"
    },
    {
      id: 3,
      amount: usdToInr(1200.00),
      description: "Payment Received",
      status: "Completed",
      date: "15 Jan 2023",
      type: "payment"
    },
    {
      id: 4,
      amount: usdToInr(500.00),
      description: "Withdrawal",
      status: "Completed",
      date: "10 Jan 2023",
      type: "withdrawal"
    }
  ],
  
  // Withdraw requests
  withdrawRequests: []
}

const DELIVERY_WALLET_STORAGE_KEY = 'delivery_wallet_state'

/**
 * Get delivery wallet state from localStorage
 * @returns {Object} - Wallet state object
 */
export const getDeliveryWalletState = () => {
  try {
    const saved = localStorage.getItem(DELIVERY_WALLET_STORAGE_KEY)
    if (saved) {
      return JSON.parse(saved)
    }
    // Initialize with default state
    setDeliveryWalletState(DEFAULT_DELIVERY_WALLET_STATE)
    return DEFAULT_DELIVERY_WALLET_STATE
  } catch (error) {
    console.error('Error reading delivery wallet state from localStorage:', error)
    return DEFAULT_DELIVERY_WALLET_STATE
  }
}

/**
 * Save delivery wallet state to localStorage
 * @param {Object} state - Wallet state object
 */
export const setDeliveryWalletState = (state) => {
  try {
    localStorage.setItem(DELIVERY_WALLET_STORAGE_KEY, JSON.stringify(state))
    // Dispatch custom event for other components
    window.dispatchEvent(new CustomEvent('deliveryWalletStateUpdated'))
  } catch (error) {
    console.error('Error saving delivery wallet state to localStorage:', error)
  }
}

/**
 * Calculate all balances dynamically
 * @param {Object} state - Wallet state
 * @returns {Object} - Calculated balances
 */
export const calculateDeliveryBalances = (state) => {
  // Calculate total withdrawn from completed withdrawal transactions
  const totalWithdrawnFromTransactions = state.transactions
    .filter(t => t.type === 'withdrawal' && t.status === 'Completed')
    .reduce((sum, t) => sum + t.amount, 0)
  
  // Calculate pending withdrawals
  const pendingWithdrawals = state.transactions
    .filter(t => t.type === 'withdrawal' && t.status === 'Pending')
    .reduce((sum, t) => sum + t.amount, 0)
  
  // Calculate total earnings from payment transactions
  const totalEarningsFromTransactions = state.transactions
    .filter(t => t.type === 'payment' && t.status === 'Completed')
    .reduce((sum, t) => sum + t.amount, 0)
  
  return {
    totalBalance: state.totalBalance,
    cashInHand: state.cashInHand,
    totalWithdrawn: totalWithdrawnFromTransactions || state.totalWithdrawn,
    pendingWithdrawals: pendingWithdrawals,
    totalEarnings: totalEarningsFromTransactions || state.totalBalance
  }
}

/**
 * Calculate earnings for a specific time period
 * @param {Object} state - Wallet state
 * @param {string} period - Period: 'today', 'week', 'month'
 * @returns {number} - Earnings for the period
 */
export const calculatePeriodEarnings = (state, period) => {
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
      if (t.type !== 'payment' || t.status !== 'Completed') return false
      
      const transactionDate = new Date(t.date)
      return transactionDate >= startDate && transactionDate <= now
    })
    .reduce((sum, t) => sum + t.amount, 0)
}

/**
 * Add a transaction
 * @param {Object} transaction - Transaction object
 */
export const addDeliveryTransaction = (transaction) => {
  const state = getDeliveryWalletState()
  const newTransaction = {
    id: Date.now(),
    ...transaction,
    date: transaction.date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  }
  
  state.transactions.unshift(newTransaction)
  
  // Update balances based on transaction
  if (transaction.type === 'payment' && transaction.status === 'Completed') {
    state.totalBalance += transaction.amount
    // If payment is collected, add to cash in hand
    if (transaction.paymentCollected) {
      state.cashInHand += transaction.amount
    }
  } else if (transaction.type === 'withdrawal' && transaction.status === 'Completed') {
    state.totalBalance -= transaction.amount
    state.cashInHand -= transaction.amount
  }
  
  setDeliveryWalletState(state)
  return newTransaction
}

/**
 * Create a withdraw request
 * @param {number} amount - Withdrawal amount
 * @param {string} paymentMethod - Payment method
 * @returns {Object} - Created transaction
 */
export const createDeliveryWithdrawRequest = (amount, paymentMethod) => {
  const transaction = {
    amount: parseFloat(amount),
    description: `Withdrawal via ${paymentMethod}`,
    status: "Pending",
    type: "withdrawal",
    paymentMethod: paymentMethod
  }
  
  return addDeliveryTransaction(transaction)
}

/**
 * Add delivery earnings from completed order
 * @param {number} amount - Delivery earnings amount
 * @param {string} orderId - Order ID
 * @param {string} description - Payment description
 * @param {boolean} paymentCollected - Whether payment is collected (for COD)
 */
export const addDeliveryEarnings = (amount, orderId, description, paymentCollected = false) => {
  const transaction = {
    amount: parseFloat(amount),
    description: description || `Delivery earnings for Order #${orderId}`,
    status: "Completed",
    type: "payment",
    orderId: orderId,
    paymentCollected: paymentCollected
  }
  
  return addDeliveryTransaction(transaction)
}

/**
 * Update cash in hand when payment is collected
 * @param {number} amount - Payment amount collected
 * @param {string} orderId - Order ID
 */
export const collectPayment = (amount, orderId) => {
  const state = getDeliveryWalletState()
  state.cashInHand += parseFloat(amount)
  
  // Update transaction if exists
  const transaction = state.transactions.find(
    t => t.type === 'payment' && t.orderId === String(orderId)
  )
  if (transaction) {
    transaction.paymentCollected = true
  }
  
  setDeliveryWalletState(state)
}

/**
 * Get transactions by type
 * @param {string} type - Transaction type (withdrawal, payment, all)
 * @returns {Array} - Filtered transactions
 */
export const getDeliveryTransactionsByType = (type = 'all') => {
  const state = getDeliveryWalletState()
  if (type === 'all') {
    return state.transactions
  }
  return state.transactions.filter(t => t.type === type)
}

/**
 * Get transactions by status
 * @param {string} status - Transaction status (Pending, Completed, Failed)
 * @returns {Array} - Filtered transactions
 */
export const getDeliveryTransactionsByStatus = (status) => {
  const state = getDeliveryWalletState()
  return state.transactions.filter(t => t.status === status)
}

/**
 * Get order payment amount from wallet transactions
 * @param {string|number} orderId - Order ID
 * @returns {number|null} - Payment amount if found, null otherwise
 */
export const getDeliveryOrderPaymentAmount = (orderId) => {
  const state = getDeliveryWalletState()
  const paymentTransaction = state.transactions.find(
    t => t.type === 'payment' && t.orderId === String(orderId)
  )
  return paymentTransaction ? paymentTransaction.amount : null
}

/**
 * Get payment status for an order
 * @param {string|number} orderId - Order ID
 * @returns {string} - Payment status ("Paid" or "Unpaid")
 */
export const getDeliveryOrderPaymentStatus = (orderId) => {
  const state = getDeliveryWalletState()
  const paymentTransaction = state.transactions.find(
    t => t.type === 'payment' && t.orderId === String(orderId) && t.status === 'Completed'
  )
  return paymentTransaction ? "Paid" : "Unpaid"
}

/**
 * Check if payment is collected for an order
 * @param {string|number} orderId - Order ID
 * @returns {boolean} - Whether payment is collected
 */
export const isPaymentCollected = (orderId) => {
  const state = getDeliveryWalletState()
  const paymentTransaction = state.transactions.find(
    t => t.type === 'payment' && t.orderId === String(orderId)
  )
  return paymentTransaction ? paymentTransaction.paymentCollected || false : false
}

