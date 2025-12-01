# BankAccount Model - Implementation Guide

## Overview
The BankAccount model is a comprehensive solution for managing bank accounts within your SME finance platform. It integrates with the Chart of Accounts for proper accounting, supports bank reconciliation, and tracks all bank transactions.

## Key Features

### 1. **Basic Account Information**
- Account name and number (with masking for security)
- Bank details (name, branch, country)
- International identifiers (SWIFT code, IBAN)
- Account type (checking, savings, money market, credit card, line of credit)

### 2. **Accounting Integration**
- Links to Chart of Accounts for proper double-entry bookkeeping
- Automatic journal entry creation for transactions
- Currency support for multi-currency operations

### 3. **Transaction Management**
- Track individual bank transactions (deposits, withdrawals, transfers, fees, interest)
- Link transactions to related documents (invoices, bills, journal entries)
- Transaction categorization and reference tracking
- Attachment support for receipts and documentation

### 4. **Bank Reconciliation**
- Monthly/quarterly/annual reconciliation support
- Track outstanding checks and deposits in transit
- Record bank fees and interest earned
- Automatic reconciliation status tracking
- Discrepancy detection and reporting

### 5. **Balance Tracking**
- Current balance management
- Historical balance calculations
- Unreconciled balance tracking
- Last statement balance and date

### 6. **Account Settings**
- Daily withdrawal limits
- Monthly transaction limits
- Minimum balance requirements
- Interest rates and fees
- Reconciliation frequency preferences

### 7. **Bank Connection**
- Support for manual entry, API connections, CSV imports, and OFX imports
- Sync status tracking
- Last sync date recording

## Schema Structure

### Main Fields

```javascript
{
  // Account Information
  accountName: String,           // e.g., "Main Operating Account"
  accountNumber: String,         // Unique account number
  accountNumberMasked: String,   // ****1234 for display
  routingNumber: String,         // US routing number
  swiftCode: String,             // International bank code
  ibanCode: String,              // International account number
  
  // Bank Details
  bankName: String,              // e.g., "Chase Bank"
  bankBranch: String,            // Branch name
  bankCountry: String,           // Country code
  
  // Account Type
  accountType: String,           // checking, savings, money_market, etc.
  currency: String,              // Default: USD
  
  // Accounting Link
  chartOfAccountsEntry: ObjectId, // Reference to Chart of Accounts
  
  // Balance Information
  currentBalance: Number,
  lastBalanceUpdate: Date,
  lastStatementDate: Date,
  lastStatementBalance: Number,
  
  // Status
  isActive: Boolean,
  isPrimary: Boolean,            // Primary operating account
  
  // Reconciliation
  reconciliationFrequency: String, // daily, weekly, monthly, etc.
  lastReconciliationDate: Date,
  nextReconciliationDue: Date,
  requiresReconciliation: Boolean,
  
  // Transactions & Reconciliations
  transactions: [BankTransactionSchema],
  reconciliations: [BankReconciliationSchema],
  
  // Limits & Settings
  dailyWithdrawalLimit: Number,
  monthlyTransactionLimit: Number,
  minimumBalance: Number,
  interestRate: Number,
  monthlyMaintenanceFee: Number,
  overdraftFee: Number,
  
  // Connection Settings
  isConnected: Boolean,
  connectionType: String,        // manual, api, csv_import, ofx_import
  lastSyncDate: Date,
  syncStatus: String,            // idle, syncing, success, failed
  
  // Metadata
  description: String,
  tags: [String],
  notes: String,
  
  // Audit
  createdBy: ObjectId,
  lastModifiedBy: ObjectId,
  timestamps: true
}
```

### BankTransaction Schema

```javascript
{
  transactionDate: Date,
  description: String,
  amount: Number,
  transactionType: String,       // deposit, withdrawal, transfer, fee, interest, check, ach, wire, other
  reference: String,             // Check number, transaction ID
  category: String,              // Optional categorization
  isReconciled: Boolean,
  reconciledDate: Date,
  reconciliationId: ObjectId,    // Reference to reconciliation
  linkedDocument: {
    type: String,                // invoice, bill, journal_entry, transfer, other
    documentId: ObjectId
  },
  journalEntry: ObjectId,        // Link to accounting entry
  notes: String,
  attachments: [{
    fileName: String,
    fileUrl: String,
    uploadDate: Date
  }],
  createdBy: ObjectId,
  timestamps: true
}
```

### BankReconciliation Schema

```javascript
{
  reconciliationDate: Date,
  statementStartDate: Date,
  statementEndDate: Date,
  statementBalance: Number,      // Balance on bank statement
  bookBalance: Number,           // Balance in accounting books
  difference: Number,            // statementBalance - bookBalance
  status: String,                // draft, in_progress, reconciled, discrepancy
  
  // Reconciliation Details
  deposits: Number,              // Total deposits in period
  withdrawals: Number,           // Total withdrawals in period
  outstandingChecks: [{
    checkNumber: String,
    amount: Number,
    date: Date
  }],
  depositInTransit: [{
    description: String,
    amount: Number,
    date: Date
  }],
  bankFees: Number,
  interestEarned: Number,
  
  notes: String,
  reconciledBy: ObjectId,
  createdBy: ObjectId,
  timestamps: true
}
```

## Virtual Fields

- **displayAccountNumber**: Masked account number for secure display
- **bankDisplay**: Formatted bank name with branch
- **unreconciledBalance**: Sum of unreconciled transactions
- **pendingReconciliationCount**: Count of unreconciled transactions

## Methods

### Instance Methods

#### `addTransaction(transactionData, userId)`
Add a new transaction to the bank account and update balance.

```javascript
const transaction = await bankAccount.addTransaction({
  transactionDate: new Date(),
  description: 'Customer Payment',
  amount: 1000,
  transactionType: 'deposit',
  reference: 'CHK-12345'
}, userId);
```

#### `reconcileTransaction(transactionId, reconciliationId)`
Mark a transaction as reconciled.

```javascript
await bankAccount.reconcileTransaction(transactionId, reconciliationId);
```

#### `createReconciliation(reconciliationData, userId)`
Create a new reconciliation record.

```javascript
const reconciliation = await bankAccount.createReconciliation({
  statementStartDate: new Date('2024-01-01'),
  statementEndDate: new Date('2024-01-31'),
  statementBalance: 50000,
  bookBalance: 49500,
  deposits: 100000,
  withdrawals: 50500,
  bankFees: 25,
  interestEarned: 50
}, userId);
```

#### `completeReconciliation(reconciliationId, userId)`
Complete a reconciliation (only if difference is 0).

```javascript
await bankAccount.completeReconciliation(reconciliationId, userId);
```

#### `getTransactionsInRange(startDate, endDate)`
Get transactions within a date range.

```javascript
const transactions = bankAccount.getTransactionsInRange(
  new Date('2024-01-01'),
  new Date('2024-01-31')
);
```

#### `getUnreconciledTransactions()`
Get all unreconciled transactions.

```javascript
const unreconciledTxns = bankAccount.getUnreconciledTransactions();
```

#### `getBalanceAtDate(date)`
Calculate balance at a specific date.

```javascript
const balanceOnDate = bankAccount.getBalanceAtDate(new Date('2024-01-15'));
```

#### `postTransactionToGeneralLedger(transactionId, userId)`
Create a journal entry for a bank transaction.

```javascript
const journalEntry = await bankAccount.postTransactionToGeneralLedger(transactionId, userId);
```

### Static Methods

#### `getPrimaryAccount()`
Get the primary operating account.

```javascript
const primaryAccount = await BankAccount.getPrimaryAccount();
```

#### `getActiveAccounts()`
Get all active bank accounts.

```javascript
const accounts = await BankAccount.getActiveAccounts();
```

#### `getAccountsByBank(bankName)`
Get accounts from a specific bank.

```javascript
const chaseAccounts = await BankAccount.getAccountsByBank('Chase Bank');
```

#### `getAccountsNeedingReconciliation()`
Get accounts with overdue reconciliation.

```javascript
const needsReconciliation = await BankAccount.getAccountsNeedingReconciliation();
```

## Indexes

The model includes the following indexes for optimal query performance:

- `accountNumber` - Fast lookup by account number
- `bankName` - Filter by bank
- `isActive` - Filter active accounts
- `isPrimary` - Find primary account
- `chartOfAccountsEntry` - Link to accounting
- `transactions.transactionDate` - Sort transactions by date
- `transactions.isReconciled` - Filter reconciled status
- `reconciliations.status` - Filter reconciliation status

## Usage Examples

### Creating a Bank Account

```javascript
const BankAccount = require('./bankAccount');

const newAccount = new BankAccount({
  accountName: 'Main Operating Account',
  accountNumber: '1234567890',
  bankName: 'Chase Bank',
  bankBranch: 'Downtown Branch',
  bankCountry: 'US',
  accountType: 'checking',
  currency: 'USD',
  chartOfAccountsEntry: chartOfAccountsId,
  isPrimary: true,
  reconciliationFrequency: 'monthly',
  createdBy: userId
});

await newAccount.save();
```

### Adding a Transaction

```javascript
const transaction = await bankAccount.addTransaction({
  transactionDate: new Date(),
  description: 'Invoice Payment from Customer ABC',
  amount: 5000,
  transactionType: 'deposit',
  reference: 'INV-20240101-0001',
  linkedDocument: {
    type: 'invoice',
    documentId: invoiceId
  }
}, userId);
```

### Recording Bank Reconciliation

```javascript
const reconciliation = await bankAccount.createReconciliation({
  statementStartDate: new Date('2024-01-01'),
  statementEndDate: new Date('2024-01-31'),
  statementBalance: 50000,
  bookBalance: 50000,
  deposits: 100000,
  withdrawals: 50000,
  outstandingChecks: [
    { checkNumber: '1001', amount: 500, date: new Date('2024-01-28') }
  ],
  bankFees: 25,
  interestEarned: 50
}, userId);

// Complete reconciliation if balanced
await bankAccount.completeReconciliation(reconciliation._id, userId);
```

### Querying Bank Data

```javascript
// Get all active accounts
const accounts = await BankAccount.getActiveAccounts();

// Get unreconciled transactions
const unreconciledTxns = bankAccount.getUnreconciledTransactions();

// Get balance on specific date
const balanceOnDate = bankAccount.getBalanceAtDate(new Date('2024-01-15'));

// Get transactions in date range
const monthlyTxns = bankAccount.getTransactionsInRange(
  new Date('2024-01-01'),
  new Date('2024-01-31')
);
```

## Integration with Other Models

### Chart of Accounts
- Each bank account must be linked to a corresponding asset account in the Chart of Accounts
- The `chartOfAccountsEntry` field maintains this relationship

### Journal Entry
- Bank transactions can be posted to the General Ledger as journal entries
- The `journalEntry` field in BankTransaction links to the accounting entry

### Invoices & Bills
- Bank transactions can be linked to invoices (payments received) or bills (payments made)
- The `linkedDocument` field tracks these relationships

## Security Considerations

1. **Account Number Masking**: Account numbers are automatically masked (****1234) for display
2. **Audit Trail**: All transactions include `createdBy` and timestamps for audit purposes
3. **User Permissions**: Implement role-based access control for sensitive operations
4. **Reconciliation Approval**: Consider requiring approval for completed reconciliations

## Next Steps

1. Create a BankAccount Controller with CRUD operations
2. Create API routes for bank account management
3. Implement bank reconciliation workflows
4. Add bank transaction import functionality (CSV, OFX, API)
5. Create reconciliation reports and dashboards
6. Implement bank connection APIs (Plaid, Yodlee, etc.)

## Related Models

- **ChartOfAccounts**: Accounting account structure
- **JournalEntry**: General ledger entries
- **Invoice**: Accounts receivable
- **Bill**: Accounts payable
- **User**: Audit trail and permissions

