const { processCampaign } = require('../scripts/sendScheduledCampaigns');

/**
 * Email Scheduler Service
 * Manages in-memory timers for scheduled campaigns (efficient, no polling)
 */
class EmailScheduler {
  constructor() {
    this.timers = new Map(); // campaignId -> timeoutId
  }

  /**
   * Schedule a campaign to be sent at a specific time
   */
  scheduleCampaign(campaign) {
    const now = new Date();
    const scheduledTime = new Date(campaign.scheduledAt);
    const delay = scheduledTime.getTime() - now.getTime();

    // If already past the scheduled time, send immediately
    if (delay <= 0) {
      console.log(`📧 Campaign "${campaign.name}" is overdue, sending immediately...`);
      this._sendCampaign(campaign);
      return;
    }

    // Cancel existing timer if any
    this.cancelCampaign(campaign._id.toString());

    // Schedule the campaign
    const timerId = setTimeout(() => {
      this._sendCampaign(campaign);
      this.timers.delete(campaign._id.toString());
    }, delay);

    this.timers.set(campaign._id.toString(), timerId);
    
    const scheduledDate = scheduledTime.toLocaleString();
    console.log(`✅ Scheduled campaign "${campaign.name}" for ${scheduledDate}`);
  }

  /**
   * Cancel a scheduled campaign
   */
  cancelCampaign(campaignId) {
    const timerId = this.timers.get(campaignId);
    if (timerId) {
      clearTimeout(timerId);
      this.timers.delete(campaignId);
      console.log(`🗑️  Cancelled scheduled campaign: ${campaignId}`);
      return true;
    }
    return false;
  }

  /**
   * Reschedule a campaign (e.g., when scheduledAt is updated)
   */
  rescheduleCampaign(campaign) {
    this.cancelCampaign(campaign._id.toString());
    this.scheduleCampaign(campaign);
  }

  /**
   * Get count of scheduled campaigns in memory
   */
  getScheduledCount() {
    return this.timers.size;
  }

  /**
   * Clear all scheduled campaigns (for shutdown)
   */
  clearAll() {
    this.timers.forEach(timerId => clearTimeout(timerId));
    this.timers.clear();
    console.log('🧹 Cleared all scheduled campaigns');
  }

  /**
   * Internal method to send campaign
   */
  async _sendCampaign(campaign) {
    console.log(`📬 Sending scheduled campaign: ${campaign.name}`);
    try {
      await processCampaign(campaign);
    } catch (error) {
      console.error(`❌ Error sending campaign ${campaign.name}:`, error);
    }
  }

  /**
   * Load all scheduled campaigns from database on startup
   */
  async loadScheduledCampaigns() {
    try {
      const EmailCampaign = require('../models/marketing/emailCampaign');
      
      const scheduledCampaigns = await EmailCampaign.find({
        status: 'scheduled',
        scheduledAt: { $exists: true }
      });

      console.log(`📋 Loading ${scheduledCampaigns.length} scheduled campaign(s)...`);

      for (const campaign of scheduledCampaigns) {
        this.scheduleCampaign(campaign);
      }

      console.log(`✅ Email scheduler initialized with ${this.getScheduledCount()} campaign(s)`);
    } catch (error) {
      console.error('❌ Error loading scheduled campaigns:', error);
    }
  }
}

// Export singleton instance
const emailScheduler = new EmailScheduler();
module.exports = emailScheduler;
