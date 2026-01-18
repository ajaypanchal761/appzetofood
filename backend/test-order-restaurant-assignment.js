/**
 * Test script to verify orders are assigned to correct restaurants
 * Checks if orders placed for a restaurant actually appear at that restaurant
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './modules/order/models/Order.js';
import Restaurant from './modules/restaurant/models/Restaurant.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/appzetofood';

async function testOrderRestaurantAssignment() {
  try {
    console.log('🧪 Testing Order-Restaurant Assignment...\n');

    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all restaurants
    console.log('🔍 Fetching all restaurants...');
    const restaurants = await Restaurant.find({})
      .select('name _id restaurantId isActive isAcceptingOrders')
      .lean();
    
    console.log(`✅ Found ${restaurants.length} restaurant(s)\n`);

    // Get recent orders (last 20)
    console.log('🔍 Fetching recent orders...');
    const recentOrders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(20)
      .select('orderId restaurantId restaurantName items status payment createdAt userId')
      .lean();

    console.log(`✅ Found ${recentOrders.length} recent order(s)\n`);

    if (recentOrders.length === 0) {
      console.log('⚠️  No orders found in database');
      await mongoose.disconnect();
      return;
    }

    // Test 1: Check if orders are assigned to correct restaurants
    console.log('📊 TEST 1: Verifying Order-Restaurant Assignment\n');
    console.log('=' .repeat(80));
    
    let correctAssignments = 0;
    let incorrectAssignments = 0;
    const assignmentDetails = [];

    for (const order of recentOrders) {
      const orderRestaurantId = order.restaurantId;
      const orderRestaurantName = order.restaurantName;

      // Find restaurant by order's restaurantId
      let assignedRestaurant = null;
      
      // Try to find by MongoDB _id (most common case)
      if (mongoose.Types.ObjectId.isValid(orderRestaurantId)) {
        assignedRestaurant = restaurants.find(r => 
          r._id.toString() === orderRestaurantId
        );
      }
      
      // Try to find by restaurantId field
      if (!assignedRestaurant) {
        assignedRestaurant = restaurants.find(r => 
          r.restaurantId === orderRestaurantId
        );
      }

      const isCorrect = assignedRestaurant && 
                       assignedRestaurant.name === orderRestaurantName;

      assignmentDetails.push({
        orderId: order.orderId,
        orderRestaurantId,
        orderRestaurantName,
        assignedRestaurant: assignedRestaurant ? assignedRestaurant.name : 'NOT FOUND',
        assignedRestaurantId: assignedRestaurant ? assignedRestaurant._id.toString() : 'N/A',
        isCorrect,
        items: order.items.map(i => i.name).join(', ')
      });

      if (isCorrect) {
        correctAssignments++;
      } else {
        incorrectAssignments++;
      }
    }

    // Display results
    console.log('\n📋 Order Assignment Details:\n');
    assignmentDetails.forEach((detail, index) => {
      const status = detail.isCorrect ? '✅' : '❌';
      console.log(`${status} Order ${index + 1}: ${detail.orderId}`);
      console.log(`   Order Restaurant: ${detail.orderRestaurantName}`);
      console.log(`   Order Restaurant ID: ${detail.orderRestaurantId}`);
      console.log(`   Assigned Restaurant: ${detail.assignedRestaurant}`);
      console.log(`   Assigned Restaurant ID: ${detail.assignedRestaurantId}`);
      console.log(`   Items: ${detail.items}`);
      console.log(`   Status: ${detail.isCorrect ? 'CORRECT ✅' : 'INCORRECT ❌'}`);
      console.log('');
    });

    console.log('=' .repeat(80));
    console.log(`\n📊 Assignment Summary:`);
    console.log(`   ✅ Correct Assignments: ${correctAssignments}/${recentOrders.length}`);
    console.log(`   ❌ Incorrect Assignments: ${incorrectAssignments}/${recentOrders.length}`);
    console.log(`   📈 Accuracy: ${((correctAssignments / recentOrders.length) * 100).toFixed(1)}%\n`);

    // Test 2: Check if restaurants can fetch their orders via API query logic
    console.log('📊 TEST 2: Testing Restaurant API Query Logic\n');
    console.log('=' .repeat(80));

    for (const restaurant of restaurants.slice(0, 5)) { // Test first 5 restaurants
      const restaurantIdString = restaurant._id?.toString() || restaurant.restaurantId;
      
      // Prepare restaurantId variations (same as API)
      const restaurantIdVariations = [restaurantIdString];
      if (mongoose.Types.ObjectId.isValid(restaurantIdString)) {
        const objectIdString = new mongoose.Types.ObjectId(restaurantIdString).toString();
        if (!restaurantIdVariations.includes(objectIdString)) {
          restaurantIdVariations.push(objectIdString);
        }
      }
      if (restaurant.restaurantId && !restaurantIdVariations.includes(restaurant.restaurantId)) {
        restaurantIdVariations.push(restaurant.restaurantId);
      }

      // Query orders using API logic
      const restaurantOrders = await Order.find({
        $or: [
          { restaurantId: { $in: restaurantIdVariations } },
          { restaurantId: restaurantIdString }
        ]
      })
        .select('orderId restaurantId restaurantName status payment createdAt')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

      console.log(`\n🏪 ${restaurant.name}:`);
      console.log(`   Restaurant ID: ${restaurantIdString}`);
      console.log(`   Restaurant ID Variations: ${restaurantIdVariations.join(', ')}`);
      console.log(`   Orders Found via API Query: ${restaurantOrders.length}`);

      if (restaurantOrders.length > 0) {
        console.log(`   Recent Orders:`);
        restaurantOrders.slice(0, 3).forEach(order => {
          const match = order.restaurantName === restaurant.name;
          const status = match ? '✅' : '❌';
          console.log(`   ${status} ${order.orderId} - ${order.restaurantName} (${order.status})`);
        });
      } else {
        console.log(`   ⚠️  No orders found for this restaurant`);
      }
    }

    console.log('\n' + '=' .repeat(80));

    // Test 3: Check for cross-restaurant contamination
    console.log('\n📊 TEST 3: Checking for Cross-Restaurant Contamination\n');
    console.log('=' .repeat(80));

    const contaminationIssues = [];

    for (const order of recentOrders) {
      const orderRestaurantId = order.restaurantId;
      const orderRestaurantName = order.restaurantName;

      // Check if this order appears in other restaurants' queries
      for (const restaurant of restaurants) {
        if (restaurant.name === orderRestaurantName) continue; // Skip correct restaurant

        const restaurantIdString = restaurant._id?.toString() || restaurant.restaurantId;
        const restaurantIdVariations = [restaurantIdString];
        if (mongoose.Types.ObjectId.isValid(restaurantIdString)) {
          const objectIdString = new mongoose.Types.ObjectId(restaurantIdString).toString();
          if (!restaurantIdVariations.includes(objectIdString)) {
            restaurantIdVariations.push(objectIdString);
          }
        }

        // Check if order would be fetched by wrong restaurant
        const wouldBeFetched = restaurantIdVariations.some(v => String(v) === String(orderRestaurantId));

        if (wouldBeFetched) {
          contaminationIssues.push({
            orderId: order.orderId,
            orderRestaurant: orderRestaurantName,
            wrongRestaurant: restaurant.name,
            matchingId: restaurantIdVariations.find(v => String(v) === String(orderRestaurantId))
          });
        }
      }
    }

    if (contaminationIssues.length > 0) {
      console.log(`\n❌ Found ${contaminationIssues.length} contamination issue(s):\n`);
      contaminationIssues.forEach(issue => {
        console.log(`   Order: ${issue.orderId}`);
        console.log(`   Should be at: ${issue.orderRestaurant}`);
        console.log(`   But appears at: ${issue.wrongRestaurant}`);
        console.log(`   Matching ID: ${issue.matchingId}`);
        console.log('');
      });
    } else {
      console.log(`\n✅ No cross-restaurant contamination found!\n`);
    }

    console.log('=' .repeat(80));

    // Test 4: Specific test for Sagar Restaurant
    console.log('\n📊 TEST 4: Specific Test for Sagar Restaurant\n');
    console.log('=' .repeat(80));

    const sagarRestaurant = restaurants.find(r => 
      r.name.toLowerCase().includes('sagar')
    );

    if (sagarRestaurant) {
      console.log(`\n🏪 Found Sagar Restaurant:`);
      console.log(`   Name: ${sagarRestaurant.name}`);
      console.log(`   ID: ${sagarRestaurant._id}`);
      console.log(`   restaurantId: ${sagarRestaurant.restaurantId}`);

      // Get orders for Sagar Restaurant
      const sagarRestaurantIdString = sagarRestaurant._id.toString();
      const sagarRestaurantIdVariations = [
        sagarRestaurantIdString,
        sagarRestaurant.restaurantId,
        String(sagarRestaurant._id)
      ];

      const sagarOrders = await Order.find({
        restaurantId: { $in: sagarRestaurantIdVariations }
      })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

      console.log(`\n   Orders for Sagar Restaurant: ${sagarOrders.length}`);

      if (sagarOrders.length > 0) {
        console.log(`\n   Recent Orders:`);
        sagarOrders.forEach((order, index) => {
          const isCorrect = order.restaurantName === sagarRestaurant.name;
          const status = isCorrect ? '✅' : '❌';
          console.log(`   ${status} ${order.orderId}`);
          console.log(`      Restaurant Name: ${order.restaurantName}`);
          console.log(`      Restaurant ID: ${order.restaurantId}`);
          console.log(`      Status: ${order.status}`);
          console.log(`      Payment: ${order.payment?.status || 'N/A'}`);
          console.log(`      Created: ${order.createdAt}`);
          console.log('');
        });

        // Check if all orders are correctly assigned
        const allCorrect = sagarOrders.every(o => o.restaurantName === sagarRestaurant.name);
        console.log(`   ✅ All orders correctly assigned: ${allCorrect ? 'YES' : 'NO'}`);
      } else {
        console.log(`   ⚠️  No orders found for Sagar Restaurant`);
      }
    } else {
      console.log(`\n⚠️  Sagar Restaurant not found`);
    }

    console.log('\n' + '=' .repeat(80));

    // Final Summary
    console.log('\n📊 FINAL SUMMARY:\n');
    console.log(`   Total Restaurants: ${restaurants.length}`);
    console.log(`   Total Orders Tested: ${recentOrders.length}`);
    console.log(`   ✅ Correct Assignments: ${correctAssignments}`);
    console.log(`   ❌ Incorrect Assignments: ${incorrectAssignments}`);
    console.log(`   🚨 Contamination Issues: ${contaminationIssues.length}`);
    console.log(`   📈 Overall Accuracy: ${((correctAssignments / recentOrders.length) * 100).toFixed(1)}%\n`);

    if (incorrectAssignments > 0 || contaminationIssues.length > 0) {
      console.log('❌ ISSUES FOUND:');
      if (incorrectAssignments > 0) {
        console.log(`   - ${incorrectAssignments} order(s) assigned to wrong restaurant`);
      }
      if (contaminationIssues.length > 0) {
        console.log(`   - ${contaminationIssues.length} cross-restaurant contamination(s)`);
      }
    } else {
      console.log('✅ ALL TESTS PASSED: Orders are correctly assigned to restaurants!\n');
    }

    await mongoose.disconnect();
    console.log('✅ Test completed');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testOrderRestaurantAssignment();

