const Budget = require("../../models/finance/budget");
const mongoose = require("mongoose");

// @desc    Get all budgets
// @route   GET /api/finance/budgets
// @access  Private
exports.getBudgets = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      fiscalYear,
      budgetType,
      period,
      owner
    } = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const filterConditions = {};
    
    if (status) filterConditions.status = status;
    if (fiscalYear) filterConditions.fiscalYear = parseInt(fiscalYear);
    if (budgetType) filterConditions.budgetType = budgetType;
    if (period) filterConditions.period = period;
    if (owner) filterConditions.owner = owner;

    const budgets = await Budget.find(filterConditions)
      .populate('owner', 'username email')
      .populate('createdBy', 'username email')
      .populate('approvedBy', 'username email')
      .sort({ fiscalYear: -1, startDate: -1 })
      .skip(skip)
      .limit(limitNumber);

    const totalBudgets = await Budget.countDocuments(filterConditions);
    const totalPages = Math.ceil(totalBudgets / limitNumber);

    res.json({
      success: true,
      budgets,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalBudgets,
        limit: limitNumber
      }
    });
  } catch (error) {
    console.error("Error getting budgets:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error",
      error: error.message 
    });
  }
};

// @desc    Get single budget by ID
// @route   GET /api/finance/budgets/:id
// @access  Private
exports.getBudgetById = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id)
      .populate('owner', 'username email')
      .populate('createdBy', 'username email')
      .populate('approvedBy', 'username email')
      .populate('lineItems.account', 'accountName accountCode');

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found"
      });
    }

    res.json({
      success: true,
      budget
    });
  } catch (error) {
    console.error("Error getting budget:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// @desc    Create new budget
// @route   POST /api/finance/budgets
// @access  Private
exports.createBudget = async (req, res) => {
  try {
    const budgetData = {
      ...req.body,
      createdBy: req.user._id,
      owner: req.body.owner || req.user._id
    };

    // Validate date range
    if (new Date(budgetData.startDate) >= new Date(budgetData.endDate)) {
      return res.status(400).json({
        success: false,
        message: "End date must be after start date"
      });
    }

    // Default alerts if not provided
    if (!budgetData.alerts || budgetData.alerts.length === 0) {
      budgetData.alerts = [
        { threshold: 80 },
        { threshold: 90 },
        { threshold: 100 }
      ];
    }

    const budget = new Budget(budgetData);
    await budget.save();

    await budget.populate('owner createdBy lineItems.account');

    res.status(201).json({
      success: true,
      message: "Budget created successfully",
      budget
    });
  } catch (error) {
    console.error("Error creating budget:", error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Budget with this name already exists"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// @desc    Update budget
// @route   PUT /api/finance/budgets/:id
// @access  Private
exports.updateBudget = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found"
      });
    }

    // Prevent updating closed or archived budgets
    if (budget.status === 'closed' || budget.status === 'archived') {
      return res.status(400).json({
        success: false,
        message: `Cannot update ${budget.status} budget`
      });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (key !== 'createdBy' && key !== '_id') {
        budget[key] = req.body[key];
      }
    });

    await budget.save();
    await budget.populate('owner createdBy approvedBy lineItems.account');

    res.json({
      success: true,
      message: "Budget updated successfully",
      budget
    });
  } catch (error) {
    console.error("Error updating budget:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// @desc    Delete budget
// @route   DELETE /api/finance/budgets/:id
// @access  Private
exports.deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found"
      });
    }

    // Only allow deletion of draft budgets
    if (budget.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: "Only draft budgets can be deleted. Archive this budget instead."
      });
    }

    await budget.deleteOne();

    res.json({
      success: true,
      message: "Budget deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting budget:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// @desc    Approve budget
// @route   POST /api/finance/budgets/:id/approve
// @access  Private (Admin)
exports.approveBudget = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found"
      });
    }

    if (budget.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: "Only draft budgets can be approved"
      });
    }

    budget.status = 'active';
    budget.approvedBy = req.user._id;
    budget.approvedAt = new Date();

    await budget.save();
    await budget.populate('owner createdBy approvedBy');

    res.json({
      success: true,
      message: "Budget approved successfully",
      budget
    });
  } catch (error) {
    console.error("Error approving budget:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// @desc    Update actual amounts from transactions
// @route   POST /api/finance/budgets/:id/update-actuals
// @access  Private
exports.updateActuals = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found"
      });
    }

    await budget.updateActuals();
    
    // Check for triggered alerts
    const triggeredAlerts = budget.checkAlerts();
    await budget.save();

    res.json({
      success: true,
      message: "Actuals updated successfully",
      budget,
      triggeredAlerts: triggeredAlerts.length > 0 ? triggeredAlerts : undefined
    });
  } catch (error) {
    console.error("Error updating actuals:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// @desc    Get budget analysis
// @route   GET /api/finance/budgets/:id/analysis
// @access  Private
exports.getBudgetAnalysis = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id)
      .populate('lineItems.account', 'accountName accountCode');

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found"
      });
    }

    // Category analysis
    const categoryAnalysis = {};
    budget.lineItems.forEach(item => {
      if (!categoryAnalysis[item.category]) {
        categoryAnalysis[item.category] = {
          budgeted: 0,
          actual: 0,
          variance: 0,
          count: 0
        };
      }
      categoryAnalysis[item.category].budgeted += item.budgetedAmount;
      categoryAnalysis[item.category].actual += item.actualAmount;
      categoryAnalysis[item.category].variance += item.variance;
      categoryAnalysis[item.category].count += 1;
    });

    // Top overages
    const overages = budget.lineItems
      .filter(item => item.actualAmount > item.budgetedAmount)
      .sort((a, b) => (b.actualAmount - b.budgetedAmount) - (a.actualAmount - a.budgetedAmount))
      .slice(0, 5);

    // Top savings
    const savings = budget.lineItems
      .filter(item => item.actualAmount < item.budgetedAmount)
      .sort((a, b) => (b.budgetedAmount - b.actualAmount) - (a.budgetedAmount - a.actualAmount))
      .slice(0, 5);

    // Health metrics
    const healthMetrics = {
      status: budget.healthStatus,
      utilizationPercentage: budget.utilizationPercentage,
      remainingBudget: budget.totalBudgeted - budget.totalActual,
      daysRemaining: Math.ceil((budget.endDate - new Date()) / (1000 * 60 * 60 * 24)),
      burnRate: budget.totalActual / Math.max(1, Math.ceil((new Date() - budget.startDate) / (1000 * 60 * 60 * 24)))
    };

    res.json({
      success: true,
      analysis: {
        overview: {
          totalBudgeted: budget.totalBudgeted,
          totalActual: budget.totalActual,
          totalVariance: budget.totalVariance,
          utilizationPercentage: budget.utilizationPercentage
        },
        categoryAnalysis,
        topOverages: overages,
        topSavings: savings,
        healthMetrics,
        alerts: budget.alerts.filter(a => a.triggered)
      }
    });
  } catch (error) {
    console.error("Error getting budget analysis:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// @desc    Duplicate budget for next period
// @route   POST /api/finance/budgets/:id/duplicate
// @access  Private
exports.duplicateBudget = async (req, res) => {
  try {
    const originalBudget = await Budget.findById(req.params.id);

    if (!originalBudget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found"
      });
    }

    const newBudget = originalBudget.duplicateForNextPeriod();
    
    // Override with any provided data
    if (req.body.name) newBudget.name = req.body.name;
    if (req.body.startDate) newBudget.startDate = req.body.startDate;
    if (req.body.endDate) newBudget.endDate = req.body.endDate;
    if (req.body.fiscalYear) newBudget.fiscalYear = req.body.fiscalYear;

    await newBudget.save();
    await newBudget.populate('owner createdBy lineItems.account');

    res.status(201).json({
      success: true,
      message: "Budget duplicated successfully",
      budget: newBudget
    });
  } catch (error) {
    console.error("Error duplicating budget:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// @desc    Get budget comparison
// @route   GET /api/finance/budgets/compare
// @access  Private
exports.compareBudgets = async (req, res) => {
  try {
    const { budgetIds } = req.query;

    if (!budgetIds || !Array.isArray(budgetIds)) {
      return res.status(400).json({
        success: false,
        message: "budgetIds array is required"
      });
    }

    const budgets = await Budget.find({
      _id: { $in: budgetIds }
    }).populate('lineItems.account', 'accountName accountCode');

    if (budgets.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No budgets found"
      });
    }

    const comparison = {
      budgets: budgets.map(b => ({
        id: b._id,
        name: b.name,
        fiscalYear: b.fiscalYear,
        period: b.period,
        totalBudgeted: b.totalBudgeted,
        totalActual: b.totalActual,
        utilizationPercentage: b.utilizationPercentage,
        status: b.status
      })),
      categoryComparison: {}
    };

    // Build category comparison
    const allCategories = new Set();
    budgets.forEach(b => {
      b.lineItems.forEach(item => allCategories.add(item.category));
    });

    allCategories.forEach(category => {
      comparison.categoryComparison[category] = budgets.map(b => {
        const items = b.lineItems.filter(item => item.category === category);
        return {
          budgetId: b._id,
          budgetName: b.name,
          budgeted: items.reduce((sum, item) => sum + item.budgetedAmount, 0),
          actual: items.reduce((sum, item) => sum + item.actualAmount, 0)
        };
      });
    });

    res.json({
      success: true,
      comparison
    });
  } catch (error) {
    console.error("Error comparing budgets:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// @desc    Close budget
// @route   POST /api/finance/budgets/:id/close
// @access  Private (Admin)
exports.closeBudget = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found"
      });
    }

    if (budget.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: "Only active budgets can be closed"
      });
    }

    // Update actuals one last time before closing
    await budget.updateActuals();
    
    budget.status = 'closed';
    budget.lastReviewedAt = new Date();
    
    await budget.save();

    res.json({
      success: true,
      message: "Budget closed successfully",
      budget
    });
  } catch (error) {
    console.error("Error closing budget:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};
