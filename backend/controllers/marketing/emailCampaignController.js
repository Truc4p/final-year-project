const EmailCampaign = require('../../models/marketing/emailCampaign');
const EmailTemplate = require('../../models/marketing/emailTemplate');
const EmailAnalytics = require('../../models/marketing/emailAnalytics');
const NewsletterSubscription = require('../../models/marketing/newsletterSubscription');

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

// Get general email marketing analytics
const getAnalytics = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - parseInt(days));

    // Get campaigns within date range
    const campaigns = await EmailCampaign.find({
      createdAt: { $gte: dateFrom },
      status: { $in: ['sent', 'scheduled'] }
    }).populate('createdBy', 'username');

    // Calculate aggregate analytics
    const totalCampaigns = campaigns.length;
    const totalEmailsSent = campaigns.reduce((sum, campaign) => sum + (campaign.analytics?.emailsSent || 0), 0);
    const totalOpened = campaigns.reduce((sum, campaign) => sum + (campaign.analytics?.emailsOpened || 0), 0);
    const totalClicked = campaigns.reduce((sum, campaign) => sum + (campaign.analytics?.emailsClicked || 0), 0);
    const totalUnsubscribed = campaigns.reduce((sum, campaign) => sum + (campaign.analytics?.unsubscribed || 0), 0);

    const averageOpenRate = totalEmailsSent > 0 ? (totalOpened / totalEmailsSent) * 100 : 0;
    const averageClickRate = totalEmailsSent > 0 ? (totalClicked / totalEmailsSent) * 100 : 0;
    const averageUnsubscribeRate = totalEmailsSent > 0 ? (totalUnsubscribed / totalEmailsSent) * 100 : 0;

    // Get previous period for comparison
    const prevDateFrom = new Date(dateFrom);
    prevDateFrom.setDate(prevDateFrom.getDate() - parseInt(days));
    
    const prevCampaigns = await EmailCampaign.find({
      createdAt: { $gte: prevDateFrom, $lt: dateFrom },
      status: { $in: ['sent', 'scheduled'] }
    });

    const prevTotalCampaigns = prevCampaigns.length;
    const prevTotalEmailsSent = prevCampaigns.reduce((sum, campaign) => sum + (campaign.analytics?.emailsSent || 0), 0);

    // Calculate changes
    const campaignChange = prevTotalCampaigns > 0 ? ((totalCampaigns - prevTotalCampaigns) / prevTotalCampaigns) * 100 : 0;
    const emailsSentChange = prevTotalEmailsSent > 0 ? ((totalEmailsSent - prevTotalEmailsSent) / prevTotalEmailsSent) * 100 : 0;

    // Generate campaign trends (mock data for now)
    const campaignTrends = [];
    for (let i = parseInt(days) - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      campaignTrends.push({
        date: date.toISOString().split('T')[0],
        openRate: Math.random() * 30 + 10, // Mock data
        clickRate: Math.random() * 10 + 2   // Mock data
      });
    }

    // Get subscriber growth (mock data)
    const subscriberGrowth = [];
    for (let i = parseInt(days) - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      subscriberGrowth.push({
        date: date.toISOString().split('T')[0],
        count: Math.floor(Math.random() * 50) + 100 // Mock data
      });
    }

    res.status(200).json({
      success: true,
      analytics: {
        totalCampaigns,
        totalEmailsSent,
        averageOpenRate: Math.round(averageOpenRate * 100) / 100,
        averageClickRate: Math.round(averageClickRate * 100) / 100,
        averageUnsubscribeRate: Math.round(averageUnsubscribeRate * 100) / 100,
        campaignChange: Math.round(campaignChange * 100) / 100,
        emailsSentChange: Math.round(emailsSentChange * 100) / 100,
        openRateChange: 0, // Would need historical data
        clickRateChange: 0  // Would need historical data
      },
      campaignTrends,
      subscriberGrowth,
      recentCampaigns: campaigns.slice(0, 10).map(campaign => ({
        _id: campaign._id,
        subject: campaign.subject,
        status: campaign.status,
        createdAt: campaign.createdAt,
        analytics: campaign.analytics
      })),
      subscriberStats: {
        total: 0, // Would need to implement
        newSubscribers: 0,
        unsubscribed: totalUnsubscribed,
        totalChange: 0,
        newChange: 0,
        unsubscribedChange: 0
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics'
    });
  }
};

// Export analytics data as CSV
const exportAnalytics = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - parseInt(days));

    const campaigns = await EmailCampaign.find({
      createdAt: { $gte: dateFrom },
      status: { $in: ['sent', 'scheduled'] }
    }).populate('createdBy', 'username');

    // Create CSV content
    const csvHeader = 'Campaign Name,Subject,Status,Created Date,Emails Sent,Emails Opened,Emails Clicked,Open Rate,Click Rate,Created By\n';
    const csvRows = campaigns.map(campaign => {
      const openRate = campaign.analytics?.emailsSent > 0 ? 
        ((campaign.analytics.emailsOpened || 0) / campaign.analytics.emailsSent * 100).toFixed(2) : '0.00';
      const clickRate = campaign.analytics?.emailsSent > 0 ? 
        ((campaign.analytics.emailsClicked || 0) / campaign.analytics.emailsSent * 100).toFixed(2) : '0.00';
      
      return [
        `"${campaign.name || ''}"`,
        `"${campaign.subject || ''}"`,
        campaign.status,
        campaign.createdAt.toISOString().split('T')[0],
        campaign.analytics?.emailsSent || 0,
        campaign.analytics?.emailsOpened || 0,
        campaign.analytics?.emailsClicked || 0,
        openRate + '%',
        clickRate + '%',
        `"${campaign.createdBy?.username || ''}"`
      ].join(',');
    }).join('\n');

    const csvContent = csvHeader + csvRows;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=email-analytics.csv');
    res.send(csvContent);
  } catch (error) {
    console.error('Export analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export analytics'
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
  getCampaignStats,
  getAnalytics,
  exportAnalytics
};