const EmailCampaign = require('../models/emailCampaign');
const EmailTemplate = require('../models/emailTemplate');
const EmailAnalytics = require('../models/emailAnalytics');
const NewsletterSubscription = require('../models/newsletterSubscription');

// Get all email campaigns with pagination and filters
const getCampaigns = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      type, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const query = {};
    
    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Filter by type
    if (type && type !== 'all') {
      query.type = type;
    }
    
    // Search by name or subject
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }
    
    const sortDirection = sortOrder === 'desc' ? -1 : 1;
    const sort = { [sortBy]: sortDirection };
    
    const campaigns = await EmailCampaign.find(query)
      .populate('createdBy', 'username email')
      .populate('templateId', 'name category')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-content -htmlContent'); // Exclude large content fields for list view
    
    const total = await EmailCampaign.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: {
        campaigns,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Get campaigns error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch campaigns'
    });
  }
};

// Get single campaign by ID
const getCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    
    const campaign = await EmailCampaign.findById(id)
      .populate('createdBy', 'username email')
      .populate('templateId', 'name category variables styles');
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: campaign
    });
    
  } catch (error) {
    console.error('Get campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch campaign'
    });
  }
};

// Create new email campaign
const createCampaign = async (req, res) => {
  try {
    const campaignData = {
      ...req.body,
      createdBy: req.user.id
    };
    
    const campaign = new EmailCampaign(campaignData);
    await campaign.save();
    
    await campaign.populate('createdBy', 'username email');
    
    res.status(201).json({
      success: true,
      message: 'Campaign created successfully',
      data: campaign
    });
    
  } catch (error) {
    console.error('Create campaign error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(e => e.message)
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create campaign'
    });
  }
};

// Update email campaign
const updateCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Prevent updating certain fields if campaign is already sent
    const existingCampaign = await EmailCampaign.findById(id);
    if (!existingCampaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }
    
    if (existingCampaign.status === 'sent') {
      // Only allow updating certain fields for sent campaigns
      const allowedFields = ['name'];
      Object.keys(updateData).forEach(key => {
        if (!allowedFields.includes(key)) {
          delete updateData[key];
        }
      });
    }
    
    const campaign = await EmailCampaign.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    ).populate('createdBy', 'username email');
    
    res.status(200).json({
      success: true,
      message: 'Campaign updated successfully',
      data: campaign
    });
    
  } catch (error) {
    console.error('Update campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update campaign'
    });
  }
};

// Delete email campaign
const deleteCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    
    const campaign = await EmailCampaign.findById(id);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }
    
    // Prevent deletion of sent campaigns (optional business rule)
    if (campaign.status === 'sent') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete sent campaigns'
      });
    }
    
    await EmailCampaign.findByIdAndDelete(id);
    
    // Also delete related analytics
    await EmailAnalytics.deleteMany({ campaignId: id });
    
    res.status(200).json({
      success: true,
      message: 'Campaign deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete campaign'
    });
  }
};

// Get campaign analytics
const getCampaignAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    
    const campaign = await EmailCampaign.findById(id);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }
    
    // Get detailed analytics
    const analytics = await EmailAnalytics.find({ campaignId: id })
      .sort({ sentAt: -1 });
    
    // Get summary stats
    const summaryStats = await EmailAnalytics.getCampaignSummary(id);
    
    // Get engagement over time
    const engagementOverTime = await EmailAnalytics.getEngagementOverTime(id);
    
    // Calculate derived metrics
    const totalSent = analytics.length;
    const delivered = analytics.filter(a => a.status !== 'bounced').length;
    const opened = analytics.filter(a => a.opens.length > 0).length;
    const clicked = analytics.filter(a => a.clicks.length > 0).length;
    const unsubscribed = analytics.filter(a => a.unsubscribedAt).length;
    
    const metrics = {
      totalSent,
      delivered,
      opened,
      clicked,
      unsubscribed,
      openRate: delivered > 0 ? ((opened / delivered) * 100).toFixed(2) : 0,
      clickRate: delivered > 0 ? ((clicked / delivered) * 100).toFixed(2) : 0,
      unsubscribeRate: delivered > 0 ? ((unsubscribed / delivered) * 100).toFixed(2) : 0,
      deliveryRate: totalSent > 0 ? ((delivered / totalSent) * 100).toFixed(2) : 0
    };
    
    res.status(200).json({
      success: true,
      data: {
        campaign: {
          id: campaign._id,
          name: campaign.name,
          subject: campaign.subject,
          status: campaign.status,
          sentAt: campaign.sentAt
        },
        metrics,
        engagementOverTime,
        recentActivity: analytics.slice(0, 50) // Last 50 activities
      }
    });
    
  } catch (error) {
    console.error('Get campaign analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch campaign analytics'
    });
  }
};

// Get campaign preview with targeted subscribers
const getCampaignPreview = async (req, res) => {
  try {
    const { id } = req.params;
    
    const campaign = await EmailCampaign.findById(id)
      .populate('templateId');
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }
    
    // Get targeted subscribers
    const targetedSubscribers = await campaign.getTargetedSubscribers();
    
    res.status(200).json({
      success: true,
      data: {
        campaign,
        targetedSubscribers: {
          count: targetedSubscribers.length,
          subscribers: targetedSubscribers.slice(0, 10) // Show first 10 for preview
        }
      }
    });
    
  } catch (error) {
    console.error('Get campaign preview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate campaign preview'
    });
  }
};

// Get campaign statistics overview
const getCampaignStats = async (req, res) => {
  try {
    const stats = await EmailCampaign.getCampaignStats();
    
    // Get recent campaigns
    const recentCampaigns = await EmailCampaign.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('createdBy', 'username')
      .select('name status createdAt analytics');
    
    // Get top performing campaigns
    const topCampaigns = await EmailCampaign.find({ status: 'sent' })
      .sort({ 'analytics.emailsOpened': -1 })
      .limit(5)
      .select('name analytics');
    
    res.status(200).json({
      success: true,
      data: {
        overview: stats[0] || {
          totalCampaigns: 0,
          draftCampaigns: 0,
          sentCampaigns: 0,
          totalEmailsSent: 0,
          totalOpens: 0,
          totalClicks: 0,
          totalUnsubscribes: 0
        },
        recentCampaigns,
        topCampaigns
      }
    });
    
  } catch (error) {
    console.error('Get campaign stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch campaign statistics'
    });
  }
};

module.exports = {
  getCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  getCampaignAnalytics,
  getCampaignPreview,
  getCampaignStats
};