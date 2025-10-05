const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const ChatConversation = require('./models/communication/chatConversation');

class WebSocketManager {
  constructor(server) {
    this.wss = new WebSocket.Server({ 
      port: 8080,
      verifyClient: this.verifyClient.bind(this)
    });
    
    // Store connections by sessionId for customers and by userId for admins
    this.customerConnections = new Map(); // sessionId -> { ws, userId, userRole }
    this.adminConnections = new Map(); // userId -> { ws, userRole }
    
    // WebRTC signaling management
    this.webrtcConnections = new Map(); // connectionId -> { type: 'admin'|'customer', ws, peerId }
    this.activeBroadcaster = null; // Currently streaming admin
    
    // In-memory stream state for real-time updates
    this.currentStreamState = {
      isActive: false,
      streamId: null,
      viewerCount: 0,
      likes: 0,
      likedBy: new Set(), // Track user IDs/session IDs who have liked
      startTime: null,
      title: '',
      description: '',
      streamUrl: '',
      quality: '720p'
    };
    
    this.wss.on('connection', this.handleConnection.bind(this));
    console.log('🔗 WebSocket server running on port 8080');
  }

  // Verify client connection (optional authentication)
  verifyClient(info) {
    // For now, allow all connections
    // You can add authentication here if needed
    return true;
  }

  handleConnection(ws, req) {
    console.log('🔌 New WebSocket connection established');

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        await this.handleMessage(ws, data);
      } catch (error) {
        console.error('❌ Error handling WebSocket message:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Invalid message format'
        }));
      }
    });

    ws.on('close', () => {
      // Remove connection from customer tracking
      for (const [sessionId, conn] of this.customerConnections.entries()) {
        if (conn.ws === ws) {
          this.customerConnections.delete(sessionId);
          console.log(`🔌 Customer WebSocket disconnected for session: ${sessionId}`);
          
          // Update viewer count when customer leaves
          this.updateViewerCount();
          return;
        }
      }
      
      // Remove connection from admin tracking
      for (const [userId, conn] of this.adminConnections.entries()) {
        if (conn.ws === ws) {
          this.adminConnections.delete(userId);
          console.log(`🔌 Admin WebSocket disconnected for user: ${userId}`);
          return;
        }
      }
    });

    ws.on('error', (error) => {
      console.error('❌ WebSocket error:', error);
    });
  }

  async handleMessage(ws, data) {
    const { type, sessionId, content, token, userId } = data;

    switch (type) {
      case 'register':
        await this.registerConnection(ws, sessionId, token);
        break;
      
      case 'register_admin':
        await this.registerAdminConnection(ws, userId, token);
        break;
      
      case 'staff_message':
        await this.handleStaffMessage(sessionId, content);
        break;
        
      case 'stream_started':
        await this.broadcastStreamStatus(data);
        break;
        
      case 'stream_stopped':
        await this.broadcastStreamStatus(data);
        break;
        
      case 'stream_update':
        await this.broadcastStreamUpdate(data);
        break;
        
      case 'toggle_like':
        await this.handleToggleLike(ws, data);
        break;
        
      case 'chat_message':
        await this.broadcastChatMessage(data);
        break;
        
      // WebRTC signaling messages
      case 'webrtc_register':
        await this.handleWebRTCRegister(ws, data);
        break;
        
      case 'webrtc_offer':
        await this.handleWebRTCOffer(ws, data);
        break;
        
      case 'webrtc_answer':
        await this.handleWebRTCAnswer(ws, data);
        break;
        
      case 'webrtc_ice_candidate':
        await this.handleWebRTCIceCandidate(ws, data);
        break;
        
      case 'webrtc_broadcast_start':
        await this.handleWebRTCBroadcastStart(ws, data);
        break;
        
      case 'webrtc_broadcast_stop':
        await this.handleWebRTCBroadcastStop(ws, data);
        break;
        
      default:
        console.log('❓ Unknown message type:', type);
    }
  }

  async registerConnection(ws, sessionId, token) {
    try {
      let userId = null;
      let userRole = 'anonymous';

      // Try to extract user info from token if provided
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          userId = decoded.id;
          userRole = decoded.role;
        } catch (err) {
          console.log('⚠️ Invalid token, treating as anonymous');
        }
      }

      // Store the customer connection
      this.customerConnections.set(sessionId, {
        ws,
        userId,
        userRole
      });

      console.log(`✅ Registered customer WebSocket connection: ${sessionId} (${userRole})`);
      
      // Update and broadcast viewer count
      await this.updateViewerCount();

      // Send confirmation
      ws.send(JSON.stringify({
        type: 'registered',
        sessionId,
        status: 'connected'
      }));

      // Send current stream status if there's an active stream
      await this.sendCurrentStreamStatus(ws);

    } catch (error) {
      console.error('❌ Error registering connection:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Registration failed'
      }));
    }
  }

  async registerAdminConnection(ws, userId, token) {
    try {
      let userRole = 'admin';

      // Verify admin token
      if (token) {
        try {
          console.log('🔐 Verifying admin token...', {
            tokenPresent: !!token,
            tokenStart: token ? token.substring(0, 20) + '...' : 'N/A',
            jwtSecretPresent: !!process.env.JWT_SECRET,
            actualSecret: 'secret' // Use same as auth middleware
          });
          
          const decoded = jwt.verify(token, "secret"); // Use same secret as auth middleware
          console.log('🔓 Token decoded successfully:', {
            id: decoded.user?.id,
            role: decoded.user?.role,
            username: decoded.user?.username
          });
          
          if (!decoded.user || (decoded.user.role !== 'admin' && decoded.user.role !== 'staff')) {
            throw new Error(`Insufficient permissions: role is ${decoded.user?.role}`);
          }
          userId = decoded.user.id;
          userRole = decoded.user.role;
        } catch (err) {
          console.error('⚠️ Admin token verification failed:', err.message);
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Authentication failed'
          }));
          return;
        }
      } else {
        console.error('⚠️ No token provided for admin registration');
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Token required'
        }));
        return;
      }

      // Store the admin connection
      this.adminConnections.set(userId, {
        ws,
        userRole
      });

      console.log(`✅ Registered admin WebSocket connection: ${userId} (${userRole})`);

      // Send confirmation
      ws.send(JSON.stringify({
        type: 'admin_registered',
        userId,
        status: 'connected'
      }));

    } catch (error) {
      console.error('❌ Error registering admin connection:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Admin registration failed'
      }));
    }
  }

  // Send message to a specific session (customer)
  async sendToSession(sessionId, message) {
    const connection = this.customerConnections.get(sessionId);
    if (connection && connection.ws.readyState === WebSocket.OPEN) {
      connection.ws.send(JSON.stringify(message));
      return true;
    }
    return false;
  }

  // Send staff reply to customer via WebSocket
  async sendStaffReply(sessionId, content) {
    const message = {
      type: 'staff_reply',
      message: content,
      timestamp: new Date().toISOString()
    };

    const sent = await this.sendToSession(sessionId, message);
    if (sent) {
      console.log(`📤 Sent staff message via WebSocket to session: ${sessionId}`);
    } else {
      console.log(`⚠️ Could not send via WebSocket to session: ${sessionId} (not connected)`);
    }
    return sent;
  }

  // Handle incoming staff messages (when staff replies via admin interface)
  async handleStaffMessage(sessionId, content) {
    // This would be called when staff sends a message
    // The message should already be saved to DB by the staff reply endpoint
    // We just need to notify the customer via WebSocket
    await this.sendStaffReply(sessionId, content);
  }

  // Send customer message to all connected admins
  async broadcastCustomerMessage(sessionId, message, customerName = 'Customer') {
    const adminMessage = {
      type: 'customer_message',
      sessionId,
      message,
      customerName,
      timestamp: new Date().toISOString()
    };

    let sent = 0;
    for (const [userId, connection] of this.adminConnections.entries()) {
      if (connection.ws.readyState === WebSocket.OPEN) {
        connection.ws.send(JSON.stringify(adminMessage));
        sent++;
      }
    }

    console.log(`📤 Broadcasted customer message to ${sent} admin(s) for session: ${sessionId}`);
    return sent > 0;
  }

  // Get connection status for a customer session
  isSessionConnected(sessionId) {
    const connection = this.customerConnections.get(sessionId);
    return connection && connection.ws.readyState === WebSocket.OPEN;
  }

  // Get connection status for an admin
  isAdminConnected(userId) {
    const connection = this.adminConnections.get(userId);
    return connection && connection.ws.readyState === WebSocket.OPEN;
  }

  // Get number of connected admins
  getConnectedAdminCount() {
    let count = 0;
    for (const connection of this.adminConnections.values()) {
      if (connection.ws.readyState === WebSocket.OPEN) {
        count++;
      }
    }
    return count;
  }

  // Broadcast to all connections (if needed)
  broadcast(message) {
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

  // Handle livestream status broadcasts
  async broadcastStreamStatus(data) {
    console.log(`📡 Broadcasting stream status: ${data.type}`);
    
    // Update in-memory state
    if (data.type === 'stream_started' && data.streamData) {
      this.currentStreamState = {
        isActive: true,
        streamId: data.streamData.streamId || null,
        viewerCount: data.streamData.viewerCount || 0,
        likes: data.streamData.likes || 0,
        likedBy: new Set(data.streamData.likedBy || []), // Initialize from database or empty
        startTime: data.streamData.startTime || new Date(),
        title: data.streamData.title || '',
        description: data.streamData.description || '',
        streamUrl: data.streamData.streamUrl || '',
        quality: data.streamData.quality || '720p'
      };
      console.log('💾 Updated in-memory stream state:', this.currentStreamState);
    } else if (data.type === 'stream_stopped') {
      this.currentStreamState.isActive = false;
      this.currentStreamState.likedBy.clear(); // Clear liked users when stream stops
      console.log('💾 Stream stopped, marked as inactive in memory');
    }
    
    // Broadcast to all customer connections
    for (const connection of this.customerConnections.values()) {
      if (connection.ws.readyState === WebSocket.OPEN) {
        connection.ws.send(JSON.stringify(data));
      }
    }
    
    // Also broadcast to other admin connections for sync
    for (const connection of this.adminConnections.values()) {
      if (connection.ws.readyState === WebSocket.OPEN) {
        connection.ws.send(JSON.stringify(data));
      }
    }
  }

  // Handle stream updates (viewer count, likes, etc.)
  async broadcastStreamUpdate(data) {
    console.log(`📡 Broadcasting stream update:`, data);
    
    // Update in-memory state
    if (data.viewerCount !== undefined) {
      this.currentStreamState.viewerCount = data.viewerCount;
    }
    if (data.likes !== undefined) {
      this.currentStreamState.likes = data.likes;
      console.log('💾 Updated likes in memory:', this.currentStreamState.likes);
    }
    
    // Broadcast to all connections
    for (const connection of this.customerConnections.values()) {
      if (connection.ws.readyState === WebSocket.OPEN) {
        connection.ws.send(JSON.stringify(data));
      }
    }
    
    for (const connection of this.adminConnections.values()) {
      if (connection.ws.readyState === WebSocket.OPEN) {
        connection.ws.send(JSON.stringify(data));
      }
    }
  }

  // Handle like toggle (ensure each user can only like once)
  async handleToggleLike(ws, data) {
    const { userId, sessionId } = data;
    const identifier = userId || sessionId; // Use userId if authenticated, otherwise sessionId
    
    if (!identifier) {
      console.error('❌ No identifier provided for like toggle');
      return;
    }
    
    if (!this.currentStreamState.isActive) {
      console.log('⚠️ No active stream to like');
      ws.send(JSON.stringify({
        type: 'error',
        message: 'No active stream'
      }));
      return;
    }
    
    // Check if user has already liked
    const hasLiked = this.currentStreamState.likedBy.has(identifier);
    
    if (hasLiked) {
      // Unlike - remove from likedBy set
      this.currentStreamState.likedBy.delete(identifier);
      this.currentStreamState.likes = Math.max(0, this.currentStreamState.likes - 1);
      console.log(`👎 User ${identifier} unliked. New like count: ${this.currentStreamState.likes}`);
    } else {
      // Like - add to likedBy set
      this.currentStreamState.likedBy.add(identifier);
      this.currentStreamState.likes++;
      console.log(`👍 User ${identifier} liked. New like count: ${this.currentStreamState.likes}`);
    }
    
    // Update database if we have a streamId
    if (this.currentStreamState.streamId) {
      try {
        const LiveStream = require('./models/livestream/liveStream');
        await LiveStream.findByIdAndUpdate(this.currentStreamState.streamId, {
          likes: this.currentStreamState.likes,
          likedBy: Array.from(this.currentStreamState.likedBy)
        });
      } catch (error) {
        console.error('❌ Error updating likes in database:', error);
      }
    }
    
    // Broadcast updated like count and liked status to all clients
    const updateData = {
      type: 'stream_update',
      likes: this.currentStreamState.likes,
      likedBy: Array.from(this.currentStreamState.likedBy) // Send as array for client checking
    };
    
    for (const connection of this.customerConnections.values()) {
      if (connection.ws.readyState === WebSocket.OPEN) {
        connection.ws.send(JSON.stringify(updateData));
      }
    }
    
    for (const connection of this.adminConnections.values()) {
      if (connection.ws.readyState === WebSocket.OPEN) {
        connection.ws.send(JSON.stringify(updateData));
      }
    }
  }

  // Update and broadcast viewer count
  async updateViewerCount() {
    const viewerCount = this.customerConnections.size;
    console.log(`👥 Current viewer count: ${viewerCount}`);
    
    // Update in-memory state
    this.currentStreamState.viewerCount = viewerCount;
    
    // Broadcast viewer count update to all connections
    const updateData = {
      type: 'stream_update',
      viewerCount: viewerCount
    };
    
    // Send to all customers
    for (const connection of this.customerConnections.values()) {
      if (connection.ws.readyState === WebSocket.OPEN) {
        connection.ws.send(JSON.stringify(updateData));
      }
    }
    
    // Send to admin
    for (const connection of this.adminConnections.values()) {
      if (connection.ws.readyState === WebSocket.OPEN) {
        connection.ws.send(JSON.stringify(updateData));
      }
    }
  }

  // Handle chat message broadcasts
  async broadcastChatMessage(data) {
    console.log(`💬 Broadcasting chat message from ${data.username}`);
    
    try {
      // Save message to database if there's an active stream
      const LiveStream = require('./models/livestream/liveStream');
      const activeStream = await LiveStream.findOne({ isActive: true }).sort({ createdAt: -1 });
      
      if (activeStream) {
        const chatMessage = {
          username: data.username,
          message: data.message,
          timestamp: new Date(data.timestamp),
          isAdmin: data.isAdmin || false
        };
        
        await LiveStream.findByIdAndUpdate(activeStream._id, {
          $push: { chatMessages: chatMessage }
        });
        
        console.log(`💾 Saved chat message to database for stream ${activeStream._id}`);
      }
    } catch (error) {
      console.error('❌ Error saving chat message to database:', error);
    }
    
    // Broadcast to all connections
    for (const connection of this.customerConnections.values()) {
      if (connection.ws.readyState === WebSocket.OPEN) {
        connection.ws.send(JSON.stringify(data));
      }
    }
    
    for (const connection of this.adminConnections.values()) {
      if (connection.ws.readyState === WebSocket.OPEN) {
        connection.ws.send(JSON.stringify(data));
      }
    }
  }

  // Send current stream status to a new connection
  async sendCurrentStreamStatus(ws) {
    try {
      // Check if there's an active stream in memory first (real-time state)
      if (this.currentStreamState.isActive) {
        console.log('📡 Sending current stream status from memory to new connection');
        console.log('🔍 Active stream from memory:', this.currentStreamState);
        
        const streamData = {
          title: this.currentStreamState.title,
          description: this.currentStreamState.description,
          startTime: this.currentStreamState.startTime,
          viewerCount: this.currentStreamState.viewerCount,
          likes: this.currentStreamState.likes,
          likedBy: Array.from(this.currentStreamState.likedBy), // Send as array
          streamUrl: this.currentStreamState.streamUrl,
          quality: this.currentStreamState.quality
        };

        console.log('📡 Sending stream data via WebSocket:', streamData);

        ws.send(JSON.stringify({
          type: 'stream_started',
          streamData: streamData
        }));
        
        // Send chat history to new connection
        await this.sendChatHistory(ws);
      } else {
        console.log('📡 No active stream in memory');
      }
    } catch (error) {
      console.error('❌ Error sending current stream status:', error);
    }
  }
  
  // Send chat history to new connection
  async sendChatHistory(ws) {
    try {
      const LiveStream = require('./models/livestream/liveStream');
      const activeStream = await LiveStream.findOne({ isActive: true }).sort({ createdAt: -1 });
      
      if (activeStream && activeStream.chatMessages && activeStream.chatMessages.length > 0) {
        console.log(`� Sending chat history: ${activeStream.chatMessages.length} messages`);
        
        // Send all chat history as a single batch to prevent duplicates
        ws.send(JSON.stringify({
          type: 'chat_history',
          messages: activeStream.chatMessages
        }));
      }
    } catch (error) {
      console.error('❌ Error sending chat history:', error);
    }
  }

  // WebRTC Signaling Methods
  async handleWebRTCRegister(ws, data) {
    const { peerId, userType } = data; // userType: 'admin' or 'customer'
    
    console.log(`🎥 WebRTC registration: ${peerId} as ${userType}`);
    
    this.webrtcConnections.set(peerId, {
      type: userType,
      ws: ws,
      peerId: peerId
    });
    
    // If admin is registering, notify all customers
    if (userType === 'admin') {
      this.activeBroadcaster = peerId;
      this.notifyCustomersOfBroadcaster();
    } else if (userType === 'customer' && this.activeBroadcaster) {
      // If customer is registering and there's an active broadcaster, initiate connection
      this.initiateWebRTCConnection(this.activeBroadcaster, peerId);
    }
    
    ws.send(JSON.stringify({
      type: 'webrtc_registered',
      peerId: peerId,
      userType: userType
    }));
  }

  async handleWebRTCOffer(ws, data) {
    const { from, to, offer } = data;
    
    console.log(`📡 WebRTC offer: ${from} -> ${to}`);
    
    const targetConnection = this.webrtcConnections.get(to);
    if (targetConnection) {
      targetConnection.ws.send(JSON.stringify({
        type: 'webrtc_offer',
        from: from,
        offer: offer
      }));
    } else {
      console.log(`❌ Target peer ${to} not found for offer`);
    }
  }

  async handleWebRTCAnswer(ws, data) {
    const { from, to, answer } = data;
    
    console.log(`📡 WebRTC answer: ${from} -> ${to}`);
    
    const targetConnection = this.webrtcConnections.get(to);
    if (targetConnection) {
      targetConnection.ws.send(JSON.stringify({
        type: 'webrtc_answer',
        from: from,
        answer: answer
      }));
    } else {
      console.log(`❌ Target peer ${to} not found for answer`);
    }
  }

  async handleWebRTCIceCandidate(ws, data) {
    const { from, to, candidate } = data;
    
    console.log(`🧊 WebRTC ICE candidate: ${from} -> ${to}`);
    
    const targetConnection = this.webrtcConnections.get(to);
    if (targetConnection) {
      targetConnection.ws.send(JSON.stringify({
        type: 'webrtc_ice_candidate',
        from: from,
        candidate: candidate
      }));
    } else {
      console.log(`❌ Target peer ${to} not found for ICE candidate`);
    }
  }

  async handleWebRTCBroadcastStart(ws, data) {
    const { peerId } = data;
    
    console.log(`🔴 WebRTC broadcast started by: ${peerId}`);
    
    // Only clean up if there's a different broadcaster
    if (this.activeBroadcaster && this.activeBroadcaster !== peerId) {
      console.log(`🧹 Cleaning up previous broadcaster: ${this.activeBroadcaster}`);
      this.cleanupBroadcaster(this.activeBroadcaster);
    } else if (this.activeBroadcaster === peerId) {
      console.log(`🔄 Same broadcaster restarting: ${peerId}`);
    }
    
    this.activeBroadcaster = peerId;
    
    // Always notify customers of broadcaster availability (even for restart)
    this.notifyCustomersOfBroadcaster();
  }

  cleanupBroadcaster(broadcasterId) {
    // Remove the broadcaster connection
    if (this.webrtcConnections.has(broadcasterId)) {
      this.webrtcConnections.delete(broadcasterId);
    }
    
    // Notify customers that broadcast stopped
    this.broadcastToConnections({
      type: 'webrtc_broadcast_stopped',
      broadcasterId: broadcasterId
    }, 'customer');
  }

  async handleWebRTCBroadcastStop(ws, data) {
    const { peerId } = data;
    
    console.log(`⏹️ WebRTC broadcast stopped by: ${peerId}`);
    
    if (this.activeBroadcaster === peerId) {
      this.activeBroadcaster = null;
      
      // Notify all customers that broadcast has stopped
      for (const [connectionId, connection] of this.webrtcConnections.entries()) {
        if (connection.type === 'customer') {
          connection.ws.send(JSON.stringify({
            type: 'webrtc_broadcast_stopped',
            broadcaster: peerId
          }));
        }
      }
    }
  }

  notifyCustomersOfBroadcaster() {
    if (!this.activeBroadcaster) return;
    
    console.log(`📢 Notifying customers of broadcaster: ${this.activeBroadcaster}`);
    
    for (const [connectionId, connection] of this.webrtcConnections.entries()) {
      if (connection.type === 'customer') {
        connection.ws.send(JSON.stringify({
          type: 'webrtc_broadcaster_available',
          broadcaster: this.activeBroadcaster
        }));
      }
    }
  }

  initiateWebRTCConnection(broadcasterId, customerId) {
    const broadcasterConnection = this.webrtcConnections.get(broadcasterId);
    
    if (broadcasterConnection) {
      console.log(`🤝 Initiating WebRTC connection: ${broadcasterId} -> ${customerId}`);
      
      broadcasterConnection.ws.send(JSON.stringify({
        type: 'webrtc_new_customer',
        customerId: customerId
      }));
    }
  }

  // Close all connections
  close() {
    this.wss.close();
  }
}

module.exports = WebSocketManager;