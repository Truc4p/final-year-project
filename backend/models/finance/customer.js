const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CustomerSchema = new Schema({
  customerNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    // Format: CUST-XXXXX
  },
  companyName: {
    type: String,
    trim: true
  },
  contactPerson: {
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    email: { 
      type: String, 
      required: true,
      lowercase: true,
      trim: true 
    },
    phone: { type: String, trim: true },
    mobile: { type: String, trim: true }
  },
  billingAddress: {
    street: { type: String, trim: true },
    street2: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    zipCode: { type: String, trim: true },
    country: { type: String, default: 'Vietnam', trim: true }
  },
  shippingAddress: {
    street: { type: String, trim: true },
    street2: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    zipCode: { type: String, trim: true },
    country: { type: String, default: 'Vietnam', trim: true },
    sameAsBilling: { type: Boolean, default: true }
  },
  paymentTerms: {
    type: String,
    enum: ['immediate', 'net_15', 'net_30', 'net_45', 'net_60', 'net_90', 'custom'],
    default: 'net_30'
  },
  customPaymentDays: {
    type: Number,
    min: 0,
    // Used when paymentTerms is 'custom'
  },
  creditLimit: {
    type: Number,
    default: 0,
    min: 0
  },
  currentBalance: {
    type: Number,
    default: 0,
    // Outstanding amount owed by customer
  },
  taxExempt: {
    type: Boolean,
    default: false
  },
  taxId: {
    type: String,
    trim: true
    // Tax ID / VAT number
  },
  currency: {
    type: String,
    default: 'USD',
    trim: true
  },
  accountsReceivableAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChartOfAccounts',
    // Default AR account for this customer
  },
  revenueAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChartOfAccounts',
    // Default revenue account for this customer
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'credit_hold'],
    default: 'active'
  },
  notes: {
    type: String,
    trim: true
  },
  tags: [String],
  // Link to User model if customer has an account
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Financial metrics
  totalInvoiced: {
    type: Number,
    default: 0
  },
  totalPaid: {
    type: Number,
    default: 0
  },
  lastInvoiceDate: {
    type: Date
  },
  lastPaymentDate: {
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

// Indexes
CustomerSchema.index({ customerNumber: 1 });
CustomerSchema.index({ 'contactPerson.email': 1 });
CustomerSchema.index({ status: 1 });
CustomerSchema.index({ userId: 1 });

// Virtual for full name
CustomerSchema.virtual('contactFullName').get(function() {
  if (this.contactPerson.firstName || this.contactPerson.lastName) {
    return `${this.contactPerson.firstName || ''} ${this.contactPerson.lastName || ''}`.trim();
  }
  return '';
});

// Virtual for display name (company or contact name)
CustomerSchema.virtual('displayName').get(function() {
  return this.companyName || this.contactFullName || this.contactPerson.email;
});

// Virtual for available credit
CustomerSchema.virtual('availableCredit').get(function() {
  return this.creditLimit - this.currentBalance;
});

// Virtual for credit utilization percentage
CustomerSchema.virtual('creditUtilization').get(function() {
  if (this.creditLimit === 0) return 0;
  return (this.currentBalance / this.creditLimit) * 100;
});

// Method to get payment due date from invoice date
CustomerSchema.methods.getPaymentDueDate = function(invoiceDate) {
  const dueDate = new Date(invoiceDate);
  
  switch (this.paymentTerms) {
    case 'immediate':
      return dueDate;
    case 'net_15':
      dueDate.setDate(dueDate.getDate() + 15);
      break;
    case 'net_30':
      dueDate.setDate(dueDate.getDate() + 30);
      break;
    case 'net_45':
      dueDate.setDate(dueDate.getDate() + 45);
      break;
    case 'net_60':
      dueDate.setDate(dueDate.getDate() + 60);
      break;
    case 'net_90':
      dueDate.setDate(dueDate.getDate() + 90);
      break;
    case 'custom':
      dueDate.setDate(dueDate.getDate() + (this.customPaymentDays || 0));
      break;
  }
  
  return dueDate;
};

// Static method to generate customer number
CustomerSchema.statics.generateCustomerNumber = async function() {
  const count = await this.countDocuments();
  const number = String(count + 1).padStart(5, '0');
  return `CUST-${number}`;
};

// Pre-save middleware
CustomerSchema.pre('save', async function(next) {
  if (this.isNew && !this.customerNumber) {
    this.customerNumber = await this.constructor.generateCustomerNumber();
  }
  
  // Copy billing to shipping if sameAsBilling is true
  if (this.shippingAddress.sameAsBilling) {
    this.shippingAddress.street = this.billingAddress.street;
    this.shippingAddress.street2 = this.billingAddress.street2;
    this.shippingAddress.city = this.billingAddress.city;
    this.shippingAddress.state = this.billingAddress.state;
    this.shippingAddress.zipCode = this.billingAddress.zipCode;
    this.shippingAddress.country = this.billingAddress.country;
  }
  
  next();
});

// Ensure virtual fields are serialized
CustomerSchema.set('toJSON', { virtuals: true });
CustomerSchema.set('toObject', { virtuals: true });

const Customer = mongoose.model("Customer", CustomerSchema);
module.exports = Customer;
