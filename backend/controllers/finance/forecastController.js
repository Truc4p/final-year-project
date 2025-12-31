/**
 * Financial Forecasting Controller
 * Handles AI-powered predictions, trend analysis, scenario planning
 */
const Forecast = require('../../models/finance/forecast');
const Invoice = require('../../models/finance/invoice');
const Bill = require('../../models/finance/bill');
const JournalEntry = require('../../models/finance/journalEntry');

// Get all forecasts
exports.getForecasts = async (req, res) => {
  try {
    const { status, forecastType, page = 1, limit = 20, search } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (forecastType) query.forecastType = forecastType;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [forecasts, total] = await Promise.all([
      Forecast.find(query)
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Forecast.countDocuments(query)
    ]);
    
    res.json({
      data: forecasts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get forecasts error:', error);
    res.status(500).json({ message: 'Failed to get forecasts', error: error.message });
  }
};

// Get single forecast
exports.getForecast = async (req, res) => {
  try {
    const forecast = await Forecast.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email');
    
    if (!forecast) {
      return res.status(404).json({ message: 'Forecast not found' });
    }
    
    res.json({ data: forecast });
  } catch (error) {
    console.error('Get forecast error:', error);
    res.status(500).json({ message: 'Failed to get forecast', error: error.message });
  }
};

// Create new forecast
exports.createForecast = async (req, res) => {
  try {
    const {
      name, description, forecastType, timeframe, methodology,
      department, category, autoUpdate, updateFrequency
    } = req.body;
    
    const forecast = new Forecast({
      name,
      description,
      forecastType: forecastType || 'comprehensive',
      timeframe,
      methodology: methodology || { primaryModel: 'linear_regression' },
      department,
      category,
      autoUpdate,
      updateFrequency,
      status: 'draft',
      createdBy: req.user._id
    });
    
    await forecast.save();
    
    res.status(201).json({
      message: 'Forecast created successfully',
      data: forecast
    });
  } catch (error) {
    console.error('Create forecast error:', error);
    res.status(500).json({ message: 'Failed to create forecast', error: error.message });
  }
};

// Update forecast
exports.updateForecast = async (req, res) => {
  try {
    const updates = req.body;
    delete updates.status; // Status changes through specific endpoints
    delete updates.createdBy;
    
    const forecast = await Forecast.findByIdAndUpdate(
      req.params.id,
      { ...updates, lastUpdated: new Date() },
      { new: true }
    );
    
    if (!forecast) {
      return res.status(404).json({ message: 'Forecast not found' });
    }
    
    res.json({
      message: 'Forecast updated successfully',
      data: forecast
    });
  } catch (error) {
    console.error('Update forecast error:', error);
    res.status(500).json({ message: 'Failed to update forecast', error: error.message });
  }
};

// Delete forecast
exports.deleteForecast = async (req, res) => {
  try {
    const forecast = await Forecast.findByIdAndDelete(req.params.id);
    
    if (!forecast) {
      return res.status(404).json({ message: 'Forecast not found' });
    }
    
    res.json({ message: 'Forecast deleted successfully' });
  } catch (error) {
    console.error('Delete forecast error:', error);
    res.status(500).json({ message: 'Failed to delete forecast', error: error.message });
  }
};

// Generate forecast predictions
exports.generatePredictions = async (req, res) => {
  try {
    const forecast = await Forecast.findById(req.params.id);
    if (!forecast) {
      return res.status(404).json({ message: 'Forecast not found' });
    }
    
    forecast.status = 'generating';
    await forecast.save();
    
    // Gather historical data
    const historicalData = await gatherHistoricalData(forecast);
    
    // Calculate number of periods to forecast
    const periods = calculatePeriods(forecast.timeframe);
    
    // Generate predictions based on methodology
    const predictions = {};
    
    if (historicalData.revenue && historicalData.revenue.length > 0) {
      if (forecast.methodology.primaryModel === 'moving_average') {
        predictions.revenue = forecast.generateMovingAveragePredictions(historicalData.revenue, periods);
      } else {
        predictions.revenue = forecast.generateLinearPredictions(historicalData.revenue, periods);
      }
    }
    
    if (historicalData.expenses && historicalData.expenses.length > 0) {
      if (forecast.methodology.primaryModel === 'moving_average') {
        predictions.expenses = forecast.generateMovingAveragePredictions(historicalData.expenses, periods);
      } else {
        predictions.expenses = forecast.generateLinearPredictions(historicalData.expenses, periods);
      }
    }
    
    // Calculate profit predictions
    if (predictions.revenue && predictions.expenses) {
      predictions.profit = predictions.revenue.map((rev, i) => ({
        date: rev.date,
        value: rev.value - (predictions.expenses[i]?.value || 0),
        lowerBound: rev.lowerBound - (predictions.expenses[i]?.upperBound || 0),
        upperBound: rev.upperBound - (predictions.expenses[i]?.lowerBound || 0),
        confidence: Math.min(rev.confidence, predictions.expenses[i]?.confidence || 100)
      }));
    }
    
    // Cash flow estimation
    if (predictions.profit) {
      predictions.cashFlow = predictions.profit.map(p => ({
        date: p.date,
        value: p.value * 0.85, // Simplified cash flow estimate
        lowerBound: p.lowerBound * 0.8,
        upperBound: p.upperBound * 0.9,
        confidence: p.confidence * 0.9
      }));
    }
    
    // Analyze trends
    const trends = [];
    if (historicalData.revenue?.length) {
      trends.push(forecast.analyzeTrends(historicalData.revenue, 'revenue'));
    }
    if (historicalData.expenses?.length) {
      trends.push(forecast.analyzeTrends(historicalData.expenses, 'expenses'));
    }
    
    // Detect anomalies
    const anomalies = [];
    if (historicalData.revenue?.length) {
      anomalies.push(...forecast.detectAnomalies(historicalData.revenue, 'revenue'));
    }
    if (historicalData.expenses?.length) {
      anomalies.push(...forecast.detectAnomalies(historicalData.expenses, 'expenses'));
    }
    
    // Update forecast
    forecast.predictions = predictions;
    forecast.trends = trends;
    forecast.anomalies = anomalies;
    forecast.historicalPeriod = {
      startDate: historicalData.startDate,
      endDate: historicalData.endDate,
      dataPoints: (historicalData.revenue?.length || 0) + (historicalData.expenses?.length || 0)
    };
    
    // Calculate summary
    forecast.calculateSummary();
    
    // Generate recommendations
    forecast.generateRecommendations();
    
    // Create default scenarios
    forecast.scenarios = [];
    forecast.createScenario('Optimistic', 'optimistic', 1.15);
    forecast.createScenario('Most Likely', 'most_likely', 1.0);
    forecast.createScenario('Pessimistic', 'pessimistic', 0.85);
    
    forecast.status = 'ready';
    forecast.lastUpdated = new Date();
    await forecast.save();
    
    res.json({
      message: 'Predictions generated successfully',
      data: forecast
    });
  } catch (error) {
    console.error('Generate predictions error:', error);
    res.status(500).json({ message: 'Failed to generate predictions', error: error.message });
  }
};

// Get trend analysis
exports.getTrendAnalysis = async (req, res) => {
  try {
    const forecast = await Forecast.findById(req.params.id);
    if (!forecast) {
      return res.status(404).json({ message: 'Forecast not found' });
    }
    
    res.json({
      data: {
        trends: forecast.trends,
        anomalies: forecast.anomalies,
        insights: forecast.trends.flatMap(t => t.insights || [])
      }
    });
  } catch (error) {
    console.error('Get trend analysis error:', error);
    res.status(500).json({ message: 'Failed to get trend analysis', error: error.message });
  }
};

// Create scenario
exports.createScenario = async (req, res) => {
  try {
    const { name, type, adjustmentFactor, assumptions, description } = req.body;
    
    const forecast = await Forecast.findById(req.params.id);
    if (!forecast) {
      return res.status(404).json({ message: 'Forecast not found' });
    }
    
    const scenario = forecast.createScenario(name, type || 'custom', adjustmentFactor || 1);
    if (description) scenario.description = description;
    if (assumptions) scenario.assumptions = assumptions;
    
    await forecast.save();
    
    res.json({
      message: 'Scenario created successfully',
      data: scenario
    });
  } catch (error) {
    console.error('Create scenario error:', error);
    res.status(500).json({ message: 'Failed to create scenario', error: error.message });
  }
};

// Get scenarios
exports.getScenarios = async (req, res) => {
  try {
    const forecast = await Forecast.findById(req.params.id);
    if (!forecast) {
      return res.status(404).json({ message: 'Forecast not found' });
    }
    
    res.json({ data: forecast.scenarios });
  } catch (error) {
    console.error('Get scenarios error:', error);
    res.status(500).json({ message: 'Failed to get scenarios', error: error.message });
  }
};

// Compare scenarios
exports.compareScenarios = async (req, res) => {
  try {
    const { scenarioIds } = req.body;
    
    const forecast = await Forecast.findById(req.params.id);
    if (!forecast) {
      return res.status(404).json({ message: 'Forecast not found' });
    }
    
    const scenarios = scenarioIds 
      ? forecast.scenarios.filter(s => scenarioIds.includes(s._id.toString()))
      : forecast.scenarios;
    
    const comparison = scenarios.map(scenario => ({
      id: scenario._id,
      name: scenario.name,
      type: scenario.type,
      metrics: {
        totalRevenue: scenario.summary?.totalRevenue || 0,
        totalExpenses: scenario.summary?.totalExpenses || 0,
        netProfit: scenario.summary?.netProfit || 0,
        profitMargin: scenario.summary?.profitMargin || 0
      }
    }));
    
    // Calculate variance between scenarios
    if (comparison.length >= 2) {
      const baseline = comparison.find(c => c.type === 'most_likely') || comparison[0];
      comparison.forEach(c => {
        c.varianceFromBaseline = {
          revenue: ((c.metrics.totalRevenue - baseline.metrics.totalRevenue) / baseline.metrics.totalRevenue) * 100,
          profit: baseline.metrics.netProfit !== 0 
            ? ((c.metrics.netProfit - baseline.metrics.netProfit) / Math.abs(baseline.metrics.netProfit)) * 100 
            : 0
        };
      });
    }
    
    res.json({ data: comparison });
  } catch (error) {
    console.error('Compare scenarios error:', error);
    res.status(500).json({ message: 'Failed to compare scenarios', error: error.message });
  }
};

// Set KPI targets
exports.setKPITargets = async (req, res) => {
  try {
    const { targets } = req.body;
    
    const forecast = await Forecast.findById(req.params.id);
    if (!forecast) {
      return res.status(404).json({ message: 'Forecast not found' });
    }
    
    // Calculate achievement probability based on forecast
    const enrichedTargets = targets.map(target => {
      let forecastedValue = 0;
      let achievementProbability = 50;
      
      if (target.kpi === 'revenue') {
        forecastedValue = forecast.summary?.forecastedRevenue || 0;
      } else if (target.kpi === 'profit') {
        forecastedValue = forecast.summary?.forecastedProfit || 0;
      } else if (target.kpi === 'profit_margin') {
        forecastedValue = forecast.summary?.profitMargin || 0;
      }
      
      // Calculate probability based on forecast vs target
      if (forecastedValue >= target.targetValue) {
        achievementProbability = Math.min(95, 70 + (forecast.summary?.averageConfidence || 0) * 0.25);
      } else {
        const gap = ((target.targetValue - forecastedValue) / target.targetValue) * 100;
        achievementProbability = Math.max(5, 50 - gap);
      }
      
      return {
        ...target,
        forecastedValue,
        achievementProbability: Math.round(achievementProbability),
        status: achievementProbability >= 70 ? 'on_track' : achievementProbability >= 40 ? 'at_risk' : 'off_track'
      };
    });
    
    forecast.kpiTargets = enrichedTargets;
    await forecast.save();
    
    res.json({
      message: 'KPI targets set successfully',
      data: forecast.kpiTargets
    });
  } catch (error) {
    console.error('Set KPI targets error:', error);
    res.status(500).json({ message: 'Failed to set KPI targets', error: error.message });
  }
};

// Get KPI tracking
exports.getKPITracking = async (req, res) => {
  try {
    const forecast = await Forecast.findById(req.params.id);
    if (!forecast) {
      return res.status(404).json({ message: 'Forecast not found' });
    }
    
    res.json({ data: forecast.kpiTargets });
  } catch (error) {
    console.error('Get KPI tracking error:', error);
    res.status(500).json({ message: 'Failed to get KPI tracking', error: error.message });
  }
};

// Get recommendations
exports.getRecommendations = async (req, res) => {
  try {
    const forecast = await Forecast.findById(req.params.id);
    if (!forecast) {
      return res.status(404).json({ message: 'Forecast not found' });
    }
    
    res.json({ data: forecast.recommendations });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ message: 'Failed to get recommendations', error: error.message });
  }
};

// Approve forecast
exports.approveForecast = async (req, res) => {
  try {
    const forecast = await Forecast.findById(req.params.id);
    if (!forecast) {
      return res.status(404).json({ message: 'Forecast not found' });
    }
    
    if (forecast.status !== 'ready') {
      return res.status(400).json({ message: 'Only ready forecasts can be approved' });
    }
    
    forecast.status = 'approved';
    forecast.approvedBy = req.user._id;
    forecast.approvedAt = new Date();
    await forecast.save();
    
    res.json({
      message: 'Forecast approved successfully',
      data: forecast
    });
  } catch (error) {
    console.error('Approve forecast error:', error);
    res.status(500).json({ message: 'Failed to approve forecast', error: error.message });
  }
};

// Archive forecast
exports.archiveForecast = async (req, res) => {
  try {
    const forecast = await Forecast.findByIdAndUpdate(
      req.params.id,
      { status: 'archived' },
      { new: true }
    );
    
    if (!forecast) {
      return res.status(404).json({ message: 'Forecast not found' });
    }
    
    res.json({
      message: 'Forecast archived successfully',
      data: forecast
    });
  } catch (error) {
    console.error('Archive forecast error:', error);
    res.status(500).json({ message: 'Failed to archive forecast', error: error.message });
  }
};

// Forecasting dashboard
exports.getForecastDashboard = async (req, res) => {
  try {
    const [
      totalForecasts,
      activeForecasts,
      forecastsByType,
      recentForecasts
    ] = await Promise.all([
      Forecast.countDocuments({ status: { $ne: 'archived' } }),
      Forecast.countDocuments({ status: 'ready' }),
      Forecast.aggregate([
        { $match: { status: { $ne: 'archived' } } },
        { $group: { _id: '$forecastType', count: { $sum: 1 } } }
      ]),
      Forecast.find({ status: { $in: ['ready', 'approved'] } })
        .sort({ lastUpdated: -1 })
        .limit(5)
        .select('name forecastType summary status lastUpdated')
    ]);
    
    // Get latest approved forecast summary
    const latestApproved = await Forecast.findOne({ status: 'approved' })
      .sort({ approvedAt: -1 })
      .select('summary recommendations trends');
    
    res.json({
      data: {
        counts: {
          total: totalForecasts,
          active: activeForecasts,
          byType: forecastsByType.reduce((acc, t) => { acc[t._id] = t.count; return acc; }, {})
        },
        recentForecasts,
        latestForecast: latestApproved ? {
          summary: latestApproved.summary,
          topRecommendations: (latestApproved.recommendations || []).slice(0, 3),
          keyTrends: (latestApproved.trends || []).map(t => ({
            metric: t.metric,
            direction: t.direction,
            strength: t.strength
          }))
        } : null
      }
    });
  } catch (error) {
    console.error('Get forecast dashboard error:', error);
    res.status(500).json({ message: 'Failed to get dashboard', error: error.message });
  }
};

// Accuracy tracking - compare forecast vs actuals
exports.trackAccuracy = async (req, res) => {
  try {
    const forecast = await Forecast.findById(req.params.id);
    if (!forecast) {
      return res.status(404).json({ message: 'Forecast not found' });
    }
    
    // Get actual data for completed forecast periods
    const now = new Date();
    const completedPeriods = (forecast.predictions.revenue || []).filter(p => new Date(p.date) < now);
    
    if (completedPeriods.length === 0) {
      return res.json({
        message: 'No completed periods to compare',
        data: { accuracy: null, comparisons: [] }
      });
    }
    
    // Gather actual revenue for those periods
    const actualData = await gatherActualData(
      completedPeriods[0].date,
      completedPeriods[completedPeriods.length - 1].date,
      forecast.timeframe.granularity
    );
    
    // Calculate accuracy
    let totalError = 0;
    let totalActual = 0;
    const comparisons = [];
    
    completedPeriods.forEach((predicted, i) => {
      const actual = actualData.revenue?.[i] || 0;
      const error = Math.abs(predicted.value - actual);
      const errorPercent = actual > 0 ? (error / actual) * 100 : 0;
      
      totalError += error;
      totalActual += actual;
      
      comparisons.push({
        date: predicted.date,
        predicted: predicted.value,
        actual,
        error,
        errorPercent
      });
    });
    
    const accuracy = totalActual > 0 ? 100 - ((totalError / totalActual) * 100) : 0;
    
    // Update forecast accuracy metrics
    forecast.summary.modelAccuracy = Math.max(0, accuracy);
    forecast.summary.meanAbsoluteError = comparisons.length > 0 
      ? comparisons.reduce((sum, c) => sum + c.error, 0) / comparisons.length 
      : 0;
    await forecast.save();
    
    res.json({
      data: {
        accuracy: Math.round(accuracy * 100) / 100,
        meanAbsoluteError: forecast.summary.meanAbsoluteError,
        comparisons
      }
    });
  } catch (error) {
    console.error('Track accuracy error:', error);
    res.status(500).json({ message: 'Failed to track accuracy', error: error.message });
  }
};

// Helper: Gather historical data
async function gatherHistoricalData(forecast) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 1); // Default 1 year history
  
  // Get revenue from invoices
  const invoices = await Invoice.aggregate([
    {
      $match: {
        invoiceDate: { $gte: startDate, $lte: endDate },
        status: { $in: ['paid', 'partially_paid', 'sent'] }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$invoiceDate' },
          month: { $month: '$invoiceDate' }
        },
        total: { $sum: '$total' }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);
  
  // Get expenses from bills
  const bills = await Bill.aggregate([
    {
      $match: {
        billDate: { $gte: startDate, $lte: endDate },
        status: { $in: ['paid', 'partially_paid', 'pending'] }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$billDate' },
          month: { $month: '$billDate' }
        },
        total: { $sum: '$total' }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);
  
  const revenue = invoices.map(i => ({
    date: new Date(i._id.year, i._id.month - 1, 1),
    value: i.total
  }));
  
  const expenses = bills.map(b => ({
    date: new Date(b._id.year, b._id.month - 1, 1),
    value: b.total
  }));
  
  return { revenue, expenses, startDate, endDate };
}

// Helper: Gather actual data for accuracy comparison
async function gatherActualData(startDate, endDate, granularity) {
  const invoices = await Invoice.aggregate([
    {
      $match: {
        invoiceDate: { $gte: new Date(startDate), $lte: new Date(endDate) },
        status: { $in: ['paid', 'partially_paid'] }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$invoiceDate' },
          month: { $month: '$invoiceDate' }
        },
        total: { $sum: '$total' }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);
  
  return {
    revenue: invoices.map(i => i.total)
  };
}

// Helper: Calculate forecast periods
function calculatePeriods(timeframe) {
  const start = new Date(timeframe.startDate);
  const end = new Date(timeframe.endDate);
  const diffMs = end - start;
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  
  switch (timeframe.granularity) {
    case 'daily': return Math.ceil(diffDays);
    case 'weekly': return Math.ceil(diffDays / 7);
    case 'monthly': return Math.ceil(diffDays / 30);
    case 'quarterly': return Math.ceil(diffDays / 90);
    case 'yearly': return Math.ceil(diffDays / 365);
    default: return 12;
  }
}
