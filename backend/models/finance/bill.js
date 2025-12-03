const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BillLineItemSchema = new Schema({
  lineNumber: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 1
  },
  unitCost: {
    type: Number,
    required: true,
    min: 0
  },
  taxRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  expenseAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChartOfAccounts',
    required: true
  },
  // Calculated fields
  subtotal: {
    type: Number,
    default: 0
  },
  taxAmount: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    default: 0
  }
}, { _id: true });

const BillPaymentSchema = new Schema({
  paymentDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'check', 'bank_transfer', 'credit_card', 'ach', 'wire', 'other'],
    default: 'bank_transfer'
  },
  reference: {
    type: String,
    trim: true
  },
  bankAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChartOfAccounts'
  },
  journalEntry: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JournalEntry'
  },
  notes: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { _id: true, timestamps: true });

const BillSchema = new Schema({
  billNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    // Format: BILL-YYYYMMDD-XXXX
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  vendorInvoiceNumber: {
    type: String,
    trim: true
    // Vendor's invoice/bill number
  },
  billDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: true
  },
  paymentTerms: {
    type: String,
    enum: ['immediate', 'net_15', 'net_30', 'net_45', 'net_60', 'net_90', 'custom'],
    default: 'net_30'
  },
  customPaymentDays: {
    type: Number,
    min: 0
  },
  // Line items
  lineItems: [BillLineItemSchema],
  
  // Financial totals
  subtotal: {
    type: Number,
    required: true,
    default: 0
  },
  totalTax: {
    type: Number,
    default: 0
  },
  shippingCost: {
    type: Number,
    default: 0,
    min: 0
  },
  adjustments: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    default: 0
  },
  amountPaid: {
    type: Number,
    default: 0,
    min: 0
  },
  amountDue: {
    type: Number,
    default: 0
  },
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'pending_approval', 'approved', 'partial', 'paid', 'overdue', 'cancelled', 'void'],
    default: 'draft'
  },
  
  // Payments
  payments: [BillPaymentSchema],
  
  // Accounting integration
  accountsPayableAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChartOfAccounts',
    required: true
  },
  journalEntry: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JournalEntry'
  },
  isPosted: {
    type: Boolean,
    default: false
  },
  postedDate: {
    type: Date
  },
  
  // Reference fields
  purchaseOrder: {
    type: String,
    trim: true
  },
  
  // Additional details
  notes: {
    type: String,
    trim: true
  },
  memo: {
    type: String,
    trim: true
  },
  
  // Metadata
  currency: {
    type: String,
    default: 'USD',
    trim: true
  },
  tags: [String],
  attachments: [{
    fileName: String,
    fileUrl: String,
    uploadDate: { type: Date, default: Date.now }
  }],
  
  // Approval workflow
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvalDate: {
    type: Date
  },
  
  // Tracking
  lastReminderDate: {
    type: Date
  },
  
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

// Indexes (note: billNumber has unique: true which creates an index automatically)
BillSchema.index({ vendor: 1, billDate: -1 });
BillSchema.index({ status: 1, dueDate: 1 });
BillSchema.index({ billDate: -1 });
BillSchema.index({ dueDate: 1, status: 1 });
BillSchema.index({ vendorInvoiceNumber: 1 });

// Virtual for days overdue
BillSchema.virtual('daysOverdue').get(function() {
  if (this.status === 'paid' || this.status === 'cancelled' || this.status === 'void') {
    return 0;
  }
  const today = new Date();
  const due = new Date(this.dueDate);
  if (today > due) {
    return Math.floor((today - due) / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// Virtual for aging bucket
BillSchema.virtual('agingBucket').get(function() {
  const days = this.daysOverdue;
  if (days <= 0) return 'current';
  if (days <= 30) return '1-30';
  if (days <= 60) return '31-60';
  if (days <= 90) return '61-90';
  return '90+';
});

// Method to calculate line item totals
BillLineItemSchema.methods.calculateTotals = function() {
  this.subtotal = this.quantity * this.unitCost;
  this.taxAmount = (this.subtotal * this.taxRate) / 100;
  this.total = this.subtotal + this.taxAmount;
};

// Method to calculate bill totals
BillSchema.methods.calculateTotals = function() {
  // Calculate line item totals
  this.lineItems.forEach(item => {
    item.subtotal = item.quantity * item.unitCost;
    item.taxAmount = (item.subtotal * item.taxRate) / 100;
    item.total = item.subtotal + item.taxAmount;
  });
  
  // Sum up totals
  this.subtotal = this.lineItems.reduce((sum, item) => sum + item.subtotal, 0);
  this.totalTax = this.lineItems.reduce((sum, item) => sum + item.taxAmount, 0);
  
  this.totalAmount = this.subtotal + this.totalTax + this.shippingCost + this.adjustments;
  this.amountDue = this.totalAmount - this.amountPaid;
};

// Method to add payment
BillSchema.methods.addPayment = async function(paymentData, userId) {
  const payment = {
    ...paymentData,
    createdBy: userId
  };
  
  this.payments.push(payment);
  this.amountPaid += payment.amount;
  this.amountDue = this.totalAmount - this.amountPaid;
  
  // Update status
  if (this.amountDue <= 0) {
    this.status = 'paid';
  } else if (this.amountPaid > 0) {
    this.status = 'partial';
  }
  
  await this.save();
};

// Method to create journal entry for bill
BillSchema.methods.postToGeneralLedger = async function(userId) {
  if (this.isPosted) {
    throw new Error('Bill already posted to general ledger');
  }
  
  const JournalEntry = mongoose.model('JournalEntry');
  
  const lines = [];
  let lineNumber = 1;
  
  // Debit: Expense accounts (increase expense)
  const expenseByAccount = new Map();
  const normalizeAccountId = (val) => {
    if (!val) return null;
    // If populated document
    if (val._id) return val._id;
    return val; // assume ObjectId or string 24-hex
  };
  this.lineItems.forEach(item => {
    const accountId = normalizeAccountId(item.expenseAccount);
    if (!accountId) return;
    const current = expenseByAccount.get(String(accountId)) || 0;
    expenseByAccount.set(String(accountId), current + item.subtotal);
  });
  
  for (const [accountId, amount] of expenseByAccount.entries()) {
    lines.push({
      account: accountId, // Mongoose will cast 24-hex string/ObjectId
      description: `Expense from Bill ${this.billNumber}`,
      debit: amount,
      credit: 0,
      lineNumber: lineNumber++
    });
  }
  
  // Debit: Tax asset account if tax exists
  if (this.totalTax > 0) {
    const ChartOfAccounts = mongoose.model('ChartOfAccounts');
    const taxAccount = await ChartOfAccounts.findOne({ 
      accountCode: '1400',
      accountName: /tax.*receivable/i 
    });
    
    if (taxAccount) {
      lines.push({
        account: taxAccount._id,
        description: `Purchase tax on Bill ${this.billNumber}`,
        debit: this.totalTax,
        credit: 0,
        lineNumber: lineNumber++
      });
    }
  }
  
  // Credit: Accounts Payable (increase liability)
  lines.push({
    account: this.accountsPayableAccount,
    description: `Bill ${this.billNumber}`,
    debit: 0,
    credit: this.totalAmount,
    lineNumber: lineNumber++
  });
  
  const journalEntry = new JournalEntry({
    entryNumber: await JournalEntry.generateEntryNumber(),
    entryDate: this.billDate,
    entryType: 'purchase',
    description: `Vendor Bill ${this.billNumber}`,
    reference: this.billNumber,
    lines: lines,
    sourceDocument: {
      type: 'bill',
      id: this._id
    },
    fiscalPeriod: JournalEntry.calculateFiscalPeriod(this.billDate),
    createdBy: userId,
    status: 'draft'
  });
  
  journalEntry.calculateTotals();
  await journalEntry.save();
  await journalEntry.post(userId);
  
  this.journalEntry = journalEntry._id;
  this.isPosted = true;
  this.postedDate = new Date();
  await this.save();
  
  return journalEntry;
};

// Static method to generate bill number
BillSchema.statics.generateBillNumber = async function() {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  
  const count = await this.countDocuments({
    billNumber: new RegExp(`^BILL-${dateStr}`)
  });
  
  const sequence = String(count + 1).padStart(4, '0');
  return `BILL-${dateStr}-${sequence}`;
};

// Ensure required generated fields before validation
BillSchema.pre('validate', async function(next) {
  try {
    if (this.isNew && !this.billNumber) {
      this.billNumber = await this.constructor.generateBillNumber();
    }
    next();
  } catch (err) {
    next(err);
  }
});

// Pre-save middleware
BillSchema.pre('save', async function(next) {
  this.calculateTotals();
  
  // Update status based on due date
  if (this.status !== 'paid' && this.status !== 'cancelled' && this.status !== 'void') {
    const today = new Date();
    if (today > this.dueDate && this.amountDue > 0) {
      this.status = 'overdue';
    }
  }
  
  next();
});

// Ensure virtual fields are serialized
BillSchema.set('toJSON', { virtuals: true });
BillSchema.set('toObject', { virtuals: true });

const Bill = mongoose.model("Bill", BillSchema);
module.exports = Bill;
