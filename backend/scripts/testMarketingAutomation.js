/**
 * Test script for Marketing Automation services
 * Run with: node scripts/testMarketingAutomation.js
 */

require('dotenv').config();
const smsService = require('../services/smsService');
const pushNotificationService = require('../services/pushNotificationService');

async function testServices() {
  console.log('🧪 Testing Marketing Automation Services\n');
  console.log('='.repeat(50));

  // Test SMS Service
  console.log('\n📱 Testing SMS Service...');
  console.log('Configuration Status:', smsService.isConfigured ? '✅ Configured' : '⚠️  Mock Mode');
  
  const smsResult = await smsService.sendSMS({
    to: '+1234567890',
    message: 'Test message from Wrencos Marketing Automation: Hello {{name}}!',
    variables: {
      name: 'John Doe'
    }
  });
  
  console.log('SMS Result:', smsResult);

  // Test Push Notification Service
  console.log('\n🔔 Testing Push Notification Service...');
  console.log('Configuration Status:', pushNotificationService.isConfigured ? '✅ Configured' : '⚠️  Mock Mode');
  
  const pushResult = await pushNotificationService.sendToDevice({
    token: 'mock_device_token_here_would_be_152_characters_long',
    title: 'Test Notification',
    body: 'Hello {{name}}, this is a test push notification!',
    variables: {
      name: 'Jane Smith'
    },
    data: {
      type: 'test',
      timestamp: new Date().toISOString()
    }
  });
  
  console.log('Push Notification Result:', pushResult);

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Summary:');
  console.log('SMS Service:', smsResult.success ? '✅ Working' : '❌ Failed');
  console.log('Push Service:', pushResult.success ? '✅ Working' : '❌ Failed');
  
  if (!smsService.isConfigured || !pushNotificationService.isConfigured) {
    console.log('\n⚠️  Note: Services running in mock mode.');
    console.log('Add credentials to .env to enable real sending.');
    console.log('See MARKETING_AUTOMATION_SETUP.md for instructions.');
  }
  
  console.log('\n✨ Test complete!\n');
}

// Run tests
testServices().catch(error => {
  console.error('Test error:', error);
  process.exit(1);
});
