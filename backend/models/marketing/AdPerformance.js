const mongoose = require('mongoose');

const adPerformanceSchema = new mongoose.Schema({
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdCampaign',
    required: true,
    index: true
  },
  creativeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdCreative',
    index: true
  },
  platform: {
    type: String,
    enum: ['google_ads', 'facebook_ads', 'instagram_ads', 'tiktok_ads', 'linkedin_ads'],
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  metrics: {
    // Reach and Impressions
    impressions: {
      type: Number,
      default: 0
    },
    reach: {
      type: Number,
      default: 0
    },
    frequency: {
      type: Number,
      default: 0
    },
    
    // Engagement
    clicks: {
      type: Number,
      default: 0
    },
    ctr: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    comments: {
      type: Number,
      default: 0
    },
    saves: {
      type: Number,
      default: 0
    },
    
    // Conversions
    conversions: {
      type: Number,
      default: 0
    },
    conversionRate: {
      type: Number,
      default: 0
    },
    conversionValue: {
      type: Number,
      default: 0
    },
    
    // Cost Metrics
    spend: {
      type: Number,
      default: 0
    },
    cpc: { // Cost per click
      type: Number,
      default: 0
    },
    cpm: { // Cost per mille (1000 impressions)
      type: Number,
      default: 0
    },
    cpa: { // Cost per acquisition
      type: Number,
      default: 0
    },
    
    // ROI Metrics
    revenue: {
      type: Number,
      default: 0
    },
    roas: { // Return on ad spend
      type: Number,
      default: 0
    },
    roi: { // Return on investment
      type: Number,
      default: 0
    },
    
    // Video-specific metrics
    videoViews: {
      type: Number,
      default: 0
    },
    videoViewRate: {
      type: Number,
      default: 0
    },
    videoWatchTime: {
      type: Number,
      default: 0 // in seconds
    },
    
    // Quality metrics
    qualityScore: {
      type: Number,
      min: 1,
      max: 10
    },
    relevanceScore: {
      type: Number,
      min: 1,
      max: 10
    }
  },
  hourlyBreakdown: [{
    hour: {
      type: Number,
      min: 0,
      max: 23
    },
    impressions: Number,
    clicks: Number,
    conversions: Number,
    spend: Number
  }],
  demographicBreakdown: {
    byAge: [{
      ageRange: String, // e.g., "18-24", "25-34"
      impressions: Number,
      clicks: Number,
      conversions: Number
    }],
    byGender: [{
      gender: String,
      impressions: Number,
      clicks: Number,
      conversions: Number
    }]
  },
  deviceBreakdown: [{
    device: {
      type: String,
      enum: ['mobile', 'desktop', 'tablet']
    },
    impressions: Number,
    clicks: Number,
    conversions: Number,
    spend: Number
  }],
  locationBreakdown: [{
    country: String,
    region: String,
    city: String,
    impressions: Number,
    clicks: Number,
    conversions: Number
  }],
  syncedFrom: {
    platform: String,
    syncedAt: Date,
    rawData: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Compound indexes for efficient querying
adPerformanceSchema.index({ campaignId: 1, date: -1 });
adPerformanceSchema.index({ platform: 1, date: -1 });
adPerformanceSchema.index({ creativeId: 1, date: -1 });
adPerformanceSchema.index({ date: -1 });

// Method to calculate derived metrics
adPerformanceSchema.methods.calculateDerivedMetrics = function() {
  const m = this.metrics;
  
  // CTR
  if (m.impressions > 0) {
    m.ctr = (m.clicks / m.impressions) * 100;
  }
  
  // Frequency
  if (m.reach > 0) {
    m.frequency = m.impressions / m.reach;
  }
  
  // Conversion Rate
  if (m.clicks > 0) {
    m.conversionRate = (m.conversions / m.clicks) * 100;
  }
  
  // CPC
  if (m.clicks > 0) {
    m.cpc = m.spend / m.clicks;
  }
  
  // CPM
  if (m.impressions > 0) {
    m.cpm = (m.spend / m.impressions) * 1000;
  }
  
  // CPA
  if (m.conversions > 0) {
    m.cpa = m.spend / m.conversions;
  }
  
  // ROAS
  if (m.spend > 0) {
    m.roas = (m.revenue / m.spend) * 100;
    m.roi = ((m.revenue - m.spend) / m.spend) * 100;
  }
  
  // Video View Rate
  if (m.impressions > 0 && m.videoViews) {
    m.videoViewRate = (m.videoViews / m.impressions) * 100;
  }
};

// Static method to aggregate performance by date range
adPerformanceSchema.statics.aggregateByDateRange = async function(campaignId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        campaignId: mongoose.Types.ObjectId(campaignId),
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        totalImpressions: { $sum: '$metrics.impressions' },
        totalClicks: { $sum: '$metrics.clicks' },
        totalConversions: { $sum: '$metrics.conversions' },
        totalSpend: { $sum: '$metrics.spend' },
        totalRevenue: { $sum: '$metrics.revenue' },
        avgCtr: { $avg: '$metrics.ctr' },
        avgCpc: { $avg: '$metrics.cpc' },
        avgCpa: { $avg: '$metrics.cpa' },
        avgRoas: { $avg: '$metrics.roas' }
      }
    }
  ]);
};

const AdPerformance = mongoose.model('AdPerformance', adPerformanceSchema);

module.exports = AdPerformance;
