const mongoose = require('mongoose');

const emailCampaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  htmlContent: {
    type: String,
    required: true
  },
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmailTemplate',
    default: null
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled'],
    default: 'draft'
  },
  type: {
    type: String,
    enum: ['newsletter', 'promotion', 'announcement', 'welcome', 'product_launch', 'abandoned_cart'],
    default: 'newsletter'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Targeting
  targetAudience: {
    type: String,
    enum: ['all', 'segment', 'custom'],
    default: 'all'
  },
  segmentCriteria: {
    subscriptionDateFrom: Date,
    subscriptionDateTo: Date,
    sources: [String],
    preferences: {
      newProducts: Boolean,
      promotions: Boolean,
      newsletter: Boolean
    },
    customEmails: [String] // For custom targeting
  },
  
  // Scheduling
  scheduledAt: {
    type: Date,
    default: null
  },
  sentAt: {
    type: Date,
    default: null
  },
  
  // Analytics
  analytics: {
    totalRecipients: {
      type: Number,
      default: 0
    },
    emailsSent: {
      type: Number,
      default: 0
    },
    emailsDelivered: {
      type: Number,
      default: 0
    },
    emailsBounced: {
      type: Number,
      default: 0
    },
    emailsOpened: {
      type: Number,
      default: 0
    },
    uniqueOpens: {
      type: Number,
      default: 0
    },
    emailsClicked: {
      type: Number,
      default: 0
    },
    uniqueClicks: {
      type: Number,
      default: 0
    },
    unsubscribes: {
      type: Number,
      default: 0
    },
    complaints: {
      type: Number,
      default: 0
    }
  },
  
  // Settings
  settings: {
    trackOpens: {
      type: Boolean,
      default: true
    },
    trackClicks: {
      type: Boolean,
      default: true
    },
    enableUnsubscribe: {
      type: Boolean,
      default: true
    }
  },
  
  // Error tracking
  errors: [{
    type: String,
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes
emailCampaignSchema.index({ status: 1 });
emailCampaignSchema.index({ type: 1 });
emailCampaignSchema.index({ createdBy: 1 });
emailCampaignSchema.index({ scheduledAt: 1 });
emailCampaignSchema.index({ sentAt: -1 });

// Virtual for open rate
emailCampaignSchema.virtual('openRate').get(function() {
  if (this.analytics.emailsDelivered === 0) return 0;
  return (this.analytics.emailsOpened / this.analytics.emailsDelivered * 100).toFixed(2);
});

// Virtual for click rate
emailCampaignSchema.virtual('clickRate').get(function() {
  if (this.analytics.emailsDelivered === 0) return 0;
  return (this.analytics.emailsClicked / this.analytics.emailsDelivered * 100).toFixed(2);
});

// Virtual for unsubscribe rate
emailCampaignSchema.virtual('unsubscribeRate').get(function() {
  if (this.analytics.emailsDelivered === 0) return 0;
  return (this.analytics.unsubscribes / this.analytics.emailsDelivered * 100).toFixed(2);
});

// Instance method to get targeted subscribers
emailCampaignSchema.methods.getTargetedSubscribers = async function() {
  const NewsletterSubscription = require('./newsletterSubscription');
  
  let query = { isActive: true };
  
  if (this.targetAudience === 'segment' && this.segmentCriteria) {
    const criteria = this.segmentCriteria;
    
    // Date range filter
    if (criteria.subscriptionDateFrom || criteria.subscriptionDateTo) {
      query.subscriptionDate = {};
      if (criteria.subscriptionDateFrom) {
        query.subscriptionDate.$gte = criteria.subscriptionDateFrom;
      }
      if (criteria.subscriptionDateTo) {
        query.subscriptionDate.$lte = criteria.subscriptionDateTo;
      }
    }
    
    // Source filter
    if (criteria.sources && criteria.sources.length > 0) {
      query.source = { $in: criteria.sources };
    }
    
    // Preferences filter
    if (criteria.preferences) {
      Object.keys(criteria.preferences).forEach(pref => {
        if (criteria.preferences[pref] !== undefined) {
          query[`preferences.${pref}`] = criteria.preferences[pref];
        }
      });
    }
  } else if (this.targetAudience === 'custom' && this.segmentCriteria.customEmails) {
    query.email = { $in: this.segmentCriteria.customEmails };
  }
  
  return await NewsletterSubscription.find(query).select('email preferences');
};

// Static method to get campaign stats
emailCampaignSchema.statics.getCampaignStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalCampaigns: { $sum: 1 },
        draftCampaigns: {
          $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] }
        },
        sentCampaigns: {
          $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] }
        },
        totalEmailsSent: { $sum: '$analytics.emailsSent' },
        totalOpens: { $sum: '$analytics.emailsOpened' },
        totalClicks: { $sum: '$analytics.emailsClicked' },
        totalUnsubscribes: { $sum: '$analytics.unsubscribes' }
      }
    }
  ]);
};

module.exports = mongoose.model('EmailCampaign', emailCampaignSchema);