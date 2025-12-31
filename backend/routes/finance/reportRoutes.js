const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const reportController = require('../../controllers/finance/reportController');

// Get all reports
router.get('/', auth, reportController.getReports);

// Get templates
router.get('/templates', auth, reportController.getTemplates);

// Get popular reports
router.get('/popular', auth, reportController.getPopularReports);

// Get single report
router.get('/:id', auth, reportController.getReport);

// Create report
router.post('/', auth, reportController.createReport);

// Update report
router.put('/:id', auth, reportController.updateReport);

// Delete report
router.delete('/:id', auth, reportController.deleteReport);

// Run report
router.post('/:id/run', auth, reportController.runReport);

// Export report as PDF
router.get('/:id/export/pdf', auth, reportController.exportPDF);

// Export report as Excel
router.get('/:id/export/excel', auth, reportController.exportExcel);

// Duplicate report
router.post('/:id/duplicate', auth, reportController.duplicateReport);

// Share report
router.post('/:id/share', auth, reportController.shareReport);

module.exports = router;
