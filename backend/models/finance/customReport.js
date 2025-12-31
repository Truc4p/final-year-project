const mongoose = require('mongoose');

const FilterSchema = new mongoose.Schema({
  field: {
    type: String,
    required: true
  },
  operator: {
    type: String,
    enum: ['equals', 'not_equals', 'contains', 'not_contains', 'greater_than', 'less_than', 'between', 'in', 'not_in', 'is_null', 'is_not_null'],
    required: true
  },
  value: mongoose.Schema.Types.Mixed,
  logicalOperator: {
    type: String,
    enum: ['AND', 'OR'],
    default: 'AND'
  }
}, { _id: false });

const ColumnSchema = new mongoose.Schema({
  field: {
    type: String,
    required: true
  },
  label: String,
  aggregation: {
    type: String,
    enum: ['none', 'sum', 'avg', 'count', 'min', 'max'],
    default: 'none'
  },
  format: {
    type: String,
    enum: ['number', 'currency', 'percentage', 'date', 'datetime', 'text'],
    default: 'text'
  },
  order: Number
}, { _id: false });

const GroupBySchema = new mongoose.Schema({
  field: String,
  aggregations: [{
    field: String,
    function: {
      type: String,
      enum: ['sum', 'avg', 'count', 'min', 'max']
    }
  }]
}, { _id: false });

const ChartConfigSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['bar', 'line', 'pie', 'doughnut', 'area', 'scatter', 'table'],
    default: 'table'
  },
  xAxis: String,
  yAxis: [String],
  title: String,
  showLegend: {
    type: Boolean,
    default: true
  },
  colors: [String]
}, { _id: false });

const ScheduleSchema = new mongoose.Schema({
  enabled: {
    type: Boolean,
    default: false
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'quarterly'],
    required: function() { return this.enabled; }
  },
  dayOfWeek: Number, // 0-6 for weekly
  dayOfMonth: Number, // 1-31 for monthly
  time: String, // HH:mm format
  recipients: [{
    type: String,
    match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
  }],
  format: {
    type: String,
    enum: ['pdf', 'excel', 'csv'],
    default: 'pdf'
  },
  lastRun: Date,
  nextRun: Date
}, { _id: false });

const CustomReportSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  category: {
    type: String,
    enum: ['financial', 'sales', 'expenses', 'cash_flow', 'budget', 'tax', 'custom'],
    default: 'custom'
  },
  dataSource: {
    type: String,
    enum: ['invoices', 'bills', 'expenses', 'transactions', 'budgets', 'accounts', 'general_ledger', 'combined'],
    required: true
  },
  filters: [FilterSchema],
  columns: [ColumnSchema],
  groupBy: GroupBySchema,
  sortBy: {
    field: String,
    order: {
      type: String,
      enum: ['asc', 'desc'],
      default: 'asc'
    }
  },
  chartConfig: ChartConfigSchema,
  schedule: ScheduleSchema,
  isTemplate: {
    type: Boolean,
    default: false
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sharedWith: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    permission: {
      type: String,
      enum: ['view', 'edit'],
      default: 'view'
    }
  }],
  tags: [String],
  lastRunAt: Date,
  runCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
CustomReportSchema.index({ createdBy: 1, name: 1 });
CustomReportSchema.index({ category: 1, isPublic: 1 });
CustomReportSchema.index({ isTemplate: 1 });
CustomReportSchema.index({ 'schedule.enabled': 1, 'schedule.nextRun': 1 });

// Virtual for checking if report is scheduled
CustomReportSchema.virtual('isScheduled').get(function() {
  return this.schedule && this.schedule.enabled;
});

// Method to calculate next run time
CustomReportSchema.methods.calculateNextRun = function() {
  if (!this.schedule || !this.schedule.enabled) return null;

  const now = new Date();
  const [hours, minutes] = (this.schedule.time || '09:00').split(':').map(Number);
  let nextRun = new Date(now);
  nextRun.setHours(hours, minutes, 0, 0);

  switch (this.schedule.frequency) {
    case 'daily':
      if (nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 1);
      }
      break;

    case 'weekly':
      const targetDay = this.schedule.dayOfWeek || 1; // Default to Monday
      const currentDay = nextRun.getDay();
      let daysUntilTarget = (targetDay - currentDay + 7) % 7;
      if (daysUntilTarget === 0 && nextRun <= now) {
        daysUntilTarget = 7;
      }
      nextRun.setDate(nextRun.getDate() + daysUntilTarget);
      break;

    case 'monthly':
      const targetDate = this.schedule.dayOfMonth || 1;
      nextRun.setDate(targetDate);
      if (nextRun <= now) {
        nextRun.setMonth(nextRun.getMonth() + 1);
      }
      break;

    case 'quarterly':
      const currentMonth = nextRun.getMonth();
      const quarterStartMonth = Math.floor(currentMonth / 3) * 3;
      nextRun.setMonth(quarterStartMonth, 1); // First day of quarter
      if (nextRun <= now) {
        nextRun.setMonth(nextRun.getMonth() + 3);
      }
      break;
  }

  return nextRun;
};

// Method to update schedule after run
CustomReportSchema.methods.updateSchedule = function() {
  if (this.schedule && this.schedule.enabled) {
    this.schedule.lastRun = new Date();
    this.schedule.nextRun = this.calculateNextRun();
    this.lastRunAt = new Date();
    this.runCount += 1;
  }
};

// Method to check if user can access report
CustomReportSchema.methods.canAccess = function(userId) {
  if (this.isPublic) return true;
  if (this.createdBy.toString() === userId.toString()) return true;
  return this.sharedWith.some(share => share.user.toString() === userId.toString());
};

// Method to check if user can edit report
CustomReportSchema.methods.canEdit = function(userId) {
  if (this.createdBy.toString() === userId.toString()) return true;
  const share = this.sharedWith.find(s => s.user.toString() === userId.toString());
  return share && share.permission === 'edit';
};

// Static method to get scheduled reports due to run
CustomReportSchema.statics.getDueReports = async function() {
  const now = new Date();
  return this.find({
    'schedule.enabled': true,
    'schedule.nextRun': { $lte: now }
  }).populate('createdBy', 'username email');
};

// Static method to get popular reports
CustomReportSchema.statics.getPopularReports = async function(limit = 10) {
  return this.find({ isPublic: true })
    .sort({ runCount: -1 })
    .limit(limit)
    .populate('createdBy', 'username');
};

// Ensure virtuals are included in JSON
CustomReportSchema.set('toJSON', { virtuals: true });
CustomReportSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('CustomReport', CustomReportSchema);
