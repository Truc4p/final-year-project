const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BudgetLineItemSchema = new Schema({
  category: {
    type: String,
    required: true,
    enum: ['revenue', 'expense', 'payroll', 'marketing', 'operations', 'rent', 'utilities', 'equipment', 'software', 'shipping', 'other']
  },
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChartOfAccounts'
  },
  department: {
    type: String,
    trim: true
  },
  budgetedAmount: {
    type: Number,
    required: true,
    min: 0
  },
  actualAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  variance: {
    type: Number,
    default: 0
  },
  variancePercentage: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    trim: true
  }
}, { _id: true });

const BudgetAlertSchema = new Schema({
  threshold: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 80
  },
  triggered: {
    type: Boolean,
    default: false
  },
  triggeredAt: Date,
  notifiedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  message: String
}, { _id: true });

const BudgetSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: {
    type: String,
    trim: true
  },
  budgetType: {
    type: String,
    enum: ['operating', 'capital', 'project', 'department', 'master'],
    default: 'operating',
    required: true
  },
  fiscalYear: {
    type: Number,
    required: true
  },
  period: {
    type: String,
    enum: ['monthly', 'quarterly', 'annual'],
    default: 'monthly',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'closed', 'archived'],
    default: 'draft'
  },
  totalBudgeted: {
    type: Number,
    default: 0,
    min: 0
  },
  totalActual: {
    type: Number,
    default: 0,
    min: 0
  },
  totalVariance: {
    type: Number,
    default: 0
  },
  utilizationPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  lineItems: [BudgetLineItemSchema],
  
  alerts: [BudgetAlertSchema],
  
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  approvedAt: Date,
  
  lastReviewedAt: Date,
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  tags: [String],
  
  isRecurring: {
    type: Boolean,
    default: false
  },
  
  recurringConfig: {
    frequency: {
      type: String,
      enum: ['monthly', 'quarterly', 'annually']
    },
    autoRenew: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
BudgetSchema.index({ fiscalYear: 1, period: 1 });
BudgetSchema.index({ startDate: 1, endDate: 1 });
BudgetSchema.index({ status: 1 });
BudgetSchema.index({ owner: 1 });
BudgetSchema.index({ createdBy: 1 });

// Virtual for budget health status
BudgetSchema.virtual('healthStatus').get(function() {
  if (this.utilizationPercentage < 70) return 'healthy';
  if (this.utilizationPercentage < 90) return 'warning';
  if (this.utilizationPercentage < 100) return 'critical';
  return 'exceeded';
});

// Method to calculate totals and variances
BudgetSchema.methods.calculateTotals = function() {
  this.totalBudgeted = this.lineItems.reduce((sum, item) => sum + item.budgetedAmount, 0);
  this.totalActual = this.lineItems.reduce((sum, item) => sum + item.actualAmount, 0);
  this.totalVariance = this.totalBudgeted - this.totalActual;
  this.utilizationPercentage = this.totalBudgeted > 0 
    ? (this.totalActual / this.totalBudgeted) * 100 
    : 0;
  
  // Calculate line item variances
  this.lineItems.forEach(item => {
    item.variance = item.budgetedAmount - item.actualAmount;
    item.variancePercentage = item.budgetedAmount > 0 
      ? ((item.actualAmount - item.budgetedAmount) / item.budgetedAmount) * 100 
      : 0;
  });
};

// Method to check alerts
BudgetSchema.methods.checkAlerts = function() {
  const triggeredAlerts = [];
  
  this.alerts.forEach(alert => {
    if (!alert.triggered && this.utilizationPercentage >= alert.threshold) {
      alert.triggered = true;
      alert.triggeredAt = new Date();
      alert.message = `Budget has reached ${alert.threshold}% utilization (${this.utilizationPercentage.toFixed(1)}%)`;
      triggeredAlerts.push(alert);
    }
  });
  
  return triggeredAlerts;
};

// Method to update actual amounts from transactions
BudgetSchema.methods.updateActuals = async function() {
  const CashFlowTransaction = require('./cashFlowTransaction');
  const BusinessExpense = require('./businessExpense');
  
  for (let lineItem of this.lineItems) {
    let actualAmount = 0;
    
    // Get transactions for this category in the budget period
    const transactions = await CashFlowTransaction.find({
      category: lineItem.category,
      date: {
        $gte: this.startDate,
        $lte: this.endDate
      }
    });
    
    actualAmount += transactions.reduce((sum, t) => sum + t.amount, 0);
    
    // Get business expenses if applicable
    if (lineItem.category !== 'revenue') {
      const expenses = await BusinessExpense.find({
        category: lineItem.category,
        date: {
          $gte: this.startDate,
          $lte: this.endDate
        },
        status: { $in: ['paid', 'pending'] }
      });
      
      actualAmount += expenses.reduce((sum, e) => sum + e.amount, 0);
    }
    
    lineItem.actualAmount = actualAmount;
  }
  
  this.calculateTotals();
  await this.save();
};

// Pre-save middleware
BudgetSchema.pre('save', function(next) {
  this.calculateTotals();
  next();
});

// Method to duplicate budget for next period
BudgetSchema.methods.duplicateForNextPeriod = function() {
  const newBudget = new this.constructor({
    name: `${this.name} - Copy`,
    description: this.description,
    budgetType: this.budgetType,
    fiscalYear: this.fiscalYear + 1,
    period: this.period,
    startDate: new Date(this.startDate.setFullYear(this.startDate.getFullYear() + 1)),
    endDate: new Date(this.endDate.setFullYear(this.endDate.getFullYear() + 1)),
    status: 'draft',
    lineItems: this.lineItems.map(item => ({
      category: item.category,
      account: item.account,
      department: item.department,
      budgetedAmount: item.budgetedAmount,
      notes: item.notes
    })),
    alerts: this.alerts.map(alert => ({
      threshold: alert.threshold
    })),
    owner: this.owner,
    createdBy: this.createdBy,
    tags: this.tags,
    isRecurring: this.isRecurring,
    recurringConfig: this.recurringConfig
  });
  
  return newBudget;
};

module.exports = mongoose.model("Budget", BudgetSchema);
