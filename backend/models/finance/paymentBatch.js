const mongoose = require('mongoose');

const PaymentItemSchema = new mongoose.Schema({
  documentType: {
    type: String,
    enum: ['invoice', 'bill', 'expense', 'tax_liability'],
    required: true
  },
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'items.documentModel'
  },
  documentModel: {
    type: String,
    enum: ['Invoice', 'Bill', 'BusinessExpense', 'TaxLiability']
  },
  documentNumber: String,
  vendor: String,
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  processedAt: Date,
  failureReason: String,
  transactionReference: String
}, { _id: false });

const PaymentBatchSchema = new mongoose.Schema({
  batchNumber: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  status: {
    type: String,
    enum: ['draft', 'pending_approval', 'approved', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'draft'
  },
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'ach', 'wire', 'check', 'online'],
    required: true
  },
  bankAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BankAccount'
  },
  scheduledDate: Date,
  processedDate: Date,
  items: [PaymentItemSchema],
  totalAmount: {
    type: Number,
    default: 0
  },
  approvalRequired: {
    type: Boolean,
    default: true
  },
  approvalWorkflow: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ApprovalWorkflow'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
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
PaymentBatchSchema.index({ batchNumber: 1 });
PaymentBatchSchema.index({ status: 1, scheduledDate: 1 });
PaymentBatchSchema.index({ createdBy: 1 });

// Pre-save middleware to calculate total
PaymentBatchSchema.pre('save', function(next) {
  this.totalAmount = this.items.reduce((sum, item) => sum + item.amount, 0);
  next();
});

// Generate batch number
PaymentBatchSchema.statics.generateBatchNumber = async function() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  const prefix = `PB-${year}${month}${day}`;
  
  const lastBatch = await this.findOne({
    batchNumber: new RegExp(`^${prefix}`)
  }).sort({ batchNumber: -1 });
  
  let sequence = 1;
  if (lastBatch) {
    const lastSequence = parseInt(lastBatch.batchNumber.split('-').pop());
    sequence = lastSequence + 1;
  }
  
  return `${prefix}-${String(sequence).padStart(4, '0')}`;
};

// Virtual for completion percentage
PaymentBatchSchema.virtual('completionPercentage').get(function() {
  if (this.items.length === 0) return 0;
  const completed = this.items.filter(item => item.status === 'completed').length;
  return Math.round((completed / this.items.length) * 100);
});

// Virtual for success rate
PaymentBatchSchema.virtual('successRate').get(function() {
  if (this.items.length === 0) return 0;
  const successful = this.items.filter(item => item.status === 'completed').length;
  return Math.round((successful / this.items.length) * 100);
});

// Method to approve batch
PaymentBatchSchema.methods.approve = function(userId) {
  this.status = 'approved';
  this.approvedBy = userId;
  this.approvedAt = new Date();
  return this.save();
};

// Method to process batch
PaymentBatchSchema.methods.process = async function() {
  if (this.status !== 'approved') {
    throw new Error('Batch must be approved before processing');
  }
  
  this.status = 'processing';
  this.processedDate = new Date();
  
  return this.save();
};

// Method to complete batch
PaymentBatchSchema.methods.complete = function() {
  this.status = 'completed';
  return this.save();
};

// Method to cancel batch
PaymentBatchSchema.methods.cancel = function() {
  if (this.status === 'processing' || this.status === 'completed') {
    throw new Error('Cannot cancel a batch that is processing or completed');
  }
  
  this.status = 'cancelled';
  this.items.forEach(item => {
    if (item.status === 'pending') {
      item.status = 'cancelled';
    }
  });
  
  return this.save();
};

// Static method to get scheduled batches
PaymentBatchSchema.statics.getScheduled = async function(date = new Date()) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return this.find({
    status: 'approved',
    scheduledDate: {
      $gte: startOfDay,
      $lte: endOfDay
    }
  }).populate('bankAccount').populate('createdBy', 'firstName lastName email');
};

// Ensure virtuals are included in JSON
PaymentBatchSchema.set('toJSON', { virtuals: true });
PaymentBatchSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('PaymentBatch', PaymentBatchSchema);
