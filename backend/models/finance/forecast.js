/**
 * Financial Forecast Model
 * AI-powered financial predictions and scenario planning
 */
const mongoose = require('mongoose');

// Prediction data point schema
const predictionPointSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  value: { type: Number, required: true },
  lowerBound: { type: Number },
  upperBound: { type: Number },
  confidence: { type: Number, min: 0, max: 100 }
});

// Scenario assumptions schema
const scenarioAssumptionSchema = new mongoose.Schema({
  variable: { type: String, required: true },
  baseValue: { type: Number },
  adjustedValue: { type: Number },
  adjustmentType: { type: String, enum: ['percentage', 'absolute', 'growth_rate'] },
  adjustmentValue: { type: Number },
  description: { type: String }
});

// Scenario schema
const scenarioSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['optimistic', 'pessimistic', 'most_likely', 'custom'],
    default: 'custom'
  },
  description: { type: String },
  assumptions: [scenarioAssumptionSchema],
  adjustmentFactor: { type: Number, default: 1 }, // Multiplier for all values
  predictions: {
    revenue: [predictionPointSchema],
    expenses: [predictionPointSchema],
    profit: [predictionPointSchema],
    cashFlow: [predictionPointSchema]
  },
  summary: {
    totalRevenue: { type: Number },
    totalExpenses: { type: Number },
    netProfit: { type: Number },
    profitMargin: { type: Number },
    growthRate: { type: Number }
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// Trend analysis schema
const trendSchema = new mongoose.Schema({
  metric: { type: String, required: true },
  direction: { type: String, enum: ['increasing', 'decreasing', 'stable', 'volatile'] },
  strength: { type: Number, min: 0, max: 100 }, // Trend strength
  slope: { type: Number }, // Rate of change
  correlation: { type: Number }, // R-squared value
  seasonality: {
    detected: { type: Boolean, default: false },
    period: { type: String }, // monthly, quarterly, yearly
    amplitude: { type: Number }
  },
  insights: [{ type: String }]
});

// Anomaly detection schema
const anomalySchema = new mongoose.Schema({
  date: { type: Date, required: true },
  metric: { type: String, required: true },
  actualValue: { type: Number, required: true },
  expectedValue: { type: Number },
  deviation: { type: Number },
  deviationPercent: { type: Number },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
  type: { type: String, enum: ['spike', 'drop', 'outlier', 'pattern_break'] },
  explanation: { type: String },
  isReviewed: { type: Boolean, default: false },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date }
});

// KPI target schema
const kpiTargetSchema = new mongoose.Schema({
  kpi: { type: String, required: true },
  targetValue: { type: Number, required: true },
  currentValue: { type: Number },
  forecastedValue: { type: Number },
  achievementProbability: { type: Number, min: 0, max: 100 },
  targetDate: { type: Date },
  status: { 
    type: String, 
    enum: ['on_track', 'at_risk', 'off_track', 'achieved', 'missed'],
    default: 'on_track'
  }
});

// Main forecast schema
const forecastSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  
  // Forecast configuration
  forecastType: {
    type: String,
    enum: ['revenue', 'expense', 'profit', 'cash_flow', 'comprehensive'],
    default: 'comprehensive'
  },
  
  timeframe: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    granularity: { 
      type: String, 
      enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
      default: 'monthly'
    }
  },
  
  // Historical data period used
  historicalPeriod: {
    startDate: { type: Date },
    endDate: { type: Date },
    dataPoints: { type: Number }
  },
  
  // Forecasting methodology
  methodology: {
    primaryModel: { 
      type: String, 
      enum: ['linear_regression', 'exponential_smoothing', 'arima', 'prophet', 'ensemble', 'moving_average'],
      default: 'linear_regression'
    },
    secondaryModel: { type: String },
    confidenceLevel: { type: Number, default: 95 },
    seasonalAdjustment: { type: Boolean, default: true },
    includeExternalFactors: { type: Boolean, default: false }
  },
  
  // Base predictions
  predictions: {
    revenue: [predictionPointSchema],
    expenses: [predictionPointSchema],
    profit: [predictionPointSchema],
    cashFlow: [predictionPointSchema]
  },
  
  // Scenarios
  scenarios: [scenarioSchema],
  activeScenario: { type: String },
  
  // Trend analysis
  trends: [trendSchema],
  
  // Anomalies detected
  anomalies: [anomalySchema],
  
  // KPI tracking
  kpiTargets: [kpiTargetSchema],
  
  // Summary metrics
  summary: {
    forecastedRevenue: { type: Number },
    forecastedExpenses: { type: Number },
    forecastedProfit: { type: Number },
    projectedGrowthRate: { type: Number },
    averageConfidence: { type: Number },
    modelAccuracy: { type: Number },
    meanAbsoluteError: { type: Number },
    meanSquaredError: { type: Number }
  },
  
  // Recommendations
  recommendations: [{
    type: { type: String, enum: ['opportunity', 'risk', 'action', 'insight'] },
    priority: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
    title: { type: String },
    description: { type: String },
    impact: { type: String },
    suggestedAction: { type: String },
    relatedMetric: { type: String }
  }],
  
  // Metadata
  status: {
    type: String,
    enum: ['draft', 'generating', 'ready', 'approved', 'archived'],
    default: 'draft'
  },
  
  lastUpdated: { type: Date, default: Date.now },
  nextUpdateDue: { type: Date },
  autoUpdate: { type: Boolean, default: false },
  updateFrequency: { type: String, enum: ['daily', 'weekly', 'monthly'] },
  
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },
  
  // Department/Category filter
  department: { type: String },
  category: { type: String },
  
  tags: [{ type: String }],
  notes: { type: String }
}, {
  timestamps: true
});

// Indexes
forecastSchema.index({ name: 1 });
forecastSchema.index({ status: 1 });
forecastSchema.index({ 'timeframe.startDate': 1, 'timeframe.endDate': 1 });
forecastSchema.index({ forecastType: 1 });
forecastSchema.index({ createdBy: 1 });

// Generate predictions using linear regression
forecastSchema.methods.generateLinearPredictions = function(historicalData, periods) {
  if (!historicalData || historicalData.length < 2) return [];
  
  const n = historicalData.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  
  historicalData.forEach((point, i) => {
    sumX += i;
    sumY += point.value;
    sumXY += i * point.value;
    sumX2 += i * i;
  });
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // Calculate standard error for confidence intervals
  let sumSquaredErrors = 0;
  historicalData.forEach((point, i) => {
    const predicted = slope * i + intercept;
    sumSquaredErrors += Math.pow(point.value - predicted, 2);
  });
  const standardError = Math.sqrt(sumSquaredErrors / (n - 2));
  
  const predictions = [];
  const lastDate = new Date(historicalData[n - 1].date);
  
  for (let i = 0; i < periods; i++) {
    const x = n + i;
    const value = slope * x + intercept;
    const confidence = Math.max(60, 95 - (i * 2)); // Decreasing confidence over time
    const margin = standardError * 1.96 * (1 + i * 0.1);
    
    const forecastDate = new Date(lastDate);
    if (this.timeframe.granularity === 'monthly') {
      forecastDate.setMonth(forecastDate.getMonth() + i + 1);
    } else if (this.timeframe.granularity === 'weekly') {
      forecastDate.setDate(forecastDate.getDate() + (i + 1) * 7);
    } else if (this.timeframe.granularity === 'quarterly') {
      forecastDate.setMonth(forecastDate.getMonth() + (i + 1) * 3);
    }
    
    predictions.push({
      date: forecastDate,
      value: Math.max(0, value),
      lowerBound: Math.max(0, value - margin),
      upperBound: value + margin,
      confidence
    });
  }
  
  return predictions;
};

// Generate moving average predictions
forecastSchema.methods.generateMovingAveragePredictions = function(historicalData, periods, windowSize = 3) {
  if (!historicalData || historicalData.length < windowSize) return [];
  
  const predictions = [];
  const lastDate = new Date(historicalData[historicalData.length - 1].date);
  
  // Calculate initial moving average
  const values = historicalData.map(d => d.value);
  let movingAvg = values.slice(-windowSize).reduce((a, b) => a + b, 0) / windowSize;
  
  // Calculate variance for confidence intervals
  const variance = values.slice(-windowSize * 2).reduce((sum, val) => {
    return sum + Math.pow(val - movingAvg, 2);
  }, 0) / Math.min(windowSize * 2, values.length);
  const stdDev = Math.sqrt(variance);
  
  for (let i = 0; i < periods; i++) {
    const forecastDate = new Date(lastDate);
    if (this.timeframe.granularity === 'monthly') {
      forecastDate.setMonth(forecastDate.getMonth() + i + 1);
    } else if (this.timeframe.granularity === 'weekly') {
      forecastDate.setDate(forecastDate.getDate() + (i + 1) * 7);
    }
    
    const confidence = Math.max(50, 90 - (i * 3));
    const margin = stdDev * 1.96 * (1 + i * 0.15);
    
    predictions.push({
      date: forecastDate,
      value: Math.max(0, movingAvg),
      lowerBound: Math.max(0, movingAvg - margin),
      upperBound: movingAvg + margin,
      confidence
    });
  }
  
  return predictions;
};

// Detect trends in data
forecastSchema.methods.analyzeTrends = function(historicalData, metricName) {
  if (!historicalData || historicalData.length < 3) {
    return { metric: metricName, direction: 'stable', strength: 0, insights: ['Insufficient data'] };
  }
  
  const values = historicalData.map(d => d.value);
  const n = values.length;
  
  // Calculate linear regression for trend
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
  values.forEach((y, x) => {
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
    sumY2 += y * y;
  });
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const avgY = sumY / n;
  
  // Calculate R-squared (correlation)
  const ssTotal = sumY2 - (sumY * sumY) / n;
  const ssRes = values.reduce((sum, y, x) => {
    const predicted = slope * x + (sumY - slope * sumX) / n;
    return sum + Math.pow(y - predicted, 2);
  }, 0);
  const rSquared = 1 - (ssRes / ssTotal);
  
  // Determine direction and strength
  const changePercent = (slope / avgY) * 100;
  let direction, strength;
  
  if (Math.abs(changePercent) < 1) {
    direction = 'stable';
    strength = 100 - Math.abs(changePercent) * 10;
  } else if (changePercent > 0) {
    direction = 'increasing';
    strength = Math.min(100, Math.abs(rSquared) * 100);
  } else {
    direction = 'decreasing';
    strength = Math.min(100, Math.abs(rSquared) * 100);
  }
  
  // Check for volatility
  const mean = avgY;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
  const coefficientOfVariation = (Math.sqrt(variance) / mean) * 100;
  
  if (coefficientOfVariation > 25 && Math.abs(rSquared) < 0.5) {
    direction = 'volatile';
  }
  
  // Generate insights
  const insights = [];
  if (direction === 'increasing') {
    insights.push(`${metricName} shows upward trend with ${changePercent.toFixed(1)}% growth rate`);
  } else if (direction === 'decreasing') {
    insights.push(`${metricName} shows downward trend with ${Math.abs(changePercent).toFixed(1)}% decline rate`);
  } else if (direction === 'volatile') {
    insights.push(`${metricName} shows high volatility (CV: ${coefficientOfVariation.toFixed(1)}%)`);
  } else {
    insights.push(`${metricName} remains relatively stable`);
  }
  
  if (rSquared > 0.7) {
    insights.push('Strong predictability - forecast likely to be accurate');
  } else if (rSquared < 0.3) {
    insights.push('Low predictability - forecasts have higher uncertainty');
  }
  
  return {
    metric: metricName,
    direction,
    strength: Math.round(strength),
    slope,
    correlation: rSquared,
    seasonality: { detected: false },
    insights
  };
};

// Detect anomalies
forecastSchema.methods.detectAnomalies = function(historicalData, metricName) {
  if (!historicalData || historicalData.length < 5) return [];
  
  const values = historicalData.map(d => d.value);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const stdDev = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length);
  
  const anomalies = [];
  const threshold = 2; // Standard deviations
  
  historicalData.forEach((point, i) => {
    const deviation = (point.value - mean) / stdDev;
    
    if (Math.abs(deviation) > threshold) {
      const deviationPercent = ((point.value - mean) / mean) * 100;
      
      anomalies.push({
        date: point.date,
        metric: metricName,
        actualValue: point.value,
        expectedValue: mean,
        deviation: deviation,
        deviationPercent: deviationPercent,
        severity: Math.abs(deviation) > 3 ? 'high' : 'medium',
        type: deviation > 0 ? 'spike' : 'drop',
        explanation: `Value ${deviation > 0 ? 'exceeded' : 'fell below'} expected range by ${Math.abs(deviationPercent).toFixed(1)}%`
      });
    }
  });
  
  return anomalies;
};

// Create scenario
forecastSchema.methods.createScenario = function(name, type, adjustmentFactor = 1) {
  const basePredictions = this.predictions;
  
  const adjustPredictions = (predictions) => {
    return predictions.map(p => ({
      date: p.date,
      value: p.value * adjustmentFactor,
      lowerBound: p.lowerBound * adjustmentFactor,
      upperBound: p.upperBound * adjustmentFactor,
      confidence: p.confidence
    }));
  };
  
  const scenarioPredictions = {
    revenue: adjustPredictions(basePredictions.revenue || []),
    expenses: adjustPredictions(basePredictions.expenses || []),
    profit: [],
    cashFlow: adjustPredictions(basePredictions.cashFlow || [])
  };
  
  // Calculate profit from adjusted revenue and expenses
  if (scenarioPredictions.revenue.length && scenarioPredictions.expenses.length) {
    scenarioPredictions.profit = scenarioPredictions.revenue.map((rev, i) => ({
      date: rev.date,
      value: rev.value - (scenarioPredictions.expenses[i]?.value || 0),
      confidence: Math.min(rev.confidence, scenarioPredictions.expenses[i]?.confidence || 100)
    }));
  }
  
  const scenario = {
    name,
    type,
    adjustmentFactor,
    predictions: scenarioPredictions,
    summary: {
      totalRevenue: scenarioPredictions.revenue.reduce((sum, p) => sum + p.value, 0),
      totalExpenses: scenarioPredictions.expenses.reduce((sum, p) => sum + p.value, 0),
      netProfit: scenarioPredictions.profit.reduce((sum, p) => sum + p.value, 0)
    },
    createdAt: new Date()
  };
  
  scenario.summary.profitMargin = scenario.summary.totalRevenue > 0 
    ? (scenario.summary.netProfit / scenario.summary.totalRevenue) * 100 
    : 0;
  
  this.scenarios.push(scenario);
  return scenario;
};

// Calculate summary metrics
forecastSchema.methods.calculateSummary = function() {
  const predictions = this.predictions;
  
  this.summary = {
    forecastedRevenue: (predictions.revenue || []).reduce((sum, p) => sum + p.value, 0),
    forecastedExpenses: (predictions.expenses || []).reduce((sum, p) => sum + p.value, 0),
    forecastedProfit: (predictions.profit || []).reduce((sum, p) => sum + p.value, 0),
    averageConfidence: 0,
    projectedGrowthRate: 0
  };
  
  // Calculate average confidence
  const allConfidences = [
    ...(predictions.revenue || []).map(p => p.confidence),
    ...(predictions.expenses || []).map(p => p.confidence)
  ].filter(c => c != null);
  
  if (allConfidences.length > 0) {
    this.summary.averageConfidence = allConfidences.reduce((a, b) => a + b, 0) / allConfidences.length;
  }
  
  // Calculate profit margin
  if (this.summary.forecastedRevenue > 0) {
    this.summary.profitMargin = (this.summary.forecastedProfit / this.summary.forecastedRevenue) * 100;
  }
  
  return this.summary;
};

// Generate recommendations
forecastSchema.methods.generateRecommendations = function() {
  const recommendations = [];
  const summary = this.summary;
  const trends = this.trends || [];
  
  // Profit margin recommendation
  const profitMargin = summary.profitMargin || 0;
  if (profitMargin < 10) {
    recommendations.push({
      type: 'risk',
      priority: 'high',
      title: 'Low Profit Margin Projected',
      description: `Forecasted profit margin of ${profitMargin.toFixed(1)}% is below healthy threshold`,
      impact: 'May affect sustainability and growth',
      suggestedAction: 'Review pricing strategy and cost reduction opportunities',
      relatedMetric: 'profit'
    });
  } else if (profitMargin > 25) {
    recommendations.push({
      type: 'opportunity',
      priority: 'medium',
      title: 'Strong Profit Margin',
      description: `Healthy profit margin of ${profitMargin.toFixed(1)}% projected`,
      impact: 'Opportunity for reinvestment',
      suggestedAction: 'Consider strategic investments or expansion',
      relatedMetric: 'profit'
    });
  }
  
  // Trend-based recommendations
  trends.forEach(trend => {
    if (trend.direction === 'decreasing' && trend.metric === 'revenue') {
      recommendations.push({
        type: 'risk',
        priority: 'critical',
        title: 'Declining Revenue Trend',
        description: 'Revenue shows consistent downward trend',
        impact: 'May affect cash flow and operations',
        suggestedAction: 'Investigate causes and implement revenue growth strategies',
        relatedMetric: 'revenue'
      });
    }
    
    if (trend.direction === 'increasing' && trend.metric === 'expenses') {
      recommendations.push({
        type: 'action',
        priority: 'high',
        title: 'Rising Expense Trend',
        description: 'Expenses showing upward trajectory',
        impact: 'May compress profit margins',
        suggestedAction: 'Review expense categories for optimization opportunities',
        relatedMetric: 'expenses'
      });
    }
  });
  
  // Confidence-based recommendations
  if (summary.averageConfidence < 70) {
    recommendations.push({
      type: 'insight',
      priority: 'medium',
      title: 'Forecast Uncertainty',
      description: `Average confidence of ${summary.averageConfidence?.toFixed(0)}% indicates higher uncertainty`,
      impact: 'Forecasts may vary significantly from actuals',
      suggestedAction: 'Plan for multiple scenarios and maintain reserves',
      relatedMetric: 'confidence'
    });
  }
  
  this.recommendations = recommendations;
  return recommendations;
};

// Static: Get forecasts summary
forecastSchema.statics.getForecastsSummary = async function(filters = {}) {
  const match = { status: { $ne: 'archived' }, ...filters };
  
  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$forecastType',
        count: { $sum: 1 },
        avgConfidence: { $avg: '$summary.averageConfidence' },
        totalForecastedRevenue: { $sum: '$summary.forecastedRevenue' }
      }
    }
  ]);
};

const Forecast = mongoose.model('Forecast', forecastSchema);

module.exports = Forecast;
