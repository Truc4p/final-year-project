const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const role = require('../../middleware/role');

// Controllers
const adCampaignController = require('../../controllers/marketing/adCampaignController');
const trackingPixelController = require('../../controllers/marketing/trackingPixelController');
const audienceController = require('../../controllers/marketing/audienceController');
const adPlatformController = require('../../controllers/marketing/adPlatformController');
const adAnalyticsController = require('../../controllers/marketing/adAnalyticsController');

// =============================================================================
// TRACKING PIXELS
// =============================================================================

// Public tracking endpoints (no auth required)
router.get('/tracking/pixel.js', trackingPixelController.getPixelScript);
router.post('/tracking/event', trackingPixelController.trackEvent);

// Pixel management (auth required)
router.get('/pixels', auth, trackingPixelController.getPixels);
router.get('/pixels/:id', auth, trackingPixelController.getPixel);
router.post('/pixels', auth, role(['admin', 'marketing_manager']), trackingPixelController.createPixel);
router.put('/pixels/:id', auth, role(['admin', 'marketing_manager']), trackingPixelController.updatePixel);
router.delete('/pixels/:id', auth, role(['admin', 'marketing_manager']), trackingPixelController.deletePixel);

// Pixel analytics
router.get('/pixels/:id/events', auth, trackingPixelController.getPixelEvents);
router.get('/pixels/:id/analytics', auth, trackingPixelController.getPixelAnalytics);

// Cart abandoners
router.get('/tracking/cart-abandoners', auth, trackingPixelController.getCartAbandoners);

// =============================================================================
// AUDIENCES
// =============================================================================

router.get('/audiences', auth, audienceController.getAudiences);
router.get('/audiences/:id', auth, audienceController.getAudience);
router.post('/audiences', auth, role(['admin', 'marketing_manager']), audienceController.createAudience);
router.put('/audiences/:id', auth, role(['admin', 'marketing_manager']), audienceController.updateAudience);
router.delete('/audiences/:id', auth, role(['admin', 'marketing_manager']), audienceController.deleteAudience);

// Audience operations
router.post('/audiences/:id/refresh', auth, role(['admin', 'marketing_manager']), audienceController.refreshAudience);
router.get('/audiences/:id/members', auth, audienceController.getAudienceMembers);
router.get('/audiences/:id/overlap', auth, audienceController.getAudienceOverlap);
router.post('/audiences/:id/sync', auth, role(['admin', 'marketing_manager']), audienceController.syncAudienceToPlatform);

// Predefined audience creation
router.post('/audiences/cart-abandoners', auth, role(['admin', 'marketing_manager']), audienceController.createCartAbandonersAudience);
router.post('/audiences/product-viewers', auth, role(['admin', 'marketing_manager']), audienceController.createProductViewersAudience);
router.post('/audiences/purchasers', auth, role(['admin', 'marketing_manager']), audienceController.createPurchasersAudience);
router.post('/audiences/lookalike', auth, role(['admin', 'marketing_manager']), audienceController.createLookalikeAudience);

// =============================================================================
// AD CAMPAIGNS
// =============================================================================

router.get('/campaigns', auth, adCampaignController.getCampaigns);
router.get('/campaigns/:id', auth, adCampaignController.getCampaign);
router.post('/campaigns', auth, role(['admin', 'marketing_manager']), adCampaignController.createCampaign);
router.put('/campaigns/:id', auth, role(['admin', 'marketing_manager']), adCampaignController.updateCampaign);
router.delete('/campaigns/:id', auth, role(['admin', 'marketing_manager']), adCampaignController.deleteCampaign);

// Campaign operations
router.get('/campaigns/:id/performance', auth, adCampaignController.getCampaignPerformance);
router.post('/campaigns/:id/toggle-status', auth, role(['admin', 'marketing_manager']), adCampaignController.toggleCampaignStatus);

// =============================================================================
// AD CREATIVES
// =============================================================================

router.get('/creatives', auth, adCampaignController.getCreatives);
router.post('/creatives', auth, role(['admin', 'marketing_manager']), adCampaignController.createCreative);
router.put('/creatives/:id', auth, role(['admin', 'marketing_manager']), adCampaignController.updateCreative);
router.delete('/creatives/:id', auth, role(['admin', 'marketing_manager']), adCampaignController.deleteCreative);

// =============================================================================
// BUDGETS
// =============================================================================

router.get('/budgets', auth, adCampaignController.getBudgets);
router.post('/budgets', auth, role(['admin', 'marketing_manager']), adCampaignController.createBudget);
router.put('/budgets/:id', auth, role(['admin', 'marketing_manager']), adCampaignController.updateBudget);
router.post('/budgets/:id/spend', auth, role(['admin', 'marketing_manager']), adCampaignController.recordSpend);

// =============================================================================
// AD PLATFORMS
// =============================================================================

router.get('/platforms', auth, adPlatformController.getConnections);
router.get('/platforms/:id', auth, adPlatformController.getConnection);
router.post('/platforms', auth, role(['admin', 'marketing_manager']), adPlatformController.createConnection);
router.put('/platforms/:id', auth, role(['admin', 'marketing_manager']), adPlatformController.updateConnection);
router.delete('/platforms/:id', auth, role(['admin', 'marketing_manager']), adPlatformController.deleteConnection);

// Platform operations
router.post('/platforms/:id/test', auth, role(['admin', 'marketing_manager']), adPlatformController.testConnectionEndpoint);
router.post('/platforms/:id/sync', auth, role(['admin', 'marketing_manager']), adPlatformController.syncPlatformData);

// OAuth callback
router.get('/platforms/oauth/callback', adPlatformController.oauthCallback);

// =============================================================================
// ANALYTICS & REPORTING
// =============================================================================

router.get('/analytics/dashboard', auth, adAnalyticsController.getDashboardSummary);
router.get('/analytics/performance', auth, adAnalyticsController.getCampaignPerformance);
router.get('/analytics/creative-performance', auth, adAnalyticsController.getCreativePerformance);
router.get('/analytics/roi', auth, adAnalyticsController.getROIAnalysis);
router.get('/analytics/conversion-funnel', auth, adAnalyticsController.getConversionFunnel);
router.get('/analytics/budget-utilization', auth, adAnalyticsController.getBudgetUtilization);

module.exports = router;
