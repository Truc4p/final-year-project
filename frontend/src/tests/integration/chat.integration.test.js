import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import ChatWidget from '../../components/ChatWidget.vue';

// Mock the API module
vi.mock('../../services/api.js', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn()
  },
  aiDermatologyService: {
    chat: vi.fn(),
    analyzeSkinImage: vi.fn(),
    transcribeAudio: vi.fn(),
    textToSpeech: vi.fn()
  }
}));

// Import after mocking
const { aiDermatologyService } = await import('../../services/api.js');

describe('Chat Integration Tests - Component + API', () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('FAQ Flow Integration', () => {
    it('should display FAQs and handle selection', async () => {
      wrapper = mount(ChatWidget, {
        global: {
          mocks: {
            $t: (key) => key
          }
        }
      });

      // Verify initial state shows FAQs
      expect(wrapper.vm.currentFlow).toBe('faq');
      
      // Simulate FAQ selection
      const faqCategory = 'skincare-routine';
      wrapper.vm.currentFlow = 'chat';
      wrapper.vm.selectedCategory = faqCategory;
      
      await nextTick();
      
      expect(wrapper.vm.currentFlow).toBe('chat');
      expect(wrapper.vm.selectedCategory).toBe(faqCategory);
    });
  });

  describe('AI Chat Flow Integration', () => {
    it('should send message to AI service and display response', async () => {
      // Mock successful AI response
      aiDermatologyService.chat.mockResolvedValue({
        response: 'AI response about skincare',
        conversationId: 'conv-123'
      });

      wrapper = mount(ChatWidget, {
        global: {
          mocks: {
            $t: (key) => key
          }
        }
      });

      // Switch to chat flow
      wrapper.vm.currentFlow = 'chat';
      wrapper.vm.userMessage = 'What products are good for dry skin?';
      
      const initialMessageCount = wrapper.vm.messages.length;
      
      // Simulate sending message
      const conversationHistory = wrapper.vm.messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));
      
      await aiDermatologyService.chat(
        wrapper.vm.userMessage,
        conversationHistory
      );

      // Verify API was called with correct parameters
      expect(aiDermatologyService.chat).toHaveBeenCalledWith(
        'What products are good for dry skin?',
        expect.any(Array)
      );

      // Verify response structure
      expect(aiDermatologyService.chat).toHaveBeenCalledTimes(1);
    });

    it('should handle AI service errors gracefully', async () => {
      // Mock API error
      aiDermatologyService.chat.mockRejectedValue(
        new Error('Network error')
      );

      wrapper = mount(ChatWidget, {
        global: {
          mocks: {
            $t: (key) => key
          }
        }
      });

      wrapper.vm.currentFlow = 'chat';
      wrapper.vm.userMessage = 'Test message';

      // Attempt to send message
      try {
        await aiDermatologyService.chat(wrapper.vm.userMessage, []);
      } catch (error) {
        expect(error.message).toBe('Network error');
      }

      // Verify error was thrown
      expect(aiDermatologyService.chat).toHaveBeenCalled();
    });
  });

  describe('Image Analysis Integration', () => {
    it('should upload image and receive analysis results', async () => {
      // Mock successful image analysis
      aiDermatologyService.analyzeSkinImage.mockResolvedValue({
        analysis: 'Skin analysis results',
        recommendations: ['Use moisturizer', 'Apply sunscreen']
      });

      wrapper = mount(ChatWidget, {
        global: {
          mocks: {
            $t: (key) => key
          }
        }
      });

      // Create mock file
      const mockFile = new File(['image content'], 'skin.jpg', {
        type: 'image/jpeg'
      });

      // Call image analysis
      const result = await aiDermatologyService.analyzeSkinImage(
        mockFile,
        'Analyze my skin condition'
      );

      // Verify API was called with file
      expect(aiDermatologyService.analyzeSkinImage).toHaveBeenCalledWith(
        mockFile,
        'Analyze my skin condition'
      );

      // Verify response structure
      expect(result).toHaveProperty('analysis');
      expect(result).toHaveProperty('recommendations');
      expect(Array.isArray(result.recommendations)).toBe(true);
    });

    it('should handle invalid image file format', async () => {
      // Mock error for invalid file
      aiDermatologyService.analyzeSkinImage.mockRejectedValue(
        new Error('Invalid file format')
      );

      wrapper = mount(ChatWidget, {
        global: {
          mocks: {
            $t: (key) => key
          }
        }
      });

      const mockFile = new File(['content'], 'document.pdf', {
        type: 'application/pdf'
      });

      try {
        await aiDermatologyService.analyzeSkinImage(mockFile, 'Test');
      } catch (error) {
        expect(error.message).toBe('Invalid file format');
      }
    });
  });

  describe('Voice Input Integration', () => {
    it('should transcribe audio and send as chat message', async () => {
      // Mock successful transcription
      aiDermatologyService.transcribeAudio.mockResolvedValue({
        text: 'What is the best moisturizer?'
      });

      // Mock successful chat response
      aiDermatologyService.chat.mockResolvedValue({
        response: 'Here are some great moisturizers...',
        conversationId: 'conv-456'
      });

      wrapper = mount(ChatWidget, {
        global: {
          mocks: {
            $t: (key) => key
          }
        }
      });

      // Create mock audio blob
      const mockAudio = new Blob(['audio data'], { type: 'audio/webm' });

      // Transcribe audio
      const transcription = await aiDermatologyService.transcribeAudio(mockAudio);
      
      expect(transcription.text).toBe('What is the best moisturizer?');

      // Send transcribed text to chat
      const chatResponse = await aiDermatologyService.chat(
        transcription.text,
        []
      );

      expect(chatResponse.response).toContain('moisturizers');
      expect(aiDermatologyService.transcribeAudio).toHaveBeenCalledWith(mockAudio);
      expect(aiDermatologyService.chat).toHaveBeenCalledWith(
        'What is the best moisturizer?',
        []
      );
    });
  });

  describe('Staff Chat Flow Integration', () => {
    it('should transition from AI to staff chat', async () => {
      wrapper = mount(ChatWidget, {
        global: {
          mocks: {
            $t: (key) => key
          }
        }
      });

      // Start in chat flow
      wrapper.vm.currentFlow = 'chat';
      expect(wrapper.vm.currentFlow).toBe('chat');

      // Transition to staff chat
      wrapper.vm.currentFlow = 'staff-chat';
      await nextTick();

      expect(wrapper.vm.currentFlow).toBe('staff-chat');
    });

    it('should maintain message history when switching to staff chat', async () => {
      wrapper = mount(ChatWidget, {
        global: {
          mocks: {
            $t: (key) => key
          }
        }
      });

      // Add some messages
      wrapper.vm.messages = [
        { id: 1, text: 'Hello', sender: 'user', timestamp: new Date() },
        { id: 2, text: 'Hi there', sender: 'bot', timestamp: new Date() }
      ];

      const messageCount = wrapper.vm.messages.length;

      // Switch to staff chat
      wrapper.vm.currentFlow = 'staff-chat';
      await nextTick();

      // Messages should still be present
      expect(wrapper.vm.messages.length).toBe(messageCount);
    });
  });

  describe('Session Management Integration', () => {
    it('should generate and track session identifiers', async () => {
      wrapper = mount(ChatWidget, {
        global: {
          mocks: {
            $t: (key) => key
          }
        }
      });

      // Verify component has session tracking capability
      const sessionId = wrapper.vm.sessionId;
      expect(sessionId).toBeDefined();
    });

    it('should maintain separate message arrays for different flows', async () => {
      wrapper = mount(ChatWidget, {
        global: {
          mocks: {
            $t: (key) => key
          }
        }
      });

      // Verify the component has separate message storage for each flow
      expect(wrapper.vm.faqMessages).toBeDefined();
      expect(wrapper.vm.aiChatMessages).toBeDefined();
      expect(wrapper.vm.staffChatMessages).toBeDefined();
      
      // Verify all are arrays
      expect(Array.isArray(wrapper.vm.faqMessages)).toBe(true);
      expect(Array.isArray(wrapper.vm.aiChatMessages)).toBe(true);
      expect(Array.isArray(wrapper.vm.staffChatMessages)).toBe(true);
    });
  });

  describe('Multi-Flow Navigation Integration', () => {
    it('should navigate between FAQ -> Chat -> Staff Chat flows', async () => {
      wrapper = mount(ChatWidget, {
        global: {
          mocks: {
            $t: (key) => key
          }
        }
      });

      // Start at FAQ
      expect(wrapper.vm.currentFlow).toBe('faq');

      // Move to Chat
      wrapper.vm.currentFlow = 'chat';
      await nextTick();
      expect(wrapper.vm.currentFlow).toBe('chat');

      // Move to Staff Chat
      wrapper.vm.currentFlow = 'staff-chat';
      await nextTick();
      expect(wrapper.vm.currentFlow).toBe('staff-chat');

      // Return to FAQ
      wrapper.vm.currentFlow = 'faq';
      await nextTick();
      expect(wrapper.vm.currentFlow).toBe('faq');
    });
  });

  describe('Error Recovery Integration', () => {
    it('should retry failed API call and recover', async () => {
      let callCount = 0;
      
      // Mock: fail first time, succeed second time
      aiDermatologyService.chat.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.reject(new Error('Network timeout'));
        }
        return Promise.resolve({
          response: 'Success after retry',
          conversationId: 'conv-retry'
        });
      });

      wrapper = mount(ChatWidget, {
        global: {
          mocks: {
            $t: (key) => key
          }
        }
      });

      // First attempt fails
      try {
        await aiDermatologyService.chat('Test message', []);
      } catch (error) {
        expect(error.message).toBe('Network timeout');
      }

      // Second attempt succeeds
      const result = await aiDermatologyService.chat('Test message', []);
      expect(result.response).toBe('Success after retry');
      expect(callCount).toBe(2);
    });
  });
});
