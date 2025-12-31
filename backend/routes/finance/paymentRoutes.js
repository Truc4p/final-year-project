const express = require('express');
const router = express.Router();
const paymentController = require('../../controllers/finance/paymentController');
const auth = require('../../middleware/auth');
const role = require('../../middleware/role');

// Payment Batch Routes
router.get('/batches', auth, paymentController.getPaymentBatches);
router.get('/batches/:id', auth, paymentController.getPaymentBatch);
router.post('/batches', auth, role(['admin', 'finance_manager']), paymentController.createPaymentBatch);
router.put('/batches/:id', auth, role(['admin', 'finance_manager']), paymentController.updatePaymentBatch);
router.delete('/batches/:id', auth, role(['admin', 'finance_manager']), paymentController.deletePaymentBatch);

// Payment Batch Actions
router.post('/batches/:id/approve', auth, role(['admin', 'finance_manager', 'cfo']), paymentController.approveBatch);
router.post('/batches/:id/process', auth, role(['admin', 'finance_manager']), paymentController.processBatch);
router.post('/batches/:id/cancel', auth, role(['admin', 'finance_manager']), paymentController.cancelBatch);

// Scheduled Payment Routes
router.get('/scheduled', auth, paymentController.getScheduledPayments);
router.get('/scheduled/:id', auth, paymentController.getScheduledPayment);
router.post('/scheduled', auth, role(['admin', 'finance_manager']), paymentController.createScheduledPayment);
router.put('/scheduled/:id', auth, role(['admin', 'finance_manager']), paymentController.updateScheduledPayment);
router.delete('/scheduled/:id', auth, role(['admin', 'finance_manager']), paymentController.deleteScheduledPayment);

// Scheduled Payment Actions
router.post('/scheduled/:id/pause', auth, role(['admin', 'finance_manager']), paymentController.pauseScheduledPayment);
router.post('/scheduled/:id/resume', auth, role(['admin', 'finance_manager']), paymentController.resumeScheduledPayment);
router.post('/scheduled/:id/cancel', auth, role(['admin', 'finance_manager']), paymentController.cancelScheduledPayment);
router.post('/scheduled/:id/execute', auth, role(['admin', 'finance_manager']), paymentController.executeScheduledPayment);

// Payment Stats
router.get('/stats', auth, paymentController.getPaymentStats);

module.exports = router;
