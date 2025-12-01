# Bank Account Integration Guide

## Quick Start

### Step 1: Import the Model
In your main application file or where you initialize models:

```javascript
const BankAccount = require('./models/finance/bankAccount');
```

### Step 2: Register Routes
In your main Express app file (e.g., `app.js` or `server.js`):

```javascript
const bankAccountRoutes = require('./routes/finance/bankAccountRoutes');

// Add to your app
app.use('/api/finance/bank-accounts', bankAccountRoutes);
```

### Step 3: Ensure Authentication Middleware
Make sure your authentication middleware is properly set up:

```javascript
// In your middleware/auth.js
const protect = (req, res, next) => {
  // Your authentication logic
  // Should set req.user._id
  next();
};

module.exports = { protect };
```

---

## Integration with Other Finance Modules

### 1. Integration with Chart of Accounts

When creating a bank account, you must link it to a Chart of Accounts entry:

```javascript
// First, create or find a bank account in Chart of Accounts
const ChartOfAccounts = require('./models/finance/chartOfAccounts');

const bankAccountCOA = new ChartOfAccounts({
  accountCode: '1010',
  accountName: 'Cash - Main Bank Account',
  accountType: 'asset',
  accountSubType: 'current_asset',
  normalBalance: 'debit',
  bankAccount: true,
  reconcilable: true,
  reportCategory: 'cash_and_equivalents',
  isSystemAccount: true,
  createdBy: userId
});

await bankAccountCOA.save();

// Then create the bank account
const bankAccount = new BankAccount({
  accountName: 'Main Operating Account',
  accountNumber: '1234567890',
  bankName: 'Chase Bank',
  accountType: 'checking',
  chartOfAccountsEntry: bankAccountCOA._id,
  createdBy: userId
});

await bankAccount.save();
```

### 2. Integration with Invoice Payments

Link invoice payments to bank transactions:

```javascript
// When recording an invoice payment
const invoice = await Invoice.findById(invoiceId);

// Add payment to invoice
await invoice.addPayment({
  paymentDate: new Date(),
  amount: 5000,
  paymentMethod: 'bank_transfer',
  reference: 'TXN-12345',
  bankAccount: bankAccountId
}, userId);

// Add corresponding transaction to bank account
const bankAccount = await BankAccount.findById(bankAccountId);
await bankAccount.addTransaction({
  transactionDate: new Date(),
  description: `Payment received - Invoice ${invoice.invoiceNumber}`,
  amount: 5000,
  transactionType: 'deposit',
  reference: 'TXN-12345',
  linkedDocument: {
    type: 'invoice',
    documentId: invoiceId
  }
}, userId);
```

### 3. Integration with Bill Payments

Link bill payments to bank transactions:

```javascript
// When recording a bill payment
const bill = await Bill.findById(billId);

// Add payment to bill
await bill.addPayment({
  paymentDate: new Date(),
  amount: 2500,
  paymentMethod: 'check',
  reference: 'CHK-1001',
  bankAccount: bankAccountId
}, userId);

// Add corresponding transaction to bank account
const bankAccount = await BankAccount.findById(bankAccountId);
await bankAccount.addTransaction({
  transactionDate: new Date(),
  description: `Payment made - Bill ${bill.billNumber}`,
  amount: 2500,
  transactionType: 'withdrawal',
  reference: 'CHK-1001',
  linkedDocument: {
    type: 'bill',
    documentId: billId
  }
}, userId);
```

### 4. Integration with General Ledger

Post bank transactions to the general ledger:

```javascript
// Post a transaction to general ledger
const bankAccount = await BankAccount.findById(bankAccountId);
const journalEntry = await bankAccount.postTransactionToGeneralLedger(
  transactionId,
  userId
);

// The journal entry will be created with:
// - Debit: Bank Account (for deposits/interest)
// - Credit: Bank Account (for withdrawals/fees)
```

---

## Common Workflows

### Workflow 1: Daily Bank Transaction Entry

```javascript
// 1. Get the primary bank account
const bankAccount = await BankAccount.getPrimaryAccount();

// 2. Add transactions from bank statement
const transactions = [
  {
    transactionDate: new Date('2024-01-15'),
    description: 'Customer Payment - ABC Corp',
    amount: 5000,
    transactionType: 'deposit',
    reference: 'DEP-001'
  },
  {
    transactionDate: new Date('2024-01-15'),
    description: 'Vendor Payment - XYZ Supplies',
    amount: 1500,
    transactionType: 'withdrawal',
    reference: 'CHK-1001'
  }
];

for (const txn of transactions) {
  await bankAccount.addTransaction(txn, userId);
}

// 3. Save the account
await bankAccount.save();
```

### Workflow 2: Monthly Bank Reconciliation

```javascript
// 1. Get the bank account
const bankAccount = await BankAccount.findById(bankAccountId);

// 2. Create reconciliation record
const reconciliation = await bankAccount.createReconciliation({
  statementStartDate: new Date('2024-01-01'),
  statementEndDate: new Date('2024-01-31'),
  statementBalance: 50000,
  bookBalance: 49500,
  deposits: 100000,
  withdrawals: 50500,
  outstandingChecks: [
    {
      checkNumber: '1001',
      amount: 500,
      date: new Date('2024-01-28')
    }
  ],
  bankFees: 25,
  interestEarned: 50
}, userId);

// 3. Reconcile transactions
const unreconciledTxns = bankAccount.getUnreconciledTransactions();
for (const txn of unreconciledTxns) {
  if (txn.transactionDate <= new Date('2024-01-31')) {
    await bankAccount.reconcileTransaction(txn._id, reconciliation._id);
  }
}

// 4. Complete reconciliation if balanced
if (reconciliation.difference === 0) {
  await bankAccount.completeReconciliation(reconciliation._id, userId);
}
```

### Workflow 3: Bank Account Summary Report

```javascript
// Get summary for dashboard
const bankAccount = await BankAccount.findById(bankAccountId);

const summary = {
  accountName: bankAccount.accountName,
  currentBalance: bankAccount.currentBalance,
  unreconciledCount: bankAccount.pendingReconciliationCount,
  unreconciledBalance: bankAccount.unreconciledBalance,
  lastReconciliation: bankAccount.lastReconciliationDate,
  nextReconciliationDue: bankAccount.nextReconciliationDue,
  totalTransactions: bankAccount.transactions.length
};

console.log(summary);
```

### Workflow 4: Multi-Account Balance Report

```javascript
// Get all active accounts with balances
const accounts = await BankAccount.getActiveAccounts()
  .populate('chartOfAccountsEntry');

let totalBalance = 0;
const report = accounts.map(account => {
  totalBalance += account.currentBalance;
  return {
    accountName: account.accountName,
    bankName: account.bankName,
    balance: account.currentBalance,
    isPrimary: account.isPrimary,
    lastUpdate: account.lastBalanceUpdate
  };
});

console.log('Total Balance:', totalBalance);
console.log('Accounts:', report);
```

---

## API Usage Examples

### Example 1: Create Bank Account via API

```bash
curl -X POST http://localhost:5000/api/finance/bank-accounts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountName": "Main Operating Account",
    "accountNumber": "1234567890",
    "bankName": "Chase Bank",
    "accountType": "checking",
    "chartOfAccountsEntry": "60d5ec49c1234567890abcde",
    "isPrimary": true,
    "reconciliationFrequency": "monthly"
  }'
```

### Example 2: Add Transaction via API

```bash
curl -X POST http://localhost:5000/api/finance/bank-accounts/60d5ec49c1234567890abcde/transactions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "transactionDate": "2024-01-15T09:00:00Z",
    "description": "Customer Payment",
    "amount": 5000,
    "transactionType": "deposit",
    "reference": "DEP-001"
  }'
```

### Example 3: Create Reconciliation via API

```bash
curl -X POST http://localhost:5000/api/finance/bank-accounts/60d5ec49c1234567890abcde/reconciliations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "statementStartDate": "2024-01-01T00:00:00Z",
    "statementEndDate": "2024-01-31T23:59:59Z",
    "statementBalance": 50000,
    "bookBalance": 50000,
    "deposits": 100000,
    "withdrawals": 50000,
    "bankFees": 25,
    "interestEarned": 50
  }'
```

### Example 4: Get Bank Account Summary via API

```bash
curl -X GET http://localhost:5000/api/finance/bank-accounts/60d5ec49c1234567890abcde/summary \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Database Indexes

The BankAccount model includes the following indexes for optimal performance:

```javascript
// Automatically created by Mongoose
- accountNumber (unique)
- bankName
- isActive
- isPrimary
- chartOfAccountsEntry
- transactions.transactionDate
- transactions.isReconciled
- reconciliations.status
```

---

## Validation Rules

### Account Number
- Must be unique across all bank accounts
- Required field
- Automatically masked for display

### Chart of Accounts Entry
- Must reference a valid Chart of Accounts document
- Required field
- Should be an asset account with `bankAccount: true`

### International Accounts
- If `bankCountry` is not 'US', must have either `swiftCode` or `ibanCode`

### Reconciliation
- Can only be completed if `difference === 0`
- Automatically calculates next reconciliation date based on frequency

---

## Security Best Practices

1. **Account Number Masking**: Account numbers are automatically masked (****1234) for display
2. **Audit Trail**: All transactions include `createdBy` and timestamps
3. **Role-Based Access**: Implement role-based access control for sensitive operations
4. **Reconciliation Approval**: Require manager approval for completed reconciliations
5. **Data Encryption**: Consider encrypting sensitive bank details in production

---

## Troubleshooting

### Issue: Cannot create bank account
**Solution**: Ensure the `chartOfAccountsEntry` ID is valid and exists in the database.

### Issue: Reconciliation won't complete
**Solution**: Check that `difference === 0`. The statement balance must equal the book balance.

### Issue: Balance is incorrect
**Solution**: Verify all transactions are properly recorded with correct amounts and types (deposit vs withdrawal).

### Issue: Transactions not appearing
**Solution**: Ensure transactions are added before calling `save()` on the account.

---

## Next Steps

1. **Implement Bank Import**: Add CSV/OFX import functionality
2. **Add Bank APIs**: Integrate with Plaid, Yodlee, or similar services
3. **Create Dashboards**: Build UI for bank account management
4. **Add Alerts**: Implement low balance alerts and reconciliation reminders
5. **Generate Reports**: Create bank reconciliation and cash flow reports
6. **Multi-Currency**: Extend to support multiple currencies with exchange rates

---

## Support

For issues or questions about the BankAccount model:
1. Check the BANKACCOUNT_GUIDE.md for detailed documentation
2. Review the BANKACCOUNT_API_DOCS.md for API reference
3. Check the bankAccountController.js for implementation details
4. Review the bankAccount.js model file for schema details

