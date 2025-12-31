const TrackingPixel = require('../../models/marketing/TrackingPixel');
const TrackingPixelService = require('../../services/trackingPixelService');

/**
 * Get all tracking pixels
 */
exports.getPixels = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    
    const pixels = await TrackingPixel.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      pixels
    });
  } catch (error) {
    console.error('Get pixels error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tracking pixels',
      error: error.message
    });
  }
};

/**
 * Get single pixel
 */
exports.getPixel = async (req, res) => {
  try {
    const pixel = await TrackingPixel.findById(req.params.id)
      .populate('createdBy', 'name email');
    
    if (!pixel) {
      return res.status(404).json({
        success: false,
        message: 'Tracking pixel not found'
      });
    }
    
    res.json({
      success: true,
      pixel
    });
  } catch (error) {
    console.error('Get pixel error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tracking pixel',
      error: error.message
    });
  }
};

/**
 * Create tracking pixel
 */
exports.createPixel = async (req, res) => {
  try {
    const pixel = await TrackingPixel.create({
      ...req.body,
      createdBy: req.user._id
    });
    
    res.status(201).json({
      success: true,
      message: 'Tracking pixel created successfully',
      pixel
    });
  } catch (error) {
    console.error('Create pixel error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create tracking pixel',
      error: error.message
    });
  }
};

/**
 * Update tracking pixel
 */
exports.updatePixel = async (req, res) => {
  try {
    const pixel = await TrackingPixel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!pixel) {
      return res.status(404).json({
        success: false,
        message: 'Tracking pixel not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Tracking pixel updated successfully',
      pixel
    });
  } catch (error) {
    console.error('Update pixel error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update tracking pixel',
      error: error.message
    });
  }
};

/**
 * Delete tracking pixel
 */
exports.deletePixel = async (req, res) => {
  try {
    const pixel = await TrackingPixel.findByIdAndDelete(req.params.id);
    
    if (!pixel) {
      return res.status(404).json({
        success: false,
        message: 'Tracking pixel not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Tracking pixel deleted successfully'
    });
  } catch (error) {
    console.error('Delete pixel error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete tracking pixel',
      error: error.message
    });
  }
};

/**
 * Get pixel JavaScript file
 */
exports.getPixelScript = async (req, res) => {
  try {
    const pixelId = req.query.id;
    
    if (!pixelId) {
      return res.status(400).send('// Missing pixel ID');
    }
    
    const script = TrackingPixelService.generatePixelScript(pixelId);
    
    res.set('Content-Type', 'application/javascript');
    res.send(script);
  } catch (error) {
    console.error('Get pixel script error:', error);
    res.set('Content-Type', 'application/javascript');
    res.send('// Error loading tracking pixel');
  }
};

/**
 * Track event (public endpoint)
 */
exports.trackEvent = async (req, res) => {
  try {
    const event = await TrackingPixelService.trackEvent(req.body, req);
    
    // Return 1x1 transparent pixel for image requests
    if (req.headers.accept?.includes('image')) {
      const pixel = Buffer.from(
        'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
        'base64'
      );
      res.set('Content-Type', 'image/gif');
      res.send(pixel);
    } else {
      res.json({
        success: true,
        eventId: event._id
      });
    }
  } catch (error) {
    console.error('Track event error:', error);
    
    // Still return pixel for image requests even on error
    if (req.headers.accept?.includes('image')) {
      const pixel = Buffer.from(
        'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
        'base64'
      );
      res.set('Content-Type', 'image/gif');
      res.send(pixel);
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to track event'
      });
    }
  }
};

/**
 * Get pixel events
 */
exports.getPixelEvents = async (req, res) => {
  try {
    const { eventType, visitorId, startDate, endDate, limit, offset } = req.query;
    
    const events = await TrackingPixelService.getPixelEvents(req.params.id, {
      eventType,
      visitorId,
      startDate,
      endDate,
      limit: parseInt(limit) || 100,
      offset: parseInt(offset) || 0
    });
    
    res.json({
      success: true,
      events
    });
  } catch (error) {
    console.error('Get pixel events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pixel events',
      error: error.message
    });
  }
};

/**
 * Get pixel analytics
 */
exports.getPixelAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const analytics = await TrackingPixelService.getPixelAnalytics(
      req.params.id,
      new Date(startDate || Date.now() - 30 * 24 * 60 * 60 * 1000), // Default 30 days ago
      new Date(endDate || Date.now())
    );
    
    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('Get pixel analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pixel analytics',
      error: error.message
    });
  }
};

/**
 * Get cart abandoners
 */
exports.getCartAbandoners = async (req, res) => {
  try {
    const { timeWindow } = req.query;
    
    const abandoners = await TrackingPixelService.identifyCartAbandoners(
      parseInt(timeWindow) || 24
    );
    
    res.json({
      success: true,
      count: abandoners.length,
      abandoners
    });
  } catch (error) {
    console.error('Get cart abandoners error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cart abandoners',
      error: error.message
    });
  }
};

module.exports = exports;
