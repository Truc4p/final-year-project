# VNPAY Error 71 - Diagnosis & Solutions

## 🔴 Current Status

**Error:** Code 71 - "Website này chưa được phê duyệt" (Website not approved)  
**Backend:** ✅ Working correctly (all secrets loaded)  
**Issue:** ❌ VNPAY merchant account configuration

---

## 📋 What Error 71 Means

Error 71 is **NOT** a code issue. It means:

> **"Your merchant website has not been approved by VNPAY"**

This is a **merchant account status issue**, not a payment integration issue.

---

## 🔍 Diagnosis

### ✅ What's Working
- Backend starts successfully
- Secret Manager loads 21 secrets
- VNPAY credentials are retrieved correctly
- Payment URL is generated
- Request is sent to VNPAY

### ❌ What's Failing
- VNPAY rejects the payment request
- Error 71: Website not approved
- This happens at VNPAY's server, not in your code

---

## 🛠️ Solutions

### Solution 1: Check VNPAY Merchant Account Status

**Step 1: Log into VNPAY Merchant Portal**
1. Go to: https://merchant.vnpayment.vn/
2. Login with your merchant account
3. Navigate to: **Account Settings** or **Merchant Information**

**Step 2: Verify Account Status**
- Check if your account is **ACTIVE** and **APPROVED**
- Look for status indicators:
  - ✅ **Active** - Account is approved
  - ⏳ **Pending** - Waiting for approval
  - ❌ **Inactive** - Account is disabled
  - ❌ **Rejected** - Account was rejected

**Step 3: Check Website URL**
- Verify that your website URL is registered in VNPAY
- VNPAY only accepts payments from registered URLs
- Your current URL might not be registered

### Solution 2: Register Your Website URL

**If your website URL is not registered:**

1. Log into VNPAY Merchant Portal
2. Go to: **Website Management** or **Registered URLs**
3. Add your website URL:
   - For development: `http://localhost:5173`
   - For production: `https://yourdomain.com`
4. Save and wait for approval (usually instant)

### Solution 3: Check Merchant Account Details

**Verify these details in VNPAY:**

1. **TMN Code (Merchant ID)**
   - Should match your `VNP_TMN_CODE` in Secret Manager
   - Format: Usually 8 characters (e.g., `2QXYZ1234`)

2. **Hash Secret**
   - Should match your `VNP_HASH_SECRET` in Secret Manager
   - Used for signing requests

3. **Return URL**
   - Should match your `VNP_RETURN_URL`
   - Must be accessible from VNPAY servers

4. **IPN URL** (if configured)
   - Should match your backend IPN endpoint
   - Must be publicly accessible

### Solution 4: Check Sandbox vs Production

**For Testing (Sandbox):**
- Use: `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html`
- Use sandbox merchant credentials
- Use test card numbers

**For Production:**
- Use: `https://pay.vnpay.vn/vpcpay.html`
- Use production merchant credentials
- Use real card numbers

**Current Configuration:**
```javascript
// Check your VNP_URL in Secret Manager
const vnpUrl = await secretManager.getSecret('VNP_URL');
// Should be sandbox URL for testing
```

### Solution 5: Contact VNPAY Support

If you've verified everything above, contact VNPAY:

**VNPAY Support:**
- Email: `hotrovnpay@vnpay.vn`
- Phone: Check VNPAY website for support number
- Portal: https://merchant.vnpayment.vn/

**Provide them with:**
- Your TMN Code (Merchant ID)
- Your website URL
- Error code: 71
- Transaction reference: `Mplr2SDa1j` (from your error)

---

## ✅ Verification Checklist

Before contacting VNPAY, verify:

### Backend Configuration
- [ ] `VNP_TMN_CODE` is set in Secret Manager
- [ ] `VNP_HASH_SECRET` is set in Secret Manager
- [ ] `VNP_URL` is set to sandbox URL (for testing)
- [ ] `VNP_RETURN_URL` is set correctly
- [ ] All 21 secrets loaded successfully
- [ ] No errors in backend logs

### VNPAY Account
- [ ] Account is ACTIVE and APPROVED
- [ ] Website URL is registered in VNPAY
- [ ] TMN Code matches `VNP_TMN_CODE`
- [ ] Hash Secret matches `VNP_HASH_SECRET`
- [ ] Using correct environment (sandbox vs production)

### Payment Request
- [ ] Payment URL is generated successfully
- [ ] URL contains valid `vnp_TmnCode`
- [ ] URL contains valid `vnp_SecureHash`
- [ ] URL contains correct amount
- [ ] URL contains correct return URL

---

## 🧪 Testing Steps

### Step 1: Verify Backend is Working
```bash
# Check logs for:
✅ Secret Manager initialization completed
✅ 21 secrets loaded
✅ MongoDB connected
```

### Step 2: Test Payment URL Generation
```bash
# Make a test payment request
# Check that URL is generated without errors
# Verify URL contains valid parameters
```

### Step 3: Check VNPAY Merchant Portal
1. Log in to: https://merchant.vnpayment.vn/
2. Check account status
3. Verify website URL is registered
4. Check TMN Code and Hash Secret

### Step 4: Try Payment Again
1. Create a new order
2. Proceed to checkout
3. Select VNPAY payment
4. Check if error 71 still appears

---

## 📊 Common Error 71 Causes

| Cause | Solution |
|-------|----------|
| Account not approved | Contact VNPAY support |
| Website URL not registered | Register URL in VNPAY portal |
| Wrong TMN Code | Verify in VNPAY portal |
| Wrong Hash Secret | Verify in VNPAY portal |
| Using wrong environment | Check sandbox vs production |
| Account inactive | Reactivate in VNPAY portal |
| Account suspended | Contact VNPAY support |

---

## 🔐 Verify Your Credentials

To verify your credentials are correct:

### Check VNP_TMN_CODE
```bash
# In your backend logs, you should see:
🔐 Secret 'VNP_TMN_CODE' stored successfully

# The value should be your merchant ID from VNPAY
# Format: Usually 8 characters like "2QXYZ1234"
```

### Check VNP_HASH_SECRET
```bash
# In your backend logs, you should see:
🔐 Secret 'VNP_HASH_SECRET' stored successfully

# This is your secret key from VNPAY
# Keep it secure - never share it
```

### Check VNP_URL
```bash
# For testing, should be:
https://sandbox.vnpayment.vn/paymentv2/vpcpay.html

# For production, should be:
https://pay.vnpay.vn/vpcpay.html
```

---

## 🚀 Next Steps

### Immediate Actions
1. ✅ Verify backend is working (it is!)
2. ⏭️ Check VNPAY merchant account status
3. ⏭️ Verify website URL is registered
4. ⏭️ Confirm TMN Code and Hash Secret
5. ⏭️ Try payment again

### If Still Failing
1. Contact VNPAY support
2. Provide transaction reference: `Mplr2SDa1j`
3. Provide your TMN Code
4. Provide your website URL
5. Ask them to approve your account

### If Account is Approved
1. Restart backend
2. Test payment again
3. Error 71 should be gone
4. Payment should work

---

## 📞 VNPAY Support Contact

**Email:** hotrovnpay@vnpay.vn  
**Website:** https://vnpayment.vn/  
**Merchant Portal:** https://merchant.vnpayment.vn/  

**When contacting support, provide:**
- Your TMN Code (Merchant ID)
- Your website URL
- Error code: 71
- Transaction reference: `Mplr2SDa1j`
- Screenshot of error message

---

## ✨ Important Notes

### Your Code is Correct ✅
- Backend is working perfectly
- Secrets are loaded correctly
- Payment URL is generated correctly
- The issue is NOT in your code

### The Issue is VNPAY Configuration ❌
- Your merchant account may not be approved
- Your website URL may not be registered
- Your credentials may be incorrect
- VNPAY is rejecting the request

### This is Normal ✅
- Error 71 is common when setting up VNPAY
- It's usually resolved by VNPAY approving your account
- Once approved, payments will work immediately

---

## 🎯 Summary

| Item | Status |
|------|--------|
| **Your Code** | ✅ Working correctly |
| **Secret Manager** | ✅ All 21 secrets loaded |
| **Backend** | ✅ Running without errors |
| **Payment URL Generation** | ✅ Working |
| **VNPAY Merchant Account** | ❌ Not approved or URL not registered |

**Action Required:** Check VNPAY merchant account status and website URL registration

---

**Last Updated:** December 2, 2025  
**Status:** Awaiting VNPAY merchant account approval

