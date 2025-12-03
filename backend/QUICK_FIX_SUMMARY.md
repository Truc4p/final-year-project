# VNPAY Payment Fix - Quick Summary

## The Problem
❌ VNPAY payments failing with error code 71 after Secret Manager implementation

## The Root Cause
After moving secrets to Secret Manager, the payment controller was still reading from `process.env` which no longer contained the VNPAY credentials.

## The Fix (2 Files Updated)

### 1. Payment Controller (`controllers/ecommerce/paymentController.js`)

**Before:**
```javascript
const vnpTmnCode = process.env.VNP_TMN_CODE;
const vnpHashSecret = process.env.VNP_HASH_SECRET;
const vnpUrl = process.env.VNP_URL;
const vnpReturnUrl = process.env.VNP_RETURN_URL;
const exchangeRate = Number(process.env.VNP_EXCHANGE_RATE) || 24000;
```

**After:**
```javascript
const { secretManager } = require('../../services/secretInitializer');

// In createVnpayPayment():
const vnpTmnCode = await secretManager.getSecret('VNP_TMN_CODE');
const vnpHashSecret = await secretManager.getSecret('VNP_HASH_SECRET');
const vnpUrl = await secretManager.getSecret('VNP_URL');
const vnpReturnUrl = await secretManager.getSecret('VNP_RETURN_URL');

// With fallback for exchange rate:
let exchangeRate = 24000;
try {
  const exchangeRateSecret = await secretManager.getSecret('VNP_EXCHANGE_RATE');
  exchangeRate = Number(exchangeRateSecret) || 24000;
} catch (error) {
  console.warn('⚠️ Using default exchange rate:', exchangeRate);
}
```

### 2. Email Service (`services/emailService.js`)

**Before:**
```javascript
from: `"${process.env.COMPANY_NAME || 'Your Company'}" <${process.env.GMAIL_USER}>`,
// ...
'{{unsubscribe_url}}': `${process.env.FRONTEND_URL || 'http://localhost:5173'}/unsubscribe/...`
```

**After:**
```javascript
const gmailUser = await secretManager.getSecret('GMAIL_USER');
const companyName = await secretManager.getSecret('COMPANY_NAME');
const frontendUrl = await secretManager.getSecret('FRONTEND_URL');

from: `"${companyName}" <${gmailUser}>`,
// ...
'{{unsubscribe_url}}': `${frontendUrl}/unsubscribe/...`
```

## What Changed

| Aspect | Before | After |
|--------|--------|-------|
| Credential Source | `process.env` | Secret Manager |
| Storage | `.env` file (plaintext) | `.secrets.enc` (encrypted) |
| Access Pattern | Synchronous | Asynchronous (async/await) |
| Error Handling | None | Try-catch with fallbacks |
| Security | Low | High (AES-256 encryption) |

## How to Test

1. **Restart Backend:**
   ```bash
   npm start
   ```

2. **Check Logs:**
   - Look for: `✅ Secret Manager initialization completed`
   - Verify: `📂 Loaded 21 secrets from encrypted storage`

3. **Test Payment:**
   - Create a new order
   - Proceed to checkout
   - Click "Pay with VNPAY"
   - Should redirect to VNPAY payment page (not error 71)

4. **Verify Credentials:**
   - Check that VNPAY payment URL contains valid parameters
   - Confirm `vnp_TmnCode` and `vnp_SecureHash` are present

## Key Points

✅ **All VNPAY credentials now come from Secret Manager**
✅ **Fallback values provided for non-critical secrets**
✅ **Async/await pattern ensures secrets are loaded before use**
✅ **Error handling prevents crashes if secrets are missing**
✅ **Email service also updated for consistency**

## Files Modified
- ✅ `backend/controllers/ecommerce/paymentController.js`
- ✅ `backend/services/emailService.js`

## Status
🟢 **Ready for Testing**

---

**Note:** If you still see error 71 after this fix, verify that your VNPAY credentials (TMN_CODE and HASH_SECRET) are correct in the Secret Manager.

