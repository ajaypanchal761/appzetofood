/**
 * Test script to verify order notification flow
 * This script tests if orders are being assigned correctly to restaurants
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './modules/order/models/Order.js';
import Restaurant from './modules/restaurant/models/Restaurant.js';
import { notifyRestaurantNewOrder } from './modules/order/services/restaurantNotificationService.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/appzetofood';

async function testOrderNotification() {
  try {
    console.log('🧪 Starting Order Notification Test...\n');

    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find Sagar Restaurant
    console.log('🔍 Looking for Sagar Restaurant...');
    const sagarRestaurant = await Restaurant.findOne({
      name: { $regex: /sagar/i }
    }).lean();

    if (!sagarRestaurant) {
      console.error('❌ Sagar Restaurant not found in database');
      console.log('💡 Available restaurants:');
      const allRestaurants = await Restaurant.find({}).select('name restaurantId _id').limit(10).lean();
      allRestaurants.forEach(r => {
        console.log(`   - ${r.name} (ID: ${r._id}, restaurantId: ${r.restaurantId})`);
      });
      process.exit(1);
    }

    console.log('✅ Found Sagar Restaurant:');
    console.log(`   Name: ${sagarRestaurant.name}`);
    console.log(`   MongoDB _id: ${sagarRestaurant._id}`);
    console.log(`   restaurantId: ${sagarRestaurant.restaurantId}`);
    console.log(`   Is Active: ${sagarRestaurant.isActive}`);
    console.log(`   Is Accepting Orders: ${sagarRestaurant.isAcceptingOrders}\n`);

    // Find recent orders for Sagar Restaurant
    console.log('🔍 Checking recent orders for Sagar Restaurant...');
    const restaurantIdVariations = [
      sagarRestaurant._id.toString(),
      sagarRestaurant.restaurantId,
      sagarRestaurant._id
    ];

    const recentOrders = await Order.find({
      restaurantId: { $in: restaurantIdVariations }
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    console.log(`✅ Found ${recentOrders.length} recent order(s):\n`);
    
    if (recentOrders.length === 0) {
      console.log('⚠️  No orders found for Sagar Restaurant');
      console.log('💡 This could mean:');
      console.log('   1. No orders have been placed yet');
      console.log('   2. Orders are being saved with different restaurantId format');
      console.log('   3. RestaurantId mismatch issue\n');
    } else {
      recentOrders.forEach((order, index) => {
        console.log(`Order ${index + 1}:`);
        console.log(`   Order ID: ${order.orderId}`);
        console.log(`   Restaurant ID in order: ${order.restaurantId} (type: ${typeof order.restaurantId})`);
        console.log(`   Restaurant Name: ${order.restaurantName}`);
        console.log(`   Status: ${order.status}`);
        console.log(`   Payment Status: ${order.payment?.status || 'N/A'}`);
        console.log(`   Created At: ${order.createdAt}`);
        console.log(`   Items: ${order.items.map(i => `${i.name} x${i.quantity}`).join(', ')}`);
        console.log(`   Total: ₹${order.pricing?.total || 0}\n`);
      });
    }

    // Test notification for the most recent order
    if (recentOrders.length > 0) {
      const latestOrder = recentOrders[0];
      console.log('🧪 Testing notification for latest order...');
      console.log(`   Order ID: ${latestOrder.orderId}`);
      console.log(`   Restaurant ID: ${latestOrder.restaurantId}\n`);

      try {
        const result = await notifyRestaurantNewOrder(latestOrder, latestOrder.restaurantId);
        console.log('✅ Notification test result:');
        console.log(JSON.stringify(result, null, 2));
      } catch (error) {
        console.error('❌ Notification test failed:');
        console.error(`   Error: ${error.message}`);
        console.error(`   Stack: ${error.stack}`);
      }
    }

    // Check for orders with payment verified but not delivered
    console.log('\n🔍 Checking orders with verified payment...');
    const verifiedOrders = await Order.find({
      restaurantId: { $in: restaurantIdVariations },
      'payment.status': 'completed',
      status: 'confirmed'
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    console.log(`✅ Found ${verifiedOrders.length} order(s) with verified payment:\n`);
    verifiedOrders.forEach((order, index) => {
      console.log(`Order ${index + 1}:`);
      console.log(`   Order ID: ${order.orderId}`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Payment Status: ${order.payment?.status}`);
      console.log(`   Created At: ${order.createdAt}`);
      console.log(`   Restaurant ID: ${order.restaurantId}\n`);
    });

    // Summary
    console.log('\n📊 Test Summary:');
    console.log(`   Restaurant Found: ✅`);
    console.log(`   Total Orders Found: ${recentOrders.length}`);
    console.log(`   Verified Payment Orders: ${verifiedOrders.length}`);
    console.log(`   Restaurant ID Format: ${sagarRestaurant._id.toString()}`);
    console.log(`   Restaurant ID Variations: ${restaurantIdVariations.join(', ')}\n`);

    // Disconnect
    await mongoose.disconnect();
    console.log('✅ Test completed successfully');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testOrderNotification();

