const mongoose = require('mongoose');

const emailSegmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  criteria: {
    // Dynamic filtering criteria
    source: [String], // Filter by subscription sources
    dateRange: {
      from: Date,
      to: Date
    },
    emailPattern: String, // Regex pattern for email filtering
    customFields: [{
      field: String,
      operator: {
        type: String,
        enum: ['equals', 'contains', 'startsWith', 'endsWith', 'exists', 'not_exists']
      },
      value: String
    }]
  },
  subscriberCount: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
emailSegmentSchema.index({ createdBy: 1, name: 1 });
emailSegmentSchema.index({ isDefault: 1 });

// Instance method to get matching subscribers
emailSegmentSchema.methods.getMatchingSubscribers = async function() {
  const NewsletterSubscription = mongoose.model('NewsletterSubscription');
  
  let query = {};
  
  // Apply source filters
  if (this.criteria.source && this.criteria.source.length > 0) {
    query.source = { $in: this.criteria.source };
  }
  
  // Apply date range filters
  if (this.criteria.dateRange) {
    const dateQuery = {};
    if (this.criteria.dateRange.from) {
      dateQuery.$gte = this.criteria.dateRange.from;
    }
    if (this.criteria.dateRange.to) {
      dateQuery.$lte = this.criteria.dateRange.to;
    }
    if (Object.keys(dateQuery).length > 0) {
      query.createdAt = dateQuery;
    }
  }
  
  // Apply email pattern filter
  if (this.criteria.emailPattern) {
    query.email = { $regex: this.criteria.emailPattern, $options: 'i' };
  }
  
  // Apply custom field filters
  if (this.criteria.customFields && this.criteria.customFields.length > 0) {
    this.criteria.customFields.forEach(filter => {
      switch (filter.operator) {
        case 'equals':
          query[filter.field] = filter.value;
          break;
        case 'contains':
          query[filter.field] = { $regex: filter.value, $options: 'i' };
          break;
        case 'startsWith':
          query[filter.field] = { $regex: `^${filter.value}`, $options: 'i' };
          break;
        case 'endsWith':
          query[filter.field] = { $regex: `${filter.value}$`, $options: 'i' };
          break;
        case 'exists':
          query[filter.field] = { $exists: true, $ne: null };
          break;
        case 'not_exists':
          query[filter.field] = { $exists: false };
          break;
      }
    });
  }
  
  return await NewsletterSubscription.find(query);
};

// Static method to update subscriber counts for all segments
emailSegmentSchema.statics.updateAllCounts = async function() {
  const segments = await this.find({});
  
  for (const segment of segments) {
    const subscribers = await segment.getMatchingSubscribers();
    segment.subscriberCount = subscribers.length;
    segment.lastUpdated = new Date();
    await segment.save();
  }
};

// Static method to create default segments
emailSegmentSchema.statics.createDefaultSegments = async function(userId) {
  const defaultSegments = [
    {
      name: 'All Subscribers',
      description: 'All active newsletter subscribers',
      criteria: {},
      isDefault: true,
      createdBy: userId
    },
    {
      name: 'New Subscribers (Last 30 Days)',
      description: 'Subscribers who joined in the last 30 days',
      criteria: {
        dateRange: {
          from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      },
      isDefault: true,
      createdBy: userId
    },
    {
      name: 'Checkout Subscribers',
      description: 'Subscribers who signed up during checkout',
      criteria: {
        source: ['checkout']
      },
      isDefault: true,
      createdBy: userId
    },
    {
      name: 'Website Subscribers',
      description: 'Subscribers who signed up through the website',
      criteria: {
        source: ['public_page']
      },
      isDefault: true,
      createdBy: userId
    }
  ];
  
  for (const segmentData of defaultSegments) {
    const existingSegment = await this.findOne({
      name: segmentData.name,
      createdBy: userId
    });
    
    if (!existingSegment) {
      const segment = new this(segmentData);
      const subscribers = await segment.getMatchingSubscribers();
      segment.subscriberCount = subscribers.length;
      await segment.save();
    }
  }
};

module.exports = mongoose.model('EmailSegment', emailSegmentSchema);