const express = require('express');
const router = express.Router();
const taxController = require('../../controllers/finance/taxController');
const auth = require('../../middleware/auth');
const role = require('../../middleware/role');

// Tax Rate Routes
router.get('/rates', auth, taxController.getTaxRates);
router.get('/rates/applicable', auth, taxController.getApplicableRates);
router.get('/rates/:id', auth, taxController.getTaxRate);
router.post('/rates', auth, role(['admin', 'finance_manager']), taxController.createTaxRate);
router.put('/rates/:id', auth, role(['admin', 'finance_manager']), taxController.updateTaxRate);
router.delete('/rates/:id', auth, role(['admin', 'finance_manager']), taxController.deleteTaxRate);

// Tax Liability Routes
router.get('/liabilities', auth, taxController.getTaxLiabilities);
router.get('/liabilities/overdue', auth, taxController.getOverdueLiabilities);
router.get('/liabilities/:id', auth, taxController.getTaxLiability);
router.post('/liabilities', auth, role(['admin', 'finance_manager']), taxController.createTaxLiability);
router.put('/liabilities/:id', auth, role(['admin', 'finance_manager']), taxController.updateTaxLiability);
router.delete('/liabilities/:id', auth, role(['admin', 'finance_manager']), taxController.deleteTaxLiability);

// Tax Liability Actions
router.post('/liabilities/calculate', auth, role(['admin', 'finance_manager']), taxController.calculateTaxLiability);
router.post('/liabilities/:id/file', auth, role(['admin', 'finance_manager', 'cfo']), taxController.fileTaxLiability);
router.post('/liabilities/:id/payments', auth, role(['admin', 'finance_manager']), taxController.addPayment);
router.post('/liabilities/:id/penalties', auth, role(['admin', 'finance_manager']), taxController.calculatePenalties);

// Tax Reports
router.get('/summary', auth, taxController.getTaxSummary);

module.exports = router;
