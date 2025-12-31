const Audience = require('../models/marketing/Audience');
const TrackingEvent = require('../models/marketing/TrackingEvent');

class AudienceSegmentationService {
  /**
   * Create a custom audience based on rules
   */
  static async createAudience(audienceData, userId) {
    const audience = await Audience.create({
      ...audienceData,
      createdBy: userId,
      status: 'building'
    });
    
    // Build audience in background
    await audience.buildAudience();
    
    return audience;
  }

  /**
   * Create cart abandoners audience
   */
  static async createCartAbandonersAudience(options = {}) {
    const {
      name = 'Cart Abandoners',
      timeWindow = { value: 7, unit: 'days' },
      minCartValue = 0,
      userId
    } = options;
    
    const rules = {
      conditions: [
        {
          field: 'eventType',
          operator: 'equals',
          value: 'cart_abandon'
        }
      ],
      logicalOperator: 'AND',
      timeWindow,
      excludeConverted: true
    };
    
    if (minCartValue > 0) {
      rules.conditions.push({
        field: 'data.cartValue',
        operator: 'greater_than',
        value: minCartValue
      });
    }
    
    return this.createAudience({
      name,
      description: 'Visitors who abandoned their shopping cart',
      type: 'cart_abandoners',
      rules
    }, userId);
  }

  /**
   * Create product viewers audience
   */
  static async createProductViewersAudience(options = {}) {
    const {
      name = 'Product Viewers',
      timeWindow = { value: 14, unit: 'days' },
      productIds = null,
      minViews = 1,
      userId
    } = options;
    
    const rules = {
      conditions: [
        {
          field: 'eventType',
          operator: 'equals',
          value: 'product_view'
        }
      ],
      logicalOperator: 'AND',
      timeWindow,
      excludeConverted: true
    };
    
    if (productIds && productIds.length > 0) {
      rules.conditions.push({
        field: 'data.productId',
        operator: 'in',
        value: productIds
      });
    }
    
    const audience = await this.createAudience({
      name,
      description: 'Visitors who viewed specific products',
      type: 'product_viewers',
      rules
    }, userId);
    
    // Filter by minimum views if needed
    if (minViews > 1) {
      await this.filterByEventCount(audience._id, 'product_view', minViews);
    }
    
    return audience;
  }

  /**
   * Create purchasers audience
   */
  static async createPurchasersAudience(options = {}) {
    const {
      name = 'Recent Purchasers',
      timeWindow = { value: 30, unit: 'days' },
      minOrderValue = 0,
      maxOrderValue = null,
      userId
    } = options;
    
    const rules = {
      conditions: [
        {
          field: 'eventType',
          operator: 'equals',
          value: 'purchase'
        }
      ],
      logicalOperator: 'AND',
      timeWindow,
      excludeConverted: false
    };
    
    if (minOrderValue > 0) {
      rules.conditions.push({
        field: 'data.orderValue',
        operator: 'greater_than',
        value: minOrderValue
      });
    }
    
    if (maxOrderValue) {
      rules.conditions.push({
        field: 'data.orderValue',
        operator: 'less_than',
        value: maxOrderValue
      });
    }
    
    return this.createAudience({
      name,
      description: 'Visitors who made a purchase',
      type: 'purchasers',
      rules
    }, userId);
  }

  /**
   * Create lookalike audience
   */
  static async createLookalikeAudience(sourceAudienceId, options = {}) {
    const {
      name,
      similarityScore = 7,
      userId
    } = options;
    
    const sourceAudience = await Audience.findById(sourceAudienceId);
    if (!sourceAudience) {
      throw new Error('Source audience not found');
    }
    
    const audience = await Audience.create({
      name: name || `Lookalike - ${sourceAudience.name}`,
      description: `Lookalike audience based on ${sourceAudience.name}`,
      type: 'lookalike',
      sourceAudienceId,
      similarityScore,
      rules: {
        conditions: [],
        logicalOperator: 'AND'
      },
      createdBy: userId,
      status: 'building'
    });
    
    // Build lookalike audience (simplified version)
    // In production, this would use ML algorithms to find similar users
    await this.buildLookalikeAudience(audience._id);
    
    return audience;
  }

  /**
   * Build lookalike audience (simplified)
   */
  static async buildLookalikeAudience(audienceId) {
    const audience = await Audience.findById(audienceId);
    const sourceAudience = await Audience.findById(audience.sourceAudienceId);
    
    // Get source audience members
    const sourceMembers = await sourceAudience.getMembers(1000);
    
    // Analyze common behaviors
    const commonBehaviors = this.analyzeCommonBehaviors(sourceMembers);
    
    // Find similar users based on behaviors
    // This is a simplified version - in production, use ML models
    const similarUsers = await TrackingEvent.aggregate([
      {
        $match: {
          eventType: { $in: commonBehaviors.topEvents },
          visitorId: { $nin: sourceMembers.map(m => m._id) }
        }
      },
      {
        $group: {
          _id: '$visitorId',
          eventCount: { $sum: 1 },
          events: { $push: '$eventType' }
        }
      },
      {
        $match: {
          eventCount: { $gte: commonBehaviors.minEventCount }
        }
      },
      { $limit: sourceMembers.length * 10 }
    ]);
    
    audience.size = similarUsers.length;
    audience.estimatedReach = similarUsers.length;
    audience.lastBuiltAt = new Date();
    audience.status = 'active';
    await audience.save();
    
    return audience;
  }

  /**
   * Analyze common behaviors in audience
   */
  static analyzeCommonBehaviors(members) {
    const eventCounts = {};
    let totalEvents = 0;
    
    members.forEach(member => {
      member.events.forEach(event => {
        eventCounts[event.type] = (eventCounts[event.type] || 0) + 1;
        totalEvents++;
      });
    });
    
    const topEvents = Object.entries(eventCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([event]) => event);
    
    return {
      topEvents,
      minEventCount: Math.floor(totalEvents / members.length * 0.5)
    };
  }

  /**
   * Filter audience by event count
   */
  static async filterByEventCount(audienceId, eventType, minCount) {
    const audience = await Audience.findById(audienceId);
    
    const members = await TrackingEvent.aggregate([
      {
        $match: {
          eventType,
          timestamp: { $gte: this.getTimeWindowDate(audience.rules.timeWindow) }
        }
      },
      {
        $group: {
          _id: '$visitorId',
          count: { $sum: 1 }
        }
      },
      {
        $match: {
          count: { $gte: minCount }
        }
      }
    ]);
    
    audience.size = members.length;
    await audience.save();
    
    return members;
  }

  /**
   * Get time window date
   */
  static getTimeWindowDate(timeWindow) {
    if (!timeWindow) return new Date(0);
    
    const date = new Date();
    switch (timeWindow.unit) {
      case 'hours':
        date.setHours(date.getHours() - timeWindow.value);
        break;
      case 'days':
        date.setDate(date.getDate() - timeWindow.value);
        break;
      case 'weeks':
        date.setDate(date.getDate() - (timeWindow.value * 7));
        break;
      case 'months':
        date.setMonth(date.getMonth() - timeWindow.value);
        break;
    }
    return date;
  }

  /**
   * Refresh audience
   */
  static async refreshAudience(audienceId) {
    const audience = await Audience.findById(audienceId);
    if (!audience) {
      throw new Error('Audience not found');
    }
    
    if (audience.type === 'lookalike') {
      return this.buildLookalikeAudience(audienceId);
    }
    
    return audience.buildAudience();
  }

  /**
   * Get audience overlap
   */
  static async getAudienceOverlap(audienceId1, audienceId2) {
    const audience1 = await Audience.findById(audienceId1);
    const audience2 = await Audience.findById(audienceId2);
    
    if (!audience1 || !audience2) {
      throw new Error('One or both audiences not found');
    }
    
    const members1 = await audience1.getMembers(10000);
    const members2 = await audience2.getMembers(10000);
    
    const visitorIds1 = new Set(members1.map(m => m._id));
    const visitorIds2 = new Set(members2.map(m => m._id));
    
    const overlap = [...visitorIds1].filter(id => visitorIds2.has(id));
    
    return {
      audience1: {
        id: audienceId1,
        name: audience1.name,
        size: audience1.size
      },
      audience2: {
        id: audienceId2,
        name: audience2.name,
        size: audience2.size
      },
      overlapSize: overlap.length,
      overlapPercentage: (overlap.length / Math.min(audience1.size, audience2.size)) * 100
    };
  }

  /**
   * Sync audience to ad platform
   */
  static async syncToAdPlatform(audienceId, platform) {
    const audience = await Audience.findById(audienceId);
    if (!audience) {
      throw new Error('Audience not found');
    }
    
    // Get audience members
    const members = await audience.getMembers(100000);
    
    // Platform-specific sync logic would go here
    // This is a placeholder for the actual integration
    const platformAudienceId = await this.createPlatformAudience(platform, {
      name: audience.name,
      description: audience.description,
      members: members.map(m => m._id)
    });
    
    // Update audience with platform sync info
    const syncInfo = {
      platform,
      audienceId: platformAudienceId,
      lastSyncedAt: new Date(),
      status: 'synced'
    };
    
    const existingSync = audience.platformSyncs.find(s => s.platform === platform);
    if (existingSync) {
      existingSync.audienceId = platformAudienceId;
      existingSync.lastSyncedAt = new Date();
      existingSync.status = 'synced';
    } else {
      audience.platformSyncs.push(syncInfo);
    }
    
    await audience.save();
    
    return syncInfo;
  }

  /**
   * Create audience on ad platform (placeholder)
   */
  static async createPlatformAudience(platform, audienceData) {
    // This would integrate with actual platform APIs
    // For now, return a mock ID
    return `${platform}_aud_${Date.now()}`;
  }
}

module.exports = AudienceSegmentationService;
