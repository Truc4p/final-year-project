import { API_BASE_URL } from '../constants';

// LivestreamService for handling WebSocket connections and livestream APIs
class LivestreamService {
  constructor() {
    this.ws = null;
    this.isConnected = false;
    this.connectionType = 'customer';
    this.messageHandlers = new Set();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectTimeout = null;
    this.peerId = null;
    this.isWebRTCInitialized = false;
  }

  // Generate session ID for anonymous users
  getUserSessionId() {
    let sessionId = null;
    // In React Native, we'll generate a session ID
    // AsyncStorage would be used in a real implementation
    if (!sessionId) {
      sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    return sessionId;
  }

  // Connect to WebSocket server
  connectWebSocket(token = null) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    const wsUrl = API_BASE_URL.replace('http', 'ws');
    console.log('Connecting to WebSocket:', wsUrl);

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('✅ WebSocket connected as customer');
        this.isConnected = true;
        this.reconnectAttempts = 0;

        // Register as customer
        this.sendMessage({
          type: 'register',
          sessionId: this.getUserSessionId(),
          token: token,
        });
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📨 WebSocket message received:', data.type);
          
          // Notify all registered handlers
          this.messageHandlers.forEach((handler) => handler(data));
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.isConnected = false;
        this.ws = null;

        // Attempt to reconnect
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
          console.log(`Reconnecting in ${delay}ms... (attempt ${this.reconnectAttempts})`);
          
          this.reconnectTimeout = setTimeout(() => {
            this.connectWebSocket(token);
          }, delay);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  }

  // Disconnect WebSocket
  disconnectWebSocket() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.isConnected = false;
    }
    
    this.messageHandlers.clear();
    this.reconnectAttempts = 0;
  }

  // Register message handler
  addMessageHandler(handler) {
    console.log('📝 Registering WebSocket message handler');
    this.messageHandlers.add(handler);
    return () => {
      console.log('📝 Unregistering WebSocket message handler');
      this.messageHandlers.delete(handler);
    };
  }

  // Send message via WebSocket
  sendMessage(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
      return true;
    }
    console.warn('WebSocket not connected, cannot send message');
    return false;
  }

  // Send chat message
  sendChatMessage(message, username = 'Customer') {
    return this.sendMessage({
      type: 'chat_message',
      id: Date.now(),
      username: username,
      message: message,
      timestamp: new Date().toISOString(),
      isAdmin: false,
    });
  }

  // Toggle like
  toggleLike(userId, sessionId) {
    return this.sendMessage({
      type: 'toggle_like',
      userId: userId,
      sessionId: sessionId,
    });
  }

  // API Methods
  async getActiveStream() {
    console.log('📡 API: Fetching active stream from:', `${API_BASE_URL}/livestreams/active`);
    try {
      const response = await fetch(`${API_BASE_URL}/livestreams/active`);
      console.log('📡 API: Active stream response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📡 API: Active stream data:', JSON.stringify(data, null, 2));
        return data.livestream;
      }
      console.log('📡 API: No active stream (response not ok)');
      return null;
    } catch (error) {
      console.error('📡 API: Error fetching active stream:', error);
      return null;
    }
  }

  async getPastStreams(limit = 12) {
    try {
      const response = await fetch(`${API_BASE_URL}/livestreams/past?limit=${limit}`);
      if (response.ok) {
        const data = await response.json();
        return data.livestreams;
      }
      return [];
    } catch (error) {
      console.error('Error fetching past streams:', error);
      return [];
    }
  }

  async getPinnedProducts(streamId) {
    try {
      const response = await fetch(`${API_BASE_URL}/livestreams/${streamId}/pinned-products`);
      if (response.ok) {
        const data = await response.json();
        return data.pinnedProducts || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching pinned products:', error);
      return [];
    }
  }

  async incrementViewCount(streamId) {
    try {
      await fetch(`${API_BASE_URL}/livestreams/${streamId}/view`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  }

  // Format duration helper
  formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  // Clean up
  cleanup() {
    this.disconnectWebSocket();
  }
}

// Export singleton instance
export const livestreamService = new LivestreamService();
export default livestreamService;
