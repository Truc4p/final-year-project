const express = require('express');
const router = express.Router();
const {
  createBankAccount,
  getBankAccounts,
  getBankAccount,
  updateBankAccount,
  deleteBankAccount,
  addTransaction,
  getTransactions,
  getUnreconciledTransactions,
  reconcileTransaction,
  createReconciliation,
  getReconciliations,
  completeReconciliation,
  getBalanceAtDate,
  postTransactionToGeneralLedger,
  getAccountsNeedingReconciliation,
  getPrimaryAccount,
  getBankAccountSummary
} = require('../../controllers/finance/bankAccountController');

// Middleware for authentication (adjust based on your auth setup)
const { protect } = require('../../middleware/auth');

// Apply authentication middleware to all routes
router.use(protect);

// Bank Account CRUD Operations
router.post('/', createBankAccount);
router.get('/', getBankAccounts);
router.get('/primary', getPrimaryAccount);
router.get('/needs-reconciliation', getAccountsNeedingReconciliation);
router.get('/:id', getBankAccount);
router.get('/:id/summary', getBankAccountSummary);
router.put('/:id', updateBankAccount);
router.delete('/:id', deleteBankAccount);

// Transaction Management
router.post('/:id/transactions', addTransaction);
router.get('/:id/transactions', getTransactions);
router.get('/:id/unreconciled', getUnreconciledTransactions);
router.put('/:id/transactions/:transactionId/reconcile', reconcileTransaction);
router.post('/:id/transactions/:transactionId/post', postTransactionToGeneralLedger);

// Balance Queries
router.get('/:id/balance-at-date', getBalanceAtDate);

// Reconciliation Management
router.post('/:id/reconciliations', createReconciliation);
router.get('/:id/reconciliations', getReconciliations);
router.put('/:id/reconciliations/:reconciliationId/complete', completeReconciliation);

module.exports = router;

