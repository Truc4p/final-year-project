const express = require('express');
const router = express.Router();
const socialMediaAnalyticsController = require('../../controllers/marketing/socialMediaAnalyticsController');
const auth = require('../../middleware/auth');
const role = require('../../middleware/role');

// All routes require admin authentication
router.use(auth);
router.use(role(['admin']));

// Analytics routes
router.get('/analytics', socialMediaAnalyticsController.getOverallAnalytics);
router.get('/analytics/post/:postId', socialMediaAnalyticsController.getPostAnalytics);
router.post('/analytics/sync/:postId', socialMediaAnalyticsController.syncAnalytics);

// Comment management routes
router.get('/comments', socialMediaAnalyticsController.getComments);
router.post('/comments/:analyticsId/:commentId/reply', socialMediaAnalyticsController.replyToComment);
router.put('/comments/:analyticsId/:commentId/visibility', socialMediaAnalyticsController.toggleCommentVisibility);

module.exports = router;
