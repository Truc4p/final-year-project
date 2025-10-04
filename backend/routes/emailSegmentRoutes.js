const express = require('express');
const router = express.Router();
const {
  getSegments,
  createSegment,
  updateSegment,
  deleteSegment,
  getSegmentSubscribers,
  previewSegment,
  refreshAllCounts,
  initializeDefaultSegments
} = require('../controllers/emailSegmentController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// Apply authentication middleware to all routes
router.use(auth);
router.use(role(['admin']));

// Get all segments
router.get('/', getSegments);

// Create new segment
router.post('/', createSegment);

// Preview segment (before saving)
router.post('/preview', previewSegment);

// Initialize default segments
router.post('/initialize', initializeDefaultSegments);

// Refresh all segment counts
router.post('/refresh-counts', refreshAllCounts);

// Get specific segment subscribers
router.get('/:id/subscribers', getSegmentSubscribers);

// Update segment
router.put('/:id', updateSegment);

// Delete segment
router.delete('/:id', deleteSegment);

module.exports = router;