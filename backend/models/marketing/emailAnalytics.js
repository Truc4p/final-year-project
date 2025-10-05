const mongoose = require('mongoose');

const emailAnalyticsSchema = new mongoose.Schema({
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmailCampaign',
    required: true
  },
  subscriberEmail: {
    type: String,
    required: true,
    lowercase: true
  },
  subscriberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NewsletterSubscription',
    default: null
  },
  
  // Email delivery tracking
  sentAt: {
    type: Date,
    default: Date.now
  },
  deliveredAt: {
    type: Date,
    default: null
  },
  bouncedAt: {
    type: Date,
    default: null
  },
  bounceReason: {
    type: String,
    default: ''
  },
  
  // Engagement tracking
  opens: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    ipAddress: String,
    userAgent: String,
    location: {
      country: String,
      city: String,
      region: String
    }
  }],
  
  clicks: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    url: {
      type: String,
      required: true
    },
    ipAddress: String,
    userAgent: String,
    location: {
      country: String,
      city: String,
      region: String
    }
  }],
  
  // Actions
  unsubscribedAt: {
    type: Date,
    default: null
  },
  complainedAt: {
    type: Date,
    default: null
  },
  forwardedAt: {
    type: Date,
    default: null
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['sent', 'delivered', 'opened', 'clicked', 'bounced', 'unsubscribed', 'complained'],
    default: 'sent'
  },
  
  // Device/client info
  deviceInfo: {
    deviceType: String, // mobile, desktop, tablet
    operatingSystem: String,
    emailClient: String, // gmail, outlook, apple mail, etc.
  }
}, {
  timestamps: true
});

// Indexes for performance
emailAnalyticsSchema.index({ campaignId: 1 });
emailAnalyticsSchema.index({ subscriberEmail: 1 });
emailAnalyticsSchema.index({ sentAt: -1 });
emailAnalyticsSchema.index({ status: 1 });
emailAnalyticsSchema.index({ 'opens.timestamp': -1 });
emailAnalyticsSchema.index({ 'clicks.timestamp': -1 });

// Compound indexes
emailAnalyticsSchema.index({ campaignId: 1, subscriberEmail: 1 }, { unique: true });
emailAnalyticsSchema.index({ campaignId: 1, status: 1 });

// Virtual for first open time
emailAnalyticsSchema.virtual('firstOpenAt').get(function() {
  if (this.opens && this.opens.length > 0) {
    return this.opens[0].timestamp;
  }
  return null;
});

// Virtual for last open time
emailAnalyticsSchema.virtual('lastOpenAt').get(function() {
  if (this.opens && this.opens.length > 0) {
    return this.opens[this.opens.length - 1].timestamp;
  }
  return null;
});

// Virtual for total opens
emailAnalyticsSchema.virtual('totalOpens').get(function() {
  return this.opens ? this.opens.length : 0;
});

// Virtual for total clicks
emailAnalyticsSchema.virtual('totalClicks').get(function() {
  return this.clicks ? this.clicks.length : 0;
});

// Instance method to track email open
emailAnalyticsSchema.methods.trackOpen = function(data = {}) {
  const openData = {
    timestamp: new Date(),
    ipAddress: data.ipAddress,
    userAgent: data.userAgent,
    location: data.location
  };
  
  this.opens.push(openData);
  
  // Update status if this is the first open
  if (this.opens.length === 1) {
    this.status = 'opened';
  }
  
  return this.save();
};

// Instance method to track email click
emailAnalyticsSchema.methods.trackClick = function(url, data = {}) {
  const clickData = {
    timestamp: new Date(),
    url: url,
    ipAddress: data.ipAddress,
    userAgent: data.userAgent,
    location: data.location
  };
  
  this.clicks.push(clickData);
  
  // Update status if this is the first click
  if (this.clicks.length === 1) {
    this.status = 'clicked';
  }
  
  return this.save();
};

// Instance method to track unsubscribe
emailAnalyticsSchema.methods.trackUnsubscribe = function() {
  this.unsubscribedAt = new Date();
  this.status = 'unsubscribed';
  return this.save();
};

// Static method to get campaign analytics summary
emailAnalyticsSchema.statics.getCampaignSummary = function(campaignId) {
  return this.aggregate([
    { $match: { campaignId: mongoose.Types.ObjectId(campaignId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalOpens: { $sum: { $size: '$opens' } },
        totalClicks: { $sum: { $size: '$clicks' } }
      }
    }
  ]);
};

// Static method to get engagement over time
emailAnalyticsSchema.statics.getEngagementOverTime = function(campaignId, timeframe = 'day') {
  const groupFormat = timeframe === 'hour' ? '%Y-%m-%d-%H' : '%Y-%m-%d';
  
  return this.aggregate([
    { $match: { campaignId: mongoose.Types.ObjectId(campaignId) } },
    { $unwind: '$opens' },
    {
      $group: {
        _id: {
          $dateToString: {
            format: groupFormat,
            date: '$opens.timestamp'
          }
        },
        opens: { $sum: 1 }
      }
    },
    { $sort: { '_id': 1 } }
  ]);
};

module.exports = mongoose.model('EmailAnalytics', emailAnalyticsSchema);