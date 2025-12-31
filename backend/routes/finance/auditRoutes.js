const express = require('express');
const router = express.Router();
const auditController = require('../../controllers/finance/auditController');
const { authenticateToken } = require('../../middleware/auth');
const { requireRole } = require('../../middleware/role');

// All routes require authentication
router.use(authenticateToken);

// ==================== AUDIT LOGS ====================

// Get all audit logs
router.get('/logs', requireRole(['admin', 'finance_manager', 'cfo', 'auditor']), auditController.getAuditLogs);

// Get single audit log
router.get('/logs/:id', requireRole(['admin', 'finance_manager', 'cfo', 'auditor']), auditController.getAuditLog);

// Get entity audit trail
router.get('/logs/entity/:entityType/:entityId', requireRole(['admin', 'finance_manager', 'cfo', 'auditor']), auditController.getEntityTrail);

// Get user activity
router.get('/logs/user/:userId', requireRole(['admin', 'finance_manager', 'cfo', 'auditor']), auditController.getUserActivity);

// Get compliance-flagged logs
router.get('/logs/compliance/flagged', requireRole(['admin', 'finance_manager', 'cfo', 'auditor']), auditController.getComplianceLogs);

// Get audit statistics
router.get('/logs/statistics', requireRole(['admin', 'finance_manager', 'cfo', 'auditor']), auditController.getAuditStatistics);

// Export audit logs
router.get('/logs/export', requireRole(['admin', 'finance_manager', 'cfo', 'auditor']), auditController.exportAuditLogs);

// Archive old logs
router.post('/logs/archive', requireRole(['admin', 'cfo']), auditController.archiveOldLogs);

// ==================== COMPLIANCE REPORTS ====================

// Get compliance dashboard
router.get('/dashboard', requireRole(['admin', 'finance_manager', 'cfo', 'auditor']), auditController.getComplianceDashboard);

// Get all compliance reports
router.get('/reports', requireRole(['admin', 'finance_manager', 'cfo', 'auditor']), auditController.getComplianceReports);

// Get single compliance report
router.get('/reports/:id', requireRole(['admin', 'finance_manager', 'cfo', 'auditor']), auditController.getComplianceReport);

// Create compliance report
router.post('/reports', requireRole(['admin', 'finance_manager', 'cfo', 'auditor']), auditController.createComplianceReport);

// Update compliance report
router.put('/reports/:id', requireRole(['admin', 'finance_manager', 'cfo', 'auditor']), auditController.updateComplianceReport);

// Delete compliance report
router.delete('/reports/:id', requireRole(['admin', 'cfo']), auditController.deleteComplianceReport);

// Submit report for review
router.post('/reports/:id/submit', requireRole(['admin', 'finance_manager', 'cfo', 'auditor']), auditController.submitForReview);

// Review report
router.post('/reports/:id/review', requireRole(['admin', 'finance_manager', 'cfo']), auditController.reviewReport);

// Approve report
router.post('/reports/:id/approve', requireRole(['admin', 'cfo']), auditController.approveReport);

// Archive report
router.post('/reports/:id/archive', requireRole(['admin', 'cfo']), auditController.archiveReport);

module.exports = router;
