import { API_BASE_URL, WS_BASE_URL } from '../constants';
import api from './api';

class LivestreamService {
  constructor() {
    this.ws = null;
    this.messageHandlers = [];
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
  }

  // WebSocket Connection
  connectWebSocket(token) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    try {
      const wsUrl = `${WS_BASE_URL}?token=${encodeURIComponent(token)}&role=admin`;
      console.log('📡 Connecting to WebSocket:', wsUrl);

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('✅ WebSocket connected successfully');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📨 WebSocket message received:', data.type);
          this.messageHandlers.forEach((handler) => handler(data));
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
      };

      this.ws.onclose = (event) => {
        console.log('🔌 WebSocket closed:', event.code, event.reason);
        this.attemptReconnect(token);
      };
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
    }
  }

  attemptReconnect(token) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Reconnecting... Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      setTimeout(() => {
        this.connectWebSocket(token);
      }, this.reconnectDelay);
    } else {
      console.error('❌ Max reconnection attempts reached');
    }
  }

  disconnectWebSocket() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      console.log('🔌 WebSocket disconnected');
    }
  }

  addMessageHandler(handler) {
    this.messageHandlers.push(handler);
  }

  removeMessageHandler(handler) {
    this.messageHandlers = this.messageHandlers.filter((h) => h !== handler);
  }

  sendMessage(type, data) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, ...data }));
      console.log('📤 Sent WebSocket message:', type);
    } else {
      console.error('❌ WebSocket not connected');
    }
  }

  // API Calls
  async login(username, password) {
    try {
      const response = await api.post('/auth/login', { username, password });
      console.log('Login response:', response.data);
      
      // Check if user has admin role
      if (response.data.token && response.data.role === 'admin') {
        return {
          token: response.data.token,
          user: {
            id: response.data.userId,
            role: response.data.role
          }
        };
      } else {
        throw new Error('Not authorized as admin');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async createLivestream(data) {
    try {
      const response = await api.post('/livestreams', data);
      return response.data;
    } catch (error) {
      console.error('Create livestream error:', error);
      throw error;
    }
  }

  async stopLivestream(streamId, data) {
    try {
      const response = await api.post(`/livestreams/${streamId}/stop`, data);
      return response.data;
    } catch (error) {
      console.error('Stop livestream error:', error);
      throw error;
    }
  }

  async uploadVideo(streamId, videoUri) {
    try {
      const formData = new FormData();
      formData.append('video', {
        uri: videoUri,
        type: 'video/mp4',
        name: `stream-${streamId}-${Date.now()}.mp4`,
      });

      const response = await api.post(`/livestreams/${streamId}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Upload video error:', error);
      throw error;
    }
  }

  async getProducts() {
    try {
      const response = await api.get('/products');
      return response.data;
    } catch (error) {
      console.error('Get products error:', error);
      throw error;
    }
  }

  async pinProduct(streamId, productId) {
    try {
      const response = await api.post(`/livestreams/${streamId}/pin-product`, {
        productId,
      });
      return response.data;
    } catch (error) {
      console.error('Pin product error:', error);
      throw error;
    }
  }

  async unpinProduct(streamId, productId) {
    try {
      const response = await api.delete(`/livestreams/${streamId}/pin-product/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Unpin product error:', error);
      throw error;
    }
  }

  // WebSocket Actions
  startStream(streamId) {
    this.sendMessage('start_stream', { streamId });
  }

  stopStream(streamId) {
    this.sendMessage('stop_stream', { streamId });
  }

  sendChatMessage(message) {
    this.sendMessage('chat_message', { message, isAdmin: true });
  }

  updateStreamStats(viewerCount, likes) {
    this.sendMessage('stream_update', { viewerCount, likes });
  }
}

export default new LivestreamService();
