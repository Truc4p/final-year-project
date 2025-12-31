const express = require('express');
const router = express.Router();
const fixedAssetController = require('../../controllers/finance/fixedAssetController');
const auth = require('../../middleware/auth');
const roleAuth = require('../../middleware/role');

// All routes require authentication
router.use(auth);

// ==================== DASHBOARD & REPORTS ====================

// Get dashboard
router.get('/dashboard', 
  roleAuth(['admin', 'accountant']), 
  fixedAssetController.getAssetsDashboard
);

// Get asset register report
router.get('/reports/register', 
  roleAuth(['admin', 'accountant']), 
  fixedAssetController.getAssetRegister
);

// Get depreciation report
router.get('/reports/depreciation', 
  roleAuth(['admin', 'accountant']), 
  fixedAssetController.getDepreciationReport
);

// ==================== ASSET CRUD ====================

// Get all assets
router.get('/', 
  roleAuth(['admin', 'accountant', 'manager']), 
  fixedAssetController.getFixedAssets
);

// Get single asset
router.get('/:id', 
  roleAuth(['admin', 'accountant', 'manager']), 
  fixedAssetController.getFixedAsset
);

// Create asset
router.post('/', 
  roleAuth(['admin', 'accountant']), 
  fixedAssetController.createFixedAsset
);

// Update asset
router.put('/:id', 
  roleAuth(['admin', 'accountant']), 
  fixedAssetController.updateFixedAsset
);

// Delete asset
router.delete('/:id', 
  roleAuth(['admin']), 
  fixedAssetController.deleteFixedAsset
);

// ==================== DEPRECIATION ====================

// Get depreciation schedule
router.get('/:id/depreciation-schedule', 
  roleAuth(['admin', 'accountant']), 
  fixedAssetController.getDepreciationSchedule
);

// Regenerate depreciation schedule
router.post('/:id/regenerate-schedule', 
  roleAuth(['admin', 'accountant']), 
  fixedAssetController.regenerateDepreciationSchedule
);

// Process depreciation for single asset
router.post('/:id/process-depreciation', 
  roleAuth(['admin', 'accountant']), 
  fixedAssetController.processDepreciation
);

// Bulk process depreciation for all assets
router.post('/bulk-depreciation', 
  roleAuth(['admin', 'accountant']), 
  fixedAssetController.bulkProcessDepreciation
);

// ==================== DISPOSAL & REVALUATION ====================

// Dispose asset
router.post('/:id/dispose', 
  roleAuth(['admin']), 
  fixedAssetController.disposeAsset
);

// Revalue asset
router.post('/:id/revalue', 
  roleAuth(['admin']), 
  fixedAssetController.revalueAsset
);

// Transfer asset
router.post('/:id/transfer', 
  roleAuth(['admin', 'accountant']), 
  fixedAssetController.transferAsset
);

// ==================== MAINTENANCE ====================

// Add maintenance record
router.post('/:id/maintenance', 
  roleAuth(['admin', 'accountant', 'manager']), 
  fixedAssetController.addMaintenanceRecord
);

// Get maintenance history
router.get('/:id/maintenance', 
  roleAuth(['admin', 'accountant', 'manager']), 
  fixedAssetController.getMaintenanceHistory
);

module.exports = router;
