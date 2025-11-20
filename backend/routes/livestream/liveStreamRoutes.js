const express = require('express');
const router = express.Router();
const liveStreamController = require('../../controllers/livestream/liveStreamController');
const auth = require('../../middleware/auth');
const optionalAuth = require('../../middleware/optionalAuth');
const role = require('../../middleware/role');

// Public routes (no authentication required)

// Get active livestream (must be before /:id to avoid matching 'active' as an ID)
router.get('/active', liveStreamController.getActiveLiveStream);

// Get all past livestreams for customers
router.get('/past', liveStreamController.getPastLiveStreams);

// Get specific livestream by ID
router.get('/:id', liveStreamController.getLiveStreamById);

// Increment view count (no auth required so anyone can watch)
router.post('/:id/view', liveStreamController.incrementViewCount);

// Add chat message to livestream (optional auth for username)
router.post('/:id/chat', optionalAuth, liveStreamController.addChatMessage);

// Protected routes (authentication required)

// Generate Agora RTC token (authenticated users)
router.post('/agora/token', auth, liveStreamController.generateAgoraToken);

// Force cleanup stuck active streams (admin only)
router.post('/cleanup', auth, role('admin'), liveStreamController.forceCleanupActiveStreams);

// Get all livestreams (admin only)
router.get('/', auth, role('admin'), liveStreamController.getAllLiveStreams);

// Create new livestream (admin only)
router.post('/', auth, role('admin'), liveStreamController.createLiveStream);

// Update livestream (admin only)
router.put('/:id', auth, role('admin'), liveStreamController.updateLiveStream);

// Stop livestream (admin only)
router.post('/:id/stop', auth, role('admin'), liveStreamController.stopLiveStream);

// Upload video file (admin only)
router.post('/:id/upload', auth, role('admin'), liveStreamController.uploadVideo, (req, res) => {
  res.json({
    message: 'Video uploaded successfully',
    filename: req.file.filename,
    path: req.file.path,
    size: req.file.size
  });
});

// Delete livestream (admin only)
router.delete('/:id', auth, role('admin'), liveStreamController.deleteLiveStream);

// Pinned Products Routes

// Get pinned products for a livestream (public)
router.get('/:id/pinned-products', liveStreamController.getPinnedProducts);

// Pin a product to livestream (admin only)
router.post('/:id/pin-product', auth, role('admin'), liveStreamController.pinProduct);

// Unpin a product from livestream (admin only)
router.delete('/:id/unpin-product/:productId', auth, role('admin'), liveStreamController.unpinProduct);

// Update pinned product order (admin only)
router.put('/:id/pinned-products/order', auth, role('admin'), liveStreamController.updatePinnedProductOrder);

module.exports = router;