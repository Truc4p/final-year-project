# Quick Start: Email Bank Notifications

## [object Object]-Minute Setup

### 1. Install Dependencies
```bash
cd backend
npm install imap mailparser nodemailer
```

### 2. Add Files to Backend
Copy these files to your backend:
- `backend/services/emailNotificationService.js` → `services/`
- `backend/routes/emailNotificationRoutes.js` → `routes/`
- `backend/models/EmailConnection.js` → `models/`

### 3. Register Routes
In your `server.js` or `app.js`:
```javascript
const emailNotificationRoutes = require('./routes/emailNotificationRoutes');
app.use('/api/finance/email-notifications', emailNotificationRoutes);
```

### 4. Update Models
Ensure your `Transaction` model has:
```javascript
{
  source: String, // 'email', 'manual', 'api'
  rawData: Object // Store email metadata
}
```

### 5. Frontend is Ready!
The frontend (`BankAccountsPage.vue`) already has:
- ✅ Email connection modal
- ✅ Sync button
- ✅ Transaction display

## 📧 Connect Your Bank Email

### For Gmail:
1. Enable 2FA: https://myaccount.google.com/security
2. Create App Password: https://myaccount.google.com/apppasswords
3. In app, select "Gmail" and use the 16-char password

### For Outlook:
1. Use your account password directly
2. Enable IMAP if needed

### For Other Banks:
1. Find IMAP server (usually `imap.youremail.com`)
2. Port is usually 993
3. Use your email password

## 🔄 How It Works

```
Your Bank Email
      ↓
IMAP Connection
      ↓
Parse Transaction
      ↓
Save to Database
      ↓
Update Balance
      ↓
Display in UI
```

## 📊 What Gets Parsed

From bank emails, the system extracts:
- **Amount**: $1,234.56 or 1,234,567 VND
- **Date**: Any common date format
- **Type**: Deposit or Withdrawal
- **Description**: Merchant or reference info
- **Account**: Last 4 digits

## ✨ Features

- ✅ Multiple email providers (Gmail, Outlook, Yahoo, IMAP)
- ✅ Automatic daily sync (optional)
- ✅ Duplicate detection
- ✅ Balance auto-update
- ✅ Transaction history
- ✅ Bank-specific parsing (Timo, Vietcombank, Techcombank)

## 🎯 Usage

1. Click **"📧 Connect Email"** button
2. Select your email provider
3. Enter email credentials
4. Click **"Test Connection"**
5. Click **"Connect Email"**
6. Transactions sync automatically!

## 🔒 Security

- Passwords are base64 encoded (upgrade to AES encryption in production)
- Use app-specific passwords for Gmail
- HTTPS only in production
- No credentials stored in frontend

## [object Object]

| Issue | Solution |
|-------|----------|
| Gmail connection fails | Use App Password (not regular password) |
| No transactions found | Check bank sends emails, verify email received |
| Duplicate transactions | System auto-detects, check email settings |
| Connection timeout | Verify IMAP server and port are correct |

## 📝 Example Bank Email Patterns

### Timo Digital Bank
```
Your account ****1234 has been credited with 500,000 VND
```

### Vietcombank
```
Ghi có: 1,000,000 VND
```

### Generic
```
Amount: $100.50
Transaction: Withdrawal
```

## 🔧 Advanced: Add Custom Bank

Edit `emailNotificationService.js`:

```javascript
static parseYourBankTransaction(emailData) {
  const text = emailData.text || '';
  const amountMatch = /your_pattern/i.exec(text);
  
  if (!amountMatch) return null;
  
  return {
    date: new Date(),
    amount: parseFloat(amountMatch[1]),
    type: 'deposit',
    description: 'Your Bank',
    status: 'pending',
    source: 'email'
  };
}
```

Then add to `parseTransactionForBank()`:
```javascript
if (bankNameLower.includes('yourbank')) {
  return this.parseYourBankTransaction(emailData);
}
```

## 📚 Full Documentation

See `BANK_EMAIL_SETUP_GUIDE.md` for:
- Detailed setup instructions
- All API endpoints
- Security best practices
- Scheduling daily sync
- Complete troubleshooting guide

## 🎉 You're Done!

Your bank transactions are now syncing from email! 

**Next Steps:**
- [ ] Test with a real bank email
- [ ] Set up auto-sync (optional)
- [ ] Add more bank patterns if needed
- [ ] Monitor sync logs

---

**Questions?** Check the full guide or review the code comments.

