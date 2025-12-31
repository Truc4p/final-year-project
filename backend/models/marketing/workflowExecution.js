const mongoose = require('mongoose');

const executionLogSchema = new mongoose.Schema({
  nodeId: String,
  nodeName: String,
  nodeType: String,
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'skipped']
  },
  executedAt: Date,
  completedAt: Date,
  error: String,
  metadata: mongoose.Schema.Types.Mixed
}, { _id: false });

const workflowExecutionSchema = new mongoose.Schema({
  workflow: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workflow',
    required: true
  },
  
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  
  status: {
    type: String,
    enum: ['active', 'completed', 'failed', 'cancelled', 'waiting'],
    default: 'active'
  },
  
  // Current position in workflow
  currentNode: String,
  
  // Execution context (variables, customer data, etc.)
  context: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Trigger information
  triggerType: String,
  triggerData: mongoose.Schema.Types.Mixed,
  
  // Execution timeline
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  
  // Next scheduled action
  nextExecutionAt: Date,
  
  // Execution logs
  logs: [executionLogSchema],
  
  // Goal tracking
  goalReached: {
    type: Boolean,
    default: false
  },
  goalReachedAt: Date,
  goalValue: Number,
  
  // Error handling
  errorCount: {
    type: Number,
    default: 0
  },
  lastError: String,
  
  // Metadata
  metadata: {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    cart: mongoose.Schema.Types.Mixed,
    tags: [String],
    customData: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Calculate execution duration
workflowExecutionSchema.virtual('duration').get(function() {
  if (this.completedAt && this.startedAt) {
    return Math.round((this.completedAt - this.startedAt) / 1000 / 60); // in minutes
  }
  return 0;
});

// Indexes for performance
workflowExecutionSchema.index({ workflow: 1, status: 1 });
workflowExecutionSchema.index({ customer: 1, workflow: 1 });
workflowExecutionSchema.index({ nextExecutionAt: 1, status: 1 });
workflowExecutionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('WorkflowExecution', workflowExecutionSchema);
