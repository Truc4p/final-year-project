const express = require('express');
const router = express.Router();
const workflowController = require('../../controllers/marketing/workflowController');
const auth = require('../../middleware/auth');
const role = require('../../middleware/role');

// All routes require admin authentication
router.use(auth);
router.use(role(['admin']));

// Workflow CRUD routes
router.get('/workflows', workflowController.getWorkflows);
router.get('/workflows/:id', workflowController.getWorkflow);
router.post('/workflows', workflowController.createWorkflow);
router.put('/workflows/:id', workflowController.updateWorkflow);
router.delete('/workflows/:id', workflowController.deleteWorkflow);

// Workflow actions
router.post('/workflows/:id/activate', workflowController.activateWorkflow);
router.post('/workflows/:id/pause', workflowController.pauseWorkflow);
router.post('/workflows/:id/duplicate', workflowController.duplicateWorkflow);

// Analytics
router.get('/workflows/:id/analytics', workflowController.getWorkflowAnalytics);

module.exports = router;
