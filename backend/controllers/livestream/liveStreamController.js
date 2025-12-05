const LiveStream = require('../../models/livestream/liveStream');
const Product = require('../../models/ecommerce/product');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');

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
    let activeStream = await LiveStream.getActiveStream();
    if (activeStream) {
      // Check if the stream has been active for more than 24 hours (likely stuck)
      const hoursSinceStart = (Date.now() - activeStream.startTime.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceStart > 24) {
        console.log('🧹 Found stuck active stream (active for', hoursSinceStart.toFixed(1), 'hours), cleaning up...');
        
        // Force cleanup the stuck stream
        activeStream.isActive = false;
        activeStream.endTime = new Date();
        activeStream.duration = Math.floor((Date.now() - activeStream.startTime.getTime()) / 1000);
        await activeStream.save();
        
        console.log('✅ Cleaned up stuck stream:', activeStream._id);
      } else {
        return res.status(400).json({ 
          message: 'Another livestream is currently active. Please stop it before starting a new one.' 
        });
      }
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
      createdBy: req.user ? req.user.id : null
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
    const { videoUrl, thumbnailUrl, maxViewers, viewCount, likes } = req.body;
    
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
    livestream.viewCount = viewCount || livestream.viewCount;
    livestream.likes = likes || livestream.likes;

    console.log(`💾 Saving livestream with final stats: viewCount=${livestream.viewCount}, likes=${livestream.likes}, maxViewers=${livestream.maxViewers}`);

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
    
    // First, find the livestream to get file paths before deletion
    const livestream = await LiveStream.findById(id);
    
    if (!livestream) {
      return res.status(404).json({ message: 'Livestream not found' });
    }

    // Delete associated files from filesystem
    const filesToDelete = [];
    
    // Add video file to deletion list if it exists
    if (livestream.videoUrl) {
      const videoPath = path.join(__dirname, '..', '..', 'uploads', 'livestreams', path.basename(livestream.videoUrl));
      filesToDelete.push(videoPath);
    }
    
    // Add thumbnail file to deletion list if it exists
    if (livestream.thumbnailUrl) {
      const thumbnailPath = path.join(__dirname, '..', '..', 'uploads', 'thumbnails', path.basename(livestream.thumbnailUrl));
      filesToDelete.push(thumbnailPath);
    }

    // Delete files from filesystem
    for (const filePath of filesToDelete) {
      try {
        await fs.unlink(filePath);
        console.log(`✅ Deleted file: ${filePath}`);
      } catch (fileError) {
        // Log warning but don't fail the operation if file doesn't exist
        console.warn(`⚠️ Could not delete file ${filePath}:`, fileError.message);
      }
    }

    // Delete the database record
    await LiveStream.findByIdAndDelete(id);

    res.json({
      message: 'Livestream and associated files deleted successfully',
      deletedFiles: filesToDelete.map(f => path.basename(f))
    });
  } catch (error) {
    console.error('Error deleting livestream:', error);
    res.status(500).json({ message: 'Failed to delete livestream', error: error.message });
  }
};

// Upload video file
exports.uploadVideo = upload.single('video');

// Pin a product to livestream
exports.pinProduct = async (req, res) => {
  try {
    const { id } = req.params; // livestream ID
    const { productId, displayOrder } = req.body;
    
    const livestream = await LiveStream.findById(id);
    if (!livestream) {
      return res.status(404).json({ message: 'Livestream not found' });
    }
    
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check if product is already pinned
    const existingPin = livestream.pinnedProducts.find(
      pin => pin.productId.toString() === productId && pin.isActive
    );
    
    if (existingPin) {
      return res.status(400).json({ message: 'Product is already pinned to this livestream' });
    }
    
    // Add pinned product
    livestream.pinnedProducts.push({
      productId,
      displayOrder: displayOrder || livestream.pinnedProducts.length,
      isActive: true
    });
    
    await livestream.save();
    
    // Populate the pinned products for response
    await livestream.populate('pinnedProducts.productId');
    
    const activePinnedProducts = livestream.pinnedProducts.filter(pin => pin.isActive);
    
    // Broadcast pinned products update via WebSocket
    const wsManager = req.app.locals.wsManager;
    if (wsManager) {
      await wsManager.broadcastPinnedProductsUpdate({
        type: 'pinned_products_updated',
        pinnedProducts: activePinnedProducts
      });
      console.log('📌 Broadcasted pinned products update via WebSocket');
    }
    
    res.json({
      message: 'Product pinned successfully',
      pinnedProducts: activePinnedProducts
    });
  } catch (error) {
    console.error('Error pinning product:', error);
    res.status(500).json({ message: 'Failed to pin product', error: error.message });
  }
};

// Unpin a product from livestream
exports.unpinProduct = async (req, res) => {
  try {
    const { id, productId } = req.params; // livestream ID and product ID
    
    const livestream = await LiveStream.findById(id);
    if (!livestream) {
      return res.status(404).json({ message: 'Livestream not found' });
    }
    
    // Find and deactivate the pinned product
    const pinnedProduct = livestream.pinnedProducts.find(
      pin => pin.productId.toString() === productId && pin.isActive
    );
    
    if (!pinnedProduct) {
      return res.status(404).json({ message: 'Product is not pinned to this livestream' });
    }
    
    pinnedProduct.isActive = false;
    await livestream.save();
    
    // Populate the pinned products for response
    await livestream.populate('pinnedProducts.productId');
    
    const activePinnedProducts = livestream.pinnedProducts.filter(pin => pin.isActive);
    
    // Broadcast pinned products update via WebSocket
    const wsManager = req.app.locals.wsManager;
    if (wsManager) {
      await wsManager.broadcastPinnedProductsUpdate({
        type: 'pinned_products_updated',
        pinnedProducts: activePinnedProducts
      });
      console.log('📌 Broadcasted pinned products update via WebSocket');
    }
    
    res.json({
      message: 'Product unpinned successfully',
      pinnedProducts: activePinnedProducts
    });
  } catch (error) {
    console.error('Error unpinning product:', error);
    res.status(500).json({ message: 'Failed to unpin product', error: error.message });
  }
};

// Get pinned products for a livestream
exports.getPinnedProducts = async (req, res) => {
  try {
    const { id } = req.params; // livestream ID
    
    const livestream = await LiveStream.findById(id)
      .populate({
        path: 'pinnedProducts.productId',
        populate: {
          path: 'category',
          select: 'name'
        }
      });
    
    if (!livestream) {
      return res.status(404).json({ message: 'Livestream not found' });
    }
    
    // Filter active pinned products and sort by display order
    const activePinnedProducts = livestream.pinnedProducts
      .filter(pin => pin.isActive)
      .sort((a, b) => a.displayOrder - b.displayOrder);
    
    res.json({
      message: 'Pinned products retrieved successfully',
      pinnedProducts: activePinnedProducts
    });
  } catch (error) {
    console.error('Error getting pinned products:', error);
    res.status(500).json({ message: 'Failed to get pinned products', error: error.message });
  }
};

// Update pinned product order
exports.updatePinnedProductOrder = async (req, res) => {
  try {
    const { id } = req.params; // livestream ID
    const { productOrders } = req.body; // Array of { productId, displayOrder }
    
    const livestream = await LiveStream.findById(id);
    if (!livestream) {
      return res.status(404).json({ message: 'Livestream not found' });
    }
    
    // Update display orders
    productOrders.forEach(({ productId, displayOrder }) => {
      const pinnedProduct = livestream.pinnedProducts.find(
        pin => pin.productId.toString() === productId && pin.isActive
      );
      if (pinnedProduct) {
        pinnedProduct.displayOrder = displayOrder;
      }
    });
    
    await livestream.save();
    
    // Populate the pinned products for response
    await livestream.populate('pinnedProducts.productId');
    
    const activePinnedProducts = livestream.pinnedProducts
      .filter(pin => pin.isActive)
      .sort((a, b) => a.displayOrder - b.displayOrder);
    
    // Broadcast pinned products update via WebSocket
    const wsManager = req.app.locals.wsManager;
    if (wsManager) {
      await wsManager.broadcastPinnedProductsUpdate({
        type: 'pinned_products_updated',
        pinnedProducts: activePinnedProducts
      });
      console.log('📌 Broadcasted pinned products update via WebSocket');
    }
    
    res.json({
      message: 'Pinned product order updated successfully',
      pinnedProducts: activePinnedProducts
    });
  } catch (error) {
    console.error('Error updating pinned product order:', error);
    res.status(500).json({ message: 'Failed to update pinned product order', error: error.message });
  }
};

// Generate Agora RTC token
exports.generateAgoraToken = async (req, res) => {
  try {
    const { channelName, uid = 0, role } = req.body;
    
    if (!channelName) {
      return res.status(400).json({ message: 'Channel name is required' });
    }

    // Get Agora credentials from environment variables
    const appId = process.env.AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;
    
    if (!appId || !appCertificate) {
      console.error('❌ Agora credentials not configured');
      return res.status(500).json({ 
        message: 'Agora credentials not configured. Please set AGORA_APP_ID and AGORA_APP_CERTIFICATE in .env file' 
      });
    }

    // Token expiration time: 24 hours from now
    const expirationTimeInSeconds = 86400; // 24 hours
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    // Determine role based on user type or request parameter
    // Admin/broadcaster uses PUBLISHER, anonymous/customers use SUBSCRIBER
    const isAdmin = req.user?.role === 'admin';
    const isAnonymous = !req.user;
    const tokenRole = (role === 'audience' || !isAdmin || isAnonymous) ? RtcRole.SUBSCRIBER : RtcRole.PUBLISHER;

    // Build token with appropriate role
    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      uid,
      tokenRole,
      privilegeExpiredTs
    );

    console.log('✅ Agora token generated:', {
      channelName,
      uid,
      role: tokenRole === RtcRole.PUBLISHER ? 'PUBLISHER' : 'SUBSCRIBER',
      isAdmin,
      isAnonymous,
      expiresIn: expirationTimeInSeconds,
      tokenLength: token.length
    });

    res.json({
      token,
      appId,
      channelName,
      uid,
      expiresAt: new Date(privilegeExpiredTs * 1000).toISOString()
    });
  } catch (error) {
    console.error('❌ Error generating Agora token:', error);
    res.status(500).json({ 
      message: 'Failed to generate Agora token', 
      error: error.message 
    });
  }
};

// Force cleanup all stuck active streams
exports.forceCleanupActiveStreams = async (req, res) => {
  try {
    console.log('🧹 Force cleanup: Searching for stuck active streams...');
    
    const activeStreams = await LiveStream.find({ isActive: true });
    
    if (activeStreams.length === 0) {
      return res.json({
        message: 'No active streams found',
        cleaned: 0
      });
    }
    
    console.log(`Found ${activeStreams.length} active stream(s), cleaning up...`);
    
    let cleanedCount = 0;
    for (const stream of activeStreams) {
      stream.isActive = false;
      stream.endTime = new Date();
      stream.duration = Math.floor((Date.now() - stream.startTime.getTime()) / 1000);
      await stream.save();
      cleanedCount++;
      console.log(`✅ Cleaned up stream: ${stream._id} (${stream.title})`);
    }
    
    res.json({
      message: `Successfully cleaned up ${cleanedCount} stuck stream(s)`,
      cleaned: cleanedCount,
      streams: activeStreams.map(s => ({
        id: s._id,
        title: s.title,
        startTime: s.startTime
      }))
    });
  } catch (error) {
    console.error('❌ Error forcing cleanup:', error);
    res.status(500).json({ 
      message: 'Failed to force cleanup streams', 
      error: error.message 
    });
  }
};

module.exports = exports;