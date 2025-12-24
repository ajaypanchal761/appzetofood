import Inventory from '../models/Inventory.js';
import Restaurant from '../models/Restaurant.js';
import { successResponse, errorResponse } from '../../../shared/utils/response.js';
import mongoose from 'mongoose';

// Get inventory for a restaurant
export const getInventory = async (req, res) => {
  try {
    const ownerId = req.user._id;
    
    // Find restaurant by owner
    const restaurant = await Restaurant.findOne({ owner: ownerId });
    if (!restaurant) {
      return errorResponse(res, 404, 'Restaurant not found');
    }

    // Find or create inventory
    let inventory = await Inventory.findOne({ restaurant: restaurant._id });
    
    if (!inventory) {
      // Create empty inventory
      inventory = new Inventory({
        restaurant: restaurant._id,
        categories: [],
        isActive: true,
      });
      await inventory.save();
    }

    return successResponse(res, 200, 'Inventory retrieved successfully', {
      inventory: {
        categories: inventory.categories || [],
        isActive: inventory.isActive,
      },
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return errorResponse(res, 500, 'Failed to fetch inventory');
  }
};

// Update inventory (upsert)
export const updateInventory = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const { categories } = req.body;

    // Find restaurant by owner
    const restaurant = await Restaurant.findOne({ owner: ownerId });
    if (!restaurant) {
      return errorResponse(res, 404, 'Restaurant not found');
    }

    // Normalize and validate categories
    const normalizedCategories = Array.isArray(categories) ? categories.map((category, index) => {
      const items = Array.isArray(category.items) ? category.items : [];
      return {
        id: category.id || `category-${index}`,
        name: category.name || "Unnamed Category",
        description: category.description || "",
        itemCount: category.itemCount ?? items.length,
        inStock: category.inStock !== undefined ? category.inStock : true,
        items: items.map(item => ({
          id: String(item.id || Date.now() + Math.random()),
          name: item.name || "Unnamed Item",
          inStock: item.inStock !== undefined ? item.inStock : true,
          isVeg: item.isVeg !== undefined ? item.isVeg : true,
          stockQuantity: item.stockQuantity || "Unlimited",
          unit: item.unit || "piece",
          expiryDate: item.expiryDate || null,
          lastRestocked: item.lastRestocked || null,
        })),
        order: category.order !== undefined ? category.order : index,
      };
    }) : [];

    // Find or create inventory
    let inventory = await Inventory.findOne({ restaurant: restaurant._id });
    
    if (!inventory) {
      inventory = new Inventory({
        restaurant: restaurant._id,
        categories: normalizedCategories,
        isActive: true,
      });
    } else {
      inventory.categories = normalizedCategories;
    }

    await inventory.save();

    return successResponse(res, 200, 'Inventory updated successfully', {
      inventory: {
        categories: inventory.categories,
        isActive: inventory.isActive,
      },
    });
  } catch (error) {
    console.error('Error updating inventory:', error);
    return errorResponse(res, 500, 'Failed to update inventory');
  }
};

// Get inventory by restaurant ID (public - for user module)
export const getInventoryByRestaurantId = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find restaurant by ID, slug, or restaurantId
    const restaurant = await Restaurant.findOne({
      $or: [
        { restaurantId: id },
        { slug: id },
        ...(mongoose.Types.ObjectId.isValid(id) && id.length === 24 
          ? [{ _id: new mongoose.Types.ObjectId(id) }] 
          : []),
      ],
      isActive: true,
    });

    if (!restaurant) {
      return errorResponse(res, 404, 'Restaurant not found');
    }

    // Find inventory
    const inventory = await Inventory.findOne({ 
      restaurant: restaurant._id,
      isActive: true,
    });

    if (!inventory) {
      // Return empty inventory if not found
      return successResponse(res, 200, 'Inventory retrieved successfully', {
        inventory: {
          categories: [],
          isActive: true,
        },
      });
    }

    return successResponse(res, 200, 'Inventory retrieved successfully', {
      inventory: {
        categories: inventory.categories || [],
        isActive: inventory.isActive,
      },
    });
  } catch (error) {
    console.error('Error fetching inventory by restaurant ID:', error);
    return errorResponse(res, 500, 'Failed to fetch inventory');
  }
};

