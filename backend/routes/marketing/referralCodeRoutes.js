const express = require('express');
const router = express.Router();
const referralCodeController = require('../../controllers/marketing/referralCodeController');
const auth = require('../../middleware/auth');
const role = require('../../middleware/role');

// Public route - validate referral code
router.get('/validate/:code', referralCodeController.getCodeByString);

// Protected routes
router.use(auth);
router.use(role(['admin']));

router.get('/codes', referralCodeController.getCodes);
router.post('/codes/generate', referralCodeController.generateCode);
router.put('/codes/:id', referralCodeController.updateCode);
router.delete('/codes/:id', referralCodeController.deleteCode);
router.get('/codes/:id/analytics', referralCodeController.getCodeAnalytics);

module.exports = router;
