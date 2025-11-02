import { API_BASE_URL } from '../constants';
import { RTCPeerConnection, RTCIceCandidate, RTCSessionDescription, mediaDevices } from 'react-native-webrtc';

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
    
    // WebRTC properties
    this.peerConnection = null;
    this.remoteStream = null;
    this.iceServers = [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ];
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
          
          // Handle WebRTC signaling messages internally
          if (data.type === 'webrtc_offer') {
            console.log('📡 Received WebRTC offer');
            this.handleWebRTCOffer(data.from, data.offer);
          } else if (data.type === 'webrtc_ice_candidate') {
            console.log('🧊 Received ICE candidate');
            this.handleWebRTCIceCandidate(data.from, data.candidate);
          } else if (data.type === 'webrtc_broadcaster_available') {
            console.log('🎥 Broadcaster available');
            this.handleBroadcasterAvailable(data.broadcaster);
          } else if (data.type === 'webrtc_broadcast_stopped') {
            console.log('⏹️ Broadcast stopped');
            this.handleBroadcastStopped(data.broadcasterId);
          } else if (data.type === 'registered') {
            console.log('✅ Registered with server, initializing WebRTC');
            // Initialize WebRTC after successful registration
            this.initializeWebRTC();
          }
          
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
    this.cleanupWebRTC();
  }

  // WebRTC Methods
  generatePeerId() {
    this.peerId = `customer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    console.log('🆔 Generated peer ID:', this.peerId);
    return this.peerId;
  }

  async initializeWebRTC() {
    if (this.isWebRTCInitialized) {
      console.log('ℹ️ WebRTC already initialized');
      return;
    }

    this.generatePeerId();
    console.log('🎥 Initializing WebRTC as customer with peer ID:', this.peerId);

    // Register with signaling server
    this.sendMessage({
      type: 'webrtc_register',
      peerId: this.peerId,
      userType: 'customer'
    });

    this.isWebRTCInitialized = true;
  }

  createPeerConnection() {
    if (this.peerConnection) {
      console.log('♻️ Peer connection already exists, cleaning up old one');
      this.cleanupWebRTC();
    }

    console.log('🔗 Creating peer connection with ICE servers:', this.iceServers);
    
    this.peerConnection = new RTCPeerConnection({
      iceServers: this.iceServers
    });

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('🧊 Sending ICE candidate to broadcaster');
        this.sendMessage({
          type: 'webrtc_ice_candidate',
          from: this.peerId,
          candidate: event.candidate
        });
      }
    };

    // Handle remote stream
    this.peerConnection.ontrack = (event) => {
      console.log('📺 Received remote stream track:', event.track.kind);
      const [remoteStream] = event.streams;
      
      if (remoteStream) {
        console.log('✅ Setting remote stream:', {
          streamId: remoteStream.id,
          active: remoteStream.active,
          videoTracks: remoteStream.getVideoTracks().length,
          audioTracks: remoteStream.getAudioTracks().length
        });
        
        this.remoteStream = remoteStream;
        
        // Notify handlers that remote stream is available
        this.messageHandlers.forEach(handler => {
          handler({
            type: 'remote_stream_ready',
            stream: remoteStream
          });
        });
      }
    };

    // Handle connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      console.log('🔗 Connection state:', this.peerConnection.connectionState);
      
      if (this.peerConnection.connectionState === 'failed') {
        console.error('❌ Connection failed, attempting to recreate');
        this.cleanupWebRTC();
        this.initializeWebRTC();
      }
    };

    // Handle ICE connection state
    this.peerConnection.oniceconnectionstatechange = () => {
      console.log('🧊 ICE connection state:', this.peerConnection.iceConnectionState);
    };

    return this.peerConnection;
  }

  async handleWebRTCOffer(fromPeerId, offer) {
    console.log('📥 Handling WebRTC offer from:', fromPeerId);
    
    try {
      // Create peer connection if not exists
      if (!this.peerConnection) {
        this.createPeerConnection();
      }

      // Set remote description
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      console.log('✅ Remote description set');

      // Create answer
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      console.log('✅ Local description set, sending answer');

      // Send answer back
      this.sendMessage({
        type: 'webrtc_answer',
        from: this.peerId,
        to: fromPeerId,
        answer: answer
      });
    } catch (error) {
      console.error('❌ Error handling offer:', error);
    }
  }

  async handleWebRTCIceCandidate(fromPeerId, candidate) {
    console.log('🧊 Handling ICE candidate from:', fromPeerId);
    
    if (this.peerConnection) {
      try {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        console.log('✅ ICE candidate added');
      } catch (error) {
        console.error('❌ Error adding ICE candidate:', error);
      }
    } else {
      console.warn('⚠️ No peer connection to add ICE candidate');
    }
  }

  handleBroadcasterAvailable(broadcasterId) {
    console.log('🎥 Broadcaster available:', broadcasterId);
    // Customer will receive offers from broadcaster automatically
  }

  handleBroadcastStopped(broadcasterId) {
    console.log('⏹️ Broadcast stopped by:', broadcasterId);
    this.cleanupWebRTC();
  }

  cleanupWebRTC() {
    console.log('🧹 Cleaning up WebRTC resources');
    
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    
    this.remoteStream = null;
    this.isWebRTCInitialized = false;
  }

  getRemoteStream() {
    return this.remoteStream;
  }
}

// Export singleton instance
export const livestreamService = new LivestreamService();
export default livestreamService;
