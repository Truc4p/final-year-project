const express = require('express');
const router = express.Router();
const emailCampaignController = require('../../controllers/marketing/emailCampaignController');
const auth = require('../../middleware/auth');
const role = require('../../middleware/role');

// All routes require admin authentication
router.use(auth);
router.use(role(['admin']));

// Campaign management routes
router.get('/campaigns', emailCampaignController.getCampaigns);
router.get('/campaigns/stats', emailCampaignController.getCampaignStats);
router.get('/campaigns/:id', emailCampaignController.getCampaign);
router.post('/campaigns', emailCampaignController.createCampaign);
router.put('/campaigns/:id', emailCampaignController.updateCampaign);
router.delete('/campaigns/:id', emailCampaignController.deleteCampaign);

// General analytics routes
router.get('/analytics', emailCampaignController.getAnalytics);
router.get('/analytics/export', emailCampaignController.exportAnalytics);

// Campaign analytics and preview
router.get('/campaigns/:id/analytics', emailCampaignController.getCampaignAnalytics);
router.get('/campaigns/:id/preview', emailCampaignController.getCampaignPreview);

module.exports = router;