const axios = require('axios');
const AdPlatformConnection = require('../models/marketing/AdPlatformConnection');
const AdCampaign = require('../models/marketing/AdCampaign');
const AdPerformance = require('../models/marketing/AdPerformance');

class FacebookAdsService {
  constructor(connection) {
    this.connection = connection;
    this.adAccountId = connection.credentials.adAccountId;
    this.apiVersion = 'v18.0';
  }

  /**
   * Get API client
   */
  getClient() {
    const accessToken = this.connection.getDecryptedToken();
    
    return axios.create({
      baseURL: `https://graph.facebook.com/${this.apiVersion}`,
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
  }

  /**
   * Create campaign on Facebook Ads
   */
  async createCampaign(campaignData) {
    const client = this.getClient();
    
    const campaign = {
      name: campaignData.name,
      objective: this.mapObjective(campaignData.objective),
      status: this.mapStatus(campaignData.status),
      special_ad_categories: [],
      buying_type: 'AUCTION'
    };
    
    try {
      const response = await client.post(
        `/act_${this.adAccountId}/campaigns`,
        campaign
      );
      
      await this.connection.recordApiCall();
      
      return response.data;
    } catch (error) {
      console.error('Facebook Ads campaign creation failed:', error.response?.data || error);
      throw new Error('Failed to create campaign on Facebook Ads');
    }
  }

  /**
   * Create ad set
   */
  async createAdSet(campaignId, adSetData) {
    const client = this.getClient();
    
    const adSet = {
      name: adSetData.name,
      campaign_id: campaignId,
      billing_event: this.getBillingEvent(adSetData.bidding.strategy),
      optimization_goal: this.getOptimizationGoal(adSetData.objective),
      bid_amount: Math.round(adSetData.bidding.amount * 100), // cents
      daily_budget: Math.round(adSetData.budget.amount * 100),
      start_time: adSetData.schedule.startDate,
      end_time: adSetData.schedule.endDate,
      targeting: this.buildTargeting(adSetData.targeting),
      status: this.mapStatus(adSetData.status)
    };
    
    try {
      const response = await client.post(
        `/act_${this.adAccountId}/adsets`,
        adSet
      );
      
      await this.connection.recordApiCall();
      
      return response.data;
    } catch (error) {
      console.error('Facebook Ads ad set creation failed:', error.response?.data || error);
      throw new Error('Failed to create ad set on Facebook Ads');
    }
  }

  /**
   * Create ad
   */
  async createAd(adSetId, creative) {
    const client = this.getClient();
    
    // First create ad creative
    const adCreative = await this.createAdCreative(creative);
    
    const ad = {
      name: creative.name,
      adset_id: adSetId,
      creative: {
        creative_id: adCreative.id
      },
      status: this.mapStatus(creative.status)
    };
    
    try {
      const response = await client.post(
        `/act_${this.adAccountId}/ads`,
        ad
      );
      
      await this.connection.recordApiCall();
      
      return response.data;
    } catch (error) {
      console.error('Facebook Ads ad creation failed:', error.response?.data || error);
      throw new Error('Failed to create ad on Facebook Ads');
    }
  }

  /**
   * Create ad creative
   */
  async createAdCreative(creative) {
    const client = this.getClient();
    
    let creativeData = {
      name: creative.name,
      object_story_spec: {}
    };
    
    if (creative.type === 'image') {
      creativeData.object_story_spec = {
        page_id: this.connection.credentials.businessId,
        link_data: {
          image_hash: creative.assets.images[0].url,
          link: creative.assets.landingUrl,
          message: creative.assets.descriptions[0]?.text || '',
          name: creative.assets.headlines[0]?.text || '',
          call_to_action: {
            type: this.mapCallToAction(creative.assets.callToAction)
          }
        }
      };
    } else if (creative.type === 'video') {
      creativeData.object_story_spec = {
        page_id: this.connection.credentials.businessId,
        video_data: {
          video_id: creative.assets.videos[0].url,
          link: creative.assets.landingUrl,
          message: creative.assets.descriptions[0]?.text || '',
          call_to_action: {
            type: this.mapCallToAction(creative.assets.callToAction)
          }
        }
      };
    } else if (creative.type === 'carousel') {
      creativeData.object_story_spec = {
        page_id: this.connection.credentials.businessId,
        link_data: {
          link: creative.assets.landingUrl,
          child_attachments: creative.carousel.cards.map(card => ({
            link: card.destinationUrl,
            image_hash: card.image,
            name: card.headline,
            description: card.description,
            call_to_action: {
              type: this.mapCallToAction(card.callToAction)
            }
          }))
        }
      };
    }
    
    try {
      const response = await client.post(
        `/act_${this.adAccountId}/adcreatives`,
        creativeData
      );
      
      await this.connection.recordApiCall();
      
      return response.data;
    } catch (error) {
      console.error('Facebook Ads creative creation failed:', error.response?.data || error);
      throw new Error('Failed to create creative on Facebook Ads');
    }
  }

  /**
   * Create custom audience
   */
  async createCustomAudience(audienceData) {
    const client = this.getClient();
    
    const audience = {
      name: audienceData.name,
      description: audienceData.description,
      subtype: 'CUSTOM',
      customer_file_source: 'USER_PROVIDED_ONLY'
    };
    
    try {
      const response = await client.post(
        `/act_${this.adAccountId}/customaudiences`,
        audience
      );
      
      await this.connection.recordApiCall();
      
      return response.data;
    } catch (error) {
      console.error('Facebook Ads audience creation failed:', error.response?.data || error);
      throw new Error('Failed to create audience on Facebook Ads');
    }
  }

  /**
   * Add users to custom audience
   */
  async addUsersToAudience(audienceId, users) {
    const client = this.getClient();
    
    // Facebook requires hashed emails/phone numbers
    const hashedUsers = users.map(user => this.hashUser(user));
    
    try {
      const response = await client.post(
        `/${audienceId}/users`,
        {
          payload: {
            schema: ['EMAIL', 'PHONE', 'FN', 'LN'],
            data: hashedUsers
          }
        }
      );
      
      await this.connection.recordApiCall();
      
      return response.data;
    } catch (error) {
      console.error('Facebook Ads add users failed:', error.response?.data || error);
      throw new Error('Failed to add users to audience on Facebook Ads');
    }
  }

  /**
   * Get campaign insights
   */
  async getCampaignInsights(campaignId, startDate, endDate) {
    const client = this.getClient();
    
    const params = {
      time_range: {
        since: this.formatDate(startDate),
        until: this.formatDate(endDate)
      },
      fields: [
        'impressions',
        'reach',
        'frequency',
        'clicks',
        'ctr',
        'spend',
        'cpc',
        'cpm',
        'cpp',
        'actions',
        'action_values',
        'conversions',
        'cost_per_action_type',
        'video_30_sec_watched_actions',
        'video_avg_time_watched_actions'
      ].join(',')
    };
    
    try {
      const response = await client.get(
        `/${campaignId}/insights`,
        { params }
      );
      
      await this.connection.recordApiCall();
      
      return response.data.data[0] || {};
    } catch (error) {
      console.error('Facebook Ads insights fetch failed:', error.response?.data || error);
      throw new Error('Failed to fetch insights from Facebook Ads');
    }
  }

  /**
   * Sync campaign performance to database
   */
  async syncCampaignPerformance(localCampaignId, facebookCampaignId, date) {
    const insights = await this.getCampaignInsights(
      facebookCampaignId,
      date,
      date
    );
    
    // Parse actions for conversions
    const conversions = this.parseActions(insights.actions, 'offsite_conversion.fb_pixel_purchase');
    const conversionValue = this.parseActionValues(insights.action_values, 'offsite_conversion.fb_pixel_purchase');
    
    const performanceData = {
      campaignId: localCampaignId,
      platform: 'facebook_ads',
      date: new Date(date),
      metrics: {
        impressions: parseInt(insights.impressions) || 0,
        reach: parseInt(insights.reach) || 0,
        frequency: parseFloat(insights.frequency) || 0,
        clicks: parseInt(insights.clicks) || 0,
        ctr: parseFloat(insights.ctr) || 0,
        spend: parseFloat(insights.spend) || 0,
        cpc: parseFloat(insights.cpc) || 0,
        cpm: parseFloat(insights.cpm) || 0,
        conversions: conversions,
        conversionValue: conversionValue,
        videoViews: this.parseActions(insights.video_30_sec_watched_actions, 'video_view') || 0
      },
      syncedFrom: {
        platform: 'facebook_ads',
        syncedAt: new Date(),
        rawData: insights
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
  buildTargeting(targeting) {
    const fbTargeting = {
      geo_locations: {},
      age_min: targeting.demographics?.ageMin || 18,
      age_max: targeting.demographics?.ageMax || 65,
      device_platforms: targeting.deviceTypes?.map(d => d.toUpperCase()) || ['mobile', 'desktop'],
      publisher_platforms: this.mapPlacements(targeting.placements)
    };
    
    // Locations
    if (targeting.locations && targeting.locations.length > 0) {
      fbTargeting.geo_locations.countries = targeting.locations
        .map(l => l.country)
        .filter(Boolean);
    }
    
    // Demographics
    if (targeting.demographics?.genders) {
      fbTargeting.genders = targeting.demographics.genders.map(g => 
        g === 'male' ? 1 : g === 'female' ? 2 : 0
      ).filter(g => g > 0);
    }
    
    // Interests
    if (targeting.interests && targeting.interests.length > 0) {
      fbTargeting.interests = targeting.interests.map(interest => ({
        id: interest,
        name: interest
      }));
    }
    
    return fbTargeting;
  }

  mapStatus(status) {
    const statusMap = {
      'draft': 'PAUSED',
      'scheduled': 'PAUSED',
      'active': 'ACTIVE',
      'paused': 'PAUSED',
      'completed': 'ARCHIVED',
      'cancelled': 'ARCHIVED'
    };
    return statusMap[status] || 'PAUSED';
  }

  mapObjective(objective) {
    const objectiveMap = {
      'brand_awareness': 'BRAND_AWARENESS',
      'reach': 'REACH',
      'traffic': 'LINK_CLICKS',
      'engagement': 'ENGAGEMENT',
      'app_installs': 'APP_INSTALLS',
      'video_views': 'VIDEO_VIEWS',
      'lead_generation': 'LEAD_GENERATION',
      'conversions': 'CONVERSIONS',
      'product_catalog_sales': 'PRODUCT_CATALOG_SALES'
    };
    return objectiveMap[objective] || 'LINK_CLICKS';
  }

  getBillingEvent(biddingStrategy) {
    const billingMap = {
      'cpc': 'LINK_CLICKS',
      'cpm': 'IMPRESSIONS',
      'cpa': 'IMPRESSIONS'
    };
    return billingMap[biddingStrategy] || 'IMPRESSIONS';
  }

  getOptimizationGoal(objective) {
    const goalMap = {
      'brand_awareness': 'BRAND_AWARENESS',
      'reach': 'REACH',
      'traffic': 'LINK_CLICKS',
      'conversions': 'OFFSITE_CONVERSIONS'
    };
    return goalMap[objective] || 'LINK_CLICKS';
  }

  mapPlacements(placements) {
    if (!placements || placements.length === 0) {
      return ['facebook', 'instagram'];
    }
    
    const platformMap = {
      'feed': 'facebook',
      'stories': 'instagram',
      'messenger': 'messenger'
    };
    
    return [...new Set(placements.map(p => platformMap[p] || 'facebook'))];
  }

  mapCallToAction(cta) {
    const ctaMap = {
      'learn_more': 'LEARN_MORE',
      'shop_now': 'SHOP_NOW',
      'sign_up': 'SIGN_UP',
      'download': 'DOWNLOAD',
      'book_now': 'BOOK_NOW',
      'contact_us': 'CONTACT_US',
      'get_quote': 'GET_QUOTE',
      'apply_now': 'APPLY_NOW',
      'watch_video': 'WATCH_VIDEO',
      'see_menu': 'SEE_MENU'
    };
    return ctaMap[cta] || 'LEARN_MORE';
  }

  formatDate(date) {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  parseActions(actions, actionType) {
    if (!actions) return 0;
    const action = actions.find(a => a.action_type === actionType);
    return action ? parseInt(action.value) : 0;
  }

  parseActionValues(actionValues, actionType) {
    if (!actionValues) return 0;
    const action = actionValues.find(a => a.action_type === actionType);
    return action ? parseFloat(action.value) : 0;
  }

  hashUser(user) {
    // In production, use crypto to hash user data
    const crypto = require('crypto');
    return {
      email: user.email ? crypto.createHash('sha256').update(user.email).digest('hex') : null,
      phone: user.phone ? crypto.createHash('sha256').update(user.phone).digest('hex') : null,
      fn: user.firstName ? crypto.createHash('sha256').update(user.firstName).digest('hex') : null,
      ln: user.lastName ? crypto.createHash('sha256').update(user.lastName).digest('hex') : null
    };
  }
}

module.exports = FacebookAdsService;
