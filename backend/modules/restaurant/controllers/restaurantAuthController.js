import Restaurant from '../models/Restaurant.js';
import otpService from '../../auth/services/otpService.js';
import jwtService from '../../auth/services/jwtService.js';
import firebaseAuthService from '../../auth/services/firebaseAuthService.js';
import { successResponse, errorResponse } from '../../../shared/utils/response.js';
import { asyncHandler } from '../../../shared/middleware/asyncHandler.js';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

/**
 * Send OTP for restaurant phone number or email
 * POST /api/restaurant/auth/send-otp
 */
export const sendOTP = asyncHandler(async (req, res) => {
  const { phone, email, purpose = 'login' } = req.body;

  // Validate that either phone or email is provided
  if (!phone && !email) {
    return errorResponse(res, 400, 'Either phone number or email is required');
  }

  // Validate phone number format if provided
  if (phone) {
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
    if (!phoneRegex.test(phone)) {
      return errorResponse(res, 400, 'Invalid phone number format');
    }
  }

  // Validate email format if provided
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return errorResponse(res, 400, 'Invalid email format');
    }
  }

  try {
    const result = await otpService.generateAndSendOTP(phone || null, purpose, email || null);
    return successResponse(res, 200, result.message, {
      expiresIn: result.expiresIn,
      identifierType: result.identifierType
    });
  } catch (error) {
    logger.error(`Error sending OTP: ${error.message}`);
    return errorResponse(res, 500, error.message);
  }
});

/**
 * Verify OTP and login/register restaurant
 * POST /api/restaurant/auth/verify-otp
 */
export const verifyOTP = asyncHandler(async (req, res) => {
  const { phone, email, otp, purpose = 'login', name, password } = req.body;

  // Validate that either phone or email is provided
  if ((!phone && !email) || !otp) {
    return errorResponse(res, 400, 'Either phone number or email, and OTP are required');
  }

  try {
    let restaurant;
    const identifier = phone || email;
    const identifierType = phone ? 'phone' : 'email';

    if (purpose === 'register') {
      // Registration flow
      // Check if restaurant already exists
      const findQuery = phone 
        ? { phone } 
        : { email };
      restaurant = await Restaurant.findOne(findQuery);

      if (restaurant) {
        return errorResponse(res, 400, `Restaurant already exists with this ${identifierType}. Please login.`);
      }

      // Name is mandatory for explicit registration
      if (!name) {
        return errorResponse(res, 400, 'Restaurant name is required for registration');
      }

      // Verify OTP (phone or email) before creating restaurant
      await otpService.verifyOTP(phone || null, otp, purpose, email || null);

      const restaurantData = {
        name,
        signupMethod: phone ? 'phone' : 'email'
      };

      if (phone) {
        restaurantData.phone = phone;
        restaurantData.phoneVerified = true;
        restaurantData.ownerPhone = phone;
        // For phone signup, set ownerEmail to empty string or phone-based email
        restaurantData.ownerEmail = email || `${phone.replace(/\s+/g, '')}@restaurant.appzeto.com`;
      }
      if (email) {
        restaurantData.email = email;
        restaurantData.ownerEmail = email;
      }

      // If password provided (email/password registration), set it
      if (password && !phone) {
        restaurantData.password = password;
      }

      // Set owner name from restaurant name if not provided separately
      restaurantData.ownerName = name;

      try {
        restaurant = await Restaurant.create(restaurantData);
        logger.info(`New restaurant registered: ${restaurant._id}`, { 
          [identifierType]: identifier, 
          restaurantId: restaurant._id
        });
      } catch (createError) {
        // Handle duplicate key error (email, phone, or slug)
        if (createError.code === 11000) {
          // Check if it's a slug conflict
          if (createError.keyPattern && createError.keyPattern.slug) {
            // Retry with unique slug
            const baseSlug = restaurantData.name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, '');
            let counter = 1;
            let uniqueSlug = `${baseSlug}-${counter}`;
            while (await Restaurant.findOne({ slug: uniqueSlug })) {
              counter++;
              uniqueSlug = `${baseSlug}-${counter}`;
            }
            restaurantData.slug = uniqueSlug;
            try {
              restaurant = await Restaurant.create(restaurantData);
              logger.info(`New restaurant registered with unique slug: ${restaurant._id}`, { 
                [identifierType]: identifier, 
                restaurantId: restaurant._id,
                slug: uniqueSlug
              });
            } catch (retryError) {
              // If still fails, check if restaurant exists
              const findQuery = phone 
                ? { phone } 
                : { email };
              restaurant = await Restaurant.findOne(findQuery);
              if (!restaurant) {
                throw retryError;
              }
              return errorResponse(res, 400, `Restaurant already exists with this ${identifierType}. Please login.`);
            }
          } else {
            // Other duplicate key errors (email, phone)
            const findQuery = phone 
              ? { phone } 
              : { email };
            restaurant = await Restaurant.findOne(findQuery);
            if (!restaurant) {
              throw createError;
            }
            return errorResponse(res, 400, `Restaurant already exists with this ${identifierType}. Please login.`);
          }
        } else {
          throw createError;
        }
      }
    } else {
      // Login (with optional auto-registration)
      const findQuery = phone 
        ? { phone } 
        : { email };
      restaurant = await Restaurant.findOne(findQuery);

      if (!restaurant && !name) {
        // Tell the client that we need restaurant name to proceed with auto-registration
        return successResponse(res, 200, 'Restaurant not found. Please provide restaurant name for registration.', {
          needsName: true,
          identifierType,
          identifier
        });
      }

      // Handle reset-password purpose
      if (purpose === 'reset-password') {
        if (!restaurant) {
          return errorResponse(res, 404, 'No restaurant account found with this email.');
        }
        // Verify OTP for password reset
        await otpService.verifyOTP(phone || null, otp, purpose, email || null);
        return successResponse(res, 200, 'OTP verified. You can now reset your password.', {
          verified: true,
          email: restaurant.email
        });
      }

      // Verify OTP first
      await otpService.verifyOTP(phone || null, otp, purpose, email || null);

      if (!restaurant) {
        // Auto-register new restaurant after OTP verification
        const restaurantData = {
          name,
          signupMethod: phone ? 'phone' : 'email'
        };

        if (phone) {
          restaurantData.phone = phone;
          restaurantData.phoneVerified = true;
          restaurantData.ownerPhone = phone;
          // For phone signup, set ownerEmail to empty string or phone-based email
          restaurantData.ownerEmail = email || `${phone.replace(/\s+/g, '')}@restaurant.appzeto.com`;
        }
        if (email) {
          restaurantData.email = email;
          restaurantData.ownerEmail = email;
        }

        if (password && !phone) {
          restaurantData.password = password;
        }

        restaurantData.ownerName = name;

        try {
          restaurant = await Restaurant.create(restaurantData);
          logger.info(`New restaurant auto-registered: ${restaurant._id}`, { 
            [identifierType]: identifier, 
            restaurantId: restaurant._id
          });
        } catch (createError) {
          if (createError.code === 11000) {
            // Check if it's a slug conflict
            if (createError.keyPattern && createError.keyPattern.slug) {
              // Retry with unique slug
              const baseSlug = restaurantData.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
              let counter = 1;
              let uniqueSlug = `${baseSlug}-${counter}`;
              while (await Restaurant.findOne({ slug: uniqueSlug })) {
                counter++;
                uniqueSlug = `${baseSlug}-${counter}`;
              }
              restaurantData.slug = uniqueSlug;
              try {
                restaurant = await Restaurant.create(restaurantData);
                logger.info(`New restaurant auto-registered with unique slug: ${restaurant._id}`, { 
                  [identifierType]: identifier, 
                  restaurantId: restaurant._id,
                  slug: uniqueSlug
                });
              } catch (retryError) {
                // If still fails, check if restaurant exists
                const findQuery = phone 
                  ? { phone } 
                  : { email };
                restaurant = await Restaurant.findOne(findQuery);
                if (!restaurant) {
                  throw retryError;
                }
                logger.info(`Restaurant found after duplicate key error: ${restaurant._id}`);
              }
            } else {
              // Other duplicate key errors (email, phone)
              const findQuery = phone 
                ? { phone } 
                : { email };
              restaurant = await Restaurant.findOne(findQuery);
              if (!restaurant) {
                throw createError;
              }
              logger.info(`Restaurant found after duplicate key error: ${restaurant._id}`);
            }
          } else {
            throw createError;
          }
        }
      } else {
        // Existing restaurant login - update verification status if needed
        if (phone && !restaurant.phoneVerified) {
          restaurant.phoneVerified = true;
          await restaurant.save();
        }
      }
    }

    // Generate tokens (email may be null for phone signups)
    const tokens = jwtService.generateTokens({
      userId: restaurant._id.toString(),
      role: 'restaurant',
      email: restaurant.email || restaurant.phone || restaurant.restaurantId
    });

    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Return access token and restaurant info
    return successResponse(res, 200, 'Authentication successful', {
      accessToken: tokens.accessToken,
      restaurant: {
        id: restaurant._id,
        restaurantId: restaurant.restaurantId,
        name: restaurant.name,
        email: restaurant.email,
        phone: restaurant.phone,
        phoneVerified: restaurant.phoneVerified,
        signupMethod: restaurant.signupMethod,
        profileImage: restaurant.profileImage,
        isActive: restaurant.isActive,
        onboarding: restaurant.onboarding
      }
    });
  } catch (error) {
    logger.error(`Error verifying OTP: ${error.message}`);
    return errorResponse(res, 400, error.message);
  }
});

/**
 * Register restaurant with email and password
 * POST /api/restaurant/auth/register
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, ownerName, ownerEmail, ownerPhone } = req.body;

  if (!name || !email || !password) {
    return errorResponse(res, 400, 'Restaurant name, email, and password are required');
  }

  // Check if restaurant already exists
  const existingRestaurant = await Restaurant.findOne({ 
    $or: [{ email }, { phone: phone || null }]
  });

  if (existingRestaurant) {
    if (existingRestaurant.email === email) {
      return errorResponse(res, 400, 'Restaurant with this email already exists. Please login.');
    }
    if (existingRestaurant.phone === phone) {
      return errorResponse(res, 400, 'Restaurant with this phone number already exists. Please login.');
    }
  }

  // Create new restaurant
  const restaurant = await Restaurant.create({
    name,
    email,
    password, // Will be hashed by pre-save hook
    phone: phone || null,
    ownerName: ownerName || name,
    ownerEmail: ownerEmail || email,
    ownerPhone: ownerPhone || phone || null,
    signupMethod: 'email'
  });

  // Generate tokens (email may be null for phone signups)
  const tokens = jwtService.generateTokens({
    userId: restaurant._id.toString(),
    role: 'restaurant',
    email: restaurant.email || restaurant.phone || restaurant.restaurantId
  });

  // Set refresh token in httpOnly cookie
  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  logger.info(`New restaurant registered via email: ${restaurant._id}`, { email, restaurantId: restaurant._id });

  return successResponse(res, 201, 'Registration successful', {
    accessToken: tokens.accessToken,
    restaurant: {
      id: restaurant._id,
      restaurantId: restaurant.restaurantId,
      name: restaurant.name,
      email: restaurant.email,
      phone: restaurant.phone,
      phoneVerified: restaurant.phoneVerified,
      signupMethod: restaurant.signupMethod,
      profileImage: restaurant.profileImage,
      isActive: restaurant.isActive
    }
  });
});

/**
 * Login restaurant with email and password
 * POST /api/restaurant/auth/login
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return errorResponse(res, 400, 'Email and password are required');
  }

  const restaurant = await Restaurant.findOne({ email }).select('+password');

  if (!restaurant) {
    return errorResponse(res, 401, 'Invalid email or password');
  }

  if (!restaurant.isActive) {
    return errorResponse(res, 401, 'Restaurant account is inactive. Please contact support.');
  }

  // Check if restaurant has a password set
  if (!restaurant.password) {
    return errorResponse(res, 400, 'Account was created with phone. Please use OTP login.');
  }

  // Verify password
  const isPasswordValid = await restaurant.comparePassword(password);

  if (!isPasswordValid) {
    return errorResponse(res, 401, 'Invalid email or password');
  }

  // Generate tokens (email may be null for phone signups)
  const tokens = jwtService.generateTokens({
    userId: restaurant._id.toString(),
    role: 'restaurant',
    email: restaurant.email || restaurant.phone || restaurant.restaurantId
  });

  // Set refresh token in httpOnly cookie
  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  logger.info(`Restaurant logged in via email: ${restaurant._id}`, { email, restaurantId: restaurant._id });

  return successResponse(res, 200, 'Login successful', {
    accessToken: tokens.accessToken,
    restaurant: {
      id: restaurant._id,
      restaurantId: restaurant.restaurantId,
      name: restaurant.name,
      email: restaurant.email,
      phone: restaurant.phone,
      phoneVerified: restaurant.phoneVerified,
      signupMethod: restaurant.signupMethod,
      profileImage: restaurant.profileImage,
      isActive: restaurant.isActive,
      onboarding: restaurant.onboarding
    }
  });
});

/**
 * Reset Password with OTP verification
 * POST /api/restaurant/auth/reset-password
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return errorResponse(res, 400, 'Email, OTP, and new password are required');
  }

  if (newPassword.length < 6) {
    return errorResponse(res, 400, 'Password must be at least 6 characters long');
  }

  const restaurant = await Restaurant.findOne({ email }).select('+password');

  if (!restaurant) {
    return errorResponse(res, 404, 'No restaurant account found with this email.');
  }

  // Verify OTP for reset-password purpose
  try {
    await otpService.verifyOTP(null, otp, 'reset-password', email);
  } catch (error) {
    logger.error(`OTP verification failed for password reset: ${error.message}`);
    return errorResponse(res, 400, 'Invalid or expired OTP. Please request a new one.');
  }

  // Update password
  restaurant.password = newPassword; // Will be hashed by pre-save hook
  await restaurant.save();

  logger.info(`Password reset successful for restaurant: ${restaurant._id}`, { email, restaurantId: restaurant._id });

  return successResponse(res, 200, 'Password reset successfully. Please login with your new password.');
});

/**
 * Refresh Access Token
 * POST /api/restaurant/auth/refresh-token
 */
export const refreshToken = asyncHandler(async (req, res) => {
  // Get refresh token from cookie
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return errorResponse(res, 401, 'Refresh token not found');
  }

  try {
    // Verify refresh token
    const decoded = jwtService.verifyRefreshToken(refreshToken);

    // Ensure it's a restaurant token
    if (decoded.role !== 'restaurant') {
      return errorResponse(res, 401, 'Invalid token for restaurant');
    }

    // Get restaurant from database
    const restaurant = await Restaurant.findById(decoded.userId).select('-password');

    if (!restaurant || !restaurant.isActive) {
      return errorResponse(res, 401, 'Restaurant not found or inactive');
    }

    // Generate new access token
    const accessToken = jwtService.generateAccessToken({
      userId: restaurant._id.toString(),
      role: 'restaurant',
      email: restaurant.email || restaurant.phone || restaurant.restaurantId
    });

    return successResponse(res, 200, 'Token refreshed successfully', {
      accessToken
    });
  } catch (error) {
    return errorResponse(res, 401, error.message || 'Invalid refresh token');
  }
});

/**
 * Logout
 * POST /api/restaurant/auth/logout
 */
export const logout = asyncHandler(async (req, res) => {
  // Clear refresh token cookie
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });

  return successResponse(res, 200, 'Logged out successfully');
});

/**
 * Get current restaurant
 * GET /api/restaurant/auth/me
 */
export const getCurrentRestaurant = asyncHandler(async (req, res) => {
  // Restaurant is attached by authenticate middleware
  return successResponse(res, 200, 'Restaurant retrieved successfully', {
    restaurant: {
      id: req.restaurant._id,
      restaurantId: req.restaurant.restaurantId,
      name: req.restaurant.name,
      email: req.restaurant.email,
      phone: req.restaurant.phone,
      phoneVerified: req.restaurant.phoneVerified,
      signupMethod: req.restaurant.signupMethod,
      profileImage: req.restaurant.profileImage,
      isActive: req.restaurant.isActive,
      onboarding: req.restaurant.onboarding,
      ownerName: req.restaurant.ownerName,
      ownerEmail: req.restaurant.ownerEmail,
      ownerPhone: req.restaurant.ownerPhone
    }
  });
});

/**
 * Login / register using Firebase Google ID token
 * POST /api/restaurant/auth/firebase/google-login
 */
export const firebaseGoogleLogin = asyncHandler(async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return errorResponse(res, 400, 'Firebase ID token is required');
  }

  // Ensure Firebase Admin is configured
  if (!firebaseAuthService.isEnabled()) {
    return errorResponse(
      res,
      500,
      'Firebase Auth is not configured. Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY in backend .env'
    );
  }

  try {
    // Verify Firebase ID token
    const decoded = await firebaseAuthService.verifyIdToken(idToken);

    const firebaseUid = decoded.uid;
    const email = decoded.email || null;
    const name = decoded.name || decoded.display_name || 'Restaurant';
    const picture = decoded.picture || decoded.photo_url || null;
    const emailVerified = !!decoded.email_verified;

    // Validate email is present
    if (!email) {
      logger.error('Firebase Google login failed: Email not found in token', { uid: firebaseUid });
      return errorResponse(res, 400, 'Email not found in Firebase user. Please ensure email is available in your Google account.');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      logger.error('Firebase Google login failed: Invalid email format', { email });
      return errorResponse(res, 400, 'Invalid email format received from Google.');
    }

    // Find existing restaurant by firebase UID (stored in googleId) or email
    let restaurant = await Restaurant.findOne({
      $or: [
        { googleId: firebaseUid },
        { email }
      ]
    });

    if (restaurant) {
      // If restaurant exists but googleId not linked yet, link it
      if (!restaurant.googleId) {
        restaurant.googleId = firebaseUid;
        restaurant.googleEmail = email;
        if (!restaurant.profileImage && picture) {
          restaurant.profileImage = { url: picture };
        }
        if (!restaurant.signupMethod) {
          restaurant.signupMethod = 'google';
        }
        await restaurant.save();
        logger.info('Linked Google account to existing restaurant', { restaurantId: restaurant._id, email });
      }

      logger.info('Existing restaurant logged in via Firebase Google', {
        restaurantId: restaurant._id,
        email
      });
    } else {
      // Auto-register new restaurant based on Firebase data
      const restaurantData = {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        googleId: firebaseUid,
        googleEmail: email.toLowerCase().trim(),
        signupMethod: 'google',
        profileImage: picture ? { url: picture } : null,
        ownerName: name.trim(),
        ownerEmail: email.toLowerCase().trim(),
        isActive: true
      };

      try {
        restaurant = await Restaurant.create(restaurantData);

        logger.info('New restaurant registered via Firebase Google login', {
          firebaseUid,
          email,
          restaurantId: restaurant._id,
          name: restaurant.name
        });
      } catch (createError) {
        // Handle duplicate key error
        if (createError.code === 11000) {
          logger.warn('Duplicate key error during restaurant creation, retrying find', { email });
          restaurant = await Restaurant.findOne({ email });
          if (!restaurant) {
            logger.error('Restaurant not found after duplicate key error', { email });
            throw createError;
          }
          // Link Google ID if not already linked
          if (!restaurant.googleId) {
            restaurant.googleId = firebaseUid;
            restaurant.googleEmail = email;
            if (!restaurant.profileImage && picture) {
              restaurant.profileImage = { url: picture };
            }
            if (!restaurant.signupMethod) {
              restaurant.signupMethod = 'google';
            }
            await restaurant.save();
          }
        } else {
          logger.error('Error creating restaurant via Firebase Google login', { error: createError.message, email });
          throw createError;
        }
      }
    }

    // Ensure restaurant is active
    if (!restaurant.isActive) {
      logger.warn('Inactive restaurant attempted login', { restaurantId: restaurant._id, email });
      return errorResponse(res, 403, 'Your restaurant account has been deactivated. Please contact support.');
    }

    // Generate JWT tokens for our app (email may be null for phone signups)
    const tokens = jwtService.generateTokens({
      userId: restaurant._id.toString(),
      role: 'restaurant',
      email: restaurant.email || restaurant.phone || restaurant.restaurantId
    });

    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return successResponse(res, 200, 'Firebase Google authentication successful', {
      accessToken: tokens.accessToken,
      restaurant: {
        id: restaurant._id,
        restaurantId: restaurant.restaurantId,
        name: restaurant.name,
        email: restaurant.email,
        phone: restaurant.phone,
        phoneVerified: restaurant.phoneVerified,
        signupMethod: restaurant.signupMethod,
        profileImage: restaurant.profileImage,
        isActive: restaurant.isActive,
        onboarding: restaurant.onboarding
      }
    });
  } catch (error) {
    logger.error(`Error in Firebase Google login: ${error.message}`);
    return errorResponse(res, 400, error.message || 'Firebase Google authentication failed');
  }
});

