const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
  program: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ReferralProgram',
    required: true
  },
  
  referralCode: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ReferralCode',
    required: true
  },
  
  referrer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  
  referee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled', 'expired'],
    default: 'pending'
  },
  
  // Conversion tracking
  clicked: {
    type: Boolean,
    default: true
  },
  clickedAt: {
    type: Date,
    default: Date.now
  },
  
  signed_up: {
    type: Boolean,
    default: false
  },
  signedUpAt: {
    type: Date
  },
  
  purchased: {
    type: Boolean,
    default: false
  },
  purchasedAt: {
    type: Date
  },
  
  // Purchase details
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  orderAmount: {
    type: Number,
    default: 0
  },
  
  // Rewards
  referrerReward: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ReferralReward'
  },
  refereeReward: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ReferralReward'
  },
  
  // Metadata
  metadata: {
    ipAddress: String,
    userAgent: String,
    source: String, // 'email', 'sms', 'direct', 'social'
    campaign: String
  },
  
  notes: String,
  
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Update status based on actions
referralSchema.methods.updateStatus = function() {
  if (this.purchased) {
    this.status = 'completed';
    this.completedAt = this.purchasedAt;
  } else if (this.signed_up) {
    this.status = 'pending';
  }
  return this.save();
};

// Indexes for better query performance
referralSchema.index({ referrer: 1, status: 1 });
referralSchema.index({ referee: 1 });
referralSchema.index({ program: 1 });
referralSchema.index({ referralCode: 1 });
referralSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Referral', referralSchema);
