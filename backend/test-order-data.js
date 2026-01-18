/**
 * Test script to verify order data without starting server
 * Checks if orders are correctly assigned to restaurants
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './modules/order/models/Order.js';
import Restaurant from './modules/restaurant/models/Restaurant.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/appzetofood';

async function testOrderData() {
  try {
    console.log('🧪 Testing Order Data Assignment...\n');

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
      console.error('❌ Sagar Restaurant not found');
      process.exit(1);
    }

    console.log('✅ Found Sagar Restaurant:');
    console.log(`   Name: ${sagarRestaurant.name}`);
    console.log(`   MongoDB _id: ${sagarRestaurant._id}`);
    console.log(`   restaurantId field: ${sagarRestaurant.restaurantId}`);
    console.log(`   Is Active: ${sagarRestaurant.isActive}`);
    console.log(`   Is Accepting Orders: ${sagarRestaurant.isAcceptingOrders}\n`);

    // Prepare restaurantId variations
    const restaurantIdVariations = [
      sagarRestaurant._id.toString(),
      sagarRestaurant.restaurantId,
      String(sagarRestaurant._id)
    ];

    console.log('🔍 Restaurant ID variations to search:', restaurantIdVariations);
    console.log('');

    // Find orders with different queries
    console.log('📊 Testing different query methods:\n');

    // Method 1: Direct match with _id.toString()
    const orders1 = await Order.find({
      restaurantId: sagarRestaurant._id.toString()
    }).countDocuments();
    console.log(`1. Query by _id.toString(): ${orders1} orders`);

    // Method 2: Using $in with variations
    const orders2 = await Order.find({
      restaurantId: { $in: restaurantIdVariations }
    }).countDocuments();
    console.log(`2. Query by $in variations: ${orders2} orders`);

    // Method 3: Direct match with restaurantId field
    if (sagarRestaurant.restaurantId) {
      const orders3 = await Order.find({
        restaurantId: sagarRestaurant.restaurantId
      }).countDocuments();
      console.log(`3. Query by restaurantId field: ${orders3} orders`);
    }

    // Get actual orders
    const allOrders = await Order.find({
      restaurantId: { $in: restaurantIdVariations }
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    console.log(`\n✅ Total orders found: ${allOrders.length}\n`);

    if (allOrders.length > 0) {
      console.log('📋 Recent Orders Details:\n');
      allOrders.forEach((order, index) => {
        console.log(`Order ${index + 1}:`);
        console.log(`   Order ID: ${order.orderId}`);
        console.log(`   Restaurant ID: ${order.restaurantId} (type: ${typeof order.restaurantId})`);
        console.log(`   Restaurant Name: ${order.restaurantName}`);
        console.log(`   Status: ${order.status}`);
        console.log(`   Payment: ${order.payment?.status || 'N/A'}`);
        console.log(`   Created: ${order.createdAt}`);
        console.log(`   Items: ${order.items.length} item(s)`);
        
        // Check if restaurantId matches
        const matches = restaurantIdVariations.some(v => String(v) === String(order.restaurantId));
        console.log(`   ✅ Restaurant ID Match: ${matches ? 'YES' : 'NO'}`);
        if (!matches) {
          console.log(`   ⚠️  MISMATCH! Expected one of: ${restaurantIdVariations.join(', ')}`);
          console.log(`      Got: ${order.restaurantId}`);
        }
        console.log('');
      });

      // Check for verified payment orders
      const verifiedOrders = allOrders.filter(o => 
        o.payment?.status === 'completed' && o.status === 'confirmed'
      );
      console.log(`\n💰 Verified Payment Orders: ${verifiedOrders.length}/${allOrders.length}`);
    }

    // Check for other restaurants' orders (to see if there's cross-contamination)
    console.log('\n🔍 Checking for orders assigned to wrong restaurants...');
    const allRestaurants = await Restaurant.find({}).select('name _id restaurantId').limit(5).lean();
    
    for (const restaurant of allRestaurants) {
      if (restaurant.name.toLowerCase().includes('sagar')) continue;
      
      const wrongOrders = await Order.find({
        restaurantId: restaurant._id.toString(),
        restaurantName: { $regex: /sagar/i }
      }).countDocuments();
      
      if (wrongOrders > 0) {
        console.log(`⚠️  Found ${wrongOrders} order(s) for "${restaurant.name}" but with "Sagar" in name!`);
      }
    }

    // Summary
    console.log('\n📊 Test Summary:');
    console.log(`   ✅ Sagar Restaurant Found`);
    console.log(`   ✅ Orders Found: ${allOrders.length}`);
    console.log(`   ✅ Restaurant ID Format: ${sagarRestaurant._id.toString()}`);
    console.log(`   ✅ All orders have correct restaurantId: ${allOrders.every(o => 
      restaurantIdVariations.some(v => String(v) === String(o.restaurantId))
    ) ? 'YES' : 'NO'}\n`);

    await mongoose.disconnect();
    console.log('✅ Test completed');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testOrderData();

