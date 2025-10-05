const express = require('express');
const router = express.Router();
const emailTemplateController = require('../../controllers/marketing/emailTemplateController');
const auth = require('../../middleware/auth');
const role = require('../../middleware/role');

// All routes require admin authentication
router.use(auth);
router.use(role(['admin']));

// Template management routes
router.get('/', emailTemplateController.getTemplates);
router.get('/popular', emailTemplateController.getPopularTemplates);
router.get('/category/:category', emailTemplateController.getTemplatesByCategory);
router.get('/:id', emailTemplateController.getTemplate);
router.post('/', emailTemplateController.createTemplate);
router.put('/:id', emailTemplateController.updateTemplate);
router.delete('/:id', emailTemplateController.deleteTemplate);

// Template operations
router.post('/:id/preview', emailTemplateController.previewTemplate);
router.post('/:id/duplicate', emailTemplateController.duplicateTemplate);

module.exports = router;