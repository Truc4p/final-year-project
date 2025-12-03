#!/usr/bin/env node

/**
 * VNPAY Debug Script
 * Helps diagnose VNPAY configuration issues
 */

const { secretManager } = require('../services/secretInitializer');
const crypto = require('crypto');
const querystring = require('qs');

async function debugVNPAY() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║           VNPAY Configuration Debug Tool                   ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  try {
    // Initialize Secret Manager
    console.log('🔐 Initializing Secret Manager...');
    await secretManager.initialize();
    console.log('✅ Secret Manager initialized\n');

    // Get VNPAY credentials
    console.log('📋 Retrieving VNPAY Credentials...\n');

    let vnpTmnCode, vnpHashSecret, vnpUrl, vnpReturnUrl, vnpExchangeRate;

    try {
      vnpTmnCode = await secretManager.getSecret('VNP_TMN_CODE');
      console.log(`✅ VNP_TMN_CODE: ${vnpTmnCode}`);
    } catch (error) {
      console.log(`❌ VNP_TMN_CODE: NOT FOUND`);
      console.log(`   Error: ${error.message}`);
    }

    try {
      vnpHashSecret = await secretManager.getSecret('VNP_HASH_SECRET');
      console.log(`✅ VNP_HASH_SECRET: ${vnpHashSecret.substring(0, 10)}... (hidden for security)`);
    } catch (error) {
      console.log(`❌ VNP_HASH_SECRET: NOT FOUND`);
      console.log(`   Error: ${error.message}`);
    }

    try {
      vnpUrl = await secretManager.getSecret('VNP_URL');
      console.log(`✅ VNP_URL: ${vnpUrl}`);
    } catch (error) {
      console.log(`❌ VNP_URL: NOT FOUND`);
      console.log(`   Error: ${error.message}`);
    }

    try {
      vnpReturnUrl = await secretManager.getSecret('VNP_RETURN_URL');
      console.log(`✅ VNP_RETURN_URL: ${vnpReturnUrl}`);
    } catch (error) {
      console.log(`❌ VNP_RETURN_URL: NOT FOUND`);
      console.log(`   Error: ${error.message}`);
    }

    try {
      vnpExchangeRate = await secretManager.getSecret('VNP_EXCHANGE_RATE');
      console.log(`✅ VNP_EXCHANGE_RATE: ${vnpExchangeRate}\n`);
    } catch (error) {
      console.log(`⚠️  VNP_EXCHANGE_RATE: NOT FOUND (will use default 24000)\n`);
    }

    // Verify credentials format
    console.log('🔍 Verifying Credential Format...\n');

    if (vnpTmnCode) {
      if (vnpTmnCode.length >= 6) {
        console.log(`✅ VNP_TMN_CODE format: Valid (length: ${vnpTmnCode.length})`);
      } else {
        console.log(`⚠️  VNP_TMN_CODE format: Suspicious (length: ${vnpTmnCode.length}, expected >= 6)`);
      }
    }

    if (vnpHashSecret) {
      if (vnpHashSecret.length >= 20) {
        console.log(`✅ VNP_HASH_SECRET format: Valid (length: ${vnpHashSecret.length})`);
      } else {
        console.log(`⚠️  VNP_HASH_SECRET format: Suspicious (length: ${vnpHashSecret.length}, expected >= 20)`);
      }
    }

    if (vnpUrl) {
      if (vnpUrl.includes('vnpayment.vn')) {
        console.log(`✅ VNP_URL format: Valid (contains vnpayment.vn)`);
        if (vnpUrl.includes('sandbox')) {
          console.log(`   ℹ️  Using SANDBOX environment`);
        } else if (vnpUrl.includes('pay.vnpay')) {
          console.log(`   ℹ️  Using PRODUCTION environment`);
        }
      } else {
        console.log(`❌ VNP_URL format: Invalid (doesn't contain vnpayment.vn)`);
      }
    }

    if (vnpReturnUrl) {
      if (vnpReturnUrl.includes('http')) {
        console.log(`✅ VNP_RETURN_URL format: Valid (contains http)`);
      } else {
        console.log(`❌ VNP_RETURN_URL format: Invalid (missing http)`);
      }
    }

    // Test payment URL generation
    console.log('\n🧪 Testing Payment URL Generation...\n');

    try {
      const testOrderId = 'TEST_' + Date.now();
      const testAmount = 100 * 24000 * 100; // $100 USD to VND to smallest unit
      const date = new Date();
      const createDate = date.toISOString().replace(/[-:T.]/g, '').slice(0, 14);

      const sortObject = (obj) => {
        const sorted = {};
        const keys = Object.keys(obj).sort();
        for (const key of keys) {
          sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, '+');
        }
        return sorted;
      };

      let vnpParams = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: vnpTmnCode && vnpTmnCode.trim(),
        vnp_Locale: 'vn',
        vnp_CurrCode: 'VND',
        vnp_TxnRef: testOrderId,
        vnp_OrderInfo: `Test payment ${testOrderId}`,
        vnp_OrderType: 'other',
        vnp_Amount: testAmount,
        vnp_ReturnUrl: vnpReturnUrl && vnpReturnUrl.trim(),
        vnp_IpAddr: '127.0.0.1',
        vnp_CreateDate: createDate,
      };

      // Sort parameters and encode values (VNPAY spec)
      const sorted = sortObject(vnpParams);

      // Generate signature on sorted params
      const signData = querystring.stringify(sorted, { encode: false });
      const hmac = crypto.createHmac('sha512', (vnpHashSecret || '').trim());
      const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

      const paymentUrl = vnpUrl + '?' + querystring.stringify(sorted, { encode: false }) + '&vnp_SecureHash=' + signed;

      console.log(`✅ Payment URL generated successfully`);
      console.log(`   Order ID: ${testOrderId}`);
      console.log(`   Amount: ${testAmount / 100} VND ($100 USD)`);
      console.log(`   Signature: ${signed.substring(0, 20)}... (valid)`);
      console.log(`\n📄 Full Payment URL:\n`);
      console.log(paymentUrl);
      console.log('\n');

    } catch (error) {
      console.log(`❌ Payment URL generation failed`);
      console.log(`   Error: ${error.message}\n`);
    }

    // Recommendations
    console.log('📋 Recommendations:\n');

    if (!vnpTmnCode) {
      console.log('❌ ACTION REQUIRED: VNP_TMN_CODE not found');
      console.log('   → Set VNP_TMN_CODE in your .env file');
      console.log('   → Or use: node scripts/secretCLI.js set VNP_TMN_CODE <your-code>\n');
    } else {
      console.log('✅ VNP_TMN_CODE is configured\n');
    }

    if (!vnpHashSecret) {
      console.log('❌ ACTION REQUIRED: VNP_HASH_SECRET not found');
      console.log('   → Set VNP_HASH_SECRET in your .env file');
      console.log('   → Or use: node scripts/secretCLI.js set VNP_HASH_SECRET <your-secret>\n');
    } else {
      console.log('✅ VNP_HASH_SECRET is configured\n');
    }

    if (!vnpUrl) {
      console.log('❌ ACTION REQUIRED: VNP_URL not found');
      console.log('   → For sandbox: https://sandbox.vnpayment.vn/paymentv2/vpcpay.html');
      console.log('   → For production: https://pay.vnpay.vn/vpcpay.html\n');
    } else {
      console.log('✅ VNP_URL is configured\n');
    }

    if (!vnpReturnUrl) {
      console.log('❌ ACTION REQUIRED: VNP_RETURN_URL not found');
      console.log('   → Set VNP_RETURN_URL in your .env file');
      console.log('   → Example: http://localhost:5173/checkout?payment=success\n');
    } else {
      console.log('✅ VNP_RETURN_URL is configured\n');
    }

    // Check VNPAY account status
    console.log('🔐 VNPAY Account Status Check:\n');
    console.log('⚠️  To verify your VNPAY account status:');
    console.log('   1. Log in to: https://merchant.vnpayment.vn/');
    console.log('   2. Check if your account is ACTIVE and APPROVED');
    console.log('   3. Verify your website URL is registered');
    console.log('   4. Confirm TMN Code matches: ' + (vnpTmnCode || 'NOT SET'));
    console.log('\n');

    // Summary
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║                      SUMMARY                              ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    const allConfigured = vnpTmnCode && vnpHashSecret && vnpUrl && vnpReturnUrl;

    if (allConfigured) {
      console.log('✅ All VNPAY credentials are configured');
      console.log('✅ Payment URL generation is working');
      console.log('\n⚠️  If you still see error 71:');
      console.log('   → Check VNPAY merchant account status');
      console.log('   → Verify website URL is registered in VNPAY');
      console.log('   → Contact VNPAY support: hotrovnpay@vnpay.vn\n');
    } else {
      console.log('❌ Some VNPAY credentials are missing');
      console.log('   → See recommendations above\n');
    }

  } catch (error) {
    console.error('❌ Debug script failed:', error.message);
    console.error(error);
  }

  process.exit(0);
}

// Run debug script
debugVNPAY();

