# VNPAY Error 71 - What to Do Now

## 📊 Current Status

✅ **Your Code:** Working perfectly  
✅ **Backend:** All secrets loaded (21/21)  
✅ **Payment URL Generation:** Working  
✅ **Secret Manager:** Initialized successfully  
❌ **VNPAY:** Rejecting with error 71

---

## 🎯 What Error 71 Means

**Error 71 = "Website not approved"**

This means VNPAY is rejecting your payment request because:

1. **Your merchant account is not approved**, OR
2. **Your website URL is not registered**, OR
3. **Your account is inactive**

**This is NOT a code issue - it's a VNPAY account configuration issue.**

---

## ⏭️ Next Steps (In Order)

### Step 1: Run Debug Script (5 minutes)

```bash
cd backend
node scripts/debugVNPAY.js
```

This will:
- ✅ Verify all VNPAY credentials are loaded
- ✅ Test payment URL generation
- ✅ Show you the generated payment URL
- ✅ Identify any missing credentials

**Expected output:**
```
✅ VNP_TMN_CODE: 2QXYZ1234
✅ VNP_HASH_SECRET: xxxxxxxx... (hidden for security)
✅ VNP_URL: https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
✅ VNP_RETURN_URL: http://localhost:5173/checkout?payment=success
✅ Payment URL generated successfully
```

### Step 2: Check VNPAY Merchant Portal (10 minutes)

1. **Log In**
   - Go to: https://merchant.vnpayment.vn/
   - Enter your merchant username and password

2. **Check Account Status**
   - Look for: **Thông tin tài khoản** (Account Information)
   - Status should be: **Hoạt động** (Active) ✅
   - If status is: **Chờ phê duyệt** (Pending) → Contact VNPAY

3. **Check Website Registration**
   - Look for: **Quản lý website** (Website Management)
   - Your website URL should be listed:
     - For development: `http://localhost:5173`
     - For production: `https://yourdomain.com`
   - Status should be: **Đã phê duyệt** (Approved) ✅
   - If not listed → Register it (see Step 3)

4. **Verify Credentials**
   - Find your **TMN Code** (Mã TMN)
   - Find your **Hash Secret** (Khóa bí mật)
   - Compare with your `.env` file - they should match exactly

### Step 3: Register Website URL (If Not Already Registered)

**If your website URL is not in VNPAY merchant portal:**

1. Log into VNPAY merchant portal
2. Go to: **Quản lý website** (Website Management)
3. Click: **Thêm website** (Add Website)
4. Enter your website URL:
   - For development: `http://localhost:5173`
   - For production: `https://yourdomain.com`
5. Click: **Lưu** (Save)
6. Wait for approval (usually instant for sandbox)

### Step 4: Verify Credentials Match

**Check your `.env` file:**

```bash
# View your .env file
cat backend/.env | grep VNP
```

**Should show:**
```
VNP_TMN_CODE=<your-code>
VNP_HASH_SECRET=<your-secret>
VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNP_RETURN_URL=http://localhost:5173/checkout?payment=success
```

**Verify these match VNPAY merchant portal exactly.**

### Step 5: Restart Backend

```bash
# Stop current backend (Ctrl+C)
# Then restart:
cd backend
npm start
```

**Expected output:**
```
✅ Secret Manager initialization completed
🔍 Secret Manager Status: { initialized: true, secretsCount: 21, encryptionKeyPresent: true }
MongoDB connected successfully
Server is running on port 3000
```

### Step 6: Test Payment Again

1. Open your application
2. Add products to cart
3. Go to checkout
4. Select VNPAY payment
5. Click "Pay with VNPAY"

**Expected result:**
- ✅ Redirected to VNPAY payment page
- ✅ NO error 71
- ✅ Payment form displayed

---

## 🆘 If Error 71 Still Appears

### Check This First

- [ ] Account status in VNPAY: **Active** ✅
- [ ] Website URL registered in VNPAY: **Yes** ✅
- [ ] Website URL status: **Approved** ✅
- [ ] TMN Code matches: **Yes** ✅
- [ ] Hash Secret matches: **Yes** ✅
- [ ] Backend restarted: **Yes** ✅

### If All Above Are Checked

**Contact VNPAY Support:**

Email: `hotrovnpay@vnpay.vn`

**Subject:** Error 71 - Website not approved

**Message:**
```
Hello,

I'm getting error 71 when trying to process payments on my website.

Details:
- TMN Code: [your-tmn-code]
- Website URL: [your-website-url]
- Error Code: 71
- Error Message: "Website này chưa được phê duyệt"
- Transaction Reference: Mplr2SDa1j

I've verified:
✅ My account is active
✅ My website URL is registered
✅ My credentials are correct
✅ I'm using the sandbox environment

Please help me resolve this issue.

Thank you,
[Your Name]
```

---

## 📋 Quick Checklist

### Before Testing
- [ ] Run debug script: `node scripts/debugVNPAY.js`
- [ ] All credentials loaded successfully
- [ ] Payment URL generated successfully

### VNPAY Account
- [ ] Logged into VNPAY merchant portal
- [ ] Account status is: **Active**
- [ ] Website URL is registered
- [ ] Website URL status is: **Approved**
- [ ] TMN Code matches your config
- [ ] Hash Secret matches your config

### Backend
- [ ] Backend restarted
- [ ] All 21 secrets loaded
- [ ] No errors in logs
- [ ] Server running on port 3000

### Payment Test
- [ ] Created an order
- [ ] Proceeded to checkout
- [ ] Selected VNPAY payment
- [ ] Clicked "Pay with VNPAY"
- [ ] Redirected to VNPAY (no error 71)

---

## 🎯 Expected Timeline

| Action | Time | Status |
|--------|------|--------|
| Run debug script | 5 min | ⏭️ Do this first |
| Check VNPAY portal | 10 min | ⏭️ Do this second |
| Register website URL | 5 min | ⏭️ If needed |
| Restart backend | 2 min | ⏭️ After changes |
| Test payment | 5 min | ⏭️ Final test |
| **Total** | **~30 min** | ⏭️ **Expected time** |

---

## 🔑 Key Points

### Your Code is Correct ✅
- Backend working perfectly
- All secrets loaded
- Payment URL generated correctly
- No code issues

### Error 71 is Normal ✅
- Common when setting up VNPAY
- Usually resolved by account approval or URL registration
- Once resolved, payments work immediately

### You're Close ✅
- Just need to verify VNPAY account setup
- Register website URL if needed
- Restart backend
- Test again

---

## 📞 Support Resources

**VNPAY Support:**
- Email: `hotrovnpay@vnpay.vn`
- Website: https://vnpayment.vn/
- Merchant Portal: https://merchant.vnpayment.vn/

**Your Documentation:**
- `VNPAY_ERROR_71_DIAGNOSIS.md` - Detailed diagnosis
- `VNPAY_ERROR_71_RESOLUTION.md` - Complete resolution guide
- `scripts/debugVNPAY.js` - Debug script

---

## ✨ Summary

| Item | Status | Action |
|------|--------|--------|
| **Code** | ✅ Working | None needed |
| **Backend** | ✅ Working | None needed |
| **Secrets** | ✅ Loaded | None needed |
| **VNPAY Account** | ❌ Check needed | See Step 2 |
| **Website URL** | ❌ Check needed | See Step 3 |
| **Testing** | ⏭️ Ready | See Step 6 |

---

**Start with Step 1 (Run debug script) and work through the steps in order.**

**Expected time to resolution: 30 minutes**

**Status: Ready to proceed** [object Object]
