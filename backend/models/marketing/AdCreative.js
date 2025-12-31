const mongoose = require('mongoose');

const adCreativeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['image', 'video', 'carousel', 'collection', 'dynamic', 'text'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending_review', 'rejected'],
    default: 'active'
  },
  format: {
    type: String,
    enum: ['single_image', 'single_video', 'carousel', 'slideshow', 'collection', 'instant_experience']
  },
  assets: {
    images: [{
      url: String,
      width: Number,
      height: Number,
      alt: String,
      order: Number
    }],
    videos: [{
      url: String,
      thumbnailUrl: String,
      duration: Number,
      order: Number
    }],
    headlines: [{
      text: {
        type: String,
        maxlength: 150
      },
      language: {
        type: String,
        default: 'en'
      }
    }],
    descriptions: [{
      text: {
        type: String,
        maxlength: 500
      },
      language: {
        type: String,
        default: 'en'
      }
    }],
    callToAction: {
      type: String,
      enum: [
        'learn_more',
        'shop_now',
        'sign_up',
        'download',
        'book_now',
        'contact_us',
        'get_quote',
        'apply_now',
        'watch_video',
        'see_menu'
      ]
    },
    displayUrl: String,
    landingUrl: {
      type: String,
      required: true
    }
  },
  carousel: {
    cards: [{
      image: String,
      headline: String,
      description: String,
      destinationUrl: String,
      callToAction: String
    }]
  },
  dynamicTemplate: {
    productFeed: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductFeed'
    },
    template: {
      layout: String,
      customization: mongoose.Schema.Types.Mixed
    }
  },
  targeting: {
    platforms: [{
      type: String,
      enum: ['google_ads', 'facebook_ads', 'instagram_ads', 'tiktok_ads', 'linkedin_ads']
    }],
    placements: [String],
    deviceTypes: [String]
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
    ctr: {
      type: Number,
      default: 0
    },
    conversionRate: {
      type: Number,
      default: 0
    }
  },
  abTesting: {
    isTestVariant: {
      type: Boolean,
      default: false
    },
    testGroup: String,
    parentCreativeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AdCreative'
    }
  },
  approvalStatus: {
    status: {
      type: String,
      enum: ['approved', 'pending', 'rejected', 'needs_review'],
      default: 'pending'
    },
    reviewedAt: Date,
    reviewNotes: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Calculate performance metrics
adCreativeSchema.methods.calculateMetrics = function() {
  if (this.performance.impressions > 0) {
    this.performance.ctr = (this.performance.clicks / this.performance.impressions) * 100;
  }
  
  if (this.performance.clicks > 0) {
    this.performance.conversionRate = (this.performance.conversions / this.performance.clicks) * 100;
  }
};

const AdCreative = mongoose.model('AdCreative', adCreativeSchema);

module.exports = AdCreative;
