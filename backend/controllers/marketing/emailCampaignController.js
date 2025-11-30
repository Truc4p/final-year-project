const EmailCampaign = require('../../models/marketing/emailCampaign');
const EmailTemplate = require('../../models/marketing/emailTemplate');
const EmailAnalytics = require('../../models/marketing/emailAnalytics');
const NewsletterSubscription = require('../../models/marketing/newsletterSubscription');
const emailService = require('../../services/emailService');
const emailScheduler = require('../../services/emailScheduler');

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
    
    // Schedule campaign if status is 'scheduled' and scheduledAt is set
    if (campaign.status === 'scheduled' && campaign.scheduledAt) {
      emailScheduler.scheduleCampaign(campaign);
    }
    
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
    
    // Handle scheduling changes
    if (existingCampaign.status === 'scheduled' && campaign.status !== 'scheduled') {
      // Campaign was scheduled but now isn't - cancel it
      emailScheduler.cancelCampaign(id);
    } else if (campaign.status === 'scheduled' && campaign.scheduledAt) {
      // Campaign is scheduled - reschedule it (handles both new and updated schedules)
      emailScheduler.rescheduleCampaign(campaign);
    }
    
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
    
    // Cancel scheduled timer if exists
    emailScheduler.cancelCampaign(id);
    
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

// Send campaign immediately
const sendCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get campaign
    const campaign = await EmailCampaign.findById(id);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    // Check if campaign is already sent
    if (campaign.status === 'sent') {
      return res.status(400).json({
        success: false,
        message: 'Campaign has already been sent'
      });
    }

    // Validate campaign content
    if (!campaign.subject || !campaign.htmlContent) {
      return res.status(400).json({
        success: false,
        message: 'Campaign must have subject and content'
      });
    }

    // Get recipients based on target audience
    const recipients = await getRecipients(campaign);
    
    if (recipients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No recipients found for this campaign'
      });
    }

    // Update campaign status
    campaign.status = 'sending';
    campaign.sentAt = new Date();
    await campaign.save();

    // Send emails
    const emailResults = await emailService.sendCampaignEmails(campaign, recipients);
    
    if (!emailResults.success) {
      campaign.status = 'failed';
      await campaign.save();
      
      return res.status(500).json({
        success: false,
        message: 'Failed to send campaign emails',
        error: emailResults.error
      });
    }

    // Update campaign with results
    campaign.status = 'sent';
    campaign.emailsSent = emailResults.totalSent;
    campaign.emailsFailed = emailResults.totalFailed;
    await campaign.save();

    // Create individual analytics records for each email sent
    if (emailResults.results && emailResults.results.length > 0) {
      const analyticsPromises = emailResults.results
        .filter(result => result.success) // Only track successful sends
        .map(result => {
          const analytics = new EmailAnalytics({
            campaignId: campaign._id,
            subscriberEmail: result.to,
            sentAt: new Date()
          });
          return analytics.save();
        });
      
      try {
        await Promise.all(analyticsPromises);
        console.log(`✅ Created ${analyticsPromises.length} analytics records`);
      } catch (analyticsError) {
        console.error('⚠️  Analytics creation failed, but emails were sent:', analyticsError.message);
        // Don't fail the whole operation if analytics fail
      }
    }

    res.status(200).json({
      success: true,
      message: 'Campaign sent successfully',
      data: {
        campaignId: campaign._id,
        emailsSent: emailResults.totalSent,
        emailsFailed: emailResults.totalFailed,
        recipients: recipients.length
      }
    });

  } catch (error) {
    console.error('Send campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send campaign'
    });
  }
};

// Create and send campaign immediately
const createAndSendCampaign = async (req, res) => {
  try {
    const campaignData = {
      ...req.body,
      createdBy: req.user.id,
      status: 'sending'
    };

    // Create campaign
    const campaign = new EmailCampaign(campaignData);
    await campaign.save();

    // Validate campaign content
    if (!campaign.subject || !campaign.htmlContent) {
      return res.status(400).json({
        success: false,
        message: 'Campaign must have subject and content'
      });
    }

    // Get recipients
    const recipients = await getRecipients(campaign);
    
    if (recipients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No recipients found for this campaign'
      });
    }

    // Send emails
    const emailResults = await emailService.sendCampaignEmails(campaign, recipients);
    
    if (!emailResults.success) {
      campaign.status = 'failed';
      await campaign.save();
      
      return res.status(500).json({
        success: false,
        message: 'Failed to send campaign emails',
        error: emailResults.error
      });
    }

    // Update campaign with results
    campaign.status = 'sent';
    campaign.sentAt = new Date();
    campaign.emailsSent = emailResults.totalSent;
    campaign.emailsFailed = emailResults.totalFailed;
    await campaign.save();

    // Create individual analytics records for each email sent
    if (emailResults.results && emailResults.results.length > 0) {
      const analyticsPromises = emailResults.results
        .filter(result => result.success) // Only track successful sends
        .map(result => {
          const analytics = new EmailAnalytics({
            campaignId: campaign._id,
            subscriberEmail: result.to,
            sentAt: new Date()
          });
          return analytics.save();
        });
      
      try {
        await Promise.all(analyticsPromises);
        console.log(`✅ Created ${analyticsPromises.length} analytics records`);
      } catch (analyticsError) {
        console.error('⚠️  Analytics creation failed, but emails were sent:', analyticsError.message);
        // Don't fail the whole operation if analytics fail
      }
    }

    res.status(201).json({
      success: true,
      message: 'Campaign created and sent successfully',
      data: {
        campaign: campaign,
        emailsSent: emailResults.totalSent,
        emailsFailed: emailResults.totalFailed
      }
    });

  } catch (error) {
    console.error('Create and send campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create and send campaign'
    });
  }
};

// Helper function to get recipients based on campaign target audience
const getRecipients = async (campaign) => {
  try {
    let recipients = [];
    
    switch (campaign.targetAudience) {
      case 'all':
        // Get all active subscribers
        const allSubscribers = await NewsletterSubscription.find({ 
          isActive: true 
        }).select('email name source preferences unsubscribeToken');
        recipients = allSubscribers.map(sub => ({
          email: sub.email,
          name: sub.name || sub.email.split('@')[0],
          source: sub.source,
          preferences: sub.preferences,
          unsubscribeToken: sub.unsubscribeToken
        }));
        break;
        
      case 'segment':
        // Get subscribers based on criteria
        const query = { isActive: true };
        
        // Date range filter
        if (campaign.segmentCriteria.subscriptionDateFrom || campaign.segmentCriteria.subscriptionDateTo) {
          query.createdAt = {};
          if (campaign.segmentCriteria.subscriptionDateFrom) {
            query.createdAt.$gte = new Date(campaign.segmentCriteria.subscriptionDateFrom);
          }
          if (campaign.segmentCriteria.subscriptionDateTo) {
            query.createdAt.$lte = new Date(campaign.segmentCriteria.subscriptionDateTo);
          }
        }
        
        // Source filter
        if (campaign.segmentCriteria.sources && campaign.segmentCriteria.sources.length > 0) {
          query.source = { $in: campaign.segmentCriteria.sources };
        }
        
        // Preferences filter
        if (campaign.segmentCriteria.preferences) {
          if (campaign.segmentCriteria.preferences.newProducts) {
            query['preferences.newProducts'] = true;
          }
          if (campaign.segmentCriteria.preferences.promotions) {
            query['preferences.promotions'] = true;
          }
          if (campaign.segmentCriteria.preferences.newsletter) {
            query['preferences.newsletter'] = true;
          }
        }
        
        const segmentSubscribers = await NewsletterSubscription.find(query)
          .select('email name source preferences unsubscribeToken');
        recipients = segmentSubscribers.map(sub => ({
          email: sub.email,
          name: sub.name || sub.email.split('@')[0],
          source: sub.source,
          preferences: sub.preferences,
          unsubscribeToken: sub.unsubscribeToken
        }));
        break;
        
      case 'custom':
        // Use custom email list
        if (campaign.segmentCriteria.customEmails && campaign.segmentCriteria.customEmails.length > 0) {
          recipients = campaign.segmentCriteria.customEmails.map(email => ({
            email: email,
            name: email.split('@')[0], // Use email prefix as name
            source: 'custom',
            preferences: {}
          }));
        }
        break;
        
      default:
        throw new Error('Invalid target audience type');
    }
    
    return recipients;
    
  } catch (error) {
    console.error('Error getting recipients:', error);
    throw error;
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
  exportAnalytics,
  sendCampaign,
  createAndSendCampaign
};