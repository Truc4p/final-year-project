# Implementation Checklist

Complete this checklist to fully implement email bank notifications in your application.

## Phase 1: Backend Setup ✅

### Dependencies
- [ ] Run `npm install imap mailparser nodemailer` in backend directory
- [ ] Verify installation: `npm list imap mailparser nodemailer`
- [ ] (Optional) Install `node-cron` for scheduling: `npm install node-cron`

### File Setup
- [ ] Copy `backend/services/emailNotificationService.js` to your `services/` folder
- [ ] Copy `backend/routes/emailNotificationRoutes.js` to your `routes/` folder
- [ ] Copy `backend/models/EmailConnection.js` to your `models/` folder
- [ ] Verify all files are in correct locations

### Express Configuration
- [ ] Open your main `server.js` or `app.js` file
- [ ] Add this line after other finance routes:
  ```javascript
  const emailNotificationRoutes = require('./routes/emailNotificationRoutes');
  app.use('/api/finance/email-notifications', emailNotificationRoutes);
  ```
- [ ] Verify routes are registered: check Express app initialization

### Database Models
- [ ] Verify `Transaction` model has these fields:
  - [ ] `source` (String: 'email', 'manual', 'api')
  - [ ] `rawData` (Object: for storing email metadata)
- [ ] Verify `BankAccount` model has:
  - [ ] `currentBalance` (Number)
  - [ ] `userId` (ObjectId reference)
- [ ] Create `EmailConnection` model from provided file
- [ ] Test model creation: `db.collection('emailconnections').findOne()`

### Authentication Middleware
- [ ] Verify auth middleware exists at `./middleware/auth`
- [ ] Ensure it sets `req.user.id` on authenticated requests
- [ ] Test auth middleware works with other routes

## Phase 2: Frontend Updates ✅

### Service Layer
- [ ] Open `frontend/src/services/financeService.js`
- [ ] Add all email notification methods:
  - [ ] `connectEmailAccount()`
  - [ ] `disconnectEmailAccount()`
  - [ ] `getEmailAccounts()`
  - [ ] `syncEmailTransactions()`
  - [ ] `getParsedEmailTransactions()`
  - [ ] `testEmailConnection()`
- [ ] Verify methods use correct API endpoints
- [ ] Test service methods in browser console

### Page Component
- [ ] Open `frontend/src/pages/admin/finance/BankAccountsPage.vue`
- [ ] Verify template changes:
  - [ ] "📧 Connect Email" button added to header
  - [ ] Email connection modal added
  - [ ] "Sync" button added to account cards
- [ ] Verify script changes:
  - [ ] `showConnectEmailModal` ref added
  - [ ] `emailFormData` ref added
  - [ ] `testEmailConnection()` method added
  - [ ] `submitEmailConnection()` method added
  - [ ] `syncAccountTransactions()` method added
- [ ] Test page loads without errors

## Phase 3: Testing ✅

### Backend Testing
- [ ] Start backend server: `npm run dev` or `npm start`
- [ ] Check console for errors
- [ ] Verify routes are registered: `GET /api/finance/email-notifications/accounts`

### Frontend Testing
- [ ] Start frontend dev server: `npm run dev`
- [ ] Navigate to Bank Accounts page
- [ ] Verify "📧 Connect Email" button appears
- [ ] Verify email connection modal opens
- [ ] Check browser console for errors

### Email Connection Test
- [ ] Click "📧 Connect Email" button
- [ ] Select email provider (start with Gmail)
- [ ] Enter test email credentials
- [ ] Click "Test Connection"
- [ ] Verify success message appears
- [ ] Check backend logs for connection details

### Gmail Setup (if testing with Gmail)
- [ ] Go to https://myaccount.google.com/security
- [ ] Enable 2-Step Verification
- [ ] Go to https://myaccount.google.com/apppasswords
- [ ] Generate App Password
- [ ] Copy 16-character password
- [ ] Use in email connection form

### Transaction Sync Test
- [ ] Connect email account successfully
- [ ] Click "Sync" button on bank account
- [ ] Wait for sync to complete
- [ ] Check if transactions appear in table
- [ ] Verify balance updated correctly

## Phase 4: Bank-Specific Setup ✅

### For Timo Digital Bank
- [ ] Verify bank sends transaction notification emails
- [ ] Check email format matches parser expectations
- [ ] Test with real transaction email
- [ ] Adjust parsing patterns if needed

### For Other Banks
- [ ] Identify email notification format
- [ ] Create bank-specific parser if needed
- [ ] Add to `parseTransactionForBank()` method
- [ ] Test with real transaction emails

### Email Pattern Verification
- [ ] Check email subject line
- [ ] Check email body for:
  - [ ] Amount format (e.g., "500,000 VND")
  - [ ] Date format (e.g., "2024-01-15")
  - [ ] Transaction type (e.g., "credited", "debited")
  - [ ] Account number (e.g., "****1234")
- [ ] Update regex patterns if needed

## Phase 5: Production Preparation ✅

### Security Hardening
- [ ] Implement AES-256 encryption for passwords
  ```javascript
  const crypto = require('crypto');
  // Encrypt before saving
  // Decrypt before using
  ```
- [ ] Add environment variables for encryption key
- [ ] Remove any console.log statements with sensitive data
- [ ] Implement rate limiting on email endpoints
- [ ] Add request validation middleware

### Performance Optimization
- [ ] Add database indexes:
  ```javascript
  emailConnectionSchema.index({ userId: 1, bankAccountId: 1 });
  emailConnectionSchema.index({ userId: 1, isActive: 1 });
  ```
- [ ] Implement transaction pagination (limit: 50)
- [ ] Add caching for frequently accessed data
- [ ] Test with large email volumes

### Monitoring & Logging
- [ ] Add error logging to all routes
- [ ] Log sync attempts and results
- [ ] Monitor email connection failures
- [ ] Set up alerts for repeated failures
- [ ] Create audit trail for email connections

### Auto-Sync Setup (Optional)
- [ ] Install `node-cron`: `npm install node-cron`
- [ ] Create cron job for daily sync:
  ```javascript
  const cron = require('node-cron');
  cron.schedule('0 8 * * *', async () => {
    // Sync all active connections
  });
  ```
- [ ] Test cron job runs at scheduled time
- [ ] Monitor cron job logs

## Phase 6: Documentation & Deployment ✅

### Documentation
- [ ] Review `BANK_EMAIL_SETUP_GUIDE.md`
- [ ] Review `QUICK_START_EMAIL_NOTIFICATIONS.md`
- [ ] Create internal documentation for your team
- [ ] Document any custom bank parsers added
- [ ] Document any custom configurations

### Deployment
- [ ] Test in staging environment
- [ ] Verify all dependencies installed on server
- [ ] Test email connections in staging
- [ ] Test transaction sync in staging
- [ ] Verify database migrations run
- [ ] Check environment variables are set
- [ ] Deploy to production
- [ ] Monitor for errors in production
- [ ] Test with real bank emails in production

### User Training
- [ ] Create user guide for connecting email
- [ ] Document supported email providers
- [ ] Document supported banks
- [ ] Create FAQ for common issues
- [ ] Set up support channel for issues

## Phase 7: Monitoring & Maintenance ✅

### Ongoing Monitoring
- [ ] Monitor email sync success rate
- [ ] Track failed connections
- [ ] Monitor database growth
- [ ] Check API response times
- [ ] Monitor error logs

### Maintenance Tasks
- [ ] Weekly: Review failed syncs
- [ ] Monthly: Clean up old transactions (optional)
- [ ] Monthly: Review and update bank patterns
- [ ] Quarterly: Security audit
- [ ] Quarterly: Performance review

### Issue Tracking
- [ ] Document any parsing issues
- [ ] Track bank email format changes
- [ ] Monitor for new email providers
- [ ] Update documentation as needed

## Troubleshooting Checklist

If something doesn't work:

### Backend Issues
- [ ] Check backend server is running
- [ ] Verify routes are registered: `console.log(app._router.stack)`
- [ ] Check MongoDB connection
- [ ] Review backend logs for errors
- [ ] Verify auth middleware works
- [ ] Test API endpoints with Postman

### Frontend Issues
- [ ] Check frontend dev server is running
- [ ] Open browser console (F12)
- [ ] Check for JavaScript errors
- [ ] Verify API endpoints in Network tab
- [ ] Check localStorage for auth token
- [ ] Clear browser cache and reload

### Email Connection Issues
- [ ] Verify email provider settings
- [ ] Check email credentials are correct
- [ ] Verify IMAP is enabled
- [ ] Test with different email provider
- [ ] Check firewall/network settings
- [ ] Review email provider documentation

### Transaction Parsing Issues
- [ ] Check email content format
- [ ] Verify regex patterns match email
- [ ] Add console.log to debug parsing
- [ ] Check for special characters
- [ ] Test with sample email
- [ ] Update patterns if needed

### Database Issues
- [ ] Verify MongoDB is running
- [ ] Check database connection string
- [ ] Verify collections exist
- [ ] Check for duplicate indexes
- [ ] Review database logs
- [ ] Test database queries directly

## Quick Reference

### Key Files
- Frontend: `frontend/src/pages/admin/finance/BankAccountsPage.vue`
- Service: `frontend/src/services/financeService.js`
- Backend Service: `backend/services/emailNotificationService.js`
- Backend Routes: `backend/routes/emailNotificationRoutes.js`
- Backend Model: `backend/models/EmailConnection.js`

### Key Endpoints
- `POST /api/finance/email-notifications/test`
- `POST /api/finance/email-notifications/connect`
- `POST /api/finance/email-notifications/sync/:bankAccountId`
- `GET /api/finance/email-notifications/accounts`
- `GET /api/finance/email-notifications/transactions/:bankAccountId`

### Key Methods
- `testEmailConnection()`
- `submitEmailConnection()`
- `syncAccountTransactions()`
- `fetchBankTransactions()`
- `parseTransactionFromEmail()`

### Key Dependencies
- `imap` - IMAP client
- `mailparser` - Email parser
- `nodemailer` - Email verification
- `node-cron` - Task scheduling (optional)

## Success Criteria

You'll know it's working when:

- ✅ Email connection modal opens
- ✅ Can test email connection successfully
- ✅ Can connect email to bank account
- ✅ Sync button works and fetches transactions
- ✅ Transactions appear in table
- ✅ Bank balance updates correctly
- ✅ No errors in console or logs
- ✅ Works with real bank emails
- ✅ Auto-sync works (if enabled)
- ✅ Duplicate transactions are prevented

## Final Verification

Run through this final checklist:

- [ ] Backend server running without errors
- [ ] Frontend dev server running without errors
- [ ] Can navigate to Bank Accounts page
- [ ] Can open email connection modal
- [ ] Can test email connection
- [ ] Can connect email account
- [ ] Can sync transactions
- [ ] Transactions display correctly
- [ ] Balance updates correctly
- [ ] No console errors
- [ ] No backend errors
- [ ] Ready for production deployment

---

**Congratulations!** 🎉 You've successfully implemented email bank notifications!

For questions or issues, refer to:
- `BANK_EMAIL_SETUP_GUIDE.md` - Detailed setup guide
- `QUICK_START_EMAIL_NOTIFICATIONS.md` - Quick reference
- `SYSTEM_ARCHITECTURE.md` - Architecture diagrams
- Code comments in implementation files

