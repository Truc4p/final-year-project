const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  // User who performed the action
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Action details
  action: {
    type: String,
    required: true,
    enum: [
      'create', 'update', 'delete', 'approve', 'reject', 'process',
      'cancel', 'pay', 'refund', 'void', 'archive', 'restore',
      'export', 'import', 'login', 'logout', 'view', 'download'
    ]
  },

  // Entity details
  entityType: {
    type: String,
    required: true,
    enum: [
      'Invoice', 'Bill', 'BankAccount', 'Customer', 'Vendor',
      'ChartOfAccount', 'GeneralLedger', 'BusinessExpense',
      'Budget', 'ApprovalWorkflow', 'CustomReport', 'TaxRate',
      'TaxLiability', 'PaymentBatch', 'ScheduledPayment',
      'User', 'System', 'Configuration'
    ]
  },

  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },

  // Description of the action
  description: {
    type: String,
    required: true
  },

  // Changes made (for update actions)
  changes: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: new Map()
  },

  // Previous values (for update/delete actions)
  previousValues: {
    type: mongoose.Schema.Types.Mixed
  },

  // New values (for create/update actions)
  newValues: {
    type: mongoose.Schema.Types.Mixed
  },

  // Request metadata
  ipAddress: String,
  userAgent: String,
  sessionId: String,

  // Status
  status: {
    type: String,
    enum: ['success', 'failure', 'pending'],
    default: 'success'
  },

  // Error details (if action failed)
  errorMessage: String,
  errorCode: String,

  // Compliance flags
  complianceFlags: [{
    type: String,
    enum: ['sensitive_data', 'financial_transaction', 'user_action', 'system_change', 'security_event']
  }],

  // Additional metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes
auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ complianceFlags: 1 });
auditLogSchema.index({ status: 1 });

// Static methods

// Log an action
auditLogSchema.statics.logAction = async function(data) {
  try {
    const log = new this(data);
    await log.save();
    return log;
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw error to avoid disrupting main operations
    return null;
  }
};

// Get audit trail for an entity
auditLogSchema.statics.getEntityTrail = async function(entityType, entityId, options = {}) {
  const query = { entityType, entityId };
  
  return this.find(query)
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .limit(options.limit || 100)
    .skip(options.skip || 0);
};

// Get user activity
auditLogSchema.statics.getUserActivity = async function(userId, options = {}) {
  const query = { user: userId };
  
  if (options.startDate || options.endDate) {
    query.createdAt = {};
    if (options.startDate) query.createdAt.$gte = new Date(options.startDate);
    if (options.endDate) query.createdAt.$lte = new Date(options.endDate);
  }
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(options.limit || 100)
    .skip(options.skip || 0);
};

// Get compliance-flagged logs
auditLogSchema.statics.getComplianceLogs = async function(flags = [], options = {}) {
  const query = flags.length > 0 ? { complianceFlags: { $in: flags } } : {};
  
  if (options.startDate || options.endDate) {
    query.createdAt = {};
    if (options.startDate) query.createdAt.$gte = new Date(options.startDate);
    if (options.endDate) query.createdAt.$lte = new Date(options.endDate);
  }
  
  return this.find(query)
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .limit(options.limit || 100)
    .skip(options.skip || 0);
};

// Get statistics
auditLogSchema.statics.getStatistics = async function(filters = {}) {
  const match = {};
  
  if (filters.startDate || filters.endDate) {
    match.createdAt = {};
    if (filters.startDate) match.createdAt.$gte = new Date(filters.startDate);
    if (filters.endDate) match.createdAt.$lte = new Date(filters.endDate);
  }
  
  if (filters.user) match.user = mongoose.Types.ObjectId(filters.user);
  if (filters.entityType) match.entityType = filters.entityType;
  if (filters.action) match.action = filters.action;
  
  const [actionStats, entityStats, userStats, statusStats] = await Promise.all([
    // Actions distribution
    this.aggregate([
      { $match: match },
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    
    // Entity types distribution
    this.aggregate([
      { $match: match },
      { $group: { _id: '$entityType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    
    // Top users
    this.aggregate([
      { $match: match },
      { $group: { _id: '$user', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'userInfo' } },
      { $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true } }
    ]),
    
    // Status distribution
    this.aggregate([
      { $match: match },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ])
  ]);
  
  return {
    actions: actionStats,
    entities: entityStats,
    users: userStats,
    statuses: statusStats,
    totalLogs: await this.countDocuments(match)
  };
};

// Archive old logs (for data retention)
auditLogSchema.statics.archiveOldLogs = async function(daysToKeep = 365) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  const result = await this.deleteMany({ createdAt: { $lt: cutoffDate } });
  return result.deletedCount;
};

// Instance methods

// Format for export
auditLogSchema.methods.toExport = function() {
  return {
    timestamp: this.createdAt,
    user: this.user?.name || this.user?.email || 'Unknown',
    action: this.action,
    entity: `${this.entityType} (${this.entityId})`,
    description: this.description,
    status: this.status,
    ipAddress: this.ipAddress,
    changes: JSON.stringify(Object.fromEntries(this.changes || new Map()))
  };
};

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;
