const mongoose = require('mongoose');

const socialMediaAnalyticsSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SocialMediaPost',
    required: true
  },
  platform: {
    type: String,
    enum: ['facebook', 'instagram', 'twitter', 'linkedin'],
    required: true
  },
  platformPostId: {
    type: String,
    required: true
  },
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SocialMediaAccount',
    required: true
  },
  metrics: {
    // Reach & Impressions
    reach: { type: Number, default: 0 },
    impressions: { type: Number, default: 0 },
    
    // Engagement
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    saves: { type: Number, default: 0 },
    
    // Clicks
    linkClicks: { type: Number, default: 0 },
    profileClicks: { type: Number, default: 0 },
    
    // Video specific (if applicable)
    videoViews: { type: Number, default: 0 },
    videoCompletionRate: { type: Number, default: 0 },
    
    // Calculated metrics
    engagementRate: { type: Number, default: 0 },
    clickThroughRate: { type: Number, default: 0 }
  },
  demographics: {
    ageGroups: [{
      range: String,
      count: Number,
      percentage: Number
    }],
    gender: [{
      type: String,
      count: Number,
      percentage: Number
    }],
    topLocations: [{
      location: String,
      count: Number
    }]
  },
  comments: [{
    commentId: String,
    username: String,
    userProfileUrl: String,
    text: String,
    likes: { type: Number, default: 0 },
    timestamp: Date,
    sentiment: {
      type: String,
      enum: ['positive', 'negative', 'neutral'],
      default: 'neutral'
    },
    replied: { type: Boolean, default: false },
    hidden: { type: Boolean, default: false }
  }],
  lastSyncedAt: {
    type: Date,
    default: Date.now
  },
  recordedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
socialMediaAnalyticsSchema.index({ postId: 1, platform: 1 });
socialMediaAnalyticsSchema.index({ accountId: 1, recordedAt: -1 });
socialMediaAnalyticsSchema.index({ platformPostId: 1, platform: 1 });

// Calculate engagement rate before saving
socialMediaAnalyticsSchema.pre('save', function(next) {
  if (this.metrics.impressions > 0) {
    const totalEngagement = this.metrics.likes + this.metrics.comments + this.metrics.shares + this.metrics.saves;
    this.metrics.engagementRate = (totalEngagement / this.metrics.impressions) * 100;
  }
  
  if (this.metrics.impressions > 0 && this.metrics.linkClicks > 0) {
    this.metrics.clickThroughRate = (this.metrics.linkClicks / this.metrics.impressions) * 100;
  }
  
  next();
});

module.exports = mongoose.model('SocialMediaAnalytics', socialMediaAnalyticsSchema);
