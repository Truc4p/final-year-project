# VNPAY Payment Integration - Secret Manager Fix

## Problem Summary

**Error:** VNPAY payment was failing with error code 71 - "Website này chưa được phê duyệt" (Website not approved)

**Root Cause:** After implementing the Secret Manager for centralized secret management, the payment controller was still trying to access VNPAY credentials from `process.env` instead of from the Secret Manager's encrypted storage.

### What Happened:
1. Secret Manager was implemented to store sensitive credentials in encrypted `.secrets.enc` file
2. Credentials were successfully migrated from `.env` to Secret Manager
3. However, the payment controller continued using `process.env.VNP_TMN_CODE`, `process.env.VNP_HASH_SECRET`, etc.
4. These values were no longer in `process.env` (they were in Secret Manager), resulting in `undefined` values
5. VNPAY received invalid/missing credentials, causing the payment request to fail

## Solution Implemented

### Files Modified:

#### 1. **`/backend/controllers/ecommerce/paymentController.js`**

**Changes:**
- Added import for Secret Manager: `const { secretManager } = require('../../services/secretInitializer');`
- Updated `createVnpayPayment()` function to retrieve VNPAY credentials from Secret Manager:
  ```javascript
  const vnpTmnCode = await secretManager.getSecret('VNP_TMN_CODE');
  const vnpHashSecret = await secretManager.getSecret('VNP_HASH_SECRET');
  const vnpUrl = await secretManager.getSecret('VNP_URL');
  const vnpReturnUrl = await secretManager.getSecret('VNP_RETURN_URL');
  ```
- Updated exchange rate retrieval with fallback:
  ```javascript
  let exchangeRate = 24000;
  try {
    const exchangeRateSecret = await secretManager.getSecret('VNP_EXCHANGE_RATE');
    exchangeRate = Number(exchangeRateSecret) || 24000;
  } catch (error) {
    console.warn('⚠️ Using default exchange rate:', exchangeRate);
  }
  ```
- Updated `vnpReturn()` function to get `VNP_HASH_SECRET` and `FRONTEND_URL` from Secret Manager
- Updated `vnpIpn()` function to get `VNP_HASH_SECRET` from Secret Manager

#### 2. **`/backend/services/emailService.js`**

**Changes:**
- Updated `sendEmail()` to retrieve `GMAIL_USER` and `COMPANY_NAME` from Secret Manager
- Updated `replaceVariables()` to be async and retrieve `COMPANY_NAME` and `FRONTEND_URL` from Secret Manager with fallbacks
- Updated `sendBulkEmails()` to await the now-async `replaceVariables()` calls

## How Secret Manager Works

### Initialization Flow:
1. Application starts → `secretInitializer.js` initializes Secret Manager
2. Secret Manager loads encryption key from `.secret-key` file
3. Loads encrypted secrets from `.secrets.enc` file
4. Falls back to environment variables if encrypted file doesn't exist
5. Migrates `.env` file to encrypted storage

### Credential Retrieval:
```javascript
// Synchronous access (not recommended for async operations)
const secret = await secretManager.getSecret('KEY_NAME');

// With fallback
try {
  const secret = await secretManager.getSecret('KEY_NAME');
} catch (error) {
  console.warn('Using default value');
}
```

## Testing the Fix

### Step 1: Verify Secrets are Stored
Check that VNPAY credentials are in Secret Manager:
```bash
# The secrets should be in: backend/.secrets.enc
# Encrypted with key in: backend/.secret-key
```

### Step 2: Test Payment Creation
1. Start the backend: `npm start`
2. Check console for: `✅ Secret Manager initialization completed`
3. Verify all 21 secrets are loaded
4. Attempt to create a payment order
5. Check that VNPAY payment URL is generated correctly

### Step 3: Verify VNPAY Integration
- Payment URL should contain valid `vnp_TmnCode` and `vnp_SecureHash`
- VNPAY should accept the payment request (no error 71)
- Payment flow should complete successfully

## Secrets Managed by Secret Manager

The following secrets are now managed by Secret Manager:

```
VNPAY Credentials:
- VNP_TMN_CODE
- VNP_HASH_SECRET
- VNP_URL
- VNP_RETURN_URL
- VNP_EXCHANGE_RATE

Email Credentials:
- GMAIL_USER
- GMAIL_APP_PASSWORD

Application Configuration:
- COMPANY_NAME
- FRONTEND_URL
- NODE_ENV
- PORT

Database & Services:
- MONGODB_URI
- QDRANT_URL
- REDIS_URL

API Keys:
- JWT_SECRET
- GEMINI_API_KEY
- AGORA_APP_ID
- AGORA_APP_CERTIFICATE
```

## Important Notes

### ⚠️ Critical: Encryption Key Management
- The `.secret-key` file is generated automatically on first run
- **MUST be backed up securely** - losing it means losing access to all encrypted secrets
- **NEVER commit to version control** - add to `.gitignore`

### 🔒 Security Best Practices
1. Keep `.secret-key` file secure and backed up
2. Keep `.secrets.enc` file backed up
3. In production, use cloud-based secret managers (AWS Secrets Manager, Azure Key Vault, etc.)
4. Rotate secrets regularly
5. Never log secret values

### 📝 Migration from .env
If you need to re-migrate from `.env`:
```javascript
// In secretInitializer.js, this is called automatically:
await secretManager.migrateFromEnv();
```

## Troubleshooting

### Issue: "Secret 'VNP_TMN_CODE' not found"
**Solution:** 
1. Ensure `.env` file exists with the secret
2. Restart the application to trigger migration
3. Or manually set the secret using the CLI:
   ```bash
   node scripts/secretCLI.js set VNP_TMN_CODE <value>
   ```

### Issue: Payment still failing with error 71
**Solution:**
1. Verify VNPAY credentials are correct in Secret Manager
2. Check that `VNP_TMN_CODE` matches your VNPAY merchant account
3. Verify `VNP_HASH_SECRET` is correct (case-sensitive)
4. Ensure `VNP_URL` points to correct VNPAY endpoint (sandbox or production)

### Issue: "Cannot read property 'getSecret' of undefined"
**Solution:**
1. Ensure Secret Manager is initialized before payment controller is called
2. Check that `secretInitializer` is properly imported
3. Verify `app.js` calls `initializeSecrets()` before starting the server

## Related Files
- `/backend/services/secretManager.js` - Core Secret Manager implementation
- `/backend/services/secretInitializer.js` - Initialization logic
- `/backend/scripts/secretCLI.js` - CLI tool for managing secrets
- `/backend/SECRET_MANAGER_GUIDE.md` - Detailed Secret Manager documentation

## Next Steps

1. ✅ Restart the backend server
2. ✅ Test payment creation flow
3. ✅ Verify VNPAY payment page loads correctly
4. ✅ Complete test payment transaction
5. ✅ Monitor logs for any errors

---

**Last Updated:** December 2, 2025
**Status:** Fixed and Ready for Testing

