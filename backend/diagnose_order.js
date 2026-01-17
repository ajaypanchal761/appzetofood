import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import models
import Order from './modules/order/models/Order.js';
import Restaurant from './modules/restaurant/models/Restaurant.js';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/appzetofood';

async function checkOrder() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const orderId = '696a8c8a7417fb9a252aadc0';
        console.log(`Checking order: ${orderId}`);

        const order = await Order.findById(orderId);
        if (!order) {
            console.log('Order not found by ID');
            const order2 = await Order.findOne({ orderId: orderId });
            if (!order2) {
                console.log('Order not found by orderId either');
                process.exit(1);
            }
            checkOrderDetails(order2);
        } else {
            checkOrderDetails(order);
        }
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

async function checkOrderDetails(order) {
    console.log('--- Order Details ---');
    console.log('ID:', order._id);
    console.log('orderId:', order.orderId);
    console.log('restaurantId (in Order):', order.restaurantId);
    console.log('restaurantName (in Order):', order.restaurantName);
    console.log('Status:', order.status);

    const restaurant = await Restaurant.findOne({
        $or: [
            { _id: mongoose.Types.ObjectId.isValid(order.restaurantId) ? order.restaurantId : null },
            { restaurantId: order.restaurantId }
        ].filter(v => v._id !== null)
    });

    if (restaurant) {
        console.log('--- Restaurant Details ---');
        console.log('ID:', restaurant._id);
        console.log('restaurantId:', restaurant.restaurantId);
        console.log('Name:', restaurant.name);
        console.log('IsActive:', restaurant.isActive);
    } else {
        console.log('Matching restaurant not found in database');

        // Check if any restaurant exists
        const allRestaurants = await Restaurant.find({}).limit(5).select('name _id restaurantId');
        console.log('Some restaurants in DB:', allRestaurants);
    }

    process.exit(0);
}

checkOrder();
