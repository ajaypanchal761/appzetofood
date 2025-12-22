# Appzeto Food Backend API

Backend API for Appzeto Food Delivery Platform built with Node.js, Express, and MongoDB.

## Features

- ✅ JWT-based authentication with refresh tokens
- ✅ OTP-based phone authentication via SMSHub
- ✅ Role-based access control (user, restaurant, delivery, admin)
- ✅ MongoDB database integration
- ✅ Redis caching support
- ✅ Socket.IO for real-time communication
- ✅ Rate limiting and security middleware
- ✅ Structured module-based architecture

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- Redis (optional, for caching and rate limiting)

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure:
   - MongoDB connection string
   - JWT secret key
   - SMSHub API credentials
   - Redis connection (optional)
   - Other service configurations
mongod
3. **Start MongoDB:**
   ```bash
   # Make sure MongoDB is running on your system
   mongod
   ```

4. **Start Redis (optional):**
   ```bash
   redis-server
   ```

5. **Run the server:**
   ```bash
   # Development mode (with auto-reload)
   npm run dev

   # Production mode
   npm start
   ```

## Project Structure

```
backend/
├── modules/
│   ├── auth/           # Authentication & authorization
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── services/
│   ├── user/           # User management (to be implemented)
│   ├── restaurant/     # Restaurant management (to be implemented)
│   ├── delivery/       # Delivery partner management (to be implemented)
│   ├── order/          # Order lifecycle (to be implemented)
│   ├── payment/        # Payment processing (to be implemented)
│   ├── menu/           # Menu management (to be implemented)
│   ├── campaign/       # Marketing campaigns (to be implemented)
│   ├── notification/   # Notifications (to be implemented)
│   ├── analytics/      # Analytics (to be implemented)
│   ├── admin/          # Admin operations (to be implemented)
│   ├── subscription/   # Subscriptions (to be implemented)
│   └── location/       # Geolocation (to be implemented)
├── shared/             # Shared utilities & middleware
│   ├── middleware/
│   └── utils/
├── config/             # Configuration files
│   ├── database.js
│   └── redis.js
└── server.js           # Main entry point
```

## API Endpoints

### Authentication

- `POST /api/auth/send-otp` - Send OTP to phone number
- `POST /api/auth/verify-otp` - Verify OTP and login/register
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user (protected)

### Example Requests

**Send OTP:**
```bash
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+919876543210", "purpose": "login"}'
```

**Verify OTP:**
```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+919876543210", "otp": "123456", "purpose": "login"}'
```

**Get Current User:**
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Authentication Flow

1. **Send OTP:**
   - User provides phone number
   - System generates 6-digit OTP
   - OTP is sent via SMSHub
   - OTP stored in database with 5-minute expiry

2. **Verify OTP:**
   - User provides phone number and OTP
   - System verifies OTP
   - If valid, creates/updates user and generates tokens
   - Returns access token (15 min expiry) and sets refresh token in httpOnly cookie (7 days)

3. **Refresh Token:**
   - Client sends refresh token from cookie
   - System verifies and generates new access token

## Environment Variables

See `.env.example` for all available environment variables.

## Security Features

- Helmet.js for security headers
- CORS configuration
- Rate limiting
- MongoDB injection protection
- JWT token-based authentication
- httpOnly cookies for refresh tokens
- Password hashing with bcrypt

## Development

The server runs on `http://localhost:5000` by default.

Health check endpoint: `GET /health`

## License

ISC

