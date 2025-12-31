const express = require('express');
const router = express.Router();
const auditController = require('../../controllers/finance/auditController');
const auth = require('../../middleware/auth');
const role = require('../../middleware/role');

// All routes require authentication
router.use(auth);

// ==================== AUDIT LOGS ====================

// Get all audit logs
router.get('/logs', role(['admin', 'finance_manager', 'cfo', 'auditor']), auditController.getAuditLogs);

// Get single audit log
router.get('/logs/:id', role(['admin', 'finance_manager', 'cfo', 'auditor']), auditController.getAuditLog);

// Get entity audit trail
router.get('/logs/entity/:entityType/:entityId', role(['admin', 'finance_manager', 'cfo', 'auditor']), auditController.getEntityTrail);

// Get user activity
router.get('/logs/user/:userId', role(['admin', 'finance_manager', 'cfo', 'auditor']), auditController.getUserActivity);

// Get compliance-flagged logs
router.get('/logs/compliance/flagged', role(['admin', 'finance_manager', 'cfo', 'auditor']), auditController.getComplianceLogs);

// Get audit statistics
router.get('/logs/statistics', role(['admin', 'finance_manager', 'cfo', 'auditor']), auditController.getAuditStatistics);

// Export audit logs
router.get('/logs/export', role(['admin', 'finance_manager', 'cfo', 'auditor']), auditController.exportAuditLogs);

// Archive old logs
router.post('/logs/archive', role(['admin', 'cfo']), auditController.archiveOldLogs);

// ==================== COMPLIANCE REPORTS ====================

// Get compliance dashboard
router.get('/dashboard', role(['admin', 'finance_manager', 'cfo', 'auditor']), auditController.getComplianceDashboard);

// Get all compliance reports
router.get('/reports', role(['admin', 'finance_manager', 'cfo', 'auditor']), auditController.getComplianceReports);

// Get single compliance report
router.get('/reports/:id', role(['admin', 'finance_manager', 'cfo', 'auditor']), auditController.getComplianceReport);

// Create compliance report
router.post('/reports', role(['admin', 'finance_manager', 'cfo', 'auditor']), auditController.createComplianceReport);

// Update compliance report
router.put('/reports/:id', role(['admin', 'finance_manager', 'cfo', 'auditor']), auditController.updateComplianceReport);

// Delete compliance report
router.delete('/reports/:id', role(['admin', 'cfo']), auditController.deleteComplianceReport);

// Submit report for review
router.post('/reports/:id/submit', role(['admin', 'finance_manager', 'cfo', 'auditor']), auditController.submitForReview);

// Review report
router.post('/reports/:id/review', role(['admin', 'finance_manager', 'cfo']), auditController.reviewReport);

// Approve report
router.post('/reports/:id/approve', role(['admin', 'cfo']), auditController.approveReport);

// Archive report
router.post('/reports/:id/archive', role(['admin', 'cfo']), auditController.archiveReport);

module.exports = router;
