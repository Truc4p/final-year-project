const mongoose = require('mongoose');

const adBudgetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdCampaign',
    index: true
  },
  budgetType: {
    type: String,
    enum: ['daily', 'lifetime', 'monthly'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'VND'
  },
  spent: {
    type: Number,
    default: 0
  },
  remaining: {
    type: Number
  },
  pacing: {
    type: String,
    enum: ['standard', 'accelerated'],
    default: 'standard'
  },
  // Budget allocation across platforms
  platformAllocations: [{
    platform: {
      type: String,
      enum: ['google_ads', 'facebook_ads', 'instagram_ads', 'tiktok_ads', 'linkedin_ads']
    },
    percentage: {
      type: Number,
      min: 0,
      max: 100
    },
    amount: Number,
    spent: {
      type: Number,
      default: 0
    }
  }],
  alerts: {
    enabled: {
      type: Boolean,
      default: true
    },
    thresholds: [{
      percentage: {
        type: Number,
        min: 0,
        max: 100
      },
      notified: {
        type: Boolean,
        default: false
      },
      notifiedAt: Date
    }]
  },
  autoRenew: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'exhausted', 'scheduled'],
    default: 'active'
  },
  period: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: Date
  },
  spendHistory: [{
    date: {
      type: Date,
      default: Date.now
    },
    amount: Number,
    platform: String,
    campaignId: mongoose.Schema.Types.ObjectId
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Calculate remaining budget
adBudgetSchema.methods.calculateRemaining = function() {
  this.remaining = this.amount - this.spent;
  
  // Update status if budget is exhausted
  if (this.remaining <= 0) {
    this.status = 'exhausted';
  }
  
  return this.remaining;
};

// Check if budget threshold is reached
adBudgetSchema.methods.checkThresholds = function() {
  if (!this.alerts.enabled) return [];
  
  const spentPercentage = (this.spent / this.amount) * 100;
  const triggeredAlerts = [];
  
  this.alerts.thresholds.forEach(threshold => {
    if (spentPercentage >= threshold.percentage && !threshold.notified) {
      threshold.notified = true;
      threshold.notifiedAt = new Date();
      triggeredAlerts.push({
        percentage: threshold.percentage,
        spent: this.spent,
        remaining: this.remaining
      });
    }
  });
  
  return triggeredAlerts;
};

// Record spend
adBudgetSchema.methods.recordSpend = function(amount, platform, campaignId) {
  this.spent += amount;
  
  // Update platform allocation
  const platformAlloc = this.platformAllocations.find(p => p.platform === platform);
  if (platformAlloc) {
    platformAlloc.spent += amount;
  }
  
  // Add to spend history
  this.spendHistory.push({
    date: new Date(),
    amount,
    platform,
    campaignId
  });
  
  this.calculateRemaining();
  return this.checkThresholds();
};

// Get spend by date range
adBudgetSchema.methods.getSpendByDateRange = function(startDate, endDate) {
  return this.spendHistory.filter(spend => 
    spend.date >= startDate && spend.date <= endDate
  ).reduce((total, spend) => total + spend.amount, 0);
};

const AdBudget = mongoose.model('AdBudget', adBudgetSchema);

module.exports = AdBudget;
