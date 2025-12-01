# Bank Account API Documentation

## Base URL
```
/api/finance/bank-accounts
```

## Authentication
All endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Endpoints

### 1. Create Bank Account
**POST** `/`

Create a new bank account.

**Request Body:**
```json
{
  "accountName": "Main Operating Account",
  "accountNumber": "1234567890",
  "bankName": "Chase Bank",
  "bankBranch": "Downtown Branch",
  "bankCountry": "US",
  "accountType": "checking",
  "chartOfAccountsEntry": "60d5ec49c1234567890abcde",
  "currency": "USD",
  "isPrimary": true,
  "reconciliationFrequency": "monthly",
  "routingNumber": "021000021",
  "dailyWithdrawalLimit": 10000,
  "monthlyTransactionLimit": 100000,
  "minimumBalance": 1000,
  "interestRate": 0.5,
  "monthlyMaintenanceFee": 0,
  "overdraftFee": 35,
  "description": "Primary operating account for daily transactions",
  "tags": ["primary", "operating"],
  "notes": "Main account for customer payments"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Bank account created successfully",
  "data": {
    "_id": "60d5ec49c1234567890abcde",
    "accountName": "Main Operating Account",
    "accountNumber": "1234567890",
    "accountNumberMasked": "****7890",
    "bankName": "Chase Bank",
    "bankBranch": "Downtown Branch",
    "bankCountry": "US",
    "accountType": "checking",
    "currency": "USD",
    "chartOfAccountsEntry": "60d5ec49c1234567890abcde",
    "currentBalance": 0,
    "isPrimary": true,
    "isActive": true,
    "reconciliationFrequency": "monthly",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### 2. Get All Bank Accounts
**GET** `/`

Retrieve all bank accounts with optional filtering.

**Query Parameters:**
- `isActive` (boolean): Filter by active status
- `bankName` (string): Filter by bank name (partial match)
- `sortBy` (string): Sort by 'balance', 'recent', or default (primary + name)

**Example:**
```
GET /api/finance/bank-accounts?isActive=true&sortBy=balance
```

**Response (200):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "60d5ec49c1234567890abcde",
      "accountName": "Main Operating Account",
      "displayAccountNumber": "****7890",
      "bankDisplay": "Chase Bank - Downtown Branch",
      "currentBalance": 50000,
      "isPrimary": true,
      "isActive": true,
      "chartOfAccountsEntry": {
        "_id": "60d5ec49c1234567890abcdf",
        "accountCode": "1010",
        "accountName": "Cash - Main Account"
      }
    }
  ]
}
```

---

### 3. Get Specific Bank Account
**GET** `/:id`

Retrieve detailed information about a specific bank account.

**Parameters:**
- `id` (string): Bank account ID

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "60d5ec49c1234567890abcde",
    "accountName": "Main Operating Account",
    "accountNumber": "1234567890",
    "accountNumberMasked": "****7890",
    "bankName": "Chase Bank",
    "bankBranch": "Downtown Branch",
    "bankCountry": "US",
    "accountType": "checking",
    "currency": "USD",
    "currentBalance": 50000,
    "lastBalanceUpdate": "2024-01-15T10:30:00Z",
    "lastStatementDate": "2024-01-10T00:00:00Z",
    "lastStatementBalance": 48000,
    "isPrimary": true,
    "isActive": true,
    "reconciliationFrequency": "monthly",
    "lastReconciliationDate": "2024-01-10T00:00:00Z",
    "nextReconciliationDue": "2024-02-10T00:00:00Z",
    "transactions": [
      {
        "_id": "60d5ec49c1234567890abce0",
        "transactionDate": "2024-01-15T09:00:00Z",
        "description": "Customer Payment - Invoice INV-001",
        "amount": 5000,
        "transactionType": "deposit",
        "reference": "CHK-12345",
        "isReconciled": false
      }
    ],
    "reconciliations": [
      {
        "_id": "60d5ec49c1234567890abce1",
        "reconciliationDate": "2024-01-10T00:00:00Z",
        "statementStartDate": "2024-01-01T00:00:00Z",
        "statementEndDate": "2024-01-10T00:00:00Z",
        "statementBalance": 48000,
        "bookBalance": 48000,
        "difference": 0,
        "status": "reconciled"
      }
    ]
  }
}
```

---

### 4. Update Bank Account
**PUT** `/:id`

Update bank account details.

**Parameters:**
- `id` (string): Bank account ID

**Request Body:**
```json
{
  "accountName": "Updated Account Name",
  "isPrimary": false,
  "reconciliationFrequency": "weekly",
  "dailyWithdrawalLimit": 15000,
  "isActive": true
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Bank account updated successfully",
  "data": {
    "_id": "60d5ec49c1234567890abcde",
    "accountName": "Updated Account Name",
    "isPrimary": false,
    "reconciliationFrequency": "weekly",
    "dailyWithdrawalLimit": 15000,
    "isActive": true
  }
}
```

---

### 5. Delete Bank Account
**DELETE** `/:id`

Delete a bank account (only if no transactions exist).

**Parameters:**
- `id` (string): Bank account ID

**Response (200):**
```json
{
  "success": true,
  "message": "Bank account deleted successfully"
}
```

**Error (400):**
```json
{
  "success": false,
  "message": "Cannot delete bank account with existing transactions. Mark as inactive instead."
}
```

---

### 6. Add Transaction
**POST** `/:id/transactions`

Add a new transaction to the bank account.

**Parameters:**
- `id` (string): Bank account ID

**Request Body:**
```json
{
  "transactionDate": "2024-01-15T09:00:00Z",
  "description": "Customer Payment - Invoice INV-001",
  "amount": 5000,
  "transactionType": "deposit",
  "reference": "CHK-12345",
  "category": "customer_payment",
  "linkedDocument": {
    "type": "invoice",
    "documentId": "60d5ec49c1234567890abce2"
  },
  "notes": "Payment received from ABC Corp",
  "attachments": []
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Transaction added successfully",
  "data": {
    "_id": "60d5ec49c1234567890abce0",
    "transactionDate": "2024-01-15T09:00:00Z",
    "description": "Customer Payment - Invoice INV-001",
    "amount": 5000,
    "transactionType": "deposit",
    "reference": "CHK-12345",
    "isReconciled": false,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### 7. Get Transactions
**GET** `/:id/transactions`

Retrieve transactions for a bank account with optional filtering.

**Parameters:**
- `id` (string): Bank account ID

**Query Parameters:**
- `startDate` (ISO date): Filter transactions from this date
- `endDate` (ISO date): Filter transactions until this date
- `isReconciled` (boolean): Filter by reconciliation status

**Example:**
```
GET /api/finance/bank-accounts/60d5ec49c1234567890abcde/transactions?startDate=2024-01-01&endDate=2024-01-31&isReconciled=false
```

**Response (200):**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "60d5ec49c1234567890abce0",
      "transactionDate": "2024-01-15T09:00:00Z",
      "description": "Customer Payment",
      "amount": 5000,
      "transactionType": "deposit",
      "reference": "CHK-12345",
      "isReconciled": false
    }
  ]
}
```

---

### 8. Get Unreconciled Transactions
**GET** `/:id/unreconciled`

Retrieve all unreconciled transactions for a bank account.

**Parameters:**
- `id` (string): Bank account ID

**Response (200):**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "60d5ec49c1234567890abce0",
      "transactionDate": "2024-01-15T09:00:00Z",
      "description": "Customer Payment",
      "amount": 5000,
      "transactionType": "deposit",
      "isReconciled": false
    }
  ]
}
```

---

### 9. Reconcile Transaction
**PUT** `/:id/transactions/:transactionId/reconcile`

Mark a transaction as reconciled.

**Parameters:**
- `id` (string): Bank account ID
- `transactionId` (string): Transaction ID

**Request Body:**
```json
{
  "reconciliationId": "60d5ec49c1234567890abce1"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Transaction reconciled successfully",
  "data": {
    "_id": "60d5ec49c1234567890abce0",
    "transactionDate": "2024-01-15T09:00:00Z",
    "description": "Customer Payment",
    "amount": 5000,
    "isReconciled": true,
    "reconciledDate": "2024-01-15T10:30:00Z",
    "reconciliationId": "60d5ec49c1234567890abce1"
  }
}
```

---

### 10. Create Reconciliation
**POST** `/:id/reconciliations`

Create a new bank reconciliation record.

**Parameters:**
- `id` (string): Bank account ID

**Request Body:**
```json
{
  "statementStartDate": "2024-01-01T00:00:00Z",
  "statementEndDate": "2024-01-31T23:59:59Z",
  "statementBalance": 50000,
  "bookBalance": 49500,
  "deposits": 100000,
  "withdrawals": 50500,
  "outstandingChecks": [
    {
      "checkNumber": "1001",
      "amount": 500,
      "date": "2024-01-28T00:00:00Z"
    }
  ],
  "depositInTransit": [],
  "bankFees": 25,
  "interestEarned": 50,
  "notes": "January 2024 reconciliation"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Reconciliation created successfully",
  "data": {
    "_id": "60d5ec49c1234567890abce1",
    "reconciliationDate": "2024-01-15T10:30:00Z",
    "statementStartDate": "2024-01-01T00:00:00Z",
    "statementEndDate": "2024-01-31T23:59:59Z",
    "statementBalance": 50000,
    "bookBalance": 49500,
    "difference": 500,
    "status": "in_progress",
    "deposits": 100000,
    "withdrawals": 50500,
    "bankFees": 25,
    "interestEarned": 50
  }
}
```

---

### 11. Get Reconciliations
**GET** `/:id/reconciliations`

Retrieve reconciliation records for a bank account.

**Parameters:**
- `id` (string): Bank account ID

**Query Parameters:**
- `status` (string): Filter by status (draft, in_progress, reconciled, discrepancy)

**Example:**
```
GET /api/finance/bank-accounts/60d5ec49c1234567890abcde/reconciliations?status=reconciled
```

**Response (200):**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "60d5ec49c1234567890abce1",
      "reconciliationDate": "2024-01-15T10:30:00Z",
      "statementStartDate": "2024-01-01T00:00:00Z",
      "statementEndDate": "2024-01-31T23:59:59Z",
      "statementBalance": 50000,
      "bookBalance": 50000,
      "difference": 0,
      "status": "reconciled"
    }
  ]
}
```

---

### 12. Complete Reconciliation
**PUT** `/:id/reconciliations/:reconciliationId/complete`

Mark a reconciliation as complete (only if difference is 0).

**Parameters:**
- `id` (string): Bank account ID
- `reconciliationId` (string): Reconciliation ID

**Response (200):**
```json
{
  "success": true,
  "message": "Reconciliation completed successfully",
  "data": {
    "_id": "60d5ec49c1234567890abce1",
    "status": "reconciled",
    "reconciledBy": "60d5ec49c1234567890abce2",
    "reconciliationDate": "2024-01-15T10:30:00Z"
  }
}
```

**Error (400):**
```json
{
  "success": false,
  "message": "Cannot complete reconciliation with outstanding differences"
}
```

---

### 13. Get Balance at Date
**GET** `/:id/balance-at-date`

Calculate the account balance at a specific date.

**Parameters:**
- `id` (string): Bank account ID

**Query Parameters:**
- `date` (ISO date): The date to calculate balance for (required)

**Example:**
```
GET /api/finance/bank-accounts/60d5ec49c1234567890abcde/balance-at-date?date=2024-01-15
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "date": "2024-01-15T00:00:00Z",
    "balance": 45000
  }
}
```

---

### 14. Post Transaction to General Ledger
**POST** `/:id/transactions/:transactionId/post`

Create a journal entry for a bank transaction.

**Parameters:**
- `id` (string): Bank account ID
- `transactionId` (string): Transaction ID

**Response (201):**
```json
{
  "success": true,
  "message": "Transaction posted to general ledger successfully",
  "data": {
    "_id": "60d5ec49c1234567890abce3",
    "entryNumber": "JE-20240115-0001",
    "entryDate": "2024-01-15T09:00:00Z",
    "entryType": "bank",
    "description": "Bank Transaction: Customer Payment",
    "lines": [
      {
        "account": "60d5ec49c1234567890abcde",
        "description": "Customer Payment",
        "debit": 5000,
        "credit": 0
      }
    ],
    "status": "posted"
  }
}
```

---

### 15. Get Accounts Needing Reconciliation
**GET** `/needs-reconciliation`

Retrieve bank accounts with overdue reconciliation.

**Response (200):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "60d5ec49c1234567890abcde",
      "accountName": "Main Operating Account",
      "displayAccountNumber": "****7890",
      "bankName": "Chase Bank",
      "nextReconciliationDue": "2024-02-15T00:00:00Z",
      "chartOfAccountsEntry": {
        "_id": "60d5ec49c1234567890abcdf",
        "accountCode": "1010",
        "accountName": "Cash - Main Account"
      }
    }
  ]
}
```

---

### 16. Get Primary Account
**GET** `/primary`

Retrieve the primary bank account.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "60d5ec49c1234567890abcde",
    "accountName": "Main Operating Account",
    "displayAccountNumber": "****7890",
    "bankName": "Chase Bank",
    "isPrimary": true,
    "currentBalance": 50000,
    "chartOfAccountsEntry": {
      "_id": "60d5ec49c1234567890abcdf",
      "accountCode": "1010",
      "accountName": "Cash - Main Account"
    }
  }
}
```

---

### 17. Get Bank Account Summary
**GET** `/:id/summary`

Get a summary view of a bank account with key metrics.

**Parameters:**
- `id` (string): Bank account ID

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accountName": "Main Operating Account",
    "displayAccountNumber": "****7890",
    "bankDisplay": "Chase Bank - Downtown Branch",
    "currentBalance": 50000,
    "lastBalanceUpdate": "2024-01-15T10:30:00Z",
    "totalTransactions": 25,
    "unreconciledCount": 3,
    "unreconciledBalance": 2500,
    "lastReconciliation": {
      "date": "2024-01-10T00:00:00Z",
      "status": "reconciled",
      "difference": 0
    },
    "nextReconciliationDue": "2024-02-10T00:00:00Z",
    "isPrimary": true,
    "isActive": true
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Missing required fields: accountName, accountNumber, bankName, accountType, chartOfAccountsEntry"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Bank account not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error creating bank account",
  "error": "Error details here"
}
```

---

## Transaction Types

- `deposit` - Money deposited into account
- `withdrawal` - Money withdrawn from account
- `transfer` - Transfer to/from another account
- `fee` - Bank fees
- `interest` - Interest earned
- `check` - Check payment
- `ach` - ACH transfer
- `wire` - Wire transfer
- `other` - Other transaction type

---

## Reconciliation Statuses

- `draft` - Reconciliation in progress
- `in_progress` - Being worked on
- `reconciled` - Successfully completed
- `discrepancy` - Has unresolved differences

---

## Account Types

- `checking` - Checking account
- `savings` - Savings account
- `money_market` - Money market account
- `credit_card` - Credit card account
- `line_of_credit` - Line of credit
- `other` - Other account type

---

## Reconciliation Frequencies

- `daily` - Daily reconciliation
- `weekly` - Weekly reconciliation
- `bi-weekly` - Bi-weekly reconciliation
- `monthly` - Monthly reconciliation
- `quarterly` - Quarterly reconciliation
- `annually` - Annual reconciliation
- `manual` - Manual reconciliation only

