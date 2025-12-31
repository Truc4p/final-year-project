const mongoose = require('mongoose');

const TaxRateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  type: {
    type: String,
    enum: ['sales', 'purchase', 'income', 'payroll', 'property', 'other'],
    required: true
  },
  rate: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  isCompound: {
    type: Boolean,
    default: false
  },
  country: {
    type: String,
    default: 'US'
  },
  state: String,
  region: String,
  city: String,
  zipCode: String,
  applicableCategories: [String],
  exemptCategories: [String],
  effectiveFrom: {
    type: Date,
    required: true,
    default: Date.now
  },
  effectiveTo: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  authority: String, // Tax authority name (e.g., IRS, State Department of Revenue)
  filingFrequency: {
    type: String,
    enum: ['monthly', 'quarterly', 'annually'],
    default: 'quarterly'
  },
  accountCode: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChartOfAccounts'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes
TaxRateSchema.index({ type: 1, isActive: 1 });
TaxRateSchema.index({ country: 1, state: 1, region: 1 });
TaxRateSchema.index({ effectiveFrom: 1, effectiveTo: 1 });

// Virtual for checking if tax rate is currently effective
TaxRateSchema.virtual('isCurrentlyEffective').get(function() {
  const now = new Date();
  const isAfterStart = this.effectiveFrom <= now;
  const isBeforeEnd = !this.effectiveTo || this.effectiveTo >= now;
  return this.isActive && isAfterStart && isBeforeEnd;
});

// Method to calculate tax amount
TaxRateSchema.methods.calculateTax = function(amount, isCompoundBase = 0) {
  if (!this.isActive) return 0;
  
  const base = this.isCompound ? amount + isCompoundBase : amount;
  return (base * this.rate) / 100;
};

// Static method to get applicable tax rates
TaxRateSchema.statics.getApplicableRates = async function(criteria) {
  const { type, country, state, region, category, date = new Date() } = criteria;
  
  const query = {
    isActive: true,
    effectiveFrom: { $lte: date },
    $or: [
      { effectiveTo: { $exists: false } },
      { effectiveTo: null },
      { effectiveTo: { $gte: date } }
    ]
  };
  
  if (type) query.type = type;
  if (country) query.country = country;
  if (state) query.state = state;
  if (region) query.region = region;
  
  if (category) {
    query.$and = [
      {
        $or: [
          { applicableCategories: { $size: 0 } },
          { applicableCategories: category }
        ]
      },
      {
        exemptCategories: { $ne: category }
      }
    ];
  }
  
  return this.find(query).sort({ rate: 1 });
};

// Ensure virtuals are included in JSON
TaxRateSchema.set('toJSON', { virtuals: true });
TaxRateSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('TaxRate', TaxRateSchema);
