const express = require('express');
const router = express.Router();
const newsletterController = require('../../controllers/marketing/newsletterController');
const optionalAuth = require('../../middleware/optionalAuth');
const auth = require('../../middleware/auth');
const role = require('../../middleware/role');

// Public routes
router.post('/subscribe', optionalAuth, newsletterController.subscribe);
router.post('/unsubscribe/:token', newsletterController.unsubscribe);
router.put('/preferences/:token', newsletterController.updatePreferences);

// Admin routes - Enhanced subscriber management
router.get('/subscriptions', auth, role(['admin']), newsletterController.getActiveSubscriptions);
router.get('/subscriptions/analytics', auth, role(['admin']), newsletterController.getSubscriptionAnalytics);
router.get('/subscriptions/export', auth, role(['admin']), newsletterController.exportSubscriptions);
router.get('/subscriptions/stats', auth, role(['admin']), newsletterController.getSubscriptionStats);
router.get('/subscriptions/:id', auth, role(['admin']), newsletterController.getSubscription);
router.put('/subscriptions/:id', auth, role(['admin']), newsletterController.updateSubscription);
router.post('/subscriptions/bulk', auth, role(['admin']), newsletterController.bulkUpdateSubscriptions);

module.exports = router;