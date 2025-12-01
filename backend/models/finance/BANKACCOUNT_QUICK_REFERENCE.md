# BankAccount Model - Quick Reference Card

## 🚀 Quick Start

### Import & Use
```javascript
const BankAccount = require('./models/finance/bankAccount');

// Create
const account = new BankAccount({ ... });
await account.save();

// Read
const account = await BankAccount.findById(id);

// Update
await BankAccount.findByIdAndUpdate(id, { ... });

// Delete
await BankAccount.findByIdAndDelete(id);
```

---

## 📋 Essential Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `accountName` | String | ✅ | e.g., "Main Operating Account" |
| `accountNumber` | String | ✅ | Unique, auto-masked |
| `bankName` | String | ✅ | e.g., "Chase Bank" |
| `accountType` | String | ✅ | checking, savings, money_market, etc. |
| `chartOfAccountsEntry` | ObjectId | ✅ | Link to Chart of Accounts |
| `currentBalance` | Number | ❌ | Auto-calculated |
| `isPrimary` | Boolean | ❌ | Default: false |
| `isActive` | Boolean | ❌ | Default: true |

---

## 🔧 Common Methods

### Add Transaction
```javascript
await account.addTransaction({
  transactionDate: new Date(),
  description: 'Payment received',
  amount: 5000,
  transactionType: 'deposit',
  reference: 'DEP-001'
}, userId);
```

### Get Unreconciled Transactions
```javascript
const txns = account.getUnreconciledTransactions();
```

### Create Reconciliation
```javascript
const recon = await account.createReconciliation({
  statementStartDate: new Date('2024-01-01'),
  statementEndDate: new Date('2024-01-31'),
  statementBalance: 50000,
  bookBalance: 50000,
  bankFees: 25,
  interestEarned: 50
}, userId);
```

### Complete Reconciliation
```javascript
await account.completeReconciliation(reconciliationId, userId);
```

### Get Balance at Date
```javascript
const balance = account.getBalanceAtDate(new Date('2024-01-15'));
```

---

## 🔌 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/` | Create account |
| GET | `/` | List accounts |
| GET | `/:id` | Get account |
| GET | `/:id/summary` | Get summary |
| PUT | `/:id` | Update account |
| DELETE | `/:id` | Delete account |
| POST | `/:id/transactions` | Add transaction |
| GET | `/:id/transactions` | List transactions |
| GET | `/:id/unreconciled` | Get unreconciled |
| PUT | `/:id/transactions/:txnId/reconcile` | Reconcile txn |
| POST | `/:id/reconciliations` | Create reconciliation |
| GET | `/:id/reconciliations` | List reconciliations |
| PUT | `/:id/reconciliations/:reconId/complete` | Complete reconciliation |
| GET | `/:id/balance-at-date` | Historical balance |
| GET | `/primary` | Get primary account |
| GET | `/needs-reconciliation` | Overdue accounts |

---

## 💾 Transaction Types

```
'deposit'      - Money in
'withdrawal'   - Money out
'transfer'     - Account transfer
'fee'          - Bank fee
'interest'     - Interest earned
'check'        - Check payment
'ach'          - ACH transfer
'wire'         - Wire transfer
'other'        - Other
```

---

## 🔄 Reconciliation Statuses

```
'draft'        - In progress
'in_progress'  - Being worked on
'reconciled'   - Complete
'discrepancy'  - Has differences
```

---

## 📊 Virtual Fields

```javascript
account.displayAccountNumber    // ****1234
account.bankDisplay             // Chase Bank - Downtown
account.unreconciledBalance     // Sum of unreconciled txns
account.pendingReconciliationCount // Count of unreconciled
```

---

## 🎯 Typical Workflows

### Daily Entry
```javascript
const account = await BankAccount.getPrimaryAccount();
await account.addTransaction({
  transactionDate: new Date(),
  description: 'Customer payment',
  amount: 5000,
  transactionType: 'deposit'
}, userId);
```

### Monthly Reconciliation
```javascript
const recon = await account.createReconciliation({
  statementStartDate: new Date('2024-01-01'),
  statementEndDate: new Date('2024-01-31'),
  statementBalance: 50000,
  bookBalance: 50000
}, userId);

// Reconcile transactions
const unreconciledTxns = account.getUnreconciledTransactions();
for (const txn of unreconciledTxns) {
  await account.reconcileTransaction(txn._id, recon._id);
}

// Complete if balanced
if (recon.difference === 0) {
  await account.completeReconciliation(recon._id, userId);
}
```

### Get Summary
```javascript
const summary = await BankAccount.findById(id)
  .then(acc => ({
    balance: acc.currentBalance,
    unreconciled: acc.unreconciledBalance,
    pendingCount: acc.pendingReconciliationCount,
    lastRecon: acc.lastReconciliationDate
  }));
```

---

## 🔐 Security Notes

- Account numbers auto-masked: `****1234`
- All operations tracked: `createdBy`, timestamps
- Requires authentication on all endpoints
- Reconciliation approval recommended
- Sensitive data should be encrypted

---

## ⚠️ Common Errors

| Error | Solution |
|-------|----------|
| "Chart of Accounts entry not found" | Verify chartOfAccountsEntry ID exists |
| "Cannot complete reconciliation with outstanding differences" | Ensure statementBalance === bookBalance |
| "Bank account with this account number already exists" | Use unique account number |
| "Cannot delete account with existing transactions" | Mark as inactive instead |

---

## 📈 Performance Tips

1. Use indexes on frequently queried fields
2. Limit transaction array size (archive old transactions)
3. Use pagination for large transaction lists
4. Cache primary account reference
5. Index reconciliation status for quick lookups

---

## 🔗 Integration Checklist

- [ ] Link to Chart of Accounts
- [ ] Create primary account
- [ ] Add invoice payment transactions
- [ ] Add bill payment transactions
- [ ] Post transactions to general ledger
- [ ] Set up reconciliation schedule
- [ ] Create reconciliation dashboard
- [ ] Add transaction import (CSV/OFX)

---

## 📚 Documentation

- **Full Guide**: `BANKACCOUNT_GUIDE.md`
- **API Docs**: `BANKACCOUNT_API_DOCS.md`
- **Integration**: `INTEGRATION_GUIDE_BANKACCOUNT.md`
- **Model**: `bankAccount.js`
- **Controller**: `bankAccountController.js`
- **Routes**: `bankAccountRoutes.js`

---

## 🎓 Example: Complete Workflow

```javascript
// 1. Create Chart of Accounts entry
const coa = new ChartOfAccounts({
  accountCode: '1010',
  accountName: 'Cash - Main Account',
  accountType: 'asset',
  bankAccount: true,
  createdBy: userId
});
await coa.save();

// 2. Create bank account
const account = new BankAccount({
  accountName: 'Main Operating Account',
  accountNumber: '1234567890',
  bankName: 'Chase Bank',
  accountType: 'checking',
  chartOfAccountsEntry: coa._id,
  isPrimary: true,
  createdBy: userId
});
await account.save();

// 3. Add transactions
await account.addTransaction({
  transactionDate: new Date('2024-01-15'),
  description: 'Customer Payment',
  amount: 5000,
  transactionType: 'deposit',
  reference: 'DEP-001'
}, userId);

// 4. Create reconciliation
const recon = await account.createReconciliation({
  statementStartDate: new Date('2024-01-01'),
  statementEndDate: new Date('2024-01-31'),
  statementBalance: 5000,
  bookBalance: 5000,
  bankFees: 0,
  interestEarned: 0
}, userId);

// 5. Reconcile transactions
const txns = account.getUnreconciledTransactions();
for (const txn of txns) {
  await account.reconcileTransaction(txn._id, recon._id);
}

// 6. Complete reconciliation
await account.completeReconciliation(recon._id, userId);

// 7. Get summary
const summary = await BankAccount.findById(account._id).then(acc => ({
  balance: acc.currentBalance,
  lastRecon: acc.lastReconciliationDate,
  nextDue: acc.nextReconciliationDue
}));
```

---

## 🚀 Ready to Use!

Your BankAccount model is production-ready with:
- ✅ Complete CRUD operations
- ✅ Transaction management
- ✅ Bank reconciliation
- ✅ General ledger integration
- ✅ Comprehensive documentation
- ✅ Security features
- ✅ Performance optimization

**Start building![object Object]

