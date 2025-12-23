import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Load environment variables
dotenv.config();

// Import configurations
import { connectDB } from './config/database.js';
import { connectRedis } from './config/redis.js';

// Import middleware
import { errorHandler } from './shared/middleware/errorHandler.js';

// Import routes
import authRoutes from './modules/auth/index.js';
import userRoutes from './modules/user/index.js';
import restaurantRoutes from './modules/restaurant/index.js';
import deliveryRoutes from './modules/delivery/index.js';
import orderRoutes from './modules/order/index.js';
import paymentRoutes from './modules/payment/index.js';
import menuRoutes from './modules/menu/index.js';
import campaignRoutes from './modules/campaign/index.js';
import notificationRoutes from './modules/notification/index.js';
import analyticsRoutes from './modules/analytics/index.js';
import adminRoutes from './modules/admin/index.js';
import subscriptionRoutes from './modules/subscription/index.js';
import uploadModuleRoutes from './modules/upload/index.js';
import locationRoutes from './modules/location/index.js';
import heroBannerRoutes from './modules/heroBanner/index.js';


// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET', 'MONGODB_URI'];
const missingEnvVars = [];

requiredEnvVars.forEach(varName => {
  let value = process.env[varName];
  
  // Remove quotes if present (dotenv sometimes includes them)
  if (value && typeof value === 'string') {
    value = value.trim();
    // Remove surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) || 
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1).trim();
    }
  }
  
  // Update the env var with cleaned value
  if (value) {
    process.env[varName] = value;
  }
  
  // Check if valid
  if (!value || value === '' || (varName === 'JWT_SECRET' && value.includes('your-super-secret'))) {
    missingEnvVars.push(varName);
  }
});

if (missingEnvVars.length > 0) {
  console.error('❌ Missing or invalid required environment variables:');
  missingEnvVars.forEach(varName => {
    console.error(`   - ${varName}${varName === 'JWT_SECRET' ? ' (must be set to a secure value, not the placeholder)' : ''}`);
  });
  console.error('\nPlease update your .env file with valid values.');
  console.error('You can copy .env.example to .env and update the values.\n');
  process.exit(1);
}

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000' || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Make io available to routes
app.set('io', io);

// Connect to databases
connectDB();
connectRedis();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000' || 'http://localhost:5173',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Data sanitization
app.use(mongoSanitize());

// Rate limiting (disabled in development mode)
if (process.env.NODE_ENV === 'production') {
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
  });

  app.use('/api/', limiter);
  console.log('Rate limiting enabled (production mode)');
} else {
  console.log('Rate limiting disabled (development mode)');
}

// Health check route
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/api', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/restaurant', restaurantRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/campaign', campaignRoutes);
app.use('/api/notification', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api', uploadModuleRoutes);
app.use('/api/location', locationRoutes);
app.use('/api', heroBannerRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Close server & exit process
  httpServer.close(() => {
    process.exit(1);
  });
});

export default app;

