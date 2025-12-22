import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  itemId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  image: {
    type: String
  },
  description: {
    type: String
  },
  isVeg: {
    type: Boolean,
    default: true
  }
}, { _id: true });

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  restaurantId: {
    type: String,
    required: true
  },
  restaurantName: {
    type: String,
    required: true
  },
  items: {
    type: [orderItemSchema],
    required: true,
    validate: {
      validator: function(items) {
        return items && items.length > 0;
      },
      message: 'Order must have at least one item'
    }
  },
  address: {
    label: {
      type: String,
      enum: ['Home', 'Office', 'Other']
    },
    street: String,
    additionalDetails: String,
    city: String,
    state: String,
    zipCode: String,
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0]
      }
    }
  },
  pricing: {
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    deliveryFee: {
      type: Number,
      default: 0,
      min: 0
    },
    tax: {
      type: Number,
      default: 0,
      min: 0
    },
    discount: {
      type: Number,
      default: 0,
      min: 0
    },
    total: {
      type: Number,
      required: true,
      min: 0
    },
    couponCode: {
      type: String
    }
  },
  payment: {
    method: {
      type: String,
      enum: ['razorpay', 'cash', 'wallet', 'upi', 'card'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    razorpayOrderId: {
      type: String
    },
    razorpayPaymentId: {
      type: String
    },
    razorpaySignature: {
      type: String
    },
    transactionId: {
      type: String
    }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending',
    index: true
  },
  tracking: {
    confirmed: {
      status: { type: Boolean, default: false },
      timestamp: { type: Date }
    },
    preparing: {
      status: { type: Boolean, default: false },
      timestamp: { type: Date }
    },
    ready: {
      status: { type: Boolean, default: false },
      timestamp: { type: Date }
    },
    outForDelivery: {
      status: { type: Boolean, default: false },
      timestamp: { type: Date }
    },
    delivered: {
      status: { type: Boolean, default: false },
      timestamp: { type: Date }
    }
  },
  deliveryFleet: {
    type: String,
    enum: ['standard', 'fast', 'pure_veg'],
    default: 'standard'
  },
  note: {
    type: String
  },
  sendCutlery: {
    type: Boolean,
    default: true
  },
  deliveryPartnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  estimatedDeliveryTime: {
    type: Number, // in minutes
    default: 30
  },
  deliveredAt: {
    type: Date
  },
  cancelledAt: {
    type: Date
  },
  cancellationReason: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for better query performance
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ restaurantId: 1, status: 1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ 'payment.razorpayOrderId': 1 });

// Generate order ID before saving (fallback if not provided)
orderSchema.pre('save', async function(next) {
  if (!this.orderId) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    this.orderId = `ORD-${timestamp}-${random}`;
  }
  next();
});

// Update tracking when status changes
orderSchema.pre('save', function(next) {
  const now = new Date();
  
  if (this.isModified('status')) {
    switch (this.status) {
      case 'confirmed':
        if (!this.tracking.confirmed.status) {
          this.tracking.confirmed = { status: true, timestamp: now };
        }
        break;
      case 'preparing':
        if (!this.tracking.preparing.status) {
          this.tracking.preparing = { status: true, timestamp: now };
        }
        break;
      case 'ready':
        if (!this.tracking.ready.status) {
          this.tracking.ready = { status: true, timestamp: now };
        }
        break;
      case 'out_for_delivery':
        if (!this.tracking.outForDelivery.status) {
          this.tracking.outForDelivery = { status: true, timestamp: now };
        }
        break;
      case 'delivered':
        if (!this.tracking.delivered.status) {
          this.tracking.delivered = { status: true, timestamp: now };
          this.deliveredAt = now;
        }
        break;
      case 'cancelled':
        if (!this.cancelledAt) {
          this.cancelledAt = now;
        }
        break;
    }
  }
  
  next();
});

export default mongoose.model('Order', orderSchema);

