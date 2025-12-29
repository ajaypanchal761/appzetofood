/**
 * Simple Google Sign-In Database Test
 * Checks if user exists in database after Google sign-in
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './modules/auth/models/User.js';

dotenv.config();

const TEST_EMAIL = 'panchalajay717@gmail.com';
const TEST_ROLE = 'user';

// Colors
const green = '\x1b[32m';
const red = '\x1b[31m';
const yellow = '\x1b[33m';
const blue = '\x1b[34m';
const cyan = '\x1b[36m';
const reset = '\x1b[0m';

function log(message, color = reset) {
  console.log(`${color}${message}${reset}`);
}

async function testDatabase() {
  try {
    log('\n' + '='.repeat(60), 'cyan');
    log('Google Sign-In Database Test', 'cyan');
    log('='.repeat(60) + '\n', 'cyan');

    // Connect to MongoDB
    log('📡 Connecting to MongoDB...', 'blue');
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      log('❌ MONGODB_URI not found in .env', 'red');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    log('✅ MongoDB connected successfully\n', 'green');

    // Check if user exists
    log(`🔍 Checking for user: ${TEST_EMAIL} (role: ${TEST_ROLE})`, 'blue');
    const user = await User.findOne({ 
      email: TEST_EMAIL.toLowerCase(), 
      role: TEST_ROLE 
    });

    if (!user) {
      log('\n❌ User NOT found in database', 'red');
      log('\n📝 Next Steps:', 'yellow');
      log('1. Open browser: http://localhost:5173/auth/sign-in', 'yellow');
      log('2. Click Google sign-in button', 'yellow');
      log('3. Sign in with: ' + TEST_EMAIL, 'yellow');
      log('4. After successful sign-in, run this script again', 'yellow');
      log('5. User should be created in database automatically\n', 'yellow');
    } else {
      log('\n✅ User FOUND in database!\n', 'green');
      
      // Display user details
      log('📋 User Details:', 'cyan');
      log('─'.repeat(60), 'cyan');
      log(`  ID: ${user._id}`, 'blue');
      log(`  Name: ${user.name || '❌ Missing'}`, user.name ? 'green' : 'red');
      log(`  Email: ${user.email || '❌ Missing'}`, user.email ? 'green' : 'red');
      log(`  Role: ${user.role || '❌ Missing'}`, user.role ? 'green' : 'red');
      log(`  Google ID: ${user.googleId || '❌ Missing'}`, user.googleId ? 'green' : 'red');
      log(`  Google Email: ${user.googleEmail || '❌ Missing'}`, user.googleEmail ? 'green' : 'red');
      log(`  Signup Method: ${user.signupMethod || '❌ Missing'}`, user.signupMethod === 'google' ? 'green' : 'red');
      log(`  Profile Image: ${user.profileImage ? '✅ Set' : '❌ Not set'}`, user.profileImage ? 'green' : 'yellow');
      log(`  Is Active: ${user.isActive !== undefined ? user.isActive : '❌ Missing'}`, user.isActive ? 'green' : 'red');
      log(`  Created At: ${user.createdAt || '❌ Missing'}`, user.createdAt ? 'green' : 'red');
      log(`  Updated At: ${user.updatedAt || '❌ Missing'}`, user.updatedAt ? 'green' : 'red');
      log('─'.repeat(60), 'cyan');

      // Check required fields
      log('\n🔍 Field Verification:', 'cyan');
      const requiredFields = {
        'name': user.name,
        'email': user.email,
        'role': user.role,
        'googleId': user.googleId,
        'googleEmail': user.googleEmail,
        'signupMethod': user.signupMethod,
        'isActive': user.isActive !== undefined
      };

      let allFieldsPresent = true;
      for (const [field, value] of Object.entries(requiredFields)) {
        const present = value !== null && value !== undefined && value !== '';
        if (present) {
          log(`  ✅ ${field}: Present`, 'green');
        } else {
          log(`  ❌ ${field}: Missing`, 'red');
          allFieldsPresent = false;
        }
      }

      if (allFieldsPresent) {
        log('\n🎉 All required fields are present!', 'green');
        log('✅ Google sign-in and database storage is working correctly!\n', 'green');
      } else {
        log('\n⚠️  Some required fields are missing', 'yellow');
        log('Please check backend logs for errors\n', 'yellow');
      }

      // Check if signupMethod is correct
      if (user.signupMethod !== 'google') {
        log(`\n⚠️  Warning: signupMethod is "${user.signupMethod}" but expected "google"`, 'yellow');
      }

      // Check if role is correct
      if (user.role !== TEST_ROLE) {
        log(`\n⚠️  Warning: role is "${user.role}" but expected "${TEST_ROLE}"`, 'yellow');
      }
    }

    // Also check all Google sign-in users
    log('\n📊 All Google Sign-In Users:', 'cyan');
    const googleUsers = await User.find({ signupMethod: 'google' }).select('name email role createdAt');
    if (googleUsers.length > 0) {
      log(`Found ${googleUsers.length} user(s) with Google sign-in:\n`, 'blue');
      googleUsers.forEach((u, index) => {
        log(`  ${index + 1}. ${u.name} (${u.email}) - ${u.role} - Created: ${u.createdAt}`, 'blue');
      });
    } else {
      log('  No users found with Google sign-in method', 'yellow');
    }

    await mongoose.connection.close();
    log('\n✅ Database connection closed\n', 'green');

  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

testDatabase();

