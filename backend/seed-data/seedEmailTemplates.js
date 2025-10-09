const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const EmailTemplate = require('../models/marketing/emailTemplate');
const User = require('../models/auth/user');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wrencos_db+srv://mongo-api:7TZYsdhwiXhiKRp9@cluster0.18pi3.mongodb://localhost:27017/wrencos_db.net/Wrencos?retryWrites=true&w=majority', {});

const defaultTemplates = [
  {
    name: 'Newsletter Template',
    description: 'Clean and professional newsletter template',
    category: 'newsletter',
    htmlContent: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{company_name}} Newsletter</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: {{style.backgroundColor}}; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background-color: {{style.primaryColor}}; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6c757d; }
        .button { background-color: {{style.primaryColor}}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
        .unsubscribe { margin-top: 20px; }
        .unsubscribe a { color: #6c757d; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{company_name}}</h1>
            <p>{{newsletter_title}}</p>
        </div>
        
        <div class="content">
            <h2>{{headline}}</h2>
            <p>{{main_content}}</p>
            
            <a href="{{cta_url}}" class="button">{{cta_text}}</a>
            
            <p>Best regards,<br>The {{company_name}} Team</p>
        </div>
        
        <div class="footer">
            <p>You're receiving this email because you subscribed to our newsletter.</p>
            <div class="unsubscribe">
                <a href="{{unsubscribe_url}}">Unsubscribe</a> | 
                <a href="{{preferences_url}}">Update Preferences</a>
            </div>
            <p>© {{current_year}} {{company_name}}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`,
    textContent: `{{company_name}} Newsletter

{{headline}}

{{main_content}}

{{cta_text}}: {{cta_url}}

Best regards,
The {{company_name}} Team

---
You're receiving this email because you subscribed to our newsletter.
Unsubscribe: {{unsubscribe_url}}
Update Preferences: {{preferences_url}}

© {{current_year}} {{company_name}}. All rights reserved.`,
    variables: [
      { name: 'company_name', label: 'Company Name', type: 'text', defaultValue: 'WrenCos', required: true },
      { name: 'newsletter_title', label: 'Newsletter Title', type: 'text', defaultValue: 'Monthly Newsletter', required: false },
      { name: 'headline', label: 'Main Headline', type: 'text', defaultValue: 'Welcome to our newsletter!', required: true },
      { name: 'main_content', label: 'Main Content', type: 'text', defaultValue: 'Here is our latest news and updates...', required: true },
      { name: 'cta_text', label: 'Button Text', type: 'text', defaultValue: 'Read More', required: false },
      { name: 'cta_url', label: 'Button URL', type: 'url', defaultValue: 'https://example.com', required: false }
    ],
    isDefault: true
  },
  
  {
    name: 'Promotion Template',
    description: 'Eye-catching template for promotional campaigns',
    category: 'promotion',
    htmlContent: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{promotion_title}} - {{company_name}}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: {{style.backgroundColor}}; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, {{style.primaryColor}}, {{style.secondaryColor}}); color: white; padding: 30px; text-align: center; }
        .promotion-badge { background-color: #ff4757; color: white; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; margin-bottom: 10px; display: inline-block; }
        .content { padding: 30px; text-align: center; }
        .discount { font-size: 48px; font-weight: bold; color: {{style.primaryColor}}; margin: 20px 0; }
        .big-button { background-color: #ff4757; color: white; padding: 18px 36px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; font-size: 18px; font-weight: bold; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6c757d; }
        .terms { font-size: 11px; color: #999; margin-top: 15px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="promotion-badge">{{promotion_type}}</div>
            <h1>{{promotion_title}}</h1>
            <p>{{promotion_subtitle}}</p>
        </div>
        
        <div class="content">
            <div class="discount">{{discount_amount}}</div>
            <h2>{{offer_description}}</h2>
            <p>{{offer_details}}</p>
            
            <a href="{{shop_url}}" class="big-button">{{cta_text}}</a>
            
            <div class="terms">
                <p>{{terms_conditions}}</p>
                <p>Expires: {{expiry_date}}</p>
            </div>
        </div>
        
        <div class="footer">
            <p>Don't want to receive promotional emails? <a href="{{unsubscribe_url}}">Unsubscribe</a></p>
            <p>© {{current_year}} {{company_name}}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`,
    textContent: `{{promotion_type}} - {{promotion_title}}

{{promotion_subtitle}}

{{discount_amount}} OFF!

{{offer_description}}

{{offer_details}}

{{cta_text}}: {{shop_url}}

{{terms_conditions}}
Expires: {{expiry_date}}

---
Don't want promotional emails? Unsubscribe: {{unsubscribe_url}}
© {{current_year}} {{company_name}}. All rights reserved.`,
    variables: [
      { name: 'company_name', label: 'Company Name', type: 'text', defaultValue: 'WrenCos', required: true },
      { name: 'promotion_type', label: 'Promotion Type', type: 'text', defaultValue: 'SPECIAL OFFER', required: true },
      { name: 'promotion_title', label: 'Promotion Title', type: 'text', defaultValue: 'Limited Time Sale!', required: true },
      { name: 'promotion_subtitle', label: 'Promotion Subtitle', type: 'text', defaultValue: 'Save big on our best products', required: false },
      { name: 'discount_amount', label: 'Discount Amount', type: 'text', defaultValue: '30% OFF', required: true },
      { name: 'offer_description', label: 'Offer Description', type: 'text', defaultValue: 'Amazing deals on all products', required: true },
      { name: 'offer_details', label: 'Offer Details', type: 'text', defaultValue: 'Use code SAVE30 at checkout', required: true },
      { name: 'cta_text', label: 'Button Text', type: 'text', defaultValue: 'Shop Now', required: true },
      { name: 'shop_url', label: 'Shop URL', type: 'url', defaultValue: 'https://example.com/shop', required: true },
      { name: 'terms_conditions', label: 'Terms & Conditions', type: 'text', defaultValue: 'Valid for new customers only. Cannot be combined with other offers.', required: false },
      { name: 'expiry_date', label: 'Expiry Date', type: 'text', defaultValue: 'December 31, 2024', required: true }
    ],
    styles: {
      primaryColor: '#007bff',
      secondaryColor: '#6f42c1',
      backgroundColor: '#f8f9fa',
      textColor: '#333333',
      fontFamily: 'Arial, sans-serif'
    },
    isDefault: true
  },

  {
    name: 'Welcome Email Template',
    description: 'Warm welcome email for new subscribers',
    category: 'welcome',
    htmlContent: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to {{company_name}}!</title>
    <style>
        body { font-family: {{style.fontFamily}}; margin: 0; padding: 0; background-color: {{style.backgroundColor}}; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background-color: {{style.primaryColor}}; color: white; padding: 40px 30px; text-align: center; }
        .welcome-icon { font-size: 48px; margin-bottom: 10px; }
        .content { padding: 40px 30px; }
        .welcome-message { font-size: 18px; line-height: 1.6; margin-bottom: 25px; }
        .benefits { background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 25px 0; }
        .benefit-item { margin-bottom: 10px; padding-left: 20px; position: relative; }
        .benefit-item:before { content: "✓"; position: absolute; left: 0; color: {{style.primaryColor}}; font-weight: bold; }
        .cta-section { text-align: center; margin: 30px 0; }
        .button { background-color: {{style.primaryColor}}; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; }
        .footer { background-color: #f8f9fa; padding: 25px; text-align: center; font-size: 14px; color: #6c757d; }
        .social-links { margin: 15px 0; }
        .social-links a { margin: 0 10px; text-decoration: none; color: {{style.primaryColor}}; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="welcome-icon">🎉</div>
            <h1>Welcome to {{company_name}}!</h1>
            <p>We're thrilled to have you join our community</p>
        </div>
        
        <div class="content">
            <div class="welcome-message">
                <p>Hi {{subscriber_name}},</p>
                <p>{{welcome_message}}</p>
            </div>
            
            <div class="benefits">
                <h3>Here's what you can expect:</h3>
                <div class="benefit-item">{{benefit_1}}</div>
                <div class="benefit-item">{{benefit_2}}</div>
                <div class="benefit-item">{{benefit_3}}</div>
            </div>
            
            <div class="cta-section">
                <p>Ready to get started?</p>
                <a href="{{get_started_url}}" class="button">{{cta_text}}</a>
            </div>
            
            <p>If you have any questions, feel free to reply to this email or contact our support team.</p>
            
            <p>Welcome aboard!<br>
            The {{company_name}} Team</p>
        </div>
        
        <div class="footer">
            <div class="social-links">
                <a href="{{facebook_url}}">Facebook</a>
                <a href="{{twitter_url}}">Twitter</a>
                <a href="{{instagram_url}}">Instagram</a>
            </div>
            <p>You're receiving this email because you subscribed to {{company_name}}.</p>
            <p><a href="{{unsubscribe_url}}">Unsubscribe</a> | <a href="{{preferences_url}}">Update Preferences</a></p>
            <p>© {{current_year}} {{company_name}}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`,
    variables: [
      { name: 'company_name', label: 'Company Name', type: 'text', defaultValue: 'WrenCos', required: true },
      { name: 'subscriber_name', label: 'Subscriber Name', type: 'text', defaultValue: 'there', required: false },
      { name: 'welcome_message', label: 'Welcome Message', type: 'text', defaultValue: 'Thank you for subscribing to our newsletter! We\'re excited to share our latest updates, exclusive offers, and valuable insights with you.', required: true },
      { name: 'benefit_1', label: 'Benefit 1', type: 'text', defaultValue: 'Exclusive access to new products and services', required: false },
      { name: 'benefit_2', label: 'Benefit 2', type: 'text', defaultValue: 'Special discounts and promotional offers', required: false },
      { name: 'benefit_3', label: 'Benefit 3', type: 'text', defaultValue: 'Weekly tips and industry insights', required: false },
      { name: 'cta_text', label: 'Button Text', type: 'text', defaultValue: 'Explore Our Products', required: true },
      { name: 'get_started_url', label: 'Get Started URL', type: 'url', defaultValue: 'https://example.com/products', required: true },
      { name: 'facebook_url', label: 'Facebook URL', type: 'url', defaultValue: '#', required: false },
      { name: 'twitter_url', label: 'Twitter URL', type: 'url', defaultValue: '#', required: false },
      { name: 'instagram_url', label: 'Instagram URL', type: 'url', defaultValue: '#', required: false }
    ],
    isDefault: true
  },

  {
    name: 'Product Launch Template',
    description: 'Exciting template for new product announcements',
    category: 'product_launch',
    htmlContent: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{product_name}} Launch - {{company_name}}</title>
    <style>
        body { font-family: {{style.fontFamily}}; margin: 0; padding: 0; background-color: {{style.backgroundColor}}; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, {{style.primaryColor}}, {{style.secondaryColor}}); color: white; padding: 30px; text-align: center; position: relative; overflow: hidden; }
        .header:before { content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="2" fill="rgba(255,255,255,0.1)"/></svg>') repeat; animation: float 20s infinite linear; }
        @keyframes float { 0% { transform: translate(-50%, -50%) rotate(0deg); } 100% { transform: translate(-50%, -50%) rotate(360deg); } }
        .launch-badge { background-color: #ff6b6b; color: white; padding: 8px 20px; border-radius: 25px; font-size: 14px; font-weight: bold; margin-bottom: 15px; display: inline-block; }
        .product-image { width: 100%; max-width: 400px; height: 250px; object-fit: cover; border-radius: 8px; margin: 20px 0; }
        .content { padding: 30px; }
        .product-name { font-size: 28px; font-weight: bold; color: {{style.primaryColor}}; margin-bottom: 10px; text-align: center; }
        .product-description { font-size: 16px; line-height: 1.6; margin-bottom: 25px; text-align: center; }
        .features { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 25px 0; }
        .feature { background-color: #f8f9fa; padding: 15px; border-radius: 6px; text-align: center; }
        .feature-icon { font-size: 24px; margin-bottom: 8px; }
        .cta-section { text-align: center; margin: 30px 0; background: linear-gradient(135deg, #f8f9fa, #e9ecef); padding: 25px; border-radius: 8px; }
        .price { font-size: 24px; font-weight: bold; color: {{style.primaryColor}}; margin: 10px 0; }
        .old-price { text-decoration: line-through; color: #6c757d; font-size: 18px; }
        .big-button { background-color: {{style.primaryColor}}; color: white; padding: 18px 36px; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 18px; font-weight: bold; margin: 15px 0; box-shadow: 0 4px 15px rgba(0,0,0,0.2); }
        .footer { background-color: #2c3e50; color: white; padding: 25px; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="launch-badge">{{launch_type}}</div>
            <h1>{{launch_headline}}</h1>
            <p>{{launch_subtitle}}</p>
        </div>
        
        <div class="content">
            <img src="{{product_image_url}}" alt="{{product_name}}" class="product-image" />
            
            <h2 class="product-name">{{product_name}}</h2>
            <p class="product-description">{{product_description}}</p>
            
            <div class="features">
                <div class="feature">
                    <div class="feature-icon">{{feature_1_icon}}</div>
                    <strong>{{feature_1_title}}</strong>
                    <p>{{feature_1_description}}</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">{{feature_2_icon}}</div>
                    <strong>{{feature_2_title}}</strong>
                    <p>{{feature_2_description}}</p>
                </div>
            </div>
            
            <div class="cta-section">
                <h3>{{offer_headline}}</h3>
                <div class="price">
                    <span class="old-price">{{old_price}}</span>
                    {{new_price}}
                </div>
                <p>{{offer_description}}</p>
                <a href="{{product_url}}" class="big-button">{{cta_text}}</a>
                <p style="font-size: 12px; color: #6c757d;">{{offer_terms}}</p>
            </div>
        </div>
        
        <div class="footer">
            <p>Thank you for being a valued subscriber!</p>
            <p><a href="{{unsubscribe_url}}" style="color: #bdc3c7;">Unsubscribe</a> | <a href="{{preferences_url}}" style="color: #bdc3c7;">Update Preferences</a></p>
            <p>© {{current_year}} {{company_name}}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`,
    variables: [
      { name: 'company_name', label: 'Company Name', type: 'text', defaultValue: 'WrenCos', required: true },
      { name: 'launch_type', label: 'Launch Type', type: 'text', defaultValue: 'NEW PRODUCT', required: true },
      { name: 'launch_headline', label: 'Launch Headline', type: 'text', defaultValue: 'Introducing Our Latest Innovation', required: true },
      { name: 'launch_subtitle', label: 'Launch Subtitle', type: 'text', defaultValue: 'Experience the future of beauty and wellness', required: false },
      { name: 'product_name', label: 'Product Name', type: 'text', defaultValue: 'Amazing New Product', required: true },
      { name: 'product_description', label: 'Product Description', type: 'text', defaultValue: 'Discover the perfect blend of innovation and quality in our newest product.', required: true },
      { name: 'product_image_url', label: 'Product Image URL', type: 'url', defaultValue: 'https://via.placeholder.com/400x250', required: false },
      { name: 'feature_1_icon', label: 'Feature 1 Icon', type: 'text', defaultValue: '✨', required: false },
      { name: 'feature_1_title', label: 'Feature 1 Title', type: 'text', defaultValue: 'Premium Quality', required: false },
      { name: 'feature_1_description', label: 'Feature 1 Description', type: 'text', defaultValue: 'Made with the finest ingredients', required: false },
      { name: 'feature_2_icon', label: 'Feature 2 Icon', type: 'text', defaultValue: '🌿', required: false },
      { name: 'feature_2_title', label: 'Feature 2 Title', type: 'text', defaultValue: 'Natural & Safe', required: false },
      { name: 'feature_2_description', label: 'Feature 2 Description', type: 'text', defaultValue: '100% natural and dermatologist tested', required: false },
      { name: 'offer_headline', label: 'Offer Headline', type: 'text', defaultValue: 'Launch Special Offer!', required: true },
      { name: 'old_price', label: 'Original Price', type: 'text', defaultValue: '$99.99', required: false },
      { name: 'new_price', label: 'Special Price', type: 'text', defaultValue: '$79.99', required: true },
      { name: 'offer_description', label: 'Offer Description', type: 'text', defaultValue: 'Limited time launch price - save 20%', required: false },
      { name: 'cta_text', label: 'Button Text', type: 'text', defaultValue: 'Shop Now', required: true },
      { name: 'product_url', label: 'Product URL', type: 'url', defaultValue: 'https://example.com/product', required: true },
      { name: 'offer_terms', label: 'Offer Terms', type: 'text', defaultValue: 'Offer valid until stocks last. Free shipping on orders over $50.', required: false }
    ],
    styles: {
      primaryColor: '#6c5ce7',
      secondaryColor: '#a29bfe',
      backgroundColor: '#f8f9fa',
      textColor: '#333333',
      fontFamily: 'Arial, sans-serif'
    },
    isDefault: true
  }
];

async function seedTemplates() {
  try {
    console.log('🌱 Starting email template seeding...');
    
    // Find or create admin user
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('⚠️  No admin user found. Creating default admin...');
      adminUser = new User({
        username: 'admin',
        email: 'admin@example.com',
        password: 'hashedpassword', // This should be properly hashed
        role: 'admin'
      });
      await adminUser.save();
    }

    // Clear existing default templates
    await EmailTemplate.deleteMany({ isDefault: true });
    console.log('🗑️  Cleared existing default templates');

    // Insert new templates
    for (const templateData of defaultTemplates) {
      const template = new EmailTemplate({
        ...templateData,
        createdBy: adminUser._id
      });
      
      await template.save();
      console.log(`✅ Created template: ${template.name}`);
    }

    console.log('🎉 Email template seeding completed successfully!');
    console.log(`📊 Created ${defaultTemplates.length} default templates`);
    
  } catch (error) {
    console.error('❌ Error seeding email templates:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the seeding function
seedTemplates();

module.exports = { defaultTemplates };