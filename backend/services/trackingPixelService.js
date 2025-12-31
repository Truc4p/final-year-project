const TrackingPixel = require('../models/marketing/TrackingPixel');
const TrackingEvent = require('../models/marketing/TrackingEvent');
const geoip = require('geoip-lite');
const useragent = require('useragent');

class TrackingPixelService {
  /**
   * Generate tracking pixel JavaScript
   */
  static generatePixelScript(pixelId) {
    return `
(function() {
  var _wrencos = window._wrencos || {};
  _wrencos.pixelId = '${pixelId}';
  _wrencos.events = [];
  
  // Cookie management
  _wrencos.getCookie = function(name) {
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length === 2) return parts.pop().split(";").shift();
  };
  
  _wrencos.setCookie = function(name, value, days) {
    var expires = "";
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
  };
  
  // Get or create visitor ID
  _wrencos.getVisitorId = function() {
    var visitorId = _wrencos.getCookie('_wrencos_vid');
    if (!visitorId) {
      visitorId = 'vid_' + Math.random().toString(36).substr(2, 16) + Date.now().toString(36);
      _wrencos.setCookie('_wrencos_vid', visitorId, 365);
    }
    return visitorId;
  };
  
  // Get or create session ID
  _wrencos.getSessionId = function() {
    var sessionId = sessionStorage.getItem('_wrencos_sid');
    if (!sessionId) {
      sessionId = 'sid_' + Math.random().toString(36).substr(2, 16) + Date.now().toString(36);
      sessionStorage.setItem('_wrencos_sid', sessionId);
    }
    return sessionId;
  };
  
  // Track event
  _wrencos.track = function(eventType, data) {
    data = data || {};
    
    var payload = {
      pixelId: _wrencos.pixelId,
      eventType: eventType,
      visitorId: _wrencos.getVisitorId(),
      sessionId: _wrencos.getSessionId(),
      data: {
        url: window.location.href,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        ...data
      }
    };
    
    // Send to server
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/marketing/tracking/event', JSON.stringify(payload));
    } else {
      fetch('/api/marketing/tracking/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }
  };
  
  // Auto-track page view
  _wrencos.track('page_view');
  
  // Track cart abandonment
  var cartCheckInterval;
  _wrencos.trackCartAbandonment = function() {
    var cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cart.length > 0) {
      var cartValue = cart.reduce(function(sum, item) {
        return sum + (item.price * item.quantity);
      }, 0);
      
      clearTimeout(cartCheckInterval);
      cartCheckInterval = setTimeout(function() {
        _wrencos.track('cart_abandon', {
          cartValue: cartValue,
          itemCount: cart.length,
          items: cart
        });
      }, 300000); // 5 minutes
    }
  };
  
  // Monitor cart changes
  if (window.addEventListener) {
    window.addEventListener('storage', function(e) {
      if (e.key === 'cart') {
        _wrencos.trackCartAbandonment();
      }
    });
  }
  
  // Expose tracking API
  window._wrencos = _wrencos;
})();
    `.trim();
  }

  /**
   * Track event from client
   */
  static async trackEvent(pixelData, req) {
    const { pixelId, eventType, eventName, visitorId, sessionId, data } = pixelData;
    
    // Find pixel
    const pixel = await TrackingPixel.findOne({ pixelId, status: 'active' });
    if (!pixel) {
      throw new Error('Invalid or inactive pixel');
    }
    
    // Parse user agent
    const agent = useragent.parse(req.headers['user-agent']);
    
    // Get geo location from IP
    const ip = req.ip || req.connection.remoteAddress;
    const geo = geoip.lookup(ip);
    
    // Create tracking event
    const eventData = {
      pixelId: pixel._id,
      eventType,
      eventName,
      visitorId,
      sessionId,
      data: {
        ...data,
        userAgent: req.headers['user-agent'],
        ipAddress: ip,
        country: geo?.country,
        city: geo?.city,
        device: agent.device.toString(),
        browser: agent.family,
        os: agent.os.toString()
      }
    };
    
    const event = await TrackingEvent.create(eventData);
    
    // Update pixel stats
    await pixel.trackEvent(eventType, eventData);
    
    return event;
  }

  /**
   * Get events for a pixel
   */
  static async getPixelEvents(pixelId, filters = {}) {
    const query = { pixelId };
    
    if (filters.eventType) {
      query.eventType = filters.eventType;
    }
    
    if (filters.visitorId) {
      query.visitorId = filters.visitorId;
    }
    
    if (filters.startDate || filters.endDate) {
      query.timestamp = {};
      if (filters.startDate) {
        query.timestamp.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.timestamp.$lte = new Date(filters.endDate);
      }
    }
    
    const events = await TrackingEvent.find(query)
      .sort({ timestamp: -1 })
      .limit(filters.limit || 100)
      .skip(filters.offset || 0);
    
    return events;
  }

  /**
   * Get pixel analytics
   */
  static async getPixelAnalytics(pixelId, startDate, endDate) {
    const pixel = await TrackingPixel.findById(pixelId);
    if (!pixel) {
      throw new Error('Pixel not found');
    }
    
    const matchStage = {
      pixelId: pixel._id,
      timestamp: {
        $gte: startDate,
        $lte: endDate
      }
    };
    
    // Overall stats
    const stats = await TrackingEvent.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalEvents: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$visitorId' },
          uniqueSessions: { $addToSet: '$sessionId' }
        }
      },
      {
        $project: {
          totalEvents: 1,
          uniqueVisitors: { $size: '$uniqueVisitors' },
          uniqueSessions: { $size: '$uniqueSessions' }
        }
      }
    ]);
    
    // Events by type
    const eventsByType = await TrackingEvent.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Events by hour
    const eventsByHour = await TrackingEvent.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $hour: '$timestamp' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Top pages
    const topPages = await TrackingEvent.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$data.url',
          views: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$visitorId' }
        }
      },
      {
        $project: {
          url: '$_id',
          views: 1,
          uniqueVisitors: { $size: '$uniqueVisitors' }
        }
      },
      { $sort: { views: -1 } },
      { $limit: 10 }
    ]);
    
    // Conversion funnel (if applicable)
    const conversionFunnel = await TrackingEvent.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$visitorId',
          events: { $push: '$eventType' }
        }
      },
      {
        $project: {
          hasPageView: { $in: ['page_view', '$events'] },
          hasProductView: { $in: ['product_view', '$events'] },
          hasAddToCart: { $in: ['add_to_cart', '$events'] },
          hasCheckout: { $in: ['checkout_start', '$events'] },
          hasPurchase: { $in: ['purchase', '$events'] }
        }
      },
      {
        $group: {
          _id: null,
          pageViews: { $sum: { $cond: ['$hasPageView', 1, 0] } },
          productViews: { $sum: { $cond: ['$hasProductView', 1, 0] } },
          addToCarts: { $sum: { $cond: ['$hasAddToCart', 1, 0] } },
          checkouts: { $sum: { $cond: ['$hasCheckout', 1, 0] } },
          purchases: { $sum: { $cond: ['$hasPurchase', 1, 0] } }
        }
      }
    ]);
    
    return {
      pixel,
      stats: stats[0] || { totalEvents: 0, uniqueVisitors: 0, uniqueSessions: 0 },
      eventsByType,
      eventsByHour,
      topPages,
      conversionFunnel: conversionFunnel[0] || {}
    };
  }

  /**
   * Identify cart abandoners
   */
  static async identifyCartAbandoners(timeWindow = 24) {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - timeWindow);
    
    // Find visitors who added to cart but didn't purchase
    const abandoners = await TrackingEvent.aggregate([
      {
        $match: {
          eventType: { $in: ['add_to_cart', 'cart_abandon', 'purchase'] },
          timestamp: { $gte: cutoffTime }
        }
      },
      {
        $group: {
          _id: '$visitorId',
          events: { $push: {
            type: '$eventType',
            timestamp: '$timestamp',
            data: '$data'
          }}
        }
      },
      {
        $match: {
          'events.type': 'add_to_cart',
          'events.type': { $ne: 'purchase' }
        }
      }
    ]);
    
    return abandoners;
  }
}

module.exports = TrackingPixelService;
