const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const VendorSchema = new Schema({
  vendorNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    // Format: VEND-XXXXX
  },
  companyName: {
    type: String,
    required: true,
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
  paymentTerms: {
    type: String,
    enum: ['immediate', 'net_15', 'net_30', 'net_45', 'net_60', 'net_90', 'custom'],
    default: 'net_30'
  },
  customPaymentDays: {
    type: Number,
    min: 0,
  },
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'check', 'cash', 'credit_card', 'ach', 'wire', 'other'],
    default: 'bank_transfer'
  },
  // Banking details
  bankDetails: {
    bankName: { type: String, trim: true },
    accountNumber: { type: String, trim: true },
    routingNumber: { type: String, trim: true },
    swiftCode: { type: String, trim: true },
    iban: { type: String, trim: true }
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
  // Default accounts for this vendor
  accountsPayableAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChartOfAccounts',
  },
  expenseAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChartOfAccounts',
    // Default expense account
  },
  vendorType: {
    type: String,
    enum: ['supplier', 'contractor', 'service_provider', 'utility', 'other'],
    default: 'supplier'
  },
  categories: [String],
  // Financial tracking
  currentBalance: {
    type: Number,
    default: 0,
    // Outstanding amount we owe to vendor
  },
  totalPurchased: {
    type: Number,
    default: 0
  },
  totalPaid: {
    type: Number,
    default: 0
  },
  lastPurchaseDate: {
    type: Date
  },
  lastPaymentDate: {
    type: Date
  },
  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  isPreferredVendor: {
    type: Boolean,
    default: false
  },
  // Ratings and performance
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  notes: {
    type: String,
    trim: true
  },
  tags: [String],
  attachments: [{
    fileName: String,
    fileUrl: String,
    uploadDate: { type: Date, default: Date.now }
  }],
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

// Indexes (note: vendorNumber has unique: true which creates an index automatically)
VendorSchema.index({ companyName: 1 });
VendorSchema.index({ 'contactPerson.email': 1 });
VendorSchema.index({ status: 1 });

// Virtual for full contact name
VendorSchema.virtual('contactFullName').get(function() {
  if (this.contactPerson.firstName || this.contactPerson.lastName) {
    return `${this.contactPerson.firstName || ''} ${this.contactPerson.lastName || ''}`.trim();
  }
  return '';
});

// Method to get payment due date from bill date
VendorSchema.methods.getPaymentDueDate = function(billDate) {
  const dueDate = new Date(billDate);
  
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

// Static method to generate vendor number
VendorSchema.statics.generateVendorNumber = async function() {
  const count = await this.countDocuments();
  const number = String(count + 1).padStart(5, '0');
  return `VEND-${number}`;
};

// Pre-save middleware
VendorSchema.pre('save', async function(next) {
  if (this.isNew && !this.vendorNumber) {
    this.vendorNumber = await this.constructor.generateVendorNumber();
  }
  next();
});

// Ensure virtual fields are serialized
VendorSchema.set('toJSON', { virtuals: true });
VendorSchema.set('toObject', { virtuals: true });

const Vendor = mongoose.model("Vendor", VendorSchema);
module.exports = Vendor;
