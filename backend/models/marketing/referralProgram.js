const mongoose = require('mongoose');

const rewardTierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  requiredReferrals: {
    type: Number,
    required: true,
    min: 1
  },
  rewardType: {
    type: String,
    enum: ['discount', 'credit', 'free_product', 'cash'],
    required: true
  },
  rewardValue: {
    type: Number,
    required: true
  },
  rewardUnit: {
    type: String,
    enum: ['percentage', 'fixed', 'product_id'],
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  description: String
});

const referralProgramSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'ended'],
    default: 'draft'
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  
  // Referrer rewards (person who refers)
  referrerRewards: {
    enabled: {
      type: Boolean,
      default: true
    },
    rewardType: {
      type: String,
      enum: ['discount', 'credit', 'free_product', 'cash'],
      default: 'credit'
    },
    rewardValue: {
      type: Number,
      default: 10
    },
    rewardUnit: {
      type: String,
      enum: ['percentage', 'fixed', 'product_id'],
      default: 'fixed'
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    description: String
  },
  
  // Referee rewards (person who gets referred)
  refereeRewards: {
    enabled: {
      type: Boolean,
      default: true
    },
    rewardType: {
      type: String,
      enum: ['discount', 'credit', 'free_product', 'cash'],
      default: 'discount'
    },
    rewardValue: {
      type: Number,
      default: 10
    },
    rewardUnit: {
      type: String,
      enum: ['percentage', 'fixed', 'product_id'],
      default: 'percentage'
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    description: String
  },
  
  // Reward tiers (progressive rewards)
  rewardTiers: [rewardTierSchema],
  
  // Requirements
  requirements: {
    minimumPurchaseAmount: {
      type: Number,
      default: 0
    },
    eligibleCustomerTypes: [{
      type: String,
      enum: ['new', 'existing', 'vip', 'all'],
      default: 'all'
    }],
    maxReferralsPerCustomer: {
      type: Number,
      default: 0 // 0 = unlimited
    },
    maxRewardsPerCustomer: {
      type: Number,
      default: 0 // 0 = unlimited
    }
  },
  
  // Email/SMS templates
  templates: {
    referralInviteEmail: {
      subject: String,
      body: String,
      enabled: {
        type: Boolean,
        default: true
      }
    },
    referralInviteSMS: {
      body: String,
      enabled: {
        type: Boolean,
        default: false
      }
    },
    rewardNotificationEmail: {
      subject: String,
      body: String,
      enabled: {
        type: Boolean,
        default: true
      }
    },
    rewardNotificationSMS: {
      body: String,
      enabled: {
        type: Boolean,
        default: false
      }
    }
  },
  
  // Tracking
  analytics: {
    totalReferrals: {
      type: Number,
      default: 0
    },
    successfulReferrals: {
      type: Number,
      default: 0
    },
    totalRewardsGiven: {
      type: Number,
      default: 0
    },
    totalRevenueGenerated: {
      type: Number,
      default: 0
    },
    conversionRate: {
      type: Number,
      default: 0
    }
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  }
}, {
  timestamps: true
});

// Calculate conversion rate before saving
referralProgramSchema.pre('save', function(next) {
  if (this.analytics.totalReferrals > 0) {
    this.analytics.conversionRate = (this.analytics.successfulReferrals / this.analytics.totalReferrals) * 100;
  }
  next();
});

module.exports = mongoose.model('ReferralProgram', referralProgramSchema);
