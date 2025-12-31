const express = require('express');
const router = express.Router();
const postTemplateController = require('../../controllers/marketing/postTemplateController');
const auth = require('../../middleware/auth');
const role = require('../../middleware/role');

// All routes require admin authentication
router.use(auth);
router.use(role(['admin']));

// Template management routes
router.get('/templates', postTemplateController.getTemplates);
router.get('/templates/:id', postTemplateController.getTemplate);
router.post('/templates', postTemplateController.createTemplate);
router.put('/templates/:id', postTemplateController.updateTemplate);
router.delete('/templates/:id', postTemplateController.deleteTemplate);
router.post('/templates/:id/use', postTemplateController.incrementUsage);

module.exports = router;
