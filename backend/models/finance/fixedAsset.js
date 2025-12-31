const mongoose = require('mongoose');

const depreciationScheduleSchema = new mongoose.Schema({
  period: Number, // Month/Year number
  periodStart: Date,
  periodEnd: Date,
  openingValue: Number,
  depreciationAmount: Number,
  accumulatedDepreciation: Number,
  closingValue: Number,
  isProcessed: { type: Boolean, default: false },
  processedAt: Date,
  journalEntryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JournalEntry'
  }
}, { _id: true });

const maintenanceRecordSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  type: {
    type: String,
    enum: ['routine', 'repair', 'upgrade', 'inspection', 'other'],
    required: true
  },
  description: String,
  cost: { type: Number, default: 0 },
  vendor: String,
  nextMaintenanceDate: Date,
  performedBy: String,
  notes: String,
  attachments: [String],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: { type: Date, default: Date.now }
}, { _id: true });

const fixedAssetSchema = new mongoose.Schema({
  // Basic Information
  assetNumber: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  
  // Classification
  category: {
    type: String,
    enum: ['land', 'buildings', 'machinery', 'vehicles', 'furniture', 'equipment', 'computers', 'software', 'leasehold_improvements', 'other'],
    required: true
  },
  subCategory: String,
  
  // Acquisition Details
  acquisitionDate: {
    type: Date,
    required: true
  },
  acquisitionCost: {
    type: Number,
    required: true,
    min: 0
  },
  acquisitionMethod: {
    type: String,
    enum: ['purchase', 'lease', 'donation', 'transfer', 'construction', 'other'],
    default: 'purchase'
  },
  vendor: {
    name: String,
    invoiceNumber: String,
    invoiceDate: Date
  },
  purchaseOrderNumber: String,
  
  // Depreciation Settings
  depreciationMethod: {
    type: String,
    enum: ['straight_line', 'declining_balance', 'double_declining', 'sum_of_years', 'units_of_production', 'none'],
    default: 'straight_line'
  },
  usefulLifeYears: {
    type: Number,
    min: 0
  },
  usefulLifeMonths: {
    type: Number,
    min: 0
  },
  salvageValue: {
    type: Number,
    default: 0,
    min: 0
  },
  depreciationRate: {
    type: Number, // For declining balance methods (percentage)
    min: 0,
    max: 100
  },
  depreciationStartDate: Date,
  
  // Current Values
  currentValue: {
    type: Number,
    default: function() { return this.acquisitionCost; }
  },
  accumulatedDepreciation: {
    type: Number,
    default: 0
  },
  bookValue: {
    type: Number,
    default: function() { return this.acquisitionCost; }
  },
  
  // Depreciation Schedule
  depreciationSchedule: [depreciationScheduleSchema],
  lastDepreciationDate: Date,
  
  // Location & Assignment
  location: {
    building: String,
    floor: String,
    room: String,
    address: String
  },
  department: String,
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  custodian: String,
  
  // Physical Details
  serialNumber: String,
  modelNumber: String,
  manufacturer: String,
  barcode: String,
  condition: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor', 'non_functional'],
    default: 'good'
  },
  
  // Insurance & Warranty
  insurancePolicy: {
    policyNumber: String,
    provider: String,
    coverageAmount: Number,
    expiryDate: Date
  },
  warranty: {
    provider: String,
    expiryDate: Date,
    terms: String
  },
  
  // Maintenance
  maintenanceRecords: [maintenanceRecordSchema],
  nextMaintenanceDate: Date,
  
  // Status & Lifecycle
  status: {
    type: String,
    enum: ['active', 'inactive', 'under_maintenance', 'disposed', 'sold', 'written_off', 'transferred', 'lost'],
    default: 'active'
  },
  
  // Disposal Information
  disposal: {
    date: Date,
    method: {
      type: String,
      enum: ['sale', 'scrap', 'donation', 'trade_in', 'write_off', 'theft', 'destruction', 'transfer']
    },
    reason: String,
    proceeds: { type: Number, default: 0 },
    expenses: { type: Number, default: 0 },
    gainLoss: Number,
    buyer: String,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    journalEntryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JournalEntry'
    },
    notes: String,
    attachments: [String]
  },
  
  // Revaluation History
  revaluations: [{
    date: Date,
    previousValue: Number,
    newValue: Number,
    reason: String,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    journalEntryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JournalEntry'
    }
  }],
  
  // Accounting Links
  assetAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChartOfAccount'
  },
  depreciationExpenseAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChartOfAccount'
  },
  accumulatedDepreciationAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChartOfAccount'
  },
  
  // Images & Documents
  images: [String],
  documents: [{
    name: String,
    url: String,
    type: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  // Tags & Notes
  tags: [String],
  notes: String,
  
  // Audit
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
fixedAssetSchema.index({ assetNumber: 1 });
fixedAssetSchema.index({ category: 1, status: 1 });
fixedAssetSchema.index({ status: 1 });
fixedAssetSchema.index({ 'location.department': 1 });
fixedAssetSchema.index({ assignedTo: 1 });
fixedAssetSchema.index({ acquisitionDate: 1 });

// Pre-save: Generate asset number
fixedAssetSchema.pre('save', async function(next) {
  if (this.isNew && !this.assetNumber) {
    const count = await mongoose.model('FixedAsset').countDocuments();
    const prefix = this.category?.substring(0, 3).toUpperCase() || 'AST';
    this.assetNumber = `${prefix}-${String(count + 1).padStart(6, '0')}`;
  }
  
  // Calculate book value
  this.bookValue = this.acquisitionCost - this.accumulatedDepreciation;
  
  // Set depreciation start date if not set
  if (!this.depreciationStartDate && this.acquisitionDate) {
    this.depreciationStartDate = this.acquisitionDate;
  }
  
  // Calculate useful life in months if only years provided
  if (this.usefulLifeYears && !this.usefulLifeMonths) {
    this.usefulLifeMonths = this.usefulLifeYears * 12;
  }
  
  next();
});

// Method to calculate monthly depreciation
fixedAssetSchema.methods.calculateDepreciation = function(asOfDate = new Date()) {
  const depreciableAmount = this.acquisitionCost - this.salvageValue;
  
  if (this.depreciationMethod === 'none' || depreciableAmount <= 0) {
    return 0;
  }
  
  const usefulLifeMonths = this.usefulLifeMonths || (this.usefulLifeYears * 12) || 12;
  
  switch (this.depreciationMethod) {
    case 'straight_line':
      return depreciableAmount / usefulLifeMonths;
      
    case 'declining_balance':
      const rate = this.depreciationRate || (100 / this.usefulLifeYears);
      return (this.bookValue * rate / 100) / 12;
      
    case 'double_declining':
      const doubleRate = (2 / this.usefulLifeYears) * 100;
      return (this.bookValue * doubleRate / 100) / 12;
      
    case 'sum_of_years':
      const yearsRemaining = Math.max(0, this.usefulLifeYears - this.getAgeInYears(asOfDate));
      const sumOfYears = (this.usefulLifeYears * (this.usefulLifeYears + 1)) / 2;
      return (depreciableAmount * yearsRemaining / sumOfYears) / 12;
      
    default:
      return depreciableAmount / usefulLifeMonths;
  }
};

// Method to get age in years
fixedAssetSchema.methods.getAgeInYears = function(asOfDate = new Date()) {
  const start = new Date(this.acquisitionDate);
  const diffTime = Math.abs(asOfDate - start);
  return Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365));
};

// Method to generate depreciation schedule
fixedAssetSchema.methods.generateDepreciationSchedule = function() {
  const schedule = [];
  const usefulLifeMonths = this.usefulLifeMonths || (this.usefulLifeYears * 12) || 12;
  const depreciableAmount = this.acquisitionCost - this.salvageValue;
  
  if (this.depreciationMethod === 'none' || depreciableAmount <= 0) {
    return schedule;
  }
  
  let openingValue = this.acquisitionCost;
  let accumulatedDep = 0;
  const startDate = new Date(this.depreciationStartDate || this.acquisitionDate);
  
  for (let period = 1; period <= usefulLifeMonths; period++) {
    const periodStart = new Date(startDate);
    periodStart.setMonth(periodStart.getMonth() + period - 1);
    
    const periodEnd = new Date(periodStart);
    periodEnd.setMonth(periodEnd.getMonth() + 1);
    periodEnd.setDate(periodEnd.getDate() - 1);
    
    let depAmount = this.calculateDepreciation(periodStart);
    
    // Don't depreciate below salvage value
    if (openingValue - depAmount < this.salvageValue) {
      depAmount = openingValue - this.salvageValue;
    }
    
    if (depAmount <= 0) break;
    
    accumulatedDep += depAmount;
    const closingValue = openingValue - depAmount;
    
    schedule.push({
      period,
      periodStart,
      periodEnd,
      openingValue: Math.round(openingValue * 100) / 100,
      depreciationAmount: Math.round(depAmount * 100) / 100,
      accumulatedDepreciation: Math.round(accumulatedDep * 100) / 100,
      closingValue: Math.round(closingValue * 100) / 100,
      isProcessed: false
    });
    
    openingValue = closingValue;
    
    if (closingValue <= this.salvageValue) break;
  }
  
  return schedule;
};

// Method to process depreciation
fixedAssetSchema.methods.processDepreciation = function(periodIndex) {
  if (!this.depreciationSchedule[periodIndex]) {
    throw new Error('Invalid period index');
  }
  
  const period = this.depreciationSchedule[periodIndex];
  if (period.isProcessed) {
    throw new Error('Period already processed');
  }
  
  this.accumulatedDepreciation += period.depreciationAmount;
  this.bookValue = this.acquisitionCost - this.accumulatedDepreciation;
  this.currentValue = this.bookValue;
  this.lastDepreciationDate = period.periodEnd;
  
  period.isProcessed = true;
  period.processedAt = new Date();
  
  return period;
};

// Method to dispose asset
fixedAssetSchema.methods.dispose = function(disposalData) {
  this.status = disposalData.method === 'sale' ? 'sold' : 
                disposalData.method === 'write_off' ? 'written_off' : 'disposed';
  
  this.disposal = {
    date: disposalData.date || new Date(),
    method: disposalData.method,
    reason: disposalData.reason,
    proceeds: disposalData.proceeds || 0,
    expenses: disposalData.expenses || 0,
    gainLoss: (disposalData.proceeds || 0) - (disposalData.expenses || 0) - this.bookValue,
    buyer: disposalData.buyer,
    approvedBy: disposalData.approvedBy,
    notes: disposalData.notes,
    attachments: disposalData.attachments
  };
  
  return this.disposal;
};

// Method to revalue asset
fixedAssetSchema.methods.revalue = function(newValue, reason, approvedBy) {
  const revaluation = {
    date: new Date(),
    previousValue: this.currentValue,
    newValue,
    reason,
    approvedBy
  };
  
  this.revaluations.push(revaluation);
  this.currentValue = newValue;
  
  // Adjust accumulated depreciation if revaluation is significant
  const difference = newValue - this.bookValue;
  if (difference > 0) {
    // Revaluation surplus - typically goes to equity
  } else {
    // Revaluation deficit - typically goes to P&L
  }
  
  return revaluation;
};

// Static method to get assets summary by category
fixedAssetSchema.statics.getSummaryByCategory = async function() {
  return this.aggregate([
    { $match: { status: { $in: ['active', 'inactive', 'under_maintenance'] } } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalCost: { $sum: '$acquisitionCost' },
        totalBookValue: { $sum: '$bookValue' },
        totalAccumulatedDepreciation: { $sum: '$accumulatedDepreciation' }
      }
    },
    { $sort: { totalCost: -1 } }
  ]);
};

// Static method to get assets due for depreciation
fixedAssetSchema.statics.getAssetsDueForDepreciation = async function(asOfDate = new Date()) {
  return this.find({
    status: 'active',
    depreciationMethod: { $ne: 'none' },
    bookValue: { $gt: 0 },
    $or: [
      { lastDepreciationDate: { $lt: asOfDate } },
      { lastDepreciationDate: null }
    ]
  });
};

// Static method to get assets by location
fixedAssetSchema.statics.getAssetsByLocation = async function() {
  return this.aggregate([
    { $match: { status: { $in: ['active', 'inactive', 'under_maintenance'] } } },
    {
      $group: {
        _id: '$location.building',
        count: { $sum: 1 },
        totalValue: { $sum: '$bookValue' }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

module.exports = mongoose.model('FixedAsset', fixedAssetSchema);
