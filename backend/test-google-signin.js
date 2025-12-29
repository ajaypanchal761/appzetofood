/**
 * End-to-End Test Script for Google Sign-In
 * 
 * This script tests:
 * 1. Firebase Google sign-in flow
 * 2. User storage in database
 * 3. All required fields are saved correctly
 * 
 * Usage: node test-google-signin.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import axios from 'axios';
import readline from 'readline';
import User from './modules/auth/models/User.js';

// Load environment variables
dotenv.config();

// Test configuration
const TEST_CONFIG = {
  backendUrl: process.env.BACKEND_URL || 'http://localhost:5000',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  testEmail: process.env.TEST_EMAIL || 'panchalajay717@gmail.com',
  testPassword: process.env.TEST_PASSWORD || '', // Not needed for Google sign-in
  role: 'user'
};

// Note: Firebase client SDK is not used in this test
// We test the backend API directly with an ID token obtained from browser

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60) + '\n');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Test results tracker
const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

function recordTest(name, passed, details = '') {
  testResults.tests.push({ name, passed, details });
  if (passed) {
    testResults.passed++;
    logSuccess(`Test: ${name}`);
  } else {
    testResults.failed++;
    logError(`Test: ${name}`);
    if (details) {
      logError(`  Details: ${details}`);
    }
  }
}

// Connect to MongoDB
async function connectDB() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in .env file');
    }

    logInfo(`Connecting to MongoDB: ${mongoUri.replace(/\/\/.*@/, '//***@')}`);
    await mongoose.connect(mongoUri);
    logSuccess('MongoDB connected successfully');
    return true;
  } catch (error) {
    logError(`MongoDB connection failed: ${error.message}`);
    return false;
  }
}

// Note: Firebase initialization is handled by backend Firebase Admin SDK
// This test script only verifies the backend API and database

// Test 1: Check if user exists in database before test
async function testUserExistsBefore(email, role) {
  try {
    const user = await User.findOne({ email: email.toLowerCase(), role });
    if (user) {
      logInfo(`User already exists in database: ${email}`);
      logInfo(`  User ID: ${user._id}`);
      logInfo(`  Name: ${user.name}`);
      logInfo(`  Google ID: ${user.googleId || 'Not linked'}`);
      logInfo(`  Signup Method: ${user.signupMethod || 'Not set'}`);
      return { exists: true, user };
    } else {
      logInfo(`User does not exist in database: ${email}`);
      return { exists: false, user: null };
    }
  } catch (error) {
    logError(`Error checking user existence: ${error.message}`);
    return { exists: false, user: null, error };
  }
}

// Helper function to get ID token from user input
function createReadlineInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

// Test 3: Call backend API with Firebase ID token
async function testBackendAPI(idToken, role) {
  try {
    if (!idToken) {
      logWarning('No ID token provided, skipping backend API test');
      return { success: false, data: null, message: 'No ID token' };
    }

    logInfo(`Calling backend API: POST ${TEST_CONFIG.backendUrl}/api/auth/firebase/google-login`);
    
    const response = await axios.post(
      `${TEST_CONFIG.backendUrl}/api/auth/firebase/google-login`,
      {
        idToken,
        role
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    if (response.status === 200 && response.data.success) {
      logSuccess('Backend API call successful');
      logInfo(`  Access Token: ${response.data.data.accessToken ? 'Received' : 'Missing'}`);
      logInfo(`  User ID: ${response.data.data.user?.id || 'Missing'}`);
      logInfo(`  User Email: ${response.data.data.user?.email || 'Missing'}`);
      logInfo(`  User Name: ${response.data.data.user?.name || 'Missing'}`);
      logInfo(`  User Role: ${response.data.data.user?.role || 'Missing'}`);
      logInfo(`  Signup Method: ${response.data.data.user?.signupMethod || 'Missing'}`);
      
      return {
        success: true,
        data: response.data.data,
        accessToken: response.data.data.accessToken,
        user: response.data.data.user
      };
    } else {
      logError(`Backend API returned unexpected response: ${JSON.stringify(response.data)}`);
      return { success: false, data: null, message: 'Unexpected response format' };
    }
  } catch (error) {
    if (error.response) {
      logError(`Backend API error: ${error.response.status} - ${error.response.data?.message || error.response.data?.error || 'Unknown error'}`);
      logError(`  Response data: ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      logError(`Backend API request failed: ${error.message}`);
      logError('  Make sure backend server is running on ' + TEST_CONFIG.backendUrl);
    } else {
      logError(`Backend API error: ${error.message}`);
    }
    return { success: false, data: null, error: error.message };
  }
}

// Test 4: Verify user in database after sign-in
async function testUserInDatabase(email, role, expectedFields = {}) {
  try {
    const user = await User.findOne({ email: email.toLowerCase(), role });
    
    if (!user) {
      logError(`User not found in database: ${email} with role: ${role}`);
      return { success: false, user: null, missingFields: ['user_not_found'] };
    }

    logSuccess(`User found in database: ${email}`);
    logInfo(`  User ID: ${user._id}`);
    logInfo(`  Name: ${user.name || 'Missing'}`);
    logInfo(`  Email: ${user.email || 'Missing'}`);
    logInfo(`  Role: ${user.role || 'Missing'}`);
    logInfo(`  Google ID: ${user.googleId || 'Missing'}`);
    logInfo(`  Google Email: ${user.googleEmail || 'Missing'}`);
    logInfo(`  Signup Method: ${user.signupMethod || 'Missing'}`);
    logInfo(`  Profile Image: ${user.profileImage ? 'Set' : 'Not set'}`);
    logInfo(`  Is Active: ${user.isActive !== undefined ? user.isActive : 'Missing'}`);
    logInfo(`  Created At: ${user.createdAt || 'Missing'}`);
    logInfo(`  Updated At: ${user.updatedAt || 'Missing'}`);

    // Check required fields
    const missingFields = [];
    const requiredFields = {
      name: user.name,
      email: user.email,
      role: user.role,
      googleId: user.googleId,
      googleEmail: user.googleEmail,
      signupMethod: user.signupMethod,
      isActive: user.isActive !== undefined
    };

    for (const [field, value] of Object.entries(requiredFields)) {
      if (!value && value !== false) {
        missingFields.push(field);
        logError(`  Missing required field: ${field}`);
      }
    }

    // Check expected fields
    for (const [field, expectedValue] of Object.entries(expectedFields)) {
      const actualValue = user[field];
      if (actualValue !== expectedValue) {
        logWarning(`  Field mismatch - ${field}: expected "${expectedValue}", got "${actualValue}"`);
      }
    }

    if (missingFields.length > 0) {
      return { success: false, user, missingFields };
    }

    logSuccess('All required fields are present in database');
    return { success: true, user, missingFields: [] };
  } catch (error) {
    logError(`Error verifying user in database: ${error.message}`);
    return { success: false, user: null, error: error.message };
  }
}

// Test 5: Verify user can login again (existing user flow)
async function testExistingUserLogin(idToken, email, role) {
  try {
    if (!idToken) {
      logWarning('No ID token provided, skipping existing user login test');
      return { success: false, message: 'No ID token' };
    }

    logInfo('Testing existing user login flow...');
    const result = await testBackendAPI(idToken, role);
    
    if (result.success) {
      logSuccess('Existing user login successful');
      return { success: true, data: result.data };
    } else {
      logError('Existing user login failed');
      return { success: false, error: result.error || result.message };
    }
  } catch (error) {
    logError(`Existing user login test failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Main test function
async function runTests() {
  logSection('Google Sign-In End-to-End Test');
  
  logInfo(`Test Configuration:`);
  logInfo(`  Backend URL: ${TEST_CONFIG.backendUrl}`);
  logInfo(`  Frontend URL: ${TEST_CONFIG.frontendUrl}`);
  logInfo(`  Test Email: ${TEST_CONFIG.testEmail}`);
  logInfo(`  Test Role: ${TEST_CONFIG.role}`);
  logInfo(`  MongoDB URI: ${process.env.MONGODB_URI ? 'Set' : 'Not set'}`);

  // Step 1: Connect to MongoDB
  logSection('Step 1: Database Connection');
  const dbConnected = await connectDB();
  if (!dbConnected) {
    logError('Cannot proceed without database connection');
    process.exit(1);
  }
  recordTest('Database Connection', dbConnected);

  // Step 2: Check user before test
  logSection('Step 3: Pre-Test User Check');
  const beforeCheck = await testUserExistsBefore(TEST_CONFIG.testEmail, TEST_CONFIG.role);
  recordTest('User Exists Check', true, beforeCheck.exists ? 'User exists' : 'User does not exist');

  // Step 3: Get Firebase ID token (manual step)
  logSection('Step 3: Get Firebase ID Token');
  logWarning('MANUAL STEP REQUIRED:');
  logWarning('1. Open your browser and navigate to: ' + TEST_CONFIG.frontendUrl + '/auth/sign-in');
  logWarning('2. Click on Google sign-in button');
  logWarning('3. Sign in with: ' + TEST_CONFIG.testEmail);
  logWarning('4. Open browser console (F12) and look for logs');
  logWarning('5. After sign-in, you should see: "✅ Firebase ID token obtained"');
  logWarning('6. In console, run: firebase.auth().currentUser.getIdToken().then(console.log)');
  logWarning('7. Copy the ID token and paste it below when prompted');
  
  const rl = createReadlineInterface();
  const idToken = await new Promise((resolve) => {
    rl.question('\nEnter Firebase ID token (or press Enter to skip and only check database): ', (token) => {
      rl.close();
      resolve(token.trim() || null);
    });
  });

  if (!idToken) {
    logWarning('No ID token provided. Skipping API test.');
    logWarning('To complete the full test:');
    logWarning('1. Sign in via browser');
    logWarning('2. Get ID token from browser console');
    logWarning('3. Run this script again with the token');
    
    // Still check database for existing user
    logSection('Step 4: Database Verification (Existing User)');
    const dbCheck = await testUserInDatabase(TEST_CONFIG.testEmail, TEST_CONFIG.role);
    recordTest('User in Database', dbCheck.success, dbCheck.missingFields.join(', ') || 'All fields present');
    
    await mongoose.connection.close();
    printSummary();
    process.exit(0);
  }

  // Step 4: Test backend API
  logSection('Step 4: Backend API Test');
  const apiResult = await testBackendAPI(idToken, TEST_CONFIG.role);
  recordTest('Backend API Call', apiResult.success, apiResult.error || apiResult.message || 'Success');

  if (!apiResult.success) {
    logError('Backend API test failed. Cannot proceed with database verification.');
    await mongoose.connection.close();
    printSummary();
    process.exit(1);
  }

  // Step 5: Verify user in database
  logSection('Step 5: Database Verification');
  const expectedFields = {
    email: TEST_CONFIG.testEmail.toLowerCase(),
    role: TEST_CONFIG.role,
    signupMethod: 'google'
  };
  const dbCheck = await testUserInDatabase(TEST_CONFIG.testEmail, TEST_CONFIG.role, expectedFields);
  recordTest('User in Database', dbCheck.success, dbCheck.missingFields.join(', ') || 'All fields present');

  // Step 6: Test existing user login
  logSection('Step 6: Existing User Login Test');
  const existingUserTest = await testExistingUserLogin(idToken, TEST_CONFIG.testEmail, TEST_CONFIG.role);
  recordTest('Existing User Login', existingUserTest.success, existingUserTest.error || 'Success');

  // Close database connection
  await mongoose.connection.close();
  logSuccess('Database connection closed');

  // Print summary
  printSummary();
}

function printSummary() {
  logSection('Test Summary');
  logInfo(`Total Tests: ${testResults.tests.length}`);
  logSuccess(`Passed: ${testResults.passed}`);
  if (testResults.failed > 0) {
    logError(`Failed: ${testResults.failed}`);
  } else {
    logSuccess(`Failed: ${testResults.failed}`);
  }

  console.log('\nDetailed Results:');
  testResults.tests.forEach((test, index) => {
    const status = test.passed ? '✅' : '❌';
    console.log(`  ${index + 1}. ${status} ${test.name}`);
    if (test.details) {
      console.log(`     ${test.details}`);
    }
  });

  if (testResults.failed === 0) {
    logSuccess('\n🎉 All tests passed!');
  } else {
    logError('\n❌ Some tests failed. Please review the errors above.');
  }
}

// Run tests
runTests().catch((error) => {
  logError(`Test execution failed: ${error.message}`);
  console.error(error);
  process.exit(1);
});

