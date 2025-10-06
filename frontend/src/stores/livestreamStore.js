// Livestream store with WebSocket support for real-time communication
// between admin and customer interfaces

import { reactive } from 'vue'

export const livestreamStore = reactive({
  // WebSocket connection
  ws: null,
  isConnected: false,
  connectionType: null, // 'admin' or 'customer'
  
  // Admin stream state
  isAdminStreaming: false,
  adminStreamData: {
    title: '',
    description: '',
    startTime: null,
    viewerCount: 0,
    likes: 0,
    likedBy: [], // Array of user IDs/session IDs who have liked
    streamUrl: '', // This will be a blob URL or MediaStream reference
    quality: '720p'
  },
  
  // Store the actual MediaStream for sharing
  sharedMediaStream: null,
  
  // Chat messages shared between admin and customers
  chatMessages: [],
  
  // Pinned products for the current livestream
  pinnedProducts: [],
  
  // WebRTC properties
  webrtcPeerConnections: new Map(), // Map of peer connections
  localMediaStream: null,
  remoteMediaStreams: new Map(), // Map of remote streams from other peers
  peerId: null, // Unique identifier for this peer
  webrtcInitialized: false, // Track if WebRTC has been initialized
  isWebRTCSupported: typeof RTCPeerConnection !== 'undefined',
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ],
  
  // WebSocket connection management
  connectWebSocket(type = 'customer', token = null) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    try {
      this.ws = new WebSocket('ws://localhost:8080');
      this.connectionType = type;
      
      this.ws.onopen = () => {
        console.log('WebSocket connected as', type);
        this.isConnected = true;
        
        // Register connection with backend
        if (type === 'admin') {
          this.ws.send(JSON.stringify({
            type: 'register_admin',
            userId: 'admin', // In real app, get from auth
            token: token
          }));
        } else {
          this.ws.send(JSON.stringify({
            type: 'register',
            sessionId: `customer-${Date.now()}`, // Generate unique session ID
            token: token
          }));
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleWebSocketMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.isConnected = false;
        this.ws = null;
        
        // Attempt to reconnect after 3 seconds
        setTimeout(() => {
          if (!this.isConnected) {
            console.log('Attempting to reconnect WebSocket...');
            this.connectWebSocket(type, token);
          }
        }, 3000);
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  },

  disconnectWebSocket() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.isConnected = false;
    }
  },

  handleWebSocketMessage(data) {
    console.log('Received WebSocket message:', data);
    
    switch (data.type) {
      case 'stream_started':
        // Don't clear chat if we're just joining an existing stream (page refresh)
        const isNewStream = this.isAdminStreaming === false;
        if (isNewStream) {
          this.clearChatMessages();
        }
        
        this.isAdminStreaming = true;
        // Update properties individually to maintain reactivity
        Object.assign(this.adminStreamData, data.streamData, {
          startTime: new Date(data.streamData.startTime)
        });
        console.log('Stream started via WebSocket:', this.adminStreamData);
        
        // For customers: only reinitialize WebRTC if:
        // 1. It's truly a new stream (not just page refresh receiving stream_started)
        // 2. We have active connections (meaning we were watching a previous stream)
        const hasActiveConnections = this.webrtcPeerConnections.size > 0;
        if (this.connectionType === 'customer' && this.webrtcInitialized && isNewStream && hasActiveConnections) {
          console.log('🔄 Reinitializing WebRTC for new stream');
          // Clean up existing connections first
          for (const [peerId, peerConnection] of this.webrtcPeerConnections) {
            console.log(`🧹 Cleaning up old peer connection: ${peerId}`);
            peerConnection.close();
          }
          this.webrtcPeerConnections.clear();
          this.remoteMediaStreams.clear();
          this.sharedMediaStream = null;
          
          // Re-initialize WebRTC
          this.webrtcInitialized = false;
          this.initializeWebRTC('customer');
          this.webrtcInitialized = true;
        } else if (this.connectionType === 'customer' && !this.webrtcInitialized) {
          console.log('ℹ️ Stream active but WebRTC not yet initialized - will connect via registered event');
        }
        break;
        
      case 'stream_stopped':
        this.isAdminStreaming = false;
        this.adminStreamData.startTime = null;
        console.log('Stream stopped via WebSocket');
        break;
        
      case 'stream_update':
        if (data.viewerCount !== undefined) {
          this.adminStreamData.viewerCount = data.viewerCount;
        }
        if (data.likes !== undefined) {
          this.adminStreamData.likes = data.likes;
        }
        if (data.likedBy !== undefined) {
          this.adminStreamData.likedBy = data.likedBy;
        }
        break;
        
      case 'chat_message':
        this.addChatMessageFromWebSocket({
          id: data.id || Date.now(),
          username: data.username,
          message: data.message,
          timestamp: new Date(data.timestamp),
          isAdmin: data.isAdmin || false
        });
        break;
        
      case 'chat_history':
        // Replace existing messages with history to prevent duplicates
        console.log('📜 Received chat history:', data.messages.length, 'messages');
        this.chatMessages = data.messages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
          fromWebSocket: true
        }));
        break;
        
      case 'pinned_products_updated':
        console.log('📌 Pinned products updated:', data.pinnedProducts);
        this.pinnedProducts = data.pinnedProducts || [];
        break;
        
      case 'registered':
      case 'admin_registered':
        console.log('Successfully registered with WebSocket server');
        
        // Initialize WebRTC after successful WebSocket registration
        if (!this.webrtcInitialized && this.isWebRTCSupported) {
          console.log('🔄 Auto-initializing WebRTC after WebSocket registration');
          this.initializeWebRTC(this.connectionType);
          this.webrtcInitialized = true;
        }
        break;
        
      case 'error':
        console.error('WebSocket error from server:', data.message);
        break;
        
      // WebRTC signaling messages
      case 'webrtc_registered':
        console.log('WebRTC registration confirmed:', data);
        break;
        
      case 'webrtc_broadcast_stopped':
        console.log('⏹️ Broadcast stopped by:', data.broadcasterId);
        if (this.connectionType === 'customer') {
          this.handleBroadcastStopped(data.broadcasterId);
        }
        break;
        
      case 'webrtc_broadcaster_available':
        console.log('🎥 Broadcaster available:', data.broadcaster);
        if (this.connectionType === 'customer') {
          this.handleBroadcasterAvailable(data.broadcaster);
        }
        break;
        
      case 'webrtc_new_customer':
        console.log('🆕 New customer requesting stream:', data.customerId);
        if (this.connectionType === 'admin') {
          this.createOfferForCustomer(data.customerId);
        }
        break;
        
      case 'webrtc_offer':
        console.log('📡 Received WebRTC offer from:', data.from);
        this.handleWebRTCOffer(data.from, data.offer);
        break;
        
      case 'webrtc_answer':
        console.log('📡 Received WebRTC answer from:', data.from);
        this.handleWebRTCAnswer(data.from, data.answer);
        break;
        
      case 'webrtc_ice_candidate':
        console.log('🧊 Received ICE candidate from:', data.from);
        this.handleWebRTCIceCandidate(data.from, data.candidate);
        break;
        
      case 'webrtc_broadcast_stopped':
        console.log('⏹️ Broadcast stopped by:', data.broadcaster);
        this.handleBroadcastStopped(data.broadcaster);
        break;
        
      default:
        console.log('Unknown WebSocket message type:', data.type);
    }
  },

  // Send message via WebSocket
  sendWebSocketMessage(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
      return true;
    }
    console.warn('WebSocket not connected, cannot send message');
    return false;
  },
  // Methods to update stream state (enhanced with WebSocket broadcasting)
  // Start admin stream
  startAdminStream(streamData) {
    console.log('🎥 Admin stream started locally:', streamData);
    this.isAdminStreaming = true;
    // Update properties individually to maintain reactivity
    Object.assign(this.adminStreamData, streamData, {
      startTime: new Date()
    });
  },

  // Set shared media stream for live streaming
  setSharedMediaStream(mediaStream) {
    this.sharedMediaStream = mediaStream;
    if (mediaStream) {
      // Just store the stream - URL creation will be handled where needed
      console.log('📹 Shared MediaStream set:', mediaStream);
      // Set a placeholder URL to indicate stream is active
      this.adminStreamData.streamUrl = 'mediastream://live-camera-feed';
    } else {
      this.adminStreamData.streamUrl = '';
    }
  },
  
  stopAdminStream() {
    this.isAdminStreaming = false
    this.adminStreamData.startTime = null
    console.log('Admin stream stopped locally')
    
    // Broadcast to all connected clients via WebSocket
    this.sendWebSocketMessage({
      type: 'stream_stopped'
    });
  },
  
  updateViewerCount(count) {
    this.adminStreamData.viewerCount = count
    
    // Broadcast viewer count update via WebSocket
    this.sendWebSocketMessage({
      type: 'stream_update',
      viewerCount: count
    });
  },
  
  toggleLike(userId, sessionId) {
    // Send toggle like request to WebSocket server
    // Server will handle the logic and broadcast the update
    this.sendWebSocketMessage({
      type: 'toggle_like',
      userId: userId,
      sessionId: sessionId
    });
  },
  
  // Check if current user has liked
  hasUserLiked(userId, sessionId) {
    const identifier = userId || sessionId;
    return this.adminStreamData.likedBy.includes(identifier);
  },
  
  addChatMessage(message) {
    // Only send via WebSocket, don't add locally
    // The WebSocket broadcast will add it back via addChatMessageFromWebSocket
    // This prevents duplicate messages for the sender
    this.sendWebSocketMessage({
      type: 'chat_message',
      id: message.id,
      username: message.username,
      message: message.message,
      timestamp: message.timestamp.toISOString(),
      isAdmin: message.isAdmin || false
    });
  },
  
  // Add chat message from WebSocket (to avoid infinite loops)
  addChatMessageFromWebSocket(message) {
    this.chatMessages.push({
      ...message,
      fromWebSocket: true
    });
    
    // Keep only last 50 messages for performance
    if (this.chatMessages.length > 50) {
      this.chatMessages = this.chatMessages.slice(-50);
    }
  },
  
  clearChatMessages() {
    this.chatMessages = []
  },
  
  // Pinned Products Methods
  async fetchPinnedProducts(streamId) {
    try {
      const response = await fetch(`http://localhost:3000/livestreams/${streamId}/pinned-products`);
      if (response.ok) {
        const data = await response.json();
        this.pinnedProducts = data.pinnedProducts || [];
        console.log('📌 Fetched pinned products:', this.pinnedProducts);
      }
    } catch (error) {
      console.error('Error fetching pinned products:', error);
    }
  },
  
  async pinProduct(streamId, productId, displayOrder = 0) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/livestreams/${streamId}/pin-product`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId, displayOrder })
      });
      
      if (response.ok) {
        const data = await response.json();
        this.pinnedProducts = data.pinnedProducts || [];
        
        // Broadcast update via WebSocket
        this.broadcastPinnedProductsUpdate();
        return true;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to pin product');
      }
    } catch (error) {
      console.error('Error pinning product:', error);
      throw error;
    }
  },
  
  async unpinProduct(streamId, productId) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/livestreams/${streamId}/unpin-product/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        this.pinnedProducts = data.pinnedProducts || [];
        
        // Broadcast update via WebSocket
        this.broadcastPinnedProductsUpdate();
        return true;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to unpin product');
      }
    } catch (error) {
      console.error('Error unpinning product:', error);
      throw error;
    }
  },
  
  async updatePinnedProductOrder(streamId, productOrders) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/livestreams/${streamId}/pinned-products/order`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productOrders })
      });
      
      if (response.ok) {
        const data = await response.json();
        this.pinnedProducts = data.pinnedProducts || [];
        
        // Broadcast update via WebSocket
        this.broadcastPinnedProductsUpdate();
        return true;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update product order');
      }
    } catch (error) {
      console.error('Error updating pinned product order:', error);
      throw error;
    }
  },
  
  broadcastPinnedProductsUpdate() {
    this.sendWebSocketMessage({
      type: 'pinned_products_updated',
      pinnedProducts: this.pinnedProducts
    });
  },
  
  clearPinnedProducts() {
    this.pinnedProducts = [];
  },
  
  // Broadcast stream status via WebSocket
  broadcastStreamStatus(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('📡 Broadcasting stream status via WebSocket:', data);
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('⚠️ Cannot broadcast stream status: WebSocket not connected');
    }
  },

  // WebRTC Methods
  generatePeerId() {
    this.peerId = `${this.connectionType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return this.peerId;
  },

  async initializeWebRTC(userType) {
    if (!this.isWebRTCSupported) {
      console.error('❌ WebRTC not supported in this browser');
      return false;
    }

    this.generatePeerId();
    console.log(`🎥 Initializing WebRTC as ${userType} with peer ID: ${this.peerId}`);

    // Register with signaling server
    this.sendWebSocketMessage({
      type: 'webrtc_register',
      peerId: this.peerId,
      userType: userType
    });

    return true;
  },

  async setLocalMediaStream(stream) {
    this.localMediaStream = stream;
    console.log('📹 Local media stream set for WebRTC');
    
    // If we're admin and have peer connections, add tracks to all of them
    if (this.connectionType === 'admin') {
      for (const [peerId, peerConnection] of this.webrtcPeerConnections) {
        // Get existing senders to avoid adding duplicate tracks
        const existingSenders = peerConnection.getSenders();
        
        stream.getTracks().forEach(track => {
          // Check if this track is already being sent
          const existingSender = existingSenders.find(sender => 
            sender.track && sender.track.id === track.id
          );
          
          if (!existingSender) {
            console.log(`➕ Adding track ${track.kind} to peer ${peerId}`);
            peerConnection.addTrack(track, stream);
          } else {
            console.log(`♻️ Track ${track.kind} already exists for peer ${peerId}, replacing...`);
            existingSender.replaceTrack(track);
          }
        });
      }
    }
  },

  createPeerConnection(remotePeerId) {
    if (this.webrtcPeerConnections.has(remotePeerId)) {
      return this.webrtcPeerConnections.get(remotePeerId);
    }

    const peerConnection = new RTCPeerConnection({
      iceServers: this.iceServers
    });

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('🧊 Sending ICE candidate to:', remotePeerId);
        this.sendWebSocketMessage({
          type: 'webrtc_ice_candidate',
          from: this.peerId,
          to: remotePeerId,
          candidate: event.candidate
        });
      }
    };

    // Handle remote stream (for customers receiving admin stream)
    peerConnection.ontrack = (event) => {
      console.log('📺 Received remote stream from:', remotePeerId);
      const [remoteStream] = event.streams;
      
      console.log('🔍 Stream details:', {
        streamId: remoteStream.id,
        active: remoteStream.active,
        videoTracks: remoteStream.getVideoTracks().length,
        audioTracks: remoteStream.getAudioTracks().length
      });
      
      this.remoteMediaStreams.set(remotePeerId, remoteStream);
      
      // If we're a customer, this is the admin's stream
      if (this.connectionType === 'customer') {
        console.log('🎯 Setting admin stream as sharedMediaStream for customer');
        this.sharedMediaStream = remoteStream;
      }
    };

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      console.log(`🔗 Connection state with ${remotePeerId}: ${peerConnection.connectionState}`);
      
      if (peerConnection.connectionState === 'failed') {
        console.error(`❌ Connection failed with ${remotePeerId}`);
        this.cleanupPeerConnection(remotePeerId);
      }
    };

    this.webrtcPeerConnections.set(remotePeerId, peerConnection);
    return peerConnection;
  },

  async createOfferForCustomer(customerId) {
    console.log(`📤 Creating WebRTC offer for customer: ${customerId}`);
    
    const peerConnection = this.createPeerConnection(customerId);
    
    // Add local stream tracks if available
    if (this.localMediaStream) {
      this.localMediaStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, this.localMediaStream);
      });
    }
    
    try {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      
      this.sendWebSocketMessage({
        type: 'webrtc_offer',
        from: this.peerId,
        to: customerId,
        offer: offer
      });
    } catch (error) {
      console.error('❌ Error creating offer:', error);
    }
  },

  async handleWebRTCOffer(fromPeerId, offer) {
    console.log(`📥 Handling WebRTC offer from: ${fromPeerId}`);
    
    // Check if peer connection already exists
    let peerConnection = this.webrtcPeerConnections.get(fromPeerId);
    
    // If connection exists, check its state
    if (peerConnection) {
      const state = peerConnection.signalingState;
      console.log(`� Existing connection state: ${state}`);
      
      // If we're already connected or connecting, ignore duplicate offers
      if (state === 'stable' && peerConnection.currentRemoteDescription) {
        console.log(`⚠️ Ignoring duplicate offer - connection already established`);
        return;
      }
      
      // If connection is in have-local-offer or have-remote-offer state, it's processing
      if (state === 'have-local-offer' || state === 'have-remote-offer') {
        console.log(`⚠️ Ignoring duplicate offer - connection negotiation in progress (${state})`);
        return;
      }
      
      // Only clean up if in a failed or closed state
      if (state === 'closed' || peerConnection.connectionState === 'failed') {
        console.log(`🔄 Cleaning up ${state} connection and recreating...`);
        this.cleanupPeerConnection(fromPeerId);
        peerConnection = null;
      }
    }
    
    // Create peer connection if needed
    if (!peerConnection) {
      peerConnection = this.createPeerConnection(fromPeerId);
    }
    
    try {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      
      this.sendWebSocketMessage({
        type: 'webrtc_answer',
        from: this.peerId,
        to: fromPeerId,
        answer: answer
      });
      
      console.log(`✅ Successfully processed offer from ${fromPeerId}`);
    } catch (error) {
      console.error('❌ Error handling offer:', error);
      // Clean up failed connection
      this.cleanupPeerConnection(fromPeerId);
    }
  },

  async handleWebRTCAnswer(fromPeerId, answer) {
    console.log(`📥 Handling WebRTC answer from: ${fromPeerId}`);
    
    const peerConnection = this.webrtcPeerConnections.get(fromPeerId);
    if (peerConnection) {
      try {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      } catch (error) {
        console.error('❌ Error handling answer:', error);
      }
    }
  },

  async handleWebRTCIceCandidate(fromPeerId, candidate) {
    console.log(`🧊 Handling ICE candidate from: ${fromPeerId}`);
    
    const peerConnection = this.webrtcPeerConnections.get(fromPeerId);
    if (peerConnection) {
      try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error('❌ Error adding ICE candidate:', error);
      }
    }
  },

  handleBroadcasterAvailable(broadcasterId) {
    console.log(`🎥 Broadcaster available: ${broadcasterId}`);
    // Customer will automatically receive offers from the broadcaster
  },

  handleBroadcastStopped(broadcasterId) {
    console.log(`⏹️ Broadcast stopped by: ${broadcasterId}`);
    
    // Clean up connection with broadcaster
    this.cleanupPeerConnection(broadcasterId);
    
    // Clear shared media stream
    this.sharedMediaStream = null;
  },

  cleanupPeerConnection(peerId) {
    const peerConnection = this.webrtcPeerConnections.get(peerId);
    if (peerConnection) {
      peerConnection.close();
      this.webrtcPeerConnections.delete(peerId);
    }
    
    this.remoteMediaStreams.delete(peerId);
    console.log(`🧹 Cleaned up peer connection: ${peerId}`);
  },

  async startWebRTCBroadcast(mediaStream) {
    if (this.connectionType !== 'admin') {
      console.error('❌ Only admin can start WebRTC broadcast');
      return false;
    }

    console.log('🔴 Starting WebRTC broadcast');
    
    await this.setLocalMediaStream(mediaStream);
    
    // Notify signaling server that broadcast has started
    this.sendWebSocketMessage({
      type: 'webrtc_broadcast_start',
      peerId: this.peerId
    });

    return true;
  },

  stopWebRTCBroadcast() {
    if (this.connectionType !== 'admin') {
      console.error('❌ Only admin can stop WebRTC broadcast');
      return;
    }

    console.log('⏹️ Stopping WebRTC broadcast');
    
    // Close all peer connections and clean up senders
    for (const [peerId, peerConnection] of this.webrtcPeerConnections) {
      // Remove all senders first
      const senders = peerConnection.getSenders();
      senders.forEach(sender => {
        if (sender.track) {
          peerConnection.removeTrack(sender);
        }
      });
      
      peerConnection.close();
      console.log(`🧹 Cleaned up peer connection: ${peerId}`);
    }
    this.webrtcPeerConnections.clear();
    this.remoteMediaStreams.clear();
    
    // Clear local stream
    if (this.localMediaStream) {
      this.localMediaStream.getTracks().forEach(track => track.stop());
      this.localMediaStream = null;
    }
    
    // Notify signaling server that broadcast has stopped
    this.sendWebSocketMessage({
      type: 'webrtc_broadcast_stop',
      peerId: this.peerId
    });
  }
})