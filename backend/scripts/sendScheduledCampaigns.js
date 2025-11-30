const EmailCampaign = require('../models/marketing/emailCampaign');
const NewsletterSubscription = require('../models/marketing/newsletterSubscription');
const EmailAnalytics = require('../models/marketing/emailAnalytics');
const emailService = require('../services/emailService');

/**
 * Get recipients based on campaign's target audience settings
 */
async function getRecipients(campaign) {
  let query = { isActive: true };

  if (campaign.targetAudience === 'segment' && campaign.segmentCriteria) {
    const criteria = campaign.segmentCriteria;

    // Filter by subscription date range
    if (criteria.subscriptionDateFrom || criteria.subscriptionDateTo) {
      query.subscribedAt = {};
      if (criteria.subscriptionDateFrom) {
        query.subscribedAt.$gte = new Date(criteria.subscriptionDateFrom);
      }
      if (criteria.subscriptionDateTo) {
        query.subscribedAt.$lte = new Date(criteria.subscriptionDateTo);
      }
    }

    // Filter by sources
    if (criteria.sources && criteria.sources.length > 0) {
      query.source = { $in: criteria.sources };
    }

    // Filter by preferences
    if (criteria.preferences) {
      Object.entries(criteria.preferences).forEach(([key, value]) => {
        if (value !== undefined) {
          query[`preferences.${key}`] = value;
        }
      });
    }
  } else if (campaign.targetAudience === 'custom' && campaign.segmentCriteria?.customEmails) {
    // Custom email list
    query.email = { $in: campaign.segmentCriteria.customEmails };
  }

  const subscribers = await NewsletterSubscription.find(query).select('email name unsubscribeToken');
  return subscribers;
}

/**
 * Process and send a single scheduled campaign
 */
async function processCampaign(campaign) {
  console.log(`📧 Processing campaign: ${campaign.name} (ID: ${campaign._id})`);

  try {
    // Update status to sending
    campaign.status = 'sending';
    await campaign.save();

    // Get recipients
    const recipients = await getRecipients(campaign);

    if (recipients.length === 0) {
      console.log(`⚠️  No recipients found for campaign: ${campaign.name}`);
      campaign.status = 'sent';
      campaign.sentAt = new Date();
      campaign.analytics.totalRecipients = 0;
      campaign.analytics.emailsSent = 0;
      await campaign.save();
      return {
        success: true,
        campaignId: campaign._id,
        totalSent: 0,
        message: 'No recipients found'
      };
    }

    console.log(`📬 Sending to ${recipients.length} recipients...`);

    // Send emails using existing email service
    const emailResults = await emailService.sendCampaignEmails(campaign, recipients);

    if (!emailResults.success) {
      throw new Error(emailResults.error || 'Failed to send campaign emails');
    }

    // Update campaign with results
    campaign.status = 'sent';
    campaign.sentAt = new Date();
    campaign.analytics.totalRecipients = recipients.length;
    campaign.analytics.emailsSent = emailResults.totalSent;
    campaign.analytics.emailsFailed = emailResults.totalFailed;
    await campaign.save();

    // Create individual analytics records
    if (emailResults.results && emailResults.results.length > 0) {
      const analyticsPromises = emailResults.results
        .filter(result => result.success)
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
        console.error('⚠️  Analytics creation failed:', analyticsError.message);
      }
    }

    console.log(`✅ Campaign "${campaign.name}" sent successfully: ${emailResults.totalSent} emails`);

    return {
      success: true,
      campaignId: campaign._id,
      campaignName: campaign.name,
      totalSent: emailResults.totalSent,
      totalFailed: emailResults.totalFailed,
      recipients: recipients.length
    };

  } catch (error) {
    console.error(`❌ Failed to process campaign ${campaign.name}:`, error);
    
    // Update campaign status to failed
    campaign.status = 'failed';
    await campaign.save();

    return {
      success: false,
      campaignId: campaign._id,
      campaignName: campaign.name,
      error: error.message
    };
  }
}

/**
 * Main function to check and send scheduled campaigns
 */
async function sendScheduledCampaigns() {
  try {
    console.log('\n🔍 Checking for scheduled campaigns...');
    
    const now = new Date();

    // Find campaigns that are scheduled and due to be sent
    const scheduledCampaigns = await EmailCampaign.find({
      status: 'scheduled',
      scheduledAt: { $lte: now }
    }).sort({ scheduledAt: 1 }); // Process oldest first

    if (scheduledCampaigns.length === 0) {
      console.log('✓ No scheduled campaigns to send at this time');
      return {
        success: true,
        processed: 0,
        results: []
      };
    }

    console.log(`📋 Found ${scheduledCampaigns.length} campaign(s) to send`);

    // Process each campaign
    const results = [];
    for (const campaign of scheduledCampaigns) {
      const result = await processCampaign(campaign);
      results.push(result);
      
      // Small delay between campaigns to avoid rate limiting
      if (scheduledCampaigns.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
      }
    }

    // Summary
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log('\n📊 Scheduled campaigns summary:');
    console.log(`   ✅ Successful: ${successful}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   📧 Total campaigns processed: ${results.length}\n`);

    return {
      success: true,
      processed: results.length,
      successful,
      failed,
      results
    };

  } catch (error) {
    console.error('❌ Error in sendScheduledCampaigns:', error);
    return {
      success: false,
      error: error.message,
      processed: 0,
      results: []
    };
  }
}

// Export for use in cron job and manual execution
module.exports = { sendScheduledCampaigns, processCampaign };

// Allow running directly from command line for testing
if (require.main === module) {
  const mongoose = require('mongoose');
  require('dotenv').config();

  (async () => {
    try {
      // Connect to database
      const dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/wrencos';
      await mongoose.connect(dbUri);
      console.log('✅ Connected to MongoDB');

      // Initialize email service
      await emailService.initialize();

      // Run the scheduled campaigns check
      const result = await sendScheduledCampaigns();
      
      console.log('\n✅ Script completed');
      process.exit(result.success ? 0 : 1);
    } catch (error) {
      console.error('❌ Script error:', error);
      process.exit(1);
    }
  })();
}
