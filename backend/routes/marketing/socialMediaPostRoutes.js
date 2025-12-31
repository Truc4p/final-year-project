const express = require('express');
const router = express.Router();
const socialMediaPostController = require('../../controllers/marketing/socialMediaPostController');
const auth = require('../../middleware/auth');
const role = require('../../middleware/role');

// All routes require admin authentication
router.use(auth);
router.use(role(['admin']));

// Post management routes
router.get('/posts', socialMediaPostController.getPosts);
router.get('/posts/stats', socialMediaPostController.getStats);
router.get('/posts/calendar', socialMediaPostController.getCalendar);
router.get('/posts/:id', socialMediaPostController.getPost);
router.post('/posts', socialMediaPostController.createPost);
router.put('/posts/:id', socialMediaPostController.updatePost);
router.delete('/posts/:id', socialMediaPostController.deletePost);

// Post publishing
router.post('/posts/:id/publish', socialMediaPostController.publishPost);

// Post analytics
router.get('/posts/:id/analytics', socialMediaPostController.getPostAnalytics);

// Hashtag suggestions
router.get('/hashtags/suggestions', socialMediaPostController.getHashtagSuggestions);

module.exports = router;
