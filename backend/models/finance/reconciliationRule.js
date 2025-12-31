const mongoose = require('mongoose');

const reconciliationRuleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  ruleType: {
    type: String,
    enum: ['exact_match', 'fuzzy_match', 'amount_tolerance', 'date_range', 'reference_pattern', 'custom'],
    required: true
  },
  sourceType: {
    type: String,
    enum: ['bank_statement', 'invoice', 'bill', 'payment', 'journal_entry', 'receipt'],
    required: true
  },
  targetType: {
    type: String,
    enum: ['bank_statement', 'invoice', 'bill', 'payment', 'journal_entry', 'receipt'],
    required: true
  },
  matchingCriteria: {
    // Fields to match
    fields: [{
      sourceField: String,
      targetField: String,
      matchType: {
        type: String,
        enum: ['exact', 'contains', 'starts_with', 'ends_with', 'regex', 'numeric_tolerance', 'date_tolerance']
      },
      tolerance: Number, // For numeric/date tolerance
      caseSensitive: { type: Boolean, default: false }
    }],
    // Minimum match score (0-100) for fuzzy matching
    minimumScore: { type: Number, default: 80 },
    // Require all fields to match or any
    matchMode: { type: String, enum: ['all', 'any'], default: 'all' }
  },
  amountTolerance: {
    type: { type: String, enum: ['fixed', 'percentage'], default: 'fixed' },
    value: { type: Number, default: 0 }
  },
  dateTolerance: {
    days: { type: Number, default: 0 }
  },
  priority: {
    type: Number,
    default: 0 // Higher priority rules are applied first
  },
  isActive: {
    type: Boolean,
    default: true
  },
  autoReconcile: {
    type: Boolean,
    default: false // Automatically reconcile when match found
  },
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
reconciliationRuleSchema.index({ ruleType: 1, isActive: 1 });
reconciliationRuleSchema.index({ sourceType: 1, targetType: 1 });
reconciliationRuleSchema.index({ priority: -1 });

// Static method to get active rules for source/target types
reconciliationRuleSchema.statics.getActiveRules = async function(sourceType, targetType) {
  return this.find({
    isActive: true,
    sourceType,
    targetType
  }).sort({ priority: -1 });
};

// Method to check if a pair matches this rule
reconciliationRuleSchema.methods.checkMatch = function(sourceItem, targetItem) {
  const result = {
    isMatch: false,
    score: 0,
    matchedFields: [],
    unmatchedFields: []
  };

  let totalScore = 0;
  let matchedCount = 0;
  const criteria = this.matchingCriteria;

  for (const field of criteria.fields) {
    const sourceValue = getNestedValue(sourceItem, field.sourceField);
    const targetValue = getNestedValue(targetItem, field.targetField);
    
    const fieldMatch = checkFieldMatch(sourceValue, targetValue, field, this.amountTolerance, this.dateTolerance);
    
    if (fieldMatch.isMatch) {
      matchedCount++;
      totalScore += fieldMatch.score;
      result.matchedFields.push({
        sourceField: field.sourceField,
        targetField: field.targetField,
        score: fieldMatch.score
      });
    } else {
      result.unmatchedFields.push({
        sourceField: field.sourceField,
        targetField: field.targetField,
        reason: fieldMatch.reason
      });
    }
  }

  const avgScore = criteria.fields.length > 0 ? totalScore / criteria.fields.length : 0;
  result.score = Math.round(avgScore);

  if (criteria.matchMode === 'all') {
    result.isMatch = matchedCount === criteria.fields.length && avgScore >= criteria.minimumScore;
  } else {
    result.isMatch = matchedCount > 0 && avgScore >= criteria.minimumScore;
  }

  return result;
};

// Helper function to get nested object value
function getNestedValue(obj, path) {
  if (!path) return undefined;
  return path.split('.').reduce((o, p) => o && o[p], obj);
}

// Helper function to check field match
function checkFieldMatch(sourceValue, targetValue, field, amountTolerance, dateTolerance) {
  if (sourceValue === undefined || targetValue === undefined) {
    return { isMatch: false, score: 0, reason: 'Missing value' };
  }

  const source = field.caseSensitive ? String(sourceValue) : String(sourceValue).toLowerCase();
  const target = field.caseSensitive ? String(targetValue) : String(targetValue).toLowerCase();

  switch (field.matchType) {
    case 'exact':
      return {
        isMatch: source === target,
        score: source === target ? 100 : 0,
        reason: source !== target ? 'Values do not match exactly' : null
      };

    case 'contains':
      const containsMatch = source.includes(target) || target.includes(source);
      return {
        isMatch: containsMatch,
        score: containsMatch ? 80 : 0,
        reason: !containsMatch ? 'Value not contained' : null
      };

    case 'starts_with':
      const startsMatch = source.startsWith(target) || target.startsWith(source);
      return {
        isMatch: startsMatch,
        score: startsMatch ? 90 : 0,
        reason: !startsMatch ? 'Value does not start with' : null
      };

    case 'ends_with':
      const endsMatch = source.endsWith(target) || target.endsWith(source);
      return {
        isMatch: endsMatch,
        score: endsMatch ? 90 : 0,
        reason: !endsMatch ? 'Value does not end with' : null
      };

    case 'regex':
      try {
        const regex = new RegExp(target, field.caseSensitive ? '' : 'i');
        const regexMatch = regex.test(source);
        return {
          isMatch: regexMatch,
          score: regexMatch ? 100 : 0,
          reason: !regexMatch ? 'Regex pattern not matched' : null
        };
      } catch {
        return { isMatch: false, score: 0, reason: 'Invalid regex pattern' };
      }

    case 'numeric_tolerance':
      const numSource = parseFloat(sourceValue);
      const numTarget = parseFloat(targetValue);
      if (isNaN(numSource) || isNaN(numTarget)) {
        return { isMatch: false, score: 0, reason: 'Non-numeric values' };
      }
      let tolerance = field.tolerance || 0;
      if (amountTolerance && amountTolerance.type === 'percentage') {
        tolerance = Math.abs(numTarget) * (amountTolerance.value / 100);
      } else if (amountTolerance) {
        tolerance = amountTolerance.value;
      }
      const numDiff = Math.abs(numSource - numTarget);
      const withinTolerance = numDiff <= tolerance;
      const numScore = withinTolerance ? Math.max(0, 100 - (numDiff / Math.max(numTarget, 1)) * 100) : 0;
      return {
        isMatch: withinTolerance,
        score: Math.round(numScore),
        reason: !withinTolerance ? `Difference ${numDiff} exceeds tolerance ${tolerance}` : null
      };

    case 'date_tolerance':
      const dateSource = new Date(sourceValue);
      const dateTarget = new Date(targetValue);
      if (isNaN(dateSource.getTime()) || isNaN(dateTarget.getTime())) {
        return { isMatch: false, score: 0, reason: 'Invalid date values' };
      }
      const daysDiff = Math.abs((dateSource - dateTarget) / (1000 * 60 * 60 * 24));
      const daysAllowed = dateTolerance?.days || field.tolerance || 0;
      const dateWithinTolerance = daysDiff <= daysAllowed;
      const dateScore = dateWithinTolerance ? Math.max(0, 100 - (daysDiff / Math.max(daysAllowed, 1)) * 50) : 0;
      return {
        isMatch: dateWithinTolerance,
        score: Math.round(dateScore),
        reason: !dateWithinTolerance ? `Date difference ${daysDiff.toFixed(1)} days exceeds tolerance ${daysAllowed}` : null
      };

    default:
      return { isMatch: source === target, score: source === target ? 100 : 0 };
  }
}

module.exports = mongoose.model('ReconciliationRule', reconciliationRuleSchema);
