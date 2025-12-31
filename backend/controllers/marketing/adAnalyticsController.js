const AdPerformance = require('../../models/marketing/AdPerformance');
const AdCampaign = require('../../models/marketing/AdCampaign');
const AdCreative = require('../../models/marketing/AdCreative');
const AdBudget = require('../../models/marketing/AdBudget');

/**
 * Get campaign performance metrics
 */
exports.getCampaignPerformance = async (req, res) => {
  try {
    const { campaignId, startDate, endDate, groupBy } = req.query;
    
    const match = {};
    
    if (campaignId) {
      match.campaignId = mongoose.Types.ObjectId(campaignId);
    }
    
    if (startDate || endDate) {
      match.date = {};
      if (startDate) match.date.$gte = new Date(startDate);
      if (endDate) match.date.$lte = new Date(endDate);
    }
    
    let groupByField = '$date';
    if (groupBy === 'platform') {
      groupByField = '$platform';
    } else if (groupBy === 'creative') {
      groupByField = '$creativeId';
    }
    
    const performance = await AdPerformance.aggregate([
      { $match: match },
      {
        $group: {
          _id: groupByField,
          totalImpressions: { $sum: '$metrics.impressions' },
          totalClicks: { $sum: '$metrics.clicks' },
          totalConversions: { $sum: '$metrics.conversions' },
          totalSpend: { $sum: '$metrics.spend' },
          totalRevenue: { $sum: '$metrics.revenue' },
          avgCtr: { $avg: '$metrics.ctr' },
          avgCpc: { $avg: '$metrics.cpc' },
          avgCpa: { $avg: '$metrics.cpa' },
          avgRoas: { $avg: '$metrics.roas' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.json({
      success: true,
      performance
    });
  } catch (error) {
    console.error('Get campaign performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch campaign performance',
      error: error.message
    });
  }
};

/**
 * Get creative performance comparison
 */
exports.getCreativePerformance = async (req, res) => {
  try {
    const { campaignId, startDate, endDate } = req.query;
    
    const match = {
      date: {
        $gte: new Date(startDate || Date.now() - 30 * 24 * 60 * 60 * 1000),
        $lte: new Date(endDate || Date.now())
      }
    };
    
    if (campaignId) {
      match.campaignId = mongoose.Types.ObjectId(campaignId);
    }
    
    const creativePerformance = await AdPerformance.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$creativeId',
          impressions: { $sum: '$metrics.impressions' },
          clicks: { $sum: '$metrics.clicks' },
          conversions: { $sum: '$metrics.conversions' },
          spend: { $sum: '$metrics.spend' },
          revenue: { $sum: '$metrics.revenue' },
          ctr: { $avg: '$metrics.ctr' },
          conversionRate: { $avg: '$metrics.conversionRate' },
          roas: { $avg: '$metrics.roas' }
        }
      },
      {
        $lookup: {
          from: 'adcreatives',
          localField: '_id',
          foreignField: '_id',
          as: 'creative'
        }
      },
      { $unwind: '$creative' },
      { $sort: { roas: -1 } }
    ]);
    
    res.json({
      success: true,
      creativePerformance
    });
  } catch (error) {
    console.error('Get creative performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch creative performance',
      error: error.message
    });
  }
};

/**
 * Get ROI analysis
 */
exports.getROIAnalysis = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const match = {
      date: {
        $gte: new Date(startDate || Date.now() - 30 * 24 * 60 * 60 * 1000),
        $lte: new Date(endDate || Date.now())
      }
    };
    
    const analysis = await AdPerformance.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalSpend: { $sum: '$metrics.spend' },
          totalRevenue: { $sum: '$metrics.revenue' },
          totalConversions: { $sum: '$metrics.conversions' },
          totalImpressions: { $sum: '$metrics.impressions' },
          totalClicks: { $sum: '$metrics.clicks' }
        }
      },
      {
        $project: {
          totalSpend: 1,
          totalRevenue: 1,
          totalConversions: 1,
          totalImpressions: 1,
          totalClicks: 1,
          roas: {
            $cond: [
              { $gt: ['$totalSpend', 0] },
              { $multiply: [{ $divide: ['$totalRevenue', '$totalSpend'] }, 100] },
              0
            ]
          },
          roi: {
            $cond: [
              { $gt: ['$totalSpend', 0] },
              { $multiply: [
                { $divide: [
                  { $subtract: ['$totalRevenue', '$totalSpend'] },
                  '$totalSpend'
                ]},
                100
              ]},
              0
            ]
          },
          cpa: {
            $cond: [
              { $gt: ['$totalConversions', 0] },
              { $divide: ['$totalSpend', '$totalConversions'] },
              0
            ]
          },
          ctr: {
            $cond: [
              { $gt: ['$totalImpressions', 0] },
              { $multiply: [{ $divide: ['$totalClicks', '$totalImpressions'] }, 100] },
              0
            ]
          },
          conversionRate: {
            $cond: [
              { $gt: ['$totalClicks', 0] },
              { $multiply: [{ $divide: ['$totalConversions', '$totalClicks'] }, 100] },
              0
            ]
          }
        }
      }
    ]);
    
    // Get top performing campaigns
    const topCampaigns = await AdPerformance.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$campaignId',
          spend: { $sum: '$metrics.spend' },
          revenue: { $sum: '$metrics.revenue' },
          roas: { $avg: '$metrics.roas' },
          conversions: { $sum: '$metrics.conversions' }
        }
      },
      {
        $lookup: {
          from: 'adcampaigns',
          localField: '_id',
          foreignField: '_id',
          as: 'campaign'
        }
      },
      { $unwind: '$campaign' },
      { $sort: { roas: -1 } },
      { $limit: 5 }
    ]);
    
    // Get performance by platform
    const platformPerformance = await AdPerformance.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$platform',
          spend: { $sum: '$metrics.spend' },
          revenue: { $sum: '$metrics.revenue' },
          conversions: { $sum: '$metrics.conversions' },
          impressions: { $sum: '$metrics.impressions' },
          clicks: { $sum: '$metrics.clicks' }
        }
      },
      {
        $project: {
          platform: '$_id',
          spend: 1,
          revenue: 1,
          conversions: 1,
          impressions: 1,
          clicks: 1,
          roas: {
            $cond: [
              { $gt: ['$spend', 0] },
              { $multiply: [{ $divide: ['$revenue', '$spend'] }, 100] },
              0
            ]
          }
        }
      },
      { $sort: { roas: -1 } }
    ]);
    
    res.json({
      success: true,
      analysis: analysis[0] || {},
      topCampaigns,
      platformPerformance
    });
  } catch (error) {
    console.error('Get ROI analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ROI analysis',
      error: error.message
    });
  }
};

/**
 * Get conversion funnel
 */
exports.getConversionFunnel = async (req, res) => {
  try {
    const { campaignId, startDate, endDate } = req.query;
    
    const match = {
      date: {
        $gte: new Date(startDate || Date.now() - 30 * 24 * 60 * 60 * 1000),
        $lte: new Date(endDate || Date.now())
      }
    };
    
    if (campaignId) {
      match.campaignId = mongoose.Types.ObjectId(campaignId);
    }
    
    const funnel = await AdPerformance.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          impressions: { $sum: '$metrics.impressions' },
          clicks: { $sum: '$metrics.clicks' },
          conversions: { $sum: '$metrics.conversions' }
        }
      },
      {
        $project: {
          impressions: 1,
          clicks: 1,
          conversions: 1,
          clickRate: {
            $cond: [
              { $gt: ['$impressions', 0] },
              { $multiply: [{ $divide: ['$clicks', '$impressions'] }, 100] },
              0
            ]
          },
          conversionRate: {
            $cond: [
              { $gt: ['$clicks', 0] },
              { $multiply: [{ $divide: ['$conversions', '$clicks'] }, 100] },
              0
            ]
          },
          overallConversionRate: {
            $cond: [
              { $gt: ['$impressions', 0] },
              { $multiply: [{ $divide: ['$conversions', '$impressions'] }, 100] },
              0
            ]
          }
        }
      }
    ]);
    
    res.json({
      success: true,
      funnel: funnel[0] || {
        impressions: 0,
        clicks: 0,
        conversions: 0,
        clickRate: 0,
        conversionRate: 0,
        overallConversionRate: 0
      }
    });
  } catch (error) {
    console.error('Get conversion funnel error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversion funnel',
      error: error.message
    });
  }
};

/**
 * Get budget utilization
 */
exports.getBudgetUtilization = async (req, res) => {
  try {
    const budgets = await AdBudget.find({ status: { $in: ['active', 'exhausted'] } })
      .populate('campaignId', 'name status')
      .sort({ createdAt: -1 });
    
    const utilization = budgets.map(budget => {
      const utilizationPercentage = (budget.spent / budget.amount) * 100;
      const remainingPercentage = 100 - utilizationPercentage;
      
      return {
        id: budget._id,
        name: budget.name,
        campaign: budget.campaignId?.name,
        budgetType: budget.budgetType,
        amount: budget.amount,
        spent: budget.spent,
        remaining: budget.remaining,
        utilizationPercentage,
        remainingPercentage,
        status: budget.status,
        isOnTrack: utilizationPercentage <= 100,
        daysRemaining: budget.period.endDate 
          ? Math.ceil((budget.period.endDate - new Date()) / (1000 * 60 * 60 * 24))
          : null
      };
    });
    
    // Overall summary
    const summary = {
      totalBudget: budgets.reduce((sum, b) => sum + b.amount, 0),
      totalSpent: budgets.reduce((sum, b) => sum + b.spent, 0),
      totalRemaining: budgets.reduce((sum, b) => sum + b.remaining, 0),
      activeBudgets: budgets.filter(b => b.status === 'active').length,
      exhaustedBudgets: budgets.filter(b => b.status === 'exhausted').length
    };
    
    res.json({
      success: true,
      utilization,
      summary
    });
  } catch (error) {
    console.error('Get budget utilization error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch budget utilization',
      error: error.message
    });
  }
};

/**
 * Get dashboard summary
 */
exports.getDashboardSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateRange = {
      $gte: new Date(startDate || Date.now() - 30 * 24 * 60 * 60 * 1000),
      $lte: new Date(endDate || Date.now())
    };
    
    // Overall metrics
    const metrics = await AdPerformance.aggregate([
      { $match: { date: dateRange } },
      {
        $group: {
          _id: null,
          totalSpend: { $sum: '$metrics.spend' },
          totalRevenue: { $sum: '$metrics.revenue' },
          totalImpressions: { $sum: '$metrics.impressions' },
          totalClicks: { $sum: '$metrics.clicks' },
          totalConversions: { $sum: '$metrics.conversions' },
          avgRoas: { $avg: '$metrics.roas' }
        }
      }
    ]);
    
    // Active campaigns count
    const activeCampaigns = await AdCampaign.countDocuments({ status: 'active' });
    
    // Active audiences count
    const Audience = require('../../models/marketing/Audience');
    const activeAudiences = await Audience.countDocuments({ status: 'active' });
    
    // Top performing campaign
    const topCampaign = await AdPerformance.aggregate([
      { $match: { date: dateRange } },
      {
        $group: {
          _id: '$campaignId',
          roas: { $avg: '$metrics.roas' },
          conversions: { $sum: '$metrics.conversions' }
        }
      },
      { $sort: { roas: -1 } },
      { $limit: 1 },
      {
        $lookup: {
          from: 'adcampaigns',
          localField: '_id',
          foreignField: '_id',
          as: 'campaign'
        }
      },
      { $unwind: '$campaign' }
    ]);
    
    res.json({
      success: true,
      summary: {
        metrics: metrics[0] || {
          totalSpend: 0,
          totalRevenue: 0,
          totalImpressions: 0,
          totalClicks: 0,
          totalConversions: 0,
          avgRoas: 0
        },
        activeCampaigns,
        activeAudiences,
        topCampaign: topCampaign[0] || null
      }
    });
  } catch (error) {
    console.error('Get dashboard summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard summary',
      error: error.message
    });
  }
};

module.exports = exports;
