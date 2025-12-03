# Bank Email Notification Integration Guide

This guide explains how to connect your bank account via email notifications and automatically sync transactions.

## Overview

Instead of integrating with bank APIs, this solution:
1. Connects to your email account (Gmail, Outlook, Yahoo, or any IMAP provider)
2. Fetches bank notification emails
3. Parses transaction data from email content
4. Automatically syncs transactions to your bank account

## Setup Instructions

### Step 1: Install Required Dependencies

Add these packages to your backend `package.json`:

```bash
npm install imap mailparser nodemailer
```

### Step 2: Add Backend Routes

1. Copy `backend/routes/emailNotificationRoutes.js` to your routes folder
2. Copy `backend/services/emailNotificationService.js` to your services folder
3. Copy `backend/models/EmailConnection.js` to your models folder

### Step 3: Register Routes in Express App

In your main `server.js` or `app.js`:

```javascript
const emailNotificationRoutes = require('./routes/emailNotificationRoutes');

// Add this after other finance routes
app.use('/api/finance/email-notifications', emailNotificationRoutes);
```

### Step 4: Update Transaction Model

Make sure your `Transaction` model has these fields:

```javascript
{
  bankAccountId: ObjectId,
  amount: Number,
  date: Date,
  type: String, // 'deposit' or 'withdrawal'
  description: String,
  status: String, // 'pending', 'reconciled', 'failed'
  source: String, // 'email', 'manual', 'api'
  accountNumber: String,
  rawData: Object, // Store original email data
  createdAt: Date,
  updatedAt: Date
}
```

### Step 5: Update BankAccount Model

Ensure your `BankAccount` model has:

```javascript
{
  userId: ObjectId,
  accountName: String,
  bankName: String,
  accountNumber: String,
  accountType: String,
  currentBalance: Number,
  isPrimary: Boolean,
  chartOfAccountsEntry: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

## Email Provider Setup

### Gmail Setup

1. **Enable 2-Factor Authentication** (if not already enabled)
   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Create App Password**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer" (or your device)
   - Google will generate a 16-character password
   - Use this password in the email connection form

3. **Enable IMAP**
   - Go to https://mail.google.com/mail/u/0/#settings/fwdandpop
   - Enable IMAP access

### Outlook/Hotmail Setup

1. **Enable IMAP** (if using older account)
   - Go to https://account.microsoft.com/
   - Settings → Mail → Sync email
   - Enable IMAP

2. **Use your account password** directly in the email connection form

### Yahoo Mail Setup

1. **Generate App Password**
   - Go to https://login.yahoo.com/account/security
   - Generate app password
   - Use this password in the email connection form

### Other IMAP Providers

1. Find your email provider's IMAP server address
2. Default IMAP port is usually 993 (SSL/TLS)
3. Enter server address and port in the "Other (IMAP)" option

## Using the Email Connection Feature

### Step 1: Connect Email Account

1. Click the **"📧 Connect Email"** button on the Bank Accounts page
2. Fill in the form:
   - **Email Provider**: Select your email provider
   - **Bank Name**: Enter your bank name (e.g., "Timo Digital Bank")
   - **Email Address**: Your email address
   - **Password/App Password**: Your email password or app password
   - **Linked Bank Account**: Select the bank account to sync to
   - **Auto-sync**: Check to automatically sync daily

3. Click **"Test Connection"** to verify the connection works
4. Click **"Connect Email"** to save and start syncing

### Step 2: Sync Transactions

**Manual Sync:**
- Click the **"Sync"** button on any bank account card
- Transactions from emails will be fetched and added

**Automatic Sync:**
- If you enabled "Auto-sync", transactions will be synced daily
- You can still manually sync anytime

### Step 3: View Transactions

Synced transactions appear in the "Recent Transactions" table with:
- Date
- Description (parsed from email)
- Type (Deposit/Withdrawal)
- Amount
- Status (Pending/Reconciled)

## Supported Banks

### Out-of-the-box Support:
- **Timo Digital Bank (BVBank)** - Vietnamese bank
- **Vietcombank** - Vietnamese bank
- **Techcombank** - Vietnamese bank
- Generic IMAP providers

### Adding Support for Other Banks

To add support for a new bank, add a parsing method in `emailNotificationService.js`:

```javascript
static parseYourBankTransaction(emailData) {
  const text = emailData.text || '';
  
  // Define patterns specific to your bank
  const amountPattern = /your_bank_amount_pattern/i;
  const typePattern = /your_bank_type_pattern/i;
  
  const amountMatch = amountPattern.exec(text);
  const typeMatch = typePattern.exec(text);
  
  if (!amountMatch) return null;
  
  return {
    date: new Date(),
    amount: parseFloat(amountMatch[1].replace(/,/g, '')),
    type: typeMatch ? 'deposit' : 'withdrawal',
    description: 'Your Bank Transaction',
    status: 'pending',
    source: 'email'
  };
}
```

Then update the `parseTransactionForBank` method to call your new parser.

## Transaction Parsing

The system automatically parses:
- **Amount**: Extracts numerical values with currency symbols
- **Date**: Recognizes multiple date formats
- **Type**: Identifies deposits, withdrawals, transfers
- **Description**: Extracts merchant/reference information
- **Account Number**: Captures masked account numbers

## Security Considerations

⚠️ **Important Security Notes:**

1. **Encrypt Passwords**: In production, encrypt email passwords before storing
   ```javascript
   const crypto = require('crypto');
   const encrypted = crypto.encrypt(password, encryptionKey);
   ```

2. **Use Environment Variables**: Store sensitive data in `.env`
   ```
   ENCRYPTION_KEY=your_secret_key
   ```

3. **Limit Email Access**: Use app-specific passwords instead of main account password

4. **HTTPS Only**: Always use HTTPS in production

5. **Rate Limiting**: Implement rate limiting on email sync endpoints

6. **Audit Logging**: Log all email connection activities

## Troubleshooting

### Connection Test Fails

**Gmail:**
- Verify 2FA is enabled
- Check that App Password is correct (16 characters)
- Ensure IMAP is enabled

**Outlook:**
- Try disabling 2FA temporarily to test
- Verify IMAP is enabled
- Check account password is correct

**Other Providers:**
- Verify IMAP server address and port
- Check email and password are correct
- Ensure IMAP is enabled in provider settings

### No Transactions Found

1. Check that bank sends notification emails
2. Verify email is being received
3. Check that email subject/content matches bank name
4. Review email content for amount patterns
5. Check browser console for parsing errors

### Transactions Not Updating Balance

1. Verify transaction type (deposit/withdrawal) is correct
2. Check that bank account balance field is being updated
3. Ensure transaction is saved to database

### Duplicate Transactions

The system checks for duplicates based on:
- Amount
- Date
- Type
- Source (email)

If duplicates appear, check email notification settings to avoid multiple emails per transaction.

## API Endpoints

### Test Email Connection
```
POST /api/finance/email-notifications/test
Body: {
  provider: 'gmail',
  email: 'user@gmail.com',
  password: 'app_password',
  imapServer: 'imap.gmail.com',
  imapPort: 993
}
```

### Connect Email Account
```
POST /api/finance/email-notifications/connect
Body: {
  provider: 'gmail',
  bankName: 'Timo Digital Bank',
  email: 'user@gmail.com',
  password: 'app_password',
  bankAccountId: '507f1f77bcf86cd799439011',
  autoSync: true
}
```

### Sync Transactions
```
POST /api/finance/email-notifications/sync/:bankAccountId
```

### Get Connected Emails
```
GET /api/finance/email-notifications/accounts
```

### Get Email Transactions
```
GET /api/finance/email-notifications/transactions/:bankAccountId?limit=50&skip=0
```

## Scheduling Daily Sync (Optional)

To automatically sync transactions daily, use a job scheduler like `node-cron`:

```javascript
const cron = require('node-cron');
const EmailConnection = require('./models/EmailConnection');

// Run every day at 8 AM
cron.schedule('0 8 * * *', async () => {
  const connections = await EmailConnection.find({ autoSync: true });
  
  for (const connection of connections) {
    try {
      await syncEmailTransactions(connection.bankAccountId);
    } catch (error) {
      console.error(`Sync failed for ${connection.email}:`, error);
    }
  }
});
```

## Next Steps

1. ✅ Install dependencies
2. ✅ Add backend files
3. ✅ Register routes
4. ✅ Test with your bank
5. ✅ Set up daily auto-sync (optional)
6. ✅ Monitor and adjust parsing patterns as needed

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review email content for parsing patterns
3. Check browser console for errors
4. Review server logs for sync errors

