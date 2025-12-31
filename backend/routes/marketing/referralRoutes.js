const express = require('express');
const router = express.Router();
const referralController = require('../../controllers/marketing/referralController');
const auth = require('../../middleware/auth');
const role = require('../../middleware/role');

// Public routes
router.post('/track-click', referralController.trackClick);

// Protected routes
router.use(auth);

// Customer/Admin routes
router.get('/referrals', referralController.getReferrals);
router.post('/referrals', referralController.createReferral);

// Admin only
router.use(role(['admin']));
router.put('/referrals/:id', referralController.updateReferral);

module.exports = router;
