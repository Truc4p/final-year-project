// Simple email test without MongoDB
// Run this with: node testEmailOnly.js

require('dotenv').config();
const emailService = require('./services/emailService');

async function testEmailOnly() {
  try {
    console.log('🚀 Testing email functionality only...\n');
    
    // Test email service connection
    console.log('🔍 Testing Gmail SMTP connection...');
    const isEmailServiceReady = await emailService.verifyConnection();
    
    if (!isEmailServiceReady) {
      console.log('❌ Email service connection failed');
      console.log('📝 Check your Gmail credentials in .env file');
      return;
    }
    
    console.log('✅ Gmail SMTP connection verified successfully!');
    
    // Test sending a single email
    console.log('\n📧 Sending test email...');
    const testResult = await emailService.sendEmail(
      'truc9pham@gmail.com', // Send to yourself for testing
      'Test Email from Wrencos - Email Service Working! 🎉',
      `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; padding: 20px;">
        <h1 style="color: #28a745;">🎉 Email Service Test Successful!</h1>
        <p>Congratulations! Your Wrencos email functionality is working perfectly.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3>✅ What's Working:</h3>
          <ul>
            <li>Gmail SMTP connection</li>
            <li>Nodemailer integration</li>
            <li>HTML email sending</li>
            <li>Variable replacement (ready for campaigns)</li>
          </ul>
        </div>
        
        <p><strong>Test Details:</strong></p>
        <ul>
          <li><strong>Sent at:</strong> ${new Date().toLocaleString()}</li>
          <li><strong>From:</strong> Wrencos Email Service</li>
          <li><strong>Service:</strong> Gmail SMTP</li>
        </ul>
        
        <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>🚀 Next Steps:</strong></p>
          <ol>
            <li>Start MongoDB: <code>brew services start mongodb-community</code></li>
            <li>Test full campaign functionality through the admin interface</li>
            <li>Create email campaigns for your final year project!</li>
          </ol>
        </div>
        
        <p>Happy emailing! 📬</p>
        <p><em>- Your Wrencos Team</em></p>
      </div>
      `,
      'Email Service Test Successful! Your Wrencos email functionality is working perfectly. Next steps: Start MongoDB and test campaign functionality.'
    );
    
    if (testResult.success) {
      console.log('✅ Test email sent successfully!');
      console.log(`📬 Message ID: ${testResult.messageId}`);
      console.log(`📧 Check your inbox: ${testResult.to}`);
      console.log('\n🎉 Email functionality is working perfectly!');
      
      console.log('\n📝 Next Steps:');
      console.log('1. Start MongoDB: brew services start mongodb-community');
      console.log('2. Start your backend server: npm run dev');
      console.log('3. Test creating campaigns through the admin interface');
      
    } else {
      console.log('❌ Test email failed:', testResult.error);
      console.log('\n🔧 Troubleshooting:');
      console.log('- Double-check your Gmail App Password');
      console.log('- Make sure 2-Step Verification is enabled');
      console.log('- Try generating a new App Password');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.message.includes('Invalid login')) {
      console.log('\n🔧 Gmail Authentication Issue:');
      console.log('- Your App Password might be incorrect');
      console.log('- Try generating a new App Password from Google Account');
      console.log('- Make sure you copied it without spaces');
    }
  }
}

// Test variable replacement functionality
async function testVariableReplacement() {
  try {
    console.log('\n🧪 Testing variable replacement...');
    
    const sampleRecipient = {
      email: 'truc9pham@gmail.com',
      name: 'Truc Pham'
    };
    
    const htmlTemplate = `
      <h1>Hello {{subscriber_name}}!</h1>
      <p>Your email is: {{subscriber_email}}</p>
      <p>Company: {{company_name}}</p>
      <p>Date: {{current_date}}</p>
      <a href="{{unsubscribe_url}}">Unsubscribe</a>
    `;
    
    const personalizedHtml = emailService.replaceVariables(htmlTemplate, sampleRecipient);
    
    console.log('✅ Variable replacement working!');
    console.log('📝 Sample output:');
    console.log(personalizedHtml);
    
  } catch (error) {
    console.error('❌ Variable replacement test failed:', error);
  }
}

// Run the tests
async function runAllTests() {
  await testEmailOnly();
  await testVariableReplacement();
}

if (require.main === module) {
  runAllTests();
}