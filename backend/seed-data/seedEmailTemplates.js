const mongoose = require('mongoose');

// Import models
const EmailTemplate = require('../models/marketing/emailTemplate');
const User = require('../models/auth/user');

// Connect to MongoDB using the same connection string as db.js
console.log('🔗 Connecting to MongoDB Atlas...');
mongoose.connect("mongodb+srv://mongo-api:7TZYsdhwiXhiKRp9@cluster0.18pi3.mongodb.net/Wrencos?retryWrites=true&w=majority", {
  serverSelectionTimeoutMS: 5000,
});

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
    textContent: `WrenCos Newsletter

Welcome to our newsletter!

Hi {{subscriber_name}},

Here is our latest news and updates...

Read More: https://example.com

Best regards,
The WrenCos Team

---
You're receiving this email because you subscribed to our newsletter.
Unsubscribe: {{unsubscribe_url}}

© {{current_date}} WrenCos. All rights reserved.`,
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
    <title>Limited Time Sale! - WrenCos</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #007bff, #6f42c1); color: white; padding: 30px; text-align: center; }
        .promotion-badge { background-color: #ff4757; color: white; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; margin-bottom: 10px; display: inline-block; }
        .content { padding: 30px; text-align: center; }
        .discount { font-size: 48px; font-weight: bold; color: #007bff; margin: 20px 0; }
        .big-button { background-color: #ff4757; color: white; padding: 18px 36px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; font-size: 18px; font-weight: bold; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6c757d; }
        .terms { font-size: 11px; color: #999; margin-top: 15px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="promotion-badge">SPECIAL OFFER</div>
            <h1>Limited Time Sale!</h1>
            <p>Save big on our best products</p>
        </div>
        
        <div class="content">
            <div class="discount">30% OFF</div>
            <h2>Amazing deals on all products</h2>
            <p>Hi {{subscriber_name}},</p>
            <p>Use code SAVE30 at checkout</p>
            
            <a href="https://example.com/shop" class="big-button">Shop Now</a>
            
            <div class="terms">
                <p>Valid for new customers only. Cannot be combined with other offers.</p>
                <p>Expires: December 31, 2025</p>
            </div>
        </div>
        
        <div class="footer">
            <p>Don't want to receive promotional emails? <a href="{{unsubscribe_url}}">Unsubscribe</a></p>
            <p>© {{current_date}} WrenCos. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`,
    textContent: `SPECIAL OFFER - Limited Time Sale!

Save big on our best products

30% OFF!

Amazing deals on all products

Hi {{subscriber_name}},

Use code SAVE30 at checkout

Shop Now: https://example.com/shop

Valid for new customers only. Cannot be combined with other offers.
Expires: December 31, 2025

---
Don't want promotional emails? Unsubscribe: {{unsubscribe_url}}
© {{current_date}} WrenCos. All rights reserved.`,
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
    <title>Welcome to WrenCos!</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background-color: #007bff; color: white; padding: 40px 30px; text-align: center; }
        .welcome-icon { font-size: 48px; margin-bottom: 10px; }
        .content { padding: 40px 30px; }
        .welcome-message { font-size: 18px; line-height: 1.6; margin-bottom: 25px; }
        .benefits { background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 25px 0; }
        .benefit-item { margin-bottom: 15px; padding-left: 30px; position: relative; display: flex; align-items: start; }
        .benefit-icon { font-size: 24px; margin-right: 15px; flex-shrink: 0; }
        .benefit-content { flex: 1; }
        .benefit-title { font-weight: bold; margin-bottom: 5px; color: #333; }
        .benefit-description { color: #666; font-size: 14px; line-height: 1.5; }
        .cta-section { text-align: center; margin: 30px 0; }
        .button { background-color: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; }
        .footer { background-color: #f8f9fa; padding: 25px; text-align: center; font-size: 14px; color: #6c757d; }
        .social-links { margin: 15px 0; }
        .social-links a { margin: 0 10px; text-decoration: none; color: #007bff; font-size: 24px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="welcome-icon">🎉</div>
            <h1>Welcome to WrenCos!</h1>
            <p>We're absolutely thrilled to have you join our community</p>
        </div>
        
        <div class="content">
            <div class="welcome-message">
                <p>Hi {{subscriber_name}},</p>
                <p>Thank you for subscribing to our newsletter! We're excited to share our latest updates, exclusive offers, and valuable insights with you.</p>
            </div>
            
            <div class="benefits">
                <h3>Here's what you can expect:</h3>
                <div class="benefit-item">
                    <div class="benefit-icon">🎁</div>
                    <div class="benefit-content">
                        <div class="benefit-title">Exclusive access to new products and services</div>
                        <div class="benefit-description">Exclusive access to our latest products and special member-only deals</div>
                    </div>
                </div>
                <div class="benefit-item">
                    <div class="benefit-icon">💫</div>
                    <div class="benefit-content">
                        <div class="benefit-title">Special discounts and promotional offers</div>
                        <div class="benefit-description">Be the first to know about our amazing promotions and limited-time offers</div>
                    </div>
                </div>
                <div class="benefit-item">
                    <div class="benefit-icon">📚</div>
                    <div class="benefit-content">
                        <div class="benefit-title">Weekly tips and industry insights</div>
                        <div class="benefit-description">Weekly insights, tips, and expert advice delivered straight to your inbox</div>
                    </div>
                </div>
            </div>
            
            <div class="cta-section">
                <p>Ready to get started?</p>
                <p>Explore our amazing collection and discover what makes us special</p>
                <a href="https://example.com/products" class="button">Explore Our Products</a>
            </div>
            
            <p>If you have any questions, feel free to reply to this email or contact our friendly support team. We're here to help!</p>
            
            <p>Welcome aboard! 🚀<br><br>
            The WrenCos Team</p>
        </div>
        
        <div class="footer">
            <div class="social-links">
                <span style="font-weight: bold;">Connect with us</span><br>
                <a href="#" title="Facebook">📘</a>
                <a href="#" title="Twitter">🐦</a>
                <a href="#" title="Instagram">📷</a>
            </div>
            <p>You're receiving this email because you subscribed to WrenCos.</p>
            <p><a href="{{unsubscribe_url}}">Unsubscribe</a> | <a href="#">Update Preferences</a></p>
            <p>© {{current_date}} WrenCos. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`,
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
    <title>Amazing New Product Launch - WrenCos</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #6c5ce7, #a29bfe); color: white; padding: 30px; text-align: center; position: relative; overflow: hidden; }
        .header:before { content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="2" fill="rgba(255,255,255,0.1)"/></svg>') repeat; animation: float 20s infinite linear; }
        @keyframes float { 0% { transform: translate(-50%, -50%) rotate(0deg); } 100% { transform: translate(-50%, -50%) rotate(360deg); } }
        .launch-badge { background-color: #ff6b6b; color: white; padding: 8px 20px; border-radius: 25px; font-size: 14px; font-weight: bold; margin-bottom: 15px; display: inline-block; position: relative; z-index: 1; }
        .product-image { width: 100%; max-width: 400px; height: 250px; object-fit: cover; border-radius: 8px; margin: 20px 0; }
        .content { padding: 30px; }
        .product-name { font-size: 28px; font-weight: bold; color: #6c5ce7; margin-bottom: 10px; text-align: center; }
        .product-description { font-size: 16px; line-height: 1.6; margin-bottom: 25px; text-align: center; }
        .features { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 25px 0; }
        .feature { background-color: #f8f9fa; padding: 15px; border-radius: 6px; text-align: center; }
        .feature-icon { font-size: 24px; margin-bottom: 8px; }
        .cta-section { text-align: center; margin: 30px 0; background: linear-gradient(135deg, #f8f9fa, #e9ecef); padding: 25px; border-radius: 8px; }
        .price { font-size: 24px; font-weight: bold; color: #6c5ce7; margin: 10px 0; }
        .old-price { text-decoration: line-through; color: #6c757d; font-size: 18px; }
        .big-button { background-color: #6c5ce7; color: white; padding: 18px 36px; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 18px; font-weight: bold; margin: 15px 0; box-shadow: 0 4px 15px rgba(0,0,0,0.2); }
        .footer { background-color: #2c3e50; color: white; padding: 25px; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="launch-badge">NEW PRODUCT</div>
            <h1 style="position: relative; z-index: 1;">Introducing Our Latest Innovation</h1>
            <p style="position: relative; z-index: 1;">Experience the future of beauty and wellness</p>
        </div>
        
        <div class="content">
            <img src="https://via.placeholder.com/400x250" alt="Amazing New Product" class="product-image" />
            
            <h2 class="product-name">Amazing New Product</h2>
            <p>Hi {{subscriber_name}},</p>
            <p class="product-description">Discover the perfect blend of innovation and quality in our newest product.</p>
            
            <div class="features">
                <div class="feature">
                    <div class="feature-icon">✨</div>
                    <strong>Premium Quality</strong>
                    <p>Made with the finest ingredients</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">🌿</div>
                    <strong>Natural & Safe</strong>
                    <p>100% natural and dermatologist tested</p>
                </div>
            </div>
            
            <div class="cta-section">
                <h3>Launch Special Offer!</h3>
                <div class="price">
                    <span class="old-price">$99.99</span>
                    $79.99
                </div>
                <p>Limited time launch price - save 20%</p>
                <a href="https://example.com/product" class="big-button">Shop Now</a>
                <p style="font-size: 12px; color: #6c757d;">Offer valid until stocks last. Free shipping on orders over $50.</p>
            </div>
        </div>
        
        <div class="footer">
            <p>Thank you for being a valued subscriber!</p>
            <p><a href="{{unsubscribe_url}}" style="color: #bdc3c7;">Unsubscribe</a> | <a href="#" style="color: #bdc3c7;">Update Preferences</a></p>
            <p>© {{current_date}} WrenCos. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`,
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