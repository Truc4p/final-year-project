const express = require('express');
const router = express.Router();
const paymentController = require('../../controllers/finance/paymentController');
const { authenticateToken } = require('../../middleware/auth');
const { requireRole } = require('../../middleware/role');

// Payment Batch Routes
router.get('/batches', authenticateToken, paymentController.getPaymentBatches);
router.get('/batches/:id', authenticateToken, paymentController.getPaymentBatch);
router.post('/batches', authenticateToken, requireRole(['admin', 'finance_manager']), paymentController.createPaymentBatch);
router.put('/batches/:id', authenticateToken, requireRole(['admin', 'finance_manager']), paymentController.updatePaymentBatch);
router.delete('/batches/:id', authenticateToken, requireRole(['admin', 'finance_manager']), paymentController.deletePaymentBatch);

// Payment Batch Actions
router.post('/batches/:id/approve', authenticateToken, requireRole(['admin', 'finance_manager', 'cfo']), paymentController.approveBatch);
router.post('/batches/:id/process', authenticateToken, requireRole(['admin', 'finance_manager']), paymentController.processBatch);
router.post('/batches/:id/cancel', authenticateToken, requireRole(['admin', 'finance_manager']), paymentController.cancelBatch);

// Scheduled Payment Routes
router.get('/scheduled', authenticateToken, paymentController.getScheduledPayments);
router.get('/scheduled/:id', authenticateToken, paymentController.getScheduledPayment);
router.post('/scheduled', authenticateToken, requireRole(['admin', 'finance_manager']), paymentController.createScheduledPayment);
router.put('/scheduled/:id', authenticateToken, requireRole(['admin', 'finance_manager']), paymentController.updateScheduledPayment);
router.delete('/scheduled/:id', authenticateToken, requireRole(['admin', 'finance_manager']), paymentController.deleteScheduledPayment);

// Scheduled Payment Actions
router.post('/scheduled/:id/pause', authenticateToken, requireRole(['admin', 'finance_manager']), paymentController.pauseScheduledPayment);
router.post('/scheduled/:id/resume', authenticateToken, requireRole(['admin', 'finance_manager']), paymentController.resumeScheduledPayment);
router.post('/scheduled/:id/cancel', authenticateToken, requireRole(['admin', 'finance_manager']), paymentController.cancelScheduledPayment);
router.post('/scheduled/:id/execute', authenticateToken, requireRole(['admin', 'finance_manager']), paymentController.executeScheduledPayment);

// Payment Stats
router.get('/stats', authenticateToken, paymentController.getPaymentStats);

module.exports = router;
