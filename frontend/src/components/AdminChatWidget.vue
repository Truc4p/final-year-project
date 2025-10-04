<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, computed } from 'vue';

const API_BASE_URL = 'http://localhost:3000';

const isOpen = ref(false);
const hasNewMessage = ref(false);
const isLoading = ref(false);

// Admin chat state
const activeChats = ref([]);
const selectedChatId = ref(null);
const messages = ref([]);
const inputText = ref('');
const messagesWrap = ref(null);
const selectedCustomer = ref(null);

// Auth state
const isAuthenticated = ref(false);
const authError = ref(null);

// WebSocket connection for real-time admin messaging
let adminWebSocket = null;
let wsReconnectInterval = null;

// Get selected chat data
const selectedChat = computed(() => {
  return activeChats.value.find(chat => chat.sessionId === selectedChatId.value);
});

// Get auth headers
function getAuthHeaders() {
  const token = localStorage.getItem('token');
  if (!token) {
    authError.value = 'No authentication token found';
    isAuthenticated.value = false;
    return null;
  }
  
  isAuthenticated.value = true;
  authError.value = null;
  
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}

// Check authentication
function checkAuth() {
  const token = localStorage.getItem('token');
  if (!token) {
    isAuthenticated.value = false;
    authError.value = 'Please log in to access staff chat';
    return false;
  }

  // Check if token is expired
  try {
    const tokenPayload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    
    if (tokenPayload.exp < currentTime) {
      localStorage.removeItem('token');
      isAuthenticated.value = false;
      authError.value = 'Session expired. Please log in again.';
      return false;
    }
  } catch (error) {
    console.error('Error parsing token:', error);
    isAuthenticated.value = false;
    authError.value = 'Invalid authentication token';
    return false;
  }

  isAuthenticated.value = true;
  authError.value = null;
  return true;
}

// Initialize admin chat
async function initializeAdminChat() {
  if (!checkAuth()) {
    return;
  }
  await loadActiveChats();
  connectAdminWebSocket();
}

// Load active customer chats
async function loadActiveChats() {
  try {
    const headers = getAuthHeaders();
    if (!headers) return;

    const response = await fetch(`${API_BASE_URL}/chat/admin/active-chats`, {
      headers
    });
    
    if (response.status === 401) {
      authError.value = 'Unauthorized access. Please log in as admin.';
      isAuthenticated.value = false;
      return;
    }
    
    const result = await response.json();
    if (result.success) {
      const previouslyActive = activeChats.value.map(chat => chat.sessionId);
      activeChats.value = result.data;
      
      // Check for new chats
      const newChats = activeChats.value.filter(chat => !previouslyActive.includes(chat.sessionId));
      if (newChats.length > 0 && !isOpen.value) {
        hasNewMessage.value = true;
      }
    }
  } catch (error) {
    console.error('Error loading active chats:', error);
    authError.value = 'Failed to load active chats';
  }
}

// Load messages for a specific chat
async function loadChatMessages(sessionId) {
  try {
    const headers = getAuthHeaders();
    if (!headers) return;

    const response = await fetch(`${API_BASE_URL}/chat/admin/messages/${sessionId}`, {
      headers
    });
    
    if (response.status === 401) {
      authError.value = 'Unauthorized access';
      return;
    }
    
    const result = await response.json();
    if (result.success) {
      // Filter out AI messages - only show user messages and staff replies
      const filteredMessages = result.data.messages.filter(msg => {
        // Show user messages and staff messages, but not AI/predefined messages
        return msg.role === 'user' || (msg.role === 'assistant' && msg.messageType === 'staff');
      });
      
      messages.value = filteredMessages.map((msg, index) => ({
        id: index + 1,
        sender: msg.role === 'user' ? 'customer' : 'staff',
        text: msg.content,
        timestamp: new Date(msg.timestamp),
        messageType: msg.messageType
      }));
      
      // Store customer information
      selectedCustomer.value = result.data.customer;
      
      scrollToBottom();
    }
  } catch (error) {
    console.error('Error loading chat messages:', error);
  }
}

// Select a chat
function selectChat(sessionId) {
  selectedChatId.value = sessionId;
  loadChatMessages(sessionId);
  
  // Mark chat as read
  const chat = activeChats.value.find(c => c.sessionId === sessionId);
  if (chat) {
    chat.unreadCount = 0;
  }
}

// Send message to customer
async function sendMessage() {
  const text = inputText.value.trim();
  if (!text || !selectedChatId.value) return;

  const headers = getAuthHeaders();
  if (!headers) return;

  inputText.value = '';
  isLoading.value = true;

  try {
    const response = await fetch(`${API_BASE_URL}/chat/admin/reply`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        sessionId: selectedChatId.value,
        message: text
      })
    });

    if (response.status === 401) {
      authError.value = 'Unauthorized access';
      addStaffMessage("Authentication error. Please log in again.");
      return;
    }

    const result = await response.json();
    if (!result.success) {
      addStaffMessage("Failed to send message. Please try again.");
    } else {
      // Message sent successfully - add to UI immediately
      addStaffMessage(text);
      // Customer will receive it via their WebSocket connection
    }
  } catch (error) {
    console.error('Error sending message:', error);
    addStaffMessage("Failed to send message. Please try again.");
  } finally {
    isLoading.value = false;
  }
}

// Add staff message to chat
function addStaffMessage(text) {
  messages.value.push({
    id: Date.now(),
    sender: 'staff',
    text: text,
    timestamp: new Date(),
    messageType: 'text'
  });
  scrollToBottom();
}

// WebSocket connection for real-time admin messaging
function connectAdminWebSocket() {
  if (adminWebSocket && adminWebSocket.readyState === WebSocket.OPEN) {
    return; // Already connected
  }

  if (!isAuthenticated.value) {
    console.log('⚠️ Cannot connect admin WebSocket - not authenticated');
    return;
  }

  try {
    // Connect to WebSocket server
    adminWebSocket = new WebSocket('ws://localhost:8080');
    
    adminWebSocket.onopen = () => {
      console.log('🔌 Admin WebSocket connected');
      clearInterval(wsReconnectInterval);
      
      // Register as admin with token
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('⚠️ No admin token found');
        adminWebSocket.close();
        return;
      }

      try {
        // Decode the JWT token to get user ID
        const parts = token.split('.');
        if (parts.length !== 3) {
          throw new Error('Invalid token format');
        }
        
        const payload = parts[1];
        // Add padding if needed for base64 decoding
        const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
        const decoded = JSON.parse(atob(paddedPayload));
        
        if (!decoded.user || !decoded.user.id || !decoded.user.role) {
          throw new Error('Token missing required fields');
        }
        
        console.log('📝 Registering admin with WebSocket:', {
          userId: decoded.user.id,
          role: decoded.user.role,
          username: decoded.user.username,
          tokenPresent: !!token
        });
        
        adminWebSocket.send(JSON.stringify({
          type: 'register_admin',
          userId: decoded.user.id,
          token: token
        }));
      } catch (error) {
        console.error('❌ Error decoding admin token:', error);
        adminWebSocket.close();
      }
    };
    
    adminWebSocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📨 Admin WebSocket message received:', data);
        
        if (data.type === 'customer_message') {
          handleNewCustomerMessage(data);
        } else if (data.type === 'admin_registered') {
          console.log('✅ Admin WebSocket registered successfully');
        }
      } catch (error) {
        console.error('Error parsing admin WebSocket message:', error);
      }
    };
    
    adminWebSocket.onclose = () => {
      console.log('🔌 Admin WebSocket disconnected');
      adminWebSocket = null;
      
      // Attempt to reconnect if still authenticated and open
      if (isAuthenticated.value && isOpen.value) {
        console.log('🔄 Attempting admin WebSocket reconnection...');
        wsReconnectInterval = setInterval(() => {
          if (isAuthenticated.value && isOpen.value) {
            connectAdminWebSocket();
          } else {
            clearInterval(wsReconnectInterval);
          }
        }, 3000);
      }
    };
    
    adminWebSocket.onerror = (error) => {
      console.error('Admin WebSocket error:', error);
    };
    
  } catch (error) {
    console.error('Error connecting admin WebSocket:', error);
  }
}

// Disconnect admin WebSocket
function disconnectAdminWebSocket() {
  if (wsReconnectInterval) {
    clearInterval(wsReconnectInterval);
    wsReconnectInterval = null;
  }
  
  if (adminWebSocket) {
    adminWebSocket.close();
    adminWebSocket = null;
  }
}

// Handle incoming customer message via WebSocket
function handleNewCustomerMessage(data) {
  const { sessionId, message, timestamp } = data;
  
  // Find the chat session
  const chatIndex = activeChats.value.findIndex(chat => chat.sessionId === sessionId);
  if (chatIndex !== -1) {
    // Update last activity
    activeChats.value[chatIndex].lastActivity = new Date(timestamp);
    activeChats.value[chatIndex].hasUnreadFromCustomer = true;
    
    // If this chat is currently selected, add the message to the UI
    if (selectedChatId.value === sessionId) {
      messages.value.push({
        id: messages.value.length + 1,
        sender: 'customer',
        text: message,
        timestamp: new Date(timestamp)
      });
      scrollToBottom();
    }
    
    // Move this chat to the top of the list
    const chat = activeChats.value.splice(chatIndex, 1)[0];
    activeChats.value.unshift(chat);
    
    // Show notification if not currently viewing this chat
    if (selectedChatId.value !== sessionId) {
      hasNewMessage.value = true;
    }
  } else {
    // New chat session - reload active chats to include it
    loadActiveChats();
  }
}

function toggle() {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    hasNewMessage.value = false;
    initializeAdminChat();
  } else {
    disconnectAdminWebSocket();
  }
}

function outsideClose(e) {
  if (!isOpen.value) return;
  const panel = document.getElementById('admin-chat-panel');
  const button = document.getElementById('admin-chat-button');
  if (panel && !panel.contains(e.target) && button && !button.contains(e.target)) {
    isOpen.value = false;
    disconnectAdminWebSocket();
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

// Format timestamp
function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Get unread count for all chats
const totalUnreadCount = computed(() => {
  return activeChats.value.reduce((total, chat) => total + (chat.unreadCount || 0), 0);
});

onMounted(() => {
  document.addEventListener('click', outsideClose);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', outsideClose);
  disconnectAdminWebSocket();
});
</script>

<template>
  <div class="admin-chat-root">
    <!-- Floating Button -->
    <button id="admin-chat-button" class="admin-chat-fab" @click.stop="toggle" aria-label="Open admin chat">
      <svg v-if="!isOpen" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="icon">
        <path fill="currentColor"
          d="M12 3C6.477 3 2 6.94 2 11.8c0 2.45 1.204 4.66 3.162 6.23V22l3.6-1.98c1.002.28 2.07.43 3.238.43 5.523 0 10-3.94 10-8.85S17.523 3 12 3Z" />
      </svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="icon">
        <path fill="currentColor"
          d="M7.05 7.05a1 1 0 0 1 1.414 0L12 10.586l3.536-3.536a1 1 0 1 1 1.414 1.414L13.414 12l3.536 3.536a1 1 0 0 1-1.414 1.414L12 13.414l-3.536 3.536a1 1 0 0 1-1.414-1.414L10.586 12 7.05 8.464a1 1 0 0 1 0-1.414Z" />
      </svg>
      <span v-if="totalUnreadCount > 0" class="badge">{{ totalUnreadCount }}</span>
    </button>

    <!-- Admin Chat Panel -->
    <transition name="chat-slide">
      <div v-if="isOpen" id="admin-chat-panel" class="admin-chat-panel" @click.stop>
        <div class="chat-header">
          <div class="header-title">
            <h3 class="text-white">Staff Chat</h3>
            <span class="flow-indicator">{{ isAuthenticated ? activeChats.length + ' Active Chats' : 'Authentication Required' }}</span>
          </div>
        </div>

        <div class="admin-chat-content">
          <!-- Authentication Error -->
          <div v-if="!isAuthenticated && authError" class="auth-error">
            <div class="auth-error-content">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="auth-error-icon">
                <path fill="currentColor"
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              <h3>Authentication Required</h3>
              <p>{{ authError }}</p>
              <button @click="checkAuth" class="retry-btn">Retry</button>
            </div>
          </div>
          <!-- Chat List Sidebar -->
          <div v-if="isAuthenticated" class="chat-list-sidebar">
            <div class="sidebar-header">
              <h4>Customer Chats</h4>
            </div>
            <div class="chat-list">
              <div 
                v-for="chat in activeChats" 
                :key="chat.sessionId"
                class="chat-item"
                :class="{ 'active': selectedChatId === chat.sessionId }"
                @click="selectChat(chat.sessionId)"
              >
                <div class="chat-item-content">
                  <div class="chat-customer">
                    <span class="customer-id">{{ chat.customerName || 'Anonymous' }}</span>
                    <span class="chat-time">{{ formatTime(chat.lastActivity) }}</span>
                  </div>
                  <div class="last-message">{{ chat.lastMessage || 'No messages yet' }}</div>
                  <span v-if="chat.unreadCount > 0" class="unread-badge">{{ chat.unreadCount }}</span>
                </div>
              </div>
              <div v-if="activeChats.length === 0" class="no-chats">
                No active customer chats
              </div>
            </div>
          </div>

          <!-- Chat Messages Area -->
          <div v-if="isAuthenticated" class="chat-messages-area">
            <div v-if="!selectedChatId" class="no-chat-selected">
              <div class="no-chat-content">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="no-chat-icon">
                  <path fill="currentColor"
                    d="M12 3C6.477 3 2 6.94 2 11.8c0 2.45 1.204 4.66 3.162 6.23V22l3.6-1.98c1.002.28 2.07.43 3.238.43 5.523 0 10-3.94 10-8.85S17.523 3 12 3Z" />
                </svg>
                <h3>Select a chat to start messaging</h3>
                <p>Choose a customer conversation from the sidebar</p>
              </div>
            </div>

            <div v-else class="chat-conversation">
              <!-- Customer Info Header -->
              <div v-if="selectedCustomer" class="customer-info-header">
                <div class="customer-details">
                  <div class="customer-text">
                    <h4 class="customer-name">{{ selectedCustomer.name }}</h4>
                    <p v-if="selectedCustomer.email" class="customer-email">{{ selectedCustomer.email }}</p>
                    <p v-else class="customer-status">Anonymous Customer</p>
                  </div>
                </div>
              </div>
              
              <!-- Chat Messages -->
              <div ref="messagesWrap" class="messages" aria-live="polite">
                <div v-for="m in messages" :key="m.id" class="message"
                  :class="m.sender === 'customer' ? 'from-customer' : 'from-staff'">
                  <div class="message-bubble">
                    <div class="message-text">{{ m.text }}</div>
                    <div class="message-time">{{ formatTime(m.timestamp) }}</div>
                  </div>
                </div>
                <!-- Loading indicator -->
                <div v-if="isLoading" class="message from-staff">
                  <div class="message-bubble typing">
                    <div class="typing-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Message Composer -->
              <div class="composer">
                <input 
                  v-model="inputText" 
                  class="composer-input" 
                  type="text" 
                  placeholder="Type your message..."
                  @keydown="onKeydown" 
                  :disabled="isLoading" 
                  aria-label="Message input" 
                />
                <button 
                  class="send-btn" 
                  @click="sendMessage" 
                  :disabled="isLoading || !inputText.trim()"
                  aria-label="Send message"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="send-icon">
                    <path fill="currentColor" d="M2 21l21-9L2 3v7l15 2l-15 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.admin-chat-root {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 50;
  width: auto;
  height: auto;
}

.admin-chat-fab {
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

.admin-chat-fab:hover {
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
  min-width: 18px;
  height: 18px;
  background: #ef4444;
  border-radius: 9999px;
  border: 2px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  color: white;
  padding: 0 4px;
}

.admin-chat-panel {
  position: absolute;
  right: 0;
  bottom: 88px;
  width: 600px;
  height: 500px;
  background: white;
  color: #333;
  border-radius: 16px;
  box-shadow: 0 20px 45px rgba(0, 0, 0, .25);
  overflow: hidden;
  display: flex;
  flex-direction: column;
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

.admin-chat-content {
  display: flex;
  flex: 1;
  min-height: 0;
}

.auth-error {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fef2f2;
  padding: 2rem;
}

.auth-error-content {
  text-align: center;
  max-width: 300px;
}

.auth-error-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 16px;
  color: #ef4444;
}

.auth-error h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #dc2626;
  font-weight: 600;
}

.auth-error p {
  margin: 0 0 16px 0;
  color: #7f1d1d;
  font-size: 14px;
  line-height: 1.5;
}

.retry-btn {
  background: #dc2626;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.retry-btn:hover {
  background: #b91c1c;
}

.chat-list-sidebar {
  width: 200px;
  border-right: 1px solid var(--primary-300);
  background: #f9fafb;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 12px;
  border-bottom: 1px solid var(--primary-300);
  background: white;
}

.sidebar-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: var(--primary-700);
}

.chat-list {
  flex: 1;
  overflow-y: auto;
}

.chat-item {
  background: white;
  padding: 12px;
  border-bottom: 1px solid var(--primary-300);
  cursor: pointer;
  transition: background-color 0.2s ease;
  position: relative;
}

.chat-item:hover {
  background: var(--primary-100);
}

.chat-item.active {
  background: var(--primary-100);
}

.chat-item-content {
  position: relative;
}

.chat-customer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.customer-id {
  font-weight: 600;
  font-size: 13px;
  color: var(--primary-700);
}

.chat-time {
  font-size: 11px;
  color: var(--primary-600);
}

.last-message {
  font-size: 12px;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
}

.unread-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ef4444;
  color: white;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.no-chats {
  padding: 20px;
  text-align: center;
  color: #6b7280;
  font-size: 14px;
}

.chat-messages-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.no-chat-selected {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-50);
}

.no-chat-content {
  text-align: center;
  color: #6b7280;
}

.no-chat-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 16px;
  opacity: 0.5;
  color: var(--primary-600);
}

.no-chat-content h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: var(--primary-700);
}

.no-chat-content p {
  margin: 0;
  font-size: 14px;
}

.chat-conversation {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

/* Customer Info Header Styles */
.customer-info-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--primary-100);
  border-bottom: 1px solid var(--primary-300);
}

.customer-details {
  display: flex;
  align-items: center;
  gap: 12px;
}

.customer-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.customer-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--primary-700);
  margin: 0;
}

.customer-email {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
}

.customer-status {
  font-size: 12px;
  color: #9ca3af;
  margin: 0;
  font-style: italic;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: white;
}

.message {
  display: flex;
  margin-bottom: 12px;
}

.message-bubble {
  max-width: 80%;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.4;
  position: relative;
}

.from-customer {
  justify-content: flex-start;
}

.from-customer .message-bubble {
  background: #F8EAE1;
  color: #671C39;
  border-bottom-left-radius: 3px;
}

.from-staff {
  justify-content: flex-end;
}

.from-staff .message-bubble {
  background: #c97f98;
  color: white;
  border-bottom-right-radius: 3px;
}

.message-text {
  margin-bottom: 4px;
}

.message-time {
  font-size: 11px;
  opacity: 0.7;
}

.typing {
  background: #f3f4f6 !important;
}

.typing-dots {
  display: flex;
  gap: 4px;
}

.typing-dots span {
  width: 6px;
  height: 6px;
  background: #6b7280;
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
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.composer {
  display: flex;
  gap: 8px;
  padding: 12px;
  background: white;
}

.composer-input {
  flex: 1;
  border: 1px solid var(--primary-300);
  background: white;
  border-radius: 8px;
  padding: 8px 12px;
  outline: none;
  font-size: 14px;
}

.composer-input:focus {
  border-color: #9b4d6e;
  box-shadow: 0 0 0 2px rgba(250, 201, 236, 0.25);
}

.composer-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.send-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #c97f98, #9b4d6e);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.send-btn:hover:not(:disabled) {
  background: #9b4d6e;
}

.send-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.send-icon {
  width: 16px;
  height: 16px;
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