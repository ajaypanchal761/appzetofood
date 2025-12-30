import Menu from '../models/Menu.js';
import Restaurant from '../models/Restaurant.js';
import { successResponse, errorResponse } from '../../../shared/utils/response.js';
import asyncHandler from '../../../shared/middleware/asyncHandler.js';
import mongoose from 'mongoose';

// Get menu for a restaurant
export const getMenu = asyncHandler(async (req, res) => {
  // Restaurant is attached by authenticate middleware
  const restaurantId = req.restaurant._id;

  // Find or create menu
  let menu = await Menu.findOne({ restaurant: restaurantId });
  
  if (!menu) {
    // Create empty menu
    menu = new Menu({
      restaurant: restaurantId,
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
});

// Update menu (upsert)
export const updateMenu = asyncHandler(async (req, res) => {
  // Restaurant is attached by authenticate middleware
  const restaurantId = req.restaurant._id;
  const { sections } = req.body;

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
      // Additional fields for complete item details
      subCategory: item.subCategory || "",
      servesInfo: item.servesInfo || "",
      itemSize: item.itemSize || "",
      itemSizeQuantity: item.itemSizeQuantity || "",
      itemSizeUnit: item.itemSizeUnit || "piece",
      gst: item.gst ?? 0,
      images: Array.isArray(item.images) ? item.images : (item.image ? [item.image] : []),
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
        // Additional fields for complete item details
        subCategory: item.subCategory || "",
        servesInfo: item.servesInfo || "",
        itemSize: item.itemSize || "",
        itemSizeQuantity: item.itemSizeQuantity || "",
        itemSizeUnit: item.itemSizeUnit || "piece",
        gst: item.gst ?? 0,
        images: Array.isArray(item.images) ? item.images : (item.image ? [item.image] : []),
      })) : [],
    })) : [],
    isEnabled: section.isEnabled !== undefined ? section.isEnabled : true,
    order: section.order !== undefined ? section.order : index,
  })) : [];

  // Find or create menu
  let menu = await Menu.findOne({ restaurant: restaurantId });
  
  if (!menu) {
    menu = new Menu({
      restaurant: restaurantId,
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
});

// Add a new section (category)
export const addSection = asyncHandler(async (req, res) => {
  const restaurantId = req.restaurant._id;
  const { name } = req.body;

  if (!name || !name.trim()) {
    return errorResponse(res, 400, 'Section name is required');
  }

  // Find or create menu
  let menu = await Menu.findOne({ restaurant: restaurantId });
  
  if (!menu) {
    menu = new Menu({
      restaurant: restaurantId,
      sections: [],
      isActive: true,
    });
  }

  // Check if section with same name already exists
  const existingSection = menu.sections.find(
    s => s.name.toLowerCase().trim() === name.toLowerCase().trim()
  );

  if (existingSection) {
    return errorResponse(res, 400, 'Section with this name already exists');
  }

  // Create new section
  const newSection = {
    id: `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: name.trim(),
    items: [],
    subsections: [],
    isEnabled: true,
    order: menu.sections.length,
  };

  menu.sections.push(newSection);
  await menu.save();

  return successResponse(res, 201, 'Section added successfully', {
    section: newSection,
    menu: {
      sections: menu.sections,
      isActive: menu.isActive,
    },
  });
});

// Add a new item to a section
export const addItemToSection = asyncHandler(async (req, res) => {
  const restaurantId = req.restaurant._id;
  const { sectionId, item } = req.body;

  if (!sectionId) {
    return errorResponse(res, 400, 'Section ID is required');
  }

  if (!item || !item.name || item.price === undefined) {
    return errorResponse(res, 400, 'Item name and price are required');
  }

  // Find menu
  const menu = await Menu.findOne({ restaurant: restaurantId });
  
  if (!menu) {
    return errorResponse(res, 404, 'Menu not found');
  }

  // Find section
  const section = menu.sections.find(s => s.id === sectionId);
  if (!section) {
    return errorResponse(res, 404, 'Section not found');
  }

  // Normalize item data
  const newItem = {
    id: String(item.id || Date.now() + Math.random()),
    name: item.name.trim(),
    nameArabic: item.nameArabic || "",
    image: item.image || "",
    category: item.category || section.name,
    rating: item.rating ?? 0.0,
    reviews: item.reviews ?? 0,
    price: Number(item.price) || 0,
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
      price: Number(v.price) || 0,
      stock: v.stock || "Unlimited",
    })) : [],
    tags: Array.isArray(item.tags) ? item.tags : [],
    nutrition: Array.isArray(item.nutrition) ? item.nutrition : [],
    allergies: Array.isArray(item.allergies) ? item.allergies : [],
    photoCount: item.photoCount ?? 1,
    // Additional fields for complete item details
    subCategory: item.subCategory || "",
    servesInfo: item.servesInfo || "",
    itemSize: item.itemSize || "",
    itemSizeQuantity: item.itemSizeQuantity || "",
    itemSizeUnit: item.itemSizeUnit || "piece",
    gst: item.gst ?? 0,
    images: Array.isArray(item.images) ? item.images : (item.image ? [item.image] : []),
  };

  section.items.push(newItem);
  await menu.save();

  return successResponse(res, 201, 'Item added successfully', {
    item: newItem,
    menu: {
      sections: menu.sections,
      isActive: menu.isActive,
    },
  });
});

// Add a subsection to a section
export const addSubsectionToSection = asyncHandler(async (req, res) => {
  const restaurantId = req.restaurant._id;
  const { sectionId, name } = req.body;

  if (!sectionId) {
    return errorResponse(res, 400, 'Section ID is required');
  }

  if (!name || !name.trim()) {
    return errorResponse(res, 400, 'Subsection name is required');
  }

  // Find menu
  const menu = await Menu.findOne({ restaurant: restaurantId });
  
  if (!menu) {
    return errorResponse(res, 404, 'Menu not found');
  }

  // Find section
  const section = menu.sections.find(s => s.id === sectionId);
  if (!section) {
    return errorResponse(res, 404, 'Section not found');
  }

  // Check if subsection with same name already exists
  const existingSubsection = section.subsections.find(
    sub => sub.name.toLowerCase().trim() === name.toLowerCase().trim()
  );

  if (existingSubsection) {
    return errorResponse(res, 400, 'Subsection with this name already exists');
  }

  // Create new subsection
  const newSubsection = {
    id: `subsection-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: name.trim(),
    items: [],
  };

  section.subsections.push(newSubsection);
  await menu.save();

  return successResponse(res, 201, 'Subsection added successfully', {
    subsection: newSubsection,
    menu: {
      sections: menu.sections,
      isActive: menu.isActive,
    },
  });
});

// Add a new item to a subsection
export const addItemToSubsection = asyncHandler(async (req, res) => {
  const restaurantId = req.restaurant._id;
  const { sectionId, subsectionId, item } = req.body;

  if (!sectionId || !subsectionId) {
    return errorResponse(res, 400, 'Section ID and Subsection ID are required');
  }

  if (!item || !item.name || item.price === undefined) {
    return errorResponse(res, 400, 'Item name and price are required');
  }

  // Find menu
  const menu = await Menu.findOne({ restaurant: restaurantId });
  
  if (!menu) {
    return errorResponse(res, 404, 'Menu not found');
  }

  // Find section
  const section = menu.sections.find(s => s.id === sectionId);
  if (!section) {
    return errorResponse(res, 404, 'Section not found');
  }

  // Find subsection
  const subsection = section.subsections.find(sub => sub.id === subsectionId);
  if (!subsection) {
    return errorResponse(res, 404, 'Subsection not found');
  }

  // Normalize item data
  const newItem = {
    id: String(item.id || Date.now() + Math.random()),
    name: item.name.trim(),
    nameArabic: item.nameArabic || "",
    image: item.image || "",
    category: item.category || section.name,
    rating: item.rating ?? 0.0,
    reviews: item.reviews ?? 0,
    price: Number(item.price) || 0,
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
      price: Number(v.price) || 0,
      stock: v.stock || "Unlimited",
    })) : [],
    tags: Array.isArray(item.tags) ? item.tags : [],
    nutrition: Array.isArray(item.nutrition) ? item.nutrition : [],
    allergies: Array.isArray(item.allergies) ? item.allergies : [],
    photoCount: item.photoCount ?? 1,
  };

  subsection.items.push(newItem);
  await menu.save();

  return successResponse(res, 201, 'Item added to subsection successfully', {
    item: newItem,
    menu: {
      sections: menu.sections,
      isActive: menu.isActive,
    },
  });
});

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

    // Filter menu for user side: only show enabled sections and available items
    const filteredSections = (menu.sections || [])
      .filter(section => {
        // Only show sections where isEnabled is not explicitly false
        // If isEnabled is undefined/null, treat as enabled (default true)
        return section.isEnabled !== false;
      })
      .map(section => {
        // Filter direct items - only show available items
        // Items where isAvailable is not explicitly false should be shown
        const availableItems = (section.items || []).filter(item => {
          return item.isAvailable !== false; // Include if true or undefined
        });
        
        // Filter subsections and their items
        const availableSubsections = (section.subsections || [])
          .map(subsection => {
            const availableSubsectionItems = (subsection.items || []).filter(item => {
              return item.isAvailable !== false; // Include if true or undefined
            });
            // Only include subsection if it has available items
            if (availableSubsectionItems.length > 0) {
              return {
                ...subsection,
                items: availableSubsectionItems,
              };
            }
            return null;
          })
          .filter(subsection => subsection !== null); // Remove null subsections
        
        // Include section if it has at least one available item OR at least one subsection with available items
        // This ensures category remains visible even if some items are unavailable
        if (availableItems.length > 0 || availableSubsections.length > 0) {
          return {
            ...section,
            name: section.name || "Unnamed Section", // Ensure name is always present
            items: availableItems,
            subsections: availableSubsections,
          };
        }
        // Return null only if section has no available items AND no subsections with available items
        return null;
      })
      .filter(section => section !== null); // Remove null sections (sections with no available items)

    return successResponse(res, 200, 'Menu retrieved successfully', {
      menu: {
        sections: filteredSections,
        isActive: menu.isActive,
      },
    });
  } catch (error) {
    console.error('Error fetching menu by restaurant ID:', error);
    return errorResponse(res, 500, 'Failed to fetch menu');
  }
};

