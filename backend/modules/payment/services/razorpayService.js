import Razorpay from 'razorpay';
import crypto from 'crypto';
import winston from 'winston';
import { getRazorpayCredentials } from '../../../shared/utils/envService.js';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Initialize Razorpay instance
let razorpayInstance = null;

const initializeRazorpay = async () => {
  const credentials = await getRazorpayCredentials();
  const keyId = credentials.keyId;
  const keySecret = credentials.keySecret;

  if (!keyId || !keySecret) {
    logger.warn('Razorpay credentials not found. Payment gateway will not work.');
    return null;
  }

  try {
    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });
    logger.info('Razorpay initialized successfully');
    return razorpayInstance;
  } catch (error) {
    logger.error(`Error initializing Razorpay: ${error.message}`);
    return null;
  }
};

// Get Razorpay instance
const getRazorpayInstance = async () => {
  if (!razorpayInstance) {
    return await initializeRazorpay();
  }
  return razorpayInstance;
};

/**
 * Create a Razorpay order
 * @param {Object} options - Order options
 * @param {Number} options.amount - Amount in paise (e.g., 10000 for ₹100)
 * @param {String} options.currency - Currency code (default: INR)
 * @param {String} options.receipt - Receipt ID
 * @param {Object} options.notes - Additional notes
 * @returns {Promise<Object>} Razorpay order object
 */
const createOrder = async (options) => {
  const razorpay = await getRazorpayInstance();
  if (!razorpay) {
    throw new Error('Razorpay is not initialized. Please check your credentials.');
  }

  try {
    const orderOptions = {
      amount: options.amount, // Amount in paise
      currency: options.currency || 'INR',
      receipt: options.receipt || `receipt_${Date.now()}`,
      notes: options.notes || {}
    };

    const order = await razorpay.orders.create(orderOptions);
    logger.info(`Razorpay order created: ${order.id}`, {
      orderId: order.id,
      amount: order.amount,
      receipt: order.receipt
    });

    return order;
  } catch (error) {
    logger.error(`Error creating Razorpay order: ${error.message}`, {
      error: error.message,
      options
    });
    throw error;
  }
};

/**
 * Verify Razorpay payment signature
 * @param {String} razorpayOrderId - Razorpay order ID
 * @param {String} razorpayPaymentId - Razorpay payment ID
 * @param {String} razorpaySignature - Razorpay signature
 * @returns {Boolean} True if signature is valid
 */
const verifyPayment = async (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
  const credentials = await getRazorpayCredentials();
  const keySecret = credentials.keySecret;
  
  if (!keySecret) {
    logger.error('Razorpay key secret not found');
    return false;
  }

  try {
    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    const isValid = generatedSignature === razorpaySignature;
    
    if (!isValid) {
      logger.warn('Invalid Razorpay signature', {
        razorpayOrderId,
        razorpayPaymentId,
        providedSignature: razorpaySignature,
        generatedSignature
      });
    }

    return isValid;
  } catch (error) {
    logger.error(`Error verifying Razorpay payment: ${error.message}`);
    return false;
  }
};

/**
 * Fetch payment details from Razorpay
 * @param {String} paymentId - Razorpay payment ID
 * @returns {Promise<Object>} Payment details
 */
const fetchPayment = async (paymentId) => {
  const razorpay = await getRazorpayInstance();
  if (!razorpay) {
    throw new Error('Razorpay is not initialized');
  }

  try {
    const payment = await razorpay.payments.fetch(paymentId);
    return payment;
  } catch (error) {
    logger.error(`Error fetching Razorpay payment: ${error.message}`);
    throw error;
  }
};

/**
 * Create a refund
 * @param {String} paymentId - Razorpay payment ID
 * @param {Number} amount - Refund amount in paise (optional, full refund if not provided)
 * @param {String} notes - Refund notes
 * @returns {Promise<Object>} Refund details
 */
const createRefund = async (paymentId, amount = null, notes = {}) => {
  const razorpay = await getRazorpayInstance();
  if (!razorpay) {
    throw new Error('Razorpay is not initialized');
  }

  try {
    const refundOptions = {
      notes: notes
    };

    if (amount) {
      refundOptions.amount = amount;
    }

    const refund = await razorpay.payments.refund(paymentId, refundOptions);
    logger.info(`Refund created: ${refund.id}`, {
      refundId: refund.id,
      paymentId,
      amount: refund.amount
    });

    return refund;
  } catch (error) {
    logger.error(`Error creating refund: ${error.message}`);
    throw error;
  }
};

export {
  initializeRazorpay,
  getRazorpayInstance,
  createOrder,
  verifyPayment,
  fetchPayment,
  createRefund
};

