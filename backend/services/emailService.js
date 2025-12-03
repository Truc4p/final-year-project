const nodemailer = require('nodemailer');
const secretManager = require('./secretManager');

class EmailService {
  constructor() {
    this.transporter = null;
    this.isInitialized = false;
  }
  
  async initialize() {
    if (this.isInitialized) return;
    
    try {
      const gmailUser = await secretManager.getSecret('GMAIL_USER');
      const gmailPassword = await secretManager.getSecret('GMAIL_APP_PASSWORD');
      
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailPassword
        }
      });
      
      this.isInitialized = true;
      console.log('📧 EmailService initialized with secure credentials');
    } catch (error) {
      console.error('❌ Failed to initialize EmailService:', error.message);
      throw error;
    }
  }
  
  async ensureInitialized() {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  initializeTransporter() {
    // Legacy method - now calls initialize for backward compatibility
    this.initialize().catch(console.error);
  }

  async verifyConnection() {
    await this.ensureInitialized();
    
    try {
      await this.transporter.verify();
      console.log('Email service is ready to send messages');
      return true;
    } catch (error) {
      console.error('Email service connection failed:', error);
      return false;
    }
  }

  async sendEmail(to, subject, htmlContent, textContent = null) {
    try {
      const gmailUser = await secretManager.getSecret('GMAIL_USER');
      let companyName = 'Your Company';
      try {
        companyName = await secretManager.getSecret('COMPANY_NAME');
      } catch (error) {
        console.warn('⚠️ Using default company name');
      }

      const mailOptions = {
        from: `"${companyName}" <${gmailUser}>`,
        to: to,
        subject: subject,
        html: htmlContent,
        text: textContent || this.htmlToText(htmlContent)
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return {
        success: true,
        messageId: result.messageId,
        to: to
      };
    } catch (error) {
      console.error('Failed to send email:', error);
      return {
        success: false,
        error: error.message,
        to: to
      };
    }
  }

  async sendBulkEmails(recipients, subject, htmlContent, textContent = null) {
    const results = [];
    const batchSize = 10; // Send in batches to avoid rate limiting
    
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      const batchPromises = batch.map(async (recipient) => {
        // Replace variables in content for each recipient
        const personalizedHtml = await this.replaceVariables(htmlContent, recipient);
        const personalizedText = textContent ? await this.replaceVariables(textContent, recipient) : null;
        
        const result = await this.sendEmail(
          recipient.email, 
          subject, 
          personalizedHtml, 
          personalizedText
        );
        
        return {
          ...result,
          recipient: recipient
        };
      });
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Small delay between batches to respect rate limits
      if (i + batchSize < recipients.length) {
        await this.delay(1000); // 1 second delay
      }
    }
    
    return results;
  }

  async replaceVariables(content, recipient) {
    let personalizedContent = content;
    
    // Get secrets with fallbacks
    let companyName = 'Your Company';
    let frontendUrl = 'http://localhost:5173';
    
    try {
      companyName = await secretManager.getSecret('COMPANY_NAME');
    } catch (error) {
      console.warn('⚠️ Using default company name');
    }
    
    try {
      frontendUrl = await secretManager.getSecret('FRONTEND_URL');
    } catch (error) {
      console.warn('⚠️ Using default frontend URL');
    }
    
    // Replace common variables
    const variables = {
      '{{subscriber_name}}': recipient.name || recipient.email.split('@')[0],
      '{{subscriber_email}}': recipient.email,
      '{{company_name}}': companyName,
      '{{current_date}}': new Date().toLocaleDateString(),
      '{{unsubscribe_url}}': recipient.unsubscribeToken 
        ? `${frontendUrl}/unsubscribe/${recipient.unsubscribeToken}`
        : `${frontendUrl}/unsubscribe?email=${encodeURIComponent(recipient.email)}`
    };
    
    Object.entries(variables).forEach(([variable, value]) => {
      personalizedContent = personalizedContent.replace(new RegExp(variable, 'g'), value);
    });
    
    return personalizedContent;
  }

  htmlToText(html) {
    // Simple HTML to text conversion
    return html
      .replace(/<style[^>]*>.*?<\/style>/gi, '')
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async sendCampaignEmails(campaign, recipients) {
    try {
      console.log(`Starting to send campaign "${campaign.name}" to ${recipients.length} recipients`);
      
      const results = await this.sendBulkEmails(
        recipients,
        campaign.subject,
        campaign.htmlContent,
        campaign.content
      );
      
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;
      
      console.log(`Campaign "${campaign.name}" sent: ${successCount} successful, ${failureCount} failed`);
      
      return {
        success: true,
        totalSent: successCount,
        totalFailed: failureCount,
        results: results
      };
      
    } catch (error) {
      console.error('Failed to send campaign emails:', error);
      return {
        success: false,
        error: error.message,
        totalSent: 0,
        totalFailed: recipients.length
      };
    }
  }

  async sendOrderConfirmation(orderDetails) {
    try {
      await this.ensureInitialized();
      
      const { userEmail, userName, orderId, orderDate, products, subtotal, tax, shippingFee, totalPrice, paymentMethod } = orderDetails;
      
      // Generate products HTML
      const productsHtml = products.map(product => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${product.name}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${product.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${product.price.toFixed(2)}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${(product.price * product.quantity).toFixed(2)}</td>
        </tr>
      `).join('');

      let companyName = 'Your Company';
      let frontendUrl = 'http://localhost:5173';
      
      try {
        companyName = await secretManager.getSecret('COMPANY_NAME');
      } catch (error) {
        console.warn('⚠️ Using default company name');
      }
      
      try {
        frontendUrl = await secretManager.getSecret('FRONTEND_URL');
      } catch (error) {
        console.warn('⚠️ Using default frontend URL');
      }

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Confirmation</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">✅ Order Confirmed!</h1>
          </div>
          
          <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hi ${userName || 'Valued Customer'},</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              Thank you for your order! We're excited to let you know that your order has been successfully placed and is being processed.
            </p>
            
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #667eea; margin-top: 0; font-size: 20px;">Order Details</h2>
              <p style="margin: 5px 0;"><strong>Order ID:</strong> ${orderId}</p>
              <p style="margin: 5px 0;"><strong>Order Date:</strong> ${new Date(orderDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${paymentMethod === 'cashOnDelivery' ? 'Cash on Delivery' : 'Online Payment'}</p>
            </div>
            
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #667eea; margin-top: 0; font-size: 20px;">Order Items</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background-color: #f3f4f6;">
                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Product</th>
                    <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e5e7eb;">Qty</th>
                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Price</th>
                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${productsHtml}
                </tbody>
              </table>
            </div>
            
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #667eea; margin-top: 0; font-size: 20px;">Order Summary</h2>
              <table style="width: 100%;">
                <tr>
                  <td style="padding: 8px 0;">Subtotal:</td>
                  <td style="padding: 8px 0; text-align: right;">$${subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">Tax:</td>
                  <td style="padding: 8px 0; text-align: right;">$${tax.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">Shipping Fee:</td>
                  <td style="padding: 8px 0; text-align: right;">${shippingFee === 0 ? 'FREE' : '$' + shippingFee.toFixed(2)}</td>
                </tr>
                <tr style="border-top: 2px solid #e5e7eb; font-weight: bold; font-size: 18px;">
                  <td style="padding: 12px 0;">Total:</td>
                  <td style="padding: 12px 0; text-align: right; color: #667eea;">$${totalPrice.toFixed(2)}</td>
                </tr>
              </table>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${frontendUrl}/customer/orders/order/${orderId}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px;">View Order Details</a>
            </div>
            
            <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
              If you have any questions about your order, please don't hesitate to contact us.
            </p>
            
            <p style="font-size: 14px; color: #6b7280;">
              Thank you for shopping with ${companyName}!
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; padding: 20px; color: #9ca3af; font-size: 12px;">
            <p>© ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
          </div>
        </body>
        </html>
      `;

      const textContent = `
        Order Confirmation
        
        Hi ${userName || 'Valued Customer'},
        
        Thank you for your order! Your order has been successfully placed and is being processed.
        
        Order Details:
        Order ID: ${orderId}
        Order Date: ${new Date(orderDate).toLocaleDateString()}
        Payment Method: ${paymentMethod === 'cashOnDelivery' ? 'Cash on Delivery' : 'Online Payment'}
        
        Order Items:
        ${products.map(p => `${p.name} x ${p.quantity} - $${(p.price * p.quantity).toFixed(2)}`).join('\n')}
        
        Order Summary:
        Subtotal: $${subtotal.toFixed(2)}
        Tax: $${tax.toFixed(2)}
        Shipping Fee: ${shippingFee === 0 ? 'FREE' : '$' + shippingFee.toFixed(2)}
        Total: $${totalPrice.toFixed(2)}
        
        View your order: ${frontendUrl}/customer/orders/order/${orderId}
        
        Thank you for shopping with ${companyName}!
      `;

      const result = await this.sendEmail(
        userEmail,
        `Order Confirmation - Order #${orderId}`,
        htmlContent,
        textContent
      );

      if (result.success) {
        console.log(`✅ Order confirmation email sent to ${userEmail} for order ${orderId}`);
      } else {
        console.error(`❌ Failed to send order confirmation email to ${userEmail}:`, result.error);
      }

      return result;
    } catch (error) {
      console.error('Error sending order confirmation email:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new EmailService();