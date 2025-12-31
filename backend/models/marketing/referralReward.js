const mongoose = require('mongoose');

const referralRewardSchema = new mongoose.Schema({
  program: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ReferralProgram',
    required: true
  },
  
  referral: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Referral',
    required: true
  },
  
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  
  recipientType: {
    type: String,
    enum: ['referrer', 'referee'],
    required: true
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
  
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  
  // Tier information
  tier: {
    name: String,
    level: Number
  },
  
  status: {
    type: String,
    enum: ['pending', 'approved', 'distributed', 'used', 'expired', 'cancelled'],
    default: 'pending'
  },
  
  // Distribution
  distributedAt: {
    type: Date
  },
  
  // Usage
  usedAt: {
    type: Date
  },
  usedInOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  
  // For discount codes
  discountCode: {
    type: String,
    unique: true,
    sparse: true
  },
  
  // For credits
  creditAmount: {
    type: Number,
    default: 0
  },
  
  expiresAt: {
    type: Date
  },
  
  // Notification
  notificationSent: {
    type: Boolean,
    default: false
  },
  notificationSentAt: {
    type: Date
  },
  
  description: String,
  notes: String
}, {
  timestamps: true
});

// Check if reward is valid
referralRewardSchema.methods.isValid = function() {
  if (this.status !== 'distributed') return false;
  if (this.expiresAt && this.expiresAt < new Date()) return false;
  if (this.usedAt) return false;
  return true;
};

// Mark as used
referralRewardSchema.methods.markAsUsed = function(orderId) {
  this.status = 'used';
  this.usedAt = new Date();
  this.usedInOrder = orderId;
  return this.save();
};

// Indexes
referralRewardSchema.index({ customer: 1, status: 1 });
referralRewardSchema.index({ program: 1 });
referralRewardSchema.index({ referral: 1 });

module.exports = mongoose.model('ReferralReward', referralRewardSchema);
