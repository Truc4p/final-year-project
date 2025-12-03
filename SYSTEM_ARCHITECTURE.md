# Email Bank Notifications - System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    USER INTERFACE (Vue.js)                      │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  BankAccountsPage.vue                                    │  │
│  │  ├─ Bank Accounts Grid                                   │  │
│  │  ├─ Recent Transactions Table                            │  │
│  │  ├─ "Connect Email" Button                            │  │
│  │  ├─ "Sync" Button (per account)                          │  │
│  │  └─ Email Connection Modal                               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ HTTP/HTTPS
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    FRONTEND SERVICE LAYER                       │
│                                                                 │
│  financeService.js                                              │
│  ├─ connectEmailAccount()                                       │
│  ├─ testEmailConnection()                                       │
│  ├─ syncEmailTransactions()                                     │
│  ├─ getEmailAccounts()                                          │
│  └─ disconnectEmailAccount()                                    │
│                                                                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ REST API
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                   BACKEND API ROUTES                            │
│                                                                 │
│  emailNotificationRoutes.js                                     │
│  ├─ POST /test                                                  │
│  ├─ POST /connect                                               │
│  ├─ POST /disconnect/:accountId                                 │
│  ├─ GET /accounts                                               │
│  ├─ POST /sync/:bankAccountId                                   │
│  └─ GET /transactions/:bankAccountId                            │
│                                                                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ Business Logic
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│              EMAIL NOTIFICATION SERVICE                         │
│                                                                 │
│  emailNotificationService.js                                    │
│  ├─ testConnection()                                            │
│  ├─ fetchBankTransactions()                                     │
│  ├─ createImapConnection()                                      │
│  ├─ parseTransactionFromEmail()                                 │
│  ├─ parseTransactionForBank()                                   │
│  ├─ parseTimoTransaction()                                      │
│  ├─ parseVietcombankTransaction()                               │
│  └─ parseTechcombankTransaction()                               │
│                                                                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ IMAP Protocol
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                   EMAIL PROVIDERS                               │
│                                                                 │
│  ├─ Gmail (imap.gmail.com:993)                                  │
│                                                                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ Email Fetch
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                   BANK EMAILS                                   │
│                                                                 │
│  From: Timo Digital Bank <notifications@timo.vn>                │
│  Subject: Account Balance Change Notification                   │
│  Body: Your account ****1234 has been credited with 500,000 VND │
│                                                                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ Parse & Extract
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                   PARSED TRANSACTION                            │
│                                                                 │
│  {                                                              │
│    date: 2024-01-15,                                            │
│    amount: 500000,                                              │
│    type: 'deposit',                                             │
│    description: 'Account Balance Change Notification',          │
│    status: 'pending',                                           │
│    source: 'email',                                             │
│    accountNumber: '1234'                                        │
│  }                                                              │
│                                                                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ Save & Update
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                   MONGODB DATABASE                              │
│                                                                 │
│  Collections:                                                   │
│  ├─ EmailConnection                                             │
│  │  └─ Stores email credentials & settings                     │
│  ├─ Transaction                                                 │
│  │  └─ Stores parsed transactions                              │
│  └─ BankAccount                                                 │
│     └─ Updates balance                                          │
│                                                                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ Fetch & Display
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│              TRANSACTION DISPLAY                                │
│                                                                 │
│  Recent Transactions Table:                                     │
│  ├─ Date: 2024-01-15                                            │
│  ├─ Description: Account Balance Change Notification            │
│  ├─ Type: Deposit                                               │
│  ├─ Amount: +500,000 VND                                        │
│  └─ Status: Pending                                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Sequence

```
User Action                    Frontend                Backend              Email Provider
    │                             │                        │                      │
    │ Click "Connect Email"       │                        │                      │
    ├────────────────────────────>│                        │                      │
    │                             │ POST /connect          │                      │
    │                             ├───────────────────────>│                      │
    │                             │                        │ Save EmailConnection │
    │                             │                        │ to MongoDB           │
    │                             │                        │                      │
    │ Click "Test Connection"     │                        │                      │
    ├────────────────────────────>│                        │                      │
    │                             │ POST /test             │                      │
    │                             ├───────────────────────>│                      │
    │                             │                        │ Connect via IMAP     │
    │                             │                        ├─────────────────────>│
    │                             │                        │<─────────────────────┤
    │                             │<───────────────────────┤ Connection OK        │
    │<────────────────────────────┤                        │                      │
    │ "Connection Successful"     │                        │                      │
    │                             │                        │                      │
    │ Click "Sync"                │                        │                      │
    ├────────────────────────────>│                        │                      │
    │                             │ POST /sync/:id         │                      │
    │                             ├───────────────────────>│                      │
    │                             │                        │ Connect via IMAP     │
    │                             │                        ├─────────────────────>│
    │                             │                        │ Fetch emails         │
    │                             │                        │<─────────────────────┤
    │                             │                        │ Parse transactions   │
    │                             │                        │ Save to MongoDB      │
    │                             │                        │ Update balance       │
    │                             │<───────────────────────┤                      │
    │<────────────────────────────┤ Sync complete          │                      │
    │ "Transactions Synced"       │                        │                      │
    │                             │                        │                      │
    │ View transactions           │                        │                      │
    ├────────────────────────────>│                        │                      │
    │                             │ GET /transactions      │                      │
    │                             ├───────────────────────>│                      │
    │                             │<───────────────────────┤ Return transactions  │
    │<────────────────────────────┤ Display in table       │                      │
    │ See recent transactions     │                        │                      │
```

## Component Interaction Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                   BankAccountsPage.vue                       │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Template                                               │ │
│  │ ├─ Bank Accounts Grid                                  │ │
│  │ ├─ Recent Transactions Table                           │ │
│  │ ├─ Connect Email Modal                                 │ │
│  │ └─ Create/Edit Modal                                   │ │
│  └────────────────────────────────────────────────────────┘ │
│                          ↕                                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Script (Reactive State)                                │ │
│  │ ├─ bankAccounts (ref)                                  │ │
│  │ ├─ recentTransactions (ref)                            │ │
│  │ ├─ emailFormData (ref)                                 │ │
│  │ ├─ showConnectEmailModal (ref)                         │ │
│  │ └─ isLoading (ref)                                     │ │
│  └────────────────────────────────────────────────────────┘ │
│                          ↕                                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Methods                                                │ │
│  │ ├─ fetchAccounts()                                     │ │
│  │ ├─ fetchTransactions()                                 │ │
│  │ ├─ testEmailConnection()                               │ │
│  │ ├─ submitEmailConnection()                             │ │
│  │ └─ syncAccountTransactions()                           │ │
│  └────────────────────────────────────────────────────────┘ │
│                          ↕                                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ financeService.js                                      │ │
│  │ (API calls to backend)                                 │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

## Email Parsing Pipeline

```
Raw Email
    │
    ├─ Extract Subject
    ├─ Extract Body (Text)
    ├─ Extract Body (HTML)
    └─ Extract Metadata (From, Date)
    │
    ↓
Combine Content
    │
    └─ text + subject + html
    │
    ↓
Apply Regex Patterns
    │
    ├─ Amount Pattern: /(?:amount|balance|transferred)[\s:]*(?:\$|₫)?[\s]*([0-9,]+\.?\d*)/gi
    ├─ Date Pattern: /(\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4})/gi
    ├─ Type Pattern: /(withdrawal|deposit|transfer|credit|debit)/gi
    ├─ Description Pattern: /(?:merchant|description|reference)[\s:]*([^\n\r]{10,100})/gi
    └─ Account Pattern: /(?:account|card)[\s:]*\*+(\d{4})/gi
    │
    ↓
Extract Matches
    │
    ├─ Amount: 500000
    ├─ Date: 2024-01-15
    ├─ Type: deposit
    ├─ Description: Account Balance Change
    └─ Account: 1234
    │
    ↓
Validate Data
    │
    ├─ Amount is number? ✓
    ├─ Date is valid? ✓
    ├─ Type is recognized? ✓
    └─ Skip if validation fails
    │
    ↓
Check for Duplicates
    │
    └─ Query: {amount, date, type, source: 'email'}
    │
    ↓
Save Transaction
    │
    └─ Insert to MongoDB
    │
    ↓
Update Balance
    │
    ├─ If deposit: balance += amount
    └─ If withdrawal: balance -= amount
    │
    ↓
Return Result
    │
    └─ {success, count, newBalance}
```

## Database Schema

```
EmailConnection Collection
├─ _id: ObjectId
├─ userId: ObjectId (ref: User)
├─ bankAccountId: ObjectId (ref: BankAccount)
├─ provider: String (gmail)
├─ bankName: String
├─ email: String
├─ password: String (base64 encoded)
├─ imapServer: String (optional)
├─ imapPort: Number (default: 993)
├─ autoSync: Boolean
├─ lastSyncDate: Date
├─ syncStatus: String (active|error|inactive)
├─ lastError: String
├─ isActive: Boolean
├─ createdAt: Date
└─ updatedAt: Date

Transaction Collection
├─ _id: ObjectId
├─ bankAccountId: ObjectId (ref: BankAccount)
├─ amount: Number
├─ date: Date
├─ type: String (deposit|withdrawal)
├─ description: String
├─ status: String (pending|reconciled|failed)
├─ source: String (email|manual|api)
├─ accountNumber: String
├─ rawData: Object
├─ createdAt: Date
└─ updatedAt: Date

BankAccount Collection
├─ _id: ObjectId
├─ userId: ObjectId (ref: User)
├─ accountName: String
├─ bankName: String
├─ accountNumber: String
├─ accountType: String (checking|savings|money_market)
├─ currentBalance: Number
├─ isPrimary: Boolean
├─ chartOfAccountsEntry: ObjectId
├─ createdAt: Date
└─ updatedAt: Date
```

## State Management Flow

```
User Interaction
    │
    ├─ Click Button
    │   └─ Set showConnectEmailModal = true
    │
    ├─ Fill Form
    │   └─ Update emailFormData (reactive)
    │
    ├─ Submit Form
    │   ├─ Validate data
    │   ├─ Call API
    │   ├─ Update isLoading = true
    │   ├─ Wait for response
    │   ├─ Update isLoading = false
    │   ├─ Close modal
    │   ├─ Reset form
    │   └─ Refresh data
    │
    └─ Display Results
        ├─ Update bankAccounts array
        ├─ Update recentTransactions array
        └─ Re-render UI
```

## Error Handling Flow

```
Operation Initiated
    │
    ├─ Try Block
    │   ├─ Validate input
    │   ├─ Make API call
    │   ├─ Parse response
    │   └─ Update state
    │
    └─ Catch Block
        ├─ Log error
        ├─ Extract error message
        ├─ Show user alert
        ├─ Update error state
        └─ Keep UI responsive
```

## Security Architecture

```
Frontend
├─ No credentials stored
├─ No passwords in localStorage
├─ HTTPS only
└─ Auth token in headers

Backend
├─ Credentials encrypted (base64 → AES in production)
├─ User-scoped queries
├─ Auth middleware on all routes
├─ Input validation
├─ Rate limiting (recommended)
└─ Audit logging (recommended)

Database
├─ Encrypted password field
├─ User-scoped data
├─ Indexes for performance
└─ No sensitive data in logs
```

---

This architecture ensures:
- ✅ Clean separation of concerns
- ✅ Scalable design
- ✅ Security best practices
- ✅ Error handling
- ✅ Performance optimization

