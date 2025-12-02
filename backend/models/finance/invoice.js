const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const InvoiceLineItemSchema = new Schema({
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
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
    // Percentage discount
  },
  taxRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
    // Tax rate percentage
  },
  revenueAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChartOfAccounts',
    required: true
  },
  // Calculated fields
  subtotal: {
    type: Number,
    default: 0
    // quantity * unitPrice
  },
  discountAmount: {
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
    // (subtotal - discountAmount) + taxAmount
  }
}, { _id: true });

const InvoicePaymentSchema = new Schema({
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
    enum: ['cash', 'check', 'bank_transfer', 'credit_card', 'online_payment', 'other'],
    default: 'bank_transfer'
  },
  reference: {
    type: String,
    trim: true
    // Check number, transaction ID, etc.
  },
  bankAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChartOfAccounts'
    // Bank account where payment was received
  },
  journalEntry: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JournalEntry'
    // Link to the payment journal entry
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

const InvoiceSchema = new Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    // Format: INV-YYYYMMDD-XXXX
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  invoiceDate: {
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
  lineItems: [InvoiceLineItemSchema],
  
  // Financial totals
  subtotal: {
    type: Number,
    required: true,
    default: 0
  },
  totalDiscount: {
    type: Number,
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
    // Any manual adjustments
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
    // totalAmount - amountPaid
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['draft', 'sent', 'viewed', 'partial', 'paid', 'overdue', 'cancelled', 'void'],
    default: 'draft'
  },
  
  // Payments
  payments: [InvoicePaymentSchema],
  
  // Accounting integration
  accountsReceivableAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChartOfAccounts',
    required: true
  },
  journalEntry: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JournalEntry'
    // Link to the invoice journal entry (when posted)
  },
  isPosted: {
    type: Boolean,
    default: false
    // Whether journal entry has been created
  },
  postedDate: {
    type: Date
  },
  
  // Reference fields
  purchaseOrder: {
    type: String,
    trim: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
    // Link to e-commerce order if applicable
  },
  
  // Additional details
  notes: {
    type: String,
    trim: true
    // Internal notes
  },
  terms: {
    type: String,
    trim: true
    // Terms and conditions shown on invoice
  },
  memo: {
    type: String,
    trim: true
    // Message to customer
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
  
  // Tracking
  sentDate: {
    type: Date
  },
  viewedDate: {
    type: Date
  },
  lastReminderDate: {
    type: Date
  },
  reminderCount: {
    type: Number,
    default: 0
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

// Indexes for performance
InvoiceSchema.index({ invoiceNumber: 1 });
InvoiceSchema.index({ customer: 1, invoiceDate: -1 });
InvoiceSchema.index({ status: 1, dueDate: 1 });
InvoiceSchema.index({ invoiceDate: -1 });
InvoiceSchema.index({ dueDate: 1, status: 1 });
InvoiceSchema.index({ order: 1 });

// Virtual for days overdue
InvoiceSchema.virtual('daysOverdue').get(function() {
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
InvoiceSchema.virtual('agingBucket').get(function() {
  const days = this.daysOverdue;
  if (days <= 0) return 'current';
  if (days <= 30) return '1-30';
  if (days <= 60) return '31-60';
  if (days <= 90) return '61-90';
  return '90+';
});

// Method to calculate line item totals
InvoiceLineItemSchema.methods.calculateTotals = function() {
  this.subtotal = this.quantity * this.unitPrice;
  this.discountAmount = (this.subtotal * this.discount) / 100;
  const afterDiscount = this.subtotal - this.discountAmount;
  this.taxAmount = (afterDiscount * this.taxRate) / 100;
  this.total = afterDiscount + this.taxAmount;
};

// Method to calculate invoice totals
InvoiceSchema.methods.calculateTotals = function() {
  // Calculate line item totals
  this.lineItems.forEach(item => {
    item.subtotal = item.quantity * item.unitPrice;
    item.discountAmount = (item.subtotal * item.discount) / 100;
    const afterDiscount = item.subtotal - item.discountAmount;
    item.taxAmount = (afterDiscount * item.taxRate) / 100;
    item.total = afterDiscount + item.taxAmount;
  });
  
  // Sum up totals
  this.subtotal = this.lineItems.reduce((sum, item) => sum + item.subtotal, 0);
  this.totalDiscount = this.lineItems.reduce((sum, item) => sum + item.discountAmount, 0);
  this.totalTax = this.lineItems.reduce((sum, item) => sum + item.taxAmount, 0);
  
  this.totalAmount = this.subtotal - this.totalDiscount + this.totalTax + this.shippingCost + this.adjustments;
  this.amountDue = this.totalAmount - this.amountPaid;
};

// Method to add payment
InvoiceSchema.methods.addPayment = async function(paymentData, userId) {
  const payment = {
    ...paymentData,
    createdBy: userId
  };
  
  this.payments.push(payment);
  this.amountPaid += payment.amount;
  this.amountDue = this.totalAmount - this.amountPaid;
  
  // Update status based on payment
  if (this.amountDue <= 0) {
    this.status = 'paid';
  } else if (this.amountPaid > 0) {
    this.status = 'partial';
  }
  
  await this.save();
};

// Method to create journal entry for invoice
InvoiceSchema.methods.postToGeneralLedger = async function(userId) {
  if (this.isPosted) {
    throw new Error('Invoice already posted to general ledger');
  }
  
  const JournalEntry = mongoose.model('JournalEntry');
  
  // Create journal entry lines
  const lines = [];
  let lineNumber = 1;
  
  // Debit: Accounts Receivable (increase asset)
  lines.push({
    account: this.accountsReceivableAccount,
    description: `Invoice ${this.invoiceNumber}`,
    debit: this.totalAmount,
    credit: 0,
    lineNumber: lineNumber++
  });
  
  // Credit: Revenue accounts (increase revenue)
  const revenueByAccount = new Map();
  this.lineItems.forEach(item => {
    const accountId = item.revenueAccount.toString();
    const current = revenueByAccount.get(accountId) || 0;
    revenueByAccount.set(accountId, current + (item.subtotal - item.discountAmount));
  });
  
  for (const [accountId, amount] of revenueByAccount.entries()) {
    lines.push({
      account: accountId,
      description: `Revenue from Invoice ${this.invoiceNumber}`,
      debit: 0,
      credit: amount,
      lineNumber: lineNumber++
    });
  }
  
  // Credit: Tax liability account if tax exists
  if (this.totalTax > 0) {
    // Find tax liability account
    const ChartOfAccounts = mongoose.model('ChartOfAccounts');
    const taxAccount = await ChartOfAccounts.findOne({ 
      accountCode: '2100',
      accountName: /tax.*payable/i 
    });
    
    if (taxAccount) {
      lines.push({
        account: taxAccount._id,
        description: `Sales tax on Invoice ${this.invoiceNumber}`,
        debit: 0,
        credit: this.totalTax,
        lineNumber: lineNumber++
      });
    }
  }
  
  // Create journal entry
  const journalEntry = new JournalEntry({
    entryNumber: await JournalEntry.generateEntryNumber(),
    entryDate: this.invoiceDate,
    entryType: 'sales',
    description: `Customer Invoice ${this.invoiceNumber}`,
    reference: this.invoiceNumber,
    lines: lines,
    sourceDocument: {
      type: 'invoice',
      id: this._id
    },
    fiscalPeriod: JournalEntry.calculateFiscalPeriod(this.invoiceDate),
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

// Static method to generate invoice number
InvoiceSchema.statics.generateInvoiceNumber = async function() {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  
  const count = await this.countDocuments({
    invoiceNumber: new RegExp(`^INV-${dateStr}`)
  });
  
  const sequence = String(count + 1).padStart(4, '0');
  return `INV-${dateStr}-${sequence}`;
};

// Ensure required generated fields before validation
InvoiceSchema.pre('validate', async function(next) {
  try {
    if (this.isNew && !this.invoiceNumber) {
      this.invoiceNumber = await this.constructor.generateInvoiceNumber();
    }
    next();
  } catch (err) {
    next(err);
  }
});

// Pre-save middleware
InvoiceSchema.pre('save', async function(next) {
  // Calculate totals
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
InvoiceSchema.set('toJSON', { virtuals: true });
InvoiceSchema.set('toObject', { virtuals: true });

const Invoice = mongoose.model("Invoice", InvoiceSchema);
module.exports = Invoice;
