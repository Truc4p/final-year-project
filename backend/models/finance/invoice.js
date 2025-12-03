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
  },
  taxRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
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

const InvoiceSchema = new Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
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
  
  // Totals
  subtotal: { type: Number, required: true, default: 0 },
  totalDiscount: { type: Number, default: 0 },
  totalTax: { type: Number, default: 0 },
  shippingCost: { type: Number, default: 0, min: 0 },
  adjustments: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true, default: 0 },
  amountPaid: { type: Number, default: 0, min: 0 },
  amountDue: { type: Number, default: 0 },
  
  // Status
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
  },
  isPosted: { type: Boolean, default: false },
  postedDate: { type: Date },
  
  // References
  purchaseOrder: { type: String, trim: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  
  // Additional
  notes: { type: String, trim: true },
  terms: { type: String, trim: true },
  memo: { type: String, trim: true },
  
  currency: { type: String, default: 'USD', trim: true },
  tags: [String],
  attachments: [{ fileName: String, fileUrl: String, uploadDate: { type: Date, default: Date.now } }],
  
  // Tracking
  sentDate: { type: Date },
  viewedDate: { type: Date },
  lastReminderDate: { type: Date },
  reminderCount: { type: Number, default: 0 },
  
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Indexes (note: invoiceNumber has unique: true which creates an index automatically)
InvoiceSchema.index({ customer: 1, invoiceDate: -1 });
InvoiceSchema.index({ status: 1, dueDate: 1 });
InvoiceSchema.index({ invoiceDate: -1 });
InvoiceSchema.index({ dueDate: 1, status: 1 });
InvoiceSchema.index({ order: 1 });

// Virtuals
InvoiceSchema.virtual('daysOverdue').get(function() {
  if (this.status === 'paid' || this.status === 'cancelled' || this.status === 'void') return 0;
  const today = new Date();
  const due = new Date(this.dueDate);
  return today > due ? Math.floor((today - due) / (1000 * 60 * 60 * 24)) : 0;
});

InvoiceSchema.virtual('agingBucket').get(function() {
  const days = this.daysOverdue;
  if (days <= 0) return 'current';
  if (days <= 30) return '1-30';
  if (days <= 60) return '31-60';
  if (days <= 90) return '61-90';
  return '90+';
});

// Calculate line item totals
InvoiceLineItemSchema.methods.calculateTotals = function() {
  this.subtotal = this.quantity * this.unitPrice;
  this.discountAmount = (this.subtotal * this.discount) / 100;
  const afterDiscount = this.subtotal - this.discountAmount;
  this.taxAmount = (afterDiscount * this.taxRate) / 100;
  this.total = afterDiscount + this.taxAmount;
};

// Calculate invoice totals
InvoiceSchema.methods.calculateTotals = function() {
  this.lineItems.forEach(item => {
    item.subtotal = item.quantity * item.unitPrice;
    item.discountAmount = (item.subtotal * item.discount) / 100;
    const afterDiscount = item.subtotal - item.discountAmount;
    item.taxAmount = (afterDiscount * item.taxRate) / 100;
    item.total = afterDiscount + item.taxAmount;
  });
  
  this.subtotal = this.lineItems.reduce((sum, i) => sum + i.subtotal, 0);
  this.totalDiscount = this.lineItems.reduce((sum, i) => sum + i.discountAmount, 0);
  this.totalTax = this.lineItems.reduce((sum, i) => sum + i.taxAmount, 0);
  this.totalAmount = this.subtotal - this.totalDiscount + this.totalTax + this.shippingCost + this.adjustments;
  this.amountDue = this.totalAmount - this.amountPaid;
};

// Add payment
InvoiceSchema.methods.addPayment = async function(paymentData, userId) {
  const payment = { ...paymentData, createdBy: userId };
  this.payments.push(payment);
  this.amountPaid += payment.amount;
  this.amountDue = this.totalAmount - this.amountPaid;
  if (this.amountDue <= 0) this.status = 'paid';
  else if (this.amountPaid > 0) this.status = 'partial';
  await this.save();
};

// Post to GL
InvoiceSchema.methods.postToGeneralLedger = async function(userId) {
  if (this.isPosted) throw new Error('Invoice already posted to general ledger');
  const JournalEntry = mongoose.model('JournalEntry');
  const ChartOfAccounts = mongoose.model('ChartOfAccounts');
  
  const lines = [];
  let lineNumber = 1;
  
  // Debit AR
  lines.push({
    account: this.accountsReceivableAccount,
    description: `Invoice ${this.invoiceNumber}`,
    debit: this.totalAmount,
    credit: 0,
    lineNumber: lineNumber++
  });
  
  // Credit revenue per account
  const revenueByAccount = new Map();
  const normalizeAccountId = (val) => (val && val._id) ? val._id : val;
  this.lineItems.forEach(item => {
    const accountId = normalizeAccountId(item.revenueAccount);
    if (!accountId) return;
    const current = revenueByAccount.get(String(accountId)) || 0;
    revenueByAccount.set(String(accountId), current + (item.subtotal - item.discountAmount));
  });
  for (const [accountId, amount] of revenueByAccount.entries()) {
    lines.push({ account: accountId, description: `Revenue from Invoice ${this.invoiceNumber}`, debit: 0, credit: amount, lineNumber: lineNumber++ });
  }
  
  // Shipping revenue
  if (this.shippingCost > 0) {
    const shipAccount = await ChartOfAccounts.findOne({ accountCode: '4200' });
    if (shipAccount) lines.push({ account: shipAccount._id, description: `Shipping on Invoice ${this.invoiceNumber}`, debit: 0, credit: this.shippingCost, lineNumber: lineNumber++ });
  }

  // Tax liability
  if (this.totalTax > 0) {
    const taxAccount = await ChartOfAccounts.findOne({ accountCode: '2100' });
    if (taxAccount) lines.push({ account: taxAccount._id, description: `Sales tax on Invoice ${this.invoiceNumber}`, debit: 0, credit: this.totalTax, lineNumber: lineNumber++ });
  }

  // Adjustments: + -> other income 4900, - -> misc expense 9100
  if (this.adjustments && this.adjustments !== 0) {
    if (this.adjustments > 0) {
      const otherIncome = await ChartOfAccounts.findOne({ accountCode: '4900' });
      if (otherIncome) lines.push({ account: otherIncome._id, description: `Adjustments on Invoice ${this.invoiceNumber}`, debit: 0, credit: this.adjustments, lineNumber: lineNumber++ });
    } else {
      const miscExpense = await ChartOfAccounts.findOne({ accountCode: '9100' });
      if (miscExpense) lines.push({ account: miscExpense._id, description: `Adjustments on Invoice ${this.invoiceNumber}`, debit: Math.abs(this.adjustments), credit: 0, lineNumber: lineNumber++ });
    }
  }

  const journalEntry = new JournalEntry({
    entryNumber: await JournalEntry.generateEntryNumber(),
    entryDate: this.invoiceDate,
    entryType: 'sales',
    description: `Customer Invoice ${this.invoiceNumber}`,
    reference: this.invoiceNumber,
    lines,
    sourceDocument: { type: 'invoice', id: this._id },
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

// Robust invoice number generator
InvoiceSchema.statics.generateInvoiceNumber = async function() {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = `INV-${dateStr}-`;

  const last = await this.findOne({ invoiceNumber: new RegExp(`^${prefix}\\d{4}$`) })
    .sort({ invoiceNumber: -1 })
    .select('invoiceNumber')
    .lean();

  let nextSeq = 1;
  if (last && last.invoiceNumber) {
    const parts = last.invoiceNumber.split('-');
    const lastSeq = parseInt(parts[2], 10);
    if (!isNaN(lastSeq)) nextSeq = lastSeq + 1;
  }

  return `${prefix}${String(nextSeq).padStart(4, '0')}`;
};

// Pre-validate to ensure number exists
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

// Pre-save totals and overdue status
InvoiceSchema.pre('save', async function(next) {
  this.calculateTotals();
  if (this.status !== 'paid' && this.status !== 'cancelled' && this.status !== 'void') {
    const today = new Date();
    if (today > this.dueDate && this.amountDue > 0) this.status = 'overdue';
  }
  next();
});

InvoiceSchema.set('toJSON', { virtuals: true });
InvoiceSchema.set('toObject', { virtuals: true });

const Invoice = mongoose.model("Invoice", InvoiceSchema);
module.exports = Invoice;
