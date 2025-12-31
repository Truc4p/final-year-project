const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ApprovalStepSchema = new Schema({
  stepOrder: {
    type: Number,
    required: true
  },
  approverRole: {
    type: String,
    enum: ['manager', 'finance_manager', 'cfo', 'ceo', 'admin', 'department_head'],
    required: true
  },
  approver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'skipped'],
    default: 'pending'
  },
  approvedAt: Date,
  rejectedAt: Date,
  comments: {
    type: String,
    trim: true
  },
  actionBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { _id: true });

const ApprovalWorkflowSchema = new Schema({
  // Reference to the document being approved
  documentType: {
    type: String,
    enum: ['invoice', 'bill', 'expense', 'budget', 'payment'],
    required: true
  },
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'documentType'
  },
  
  // Workflow details
  workflowName: {
    type: String,
    required: true,
    trim: true
  },
  
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  
  currency: {
    type: String,
    default: 'USD'
  },
  
  // Approval steps
  steps: [ApprovalStepSchema],
  
  currentStep: {
    type: Number,
    default: 0
  },
  
  // Overall status
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  
  // Priority
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  
  // Requestor information
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  requestedAt: {
    type: Date,
    default: Date.now
  },
  
  // Completion tracking
  completedAt: Date,
  
  // Due date for approval
  dueDate: Date,
  
  // Notes and history
  notes: {
    type: String,
    trim: true
  },
  
  history: [{
    action: {
      type: String,
      enum: ['created', 'approved', 'rejected', 'cancelled', 'reassigned', 'escalated'],
      required: true
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    performedAt: {
      type: Date,
      default: Date.now
    },
    comments: String,
    previousValue: Schema.Types.Mixed,
    newValue: Schema.Types.Mixed
  }],
  
  // Escalation
  escalated: {
    type: Boolean,
    default: false
  },
  
  escalatedAt: Date,
  
  escalatedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Metadata
  metadata: {
    department: String,
    category: String,
    vendor: String,
    tags: [String]
  }
}, {
  timestamps: true
});

// Indexes for better query performance
ApprovalWorkflowSchema.index({ documentType: 1, documentId: 1 });
ApprovalWorkflowSchema.index({ status: 1, priority: 1 });
ApprovalWorkflowSchema.index({ requestedBy: 1 });
ApprovalWorkflowSchema.index({ 'steps.approver': 1, 'steps.status': 1 });
ApprovalWorkflowSchema.index({ dueDate: 1 });

// Virtual for current approver
ApprovalWorkflowSchema.virtual('currentApprover').get(function() {
  if (this.currentStep < this.steps.length) {
    return this.steps[this.currentStep].approver;
  }
  return null;
});

// Virtual for progress percentage
ApprovalWorkflowSchema.virtual('progressPercentage').get(function() {
  if (this.steps.length === 0) return 0;
  const approvedSteps = this.steps.filter(s => s.status === 'approved').length;
  return (approvedSteps / this.steps.length) * 100;
});

// Method to check if overdue
ApprovalWorkflowSchema.methods.isOverdue = function() {
  if (!this.dueDate) return false;
  return this.status === 'pending' || this.status === 'in_progress' && new Date() > this.dueDate;
};

// Method to get next approver
ApprovalWorkflowSchema.methods.getNextApprover = function() {
  const nextStep = this.steps.find(step => step.status === 'pending');
  return nextStep ? nextStep.approver : null;
};

// Method to approve current step
ApprovalWorkflowSchema.methods.approveStep = async function(approverId, comments = '') {
  if (this.status === 'approved' || this.status === 'rejected' || this.status === 'cancelled') {
    throw new Error('Workflow is already completed');
  }
  
  const currentStepData = this.steps[this.currentStep];
  
  if (!currentStepData) {
    throw new Error('No current step found');
  }
  
  if (currentStepData.status !== 'pending') {
    throw new Error('Current step is not pending');
  }
  
  // Update step
  currentStepData.status = 'approved';
  currentStepData.approvedAt = new Date();
  currentStepData.actionBy = approverId;
  currentStepData.comments = comments;
  
  // Add to history
  this.history.push({
    action: 'approved',
    performedBy: approverId,
    comments: comments,
    previousValue: { step: this.currentStep, status: 'pending' },
    newValue: { step: this.currentStep, status: 'approved' }
  });
  
  // Move to next step or complete
  this.currentStep += 1;
  
  if (this.currentStep >= this.steps.length) {
    this.status = 'approved';
    this.completedAt = new Date();
  } else {
    this.status = 'in_progress';
  }
  
  await this.save();
  return this;
};

// Method to reject workflow
ApprovalWorkflowSchema.methods.rejectStep = async function(approverId, comments = '') {
  if (this.status === 'approved' || this.status === 'rejected' || this.status === 'cancelled') {
    throw new Error('Workflow is already completed');
  }
  
  const currentStepData = this.steps[this.currentStep];
  
  if (!currentStepData) {
    throw new Error('No current step found');
  }
  
  // Update step
  currentStepData.status = 'rejected';
  currentStepData.rejectedAt = new Date();
  currentStepData.actionBy = approverId;
  currentStepData.comments = comments;
  
  // Add to history
  this.history.push({
    action: 'rejected',
    performedBy: approverId,
    comments: comments,
    previousValue: { step: this.currentStep, status: 'pending' },
    newValue: { step: this.currentStep, status: 'rejected' }
  });
  
  // Mark workflow as rejected
  this.status = 'rejected';
  this.completedAt = new Date();
  
  await this.save();
  return this;
};

// Method to cancel workflow
ApprovalWorkflowSchema.methods.cancel = async function(userId, reason = '') {
  if (this.status === 'approved' || this.status === 'rejected' || this.status === 'cancelled') {
    throw new Error('Workflow is already completed');
  }
  
  this.status = 'cancelled';
  this.completedAt = new Date();
  
  this.history.push({
    action: 'cancelled',
    performedBy: userId,
    comments: reason
  });
  
  await this.save();
  return this;
};

// Method to escalate workflow
ApprovalWorkflowSchema.methods.escalate = async function(escalatedTo, reason = '') {
  this.escalated = true;
  this.escalatedAt = new Date();
  this.escalatedTo = escalatedTo;
  this.priority = 'urgent';
  
  this.history.push({
    action: 'escalated',
    performedBy: escalatedTo,
    comments: reason,
    newValue: { escalatedTo, priority: 'urgent' }
  });
  
  await this.save();
  return this;
};

// Static method to create approval workflow based on amount thresholds
ApprovalWorkflowSchema.statics.createWorkflowByThreshold = function(documentType, documentId, amount, requestedBy, metadata = {}) {
  const steps = [];
  let workflowName = '';
  
  // Define approval rules based on amount
  if (amount < 1000) {
    // Under $1,000 - Manager approval only
    steps.push({ stepOrder: 0, approverRole: 'manager', status: 'pending' });
    workflowName = 'Single Approval - Manager';
  } else if (amount < 5000) {
    // $1,000 - $5,000 - Manager + Finance Manager
    steps.push({ stepOrder: 0, approverRole: 'manager', status: 'pending' });
    steps.push({ stepOrder: 1, approverRole: 'finance_manager', status: 'pending' });
    workflowName = 'Two-Level Approval';
  } else if (amount < 10000) {
    // $5,000 - $10,000 - Manager + Finance Manager + CFO
    steps.push({ stepOrder: 0, approverRole: 'manager', status: 'pending' });
    steps.push({ stepOrder: 1, approverRole: 'finance_manager', status: 'pending' });
    steps.push({ stepOrder: 2, approverRole: 'cfo', status: 'pending' });
    workflowName = 'Three-Level Approval';
  } else {
    // Over $10,000 - Manager + Finance Manager + CFO + CEO
    steps.push({ stepOrder: 0, approverRole: 'manager', status: 'pending' });
    steps.push({ stepOrder: 1, approverRole: 'finance_manager', status: 'pending' });
    steps.push({ stepOrder: 2, approverRole: 'cfo', status: 'pending' });
    steps.push({ stepOrder: 3, approverRole: 'ceo', status: 'pending' });
    workflowName = 'Executive Approval';
  }
  
  return new this({
    documentType,
    documentId,
    workflowName,
    amount,
    steps,
    status: 'pending',
    requestedBy,
    requestedAt: new Date(),
    metadata,
    history: [{
      action: 'created',
      performedBy: requestedBy,
      performedAt: new Date()
    }]
  });
};

module.exports = mongoose.model("ApprovalWorkflow", ApprovalWorkflowSchema);
