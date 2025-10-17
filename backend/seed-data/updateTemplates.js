// Simple script to update email templates via API
const axios = require('axios');

const API_URL = 'http://localhost:3000';

// Login as admin first
async function updateTemplates() {
  try {
    console.log('🔐 Logging in as admin...');
    
    // You need to use your actual admin credentials
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      username: 'ad',  // Replace with your admin username
      password: 'Dontbsj1wyr!'  // Replace with your admin password
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Logged in successfully');
    
    // Get all templates
    console.log('📄 Fetching templates...');
    const templatesResponse = await axios.get(`${API_URL}/email-templates`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const templates = templatesResponse.data.data;
    console.log(`Found ${templates.length} templates`);
    
    // Delete all existing templates
    console.log('🗑️  Deleting old templates...');
    for (const template of templates) {
      await axios.delete(`${API_URL}/email-templates/${template._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log(`  Deleted: ${template.name}`);
    }
    
    // Create new templates
    const newTemplates = [
      {
        name: 'Newsletter Template',
        description: 'Clean and professional newsletter template',
        category: 'newsletter',
        htmlContent: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WrenCos Newsletter</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background-color: #007bff; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6c757d; }
        .button { background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
        .unsubscribe { margin-top: 20px; }
        .unsubscribe a { color: #6c757d; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>WrenCos</h1>
            <p>Monthly Newsletter</p>
        </div>
        
        <div class="content">
            <h2>Welcome to our newsletter!</h2>
            <p>Hi {{subscriber_name}},</p>
            <p>Here is our latest news and updates...</p>
            
            <a href="https://example.com" class="button">Read More</a>
            
            <p>Best regards,<br>The WrenCos Team</p>
        </div>
        
        <div class="footer">
            <p>You're receiving this email because you subscribed to our newsletter.</p>
            <div class="unsubscribe">
                <a href="{{unsubscribe_url}}">Unsubscribe</a>
            </div>
            <p>© {{current_date}} WrenCos. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`,
        isDefault: true
      },
      // Add other templates here...
    ];
    
    console.log('✨ Creating new templates...');
    for (const template of newTemplates) {
      const response = await axios.post(`${API_URL}/email-templates`, template, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log(`  Created: ${response.data.data.name}`);
    }
    
    console.log('🎉 Templates updated successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

updateTemplates();
