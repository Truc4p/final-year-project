/**
 * Financial Forecasting Routes
 * AI-powered predictions, scenario planning, trend analysis
 */
const express = require('express');
const router = express.Router();
const forecastController = require('../../controllers/finance/forecastController');
const auth = require('../../middleware/auth');
const role = require('../../middleware/role');

// Apply auth middleware to all routes
router.use(auth);

// Dashboard
router.get('/dashboard', forecastController.getForecastDashboard);

// CRUD operations
router.get('/', forecastController.getForecasts);
router.get('/:id', forecastController.getForecast);
router.post('/', role(['admin', 'finance_manager']), forecastController.createForecast);
router.put('/:id', role(['admin', 'finance_manager']), forecastController.updateForecast);
router.delete('/:id', role(['admin']), forecastController.deleteForecast);

// Prediction generation
router.post('/:id/generate', role(['admin', 'finance_manager']), forecastController.generatePredictions);

// Trend analysis
router.get('/:id/trends', forecastController.getTrendAnalysis);

// Scenarios
router.get('/:id/scenarios', forecastController.getScenarios);
router.post('/:id/scenarios', role(['admin', 'finance_manager']), forecastController.createScenario);
router.post('/:id/scenarios/compare', forecastController.compareScenarios);

// KPI tracking
router.get('/:id/kpi', forecastController.getKPITracking);
router.post('/:id/kpi', role(['admin', 'finance_manager']), forecastController.setKPITargets);

// Recommendations
router.get('/:id/recommendations', forecastController.getRecommendations);

// Workflow
router.post('/:id/approve', role(['admin', 'finance_manager']), forecastController.approveForecast);
router.post('/:id/archive', role(['admin']), forecastController.archiveForecast);

// Accuracy tracking
router.get('/:id/accuracy', forecastController.trackAccuracy);

module.exports = router;
