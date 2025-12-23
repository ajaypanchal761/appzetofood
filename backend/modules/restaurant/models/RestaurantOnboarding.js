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

const restaurantOnboardingSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    step1: {
      restaurantName: String,
      ownerName: String,
      ownerEmail: String,
      ownerPhone: String,
      primaryContactNumber: String,
      location: locationSchema,
    },
    step2: {
      menuImageUrls: [
        {
          url: String,
          publicId: String,
        },
      ],
      profileImageUrl: {
        url: String,
        publicId: String,
      },
      cuisines: [String],
      deliveryTimings: {
        openingTime: String,
        closingTime: String,
      },
      openDays: [String],
    },
    step3: {
      pan: {
        panNumber: String,
        nameOnPan: String,
        image: {
          url: String,
          publicId: String,
        },
      },
      gst: {
        isRegistered: {
          type: Boolean,
          default: false,
        },
        gstNumber: String,
        legalName: String,
        address: String,
        image: {
          url: String,
          publicId: String,
        },
      },
      fssai: {
        registrationNumber: String,
        expiryDate: Date,
        image: {
          url: String,
          publicId: String,
        },
      },
      bank: {
        accountNumber: String,
        ifscCode: String,
        accountHolderName: String,
        accountType: String,
      },
    },
    completedSteps: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('RestaurantOnboarding', restaurantOnboardingSchema);


