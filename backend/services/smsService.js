const twilio = require('twilio');

/**
 * SMS Service using Twilio
 * 
 * Environment variables required:
 * - TWILIO_ACCOUNT_SID: Your Twilio Account SID
 * - TWILIO_AUTH_TOKEN: Your Twilio Auth Token
 * - TWILIO_PHONE_NUMBER: Your Twilio phone number
 */

class SMSService {
  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID;
    this.authToken = process.env.TWILIO_AUTH_TOKEN;
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER;
    
    // Initialize Twilio client if credentials are available
    if (this.accountSid && this.authToken) {
      this.client = twilio(this.accountSid, this.authToken);
      this.isConfigured = true;
    } else {
      console.warn('Twilio credentials not configured. SMS service will run in mock mode.');
      this.isConfigured = false;
    }
  }

  /**
   * Send SMS message
   * @param {Object} options - SMS options
   * @param {string} options.to - Recipient phone number (E.164 format: +1234567890)
   * @param {string} options.message - Message content
   * @param {Object} options.variables - Template variables for personalization
   * @returns {Promise<Object>} - Result object with success status and message details
   */
  async sendSMS({ to, message, variables = {} }) {
    try {
      // Validate phone number
      if (!to) {
        throw new Error('Recipient phone number is required');
      }

      // Ensure phone number is in E.164 format
      const phoneNumber = this.formatPhoneNumber(to);

      // Replace template variables in message
      let processedMessage = message;
      for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        processedMessage = processedMessage.replace(regex, value);
      }

      // Check if service is configured
      if (!this.isConfigured) {
        console.log('[SMS Mock Mode] Would send SMS:', {
          to: phoneNumber,
          message: processedMessage
        });
        
        return {
          success: true,
          mock: true,
          messageId: `mock_${Date.now()}`,
          to: phoneNumber,
          message: processedMessage,
          timestamp: new Date()
        };
      }

      // Send actual SMS via Twilio
      const result = await this.client.messages.create({
        body: processedMessage,
        from: this.fromNumber,
        to: phoneNumber
      });

      return {
        success: true,
        mock: false,
        messageId: result.sid,
        to: result.to,
        status: result.status,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('SMS send error:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  /**
   * Send bulk SMS messages
   * @param {Array} recipients - Array of {to, message, variables} objects
   * @returns {Promise<Object>} - Results with success/failure counts
   */
  async sendBulkSMS(recipients) {
    const results = {
      total: recipients.length,
      successful: 0,
      failed: 0,
      details: []
    };

    for (const recipient of recipients) {
      const result = await this.sendSMS(recipient);
      
      if (result.success) {
        results.successful++;
      } else {
        results.failed++;
      }
      
      results.details.push({
        to: recipient.to,
        ...result
      });
    }

    return results;
  }

  /**
   * Format phone number to E.164 format
   * @param {string} phoneNumber - Phone number in various formats
   * @returns {string} - E.164 formatted phone number
   */
  formatPhoneNumber(phoneNumber) {
    // Remove all non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // If number doesn't start with country code, assume US (+1)
    if (!phoneNumber.startsWith('+')) {
      if (cleaned.length === 10) {
        cleaned = '1' + cleaned;
      }
      return '+' + cleaned;
    }
    
    return phoneNumber;
  }

  /**
   * Validate phone number format
   * @param {string} phoneNumber - Phone number to validate
   * @returns {boolean} - True if valid
   */
  isValidPhoneNumber(phoneNumber) {
    // Basic E.164 validation (allows + followed by 1-15 digits)
    const e164Regex = /^\+[1-9]\d{1,14}$/;
    return e164Regex.test(phoneNumber);
  }

  /**
   * Get SMS delivery status
   * @param {string} messageId - Twilio message SID
   * @returns {Promise<Object>} - Message status
   */
  async getMessageStatus(messageId) {
    if (!this.isConfigured) {
      return {
        success: true,
        mock: true,
        status: 'delivered'
      };
    }

    try {
      const message = await this.client.messages(messageId).fetch();
      return {
        success: true,
        status: message.status,
        errorCode: message.errorCode,
        errorMessage: message.errorMessage,
        dateCreated: message.dateCreated,
        dateUpdated: message.dateUpdated
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Export singleton instance
module.exports = new SMSService();
