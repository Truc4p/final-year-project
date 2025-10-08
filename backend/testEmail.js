// Test script for email functionality
// Run this with: node testEmail.js

require('dotenv').config();
const mongoose = require('mongoose');
const NewsletterSubscription = require('./models/marketing/newsletterSubscription');
const EmailCampaign = require('./models/marketing/emailCampaign');
const emailService = require('./services/emailService');

async function testEmailSetup() {
  try {
    console.log('🚀 Starting email functionality test...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Test email service connection
    const isEmailServiceReady = await emailService.verifyConnection();
    if (!isEmailServiceReady) {
      console.log('❌ Email service connection failed');
      console.log('📝 Make sure you have set up your Gmail credentials in .env:');
      console.log('   GMAIL_USER=your-email@gmail.com');
      console.log('   GMAIL_APP_PASSWORD=your-16-char-app-password');
      return;
    }
    console.log('✅ Email service connection verified');
    
    // Create test subscribers if they don't exist
    const testEmails = [
      { email: 'test1@example.com', name: 'Test User 1', source: 'public_page' },
      { email: 'test2@example.com', name: 'Test User 2', source: 'checkout' }
    ];
    
    for (const subscriber of testEmails) {
      try {
        await NewsletterSubscription.create({
          email: subscriber.email,
          name: subscriber.name,
          source: subscriber.source,
          status: 'active',
          preferences: {
            newsletter: true,
            promotions: true,
            newProducts: true
          }
        });
        console.log(`✅ Created test subscriber: ${subscriber.email}`);
      } catch (error) {
        if (error.code === 11000) {
          console.log(`ℹ️  Test subscriber already exists: ${subscriber.email}`);
        } else {
          console.log(`❌ Error creating subscriber ${subscriber.email}:`, error.message);
        }
      }
    }
    
    // Get total subscribers
    const totalSubscribers = await NewsletterSubscription.countDocuments({ status: 'active' });
    console.log(`📊 Total active subscribers: ${totalSubscribers}`);
    
    console.log('\n🎉 Email setup test completed!');
    console.log('📝 Next steps:');
    console.log('   1. Update your .env file with real Gmail credentials');
    console.log('   2. Test sending a campaign through the admin interface');
    console.log('   3. Check recipient inboxes for test emails');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

// Test individual email sending
async function testSingleEmail() {
  try {
    console.log('🧪 Testing single email sending...');
    
    const testEmail = 'your-test-email@gmail.com'; // Replace with your email
    const result = await emailService.sendEmail(
      testEmail,
      'Test Email from Wrencos',
      '<h1>Hello!</h1><p>This is a test email from your Wrencos application.</p><p>Email functionality is working! 🎉</p>',
      'Hello! This is a test email from your Wrencos application. Email functionality is working!'
    );
    
    if (result.success) {
      console.log('✅ Test email sent successfully!');
      console.log(`📧 Check ${testEmail} for the test message`);
    } else {
      console.log('❌ Test email failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Single email test failed:', error);
  }
}

// Run the tests
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'test-email') {
    testSingleEmail();
  } else {
    testEmailSetup();
  }
}