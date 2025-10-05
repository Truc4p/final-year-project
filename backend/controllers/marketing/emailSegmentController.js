const EmailSegment = require('../../models/marketing/emailSegment');
const NewsletterSubscription = require('../../models/marketing/newsletterSubscription');

// Get all segments for the current user
const getSegments = async (req, res) => {
  try {
    const segments = await EmailSegment.find({ createdBy: req.user.id })
      .sort({ isDefault: -1, name: 1 });
    
    res.json({
      success: true,
      data: segments
    });
  } catch (error) {
    console.error('Error fetching segments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch segments'
    });
  }
};

// Create a new segment
const createSegment = async (req, res) => {
  try {
    const { name, description, criteria } = req.body;
    
    // Check if segment name already exists for this user
    const existingSegment = await EmailSegment.findOne({
      name,
      createdBy: req.user.id
    });
    
    if (existingSegment) {
      return res.status(400).json({
        success: false,
        message: 'A segment with this name already exists'
      });
    }
    
    const segment = new EmailSegment({
      name,
      description,
      criteria,
      createdBy: req.user.id
    });
    
    // Calculate initial subscriber count
    const subscribers = await segment.getMatchingSubscribers();
    segment.subscriberCount = subscribers.length;
    
    await segment.save();
    
    res.status(201).json({
      success: true,
      data: segment
    });
  } catch (error) {
    console.error('Error creating segment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create segment'
    });
  }
};

// Update an existing segment
const updateSegment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, criteria } = req.body;
    
    const segment = await EmailSegment.findOne({
      _id: id,
      createdBy: req.user.id
    });
    
    if (!segment) {
      return res.status(404).json({
        success: false,
        message: 'Segment not found'
      });
    }
    
    // Check if segment name already exists for this user (excluding current segment)
    if (name !== segment.name) {
      const existingSegment = await EmailSegment.findOne({
        name,
        createdBy: req.user.id,
        _id: { $ne: id }
      });
      
      if (existingSegment) {
        return res.status(400).json({
          success: false,
          message: 'A segment with this name already exists'
        });
      }
    }
    
    // Update segment
    segment.name = name;
    segment.description = description;
    segment.criteria = criteria;
    segment.lastUpdated = new Date();
    
    // Recalculate subscriber count
    const subscribers = await segment.getMatchingSubscribers();
    segment.subscriberCount = subscribers.length;
    
    await segment.save();
    
    res.json({
      success: true,
      data: segment
    });
  } catch (error) {
    console.error('Error updating segment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update segment'
    });
  }
};

// Delete a segment
const deleteSegment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const segment = await EmailSegment.findOne({
      _id: id,
      createdBy: req.user.id
    });
    
    if (!segment) {
      return res.status(404).json({
        success: false,
        message: 'Segment not found'
      });
    }
    
    // Prevent deletion of default segments
    if (segment.isDefault) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete default segments'
      });
    }
    
    await EmailSegment.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: 'Segment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting segment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete segment'
    });
  }
};

// Get subscribers for a specific segment
const getSegmentSubscribers = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    const segment = await EmailSegment.findOne({
      _id: id,
      createdBy: req.user.id
    });
    
    if (!segment) {
      return res.status(404).json({
        success: false,
        message: 'Segment not found'
      });
    }
    
    const subscribers = await segment.getMatchingSubscribers();
    
    // Apply pagination
    const totalSubscribers = subscribers.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedSubscribers = subscribers.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: {
        subscribers: paginatedSubscribers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalSubscribers,
          pages: Math.ceil(totalSubscribers / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching segment subscribers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch segment subscribers'
    });
  }
};

// Preview segment (get matching subscribers count without saving)
const previewSegment = async (req, res) => {
  try {
    const { criteria } = req.body;
    
    // Create temporary segment to use the getMatchingSubscribers method
    const tempSegment = new EmailSegment({
      name: 'temp',
      criteria,
      createdBy: req.user.id
    });
    
    const subscribers = await tempSegment.getMatchingSubscribers();
    
    res.json({
      success: true,
      data: {
        count: subscribers.length,
        preview: subscribers.slice(0, 5).map(sub => ({
          email: sub.email,
          source: sub.source,
          createdAt: sub.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('Error previewing segment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to preview segment'
    });
  }
};

// Refresh all segment counts
const refreshAllCounts = async (req, res) => {
  try {
    await EmailSegment.updateAllCounts();
    
    res.json({
      success: true,
      message: 'All segment counts updated successfully'
    });
  } catch (error) {
    console.error('Error refreshing segment counts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refresh segment counts'
    });
  }
};

// Initialize default segments for a user
const initializeDefaultSegments = async (req, res) => {
  try {
    await EmailSegment.createDefaultSegments(req.user.id);
    
    const segments = await EmailSegment.find({ createdBy: req.user.id })
      .sort({ isDefault: -1, name: 1 });
    
    res.json({
      success: true,
      data: segments,
      message: 'Default segments initialized successfully'
    });
  } catch (error) {
    console.error('Error initializing default segments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initialize default segments'
    });
  }
};

module.exports = {
  getSegments,
  createSegment,
  updateSegment,
  deleteSegment,
  getSegmentSubscribers,
  previewSegment,
  refreshAllCounts,
  initializeDefaultSegments
};