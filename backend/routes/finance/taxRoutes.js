const express = require('express');
const router = express.Router();
const taxController = require('../../controllers/finance/taxController');
const { authenticateToken } = require('../../middleware/auth');
const { requireRole } = require('../../middleware/role');

// Tax Rate Routes
router.get('/rates', authenticateToken, taxController.getTaxRates);
router.get('/rates/applicable', authenticateToken, taxController.getApplicableRates);
router.get('/rates/:id', authenticateToken, taxController.getTaxRate);
router.post('/rates', authenticateToken, requireRole(['admin', 'finance_manager']), taxController.createTaxRate);
router.put('/rates/:id', authenticateToken, requireRole(['admin', 'finance_manager']), taxController.updateTaxRate);
router.delete('/rates/:id', authenticateToken, requireRole(['admin', 'finance_manager']), taxController.deleteTaxRate);

// Tax Liability Routes
router.get('/liabilities', authenticateToken, taxController.getTaxLiabilities);
router.get('/liabilities/overdue', authenticateToken, taxController.getOverdueLiabilities);
router.get('/liabilities/:id', authenticateToken, taxController.getTaxLiability);
router.post('/liabilities', authenticateToken, requireRole(['admin', 'finance_manager']), taxController.createTaxLiability);
router.put('/liabilities/:id', authenticateToken, requireRole(['admin', 'finance_manager']), taxController.updateTaxLiability);
router.delete('/liabilities/:id', authenticateToken, requireRole(['admin', 'finance_manager']), taxController.deleteTaxLiability);

// Tax Liability Actions
router.post('/liabilities/calculate', authenticateToken, requireRole(['admin', 'finance_manager']), taxController.calculateTaxLiability);
router.post('/liabilities/:id/file', authenticateToken, requireRole(['admin', 'finance_manager', 'cfo']), taxController.fileTaxLiability);
router.post('/liabilities/:id/payments', authenticateToken, requireRole(['admin', 'finance_manager']), taxController.addPayment);
router.post('/liabilities/:id/penalties', authenticateToken, requireRole(['admin', 'finance_manager']), taxController.calculatePenalties);

// Tax Reports
router.get('/summary', authenticateToken, taxController.getTaxSummary);

module.exports = router;
