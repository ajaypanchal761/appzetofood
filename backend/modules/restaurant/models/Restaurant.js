import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  latitude: Number,
  longitude: Number,
  addressLine1: String,
  addressLine2: String,
  area: String,
  city: String,
  landmark: String,
});

const deliveryTimingsSchema = new mongoose.Schema({
  openingTime: String,
  closingTime: String,
});

const restaurantSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    ownerName: String,
    ownerEmail: String,
    ownerPhone: String,
    primaryContactNumber: String,
    location: locationSchema,
    profileImage: {
      url: String,
      publicId: String,
    },
    menuImages: [
      {
        url: String,
        publicId: String,
      },
    ],
    cuisines: [String],
    deliveryTimings: deliveryTimingsSchema,
    openDays: [String],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isAcceptingOrders: {
      type: Boolean,
      default: true,
    },
    // Additional display data for user module
    estimatedDeliveryTime: {
      type: String,
      default: "25-30 mins",
    },
    distance: {
      type: String,
      default: "1.2 km",
    },
    priceRange: {
      type: String,
      enum: ["$", "$$", "$$$", "$$$$"],
      default: "$$",
    },
    featuredDish: {
      type: String,
      default: "",
    },
    featuredPrice: {
      type: Number,
      default: 249,
    },
    offer: {
      type: String,
      default: "Flat ₹50 OFF above ₹199",
    },
  },
  {
    timestamps: true,
  }
);

// Generate slug from name
restaurantSchema.pre('save', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Generate restaurantId if not provided
restaurantSchema.pre('save', function (next) {
  if (!this.restaurantId) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    this.restaurantId = `REST-${timestamp}-${random}`;
  }
  next();
});

export default mongoose.model('Restaurant', restaurantSchema);

