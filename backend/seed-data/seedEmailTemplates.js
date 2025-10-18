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
        body { font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 0; background: linear-gradient(135deg, #FDFBF7 0%, #F8EAE1 100%); }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #FDF6F0 0%, #F0D7CC 50%, #FDF6F0 100%); color: #8C3154; padding: 40px 30px; text-align: center; border-bottom: 3px solid #E4BCC0; }
        .header h1 { margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px; }
        .header p { margin: 10px 0 0; font-size: 16px; opacity: 0.9; color: #A44A6B; }
        .content { padding: 40px 30px; }
        .content h2 { color: #8C3154; font-size: 24px; margin: 0 0 20px; }
        .content p { color: #475569; line-height: 1.7; margin: 0 0 15px; }
        .footer { background: linear-gradient(to right, #FDF6F0, #F8EAE1); padding: 30px; text-align: center; font-size: 13px; color: #8C3154; border-top: 1px solid #F0D7CC; }
        .button { background: linear-gradient(135deg, #C97F98 0%, #A44A6B 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; font-weight: 600; box-shadow: 0 4px 15px rgba(164, 74, 107, 0.3); transition: all 0.3s ease; }
        .button:hover { box-shadow: 0 6px 20px rgba(164, 74, 107, 0.4); transform: translateY(-2px); }
        .unsubscribe { margin-top: 20px; padding-top: 20px; border-top: 1px solid #E4BCC0; }
        .unsubscribe a { color: #A44A6B; text-decoration: none; font-weight: 500; }
        .divider { height: 2px; background: linear-gradient(to right, transparent, #E4BCC0, transparent); margin: 30px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✨ WrenCos</h1>
            <p>Monthly Newsletter</p>
        </div>
        
        <div class="content">
            <h2>Welcome to our newsletter!</h2>
            <p>Hi {{subscriber_name}},</p>
            <p>Here is our latest news and updates from the WrenCos community. We're excited to share what's new and inspiring this month!</p>
            
            <div class="divider"></div>
            
            <a href="https://example.com" class="button">Read More</a>
            
            <p style="margin-top: 30px;">Best regards,<br><strong style="color: #8C3154;">The WrenCos Team</strong></p>
        </div>
        
        <div class="footer">
            <p style="margin: 0 0 10px;">You're receiving this email because you subscribed to our newsletter.</p>
            <div class="unsubscribe">
                <a href="{{unsubscribe_url}}">Unsubscribe</a>
            </div>
            <p style="margin: 20px 0 0;">© {{current_date}} WrenCos. All rights reserved.</p>
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
        body { font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 0; background: linear-gradient(135deg, #FDFBF7 0%, #F8EAE1 100%); }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 25px rgba(0, 0, 0, 0.12); }
        .header { background: linear-gradient(135deg, #FDF6F0 0%, #F0D7CC 50%, #FDF6F0 100%); color: #8C3154; padding: 50px 30px; text-align: center; position: relative; border-bottom: 3px solid #E4BCC0; }
        .promotion-badge { background: linear-gradient(135deg, #C97F98, #A44A6B); color: white; padding: 8px 20px; border-radius: 20px; font-size: 13px; font-weight: 700; letter-spacing: 1px; margin-bottom: 15px; display: inline-block; box-shadow: 0 4px 15px rgba(164, 74, 107, 0.4); }
        .header h1 { margin: 10px 0; font-size: 36px; font-weight: 800; letter-spacing: -0.5px; }
        .header p { margin: 10px 0 0; font-size: 18px; opacity: 0.9; color: #A44A6B; }
        .content { padding: 50px 30px; text-align: center; background: linear-gradient(to bottom, #ffffff, #FDF6F0); }
        .discount { font-size: 56px; font-weight: 900; background: linear-gradient(135deg, #C97F98 0%, #A44A6B 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin: 25px 0; text-shadow: 0 4px 20px rgba(164, 74, 107, 0.2); }
        .content h2 { color: #8C3154; font-size: 26px; margin: 0 0 15px; font-weight: 700; }
        .content p { color: #475569; line-height: 1.7; margin: 0 0 15px; font-size: 16px; }
        .big-button { background: linear-gradient(135deg, #C97F98 0%, #A44A6B 100%); color: white; padding: 18px 48px; text-decoration: none; border-radius: 12px; display: inline-block; margin: 30px 0; font-size: 20px; font-weight: 700; box-shadow: 0 6px 25px rgba(164, 74, 107, 0.35); transition: all 0.3s ease; }
        .big-button:hover { box-shadow: 0 8px 30px rgba(164, 74, 107, 0.45); transform: translateY(-3px); }
        .promo-code { background: linear-gradient(to right, #F8EAE1, #F0D7CC); border: 2px dashed #C97F98; padding: 15px 25px; border-radius: 10px; display: inline-block; margin: 20px 0; }
        .promo-code-text { color: #8C3154; font-size: 24px; font-weight: 800; letter-spacing: 2px; }
        .footer { background: linear-gradient(to right, #FDF6F0, #F8EAE1); padding: 30px; text-align: center; font-size: 13px; color: #8C3154; border-top: 1px solid #F0D7CC; }
        .footer a { color: #A44A6B; text-decoration: none; font-weight: 600; }
        .terms { font-size: 12px; color: #94a3b8; margin-top: 20px; line-height: 1.6; padding: 15px; background: #F8EAE1; border-radius: 8px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="promotion-badge">✨ SPECIAL OFFER</div>
            <h1>Limited Time Sale!</h1>
            <p>Save big on our best products</p>
        </div>
        
        <div class="content">
            <div class="discount">30% OFF</div>
            <h2>Amazing deals on all products</h2>
            <p>Hi {{subscriber_name}},</p>
            <p>Don't miss out on this exclusive opportunity to save on your favorite WrenCos products!</p>
            
            <div class="promo-code">
                <div style="color: #A44A6B; font-size: 13px; font-weight: 600; margin-bottom: 5px;">USE CODE</div>
                <div class="promo-code-text">SAVE30</div>
            </div>
            
            <a href="https://example.com/shop" class="big-button">Shop Now</a>
            
            <div class="terms">
                <p style="margin: 0 0 8px;"><strong>Terms & Conditions:</strong></p>
                <p style="margin: 0 0 5px;">• Valid for new customers only</p>
                <p style="margin: 0 0 5px;">• Cannot be combined with other offers</p>
                <p style="margin: 0;">• Expires: December 31, 2025</p>
            </div>
        </div>
        
        <div class="footer">
            <p style="margin: 0 0 10px;">Don't want to receive promotional emails? <a href="{{unsubscribe_url}}">Unsubscribe</a></p>
            <p style="margin: 0;">© {{current_date}} WrenCos. All rights reserved.</p>
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
        body { font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 0; background: linear-gradient(135deg, #FDFBF7 0%, #F8EAE1 100%); }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 25px rgba(0, 0, 0, 0.12); }
        .header { background: linear-gradient(135deg, #FDF6F0 0%, #F0D7CC 50%, #FDF6F0 100%); color: #8C3154; padding: 50px 30px; text-align: center; border-bottom: 3px solid #E4BCC0; }
        .welcome-icon { font-size: 64px; margin-bottom: 15px; animation: bounce 2s infinite; }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .header h1 { margin: 10px 0; font-size: 36px; font-weight: 800; letter-spacing: -0.5px; }
        .header p { margin: 10px 0 0; font-size: 17px; opacity: 0.9; color: #A44A6B; }
        .content { padding: 45px 35px; }
        .welcome-message { font-size: 16px; line-height: 1.8; margin-bottom: 30px; color: #475569; }
        .welcome-message p:first-child { color: #8C3154; font-weight: 600; font-size: 18px; }
        .benefits { background: linear-gradient(to bottom, #FDF6F0, #F8EAE1); padding: 30px; border-radius: 12px; margin: 30px 0; border: 1px solid #F0D7CC; }
        .benefits h3 { color: #8C3154; font-size: 22px; margin: 0 0 25px; font-weight: 700; }
        .benefit-item { margin-bottom: 20px; display: flex; align-items: start; }
        .benefit-icon { font-size: 28px; margin-right: 15px; flex-shrink: 0; }
        .benefit-content { flex: 1; }
        .benefit-title { font-weight: 700; margin-bottom: 6px; color: #8C3154; font-size: 16px; }
        .benefit-description { color: #64748b; font-size: 14px; line-height: 1.6; }
        .cta-section { text-align: center; margin: 35px 0; padding: 30px; background: linear-gradient(to right, #FDFBF7, #FDF6F0); border-radius: 12px; }
        .cta-section p { color: #475569; margin: 0 0 12px; }
        .button { background: linear-gradient(135deg, #C97F98 0%, #A44A6B 100%); color: white; padding: 16px 36px; text-decoration: none; border-radius: 10px; display: inline-block; font-weight: 700; font-size: 17px; box-shadow: 0 6px 20px rgba(164, 74, 107, 0.3); transition: all 0.3s ease; }
        .button:hover { box-shadow: 0 8px 25px rgba(164, 74, 107, 0.4); transform: translateY(-2px); }
        .footer { background: linear-gradient(to right, #FDF6F0, #F8EAE1); padding: 35px; text-align: center; font-size: 14px; color: #8C3154; border-top: 1px solid #F0D7CC; }
        .social-links { margin: 20px 0; }
        .social-links span { font-weight: 700; color: #A44A6B; display: block; margin-bottom: 12px; }
        .social-links a { margin: 0 12px; text-decoration: none; font-size: 28px; transition: transform 0.3s ease; display: inline-block; }
        .social-links a:hover { transform: scale(1.2); }
        .footer a { color: #A44A6B; text-decoration: none; font-weight: 600; }
        .footer a:hover { color: #8C3154; }
        .divider { height: 2px; background: linear-gradient(to right, transparent, #E4BCC0, transparent); margin: 25px 0; }
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
                <h3>✨ Here's what you can expect:</h3>
                <div class="benefit-item">
                    <div class="benefit-icon">🎁</div>
                    <div class="benefit-content">
                        <div class="benefit-title">Exclusive Access to New Products</div>
                        <div class="benefit-description">Be the first to discover our latest innovations and special member-only deals before anyone else</div>
                    </div>
                </div>
                <div class="benefit-item">
                    <div class="benefit-icon">💫</div>
                    <div class="benefit-content">
                        <div class="benefit-title">Special Discounts & Offers</div>
                        <div class="benefit-description">Enjoy exclusive promotions and limited-time offers designed just for our valued subscribers</div>
                    </div>
                </div>
                <div class="benefit-item">
                    <div class="benefit-icon">📚</div>
                    <div class="benefit-content">
                        <div class="benefit-title">Weekly Tips & Insights</div>
                        <div class="benefit-description">Get expert advice, beauty tips, and industry insights delivered straight to your inbox every week</div>
                    </div>
                </div>
            </div>
            
            <div class="divider"></div>
            
            <div class="cta-section">
                <p style="font-size: 18px; font-weight: 600; color: #8C3154;">Ready to get started?</p>
                <p>Explore our amazing collection and discover what makes us special</p>
                <a href="https://example.com/products" class="button">Explore Our Products</a>
            </div>
            
            <p style="color: #475569; line-height: 1.7;">If you have any questions, feel free to reply to this email or contact our friendly support team. We're here to help!</p>
            
            <p style="margin-top: 30px; color: #475569;">Welcome aboard! 🚀<br><br>
            <strong style="color: #8C3154;">The WrenCos Team</strong></p>
        </div>
        
        <div class="footer">
            <div class="social-links">
                <span>Connect with us</span>
                <a href="#" title="Facebook">📘</a>
                <a href="#" title="Twitter">🐦</a>
                <a href="#" title="Instagram">📷</a>
            </div>
            <p style="margin: 15px 0;">You're receiving this email because you subscribed to WrenCos.</p>
            <p><a href="{{unsubscribe_url}}">Unsubscribe</a> | <a href="#">Update Preferences</a></p>
            <p style="margin: 15px 0 0;">© {{current_date}} WrenCos. All rights reserved.</p>
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
        body { font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 0; background: linear-gradient(135deg, #FDFBF7 0%, #F8EAE1 100%); }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 25px rgba(0, 0, 0, 0.12); }
        .header { background: linear-gradient(135deg, #FDF6F0 0%, #F0D7CC 50%, #FDF6F0 100%); color: #8C3154; padding: 50px 30px; text-align: center; position: relative; overflow: hidden; border-bottom: 3px solid #E4BCC0; }
        .header::before { content: '✨'; position: absolute; font-size: 100px; opacity: 0.15; top: -20px; right: -20px; animation: float 6s infinite ease-in-out; }
        .header::after { content: '💫'; position: absolute; font-size: 80px; opacity: 0.15; bottom: -10px; left: -15px; animation: float 8s infinite ease-in-out; }
        @keyframes float { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-20px) rotate(180deg); } }
        .launch-badge { background: linear-gradient(135deg, #C97F98, #A44A6B); color: white; padding: 10px 24px; border-radius: 25px; font-size: 14px; font-weight: 700; letter-spacing: 1.5px; margin-bottom: 20px; display: inline-block; position: relative; z-index: 1; box-shadow: 0 4px 15px rgba(164, 74, 107, 0.5); animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        .header h1 { margin: 10px 0; font-size: 38px; font-weight: 900; letter-spacing: -0.5px; position: relative; z-index: 1; }
        .header p { margin: 10px 0 0; font-size: 18px; opacity: 0.9; position: relative; z-index: 1; color: #A44A6B; }
        .product-image { width: 100%; max-width: 500px; height: 300px; object-fit: cover; border-radius: 12px; margin: 30px auto; display: block; box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15); }
        .content { padding: 40px 35px; }
        .product-name { font-size: 32px; font-weight: 800; background: linear-gradient(135deg, #C97F98 0%, #A44A6B 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 15px; text-align: center; }
        .product-description { font-size: 16px; line-height: 1.8; margin-bottom: 30px; text-align: center; color: #475569; }
        .product-description p:first-child { color: #8C3154; font-weight: 600; font-size: 17px; }
        .features { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 35px 0; }
        .feature { background: linear-gradient(to bottom, #FDF6F0, #F8EAE1); padding: 25px 20px; border-radius: 12px; text-align: center; border: 1px solid #F0D7CC; transition: transform 0.3s ease; }
        .feature:hover { transform: translateY(-5px); box-shadow: 0 8px 20px rgba(164, 74, 107, 0.15); }
        .feature-icon { font-size: 32px; margin-bottom: 12px; }
        .feature strong { color: #8C3154; font-size: 16px; display: block; margin-bottom: 8px; }
        .feature p { color: #64748b; font-size: 14px; margin: 0; line-height: 1.5; }
        .cta-section { text-align: center; margin: 40px 0; background: linear-gradient(135deg, #FDF6F0 0%, #F8EAE1 100%); padding: 40px 25px; border-radius: 16px; border: 2px solid #F0D7CC; }
        .cta-section h3 { color: #8C3154; font-size: 26px; margin: 0 0 15px; font-weight: 800; }
        .price { font-size: 28px; font-weight: 900; background: linear-gradient(135deg, #C97F98 0%, #A44A6B 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin: 15px 0; }
        .old-price { text-decoration: line-through; color: #94a3b8; font-size: 20px; margin-right: 10px; }
        .cta-section p { color: #475569; margin: 10px 0; }
        .big-button { background: linear-gradient(135deg, #C97F98 0%, #A44A6B 100%); color: white !important; padding: 18px 48px; text-decoration: none; border-radius: 12px; display: inline-block; font-size: 20px; font-weight: 800; margin: 25px 0 15px; box-shadow: 0 6px 25px rgba(164, 74, 107, 0.4); transition: all 0.3s ease; }
        .big-button:hover { box-shadow: 0 8px 30px rgba(164, 74, 107, 0.5); transform: translateY(-3px); }
        .footer { background: linear-gradient(to right, #FDF6F0, #F8EAE1); color: #8C3154; padding: 35px; text-align: center; border-top: 1px solid #F0D7CC; }
        .footer p { margin: 8px 0; opacity: 0.95; }
        .footer a { color: #A44A6B; text-decoration: none; font-weight: 600; }
        .footer a:hover { color: #8C3154; }
        .divider { height: 2px; background: linear-gradient(to right, transparent, #E4BCC0, transparent); margin: 30px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="launch-badge">🚀 NEW PRODUCT</div>
            <h1>Introducing Our Latest Innovation</h1>
            <p>Experience the future of beauty and wellness</p>
        </div>
        
        <div class="content">
            <img src="https://www.rarebeauty.com/cdn/shop/files/ECOMM-SP-LIQUID-BLUSH-DEWY-GRATEFUL.jpg?v=1727897143" alt="Amazing New Product" class="product-image" />
            
            <h2 class="product-name">✨ Amazing New Product</h2>
            <div class="product-description">
                <p>Hi {{subscriber_name}},</p>
                <p>Discover the perfect blend of innovation and quality in our newest product. Crafted with care and designed to elevate your daily routine.</p>
            </div>
            
            <div class="divider"></div>
            
            <div class="features">
                <div class="feature">
                    <div class="feature-icon">✨</div>
                    <strong>Premium Quality</strong>
                    <p>Made with the finest ingredients for exceptional results</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">🌿</div>
                    <strong>Natural & Safe</strong>
                    <p>100% natural and dermatologist tested for your peace of mind</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">🔬</div>
                    <strong>Science-Backed</strong>
                    <p>Backed by research and proven results</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">💖</div>
                    <strong>Customer Loved</strong>
                    <p>Join thousands of satisfied customers</p>
                </div>
            </div>
            
            <div class="cta-section">
                <h3>🎊 Launch Special Offer!</h3>
                <div class="price">
                    <span class="old-price">$99.99</span>
                    $79.99
                </div>
                <p style="font-weight: 600; color: #8C3154; font-size: 18px;">Save 20% - Limited Time Only!</p>
                <a href="https://example.com/product" class="big-button" style="color: white !important; background: linear-gradient(135deg, #C97F98 0%, #A44A6B 100%) !important; text-decoration: none; border-radius: 12px; display: inline-block; font-size: 20px; font-weight: 800; margin: 25px 0 15px; box-shadow: 0 6px 25px rgba(164, 74, 107, 0.4); padding: 18px 48px;">Shop Now</a>
                <p style="font-size: 13px; color: #64748b; margin-top: 15px;">✓ Free shipping on orders over $50<br>✓ 30-day money-back guarantee</p>
            </div>
        </div>
        
        <div class="footer">
            <p style="font-size: 16px; font-weight: 600;">Thank you for being a valued subscriber! 💕</p>
            <p style="margin-top: 20px;"><a href="{{unsubscribe_url}}">Unsubscribe</a> | <a href="#">Update Preferences</a></p>
            <p style="margin-top: 15px;">© {{current_date}} WrenCos. All rights reserved.</p>
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