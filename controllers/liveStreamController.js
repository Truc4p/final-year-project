const LiveStream = require('../models/liveStream');
const multer = require('multer');
const path = require('path');

// Configure multer for video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/livestreams/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /mp4|webm|ogg|avi|mov/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'));
    }
  }
});

// Create a new livestream
exports.createLiveStream = async (req, res) => {
  try {
    const { title, description, quality, categories, tags, streamUrl } = req.body;
    
    // Debug: Log received data
    console.log('🔍 Creating livestream with received data:', {
      title,
      description,
      quality,
      streamUrl,
      categories,
      tags
    });
    
    // Check if there's already an active stream
    const activeStream = await LiveStream.getActiveStream();
    if (activeStream) {
      return res.status(400).json({ 
        message: 'Another livestream is currently active. Please stop it before starting a new one.' 
      });
    }

    const liveStream = new LiveStream({
      title,
      description,
      quality,
      streamUrl: streamUrl || '',
      categories: categories ? categories.split(',').map(c => c.trim()) : [],
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      isActive: true,
      startTime: new Date(),
      createdBy: req.user ? req.user._id : null
    });

    await liveStream.save();
    
    console.log('✅ Livestream saved to database:', {
      id: liveStream._id,
      title: liveStream.title,
      streamUrl: liveStream.streamUrl
    });
    
    res.status(201).json({
      message: 'Livestream created successfully',
      livestream: liveStream
    });
  } catch (error) {
    console.error('Error creating livestream:', error);
    res.status(500).json({ message: 'Failed to create livestream', error: error.message });
  }
};

// Get all livestreams (with pagination)
exports.getAllLiveStreams = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status; // 'active', 'past', 'all'
    
    let query = {};
    
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'past') {
      query = { isActive: false, endTime: { $exists: true } }; // Show all completed streams
    }

    const livestreams = await LiveStream.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate('createdBy', 'name email')
      .select('-chatMessages');

    const total = await LiveStream.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.json({
      livestreams,
      pagination: {
        currentPage: page,
        totalPages,
        total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching livestreams:', error);
    res.status(500).json({ message: 'Failed to fetch livestreams', error: error.message });
  }
};

// Get active livestream
exports.getActiveLiveStream = async (req, res) => {
  try {
    const activeStream = await LiveStream.getActiveStream()
      .populate('createdBy', 'name email');
    
    if (!activeStream) {
      return res.json({ message: 'No active livestream', livestream: null });
    }

    res.json({
      message: 'Active livestream found',
      livestream: activeStream
    });
  } catch (error) {
    console.error('Error fetching active livestream:', error);
    res.status(500).json({ message: 'Failed to fetch active livestream', error: error.message });
  }
};

// Get past livestreams
exports.getPastLiveStreams = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const pastStreams = await LiveStream.getPastStreams(limit, skip)
      .populate('createdBy', 'name email');

    const total = await LiveStream.countDocuments({ 
      isActive: false,
      endTime: { $exists: true }
    });

    res.json({
      livestreams: pastStreams,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching past livestreams:', error);
    res.status(500).json({ message: 'Failed to fetch past livestreams', error: error.message });
  }
};

// Get livestream by ID
exports.getLiveStreamById = async (req, res) => {
  try {
    const { id } = req.params;
    const livestream = await LiveStream.findById(id)
      .populate('createdBy', 'name email');
    
    if (!livestream) {
      return res.status(404).json({ message: 'Livestream not found' });
    }

    res.json({
      message: 'Livestream found',
      livestream
    });
  } catch (error) {
    console.error('Error fetching livestream:', error);
    res.status(500).json({ message: 'Failed to fetch livestream', error: error.message });
  }
};

// Update livestream
exports.updateLiveStream = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Prevent updating certain fields
    delete updates._id;
    delete updates.createdAt;
    delete updates.updatedAt;

    const livestream = await LiveStream.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');
    
    if (!livestream) {
      return res.status(404).json({ message: 'Livestream not found' });
    }

    res.json({
      message: 'Livestream updated successfully',
      livestream
    });
  } catch (error) {
    console.error('Error updating livestream:', error);
    res.status(500).json({ message: 'Failed to update livestream', error: error.message });
  }
};

// Stop livestream
exports.stopLiveStream = async (req, res) => {
  try {
    const { id } = req.params;
    const { videoUrl, thumbnailUrl, maxViewers } = req.body;
    
    const livestream = await LiveStream.findById(id);
    
    if (!livestream) {
      return res.status(404).json({ message: 'Livestream not found' });
    }

    if (!livestream.isActive) {
      return res.status(400).json({ message: 'Livestream is not active' });
    }

    // Calculate duration
    const endTime = new Date();
    const duration = Math.floor((endTime - livestream.startTime) / 1000);

    // Update livestream
    livestream.isActive = false;
    livestream.endTime = endTime;
    livestream.duration = duration;
    livestream.isRecorded = !!videoUrl;
    livestream.videoUrl = videoUrl || '';
    livestream.thumbnailUrl = thumbnailUrl || '';
    livestream.maxViewers = maxViewers || livestream.maxViewers;

    await livestream.save();

    res.json({
      message: 'Livestream stopped successfully',
      livestream
    });
  } catch (error) {
    console.error('Error stopping livestream:', error);
    res.status(500).json({ message: 'Failed to stop livestream', error: error.message });
  }
};

// Increment view count
exports.incrementViewCount = async (req, res) => {
  try {
    const { id } = req.params;
    const livestream = await LiveStream.findById(id);
    
    if (!livestream) {
      return res.status(404).json({ message: 'Livestream not found' });
    }

    await livestream.incrementViewCount();

    res.json({
      message: 'View count updated',
      viewCount: livestream.viewCount
    });
  } catch (error) {
    console.error('Error updating view count:', error);
    res.status(500).json({ message: 'Failed to update view count', error: error.message });
  }
};

// Add chat message
exports.addChatMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, message, isAdmin } = req.body;
    
    const livestream = await LiveStream.findById(id);
    
    if (!livestream) {
      return res.status(404).json({ message: 'Livestream not found' });
    }

    await livestream.addChatMessage(username, message, isAdmin || false);

    res.json({
      message: 'Chat message added',
      chatMessage: {
        username,
        message,
        timestamp: new Date(),
        isAdmin: isAdmin || false
      }
    });
  } catch (error) {
    console.error('Error adding chat message:', error);
    res.status(500).json({ message: 'Failed to add chat message', error: error.message });
  }
};

// Delete livestream
exports.deleteLiveStream = async (req, res) => {
  try {
    const { id } = req.params;
    const livestream = await LiveStream.findByIdAndDelete(id);
    
    if (!livestream) {
      return res.status(404).json({ message: 'Livestream not found' });
    }

    res.json({
      message: 'Livestream deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting livestream:', error);
    res.status(500).json({ message: 'Failed to delete livestream', error: error.message });
  }
};

// Upload video file
exports.uploadVideo = upload.single('video');

module.exports = exports;