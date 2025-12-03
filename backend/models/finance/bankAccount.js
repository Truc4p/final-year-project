const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Bank transaction schema for tracking individual bank transactions
const BankTransactionSchema = new Schema({
  transactionDate: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true
  },
  transactionType: {
    type: String,
    enum: ['deposit', 'withdrawal', 'transfer', 'fee', 'interest', 'check', 'ach', 'wire', 'other'],
    required: true
  },
  reference: {
    type: String,
    trim: true
    // Check number, transaction ID, reference number
  },
  category: {
    type: String,
    trim: true
    // Optional categorization for grouping similar transactions
  },
  isReconciled: {
    type: Boolean,
    default: false
  },
  reconciledDate: {
    type: Date
  },
  reconciliationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BankReconciliation'
  },
  // Link to related documents
  linkedDocument: {
    type: {
      type: String,
      enum: ['invoice', 'bill', 'journal_entry', 'transfer', 'other']
    },
    documentId: mongoose.Schema.Types.ObjectId
  },
  journalEntry: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JournalEntry'
    // Link to the accounting journal entry
  },
  notes: {
    type: String,
    trim: true
  },
  attachments: [{
    fileName: String,
    fileUrl: String,
    uploadDate: { type: Date, default: Date.now }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { _id: true, timestamps: true });

// Bank reconciliation schema for tracking reconciliation periods
const BankReconciliationSchema = new Schema({
  reconciliationDate: {
    type: Date,
    required: true
  },
  statementStartDate: {
    type: Date,
    required: true
  },
  statementEndDate: {
    type: Date,
    required: true
  },
  statementBalance: {
    type: Number,
    required: true
    // Balance shown on bank statement
  },
  bookBalance: {
    type: Number,
    required: true
    // Balance in accounting books
  },
  difference: {
    type: Number,
    default: 0
    // statementBalance - bookBalance
  },
  status: {
    type: String,
    enum: ['draft', 'in_progress', 'reconciled', 'discrepancy'],
    default: 'draft'
  },
  // Reconciliation details
  deposits: {
    type: Number,
    default: 0
    // Total deposits in period
  },
  withdrawals: {
    type: Number,
    default: 0
    // Total withdrawals in period
  },
  outstandingChecks: [{
    checkNumber: String,
    amount: Number,
    date: Date
  }],
  depositInTransit: [{
    description: String,
    amount: Number,
    date: Date
  }],
  bankFees: {
    type: Number,
    default: 0
  },
  interestEarned: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    trim: true
  },
  reconciledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { _id: true, timestamps: true });

const BankAccountSchema = new Schema({
  // Basic Account Information
  accountName: {
    type: String,
    required: true,
    trim: true
    // e.g., "Main Operating Account", "Payroll Account"
  },
  accountNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
    // Bank account number (can be masked for security)
  },
  accountNumberMasked: {
    type: String,
    trim: true
    // Masked account number for display (e.g., ****1234)
  },
  routingNumber: {
    type: String,
    trim: true
    // US routing number or equivalent
  },
  swiftCode: {
    type: String,
    trim: true
    // International bank identifier
  },
  ibanCode: {
    type: String,
    trim: true
    // International Bank Account Number
  },
  
  // Bank Information
  bankName: {
    type: String,
    required: true,
    trim: true
  },
  bankBranch: {
    type: String,
    trim: true
  },
  bankCountry: {
    type: String,
    trim: true
  },
  
  // Account Type
  accountType: {
    type: String,
    enum: ['checking', 'savings', 'money_market', 'credit_card', 'line_of_credit', 'other'],
    required: true
  },
  
  // Currency
  currency: {
    type: String,
    default: 'USD',
    trim: true
  },
  
  // Accounting Integration
  chartOfAccountsEntry: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChartOfAccounts',
    required: true
    // Link to the corresponding asset account in chart of accounts
  },
  
  // Balance Information
  currentBalance: {
    type: Number,
    default: 0
    // Current balance in the account
  },
  lastBalanceUpdate: {
    type: Date
  },
  
  // Bank Statement Information
  lastStatementDate: {
    type: Date
  },
  lastStatementBalance: {
    type: Number,
    default: 0
  },
  
  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  isPrimary: {
    type: Boolean,
    default: false
    // Indicates if this is the primary operating account
  },
  
  // Reconciliation Settings
  reconciliationFrequency: {
    type: String,
    enum: ['daily', 'weekly', 'bi-weekly', 'monthly', 'quarterly', 'annually', 'manual'],
    default: 'monthly'
  },
  lastReconciliationDate: {
    type: Date
  },
  nextReconciliationDue: {
    type: Date
  },
  requiresReconciliation: {
    type: Boolean,
    default: true
  },
  
  // Transactions
  transactions: [BankTransactionSchema],
  
  // Reconciliations
  reconciliations: [BankReconciliationSchema],
  
  // Account Limits and Settings
  dailyWithdrawalLimit: {
    type: Number,
    default: 0
    // 0 = no limit
  },
  monthlyTransactionLimit: {
    type: Number,
    default: 0
    // 0 = no limit
  },
  minimumBalance: {
    type: Number,
    default: 0
  },
  
  // Interest and Fees
  interestRate: {
    type: Number,
    default: 0
    // Annual interest rate percentage
  },
  monthlyMaintenanceFee: {
    type: Number,
    default: 0
  },
  overdraftFee: {
    type: Number,
    default: 0
  },
  
  // Connection Settings
  isConnected: {
    type: Boolean,
    default: false
    // Whether connected to bank API for auto-sync
  },
  connectionType: {
    type: String,
    enum: ['manual', 'api', 'csv_import', 'ofx_import'],
    default: 'manual'
  },
  lastSyncDate: {
    type: Date
  },
  syncStatus: {
    type: String,
    enum: ['idle', 'syncing', 'success', 'failed'],
    default: 'idle'
  },
  
  // Metadata
  description: {
    type: String,
    trim: true
  },
  tags: [String],
  notes: {
    type: String,
    trim: true
  },
  
  // Audit Trail
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for performance (note: accountNumber has unique: true which creates an index automatically)
BankAccountSchema.index({ bankName: 1 });
BankAccountSchema.index({ isActive: 1 });
BankAccountSchema.index({ isPrimary: 1 });
BankAccountSchema.index({ chartOfAccountsEntry: 1 });
BankAccountSchema.index({ 'transactions.transactionDate': -1 });
BankAccountSchema.index({ 'transactions.isReconciled': 1 });
BankAccountSchema.index({ 'reconciliations.status': 1 });

// Virtual for masked account number
BankAccountSchema.virtual('displayAccountNumber').get(function() {
  if (this.accountNumberMasked) {
    return this.accountNumberMasked;
  }
  const lastFour = this.accountNumber.slice(-4);
  return `****${lastFour}`;
});

// Virtual for bank display name
BankAccountSchema.virtual('bankDisplay').get(function() {
  if (this.bankBranch) {
    return `${this.bankName} - ${this.bankBranch}`;
  }
  return this.bankName;
});

// Virtual for unreconciled balance
BankAccountSchema.virtual('unreconciledBalance').get(function() {
  const unreconciledTransactions = this.transactions.filter(t => !t.isReconciled);
  let balance = 0;
  unreconciledTransactions.forEach(t => {
    if (t.transactionType === 'deposit' || t.transactionType === 'interest') {
      balance += t.amount;
    } else {
      balance -= t.amount;
    }
  });
  return balance;
});

// Virtual for pending reconciliation transactions
BankAccountSchema.virtual('pendingReconciliationCount').get(function() {
  return this.transactions.filter(t => !t.isReconciled).length;
});

// Method to add transaction
BankAccountSchema.methods.addTransaction = async function(transactionData, userId) {
  const transaction = {
    ...transactionData,
    createdBy: userId
  };
  
  this.transactions.push(transaction);
  
  // Update current balance
  if (transactionData.transactionType === 'deposit' || transactionData.transactionType === 'interest') {
    this.currentBalance += transactionData.amount;
  } else {
    this.currentBalance -= transactionData.amount;
  }
  
  this.lastBalanceUpdate = new Date();
  await this.save();
  
  return transaction;
};

// Method to reconcile transaction
BankAccountSchema.methods.reconcileTransaction = async function(transactionId, reconciliationId) {
  const transaction = this.transactions.id(transactionId);
  
  if (!transaction) {
    throw new Error('Transaction not found');
  }
  
  transaction.isReconciled = true;
  transaction.reconciledDate = new Date();
  transaction.reconciliationId = reconciliationId;
  
  await this.save();
  return transaction;
};

// Method to create reconciliation
BankAccountSchema.methods.createReconciliation = async function(reconciliationData, userId) {
  const reconciliation = {
    ...reconciliationData,
    createdBy: userId,
    reconciliationDate: new Date()
  };
  
  // Calculate difference
  reconciliation.difference = reconciliation.statementBalance - reconciliation.bookBalance;
  
  this.reconciliations.push(reconciliation);
  this.lastReconciliationDate = new Date();
  
  // Calculate next reconciliation due date
  if (this.reconciliationFrequency !== 'manual') {
    const nextDate = new Date(this.lastReconciliationDate);
    switch (this.reconciliationFrequency) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'bi-weekly':
        nextDate.setDate(nextDate.getDate() + 14);
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'quarterly':
        nextDate.setMonth(nextDate.getMonth() + 3);
        break;
      case 'annually':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
    }
    this.nextReconciliationDue = nextDate;
  }
  
  await this.save();
  return reconciliation;
};

// Method to complete reconciliation
BankAccountSchema.methods.completeReconciliation = async function(reconciliationId, userId) {
  const reconciliation = this.reconciliations.id(reconciliationId);
  
  if (!reconciliation) {
    throw new Error('Reconciliation not found');
  }
  
  if (reconciliation.difference !== 0) {
    reconciliation.status = 'discrepancy';
    throw new Error('Cannot complete reconciliation with outstanding differences');
  }
  
  reconciliation.status = 'reconciled';
  reconciliation.reconciledBy = userId;
  
  // Mark all transactions in this period as reconciled
  const startDate = reconciliation.statementStartDate;
  const endDate = reconciliation.statementEndDate;
  
  this.transactions.forEach(transaction => {
    if (transaction.transactionDate >= startDate && 
        transaction.transactionDate <= endDate && 
        !transaction.isReconciled) {
      transaction.isReconciled = true;
      transaction.reconciledDate = new Date();
      transaction.reconciliationId = reconciliationId;
    }
  });
  
  this.lastStatementDate = reconciliation.statementEndDate;
  this.lastStatementBalance = reconciliation.statementBalance;
  
  await this.save();
  return reconciliation;
};

// Method to get transactions in date range
BankAccountSchema.methods.getTransactionsInRange = function(startDate, endDate) {
  return this.transactions.filter(t => 
    t.transactionDate >= startDate && t.transactionDate <= endDate
  );
};

// Method to get unreconciled transactions
BankAccountSchema.methods.getUnreconciledTransactions = function() {
  return this.transactions.filter(t => !t.isReconciled);
};

// Method to calculate balance at date
BankAccountSchema.methods.getBalanceAtDate = function(date) {
  let balance = 0;
  this.transactions.forEach(t => {
    if (t.transactionDate <= date) {
      if (t.transactionType === 'deposit' || t.transactionType === 'interest') {
        balance += t.amount;
      } else {
        balance -= t.amount;
      }
    }
  });
  return balance;
};

// Method to post transaction to general ledger
BankAccountSchema.methods.postTransactionToGeneralLedger = async function(transactionId, userId) {
  const transaction = this.transactions.id(transactionId);
  
  if (!transaction) {
    throw new Error('Transaction not found');
  }
  
  if (transaction.journalEntry) {
    throw new Error('Transaction already posted to general ledger');
  }
  
  const JournalEntry = mongoose.model('JournalEntry');
  
  // Create journal entry
  const lines = [];
  
  // Debit or Credit the bank account
  if (transaction.transactionType === 'deposit' || transaction.transactionType === 'interest') {
    lines.push({
      account: this.chartOfAccountsEntry,
      description: transaction.description,
      debit: transaction.amount,
      credit: 0,
      lineNumber: 1
    });
  } else {
    lines.push({
      account: this.chartOfAccountsEntry,
      description: transaction.description,
      debit: 0,
      credit: transaction.amount,
      lineNumber: 1
    });
  }
  
  // The offsetting entry would need to be determined based on transaction type
  // This is a placeholder - actual implementation depends on business logic
  
  const journalEntry = new JournalEntry({
    entryNumber: await JournalEntry.generateEntryNumber(),
    entryDate: transaction.transactionDate,
    entryType: 'bank',
    description: `Bank Transaction: ${transaction.description}`,
    reference: transaction.reference || transaction._id.toString(),
    lines: lines,
    sourceDocument: {
      type: 'bank_transaction',
      id: transaction._id
    },
    fiscalPeriod: JournalEntry.calculateFiscalPeriod(transaction.transactionDate),
    createdBy: userId,
    status: 'draft'
  });
  
  journalEntry.calculateTotals();
  await journalEntry.save();
  
  transaction.journalEntry = journalEntry._id;
  await this.save();
  
  return journalEntry;
};

// Static method to get primary account
BankAccountSchema.statics.getPrimaryAccount = function() {
  return this.findOne({ isPrimary: true, isActive: true });
};

// Static method to get active accounts
BankAccountSchema.statics.getActiveAccounts = function() {
  return this.find({ isActive: true }).sort({ isPrimary: -1, accountName: 1 });
};

// Static method to get accounts by bank
BankAccountSchema.statics.getAccountsByBank = function(bankName) {
  return this.find({ bankName, isActive: true }).sort({ accountName: 1 });
};

// Static method to get accounts needing reconciliation
BankAccountSchema.statics.getAccountsNeedingReconciliation = function() {
  const now = new Date();
  return this.find({
    isActive: true,
    requiresReconciliation: true,
    nextReconciliationDue: { $lte: now }
  });
};

// Pre-save middleware
BankAccountSchema.pre('save', async function(next) {
  // Mask account number if not already masked
  if (this.isModified('accountNumber') && !this.accountNumberMasked) {
    const lastFour = this.accountNumber.slice(-4);
    this.accountNumberMasked = `****${lastFour}`;
  }
  
  // Validate that at least one international identifier is provided for international accounts
  if (this.bankCountry && this.bankCountry !== 'US') {
    if (!this.swiftCode && !this.ibanCode) {
      return next(new Error('International accounts must have either SWIFT code or IBAN'));
    }
  }
  
  next();
});

// Ensure virtual fields are serialized
BankAccountSchema.set('toJSON', { virtuals: true });
BankAccountSchema.set('toObject', { virtuals: true });

const BankAccount = mongoose.model("BankAccount", BankAccountSchema);
module.exports = BankAccount;

