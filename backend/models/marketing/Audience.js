const mongoose = require('mongoose');

const audienceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String
  },
  type: {
    type: String,
    enum: ['cart_abandoners', 'product_viewers', 'purchasers', 'custom', 'lookalike'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'building'],
    default: 'building'
  },
  rules: {
    conditions: [{
      field: String, // e.g., 'eventType', 'cartValue', 'productId'
      operator: String, // e.g., 'equals', 'contains', 'greater_than', 'less_than'
      value: mongoose.Schema.Types.Mixed
    }],
    logicalOperator: {
      type: String,
      enum: ['AND', 'OR'],
      default: 'AND'
    },
    timeWindow: {
      value: Number,
      unit: {
        type: String,
        enum: ['hours', 'days', 'weeks', 'months']
      }
    },
    excludeConverted: {
      type: Boolean,
      default: true
    }
  },
  // For lookalike audiences
  sourceAudienceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Audience'
  },
  similarityScore: {
    type: Number,
    min: 1,
    max: 10,
    default: 7
  },
  size: {
    type: Number,
    default: 0
  },
  estimatedReach: {
    type: Number
  },
  lastBuiltAt: {
    type: Date
  },
  refreshFrequency: {
    type: String,
    enum: ['realtime', 'hourly', 'daily', 'weekly'],
    default: 'daily'
  },
  platformSyncs: [{
    platform: {
      type: String,
      enum: ['google_ads', 'facebook_ads', 'tiktok_ads', 'linkedin_ads']
    },
    audienceId: String,
    lastSyncedAt: Date,
    status: {
      type: String,
      enum: ['synced', 'pending', 'failed']
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Method to build audience based on rules
audienceSchema.methods.buildAudience = async function() {
  const TrackingEvent = mongoose.model('TrackingEvent');
  
  this.status = 'building';
  await this.save();
  
  try {
    // Build query based on rules
    let query = {};
    const conditions = [];
    
    // Time window filter
    if (this.rules.timeWindow) {
      const timeAgo = new Date();
      switch (this.rules.timeWindow.unit) {
        case 'hours':
          timeAgo.setHours(timeAgo.getHours() - this.rules.timeWindow.value);
          break;
        case 'days':
          timeAgo.setDate(timeAgo.getDate() - this.rules.timeWindow.value);
          break;
        case 'weeks':
          timeAgo.setDate(timeAgo.getDate() - (this.rules.timeWindow.value * 7));
          break;
        case 'months':
          timeAgo.setMonth(timeAgo.getMonth() - this.rules.timeWindow.value);
          break;
      }
      query.timestamp = { $gte: timeAgo };
    }
    
    // Apply rule conditions
    this.rules.conditions.forEach(condition => {
      let condQuery = {};
      switch (condition.operator) {
        case 'equals':
          condQuery[condition.field] = condition.value;
          break;
        case 'contains':
          condQuery[condition.field] = { $regex: condition.value, $options: 'i' };
          break;
        case 'greater_than':
          condQuery[condition.field] = { $gt: condition.value };
          break;
        case 'less_than':
          condQuery[condition.field] = { $lt: condition.value };
          break;
        case 'in':
          condQuery[condition.field] = { $in: condition.value };
          break;
      }
      conditions.push(condQuery);
    });
    
    if (conditions.length > 0) {
      query[this.rules.logicalOperator === 'OR' ? '$or' : '$and'] = conditions;
    }
    
    // Exclude converted users if specified
    if (this.rules.excludeConverted) {
      const converters = await TrackingEvent.distinct('visitorId', {
        eventType: 'purchase',
        timestamp: query.timestamp
      });
      query.visitorId = { $nin: converters };
    }
    
    // Count unique visitors
    const visitors = await TrackingEvent.distinct('visitorId', query);
    
    this.size = visitors.length;
    this.lastBuiltAt = new Date();
    this.status = 'active';
    await this.save();
    
    return visitors;
  } catch (error) {
    this.status = 'inactive';
    await this.save();
    throw error;
  }
};

// Method to get audience members
audienceSchema.methods.getMembers = async function(limit = 1000, offset = 0) {
  const TrackingEvent = mongoose.model('TrackingEvent');
  
  // Build query (similar to buildAudience)
  let query = {};
  
  if (this.rules.timeWindow) {
    const timeAgo = new Date();
    switch (this.rules.timeWindow.unit) {
      case 'hours':
        timeAgo.setHours(timeAgo.getHours() - this.rules.timeWindow.value);
        break;
      case 'days':
        timeAgo.setDate(timeAgo.getDate() - this.rules.timeWindow.value);
        break;
      case 'weeks':
        timeAgo.setDate(timeAgo.getDate() - (this.rules.timeWindow.value * 7));
        break;
      case 'months':
        timeAgo.setMonth(timeAgo.getMonth() - this.rules.timeWindow.value);
        break;
    }
    query.timestamp = { $gte: timeAgo };
  }
  
  const events = await TrackingEvent.aggregate([
    { $match: query },
    { $group: {
      _id: '$visitorId',
      lastSeen: { $max: '$timestamp' },
      eventCount: { $sum: 1 },
      events: { $push: {
        type: '$eventType',
        timestamp: '$timestamp',
        data: '$data'
      }}
    }},
    { $skip: offset },
    { $limit: limit }
  ]);
  
  return events;
};

const Audience = mongoose.model('Audience', audienceSchema);

module.exports = Audience;
