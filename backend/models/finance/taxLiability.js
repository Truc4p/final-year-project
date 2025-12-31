const mongoose = require('mongoose');

const TaxPaymentSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true
  },
  paymentDate: {
    type: Date,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'check', 'online', 'other']
  },
  reference: String,
  notes: String
}, { _id: false });

const TaxLiabilitySchema = new mongoose.Schema({
  taxRate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TaxRate',
    required: true
  },
  period: {
    type: String,
    required: true // Format: YYYY-MM or YYYY-Q1/Q2/Q3/Q4 or YYYY
  },
  periodStart: {
    type: Date,
    required: true
  },
  periodEnd: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'calculated', 'filed', 'paid', 'overdue'],
    default: 'pending'
  },
  taxableAmount: {
    type: Number,
    required: true,
    default: 0
  },
  taxAmount: {
    type: Number,
    required: true,
    default: 0
  },
  adjustments: {
    type: Number,
    default: 0
  },
  penalties: {
    type: Number,
    default: 0
  },
  interest: {
    type: Number,
    default: 0
  },
  totalDue: {
    type: Number,
    default: 0
  },
  amountPaid: {
    type: Number,
    default: 0
  },
  balance: {
    type: Number,
    default: 0
  },
  dueDate: Date,
  filedDate: Date,
  filedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  payments: [TaxPaymentSchema],
  transactions: [{
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'transactionModel'
  }],
  transactionModel: {
    type: String,
    enum: ['Invoice', 'Bill', 'BusinessExpense', 'CashFlowTransaction']
  },
  notes: String,
  attachments: [{
    filename: String,
    url: String,
    uploadDate: Date
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes
TaxLiabilitySchema.index({ taxRate: 1, period: 1 });
TaxLiabilitySchema.index({ status: 1, dueDate: 1 });
TaxLiabilitySchema.index({ periodStart: 1, periodEnd: 1 });

// Pre-save middleware to calculate totals
TaxLiabilitySchema.pre('save', function(next) {
  this.totalDue = this.taxAmount + this.adjustments + this.penalties + this.interest;
  
  // Calculate amount paid from payments array
  if (this.payments && this.payments.length > 0) {
    this.amountPaid = this.payments.reduce((sum, payment) => sum + payment.amount, 0);
  }
  
  this.balance = this.totalDue - this.amountPaid;
  
  // Update status based on payment
  if (this.balance <= 0 && this.totalDue > 0) {
    this.status = 'paid';
  } else if (this.dueDate && new Date() > this.dueDate && this.balance > 0) {
    this.status = 'overdue';
  }
  
  next();
});

// Virtual for checking if overdue
TaxLiabilitySchema.virtual('isOverdue').get(function() {
  return this.dueDate && new Date() > this.dueDate && this.balance > 0;
});

// Virtual for days overdue
TaxLiabilitySchema.virtual('daysOverdue').get(function() {
  if (!this.isOverdue) return 0;
  const now = new Date();
  const diffTime = Math.abs(now - this.dueDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Method to add payment
TaxLiabilitySchema.methods.addPayment = function(paymentData) {
  this.payments.push(paymentData);
  return this.save();
};

// Method to calculate penalties
TaxLiabilitySchema.methods.calculatePenalties = function(penaltyRate = 0.05) {
  if (this.isOverdue) {
    // Simple penalty: 5% of tax amount plus daily interest
    const basePenalty = this.taxAmount * penaltyRate;
    const dailyRate = 0.0001; // 0.01% per day
    const dailyInterest = this.balance * dailyRate * this.daysOverdue;
    
    this.penalties = basePenalty;
    this.interest = dailyInterest;
  }
  return this.save();
};

// Static method to get summary by period
TaxLiabilitySchema.statics.getSummaryByPeriod = async function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        periodStart: { $gte: new Date(startDate) },
        periodEnd: { $lte: new Date(endDate) }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalTaxable: { $sum: '$taxableAmount' },
        totalTax: { $sum: '$taxAmount' },
        totalDue: { $sum: '$totalDue' },
        totalPaid: { $sum: '$amountPaid' },
        totalBalance: { $sum: '$balance' }
      }
    }
  ]);
};

// Static method to get overdue liabilities
TaxLiabilitySchema.statics.getOverdue = async function() {
  const now = new Date();
  return this.find({
    status: { $in: ['calculated', 'filed', 'overdue'] },
    dueDate: { $lt: now },
    balance: { $gt: 0 }
  }).populate('taxRate').sort({ dueDate: 1 });
};

// Ensure virtuals are included in JSON
TaxLiabilitySchema.set('toJSON', { virtuals: true });
TaxLiabilitySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('TaxLiability', TaxLiabilitySchema);
