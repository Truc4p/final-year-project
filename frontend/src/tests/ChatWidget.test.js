import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import ChatWidget from '../components/ChatWidget.vue';

// Mock fetch
global.fetch = vi.fn();

describe('ChatWidget.vue', () => {
  let wrapper;

  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    localStorage.clear();
    
    // Mock successful fetch responses
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: {} })
    });
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  describe('Component Rendering', () => {
    it('should render chat widget', () => {
      wrapper = mount(ChatWidget);
      expect(wrapper.exists()).toBe(true);
    });

    it('should have initial closed state', () => {
      wrapper = mount(ChatWidget);
      expect(wrapper.vm.isOpen).toBe(false);
    });

    it('should have FAQ as default flow', () => {
      wrapper = mount(ChatWidget);
      expect(wrapper.vm.currentFlow).toBe('faq');
    });

    it('should display FAQ categories', () => {
      wrapper = mount(ChatWidget);
      expect(wrapper.vm.faqCategories.length).toBeGreaterThan(0);
      expect(wrapper.vm.faqCategories).toContain('Questions about my order');
    });
  });

  describe('State Management', () => {
    it('should initialize with empty messages', () => {
      wrapper = mount(ChatWidget);
      expect(wrapper.vm.faqMessages).toEqual([]);
      expect(wrapper.vm.aiChatMessages).toEqual([]);
      expect(wrapper.vm.staffChatMessages).toEqual([]);
    });

    it('should not be loading initially', () => {
      wrapper = mount(ChatWidget);
      expect(wrapper.vm.isLoading).toBe(false);
    });

    it('should not have new messages initially', () => {
      wrapper = mount(ChatWidget);
      expect(wrapper.vm.hasNewMessage).toBe(false);
    });

    it('should show categories by default', () => {
      wrapper = mount(ChatWidget);
      expect(wrapper.vm.showCategories).toBe(true);
    });

    it('should not have selected category initially', () => {
      wrapper = mount(ChatWidget);
      expect(wrapper.vm.selectedCategory).toBeNull();
    });
  });

  describe('Staff Chat State', () => {
    it('should not be connected to staff initially', () => {
      wrapper = mount(ChatWidget);
      expect(wrapper.vm.isConnectedToStaff).toBe(false);
    });

    it('should not be waiting for staff initially', () => {
      wrapper = mount(ChatWidget);
      expect(wrapper.vm.waitingForStaff).toBe(false);
    });
  });

  describe('Session IDs', () => {
    it('should initialize session IDs as null', () => {
      wrapper = mount(ChatWidget);
      expect(wrapper.vm.faqSessionId).toBeNull();
      expect(wrapper.vm.aiChatSessionId).toBeNull();
      expect(wrapper.vm.staffChatSessionId).toBeNull();
    });
  });

  describe('Computed Properties', () => {
    it('should return correct sessionId based on currentFlow', async () => {
      wrapper = mount(ChatWidget);
      
      // Set different session IDs for each flow
      wrapper.vm.faqSessionId = 'faq_session';
      wrapper.vm.aiChatSessionId = 'ai_session';
      wrapper.vm.staffChatSessionId = 'staff_session';
      
      wrapper.vm.currentFlow = 'faq';
      await nextTick();
      expect(wrapper.vm.sessionId).toBe('faq_session');
      
      wrapper.vm.currentFlow = 'chat';
      await nextTick();
      expect(wrapper.vm.sessionId).toBe('ai_session');
      
      wrapper.vm.currentFlow = 'staff-chat';
      await nextTick();
      expect(wrapper.vm.sessionId).toBe('staff_session');
    });

    it('should return correct messages array based on currentFlow', async () => {
      wrapper = mount(ChatWidget);
      
      const faqMsg = [{ role: 'user', content: 'FAQ question' }];
      const aiMsg = [{ role: 'user', content: 'AI chat' }];
      const staffMsg = [{ role: 'user', content: 'Staff chat' }];
      
      wrapper.vm.faqMessages = faqMsg;
      wrapper.vm.aiChatMessages = aiMsg;
      wrapper.vm.staffChatMessages = staffMsg;
      
      wrapper.vm.currentFlow = 'faq';
      await nextTick();
      expect(wrapper.vm.messages).toEqual(faqMsg);
      
      wrapper.vm.currentFlow = 'chat';
      await nextTick();
      expect(wrapper.vm.messages).toEqual(aiMsg);
      
      wrapper.vm.currentFlow = 'staff-chat';
      await nextTick();
      expect(wrapper.vm.messages).toEqual(staffMsg);
    });

    it('should default to faq session when flow is unknown', async () => {
      wrapper = mount(ChatWidget);
      
      wrapper.vm.faqSessionId = 'default_session';
      wrapper.vm.currentFlow = 'unknown';
      await nextTick();
      
      expect(wrapper.vm.sessionId).toBe('default_session');
    });

    it('should default to faq messages when flow is unknown', async () => {
      wrapper = mount(ChatWidget);
      
      const defaultMsg = [{ role: 'user', content: 'Default' }];
      wrapper.vm.faqMessages = defaultMsg;
      wrapper.vm.currentFlow = 'unknown';
      await nextTick();
      
      expect(wrapper.vm.messages).toEqual(defaultMsg);
    });
  });

  describe('Flow Transitions', () => {
    it('should allow changing between flows', async () => {
      wrapper = mount(ChatWidget);
      
      expect(wrapper.vm.currentFlow).toBe('faq');
      
      wrapper.vm.currentFlow = 'chat';
      await nextTick();
      expect(wrapper.vm.currentFlow).toBe('chat');
      
      wrapper.vm.currentFlow = 'staff-chat';
      await nextTick();
      expect(wrapper.vm.currentFlow).toBe('staff-chat');
      
      wrapper.vm.currentFlow = 'faq';
      await nextTick();
      expect(wrapper.vm.currentFlow).toBe('faq');
    });

    it('should maintain separate message arrays for different flows', async () => {
      wrapper = mount(ChatWidget);
      
      const faqMsg = { role: 'user', content: 'FAQ' };
      const chatMsg = { role: 'user', content: 'Chat' };
      
      wrapper.vm.faqMessages.push(faqMsg);
      wrapper.vm.aiChatMessages.push(chatMsg);
      
      expect(wrapper.vm.faqMessages).toHaveLength(1);
      expect(wrapper.vm.aiChatMessages).toHaveLength(1);
      expect(wrapper.vm.staffChatMessages).toHaveLength(0);
    });
  });

  describe('Input Management', () => {
    it('should initialize input text as empty', () => {
      wrapper = mount(ChatWidget);
      expect(wrapper.vm.inputText).toBe('');
    });

    it('should allow updating input text', async () => {
      wrapper = mount(ChatWidget);
      
      wrapper.vm.inputText = 'Test message';
      await nextTick();
      
      expect(wrapper.vm.inputText).toBe('Test message');
    });
  });

  describe('UI State Toggles', () => {
    it('should toggle isOpen state', async () => {
      wrapper = mount(ChatWidget);
      
      expect(wrapper.vm.isOpen).toBe(false);
      
      wrapper.vm.isOpen = true;
      await nextTick();
      expect(wrapper.vm.isOpen).toBe(true);
      
      wrapper.vm.isOpen = false;
      await nextTick();
      expect(wrapper.vm.isOpen).toBe(false);
    });

    it('should toggle showCategories state', async () => {
      wrapper = mount(ChatWidget);
      
      expect(wrapper.vm.showCategories).toBe(true);
      
      wrapper.vm.showCategories = false;
      await nextTick();
      expect(wrapper.vm.showCategories).toBe(false);
    });

    it('should allow setting selected category', async () => {
      wrapper = mount(ChatWidget);
      
      const category = 'Questions about my order';
      wrapper.vm.selectedCategory = category;
      await nextTick();
      
      expect(wrapper.vm.selectedCategory).toBe(category);
    });
  });
});
