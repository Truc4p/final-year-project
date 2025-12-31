const Audience = require('../../models/marketing/Audience');
const AudienceSegmentationService = require('../../services/audienceSegmentationService');

/**
 * Get all audiences
 */
exports.getAudiences = async (req, res) => {
  try {
    const { type, status } = req.query;
    const filter = {};
    
    if (type) filter.type = type;
    if (status) filter.status = status;
    
    const audiences = await Audience.find(filter)
      .populate('sourceAudienceId', 'name size')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      audiences
    });
  } catch (error) {
    console.error('Get audiences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audiences',
      error: error.message
    });
  }
};

/**
 * Get single audience
 */
exports.getAudience = async (req, res) => {
  try {
    const audience = await Audience.findById(req.params.id)
      .populate('sourceAudienceId', 'name size')
      .populate('createdBy', 'name email');
    
    if (!audience) {
      return res.status(404).json({
        success: false,
        message: 'Audience not found'
      });
    }
    
    res.json({
      success: true,
      audience
    });
  } catch (error) {
    console.error('Get audience error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audience',
      error: error.message
    });
  }
};

/**
 * Create audience
 */
exports.createAudience = async (req, res) => {
  try {
    const audience = await AudienceSegmentationService.createAudience(
      req.body,
      req.user._id
    );
    
    res.status(201).json({
      success: true,
      message: 'Audience created successfully',
      audience
    });
  } catch (error) {
    console.error('Create audience error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create audience',
      error: error.message
    });
  }
};

/**
 * Create cart abandoners audience
 */
exports.createCartAbandonersAudience = async (req, res) => {
  try {
    const audience = await AudienceSegmentationService.createCartAbandonersAudience({
      ...req.body,
      userId: req.user._id
    });
    
    res.status(201).json({
      success: true,
      message: 'Cart abandoners audience created successfully',
      audience
    });
  } catch (error) {
    console.error('Create cart abandoners audience error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create cart abandoners audience',
      error: error.message
    });
  }
};

/**
 * Create product viewers audience
 */
exports.createProductViewersAudience = async (req, res) => {
  try {
    const audience = await AudienceSegmentationService.createProductViewersAudience({
      ...req.body,
      userId: req.user._id
    });
    
    res.status(201).json({
      success: true,
      message: 'Product viewers audience created successfully',
      audience
    });
  } catch (error) {
    console.error('Create product viewers audience error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product viewers audience',
      error: error.message
    });
  }
};

/**
 * Create purchasers audience
 */
exports.createPurchasersAudience = async (req, res) => {
  try {
    const audience = await AudienceSegmentationService.createPurchasersAudience({
      ...req.body,
      userId: req.user._id
    });
    
    res.status(201).json({
      success: true,
      message: 'Purchasers audience created successfully',
      audience
    });
  } catch (error) {
    console.error('Create purchasers audience error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create purchasers audience',
      error: error.message
    });
  }
};

/**
 * Create lookalike audience
 */
exports.createLookalikeAudience = async (req, res) => {
  try {
    const { sourceAudienceId, ...options } = req.body;
    
    const audience = await AudienceSegmentationService.createLookalikeAudience(
      sourceAudienceId,
      {
        ...options,
        userId: req.user._id
      }
    );
    
    res.status(201).json({
      success: true,
      message: 'Lookalike audience created successfully',
      audience
    });
  } catch (error) {
    console.error('Create lookalike audience error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create lookalike audience',
      error: error.message
    });
  }
};

/**
 * Update audience
 */
exports.updateAudience = async (req, res) => {
  try {
    const audience = await Audience.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!audience) {
      return res.status(404).json({
        success: false,
        message: 'Audience not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Audience updated successfully',
      audience
    });
  } catch (error) {
    console.error('Update audience error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update audience',
      error: error.message
    });
  }
};

/**
 * Delete audience
 */
exports.deleteAudience = async (req, res) => {
  try {
    const audience = await Audience.findByIdAndDelete(req.params.id);
    
    if (!audience) {
      return res.status(404).json({
        success: false,
        message: 'Audience not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Audience deleted successfully'
    });
  } catch (error) {
    console.error('Delete audience error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete audience',
      error: error.message
    });
  }
};

/**
 * Refresh audience
 */
exports.refreshAudience = async (req, res) => {
  try {
    const audience = await AudienceSegmentationService.refreshAudience(req.params.id);
    
    res.json({
      success: true,
      message: 'Audience refreshed successfully',
      audience
    });
  } catch (error) {
    console.error('Refresh audience error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refresh audience',
      error: error.message
    });
  }
};

/**
 * Get audience members
 */
exports.getAudienceMembers = async (req, res) => {
  try {
    const { limit, offset } = req.query;
    const audience = await Audience.findById(req.params.id);
    
    if (!audience) {
      return res.status(404).json({
        success: false,
        message: 'Audience not found'
      });
    }
    
    const members = await audience.getMembers(
      parseInt(limit) || 100,
      parseInt(offset) || 0
    );
    
    res.json({
      success: true,
      audience: {
        id: audience._id,
        name: audience.name,
        size: audience.size
      },
      members
    });
  } catch (error) {
    console.error('Get audience members error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audience members',
      error: error.message
    });
  }
};

/**
 * Get audience overlap
 */
exports.getAudienceOverlap = async (req, res) => {
  try {
    const { audienceId2 } = req.query;
    
    const overlap = await AudienceSegmentationService.getAudienceOverlap(
      req.params.id,
      audienceId2
    );
    
    res.json({
      success: true,
      overlap
    });
  } catch (error) {
    console.error('Get audience overlap error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audience overlap',
      error: error.message
    });
  }
};

/**
 * Sync audience to ad platform
 */
exports.syncAudienceToPlatform = async (req, res) => {
  try {
    const { platform } = req.body;
    
    const syncInfo = await AudienceSegmentationService.syncToAdPlatform(
      req.params.id,
      platform
    );
    
    res.json({
      success: true,
      message: `Audience synced to ${platform} successfully`,
      syncInfo
    });
  } catch (error) {
    console.error('Sync audience to platform error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync audience to platform',
      error: error.message
    });
  }
};

module.exports = exports;
