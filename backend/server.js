import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cron from 'node-cron';

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
import categoryPublicRoutes from './modules/admin/routes/categoryPublicRoutes.js';
import envPublicRoutes from './modules/admin/routes/envPublicRoutes.js';
import subscriptionRoutes from './modules/subscription/index.js';
import uploadModuleRoutes from './modules/upload/index.js';
import locationRoutes from './modules/location/index.js';
import heroBannerRoutes from './modules/heroBanner/index.js';
import diningRoutes from './modules/dining/index.js';


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
// Redis connection is optional - only connects if REDIS_ENABLED=true
connectRedis().catch(() => {
  // Silently handle Redis connection failures
  // The app works without Redis
});

// Security middleware
app.use(helmet());
// CORS configuration - allow multiple origins
const allowedOrigins = [
  process.env.CORS_ORIGIN,
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174'
].filter(Boolean); // Remove undefined values

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS blocked origin: ${origin}`);
      callback(null, true); // Allow in development, block in production
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
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
app.use('/api', categoryPublicRoutes);
app.use('/api/env', envPublicRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api', uploadModuleRoutes);
app.use('/api/location', locationRoutes);
app.use('/api', heroBannerRoutes);
app.use('/api/dining', diningRoutes);

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

  // Delivery boy sends location update
  socket.on('update-location', (data) => {
    try {
      // Validate data
      if (!data.orderId || typeof data.lat !== 'number' || typeof data.lng !== 'number') {
        console.error('Invalid location update data:', data);
        return;
      }

      // Broadcast location to customer tracking this order (only to specific room)
      // Format: { orderId, lat, lng, heading }
      const locationData = {
        orderId: data.orderId,
        lat: data.lat,
        lng: data.lng,
        heading: data.heading || 0,
        timestamp: Date.now()
      };

      // Send to specific order room
      io.to(`order:${data.orderId}`).emit(`location-receive-${data.orderId}`, locationData);

      console.log(`📍 Location broadcasted to order room ${data.orderId}:`, {
        lat: locationData.lat,
        lng: locationData.lng,
        heading: locationData.heading
      });

      console.log(`📍 Location update for order ${data.orderId}:`, {
        lat: data.lat,
        lng: data.lng,
        heading: data.heading
      });
    } catch (error) {
      console.error('Error handling location update:', error);
    }
  });

  // Customer joins order tracking room
  socket.on('join-order-tracking', async (orderId) => {
    if (orderId) {
      socket.join(`order:${orderId}`);
      console.log(`Customer joined order tracking: ${orderId}`);

      // Send current location immediately when customer joins
      try {
        // Dynamic import to avoid circular dependencies
        const { default: Order } = await import('./modules/order/models/Order.js');

        const order = await Order.findById(orderId)
          .populate({
            path: 'deliveryPartnerId',
            select: 'availability',
            populate: {
              path: 'availability.currentLocation'
            }
          })
          .lean();

        if (order?.deliveryPartnerId?.availability?.currentLocation) {
          const coords = order.deliveryPartnerId.availability.currentLocation.coordinates;
          const locationData = {
            orderId,
            lat: coords[1],
            lng: coords[0],
            heading: 0,
            timestamp: Date.now()
          };

          // Send current location immediately
          socket.emit(`current-location-${orderId}`, locationData);
          console.log(`📍 Sent current location to customer for order ${orderId}`);
        }
      } catch (error) {
        console.error('Error sending current location:', error.message);
      }
    }
  });

  // Handle request for current location
  socket.on('request-current-location', async (orderId) => {
    if (!orderId) return;

    try {
      // Dynamic import to avoid circular dependencies
      const { default: Order } = await import('./modules/order/models/Order.js');

      const order = await Order.findById(orderId)
        .populate({
          path: 'deliveryPartnerId',
          select: 'availability'
        })
        .lean();

      if (order?.deliveryPartnerId?.availability?.currentLocation) {
        const coords = order.deliveryPartnerId.availability.currentLocation.coordinates;
        const locationData = {
          orderId,
          lat: coords[1],
          lng: coords[0],
          heading: 0,
          timestamp: Date.now()
        };

        // Send current location immediately
        socket.emit(`current-location-${orderId}`, locationData);
        console.log(`📍 Sent requested location for order ${orderId}`);
      }
    } catch (error) {
      console.error('Error fetching current location:', error.message);
    }
  });

  // Delivery boy joins delivery room
  socket.on('join-delivery', (deliveryId) => {
    if (deliveryId) {
      socket.join(`delivery:${deliveryId}`);
      console.log(`Delivery boy joined: ${deliveryId}`);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);

  // Initialize scheduled tasks after DB connection is established
  // Wait a bit for DB to connect, then start cron jobs
  setTimeout(() => {
    initializeScheduledTasks();
  }, 5000);
});

// Initialize scheduled tasks
function initializeScheduledTasks() {
  // Import menu schedule service
  import('./modules/restaurant/services/menuScheduleService.js').then(({ processScheduledAvailability }) => {
    // Run every minute to check for due schedules
    cron.schedule('* * * * *', async () => {
      try {
        const result = await processScheduledAvailability();
        if (result.processed > 0) {
          console.log(`[Menu Schedule Cron] ${result.message}`);
        }
      } catch (error) {
        console.error('[Menu Schedule Cron] Error:', error);
      }
    });

    console.log('✅ Menu item availability scheduler initialized (runs every minute)');
  }).catch((error) => {
    console.error('❌ Failed to initialize menu schedule service:', error);
  });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Close server & exit process
  httpServer.close(() => {
    process.exit(1);
  });
});

export default app;

