const express = require('express');
const router = express.Router();
const emailTemplateController = require('../controllers/emailTemplateController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// All routes require admin authentication
router.use(auth);
router.use(role(['admin']));

// Template management routes
router.get('/templates', emailTemplateController.getTemplates);
router.get('/templates/popular', emailTemplateController.getPopularTemplates);
router.get('/templates/category/:category', emailTemplateController.getTemplatesByCategory);
router.get('/templates/:id', emailTemplateController.getTemplate);
router.post('/templates', emailTemplateController.createTemplate);
router.put('/templates/:id', emailTemplateController.updateTemplate);
router.delete('/templates/:id', emailTemplateController.deleteTemplate);

// Template operations
router.post('/templates/:id/preview', emailTemplateController.previewTemplate);
router.post('/templates/:id/duplicate', emailTemplateController.duplicateTemplate);

module.exports = router;