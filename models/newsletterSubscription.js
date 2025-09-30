const mongoose = require('mongoose');

const newsletterSubscriptionSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
  },
  subscriptionDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  source: {
    type: String,
    default: 'public_page', // Track where the subscription came from
    enum: ['public_page', 'checkout', 'manual', 'other']
  },
  unsubscribeToken: {
    type: String,
    unique: true,
    sparse: true // Allow null values but ensure uniqueness when present
  },
  unsubscribedDate: {
    type: Date,
    default: null
  },
  // Optional: Store user preferences if they're logged in
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  // Track email preferences
  preferences: {
    newProducts: {
      type: Boolean,
      default: true
    },
    promotions: {
      type: Boolean,
      default: true
    },
    newsletter: {
      type: Boolean,
      default: true
    }
  },
  // Metadata
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient queries
newsletterSubscriptionSchema.index({ email: 1 });
newsletterSubscriptionSchema.index({ isActive: 1 });
newsletterSubscriptionSchema.index({ subscriptionDate: -1 });

// Generate unsubscribe token before saving
newsletterSubscriptionSchema.pre('save', function(next) {
  if (this.isNew && !this.unsubscribeToken) {
    this.unsubscribeToken = require('crypto').randomBytes(32).toString('hex');
  }
  next();
});

// Instance method to unsubscribe
newsletterSubscriptionSchema.methods.unsubscribe = function() {
  this.isActive = false;
  this.unsubscribedDate = new Date();
  return this.save();
};

// Static method to find active subscriptions
newsletterSubscriptionSchema.statics.findActiveSubscriptions = function() {
  return this.find({ isActive: true });
};

// Static method to get subscription stats
newsletterSubscriptionSchema.statics.getStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalSubscriptions: { $sum: 1 },
        activeSubscriptions: {
          $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
        },
        inactiveSubscriptions: {
          $sum: { $cond: [{ $eq: ['$isActive', false] }, 1, 0] }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('NewsletterSubscription', newsletterSubscriptionSchema);