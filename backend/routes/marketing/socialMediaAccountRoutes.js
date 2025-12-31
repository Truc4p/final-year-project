const express = require('express');
const router = express.Router();
const socialMediaAccountController = require('../../controllers/marketing/socialMediaAccountController');
const auth = require('../../middleware/auth');
const role = require('../../middleware/role');

// All routes require admin authentication
router.use(auth);
router.use(role(['admin']));

// Account management routes
router.get('/accounts', socialMediaAccountController.getAccounts);
router.post('/accounts/connect', socialMediaAccountController.connectAccount);
router.post('/accounts/:id/sync', socialMediaAccountController.syncAccount);
router.post('/accounts/:id/disconnect', socialMediaAccountController.disconnectAccount);
router.delete('/accounts/:id', socialMediaAccountController.deleteAccount);

module.exports = router;
