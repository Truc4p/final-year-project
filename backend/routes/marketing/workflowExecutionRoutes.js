const express = require('express');
const router = express.Router();
const workflowExecutionController = require('../../controllers/marketing/workflowExecutionController');
const auth = require('../../middleware/auth');
const role = require('../../middleware/role');

router.use(auth);

// Get executions (admin or customer's own)
router.get('/executions', workflowExecutionController.getExecutions);
router.get('/executions/:id', workflowExecutionController.getExecution);

// Admin only routes
router.use(role(['admin']));
router.post('/executions/trigger', workflowExecutionController.triggerWorkflow);
router.post('/executions/:id/cancel', workflowExecutionController.cancelExecution);
router.post('/executions/:id/retry', workflowExecutionController.retryExecution);

module.exports = router;
