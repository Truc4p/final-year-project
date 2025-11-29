const mongoose = require('mongoose');
const ChatConversation = require('../../../models/communication/chatConversation');

describe('ChatConversation Model', () => {
  describe('Schema Validation', () => {
    test('should create valid chat conversation with required fields', () => {
      const validChat = new ChatConversation({
        sessionId: 'session-123',
        messages: [
          {
            role: 'user',
            content: 'Hello, I need help with my order',
            messageType: 'text'
          }
        ]
      });

      expect(validChat.sessionId).toBe('session-123');
      expect(validChat.messages).toHaveLength(1);
      expect(validChat.messages[0].role).toBe('user');
      expect(validChat.messages[0].content).toBe('Hello, I need help with my order');
    });

    test('should require sessionId field', () => {
      const chat = new ChatConversation({
        messages: []
      });
      const error = chat.validateSync();
      
      expect(error.errors.sessionId).toBeDefined();
    });

    test('should allow conversation without userId (anonymous)', () => {
      const chat = new ChatConversation({
        sessionId: 'anon-session-456',
        messages: []
      });

      expect(chat.userId).toBeUndefined();
      expect(chat.sessionId).toBe('anon-session-456');
    });

    test('should accept userId as ObjectId reference', () => {
      const userId = new mongoose.Types.ObjectId();
      const chat = new ChatConversation({
        sessionId: 'user-session-789',
        userId: userId,
        messages: []
      });

      expect(chat.userId).toEqual(userId);
    });
  });

  describe('Messages Array', () => {
    test('should accept multiple messages', () => {
      const chat = new ChatConversation({
        sessionId: 'session-multi',
        messages: [
          { role: 'user', content: 'First message', messageType: 'text' },
          { role: 'assistant', content: 'Response', messageType: 'ai' },
          { role: 'user', content: 'Follow up', messageType: 'text' }
        ]
      });

      expect(chat.messages).toHaveLength(3);
      expect(chat.messages[0].role).toBe('user');
      expect(chat.messages[1].role).toBe('assistant');
      expect(chat.messages[2].role).toBe('user');
    });

    test('should require role in message', () => {
      const chat = new ChatConversation({
        sessionId: 'session-123',
        messages: [
          { content: 'Message without role' }
        ]
      });
      const error = chat.validateSync();
      
      expect(error.errors['messages.0.role']).toBeDefined();
    });

    test('should require content in message', () => {
      const chat = new ChatConversation({
        sessionId: 'session-123',
        messages: [
          { role: 'user' }
        ]
      });
      const error = chat.validateSync();
      
      expect(error.errors['messages.0.content']).toBeDefined();
    });

    test('should only accept valid role values', () => {
      const chat = new ChatConversation({
        sessionId: 'session-123',
        messages: [
          { role: 'invalid-role', content: 'Test' }
        ]
      });
      const error = chat.validateSync();
      
      expect(error.errors['messages.0.role']).toBeDefined();
    });

    test('should accept user role', () => {
      const chat = new ChatConversation({
        sessionId: 'session-123',
        messages: [
          { role: 'user', content: 'User message', messageType: 'text' }
        ]
      });

      expect(chat.messages[0].role).toBe('user');
    });

    test('should accept assistant role', () => {
      const chat = new ChatConversation({
        sessionId: 'session-123',
        messages: [
          { role: 'assistant', content: 'Assistant message', messageType: 'ai' }
        ]
      });

      expect(chat.messages[0].role).toBe('assistant');
    });
  });

  describe('Message Types', () => {
    test('should accept text messageType', () => {
      const chat = new ChatConversation({
        sessionId: 'session-123',
        messages: [
          { role: 'user', content: 'Text message', messageType: 'text' }
        ]
      });

      expect(chat.messages[0].messageType).toBe('text');
    });

    test('should accept predefined messageType', () => {
      const chat = new ChatConversation({
        sessionId: 'session-123',
        messages: [
          { role: 'assistant', content: 'Predefined FAQ', messageType: 'predefined' }
        ]
      });

      expect(chat.messages[0].messageType).toBe('predefined');
    });

    test('should accept ai messageType', () => {
      const chat = new ChatConversation({
        sessionId: 'session-123',
        messages: [
          { role: 'assistant', content: 'AI response', messageType: 'ai' }
        ]
      });

      expect(chat.messages[0].messageType).toBe('ai');
    });

    test('should accept staff messageType', () => {
      const chat = new ChatConversation({
        sessionId: 'session-123',
        messages: [
          { role: 'assistant', content: 'Staff reply', messageType: 'staff' }
        ]
      });

      expect(chat.messages[0].messageType).toBe('staff');
    });

    test('should default messageType to text', () => {
      const chat = new ChatConversation({
        sessionId: 'session-123',
        messages: [
          { role: 'user', content: 'Message without explicit type' }
        ]
      });

      expect(chat.messages[0].messageType).toBe('text');
    });
  });

  describe('Message Metadata', () => {
    test('should accept metadata with faqId', () => {
      const faqId = new mongoose.Types.ObjectId();
      const chat = new ChatConversation({
        sessionId: 'session-123',
        messages: [
          {
            role: 'assistant',
            content: 'FAQ response',
            messageType: 'predefined',
            metadata: {
              faqId: faqId
            }
          }
        ]
      });

      expect(chat.messages[0].metadata.faqId).toEqual(faqId);
    });

    test('should accept metadata with intent and confidence', () => {
      const chat = new ChatConversation({
        sessionId: 'session-123',
        messages: [
          {
            role: 'assistant',
            content: 'AI response',
            messageType: 'ai',
            metadata: {
              intent: 'product_inquiry',
              confidence: 0.95
            }
          }
        ]
      });

      expect(chat.messages[0].metadata.intent).toBe('product_inquiry');
      expect(chat.messages[0].metadata.confidence).toBe(0.95);
    });

    test('should accept metadata with retrievedProducts', () => {
      const productId1 = new mongoose.Types.ObjectId();
      const productId2 = new mongoose.Types.ObjectId();
      
      const chat = new ChatConversation({
        sessionId: 'session-123',
        messages: [
          {
            role: 'assistant',
            content: 'Here are some products',
            messageType: 'ai',
            metadata: {
              retrievedProducts: [productId1, productId2]
            }
          }
        ]
      });

      expect(chat.messages[0].metadata.retrievedProducts).toHaveLength(2);
      expect(chat.messages[0].metadata.retrievedProducts[0]).toEqual(productId1);
    });
  });

  describe('Chat State', () => {
    test('should default isActive to true', () => {
      const chat = new ChatConversation({
        sessionId: 'session-123',
        messages: []
      });

      expect(chat.isActive).toBe(true);
    });

    test('should allow setting isActive to false', () => {
      const chat = new ChatConversation({
        sessionId: 'session-123',
        messages: [],
        isActive: false
      });

      expect(chat.isActive).toBe(false);
    });
  });

  describe('Message Timestamps', () => {
    test('should have default timestamp for messages', () => {
      const chat = new ChatConversation({
        sessionId: 'session-123',
        messages: [
          { role: 'user', content: 'Test message' }
        ]
      });

      expect(chat.messages[0].timestamp).toBeInstanceOf(Date);
    });

    test('should accept custom timestamp', () => {
      const customDate = new Date('2024-01-01T10:00:00Z');
      const chat = new ChatConversation({
        sessionId: 'session-123',
        messages: [
          { role: 'user', content: 'Test', timestamp: customDate }
        ]
      });

      expect(chat.messages[0].timestamp.getTime()).toBe(customDate.getTime());
    });
  });

  describe('Complete Conversation', () => {
    test('should create complete conversation with all features', () => {
      const userId = new mongoose.Types.ObjectId();
      const faqId = new mongoose.Types.ObjectId();
      const productId = new mongoose.Types.ObjectId();

      const chat = new ChatConversation({
        sessionId: 'complete-session',
        userId: userId,
        isActive: true,
        messages: [
          {
            role: 'user',
            content: 'I need help finding a moisturizer',
            messageType: 'text',
            timestamp: new Date()
          },
          {
            role: 'assistant',
            content: 'I can help with that!',
            messageType: 'ai',
            metadata: {
              intent: 'product_search',
              confidence: 0.92,
              retrievedProducts: [productId]
            }
          },
          {
            role: 'user',
            content: 'What are your business hours?',
            messageType: 'text'
          },
          {
            role: 'assistant',
            content: 'We are open Monday to Friday, 9 AM to 5 PM',
            messageType: 'predefined',
            metadata: {
              faqId: faqId
            }
          }
        ]
      });

      expect(chat.sessionId).toBe('complete-session');
      expect(chat.userId).toEqual(userId);
      expect(chat.messages).toHaveLength(4);
      expect(chat.isActive).toBe(true);
      expect(chat.messages[1].metadata.intent).toBe('product_search');
      expect(chat.messages[3].metadata.faqId).toEqual(faqId);
    });
  });
});
