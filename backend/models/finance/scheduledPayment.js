const mongoose = require('mongoose');

const ScheduledPaymentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  documentType: {
    type: String,
    enum: ['invoice', 'bill', 'expense', 'tax_liability', 'other'],
    required: true
  },
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'documentModel'
  },
  documentModel: {
    type: String,
    enum: ['Invoice', 'Bill', 'BusinessExpense', 'TaxLiability']
  },
  vendor: String,
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'ach', 'wire', 'check', 'online', 'auto'],
    default: 'auto'
  },
  bankAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BankAccount'
  },
  frequency: {
    type: String,
    enum: ['once', 'daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'annually'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: Date,
  nextPaymentDate: {
    type: Date,
    required: true
  },
  lastPaymentDate: Date,
  dayOfMonth: Number, // For monthly frequency (1-31)
  dayOfWeek: Number, // For weekly frequency (0=Sunday, 6=Saturday)
  status: {
    type: String,
    enum: ['active', 'paused', 'completed', 'cancelled'],
    default: 'active'
  },
  autoApprove: {
    type: Boolean,
    default: false
  },
  requiresApproval: {
    type: Boolean,
    default: true
  },
  executionCount: {
    type: Number,
    default: 0
  },
  maxExecutions: Number,
  notes: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes
ScheduledPaymentSchema.index({ status: 1, nextPaymentDate: 1 });
ScheduledPaymentSchema.index({ documentType: 1, documentId: 1 });
ScheduledPaymentSchema.index({ createdBy: 1 });

// Method to calculate next payment date
ScheduledPaymentSchema.methods.calculateNextPaymentDate = function(fromDate = new Date()) {
  const date = new Date(fromDate);
  
  switch (this.frequency) {
    case 'once':
      return null; // No next payment for one-time payments
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'biweekly':
      date.setDate(date.getDate() + 14);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      if (this.dayOfMonth) {
        date.setDate(Math.min(this.dayOfMonth, new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()));
      }
      break;
    case 'quarterly':
      date.setMonth(date.getMonth() + 3);
      break;
    case 'annually':
      date.setFullYear(date.getFullYear() + 1);
      break;
  }
  
  return date;
};

// Method to execute payment
ScheduledPaymentSchema.methods.execute = async function() {
  if (this.status !== 'active') {
    throw new Error('Scheduled payment must be active to execute');
  }
  
  this.lastPaymentDate = new Date();
  this.executionCount += 1;
  
  // Calculate next payment date
  if (this.frequency === 'once') {
    this.status = 'completed';
    this.nextPaymentDate = null;
  } else {
    this.nextPaymentDate = this.calculateNextPaymentDate(this.lastPaymentDate);
    
    // Check if we've reached end date or max executions
    if (this.endDate && this.nextPaymentDate > this.endDate) {
      this.status = 'completed';
      this.nextPaymentDate = null;
    } else if (this.maxExecutions && this.executionCount >= this.maxExecutions) {
      this.status = 'completed';
      this.nextPaymentDate = null;
    }
  }
  
  return this.save();
};

// Method to pause scheduled payment
ScheduledPaymentSchema.methods.pause = function() {
  if (this.status !== 'active') {
    throw new Error('Only active scheduled payments can be paused');
  }
  this.status = 'paused';
  return this.save();
};

// Method to resume scheduled payment
ScheduledPaymentSchema.methods.resume = function() {
  if (this.status !== 'paused') {
    throw new Error('Only paused scheduled payments can be resumed');
  }
  this.status = 'active';
  return this.save();
};

// Method to cancel scheduled payment
ScheduledPaymentSchema.methods.cancel = function() {
  if (this.status === 'completed' || this.status === 'cancelled') {
    throw new Error('Cannot cancel a completed or already cancelled scheduled payment');
  }
  this.status = 'cancelled';
  return this.save();
};

// Static method to get due payments
ScheduledPaymentSchema.statics.getDuePayments = async function(date = new Date()) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return this.find({
    status: 'active',
    nextPaymentDate: {
      $gte: startOfDay,
      $lte: endOfDay
    }
  })
    .populate('bankAccount')
    .populate('documentId')
    .populate('createdBy', 'firstName lastName email');
};

// Virtual for remaining payments
ScheduledPaymentSchema.virtual('remainingPayments').get(function() {
  if (this.frequency === 'once') return 0;
  if (!this.maxExecutions) return null; // Unlimited
  return Math.max(0, this.maxExecutions - this.executionCount);
});

// Virtual for is overdue
ScheduledPaymentSchema.virtual('isOverdue').get(function() {
  return this.status === 'active' && this.nextPaymentDate && new Date() > this.nextPaymentDate;
});

// Ensure virtuals are included in JSON
ScheduledPaymentSchema.set('toJSON', { virtuals: true });
ScheduledPaymentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('ScheduledPayment', ScheduledPaymentSchema);
