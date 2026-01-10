import mongoose from 'mongoose';

const deliveryBoyCommissionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    minDistance: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: (value) => value >= 0,
        message: 'Minimum distance must be 0 or greater'
      }
    },
    maxDistance: {
      type: Number,
      default: null, // null means unlimited
      validate: {
        validator: function(value) {
          // Allow null (unlimited)
          if (value === null || value === undefined) return true;
          // If value is provided, it must be greater than minDistance
          if (this.minDistance !== undefined && this.minDistance !== null) {
            return parseFloat(value) > parseFloat(this.minDistance);
          }
          return true;
        },
        message: 'Maximum distance must be greater than minimum distance'
      }
    },
    commissionPerKm: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: (value) => value >= 0,
        message: 'Commission per km must be 0 or greater'
      }
    },
    basePayout: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: (value) => value >= 0,
        message: 'Base payout must be 0 or greater'
      }
    },
    status: {
      type: Boolean,
      default: true
    },
    // Created by admin
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true
    },
    // Updated by admin
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    // Metadata
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

// Indexes
deliveryBoyCommissionSchema.index({ minDistance: 1, maxDistance: 1 });
deliveryBoyCommissionSchema.index({ status: 1 });
deliveryBoyCommissionSchema.index({ createdAt: -1 });
deliveryBoyCommissionSchema.index({ createdBy: 1 });

// Method to check if a distance falls within this commission range
deliveryBoyCommissionSchema.methods.isDistanceInRange = function(distance) {
  if (distance < this.minDistance) return false;
  if (this.maxDistance !== null && distance > this.maxDistance) return false;
  return true;
};

// Static method to find applicable commission rule for a distance
deliveryBoyCommissionSchema.statics.findApplicableRule = async function(distance) {
  const rules = await this.find({ status: true }).sort({ minDistance: 1 });
  
  for (const rule of rules) {
    if (rule.isDistanceInRange(distance)) {
      return rule;
    }
  }
  
  // If no exact match, find the nearest rule
  // For distances less than minimum, return the first rule
  // For distances greater than maximum, return the last rule (or unlimited rule)
  const firstRule = rules[0];
  const lastRule = rules[rules.length - 1];
  
  if (distance < firstRule.minDistance) {
    return firstRule;
  }
  
  // Find unlimited rule (maxDistance === null)
  const unlimitedRule = rules.find(r => r.maxDistance === null);
  if (unlimitedRule && distance > unlimitedRule.minDistance) {
    return unlimitedRule;
  }
  
  // Return last rule as fallback
  return lastRule || firstRule;
};

// Static method to calculate commission for a given distance
deliveryBoyCommissionSchema.statics.calculateCommission = async function(distance) {
  const rule = await this.findApplicableRule(distance);
  if (!rule) {
    throw new Error('No commission rule found for the given distance');
  }
  
  // Commission = Base Payout + (Distance × Commission Per Km)
  const commission = rule.basePayout + (distance * rule.commissionPerKm);
  
  return {
    rule,
    commission: Math.round(commission * 100) / 100, // Round to 2 decimal places
    breakdown: {
      basePayout: rule.basePayout,
      distance: distance,
      commissionPerKm: rule.commissionPerKm,
      distanceCommission: distance * rule.commissionPerKm
    }
  };
};

const DeliveryBoyCommission = mongoose.model('DeliveryBoyCommission', deliveryBoyCommissionSchema);

export default DeliveryBoyCommission;

