const admin = require('firebase-admin');

/**
 * Push Notification Service using Firebase Cloud Messaging (FCM)
 * 
 * Environment variables required:
 * - FIREBASE_PROJECT_ID: Your Firebase project ID
 * - FIREBASE_PRIVATE_KEY: Your Firebase private key (base64 encoded)
 * - FIREBASE_CLIENT_EMAIL: Your Firebase client email
 * 
 * Or provide FIREBASE_SERVICE_ACCOUNT_PATH to a JSON credential file
 */

class PushNotificationService {
  constructor() {
    this.isConfigured = false;
    this.initialize();
  }

  initialize() {
    try {
      // Check if Firebase is already initialized
      if (admin.apps.length > 0) {
        this.isConfigured = true;
        return;
      }

      // Option 1: Use service account file path
      if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
        const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
        this.isConfigured = true;
        console.log('Firebase Admin initialized with service account file');
        return;
      }

      // Option 2: Use environment variables
      if (process.env.FIREBASE_PROJECT_ID && 
          process.env.FIREBASE_PRIVATE_KEY && 
          process.env.FIREBASE_CLIENT_EMAIL) {
        
        const privateKey = Buffer.from(
          process.env.FIREBASE_PRIVATE_KEY, 
          'base64'
        ).toString('utf-8');

        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            privateKey: privateKey,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL
          })
        });
        this.isConfigured = true;
        console.log('Firebase Admin initialized with environment variables');
        return;
      }

      console.warn('Firebase credentials not configured. Push notification service will run in mock mode.');
      
    } catch (error) {
      console.error('Firebase initialization error:', error.message);
      this.isConfigured = false;
    }
  }

  /**
   * Send push notification to a single device
   * @param {Object} options - Notification options
   * @param {string} options.token - Device FCM token
   * @param {string} options.title - Notification title
   * @param {string} options.body - Notification body
   * @param {Object} options.data - Custom data payload
   * @param {Object} options.variables - Template variables for personalization
   * @param {string} options.imageUrl - Optional image URL
   * @param {string} options.clickAction - Action when notification is clicked
   * @returns {Promise<Object>} - Result object
   */
  async sendToDevice({ token, title, body, data = {}, variables = {}, imageUrl, clickAction }) {
    try {
      if (!token) {
        throw new Error('Device token is required');
      }

      // Replace template variables
      const processedTitle = this.replaceVariables(title, variables);
      const processedBody = this.replaceVariables(body, variables);

      const message = {
        token,
        notification: {
          title: processedTitle,
          body: processedBody
        },
        data: {
          ...data,
          timestamp: new Date().toISOString()
        }
      };

      // Add optional fields
      if (imageUrl) {
        message.notification.imageUrl = imageUrl;
      }

      if (clickAction) {
        message.data.clickAction = clickAction;
      }

      // Android-specific options
      message.android = {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'default'
        }
      };

      // iOS-specific options
      message.apns = {
        payload: {
          aps: {
            sound: 'default',
            badge: 1
          }
        }
      };

      // Check if service is configured
      if (!this.isConfigured) {
        console.log('[Push Notification Mock Mode] Would send notification:', {
          token: token.substring(0, 20) + '...',
          title: processedTitle,
          body: processedBody,
          data
        });

        return {
          success: true,
          mock: true,
          messageId: `mock_${Date.now()}`,
          timestamp: new Date()
        };
      }

      // Send actual notification via FCM
      const response = await admin.messaging().send(message);

      return {
        success: true,
        mock: false,
        messageId: response,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Push notification send error:', error);
      return {
        success: false,
        error: error.message,
        errorCode: error.code,
        timestamp: new Date()
      };
    }
  }

  /**
   * Send push notification to multiple devices
   * @param {Object} options - Notification options
   * @param {Array<string>} options.tokens - Array of device FCM tokens
   * @param {string} options.title - Notification title
   * @param {string} options.body - Notification body
   * @param {Object} options.data - Custom data payload
   * @param {Object} options.variables - Template variables
   * @returns {Promise<Object>} - Result with success/failure counts
   */
  async sendToMultipleDevices({ tokens, title, body, data = {}, variables = {} }) {
    try {
      if (!tokens || tokens.length === 0) {
        throw new Error('At least one device token is required');
      }

      const processedTitle = this.replaceVariables(title, variables);
      const processedBody = this.replaceVariables(body, variables);

      const message = {
        notification: {
          title: processedTitle,
          body: processedBody
        },
        data: {
          ...data,
          timestamp: new Date().toISOString()
        },
        android: {
          priority: 'high'
        },
        apns: {
          payload: {
            aps: {
              sound: 'default'
            }
          }
        }
      };

      if (!this.isConfigured) {
        console.log('[Push Notification Mock Mode] Would send to multiple devices:', {
          deviceCount: tokens.length,
          title: processedTitle,
          body: processedBody
        });

        return {
          success: true,
          mock: true,
          successCount: tokens.length,
          failureCount: 0,
          timestamp: new Date()
        };
      }

      // Send to multiple devices
      const response = await admin.messaging().sendEachForMulticast({
        tokens,
        ...message
      });

      return {
        success: true,
        mock: false,
        successCount: response.successCount,
        failureCount: response.failureCount,
        responses: response.responses,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Multicast push notification error:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  /**
   * Send push notification to a topic
   * @param {Object} options - Notification options
   * @param {string} options.topic - Topic name
   * @param {string} options.title - Notification title
   * @param {string} options.body - Notification body
   * @param {Object} options.data - Custom data payload
   * @returns {Promise<Object>} - Result object
   */
  async sendToTopic({ topic, title, body, data = {} }) {
    try {
      if (!topic) {
        throw new Error('Topic is required');
      }

      const message = {
        topic,
        notification: {
          title,
          body
        },
        data: {
          ...data,
          timestamp: new Date().toISOString()
        }
      };

      if (!this.isConfigured) {
        console.log('[Push Notification Mock Mode] Would send to topic:', {
          topic,
          title,
          body
        });

        return {
          success: true,
          mock: true,
          messageId: `mock_topic_${Date.now()}`,
          timestamp: new Date()
        };
      }

      const response = await admin.messaging().send(message);

      return {
        success: true,
        mock: false,
        messageId: response,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Topic push notification error:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  /**
   * Subscribe device tokens to a topic
   * @param {Array<string>} tokens - Device FCM tokens
   * @param {string} topic - Topic name
   * @returns {Promise<Object>} - Result object
   */
  async subscribeToTopic(tokens, topic) {
    try {
      if (!this.isConfigured) {
        return {
          success: true,
          mock: true,
          message: `Would subscribe ${tokens.length} devices to topic: ${topic}`
        };
      }

      const response = await admin.messaging().subscribeToTopic(tokens, topic);
      
      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
        errors: response.errors
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Unsubscribe device tokens from a topic
   * @param {Array<string>} tokens - Device FCM tokens
   * @param {string} topic - Topic name
   * @returns {Promise<Object>} - Result object
   */
  async unsubscribeFromTopic(tokens, topic) {
    try {
      if (!this.isConfigured) {
        return {
          success: true,
          mock: true,
          message: `Would unsubscribe ${tokens.length} devices from topic: ${topic}`
        };
      }

      const response = await admin.messaging().unsubscribeFromTopic(tokens, topic);
      
      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
        errors: response.errors
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Replace template variables in text
   * @param {string} text - Text with {{variable}} placeholders
   * @param {Object} variables - Variable values
   * @returns {string} - Processed text
   */
  replaceVariables(text, variables) {
    if (!text) return '';
    
    let result = text;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, value);
    }
    return result;
  }

  /**
   * Validate device token format
   * @param {string} token - FCM token to validate
   * @returns {boolean} - True if valid
   */
  isValidToken(token) {
    // Basic validation: FCM tokens are typically 152-163 characters
    return token && typeof token === 'string' && token.length >= 140;
  }
}

// Export singleton instance
module.exports = new PushNotificationService();
