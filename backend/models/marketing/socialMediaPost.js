const mongoose = require('mongoose');

const socialMediaPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  platforms: [{
    platform: {
      type: String,
      enum: ['facebook', 'instagram', 'twitter', 'linkedin'],
      required: true
    },
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SocialMediaAccount',
      required: true
    },
    postId: {
      type: String // Platform-specific post ID after publishing
    },
    postUrl: {
      type: String
    },
    status: {
      type: String,
      enum: ['pending', 'published', 'failed'],
      default: 'pending'
    },
    publishedAt: {
      type: Date
    },
    error: {
      type: String
    }
  }],
  media: [{
    type: {
      type: String,
      enum: ['image', 'video'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    thumbnailUrl: {
      type: String
    },
    altText: {
      type: String
    }
  }],
  hashtags: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'publishing', 'published', 'failed', 'cancelled'],
    default: 'draft'
  },
  scheduledAt: {
    type: Date
  },
  publishedAt: {
    type: Date
  },
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PostTemplate'
  },
  type: {
    type: String,
    enum: ['regular', 'product_promotion', 'announcement', 'engagement', 'auto_product'],
    default: 'regular'
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Analytics summary (aggregated from SocialMediaAnalytics)
  analytics: {
    totalReach: { type: Number, default: 0 },
    totalEngagement: { type: Number, default: 0 },
    totalLikes: { type: Number, default: 0 },
    totalComments: { type: Number, default: 0 },
    totalShares: { type: Number, default: 0 },
    totalClicks: { type: Number, default: 0 }
  },
  settings: {
    autoPostNewProduct: { type: Boolean, default: false },
    enableComments: { type: Boolean, default: true },
    crossPost: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
socialMediaPostSchema.index({ status: 1, scheduledAt: 1 });
socialMediaPostSchema.index({ createdBy: 1, createdAt: -1 });
socialMediaPostSchema.index({ 'platforms.platform': 1, 'platforms.status': 1 });
socialMediaPostSchema.index({ type: 1, publishedAt: -1 });

module.exports = mongoose.model('SocialMediaPost', socialMediaPostSchema);
