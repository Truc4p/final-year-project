const AdCampaign = require('../../models/marketing/AdCampaign');
const AdCreative = require('../../models/marketing/AdCreative');
const AdBudget = require('../../models/marketing/AdBudget');
const AdPlatformConnection = require('../../models/marketing/AdPlatformConnection');
const Audience = require('../../models/marketing/Audience');
const GoogleAdsService = require('../../services/googleAdsService');
const FacebookAdsService = require('../../services/facebookAdsService');

/**
 * Get all ad campaigns
 */
exports.getCampaigns = async (req, res) => {
  try {
    console.log('📋 Fetching campaigns with filters:', req.query);
    
    const { status, platform, objective } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (objective) filter.objective = objective;
    if (platform) {
      filter['platforms.platform'] = platform;
    }
    
    console.log('🔍 Query filter:', filter);
    
    const campaigns = await AdCampaign.find(filter)
      .populate('targetAudiences')
      .populate('budget')
      .populate('creatives')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    console.log('✅ Found campaigns:', campaigns.length);
    if (campaigns.length > 0) {
      console.log('📝 First campaign:', {
        id: campaigns[0]._id,
        name: campaigns[0].name,
        status: campaigns[0].status,
        budget: campaigns[0].budget
      });
    }
    
    res.json({
      success: true,
      campaigns
    });
  } catch (error) {
    console.error('Get campaigns error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch campaigns',
      error: error.message
    });
  }
};

/**
 * Get single campaign
 */
exports.getCampaign = async (req, res) => {
  try {
    const campaign = await AdCampaign.findById(req.params.id)
      .populate('targetAudiences')
      .populate('budget')
      .populate('creatives')
      .populate('createdBy', 'name email');
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }
    
    res.json({
      success: true,
      campaign
    });
  } catch (error) {
    console.error('Get campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch campaign',
      error: error.message
    });
  }
};

/**
 * Create ad campaign
 */
exports.createCampaign = async (req, res) => {
  try {
    console.log('📝 Creating campaign with data:', JSON.stringify(req.body, null, 2));
    console.log('👤 User from token:', req.user);
    
    const campaignData = {
      ...req.body,
      createdBy: req.user._id || req.user.id // Support both _id and id
    };
    
    // Create budget first
    if (req.body.budgetData) {
      console.log('💰 Creating budget:', req.body.budgetData);
      const budget = await AdBudget.create({
        ...req.body.budgetData,
        createdBy: req.user._id
      });
      console.log('✅ Budget created with ID:', budget._id);
      campaignData.budget = budget._id;
    }
    
    console.log('📋 Creating campaign with data:', campaignData);
    const campaign = await AdCampaign.create(campaignData);
    console.log('✅ Campaign created with ID:', campaign._id);
    
    // If platforms are specified, try to create on those platforms (skip if no connection)
    if (req.body.platforms && req.body.platforms.length > 0) {
      console.log('🔗 Attempting to create campaign on platforms:', req.body.platforms);
      for (const platformConfig of req.body.platforms) {
        try {
          await exports.createCampaignOnPlatform(campaign, platformConfig.platform);
          console.log('✅ Campaign created on platform:', platformConfig.platform);
        } catch (platformError) {
          console.log('⚠️ Could not create campaign on platform:', platformConfig.platform, '-', platformError.message);
          // Continue even if platform creation fails
        }
      }
    }
    
    await campaign.populate('targetAudiences budget creatives');
    
    res.status(201).json({
      success: true,
      message: 'Campaign created successfully',
      campaign
    });
  } catch (error) {
    console.error('Create campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create campaign',
      error: error.message
    });
  }
};

/**
 * Update campaign
 */
exports.updateCampaign = async (req, res) => {
  try {
    const campaign = await AdCampaign.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('targetAudiences budget creatives');
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }
    
    // Sync changes to platforms if needed
    if (req.body.syncToPlatforms) {
      for (const platformConfig of campaign.platforms) {
        // Platform sync logic here
      }
    }
    
    res.json({
      success: true,
      message: 'Campaign updated successfully',
      campaign
    });
  } catch (error) {
    console.error('Update campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update campaign',
      error: error.message
    });
  }
};

/**
 * Delete campaign
 */
exports.deleteCampaign = async (req, res) => {
  try {
    const campaign = await AdCampaign.findByIdAndDelete(req.params.id);
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Campaign deleted successfully'
    });
  } catch (error) {
    console.error('Delete campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete campaign',
      error: error.message
    });
  }
};

/**
 * Create campaign on ad platform
 */
exports.createCampaignOnPlatform = async (campaign, platform) => {
  const connection = await AdPlatformConnection.findOne({
    platform,
    status: 'connected'
  });
  
  if (!connection) {
    throw new Error(`No active connection for ${platform}`);
  }
  
  let platformCampaignId;
  
  if (platform === 'google_ads') {
    const service = new GoogleAdsService(connection);
    const result = await service.createCampaign(campaign);
    platformCampaignId = result.resourceName.split('/').pop();
  } else if (platform === 'facebook_ads') {
    const service = new FacebookAdsService(connection);
    const result = await service.createCampaign(campaign);
    platformCampaignId = result.id;
  }
  
  // Update campaign with platform info
  campaign.platforms.push({
    platform,
    campaignId: platformCampaignId,
    status: 'active',
    lastSyncedAt: new Date()
  });
  
  await campaign.save();
  
  return platformCampaignId;
};

/**
 * Get campaign performance
 */
exports.getCampaignPerformance = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const campaign = await AdCampaign.findById(req.params.id);
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }
    
    const AdPerformance = require('../../models/marketing/AdPerformance');
    
    const performance = await AdPerformance.aggregateByDateRange(
      campaign._id,
      new Date(startDate),
      new Date(endDate)
    );
    
    res.json({
      success: true,
      campaign: {
        id: campaign._id,
        name: campaign.name
      },
      performance: performance[0] || {},
      currentMetrics: campaign.performance
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
 * Pause/Resume campaign
 */
exports.toggleCampaignStatus = async (req, res) => {
  try {
    const campaign = await AdCampaign.findById(req.params.id);
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }
    
    const newStatus = campaign.status === 'active' ? 'paused' : 'active';
    campaign.status = newStatus;
    await campaign.save();
    
    res.json({
      success: true,
      message: `Campaign ${newStatus}`,
      campaign
    });
  } catch (error) {
    console.error('Toggle campaign status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle campaign status',
      error: error.message
    });
  }
};

/**
 * Get all ad creatives
 */
exports.getCreatives = async (req, res) => {
  try {
    const { type, status } = req.query;
    const filter = {};
    
    if (type) filter.type = type;
    if (status) filter.status = status;
    
    const creatives = await AdCreative.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      creatives
    });
  } catch (error) {
    console.error('Get creatives error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch creatives',
      error: error.message
    });
  }
};

/**
 * Create ad creative
 */
exports.createCreative = async (req, res) => {
  try {
    const creative = await AdCreative.create({
      ...req.body,
      createdBy: req.user._id
    });
    
    res.status(201).json({
      success: true,
      message: 'Creative created successfully',
      creative
    });
  } catch (error) {
    console.error('Create creative error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create creative',
      error: error.message
    });
  }
};

/**
 * Update ad creative
 */
exports.updateCreative = async (req, res) => {
  try {
    const creative = await AdCreative.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!creative) {
      return res.status(404).json({
        success: false,
        message: 'Creative not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Creative updated successfully',
      creative
    });
  } catch (error) {
    console.error('Update creative error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update creative',
      error: error.message
    });
  }
};

/**
 * Delete ad creative
 */
exports.deleteCreative = async (req, res) => {
  try {
    const creative = await AdCreative.findByIdAndDelete(req.params.id);
    
    if (!creative) {
      return res.status(404).json({
        success: false,
        message: 'Creative not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Creative deleted successfully'
    });
  } catch (error) {
    console.error('Delete creative error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete creative',
      error: error.message
    });
  }
};

/**
 * Get all budgets
 */
exports.getBudgets = async (req, res) => {
  try {
    const budgets = await AdBudget.find()
      .populate('campaignId', 'name status')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      budgets
    });
  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch budgets',
      error: error.message
    });
  }
};

/**
 * Create budget
 */
exports.createBudget = async (req, res) => {
  try {
    const budget = await AdBudget.create({
      ...req.body,
      createdBy: req.user._id
    });
    
    res.status(201).json({
      success: true,
      message: 'Budget created successfully',
      budget
    });
  } catch (error) {
    console.error('Create budget error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create budget',
      error: error.message
    });
  }
};

/**
 * Update budget
 */
exports.updateBudget = async (req, res) => {
  try {
    const budget = await AdBudget.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }
    
    // Check thresholds after update
    const alerts = budget.checkThresholds();
    
    res.json({
      success: true,
      message: 'Budget updated successfully',
      budget,
      alerts
    });
  } catch (error) {
    console.error('Update budget error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update budget',
      error: error.message
    });
  }
};

/**
 * Record spend
 */
exports.recordSpend = async (req, res) => {
  try {
    const { amount, platform, campaignId } = req.body;
    const budget = await AdBudget.findById(req.params.id);
    
    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }
    
    const alerts = budget.recordSpend(amount, platform, campaignId);
    await budget.save();
    
    res.json({
      success: true,
      message: 'Spend recorded successfully',
      budget,
      alerts
    });
  } catch (error) {
    console.error('Record spend error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record spend',
      error: error.message
    });
  }
};

module.exports = exports;
