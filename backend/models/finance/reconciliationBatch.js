const mongoose = require('mongoose');

const matchedItemSchema = new mongoose.Schema({
  sourceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  sourceType: {
    type: String,
    enum: ['bank_statement', 'invoice', 'bill', 'payment', 'journal_entry', 'receipt'],
    required: true
  },
  sourceReference: String,
  sourceAmount: Number,
  sourceDate: Date,
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  targetType: {
    type: String,
    enum: ['bank_statement', 'invoice', 'bill', 'payment', 'journal_entry', 'receipt'],
    required: true
  },
  targetReference: String,
  targetAmount: Number,
  targetDate: Date,
  matchScore: {
    type: Number,
    min: 0,
    max: 100
  },
  matchedBy: {
    rule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ReconciliationRule'
    },
    ruleName: String,
    method: {
      type: String,
      enum: ['auto', 'manual', 'suggested']
    }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected'],
    default: 'pending'
  },
  confirmedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  confirmedAt: Date,
  notes: String
}, { _id: true });

const discrepancySchema = new mongoose.Schema({
  sourceId: mongoose.Schema.Types.ObjectId,
  sourceType: String,
  sourceReference: String,
  sourceAmount: Number,
  targetId: mongoose.Schema.Types.ObjectId,
  targetType: String,
  targetReference: String,
  targetAmount: Number,
  discrepancyType: {
    type: String,
    enum: ['amount_mismatch', 'date_mismatch', 'missing_source', 'missing_target', 'duplicate', 'partial_match'],
    required: true
  },
  amountDifference: Number,
  dateDifference: Number, // in days
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'investigating', 'resolved', 'written_off'],
    default: 'open'
  },
  resolution: {
    type: String,
    enum: ['matched', 'adjusted', 'written_off', 'voided', 'other']
  },
  resolutionNotes: String,
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: Date
}, { _id: true });

const reconciliationBatchSchema = new mongoose.Schema({
  batchNumber: {
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
  reconciliationType: {
    type: String,
    enum: ['bank', 'accounts_receivable', 'accounts_payable', 'intercompany', 'custom'],
    required: true
  },
  period: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }
  },
  sourceAccount: {
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChartOfAccount'
    },
    accountName: String,
    accountNumber: String
  },
  targetAccount: {
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChartOfAccount'
    },
    accountName: String,
    accountNumber: String
  },
  status: {
    type: String,
    enum: ['draft', 'in_progress', 'pending_review', 'completed', 'cancelled'],
    default: 'draft'
  },
  // Statistics
  statistics: {
    totalSourceItems: { type: Number, default: 0 },
    totalTargetItems: { type: Number, default: 0 },
    totalSourceAmount: { type: Number, default: 0 },
    totalTargetAmount: { type: Number, default: 0 },
    matchedItems: { type: Number, default: 0 },
    matchedAmount: { type: Number, default: 0 },
    unmatchedSourceItems: { type: Number, default: 0 },
    unmatchedTargetItems: { type: Number, default: 0 },
    discrepancies: { type: Number, default: 0 },
    discrepancyAmount: { type: Number, default: 0 },
    matchRate: { type: Number, default: 0 } // percentage
  },
  // Opening and closing balances
  balances: {
    openingSource: { type: Number, default: 0 },
    openingTarget: { type: Number, default: 0 },
    closingSource: { type: Number, default: 0 },
    closingTarget: { type: Number, default: 0 },
    difference: { type: Number, default: 0 }
  },
  // Matched items
  matchedItems: [matchedItemSchema],
  // Unmatched source items
  unmatchedSource: [{
    itemId: mongoose.Schema.Types.ObjectId,
    itemType: String,
    reference: String,
    amount: Number,
    date: Date,
    description: String
  }],
  // Unmatched target items
  unmatchedTarget: [{
    itemId: mongoose.Schema.Types.ObjectId,
    itemType: String,
    reference: String,
    amount: Number,
    date: Date,
    description: String
  }],
  // Discrepancies found
  discrepancies: [discrepancySchema],
  // Rules used in this batch
  rulesApplied: [{
    rule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ReconciliationRule'
    },
    ruleName: String,
    matchesFound: Number
  }],
  // Processing info
  processedAt: Date,
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
  completedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  completedAt: Date,
  notes: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes
reconciliationBatchSchema.index({ batchNumber: 1 });
reconciliationBatchSchema.index({ status: 1, createdAt: -1 });
reconciliationBatchSchema.index({ reconciliationType: 1 });
reconciliationBatchSchema.index({ 'period.startDate': 1, 'period.endDate': 1 });
reconciliationBatchSchema.index({ 'sourceAccount.accountId': 1 });

// Pre-save: Generate batch number
reconciliationBatchSchema.pre('save', async function(next) {
  if (this.isNew && !this.batchNumber) {
    const count = await mongoose.model('ReconciliationBatch').countDocuments();
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    this.batchNumber = `REC-${year}${month}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// Method to update statistics
reconciliationBatchSchema.methods.updateStatistics = function() {
  const stats = this.statistics;
  
  stats.matchedItems = this.matchedItems.filter(m => m.status === 'confirmed').length;
  stats.matchedAmount = this.matchedItems
    .filter(m => m.status === 'confirmed')
    .reduce((sum, m) => sum + (m.sourceAmount || 0), 0);
  
  stats.unmatchedSourceItems = this.unmatchedSource.length;
  stats.unmatchedTargetItems = this.unmatchedTarget.length;
  stats.discrepancies = this.discrepancies.filter(d => d.status !== 'resolved').length;
  stats.discrepancyAmount = this.discrepancies
    .filter(d => d.status !== 'resolved')
    .reduce((sum, d) => sum + Math.abs(d.amountDifference || 0), 0);
  
  // Calculate match rate
  const totalItems = stats.totalSourceItems + stats.totalTargetItems;
  if (totalItems > 0) {
    stats.matchRate = Math.round((stats.matchedItems * 2 / totalItems) * 100);
  }
  
  // Update balance difference
  this.balances.difference = this.balances.closingSource - this.balances.closingTarget;
};

// Method to add matched pair
reconciliationBatchSchema.methods.addMatch = function(sourceItem, targetItem, rule, matchScore, method = 'auto') {
  this.matchedItems.push({
    sourceId: sourceItem._id || sourceItem.itemId,
    sourceType: sourceItem.type || sourceItem.itemType,
    sourceReference: sourceItem.reference,
    sourceAmount: sourceItem.amount,
    sourceDate: sourceItem.date,
    targetId: targetItem._id || targetItem.itemId,
    targetType: targetItem.type || targetItem.itemType,
    targetReference: targetItem.reference,
    targetAmount: targetItem.amount,
    targetDate: targetItem.date,
    matchScore,
    matchedBy: {
      rule: rule?._id,
      ruleName: rule?.name,
      method
    },
    status: method === 'auto' && rule?.autoReconcile ? 'confirmed' : 'pending'
  });
  
  // Remove from unmatched lists
  this.unmatchedSource = this.unmatchedSource.filter(
    u => String(u.itemId) !== String(sourceItem._id || sourceItem.itemId)
  );
  this.unmatchedTarget = this.unmatchedTarget.filter(
    u => String(u.itemId) !== String(targetItem._id || targetItem.itemId)
  );
};

// Method to add discrepancy
reconciliationBatchSchema.methods.addDiscrepancy = function(discrepancy) {
  // Determine severity based on amount difference
  let severity = 'low';
  const diff = Math.abs(discrepancy.amountDifference || 0);
  if (diff > 10000) severity = 'critical';
  else if (diff > 1000) severity = 'high';
  else if (diff > 100) severity = 'medium';
  
  this.discrepancies.push({
    ...discrepancy,
    severity
  });
};

// Method to confirm match
reconciliationBatchSchema.methods.confirmMatch = function(matchId, userId) {
  const match = this.matchedItems.id(matchId);
  if (match) {
    match.status = 'confirmed';
    match.confirmedBy = userId;
    match.confirmedAt = new Date();
  }
  this.updateStatistics();
};

// Method to reject match
reconciliationBatchSchema.methods.rejectMatch = function(matchId, userId, notes) {
  const match = this.matchedItems.id(matchId);
  if (match) {
    match.status = 'rejected';
    match.confirmedBy = userId;
    match.confirmedAt = new Date();
    match.notes = notes;
    
    // Add items back to unmatched lists
    this.unmatchedSource.push({
      itemId: match.sourceId,
      itemType: match.sourceType,
      reference: match.sourceReference,
      amount: match.sourceAmount,
      date: match.sourceDate
    });
    this.unmatchedTarget.push({
      itemId: match.targetId,
      itemType: match.targetType,
      reference: match.targetReference,
      amount: match.targetAmount,
      date: match.targetDate
    });
  }
  this.updateStatistics();
};

// Method to resolve discrepancy
reconciliationBatchSchema.methods.resolveDiscrepancy = function(discrepancyId, resolution, notes, userId) {
  const discrepancy = this.discrepancies.id(discrepancyId);
  if (discrepancy) {
    discrepancy.status = 'resolved';
    discrepancy.resolution = resolution;
    discrepancy.resolutionNotes = notes;
    discrepancy.resolvedBy = userId;
    discrepancy.resolvedAt = new Date();
  }
  this.updateStatistics();
};

// Static method to get reconciliation summary
reconciliationBatchSchema.statics.getSummary = async function(filters = {}) {
  const match = {};
  
  if (filters.reconciliationType) {
    match.reconciliationType = filters.reconciliationType;
  }
  if (filters.status) {
    match.status = filters.status;
  }
  if (filters.startDate || filters.endDate) {
    match['period.startDate'] = {};
    if (filters.startDate) match['period.startDate'].$gte = new Date(filters.startDate);
    if (filters.endDate) match['period.startDate'].$lte = new Date(filters.endDate);
  }

  const summary = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalMatchedItems: { $sum: '$statistics.matchedItems' },
        totalDiscrepancies: { $sum: '$statistics.discrepancies' },
        totalMatchedAmount: { $sum: '$statistics.matchedAmount' },
        avgMatchRate: { $avg: '$statistics.matchRate' }
      }
    }
  ]);

  return summary;
};

module.exports = mongoose.model('ReconciliationBatch', reconciliationBatchSchema);
