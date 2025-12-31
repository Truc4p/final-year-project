const axios = require('axios');
const AdPlatformConnection = require('../models/marketing/AdPlatformConnection');
const AdCampaign = require('../models/marketing/AdCampaign');
const AdPerformance = require('../models/marketing/AdPerformance');

class GoogleAdsService {
  constructor(connection) {
    this.connection = connection;
    this.customerId = connection.credentials.customerId;
  }

  /**
   * Get API client
   */
  getClient() {
    const accessToken = this.connection.getDecryptedToken();
    
    return axios.create({
      baseURL: 'https://googleads.googleapis.com/v14',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
        'login-customer-id': this.customerId
      }
    });
  }

  /**
   * Create campaign on Google Ads
   */
  async createCampaign(campaignData) {
    const client = this.getClient();
    
    const campaign = {
      name: campaignData.name,
      status: this.mapStatus(campaignData.status),
      advertisingChannelType: this.mapObjective(campaignData.objective),
      biddingStrategyType: this.mapBiddingStrategy(campaignData.bidding.strategy),
      campaignBudget: {
        amountMicros: campaignData.budget.amount * 1000000,
        deliveryMethod: campaignData.budget.pacing === 'accelerated' ? 'ACCELERATED' : 'STANDARD'
      },
      startDate: this.formatDate(campaignData.schedule.startDate),
      endDate: campaignData.schedule.endDate ? this.formatDate(campaignData.schedule.endDate) : null,
      targetGoogleSearch: true,
      targetSearchNetwork: true,
      targetContentNetwork: campaignData.targeting.placements?.includes('display')
    };
    
    try {
      const response = await client.post(`/customers/${this.customerId}/campaigns:mutate`, {
        operations: [{
          create: campaign
        }]
      });
      
      await this.connection.recordApiCall();
      
      return response.data.results[0];
    } catch (error) {
      console.error('Google Ads campaign creation failed:', error.response?.data || error);
      throw new Error('Failed to create campaign on Google Ads');
    }
  }

  /**
   * Create ad group
   */
  async createAdGroup(campaignId, adGroupData) {
    const client = this.getClient();
    
    const adGroup = {
      campaign: `customers/${this.customerId}/campaigns/${campaignId}`,
      name: adGroupData.name,
      status: 'ENABLED',
      cpcBidMicros: adGroupData.bidAmount * 1000000
    };
    
    try {
      const response = await client.post(`/customers/${this.customerId}/adGroups:mutate`, {
        operations: [{
          create: adGroup
        }]
      });
      
      await this.connection.recordApiCall();
      
      return response.data.results[0];
    } catch (error) {
      console.error('Google Ads ad group creation failed:', error.response?.data || error);
      throw new Error('Failed to create ad group on Google Ads');
    }
  }

  /**
   * Create responsive search ad
   */
  async createResponsiveSearchAd(adGroupId, creative) {
    const client = this.getClient();
    
    const ad = {
      adGroup: `customers/${this.customerId}/adGroups/${adGroupId}`,
      status: 'ENABLED',
      responsiveSearchAd: {
        headlines: creative.assets.headlines.map(h => ({
          text: h.text
        })),
        descriptions: creative.assets.descriptions.map(d => ({
          text: d.text
        })),
        finalUrls: [creative.assets.landingUrl]
      }
    };
    
    try {
      const response = await client.post(`/customers/${this.customerId}/ads:mutate`, {
        operations: [{
          create: ad
        }]
      });
      
      await this.connection.recordApiCall();
      
      return response.data.results[0];
    } catch (error) {
      console.error('Google Ads ad creation failed:', error.response?.data || error);
      throw new Error('Failed to create ad on Google Ads');
    }
  }

  /**
   * Create audience (customer list)
   */
  async createAudience(audienceData) {
    const client = this.getClient();
    
    const userList = {
      name: audienceData.name,
      description: audienceData.description,
      membershipLifeSpan: 540, // 18 months
      membershipStatus: 'OPEN'
    };
    
    try {
      const response = await client.post(`/customers/${this.customerId}/userLists:mutate`, {
        operations: [{
          create: userList
        }]
      });
      
      await this.connection.recordApiCall();
      
      return response.data.results[0];
    } catch (error) {
      console.error('Google Ads audience creation failed:', error.response?.data || error);
      throw new Error('Failed to create audience on Google Ads');
    }
  }

  /**
   * Get campaign performance
   */
  async getCampaignPerformance(campaignId, startDate, endDate) {
    const client = this.getClient();
    
    const query = `
      SELECT
        campaign.id,
        campaign.name,
        metrics.impressions,
        metrics.clicks,
        metrics.conversions,
        metrics.cost_micros,
        metrics.conversions_value,
        segments.date
      FROM campaign
      WHERE campaign.id = ${campaignId}
        AND segments.date BETWEEN '${this.formatDate(startDate)}' AND '${this.formatDate(endDate)}'
    `;
    
    try {
      const response = await client.post(`/customers/${this.customerId}/googleAds:search`, {
        query
      });
      
      await this.connection.recordApiCall();
      
      return this.parsePerformanceData(response.data);
    } catch (error) {
      console.error('Google Ads performance fetch failed:', error.response?.data || error);
      throw new Error('Failed to fetch performance from Google Ads');
    }
  }

  /**
   * Sync campaign performance to database
   */
  async syncCampaignPerformance(localCampaignId, googleCampaignId, date) {
    const performance = await this.getCampaignPerformance(
      googleCampaignId,
      date,
      date
    );
    
    const performanceData = {
      campaignId: localCampaignId,
      platform: 'google_ads',
      date: new Date(date),
      metrics: {
        impressions: performance.impressions || 0,
        clicks: performance.clicks || 0,
        conversions: performance.conversions || 0,
        spend: (performance.cost_micros || 0) / 1000000,
        revenue: performance.conversions_value || 0,
        cpc: performance.clicks > 0 ? (performance.cost_micros / 1000000) / performance.clicks : 0,
        ctr: performance.impressions > 0 ? (performance.clicks / performance.impressions) * 100 : 0,
        conversionRate: performance.clicks > 0 ? (performance.conversions / performance.clicks) * 100 : 0
      },
      syncedFrom: {
        platform: 'google_ads',
        syncedAt: new Date(),
        rawData: performance
      }
    };
    
    // Calculate derived metrics
    const adPerformance = new AdPerformance(performanceData);
    adPerformance.calculateDerivedMetrics();
    
    await adPerformance.save();
    
    return adPerformance;
  }

  /**
   * Helper methods
   */
  mapStatus(status) {
    const statusMap = {
      'draft': 'PAUSED',
      'scheduled': 'PAUSED',
      'active': 'ENABLED',
      'paused': 'PAUSED',
      'completed': 'REMOVED',
      'cancelled': 'REMOVED'
    };
    return statusMap[status] || 'PAUSED';
  }

  mapObjective(objective) {
    const objectiveMap = {
      'brand_awareness': 'DISPLAY',
      'reach': 'DISPLAY',
      'traffic': 'SEARCH',
      'conversions': 'SEARCH',
      'product_catalog_sales': 'SHOPPING'
    };
    return objectiveMap[objective] || 'SEARCH';
  }

  mapBiddingStrategy(strategy) {
    const strategyMap = {
      'cpc': 'MANUAL_CPC',
      'cpm': 'MANUAL_CPM',
      'cpa': 'TARGET_CPA',
      'roas': 'TARGET_ROAS',
      'autobid': 'MAXIMIZE_CONVERSIONS'
    };
    return strategyMap[strategy] || 'MANUAL_CPC';
  }

  formatDate(date) {
    const d = new Date(date);
    return d.toISOString().split('T')[0].replace(/-/g, '');
  }

  parsePerformanceData(data) {
    if (!data.results || data.results.length === 0) {
      return {
        impressions: 0,
        clicks: 0,
        conversions: 0,
        cost_micros: 0,
        conversions_value: 0
      };
    }
    
    return data.results.reduce((acc, row) => {
      acc.impressions += row.metrics.impressions || 0;
      acc.clicks += row.metrics.clicks || 0;
      acc.conversions += row.metrics.conversions || 0;
      acc.cost_micros += row.metrics.cost_micros || 0;
      acc.conversions_value += row.metrics.conversions_value || 0;
      return acc;
    }, {
      impressions: 0,
      clicks: 0,
      conversions: 0,
      cost_micros: 0,
      conversions_value: 0
    });
  }
}

module.exports = GoogleAdsService;
