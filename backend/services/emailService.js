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
      
      this.transporter = nodemailer.createTransporter({
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
      const mailOptions = {
        from: `"${process.env.COMPANY_NAME || 'Your Company'}" <${process.env.GMAIL_USER}>`,
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
        const personalizedHtml = this.replaceVariables(htmlContent, recipient);
        const personalizedText = textContent ? this.replaceVariables(textContent, recipient) : null;
        
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

  replaceVariables(content, recipient) {
    let personalizedContent = content;
    
    // Replace common variables
    const variables = {
      '{{subscriber_name}}': recipient.name || recipient.email.split('@')[0],
      '{{subscriber_email}}': recipient.email,
      '{{company_name}}': process.env.COMPANY_NAME || 'Your Company',
      '{{current_date}}': new Date().toLocaleDateString(),
      '{{unsubscribe_url}}': recipient.unsubscribeToken 
        ? `${process.env.FRONTEND_URL || 'http://localhost:5173'}/unsubscribe/${recipient.unsubscribeToken}`
        : `${process.env.FRONTEND_URL || 'http://localhost:5173'}/unsubscribe?email=${encodeURIComponent(recipient.email)}`
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
}

module.exports = new EmailService();