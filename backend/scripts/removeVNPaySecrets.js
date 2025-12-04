#!/usr/bin/env node

const { secretManager } = require('../services/secretInitializer');

const vnpaySecrets = [
  'VNP_TMN_CODE',
  'VNP_HASH_SECRET',
  'VNP_URL',
  'VNP_RETURN_URL',
  'VNP_EXCHANGE_RATE',
  'VNP_PORTAL_URL',
  'VNP_PORTAL_USERNAME',
  'VNP_PORTAL_PASSWORD',
  'VNP_SIT_URL',
  'VNP_SIT_USERNAME',
  'VNP_SIT_PASSWORD'
];

async function removeVNPaySecrets() {
  try {
    await secretManager.initialize();
    console.log('[object Object] Manager initialized');
    console.log(`\n[object Object]Removing ${vnpaySecrets.length} VNPay-related secrets...\n`);

    for (const secret of vnpaySecrets) {
      try {
        const deleted = await secretManager.deleteSecret(secret);
        if (deleted) {
          console.log(`✅ Deleted: ${secret}`);
        } else {
          console.log(`⚠️  Not found: ${secret}`);
        }
      } catch (error) {
        console.log(`❌ Error deleting ${secret}: ${error.message}`);
      }
    }

    console.log('\n✨ VNPay secrets removal complete!');
    console.log('\n📝 Make sure these environment variables are set in your .env file:');
    vnpaySecrets.forEach(secret => {
      console.log(`   - ${secret}`);
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

removeVNPaySecrets();

