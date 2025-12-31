const mongoose = require('mongoose');
const crypto = require('crypto');

const referralCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  link: {
    type: String,
    required: true
  },
  
  program: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ReferralProgram',
    required: true
  },
  
  referrer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  
  status: {
    type: String,
    enum: ['active', 'inactive', 'expired'],
    default: 'active'
  },
  
  // Tracking
  analytics: {
    clicks: {
      type: Number,
      default: 0
    },
    referrals: {
      type: Number,
      default: 0
    },
    successfulReferrals: {
      type: Number,
      default: 0
    },
    totalRevenue: {
      type: Number,
      default: 0
    },
    conversionRate: {
      type: Number,
      default: 0
    }
  },
  
  // Limits
  usageLimit: {
    type: Number,
    default: 0 // 0 = unlimited
  },
  usageCount: {
    type: Number,
    default: 0
  },
  
  expiresAt: {
    type: Date
  },
  
  lastUsedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Generate unique code
referralCodeSchema.statics.generateCode = async function(referrerId, length = 8) {
  let code;
  let isUnique = false;
  
  while (!isUnique) {
    // Generate random code
    code = crypto.randomBytes(length / 2).toString('hex').toUpperCase();
    
    // Check if code exists
    const existing = await this.findOne({ code });
    if (!existing) {
      isUnique = true;
    }
  }
  
  return code;
};

// Calculate conversion rate before saving
referralCodeSchema.pre('save', function(next) {
  if (this.analytics.referrals > 0) {
    this.analytics.conversionRate = (this.analytics.successfulReferrals / this.analytics.referrals) * 100;
  }
  next();
});

// Check if code is valid
referralCodeSchema.methods.isValid = function() {
  if (this.status !== 'active') return false;
  if (this.expiresAt && this.expiresAt < new Date()) return false;
  if (this.usageLimit > 0 && this.usageCount >= this.usageLimit) return false;
  return true;
};

// Index for faster lookups
referralCodeSchema.index({ referrer: 1 });
referralCodeSchema.index({ program: 1 });

module.exports = mongoose.model('ReferralCode', referralCodeSchema);
