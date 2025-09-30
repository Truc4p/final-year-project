const express = require('express');
const router = express.Router();
const newsletterController = require('../controllers/newsletterController');
const optionalAuth = require('../middleware/optionalAuth');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// Public routes
router.post('/subscribe', optionalAuth, newsletterController.subscribe);
router.post('/unsubscribe/:token', newsletterController.unsubscribe);
router.put('/preferences/:token', newsletterController.updatePreferences);

// Admin routes
router.get('/subscriptions', auth, role(['admin']), newsletterController.getActiveSubscriptions);
router.get('/stats', auth, role(['admin']), newsletterController.getSubscriptionStats);

module.exports = router;