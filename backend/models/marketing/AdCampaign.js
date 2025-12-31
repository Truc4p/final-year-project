const mongoose = require('mongoose');

const adCampaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'active', 'paused', 'completed', 'cancelled'],
    default: 'draft',
    index: true
  },
  objective: {
    type: String,
    enum: [
      'brand_awareness',
      'reach',
      'traffic',
      'engagement',
      'app_installs',
      'video_views',
      'lead_generation',
      'conversions',
      'product_catalog_sales'
    ],
    required: true
  },
  targetAudiences: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Audience'
  }],
  platforms: [{
    platform: {
      type: String,
      enum: ['google_ads', 'facebook_ads', 'instagram_ads', 'tiktok_ads', 'linkedin_ads'],
      required: true
    },
    campaignId: String,
    status: String,
    lastSyncedAt: Date
  }],
  schedule: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: Date,
    timezone: {
      type: String,
      default: 'UTC'
    },
    dayParting: [{
      day: {
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      },
      startTime: String, // HH:MM format
      endTime: String
    }]
  },
  budget: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdBudget',
    required: true
  },
  bidding: {
    strategy: {
      type: String,
      enum: ['cpc', 'cpm', 'cpa', 'roas', 'autobid'],
      default: 'cpc'
    },
    amount: Number,
    targetRoas: Number
  },
  targeting: {
    locations: [{
      country: String,
      region: String,
      city: String,
      radius: Number,
      radiusUnit: {
        type: String,
        enum: ['km', 'miles']
      }
    }],
    demographics: {
      ageMin: {
        type: Number,
        min: 18,
        max: 65
      },
      ageMax: {
        type: Number,
        min: 18,
        max: 65
      },
      genders: [{
        type: String,
        enum: ['male', 'female', 'all']
      }],
      languages: [String]
    },
    interests: [String],
    behaviors: [String],
    deviceTypes: [{
      type: String,
      enum: ['mobile', 'desktop', 'tablet']
    }],
    placements: [{
      type: String,
      enum: ['feed', 'stories', 'search', 'display', 'video', 'messenger']
    }]
  },
  creatives: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdCreative'
  }],
  conversionTracking: {
    pixelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TrackingPixel'
    },
    conversionEvents: [String],
    attributionWindow: {
      type: Number,
      default: 7 // days
    }
  },
  performance: {
    impressions: {
      type: Number,
      default: 0
    },
    clicks: {
      type: Number,
      default: 0
    },
    conversions: {
      type: Number,
      default: 0
    },
    spend: {
      type: Number,
      default: 0
    },
    revenue: {
      type: Number,
      default: 0
    },
    ctr: {
      type: Number,
      default: 0
    },
    cpc: {
      type: Number,
      default: 0
    },
    cpa: {
      type: Number,
      default: 0
    },
    roas: {
      type: Number,
      default: 0
    },
    lastUpdated: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Calculate performance metrics
adCampaignSchema.methods.calculateMetrics = function() {
  if (this.performance.impressions > 0) {
    this.performance.ctr = (this.performance.clicks / this.performance.impressions) * 100;
  }
  
  if (this.performance.clicks > 0) {
    this.performance.cpc = this.performance.spend / this.performance.clicks;
  }
  
  if (this.performance.conversions > 0) {
    this.performance.cpa = this.performance.spend / this.performance.conversions;
  }
  
  if (this.performance.spend > 0) {
    this.performance.roas = (this.performance.revenue / this.performance.spend) * 100;
  }
  
  this.performance.lastUpdated = new Date();
};

// Check if campaign should be active
adCampaignSchema.methods.shouldBeActive = function() {
  const now = new Date();
  const isScheduled = this.schedule.startDate <= now && 
                     (!this.schedule.endDate || this.schedule.endDate >= now);
  return this.status === 'active' && isScheduled;
};

const AdCampaign = mongoose.model('AdCampaign', adCampaignSchema);

module.exports = AdCampaign;
