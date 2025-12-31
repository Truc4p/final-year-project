const mongoose = require('mongoose');

const workflowNodeSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: [
      'trigger',           // Entry point
      'action',            // Perform action (send email, SMS, etc.)
      'condition',         // If/else branching
      'delay',            // Wait/delay
      'split',            // A/B test split
      'end'               // End point
    ],
    required: true
  },
  
  // Trigger configuration
  triggerType: {
    type: String,
    enum: [
      'customer_signup',
      'order_placed',
      'cart_abandoned',
      'product_viewed',
      'subscription_cancelled',
      'customer_inactive',
      'custom_event',
      'manual'
    ]
  },
  triggerConditions: {
    type: mongoose.Schema.Types.Mixed
  },
  
  // Action configuration
  actionType: {
    type: String,
    enum: ['send_email', 'send_sms', 'send_push', 'add_tag', 'remove_tag', 'update_field', 'webhook']
  },
  actionConfig: {
    emailTemplate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EmailTemplate'
    },
    smsTemplate: String,
    pushTemplate: {
      title: String,
      body: String
    },
    tags: [String],
    field: String,
    value: mongoose.Schema.Types.Mixed,
    webhookUrl: String
  },
  
  // Condition configuration
  conditionType: {
    type: String,
    enum: ['customer_property', 'order_property', 'tag', 'custom']
  },
  conditionRules: [{
    field: String,
    operator: {
      type: String,
      enum: ['equals', 'not_equals', 'contains', 'not_contains', 'greater_than', 'less_than', 'exists', 'not_exists']
    },
    value: mongoose.Schema.Types.Mixed
  }],
  
  // Delay configuration
  delayDuration: Number,
  delayUnit: {
    type: String,
    enum: ['minutes', 'hours', 'days', 'weeks']
  },
  delayUntil: Date, // Specific time
  
  // Split configuration (A/B testing)
  splitPercentage: {
    type: Number,
    min: 0,
    max: 100
  },
  
  // Position in visual builder
  position: {
    x: Number,
    y: Number
  },
  
  // Connected nodes
  nextNodes: [{
    nodeId: String,
    condition: String // 'true', 'false', 'variantA', 'variantB', etc.
  }]
}, { _id: false });

const workflowSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'archived'],
    default: 'draft'
  },
  
  category: {
    type: String,
    enum: [
      'welcome_series',
      'abandoned_cart',
      'post_purchase',
      're_engagement',
      'win_back',
      'nurture',
      'promotional',
      'transactional',
      'custom'
    ],
    default: 'custom'
  },
  
  // Workflow nodes
  nodes: [workflowNodeSchema],
  
  // Entry point
  entryNode: {
    type: String,
    required: true
  },
  
  // Settings
  settings: {
    allowReEntry: {
      type: Boolean,
      default: false
    },
    maxExecutionsPerCustomer: {
      type: Number,
      default: 0 // 0 = unlimited
    },
    timeWindow: {
      enabled: Boolean,
      startTime: String, // "09:00"
      endTime: String,   // "17:00"
      timezone: String,
      daysOfWeek: [Number] // 0-6 (Sunday-Saturday)
    },
    goalTracking: {
      enabled: Boolean,
      goalType: String, // 'purchase', 'click', 'signup'
      goalValue: Number
    }
  },
  
  // Analytics
  analytics: {
    totalEntered: {
      type: Number,
      default: 0
    },
    totalCompleted: {
      type: Number,
      default: 0
    },
    totalActive: {
      type: Number,
      default: 0
    },
    totalGoalsReached: {
      type: Number,
      default: 0
    },
    conversionRate: {
      type: Number,
      default: 0
    },
    averageCompletionTime: {
      type: Number,
      default: 0 // in minutes
    },
    totalRevenue: {
      type: Number,
      default: 0
    },
    // Node-level analytics
    nodeStats: {
      type: Map,
      of: {
        entered: Number,
        completed: Number,
        failed: Number
      }
    }
  },
  
  // Version control
  version: {
    type: Number,
    default: 1
  },
  parentWorkflow: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workflow'
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  
  lastActivatedAt: Date,
  lastPausedAt: Date
}, {
  timestamps: true
});

// Update conversion rate before saving
workflowSchema.pre('save', function(next) {
  if (this.analytics.totalEntered > 0 && this.settings.goalTracking.enabled) {
    this.analytics.conversionRate = (this.analytics.totalGoalsReached / this.analytics.totalEntered) * 100;
  }
  next();
});

// Index for queries
workflowSchema.index({ status: 1, category: 1 });
workflowSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Workflow', workflowSchema);
