import Menu from '../models/Menu.js';
import Restaurant from '../models/Restaurant.js';
import { successResponse, errorResponse } from '../../../shared/utils/response.js';
import mongoose from 'mongoose';

// Get menu for a restaurant
export const getMenu = async (req, res) => {
  try {
    const ownerId = req.user._id;
    
    // Find restaurant by owner
    const restaurant = await Restaurant.findOne({ owner: ownerId });
    if (!restaurant) {
      return errorResponse(res, 404, 'Restaurant not found');
    }

    // Find or create menu
    let menu = await Menu.findOne({ restaurant: restaurant._id });
    
    if (!menu) {
      // Create empty menu
      menu = new Menu({
        restaurant: restaurant._id,
        sections: [],
        isActive: true,
      });
      await menu.save();
    }

    return successResponse(res, 200, 'Menu retrieved successfully', {
      menu: {
        sections: menu.sections || [],
        isActive: menu.isActive,
      },
    });
  } catch (error) {
    console.error('Error fetching menu:', error);
    return errorResponse(res, 500, 'Failed to fetch menu');
  }
};

// Update menu (upsert)
export const updateMenu = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const { sections } = req.body;

    // Find restaurant by owner
    const restaurant = await Restaurant.findOne({ owner: ownerId });
    if (!restaurant) {
      return errorResponse(res, 404, 'Restaurant not found');
    }

    // Normalize and validate sections
    const normalizedSections = Array.isArray(sections) ? sections.map((section, index) => ({
      id: section.id || `section-${index}`,
      name: section.name || "Unnamed Section",
      items: Array.isArray(section.items) ? section.items.map(item => ({
        id: String(item.id || Date.now() + Math.random()),
        name: item.name || "Unnamed Item",
        nameArabic: item.nameArabic || "",
        image: item.image || "",
        category: item.category || section.name,
        rating: item.rating ?? 0.0,
        reviews: item.reviews ?? 0,
        price: item.price || 0,
        stock: item.stock || "Unlimited",
        discount: item.discount || null,
        originalPrice: item.originalPrice || null,
        foodType: item.foodType || "Non-Veg",
        availabilityTimeStart: item.availabilityTimeStart || "12:01 AM",
        availabilityTimeEnd: item.availabilityTimeEnd || "11:57 PM",
        description: item.description || "",
        discountType: item.discountType || "Percent",
        discountAmount: item.discountAmount ?? 0.0,
        isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
        isRecommended: item.isRecommended || false,
        variations: Array.isArray(item.variations) ? item.variations.map(v => ({
          id: String(v.id || Date.now() + Math.random()),
          name: v.name || "",
          price: v.price || 0,
          stock: v.stock || "Unlimited",
        })) : [],
        tags: Array.isArray(item.tags) ? item.tags : [],
        nutrition: Array.isArray(item.nutrition) ? item.nutrition : [],
        allergies: Array.isArray(item.allergies) ? item.allergies : [],
        photoCount: item.photoCount ?? 1,
      })) : [],
      subsections: Array.isArray(section.subsections) ? section.subsections.map(subsection => ({
        id: subsection.id || `subsection-${Date.now()}`,
        name: subsection.name || "Unnamed Subsection",
        items: Array.isArray(subsection.items) ? subsection.items.map(item => ({
          id: String(item.id || Date.now() + Math.random()),
          name: item.name || "Unnamed Item",
          nameArabic: item.nameArabic || "",
          image: item.image || "",
          category: item.category || section.name,
          rating: item.rating ?? 0.0,
          reviews: item.reviews ?? 0,
          price: item.price || 0,
          stock: item.stock || "Unlimited",
          discount: item.discount || null,
          originalPrice: item.originalPrice || null,
          foodType: item.foodType || "Non-Veg",
          availabilityTimeStart: item.availabilityTimeStart || "12:01 AM",
          availabilityTimeEnd: item.availabilityTimeEnd || "11:57 PM",
          description: item.description || "",
          discountType: item.discountType || "Percent",
          discountAmount: item.discountAmount ?? 0.0,
          isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
          isRecommended: item.isRecommended || false,
          variations: Array.isArray(item.variations) ? item.variations.map(v => ({
            id: String(v.id || Date.now() + Math.random()),
            name: v.name || "",
            price: v.price || 0,
            stock: v.stock || "Unlimited",
          })) : [],
          tags: Array.isArray(item.tags) ? item.tags : [],
          nutrition: Array.isArray(item.nutrition) ? item.nutrition : [],
          allergies: Array.isArray(item.allergies) ? item.allergies : [],
          photoCount: item.photoCount ?? 1,
        })) : [],
      })) : [],
      isEnabled: section.isEnabled !== undefined ? section.isEnabled : true,
      order: section.order !== undefined ? section.order : index,
    })) : [];

    // Find or create menu
    let menu = await Menu.findOne({ restaurant: restaurant._id });
    
    if (!menu) {
      menu = new Menu({
        restaurant: restaurant._id,
        sections: normalizedSections,
        isActive: true,
      });
    } else {
      menu.sections = normalizedSections;
    }

    await menu.save();

    return successResponse(res, 200, 'Menu updated successfully', {
      menu: {
        sections: menu.sections,
        isActive: menu.isActive,
      },
    });
  } catch (error) {
    console.error('Error updating menu:', error);
    return errorResponse(res, 500, 'Failed to update menu');
  }
};

// Get menu by restaurant ID (public - for user module)
export const getMenuByRestaurantId = async (req, res) => {
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

    // Find menu
    const menu = await Menu.findOne({ 
      restaurant: restaurant._id,
      isActive: true,
    });

    if (!menu) {
      // Return empty menu if not found
      return successResponse(res, 200, 'Menu retrieved successfully', {
        menu: {
          sections: [],
          isActive: true,
        },
      });
    }

    return successResponse(res, 200, 'Menu retrieved successfully', {
      menu: {
        sections: menu.sections || [],
        isActive: menu.isActive,
      },
    });
  } catch (error) {
    console.error('Error fetching menu by restaurant ID:', error);
    return errorResponse(res, 500, 'Failed to fetch menu');
  }
};

