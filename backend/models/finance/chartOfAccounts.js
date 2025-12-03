const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ChartOfAccountsSchema = new Schema({
  accountCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    // Format: XXXX (e.g., 1000, 1100, 2000)
    match: /^[0-9]{4,6}$/
  },
  accountName: {
    type: String,
    required: true,
    trim: true
  },
  accountType: {
    type: String,
    enum: ['asset', 'liability', 'equity', 'revenue', 'expense'],
    required: true
  },
  accountSubType: {
    type: String,
    enum: [
      // Asset subtypes
      'current_asset', 'fixed_asset', 'other_asset',
      // Liability subtypes
      'current_liability', 'long_term_liability',
      // Equity subtypes
      'owner_equity', 'retained_earnings',
      // Revenue subtypes
      'operating_revenue', 'other_revenue',
      // Expense subtypes
      'cost_of_goods_sold', 'operating_expense', 'other_expense'
    ],
    required: true
  },
  parentAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChartOfAccounts',
    default: null
  },
  level: {
    type: Number,
    default: 0,
    // 0 = top level, 1 = sub-account, 2 = sub-sub-account
    min: 0,
    max: 5
  },
  description: {
    type: String,
    trim: true
  },
  normalBalance: {
    type: String,
    enum: ['debit', 'credit'],
    required: true
    // Assets & Expenses = Debit
    // Liabilities, Equity, Revenue = Credit
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isSystemAccount: {
    type: Boolean,
    default: false
    // System accounts cannot be deleted (e.g., Cash, Accounts Receivable)
  },
  allowManualEntry: {
    type: Boolean,
    default: true
    // Some accounts may only be updated through specific processes
  },
  currency: {
    type: String,
    default: 'USD',
    trim: true
  },
  taxRelevant: {
    type: Boolean,
    default: false
    // Mark accounts relevant for tax reporting
  },
  bankAccount: {
    type: Boolean,
    default: false
    // Indicates if this account represents a bank account
  },
  reconcilable: {
    type: Boolean,
    default: false
    // Indicates if this account needs regular reconciliation
  },
  currentBalance: {
    type: Number,
    default: 0
    // Calculated field - sum of all journal entry lines
  },
  // Metadata for reporting and categorization
  reportCategory: {
    type: String,
    enum: [
      // Balance Sheet categories
      'cash_and_equivalents', 'accounts_receivable', 'inventory', 
      'prepaid_expenses', 'property_plant_equipment', 'intangible_assets',
      'accounts_payable', 'accrued_liabilities', 'deferred_revenue',
      'loans_payable', 'owner_capital', 'retained_earnings',
      // Income Statement categories
      'sales_revenue', 'service_revenue', 'cost_of_sales',
      'payroll_expense', 'rent_expense', 'utilities_expense',
      'marketing_expense', 'admin_expense', 'other_income_expense'
    ]
  },
  notes: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for better query performance (note: accountCode has unique: true which creates an index automatically)
ChartOfAccountsSchema.index({ accountType: 1, accountSubType: 1 });
ChartOfAccountsSchema.index({ isActive: 1 });
ChartOfAccountsSchema.index({ parentAccount: 1 });
ChartOfAccountsSchema.index({ level: 1 });

// Virtual for formatted account display
ChartOfAccountsSchema.virtual('displayName').get(function() {
  return `${this.accountCode} - ${this.accountName}`;
});

// Method to check if account has children
ChartOfAccountsSchema.methods.hasChildren = async function() {
  const count = await this.model('ChartOfAccounts').countDocuments({ 
    parentAccount: this._id 
  });
  return count > 0;
};

// Method to get account hierarchy path
ChartOfAccountsSchema.methods.getHierarchyPath = async function() {
  const path = [this.displayName];
  let current = this;
  
  while (current.parentAccount) {
    current = await this.model('ChartOfAccounts').findById(current.parentAccount);
    if (current) {
      path.unshift(current.displayName);
    } else {
      break;
    }
  }
  
  return path.join(' > ');
};

// Static method to get accounts by type
ChartOfAccountsSchema.statics.getByType = function(accountType) {
  return this.find({ 
    accountType, 
    isActive: true 
  }).sort({ accountCode: 1 });
};

// Static method to get top-level accounts
ChartOfAccountsSchema.statics.getTopLevel = function() {
  return this.find({ 
    level: 0, 
    isActive: true 
  }).sort({ accountCode: 1 });
};

// Static method to get account tree structure
ChartOfAccountsSchema.statics.getAccountTree = async function(accountType = null) {
  const query = { level: 0, isActive: true };
  if (accountType) query.accountType = accountType;
  
  const topLevelAccounts = await this.find(query).sort({ accountCode: 1 }).lean();
  
  // Recursively populate children
  const populateChildren = async (accounts) => {
    for (let account of accounts) {
      const children = await this.find({ 
        parentAccount: account._id, 
        isActive: true 
      }).sort({ accountCode: 1 }).lean();
      
      if (children.length > 0) {
        account.children = await populateChildren(children);
      }
    }
    return accounts;
  };
  
  return await populateChildren(topLevelAccounts);
};

// Pre-save validation
ChartOfAccountsSchema.pre('save', async function(next) {
  // Set normal balance based on account type
  if (this.isNew || this.isModified('accountType')) {
    if (['asset', 'expense'].includes(this.accountType)) {
      this.normalBalance = 'debit';
    } else if (['liability', 'equity', 'revenue'].includes(this.accountType)) {
      this.normalBalance = 'credit';
    }
  }
  
  // Set level based on parent
  if (this.parentAccount) {
    const parent = await this.model('ChartOfAccounts').findById(this.parentAccount);
    if (parent) {
      this.level = parent.level + 1;
    }
  } else {
    this.level = 0;
  }
  
  next();
});

// Pre-remove hook to prevent deletion of system accounts or accounts with children
ChartOfAccountsSchema.pre('remove', async function(next) {
  if (this.isSystemAccount) {
    return next(new Error('Cannot delete system accounts'));
  }
  
  const hasChildren = await this.hasChildren();
  if (hasChildren) {
    return next(new Error('Cannot delete account with sub-accounts'));
  }
  
  // Check if account has transactions
  const JournalEntryLine = mongoose.model('JournalEntryLine');
  const transactionCount = await JournalEntryLine.countDocuments({ 
    account: this._id 
  });
  
  if (transactionCount > 0) {
    return next(new Error('Cannot delete account with existing transactions. Mark as inactive instead.'));
  }
  
  next();
});

// Ensure virtual fields are serialized
ChartOfAccountsSchema.set('toJSON', { virtuals: true });
ChartOfAccountsSchema.set('toObject', { virtuals: true });

const ChartOfAccounts = mongoose.model("ChartOfAccounts", ChartOfAccountsSchema);
module.exports = ChartOfAccounts;
