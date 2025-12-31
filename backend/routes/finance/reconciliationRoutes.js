const express = require('express');
const router = express.Router();
const reconciliationController = require('../../controllers/finance/reconciliationController');
const auth = require('../../middleware/auth');
const roleAuth = require('../../middleware/role');

// All routes require authentication
router.use(auth);

// ==================== RECONCILIATION RULES ====================

// Get all rules
router.get('/rules', 
  roleAuth(['admin', 'accountant']), 
  reconciliationController.getReconciliationRules
);

// Get single rule
router.get('/rules/:id', 
  roleAuth(['admin', 'accountant']), 
  reconciliationController.getReconciliationRule
);

// Create rule
router.post('/rules', 
  roleAuth(['admin', 'accountant']), 
  reconciliationController.createReconciliationRule
);

// Update rule
router.put('/rules/:id', 
  roleAuth(['admin', 'accountant']), 
  reconciliationController.updateReconciliationRule
);

// Delete rule
router.delete('/rules/:id', 
  roleAuth(['admin']), 
  reconciliationController.deleteReconciliationRule
);

// Toggle rule status
router.patch('/rules/:id/toggle', 
  roleAuth(['admin', 'accountant']), 
  reconciliationController.toggleRuleStatus
);

// ==================== RECONCILIATION BATCHES ====================

// Get dashboard
router.get('/dashboard', 
  roleAuth(['admin', 'accountant']), 
  reconciliationController.getReconciliationDashboard
);

// Get all batches
router.get('/batches', 
  roleAuth(['admin', 'accountant']), 
  reconciliationController.getReconciliationBatches
);

// Get single batch
router.get('/batches/:id', 
  roleAuth(['admin', 'accountant']), 
  reconciliationController.getReconciliationBatch
);

// Create batch
router.post('/batches', 
  roleAuth(['admin', 'accountant']), 
  reconciliationController.createReconciliationBatch
);

// Update batch
router.put('/batches/:id', 
  roleAuth(['admin', 'accountant']), 
  reconciliationController.updateReconciliationBatch
);

// Delete batch
router.delete('/batches/:id', 
  roleAuth(['admin']), 
  reconciliationController.deleteReconciliationBatch
);

// ==================== RECONCILIATION PROCESSING ====================

// Load items for reconciliation
router.post('/batches/:id/load-items', 
  roleAuth(['admin', 'accountant']), 
  reconciliationController.loadReconciliationItems
);

// Run auto-matching
router.post('/batches/:id/auto-match', 
  roleAuth(['admin', 'accountant']), 
  reconciliationController.runAutoMatching
);

// Manual match
router.post('/batches/:id/manual-match', 
  roleAuth(['admin', 'accountant']), 
  reconciliationController.manualMatch
);

// Confirm match
router.post('/batches/:id/matches/:matchId/confirm', 
  roleAuth(['admin', 'accountant']), 
  reconciliationController.confirmMatch
);

// Reject match
router.post('/batches/:id/matches/:matchId/reject', 
  roleAuth(['admin', 'accountant']), 
  reconciliationController.rejectMatch
);

// Bulk confirm matches
router.post('/batches/:id/bulk-confirm', 
  roleAuth(['admin', 'accountant']), 
  reconciliationController.bulkConfirmMatches
);

// Get match suggestions
router.get('/batches/:id/suggestions', 
  roleAuth(['admin', 'accountant']), 
  reconciliationController.getMatchSuggestions
);

// ==================== DISCREPANCY MANAGEMENT ====================

// Get discrepancies
router.get('/batches/:id/discrepancies', 
  roleAuth(['admin', 'accountant']), 
  reconciliationController.getDiscrepancies
);

// Resolve discrepancy
router.post('/batches/:id/discrepancies/:discrepancyId/resolve', 
  roleAuth(['admin', 'accountant']), 
  reconciliationController.resolveDiscrepancy
);

// ==================== BATCH WORKFLOW ====================

// Submit for review
router.post('/batches/:id/submit-review', 
  roleAuth(['admin', 'accountant']), 
  reconciliationController.submitForReview
);

// Complete reconciliation
router.post('/batches/:id/complete', 
  roleAuth(['admin']), 
  reconciliationController.completeReconciliation
);

module.exports = router;
