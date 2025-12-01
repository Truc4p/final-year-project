const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const JournalEntryLineSchema = new Schema({
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChartOfAccounts',
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  debit: {
    type: Number,
    default: 0,
    min: 0
  },
  credit: {
    type: Number,
    default: 0,
    min: 0
  },
  lineNumber: {
    type: Number,
    required: true
  }
}, { _id: true });

const JournalEntrySchema = new Schema({
  entryNumber: {
    type: String,
    required: true,
    unique: true,
    // Format: JE-YYYYMMDD-XXXX
    trim: true
  },
  entryDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  entryType: {
    type: String,
    enum: [
      'general', // Manual journal entries
      'sales', // From sales/invoices
      'purchase', // From purchases/bills
      'payment', // From payments
      'receipt', // From receipts
      'payroll', // From payroll
      'depreciation', // From depreciation calculations
      'adjustment', // Period-end adjustments
      'opening_balance', // Opening balances
      'closing' // Period closing entries
    ],
    default: 'general',
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  reference: {
    type: String,
    trim: true
    // External reference (invoice #, order #, etc.)
  },
  lines: [JournalEntryLineSchema],
  totalDebit: {
    type: Number,
    default: 0,
    min: 0
  },
  totalCredit: {
    type: Number,
    default: 0,
    min: 0
  },
  isBalanced: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['draft', 'posted', 'reversed', 'void'],
    default: 'draft'
  },
  postedDate: {
    type: Date
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reversedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JournalEntry'
    // Reference to the reversing entry
  },
  reversingEntry: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JournalEntry'
    // Reference to the entry this reverses
  },
  fiscalPeriod: {
    year: { type: Number, required: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    quarter: { type: Number, required: true, min: 1, max: 4 }
  },
  // Source document tracking
  sourceDocument: {
    type: {
      type: String,
      enum: ['order', 'invoice', 'bill', 'expense', 'cashflow_transaction', 'manual', 'other']
    },
    id: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'sourceDocument.type'
    }
  },
  attachments: [{
    fileName: String,
    fileUrl: String,
    uploadDate: { type: Date, default: Date.now }
  }],
  notes: {
    type: String,
    trim: true
  },
  tags: [String],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvalDate: {
    type: Date
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringSchedule: {
    frequency: {
      type: String,
      enum: ['monthly', 'quarterly', 'yearly']
    },
    nextDate: Date,
    endDate: Date
  }
}, {
  timestamps: true
});

// Indexes for performance
JournalEntrySchema.index({ entryNumber: 1 });
JournalEntrySchema.index({ entryDate: -1 });
JournalEntrySchema.index({ status: 1, entryDate: -1 });
JournalEntrySchema.index({ entryType: 1, entryDate: -1 });
JournalEntrySchema.index({ 'fiscalPeriod.year': 1, 'fiscalPeriod.month': 1 });
JournalEntrySchema.index({ 'sourceDocument.type': 1, 'sourceDocument.id': 1 });
JournalEntrySchema.index({ 'lines.account': 1 });

// Virtual for entry display
JournalEntrySchema.virtual('displayName').get(function() {
  return `${this.entryNumber} - ${this.description}`;
});

// Method to calculate totals
JournalEntrySchema.methods.calculateTotals = function() {
  this.totalDebit = this.lines.reduce((sum, line) => sum + (line.debit || 0), 0);
  this.totalCredit = this.lines.reduce((sum, line) => sum + (line.credit || 0), 0);
  this.isBalanced = Math.abs(this.totalDebit - this.totalCredit) < 0.01; // Account for floating point
  return this.isBalanced;
};

// Method to post journal entry
JournalEntrySchema.methods.post = async function(userId) {
  if (this.status !== 'draft') {
    throw new Error('Only draft entries can be posted');
  }
  
  if (!this.isBalanced) {
    throw new Error('Cannot post unbalanced journal entry');
  }
  
  this.status = 'posted';
  this.postedDate = new Date();
  this.postedBy = userId;
  
  await this.save();
  
  // Update general ledger
  await this.updateGeneralLedger();
  
  return this;
};

// Method to reverse journal entry
JournalEntrySchema.methods.reverse = async function(userId, reverseDate = new Date(), description = null) {
  if (this.status !== 'posted') {
    throw new Error('Only posted entries can be reversed');
  }
  
  // Create reversing entry
  const reversingLines = this.lines.map((line, index) => ({
    account: line.account,
    description: line.description || 'Reversal entry',
    debit: line.credit, // Swap debit and credit
    credit: line.debit,
    lineNumber: index + 1
  }));
  
  const reversingEntry = new this.constructor({
    entryNumber: await this.constructor.generateEntryNumber(),
    entryDate: reverseDate,
    entryType: this.entryType,
    description: description || `Reversal of ${this.entryNumber}`,
    reference: this.reference,
    lines: reversingLines,
    reversingEntry: this._id,
    fiscalPeriod: this.constructor.calculateFiscalPeriod(reverseDate),
    createdBy: userId,
    status: 'draft'
  });
  
  reversingEntry.calculateTotals();
  await reversingEntry.save();
  await reversingEntry.post(userId);
  
  // Update original entry
  this.status = 'reversed';
  this.reversedBy = reversingEntry._id;
  await this.save();
  
  return reversingEntry;
};

// Method to update general ledger (will be called after posting)
JournalEntrySchema.methods.updateGeneralLedger = async function() {
  const GeneralLedger = mongoose.model('GeneralLedger');
  const ChartOfAccounts = mongoose.model('ChartOfAccounts');
  
  for (const line of this.lines) {
    // Create general ledger entry
    await GeneralLedger.create({
      account: line.account,
      journalEntry: this._id,
      entryDate: this.entryDate,
      description: line.description || this.description,
      debit: line.debit,
      credit: line.credit,
      fiscalPeriod: this.fiscalPeriod
    });
    
    // Update account balance
    const account = await ChartOfAccounts.findById(line.account);
    if (account) {
      if (account.normalBalance === 'debit') {
        account.currentBalance += (line.debit - line.credit);
      } else {
        account.currentBalance += (line.credit - line.debit);
      }
      await account.save();
    }
  }
};

// Static method to generate entry number
JournalEntrySchema.statics.generateEntryNumber = async function() {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
  
  // Find the last entry for today
  const lastEntry = await this.findOne({
    entryNumber: new RegExp(`^JE-${dateStr}-`)
  }).sort({ entryNumber: -1 });
  
  let sequence = 1;
  if (lastEntry) {
    const lastSeq = parseInt(lastEntry.entryNumber.split('-')[2]);
    sequence = lastSeq + 1;
  }
  
  return `JE-${dateStr}-${sequence.toString().padStart(4, '0')}`;
};

// Static method to calculate fiscal period
JournalEntrySchema.statics.calculateFiscalPeriod = function(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const quarter = Math.ceil(month / 3);
  
  return { year, month, quarter };
};

// Pre-save validation
JournalEntrySchema.pre('save', function(next) {
  // Calculate totals
  this.calculateTotals();
  
  // Validate balanced entry if not draft
  if (this.status !== 'draft' && !this.isBalanced) {
    return next(new Error('Journal entry must be balanced (debits must equal credits)'));
  }
  
  // Validate at least 2 lines
  if (this.lines.length < 2) {
    return next(new Error('Journal entry must have at least 2 lines'));
  }
  
  // Validate each line has either debit or credit (not both)
  for (const line of this.lines) {
    if (line.debit > 0 && line.credit > 0) {
      return next(new Error('A line cannot have both debit and credit amounts'));
    }
    if (line.debit === 0 && line.credit === 0) {
      return next(new Error('A line must have either a debit or credit amount'));
    }
  }
  
  // Set fiscal period if not set
  if (!this.fiscalPeriod || !this.fiscalPeriod.year) {
    this.fiscalPeriod = this.constructor.calculateFiscalPeriod(this.entryDate);
  }
  
  next();
});

// Ensure virtual fields are serialized
JournalEntrySchema.set('toJSON', { virtuals: true });
JournalEntrySchema.set('toObject', { virtuals: true });

const JournalEntry = mongoose.model("JournalEntry", JournalEntrySchema);
module.exports = JournalEntry;
