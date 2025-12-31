const express = require('express');
const router = express.Router();
const referralRewardController = require('../../controllers/marketing/referralRewardController');
const auth = require('../../middleware/auth');
const role = require('../../middleware/role');

router.use(auth);

// Customer route
router.get('/customers/:customerId/rewards', referralRewardController.getCustomerRewards);

// Admin routes
router.use(role(['admin']));
router.get('/rewards', referralRewardController.getRewards);
router.post('/rewards/:id/distribute', referralRewardController.distributeReward);
router.post('/rewards/:id/cancel', referralRewardController.cancelReward);

module.exports = router;
