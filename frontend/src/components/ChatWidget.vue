<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, computed } from 'vue';

const API_BASE_URL = 'http://localhost:3000';

const isOpen = ref(false);
const hasNewMessage = ref(false);
const isLoading = ref(false);
const faqSessionId = ref(null);
const aiChatSessionId = ref(null);
const staffChatSessionId = ref(null);
const currentFlow = ref('faq'); // 'faq', 'chat', or 'staff-chat'

// Computed property to get current session ID based on flow
const sessionId = computed(() => {
  switch (currentFlow.value) {
    case 'faq':
      return faqSessionId.value;
    case 'chat':
      return aiChatSessionId.value;
    case 'staff-chat':
      return staffChatSessionId.value;
    default:
      return faqSessionId.value;
  }
});

// Messages and chat state - separate for each mode
const faqMessages = ref([]);
const aiChatMessages = ref([]);
const staffChatMessages = ref([]);
const inputText = ref('');
const messagesWrap = ref(null);

// Computed property to get current messages based on flow
const messages = computed(() => {
  switch (currentFlow.value) {
    case 'faq':
      return faqMessages.value;
    case 'chat':
      return aiChatMessages.value;
    case 'staff-chat':
      return staffChatMessages.value;
    default:
      return faqMessages.value;
  }
});

// FAQs and suggestions
const faqs = ref([]);
const faqCategories = ref([
  "Questions about my order",
  "Questions about returns",
  "Questions about shipping",
  "Questions about products",
  "Questions about skincare"
]);

// Flow state
const showCategories = ref(true);
const selectedCategory = ref(null);

// Staff chat state
const isConnectedToStaff = ref(false);
const waitingForStaff = ref(false);
// WebSocket connection for real-time staff messaging
let websocket = null;
let wsReconnectInterval = null;

// Generate session ID
function generateSessionId() {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Get or create persistent session ID for specific mode
async function getOrCreateSessionId(mode = 'faq') {
  const token = localStorage.getItem('token');
  
  // For authenticated users, create a user-specific session key
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.id;
      const sessionKey = `chatSession_user_${userId}_${mode}`;
      
      let storedSession = localStorage.getItem(sessionKey);
      if (storedSession) {
        console.log(`🔍 Found existing ${mode} session for authenticated user:`, storedSession);
        return storedSession;
      } else {
        // Check if user has an existing conversation on the server for this mode
        try {
          const response = await fetch(`${API_BASE_URL}/chat/find-user-conversation?mode=${mode}`, {
            headers: getCustomerAuthHeaders()
          });
          const result = await response.json();
          
          if (result.success && result.data.conversation) {
            const existingSessionId = result.data.conversation.sessionId;
            localStorage.setItem(sessionKey, existingSessionId);
            console.log(`🔍 Recovered existing ${mode} session from server:`, existingSessionId);
            return existingSessionId;
          }
        } catch (e) {
          console.error('Error checking for existing conversation:', e);
        }
        
        // Create new session if no existing one found
        const newSession = generateSessionId();
        localStorage.setItem(sessionKey, newSession);
        console.log(`🔍 Created new ${mode} session for authenticated user:`, newSession);
        return newSession;
      }
    } catch (e) {
      console.error('Error parsing token:', e);
    }
  }
  
  // For anonymous users, use a mode-specific session key
  const sessionKey = `chatSession_anonymous_${mode}`;
  let storedSession = localStorage.getItem(sessionKey);
  
  if (storedSession) {
    console.log(`🔍 Found existing anonymous ${mode} session:`, storedSession);
    return storedSession;
  } else {
    const newSession = generateSessionId();
    localStorage.setItem(sessionKey, newSession);
    console.log(`🔍 Created new anonymous ${mode} session:`, newSession);
    return newSession;
  }
}

// Clear session when user logs out or wants to start fresh
function clearSessionId(mode = null) {
  const token = localStorage.getItem('token');
  const modes = mode ? [mode] : ['faq', 'chat', 'staff-chat'];
  
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.id;
      modes.forEach(m => {
        const sessionKey = `chatSession_user_${userId}_${m}`;
        localStorage.removeItem(sessionKey);
      });
    } catch (e) {
      console.error('Error parsing token:', e);
    }
  }
  
  modes.forEach(m => {
    localStorage.removeItem(`chatSession_anonymous_${m}`);
  });
}

// Handle user login/logout - migrate sessions appropriately
function handleUserAuthChange() {
  const token = localStorage.getItem('token');
  
  if (token) {
    // User just logged in - try to recover their authenticated sessions
    // or keep current anonymous sessions
    faqSessionId.value = null;
    aiChatSessionId.value = null;
    staffChatSessionId.value = null;
    initializeChat();
  } else {
    // User logged out - clear authenticated sessions and create anonymous ones
    clearSessionId();
    faqSessionId.value = null;
    aiChatSessionId.value = null;
    staffChatSessionId.value = null;
    initializeChat();
  }
}

// Expose this function for external components to call when auth state changes
window.chatHandleUserAuthChange = handleUserAuthChange;

// Get customer auth headers (if logged in)
function getCustomerAuthHeaders() {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('🔍 Customer chat: Adding auth token to request');
  } else {
    console.log('🔍 Customer chat: No auth token found, sending as anonymous');
  }
  
  return headers;
}

// Format bot messages for better readability
function formatBotMessage(text) {
  if (!text) return text;

  // We'll produce safe HTML: escape input, then convert markdown-like bold/italic and newlines
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // basic readability tweaks on plain text first (preserve where to break into paragraphs)
  let interim = text
    .replace(/\?\s+/g, '?\n\n')
    .replace(/\s+(However|Additionally|Finally|Remember|Let me know)/g, '\n\n$1')
    // Break before sentences that start with "This" (covers "This daily cream", "This serum", etc.)
    .replace(/\.\s+(This\b)/gi, '.\n\n$1')
    .replace(/\.\s+(This\s+(?:serum|cream|product|cleanser))/gi, '.\n\n$1')
    .replace(/\.\s+(Remember\s+to)/gi, '.\n\n$1')
    .trim();

  // escape any HTML the AI returned so we don't inject markup
  let escaped = escapeHtml(interim);

  // convert markdown bold (**text**) and italics (_text_) to HTML
  // note: operate on escaped text so resulting tags are safe
  escaped = escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  escaped = escaped.replace(/_(.+?)_/g, '<em>$1</em>');

  // convert paragraphs: split on double newlines into <p> blocks, single newlines to <br>
  const paragraphs = escaped
    .split(/\n\s*\n/)
    .map(p => p.replace(/\n/g, '<br>'))
    .filter(p => p.trim().length > 0);

  return paragraphs.map(p => `<p>${p}</p>`).join('');
}

// Initialize chat
async function initializeChat() {
  // Initialize all session IDs
  if (!faqSessionId.value) {
    faqSessionId.value = await getOrCreateSessionId('faq');
  }
  if (!aiChatSessionId.value) {
    aiChatSessionId.value = await getOrCreateSessionId('chat');
  }
  if (!staffChatSessionId.value) {
    staffChatSessionId.value = await getOrCreateSessionId('staff-chat');
  }

  // Load conversation history for all modes
  await Promise.all([
    loadConversationHistory('faq'),
    loadConversationHistory('chat'),
    loadConversationHistory('staff-chat')
  ]);

  // Load FAQs
  await loadFAQs();

  // Add welcome message to FAQ if no history
  if (faqMessages.value.length === 0) {
    addBotMessage("Hi! I'm your Wrencos Beauty Assistant.\nHow can I help you today?");
  }

  // Set initial state
  showCategories.value = true;
  currentFlow.value = 'faq';
}

// Load FAQs from backend
async function loadFAQs() {
  try {
    const response = await fetch(`${API_BASE_URL}/chat/faqs?limit=100`);
    const result = await response.json();
    if (result.success) {
      faqs.value = result.data;
    }
  } catch (error) {
    console.error('Error loading FAQs:', error);
  }
}

// Load conversation history for specific mode
async function loadConversationHistory(mode = 'faq') {
  const currentSessionId = mode === 'faq' ? faqSessionId.value : 
                          mode === 'chat' ? aiChatSessionId.value : 
                          staffChatSessionId.value;
  
  if (!currentSessionId) return;

  try {
    const response = await fetch(`${API_BASE_URL}/chat/conversation/${currentSessionId}`);
    const result = await response.json();
    if (result.success && result.data.messages.length > 0) {
      const loadedMessages = result.data.messages.map((msg, index) => ({
        id: index + 1,
        sender: msg.role === 'user' ? 'user' : 'bot',
        text: msg.role === 'user' ? msg.content : formatBotMessage(msg.content),
        timestamp: msg.timestamp,
        relatedProducts: msg.relatedProducts || [],
        faq: msg.faq
      }));
      
      // Load messages into the correct array based on mode
      switch (mode) {
        case 'faq':
          faqMessages.value = loadedMessages;
          break;
        case 'chat':
          aiChatMessages.value = loadedMessages;
          break;
        case 'staff-chat':
          staffChatMessages.value = loadedMessages;
          // Restore staff conversation state
          const conversationState = result.data.conversationState || {};
          isConnectedToStaff.value = conversationState.isStaffChat && !conversationState.waitingForStaff;
          waitingForStaff.value = conversationState.waitingForStaff;
          console.log(`🔍 Restored ${mode} session. Connected:`, isConnectedToStaff.value, 'Waiting:', waitingForStaff.value);
          break;
      }
      
      // Auto-scroll to bottom after loading conversation history
      await nextTick();
      scrollToBottom();
    }
  } catch (error) {
    console.error(`Error loading ${mode} conversation:`, error);
  }
}

function toggle() {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    hasNewMessage.value = false;
    initializeChat().then(() => {
      // Scroll to bottom after initialization is complete
      scrollToBottom();
    });
  } else {
    // When closing chat, disconnect WebSocket to save resources
    if (currentFlow.value === 'staff-chat') {
      console.log('🔌 Chat closed - disconnecting WebSocket to save resources');
      disconnectWebSocket();
    }
  }
}

function outsideClose(e) {
  if (!isOpen.value) return;
  const panel = document.getElementById('chat-panel');
  const button = document.getElementById('chat-button');
  if (panel && !panel.contains(e.target) && button && !button.contains(e.target)) {
    isOpen.value = false;
  }
}

async function clearChat() {
  try {
    // Store current session IDs before clearing
    const currentFaqSessionId = faqSessionId.value;
    const currentAiChatSessionId = aiChatSessionId.value;
    const currentStaffChatSessionId = staffChatSessionId.value;

    // Clear conversations from server if session IDs exist
    const clearPromises = [];
    if (currentFaqSessionId) {
      clearPromises.push(
        fetch(`${API_BASE_URL}/chat/conversation/${currentFaqSessionId}`, {
          method: 'DELETE',
          headers: getCustomerAuthHeaders()
        }).catch(err => console.error('Error clearing FAQ conversation:', err))
      );
    }
    if (currentAiChatSessionId) {
      clearPromises.push(
        fetch(`${API_BASE_URL}/chat/conversation/${currentAiChatSessionId}`, {
          method: 'DELETE',
          headers: getCustomerAuthHeaders()
        }).catch(err => console.error('Error clearing AI chat conversation:', err))
      );
    }
    if (currentStaffChatSessionId) {
      clearPromises.push(
        fetch(`${API_BASE_URL}/chat/conversation/${currentStaffChatSessionId}`, {
          method: 'DELETE',
          headers: getCustomerAuthHeaders()
        }).catch(err => console.error('Error clearing staff chat conversation:', err))
      );
    }

    // Wait for all clear operations to complete
    await Promise.all(clearPromises);

    // Clear all message arrays
    faqMessages.value = [];
    aiChatMessages.value = [];
    staffChatMessages.value = [];
    
    // Clear all persistent sessions from localStorage
    clearSessionId(); 
    
    // Create new session IDs
    faqSessionId.value = await getOrCreateSessionId('faq');
    aiChatSessionId.value = await getOrCreateSessionId('chat');
    staffChatSessionId.value = await getOrCreateSessionId('staff-chat');
    
    // Reset state
    showCategories.value = true;
    selectedCategory.value = null;
    currentFlow.value = 'faq';
    isConnectedToStaff.value = false;
    waitingForStaff.value = false;
    disconnectWebSocket();
    
    // Add fresh welcome message to FAQ
    addBotMessage("Hi! I'm your Wrencos Beauty Assistant.\nHow can I help you today?");
    
    console.log('✅ All chat conversations cleared successfully');
  } catch (error) {
    console.error('Error clearing chat conversations:', error);
    // Still clear local data even if server clearing fails
    faqMessages.value = [];
    aiChatMessages.value = [];
    staffChatMessages.value = [];
    clearSessionId();
    
    // Reset to default state
    showCategories.value = true;
    selectedCategory.value = null;
    currentFlow.value = 'faq';
    isConnectedToStaff.value = false;
    waitingForStaff.value = false;
    lastStaffMessageTime = null;
    stopStaffChatPolling();
    
    addBotMessage("Hi! I'm your Wrencos Beauty Assistant.\nHow can I help you today?");
  }
}

// Switch to FAQ mode
async function switchToFAQ() {
  currentFlow.value = 'faq';
  showCategories.value = true;
  selectedCategory.value = null;
  isConnectedToStaff.value = false;
  waitingForStaff.value = false;
  stopStaffChatPolling();
  
  // Initialize FAQ session if not exists
  if (!faqSessionId.value) {
    faqSessionId.value = await getOrCreateSessionId('faq');
    await loadConversationHistory('faq');
  }
  
  // Add welcome message if no FAQ history
  if (faqMessages.value.length === 0) {
    addBotMessage("Hi! I'm your Wrencos Beauty Assistant.\nBrowse our FAQ categories to find quick answers to common questions.");
  }
}

// Switch to AI Chat mode
async function switchToAIChat() {
  currentFlow.value = 'chat';
  showCategories.value = false;
  selectedCategory.value = null;
  isConnectedToStaff.value = false;
  waitingForStaff.value = false;
  disconnectWebSocket();
  
  // Initialize AI chat session if not exists
  if (!aiChatSessionId.value) {
    aiChatSessionId.value = await getOrCreateSessionId('chat');
    await loadConversationHistory('chat');
  }
  
  // Add welcome message if no AI chat history
  if (aiChatMessages.value.length === 0) {
    addBotMessage("Hi! I'm your AI Beauty Assistant.\nAsk me anything about skincare, products, or beauty routines!");
  }
}

// Switch to Staff Chat mode
async function switchToStaffChat() {
  currentFlow.value = 'staff-chat';
  showCategories.value = false;
  selectedCategory.value = null;
  
  // Initialize staff chat session if not exists
  if (!staffChatSessionId.value) {
    staffChatSessionId.value = await getOrCreateSessionId('staff-chat');
    await loadConversationHistory('staff-chat');
  }
  
  console.log('🔄 Switching to staff chat:', {
    hasMessages: staffChatMessages.value.length > 0,
    isConnected: isConnectedToStaff.value,
    isWaiting: waitingForStaff.value
  });
  
  // If no existing staff conversation, initiate staff connection
  if (staffChatMessages.value.length === 0) {
    initializeStaffChat();
  } else {
    // Check if we have an active staff connection
    // If we have messages but no connection state, assume we're connected
    if (!isConnectedToStaff.value && !waitingForStaff.value) {
      isConnectedToStaff.value = true;
    }
    
    // Connect WebSocket if we have an active staff connection
    if (isConnectedToStaff.value) {
      connectWebSocket();
    }
    
    // Connect WebSocket if in staff chat mode
    if (currentFlow.value === 'staff-chat' && isOpen.value) {
      connectWebSocket();
    }
  }
}

// Add message to chat - now adds to the correct flow's messages
function addUserMessage(text) {
  const newMessage = {
    id: Date.now(),
    sender: 'user',
    text: text,
    timestamp: new Date()
  };
  
  switch (currentFlow.value) {
    case 'faq':
      faqMessages.value.push(newMessage);
      break;
    case 'chat':
      aiChatMessages.value.push(newMessage);
      break;
    case 'staff-chat':
      staffChatMessages.value.push(newMessage);
      break;
  }
  
  scrollToBottom();
}

function addBotMessage(text, relatedProducts = [], faq = null) {
  const formattedText = formatBotMessage(text);
  // If the chat panel is closed, mark that there's a new message so the
  // floating button can show a badge. This makes `hasNewMessage` meaningful.
  if (!isOpen.value) {
    hasNewMessage.value = true;
  }
  
  const newMessage = {
    id: Date.now(),
    sender: 'bot',
    text: formattedText,
    timestamp: new Date(),
    relatedProducts: relatedProducts,
    faq: faq
  };
  
  switch (currentFlow.value) {
    case 'faq':
      faqMessages.value.push(newMessage);
      break;
    case 'chat':
      aiChatMessages.value.push(newMessage);
      break;
    case 'staff-chat':
      staffChatMessages.value.push(newMessage);
      break;
  }
  
  scrollToBottom();
}

// Flow 1: Handle FAQ category selection
function selectFAQCategory(category) {
  selectedCategory.value = category;
  showCategories.value = false;
}

// Flow 1: Get FAQs filtered by category
const filteredFAQs = computed(() => {
  if (!selectedCategory.value) return [];

  let categoryFilter = '';
  switch (selectedCategory.value) {
    case 'Questions about my order':
      categoryFilter = 'orders';
      break;
    case 'Questions about returns':
      categoryFilter = 'returns';
      break;
    case 'Questions about shipping':
      categoryFilter = 'shipping';
      break;
    case 'Questions about products':
      categoryFilter = 'products';
      break;
    case 'Questions about skincare':
      categoryFilter = 'skincare';
      break;
    default:
      return faqs.value;
  }

  return faqs.value.filter(faq => faq.category === categoryFilter);
});

// Flow 1: Handle predefined FAQ selection
async function selectFAQ(faq) {
  addUserMessage(faq.question);
  isLoading.value = true;
  showCategories.value = false;
  selectedCategory.value = null;
  // Stay in FAQ mode instead of switching to chat mode
  // currentFlow.value should remain 'faq'

  try {
    const response = await fetch(`${API_BASE_URL}/chat/faq/${faq._id}/answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId: sessionId.value
      })
    });

    const result = await response.json();
    if (result.success) {
      addBotMessage(result.data.answer, [], faq);
    } else {
      addBotMessage("Sorry, I couldn't retrieve that information. Please try again.");
    }
  } catch (error) {
    console.error('Error getting FAQ answer:', error);
    addBotMessage("Sorry, I'm having trouble connecting. Please try again later.");
  } finally {
    isLoading.value = false;
  }
}

// Initialize staff chat
async function initializeStaffChat() {
  waitingForStaff.value = true;
  addBotMessage("Connecting you to our staff team...");
  
  try {
    const response = await fetch(`${API_BASE_URL}/chat/staff/connect`, {
      method: 'POST',
      headers: getCustomerAuthHeaders(),
      body: JSON.stringify({
        sessionId: sessionId.value
      })
    });

    const result = await response.json();
    if (result.success) {
      isConnectedToStaff.value = true;
      waitingForStaff.value = false;
      addBotMessage("You are now connected to our staff team. They will respond shortly!");
      // Connect WebSocket for real-time staff replies
      connectWebSocket();
    } else {
      waitingForStaff.value = false;
      addBotMessage("Sorry, our staff team is currently unavailable. Please try again later or use our AI assistant.");
    }
  } catch (error) {
    console.error('Error connecting to staff:', error);
    waitingForStaff.value = false;
    addBotMessage("Sorry, we're having trouble connecting you to our staff team. Please try again later.");
  }
}

// WebSocket connection for real-time staff messaging
function connectWebSocket() {
  if (websocket && websocket.readyState === WebSocket.OPEN) {
    return; // Already connected
  }

  try {
    // Connect to WebSocket server
    websocket = new WebSocket('ws://localhost:8080');
    
    websocket.onopen = () => {
      console.log('🔌 WebSocket connected');
      clearInterval(wsReconnectInterval);
      
      // Register with current session if in staff chat mode
      if (currentFlow.value === 'staff-chat' && sessionId.value) {
        // Add a small delay to ensure connection is fully established
        setTimeout(() => {
          if (websocket && websocket.readyState === WebSocket.OPEN) {
            websocket.send(JSON.stringify({
              type: 'register',
              sessionId: sessionId.value
            }));
          }
        }, 10);
      }
    };
    
    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📨 WebSocket message received:', data);
        
        if (data.type === 'staff_reply') {
          // Add staff message to chat
          addBotMessage(data.message);
          console.log('✅ Staff reply received and displayed');
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    websocket.onclose = () => {
      console.log('🔌 WebSocket disconnected');
      websocket = null;
      
      // Attempt to reconnect if we're still in staff chat mode
      if (currentFlow.value === 'staff-chat' && isOpen.value) {
        console.log('🔄 Attempting WebSocket reconnection...');
        wsReconnectInterval = setInterval(() => {
          if (currentFlow.value === 'staff-chat' && isOpen.value) {
            connectWebSocket();
          } else {
            clearInterval(wsReconnectInterval);
          }
        }, 3000);
      }
    };
    
    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
  } catch (error) {
    console.error('Error connecting WebSocket:', error);
  }
}

// Disconnect WebSocket
function disconnectWebSocket() {
  if (wsReconnectInterval) {
    clearInterval(wsReconnectInterval);
    wsReconnectInterval = null;
  }
  
  if (websocket) {
    websocket.close();
    websocket = null;
  }
}

// Send message to staff
async function sendStaffMessage(message = null) {
  const text = message || inputText.value.trim();
  if (!text) return;

  addUserMessage(text);
  inputText.value = '';
  
  // If not connected or waiting, try to connect first
  if (!isConnectedToStaff.value && !waitingForStaff.value) {
    await initializeStaffChat();
    // After connecting, the message will be queued and staff will see it
  }
  
  isLoading.value = true;

  try {
    const response = await fetch(`${API_BASE_URL}/chat/staff/message`, {
      method: 'POST',
      headers: getCustomerAuthHeaders(),
      body: JSON.stringify({
        sessionId: sessionId.value,
        message: text
      })
    });

    const result = await response.json();
    if (!result.success) {
      addBotMessage("Sorry, your message couldn't be sent. Please try again.");
    }
    // Don't add any AI response here - only staff responses should appear from polling
  } catch (error) {
    console.error('Error sending staff message:', error);
    addBotMessage("Sorry, there was an error sending your message. Please try again.");
  } finally {
    isLoading.value = false;
  }
}

// Flow 2: Send message to AI
async function sendAIMessage(message = null) {
  const text = message || inputText.value.trim();
  if (!text) return;

  addUserMessage(text);
  inputText.value = '';
  isLoading.value = true;
  showCategories.value = false;
  selectedCategory.value = null;
  // Don't change flow if we're already in FAQ mode and have messages
  if (currentFlow.value !== 'faq' || faqMessages.value.length === 0) {
    currentFlow.value = 'chat';
  }

  try {
    const response = await fetch(`${API_BASE_URL}/chat/ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: text,
        sessionId: sessionId.value
      })
    });

    const result = await response.json();
    if (result.success) {
      addBotMessage(
        result.data.message,
        result.data.relatedProducts || [],
        null
      );
    } else {
      addBotMessage("Sorry, I couldn't process your message. Please try again.");
    }
  } catch (error) {
    console.error('Error sending AI message:', error);
    addBotMessage("Sorry, I'm having trouble connecting. Please try again later.");
  } finally {
    isLoading.value = false;
  }
}

function sendMessage() {
  if (currentFlow.value === 'staff-chat') {
    // Always use sendStaffMessage for staff chat mode
    sendStaffMessage();
  } else {
    // AI chat mode
    sendAIMessage();
  }
}

function onKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

async function scrollToBottom() {
  await nextTick();
  if (messagesWrap.value) {
    messagesWrap.value.scrollTop = messagesWrap.value.scrollHeight;
  }
}

onMounted(() => {
  document.addEventListener('click', outsideClose);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', outsideClose);
  disconnectWebSocket();
});
</script>

<template>
  <div class="chat-root">
    <!-- Floating Button -->
    <button id="chat-button" class="chat-fab" @click.stop="toggle" aria-label="Open chat">
      <svg v-if="!isOpen" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="icon">
        <path fill="currentColor"
          d="M12 3C6.477 3 2 6.94 2 11.8c0 2.45 1.204 4.66 3.162 6.23V22l3.6-1.98c1.002.28 2.07.43 3.238.43 5.523 0 10-3.94 10-8.85S17.523 3 12 3Z" />
      </svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="icon">
        <path fill="currentColor"
          d="M7.05 7.05a1 1 0 0 1 1.414 0L12 10.586l3.536-3.536a1 1 0 1 1 1.414 1.414L13.414 12l3.536 3.536a1 1 0 0 1-1.414 1.414L12 13.414l-3.536 3.536a1 1 0 0 1-1.414-1.414L10.586 12 7.05 8.464a1 1 0 0 1 0-1.414Z" />
      </svg>
      <span v-if="hasNewMessage" class="badge"></span>
    </button>

    <!-- Chat Panel -->
    <transition name="chat-slide">
      <div v-if="isOpen" id="chat-panel" class="chat-panel" @click.stop>
        <div class="chat-header">
          <div class="header-title">
            <h3 class="text-white">Assistant</h3>
            <span v-if="currentFlow === 'faq'" class="flow-indicator">FAQ</span>
            <span v-else-if="currentFlow === 'chat'" class="flow-indicator">AI Chat</span>
            <span v-else-if="currentFlow === 'staff-chat'" class="flow-indicator">Staff Chat</span>
          </div>
          
          <!-- Chat Mode Icons -->
          <div class="chat-mode-icons">
            <!-- FAQ Icon -->
            <button class="mode-icon-btn" :class="{ active: currentFlow === 'faq' }" @click="switchToFAQ" aria-label="FAQ" title="Frequently Asked Questions">
              <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor">
                <path d="M424-320q0-81 14.5-116.5T500-514q41-36 62.5-62.5T584-637q0-41-27.5-68T480-732q-51 0-77.5 31T365-638l-103-44q21-64 77.5-121T480-860q109 0 184.5 75.5T740-600q0 44-24.5 84.5T666-438q-35 33-49.5 60.5T602-320H424Zm56 240q-33 0-56.5-23.5T400-160q0-33 23.5-56.5T480-240q33 0 56.5 23.5T560-160q0 33-23.5 56.5T480-80Z"/>
              </svg>
            </button>
            
            <!-- AI Chat Icon -->
            <button class="mode-icon-btn" :class="{ active: currentFlow === 'chat' }" @click="switchToAIChat" aria-label="AI Chat" title="Chat with AI Assistant">
              <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor">
                <path d="M240-400h320v-80H240v80Zm0-120h480v-80H240v80Zm0-120h480v-80H240v80ZM80-80v-720q0-33 23.5-56.5T160-880h640q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H240L80-80Z"/>
              </svg>
            </button>
            
            <!-- Staff Chat Icon -->
            <button class="mode-icon-btn" :class="{ active: currentFlow === 'staff-chat' }" @click="switchToStaffChat" aria-label="Staff Chat" title="Chat with Staff">
              <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor">
                <path d="M40-160v-112q0-34 17.5-62.5T104-378q62-31 126-46.5T360-440q66 0 130 15.5T616-378q29 15 46.5 43.5T680-272v112H40ZM720-40v-109q0-44-24.5-84.5T629-283q51 6 96 20.5t84 35.5q36 20 53.5 47t17.5 61v79H720ZM360-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Zm400-160q0 66-47 113t-113 47q-11 0-28-2.5t-28-5.5q27-32 41.5-71t14.5-81q0-42-14.5-81T544-792q14-5 28-6.5t28-1.5q66 0 113 47t47 113Z"/>
              </svg>
            </button>
          </div>
          
          <div class="header-actions">
            <button class="icon-btn" @click="clearChat" aria-label="Clear conversation">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="header-icon">
                <path fill="currentColor"
                  d="M9 3h6l1 2h4v2H4V5h4l1-2Zm1 8v7h2v-7h-2Zm4 0v7h2v-7h-2ZM6 9v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V9H6Z" />
              </svg>
            </button>
          </div>
        </div>

        <div class="chat-content-flex">
          <!-- Messages -->
          <div ref="messagesWrap" class="messages" aria-live="polite">
            <div v-for="m in messages" :key="m.id" class="message"
              :class="m.sender === 'user' ? 'from-user' : 'from-bot'">
              <div class="message-bubble">
                <div class="message-text" v-if="m.sender === 'bot'" v-html="m.text"></div>
                <div class="message-text" v-else>{{ m.text }}</div>
                <!-- Show related products if any -->
                <div v-if="m.relatedProducts && m.relatedProducts.length > 0" class="related-products">
                  <div v-for="product in m.relatedProducts.slice(0, 3)" :key="product._id" class="product-card">
                    <div class="product-info">
                      <span class="product-name">{{ product.name }}</span>
                      <span v-if="product.price" class="product-price">${{ product.price }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- Loading indicator -->
            <div v-if="isLoading" class="message from-bot">
              <div class="message-bubble typing">
                <div class="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
          <!-- FAQ and Composer sections remain outside chat-content-flex for correct flex layout -->
        </div>

        <!-- Flow 1: FAQ Selection -->
        <div v-if="currentFlow === 'faq'" class="faq-section">
          <!-- FAQ Categories -->
          <div v-if="showCategories" class="faq-categories">
            <div class="suggestions-title">Browse FAQ Categories</div>
            <button v-for="category in faqCategories" :key="category" class="suggestion-btn"
              @click="selectFAQCategory(category)">
              {{ category }}
            </button>
          </div>

          <!-- Category-specific FAQs -->
          <div v-if="selectedCategory" class="faq-category-section">
            <div class="category-header">
              <button class="back-to-categories-btn" @click="showCategories = true; selectedCategory = null">
                < </button>
                  <h4>{{ selectedCategory }}</h4>
            </div>
            <div class="faqs-list">
              <button v-for="faq in filteredFAQs" :key="faq._id" class="faq-item" @click="selectFAQ(faq)">
                <span class="faq-question">{{ faq.question }}</span>
              </button>
              <div v-if="filteredFAQs.length === 0" class="no-faqs">
                No questions available for this category yet.
              </div>
            </div>
          </div>
        </div>

        <!-- Chat Input for AI and Staff chat modes only -->
        <div v-if="currentFlow === 'chat' || currentFlow === 'staff-chat'" class="composer">
          <input v-model="inputText" class="composer-input" type="text" 
            :placeholder="currentFlow === 'staff-chat' ? 'Message our staff team...' : 'Ask me anything about skincare...'"
            @keydown="onKeydown" :disabled="isLoading" aria-label="Message input" />
          <button class="send-btn" @click="sendMessage" :disabled="isLoading || !inputText.trim()"
            aria-label="Send message">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="send-icon">
              <path fill="currentColor" d="M2 21l21-9L2 3v7l15 2l-15 2z" />
            </svg>
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.chat-root {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 50;
  width: auto;
  height: auto;
}

.chat-fab {
  position: absolute;
  bottom: 0;
  right: 0;
  background: linear-gradient(135deg, #c97f98, #9b4d6b);
  color: white;
  width: 64px;
  height: 64px;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, .18);
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.chat-fab:hover {
  background: linear-gradient(135deg, #b5718a, #8a4460);
  transform: scale(1.05);
}

.icon {
  width: 28px;
  height: 28px;
}

.badge {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 10px;
  height: 10px;
  background: #ff4757;
  border-radius: 9999px;
  border: 2px solid white;
}

.chat-panel {
  position: absolute;
  right: 0;
  bottom: 88px;
  width: 380px;
  max-height: 80vh;
  background: white;
  color: #333;
  border-radius: 24px;
  box-shadow: 0 20px 45px rgba(0, 0, 0, .25);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.chat-content-flex {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  min-height: 0;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.chat-content-flex:hover {
  background-color: rgba(201, 127, 152, 0.05);
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  background: linear-gradient(135deg, #c97f98, #9b4d6b);
  color: white;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.header-title h3 {
  font-size: 18px;
  margin: 0;
  font-weight: 700;
}

.flow-indicator {
  font-size: 12px;
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 8px;
  border-radius: 12px;
}

/* Chat Mode Icons */
.chat-mode-icons {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0 16px;
}

.mode-icon-btn {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mode-icon-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.9);
  transform: translateY(-1px);
}

.mode-icon-btn.active {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-btn {
  background: transparent;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  transition: background 0.2s ease;
}

.icon-btn:hover {
  background: rgba(255, 255, 255, .15);
}

.header-icon {
  width: 18px;
  height: 18px;
}

.messages {
  flex: 1 1 auto;
  overflow-y: auto;
  padding: 16px;
  background: white;
  min-height: 0;
}

.message {
  display: flex;
  margin-bottom: 10px;
}

.message-bubble {
  max-width: 85%;
  padding: 12px 16px;
  border-radius: 14px;
  font-size: 14px;
  line-height: 1.5;
  box-shadow: 0 4px 12px rgba(0, 0, 0, .06);
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.from-user {
  justify-content: flex-end;
}

.from-user .message-bubble {
  background: #c97f98;
  color: white;
  border-bottom-right-radius: 3px;
}

.from-bot .message-bubble {
  background: #F8EAE1;
  /* other choice light grey #f1f3f5 */
  color: #671C39;
  border-bottom-left-radius: 3px;
  white-space: pre-line;
  word-wrap: break-word;
  line-height: 1.6;
}

/* Improve readability for long bot messages */
.from-bot .message-bubble p {
  margin: 0 0 8px 0;
}

.from-bot .message-bubble p:last-child {
  margin-bottom: 0;
}

/* Style for product mentions and prices */
.from-bot .message-bubble strong {
  font-weight: 600;
  color: #8C3154;
}

/* Add some spacing for better readability */
.from-bot .message-bubble {
  text-align: left;
}

/* Styles for rendered HTML inside messages: higher specificity to override resets */
.message-bubble .message-text {
  line-height: 1.72;
}

.message-bubble .message-text p {
  display: block;
  margin: 0 0 14px 0 !important;
  color: inherit;
}

.message-bubble .message-text p:last-child {
  margin-bottom: 0 !important;
}

/* ensure consecutive paragraphs have visible gap */
.message-bubble .message-text p+p {
  margin-top: 14px !important;
}

/* The bot message HTML is injected via v-html, so those <p> elements do not
   receive the component's scoped attribute. Use the deep selector so the
   rules apply to injected markup and ensure clear paragraph spacing. */
.message-bubble :deep(p) {
  display: block;
  margin: 0 0 14px 0;
  color: inherit;
  line-height: 1.72;
}

.message-bubble :deep(p:last-child) {
  margin-bottom: 0;
}

.message-bubble :deep(p + p) {
  margin-top: 14px;
}

.message-bubble .message-text strong {
  font-weight: 700;
  color: #8C3154;
}

.message-bubble .message-text em {
  font-style: italic;
  color: #5a2a3a;
}

.typing {
  background: #f1f3f5 !important;
}

.typing-dots {
  display: flex;
  gap: 4px;
}

.typing-dots span {
  width: 6px;
  height: 6px;
  background: #c97f98;
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {

  0%,
  80%,
  100% {
    transform: scale(0.8);
    opacity: 0.5;
  }

  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.related-products {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.product-card {
  margin: 4px 0;
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
}

.product-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-name {
  font-size: 12px;
  font-weight: 500;
}

.product-price {
  font-size: 12px;
  color: #c97f98;
  font-weight: 600;
}

.faq-section {
  padding: 16px;
  background: white;
}

.suggestions-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
}

.suggestion-btn {
  display: block;
  width: 100%;
  text-align: left;
  padding: 8px 12px;
  margin: 4px 0;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 13px;
}

.suggestion-btn:hover {
  background: #FDF6F0;
  border-color: #c97f98;
}

.faqs-list {
  max-height: 200px;
  overflow-y: auto;
}

.faq-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  text-align: left;
  padding: 8px 12px;
  margin: 4px 0;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.faq-item:hover {
  background: #FDF6F0;
  border-color: #c97f98;
}

.faq-question {
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 2px;
}

.faq-category-section {
  margin-bottom: 16px;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.category-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #8C3154;
}

.back-to-categories-btn {
  background: #F8EAE1;
  color: #671C39;
  padding: 4px 8px;
  border-radius: 16px;
  /* define an explicit border so border-color changes are visible */
  border: 1px solid #F8EAE1;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.15s ease;
}

.back-to-categories-btn:hover {
  /* change border color on hover and slightly darken background for feedback */
  border-color: #671C39;
  background: #F4DCD8;
}

.no-faqs {
  text-align: center;
  padding: 20px;
  color: #666;
  font-style: italic;
  font-size: 14px;
}

.composer {
  display: flex;
  gap: 8px;
  padding: 12px;
  background: #fff;
}

.composer-input {
  flex: 1;
  border: 1px solid #e9ecef;
  background: #fff;
  border-radius: 12px;
  padding: 10px 12px;
  outline: none;
  font-size: 14px;
}

.composer-input:focus {
  border-color: #c97f98;
  box-shadow: 0 0 0 2px rgba(201, 127, 152, .25);
}

.composer-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.send-btn {
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #c97f98, #9b4d6b);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 18px rgba(0, 0, 0, .12);
  transition: all 0.2s ease;
}

.send-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #b5718a, #8a4460);
  transform: translateY(-1px);
}

.send-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.send-icon {
  width: 20px;
  height: 20px;
}

.chat-slide-enter-active,
.chat-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.chat-slide-enter-from,
.chat-slide-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}
</style>
