# 🎥 **How the Livestream System Works**

## 🏗️ **System Architecture Overview**

The livestream system is built with a **hybrid architecture** combining:
- **WebRTC** for peer-to-peer video streaming
- **WebSocket** for real-time communication
- **REST API** for data management
- **MongoDB** for persistent storage

## 🔄 **Complete Livestream Flow**

### **Phase 1: Stream Initialization**

#### **1. Admin Starts Stream**
```javascript
// AdminLiveStream.vue
const toggleStream = async () => {
  // 1. Get camera/microphone access
  const stream = await getMediaStream();
  
  // 2. Create livestream record in database
  const livestream = await createLiveStream();
  
  // 3. Start WebRTC broadcast
  await livestreamStore.startWebRTCBroadcast(stream);
  
  // 4. Start recording
  startRecording(stream);
};
```

#### **2. Backend Processing**
```javascript
// liveStreamController.js
exports.createLiveStream = async (req, res) => {
  // 1. Check for existing active streams
  const activeStream = await LiveStream.getActiveStream();
  if (activeStream) {
    return res.status(400).json({ message: 'Another livestream is active' });
  }
  
  // 2. Create new livestream record
  const liveStream = new LiveStream({
    title, description, quality,
    isActive: true,
    startTime: new Date(),
    createdBy: req.user._id
  });
  
  // 3. Save to database
  await liveStream.save();
  
  // 4. Return stream data
  res.json({ livestream: liveStream });
};
```

### **Phase 2: Real-time Video Streaming**

#### **3. WebRTC Peer-to-Peer Connection**
```javascript
// livestreamStore.js
async startWebRTCBroadcast(mediaStream) {
  // 1. Initialize WebRTC
  await this.initializeWebRTC('admin');
  
  // 2. Set local media stream
  await this.setLocalMediaStream(mediaStream);
  
  // 3. Notify WebSocket server
  this.sendWebSocketMessage({
    type: 'webrtc_broadcast_start',
    peerId: this.peerId
  });
}
```

#### **4. Customer Connection**
```javascript
// LiveStream.vue
onMounted(async () => {
  // 1. Connect to WebSocket
  livestreamStore.connectWebSocket('customer', token);
  
  // 2. Check for active stream
  const response = await fetch('/livestreams/active');
  if (data.livestream) {
    // 3. Fetch pinned products
    await livestreamStore.fetchPinnedProducts(data.livestream._id);
  }
});
```

### **Phase 3: Real-time Communication**

#### **5. WebSocket Message Flow**
```javascript
// websocket.js
async handleWebRTCRegister(ws, data) {
  const { peerId, userType } = data;
  
  // Store connection
  this.webrtcConnections.set(peerId, { type: userType, ws, peerId });
  
  // If admin registers, notify all customers
  if (userType === 'admin') {
    this.activeBroadcaster = peerId;
    this.notifyCustomersOfBroadcaster();
  }
  
  // If customer registers and broadcaster exists, initiate connection
  else if (userType === 'customer' && this.activeBroadcaster) {
    this.initiateWebRTCConnection(this.activeBroadcaster, peerId);
  }
}
```

#### **6. WebRTC Signaling**
```javascript
// Admin creates offer for new customer
async createOfferForCustomer(customerId) {
  const peerConnection = this.createPeerConnection(customerId);
  
  // Add local stream tracks
  this.localMediaStream.getTracks().forEach(track => {
    peerConnection.addTrack(track, this.localMediaStream);
  });
  
  // Create and send offer
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  
  this.sendWebSocketMessage({
    type: 'webrtc_offer',
    from: this.peerId,
    to: customerId,
    offer: offer
  });
}
```

### **Phase 4: Interactive Features**

#### **7. Live Chat System**
```javascript
// Customer sends message
const sendMessage = () => {
  const message = {
    id: Date.now(),
    username: 'Customer',
    message: newMessage.value,
    timestamp: new Date(),
    isAdmin: false
  };
  
  // Send via WebSocket
  livestreamStore.addChatMessage(message);
};

// WebSocket broadcasts to all clients
async broadcastChatMessage(data) {
  // Save to database
  const activeStream = await LiveStream.findOne({ isActive: true });
  await LiveStream.findByIdAndUpdate(activeStream._id, {
    $push: { chatMessages: message }
  });
  
  // Broadcast to all connections
  for (const connection of this.customerConnections.values()) {
    connection.ws.send(JSON.stringify(data));
  }
}
```

#### **8. Like System**
```javascript
// Customer toggles like
const toggleLike = () => {
  livestreamStore.toggleLike(userId.value, sessionId.value);
};

// WebSocket handles like logic
async handleToggleLike(ws, data) {
  const { userId, sessionId } = data;
  const identifier = userId || sessionId;
  
  // Check if user already liked
  const hasLiked = this.currentStreamState.likedBy.has(identifier);
  
  if (hasLiked) {
    // Unlike
    this.currentStreamState.likedBy.delete(identifier);
    this.currentStreamState.likes--;
  } else {
    // Like
    this.currentStreamState.likedBy.add(identifier);
    this.currentStreamState.likes++;
  }
  
  // Update database and broadcast
  await LiveStream.findByIdAndUpdate(streamId, {
    likes: this.currentStreamState.likes,
    likedBy: Array.from(this.currentStreamState.likedBy)
  });
  
  // Broadcast to all clients
  this.broadcastStreamUpdate({
    type: 'stream_update',
    likes: this.currentStreamState.likes,
    likedBy: Array.from(this.currentStreamState.likedBy)
  });
}
```

### **Phase 5: Pinned Products System**

#### **9. Admin Pins Product**
```javascript
// AdminLiveStream.vue
const pinSelectedProduct = async () => {
  await livestreamStore.pinProduct(currentStreamId.value, selectedProductToPin.value);
};

// livestreamStore.js
async pinProduct(streamId, productId) {
  // 1. API call to pin product
  const response = await fetch(`/livestreams/${streamId}/pin-product`, {
    method: 'POST',
    body: JSON.stringify({ productId })
  });
  
  // 2. Update local state
  this.pinnedProducts = data.pinnedProducts;
  
  // 3. Broadcast via WebSocket
  this.broadcastPinnedProductsUpdate();
}
```

#### **10. Real-time Product Updates**
```javascript
// websocket.js
async broadcastPinnedProductsUpdate(data) {
  // Broadcast to all customer connections
  for (const connection of this.customerConnections.values()) {
    if (connection.ws.readyState === WebSocket.OPEN) {
      connection.ws.send(JSON.stringify(data));
    }
  }
  
  // Also broadcast to admin connections
  for (const connection of this.adminConnections.values()) {
    if (connection.ws.readyState === WebSocket.OPEN) {
      connection.ws.send(JSON.stringify(data));
    }
  }
}
```

### **Phase 6: Stream Recording & Storage**

#### **11. Video Recording**
```javascript
// AdminLiveStream.vue
const startRecording = (stream) => {
  const mediaRecorder = new MediaRecorder(stream, {
    mimeType: 'video/webm;codecs=vp9,opus'
  });
  
  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      recordedChunks.push(event.data);
    }
  };
  
  mediaRecorder.onstop = async () => {
    const recordedBlob = new Blob(recordedChunks, { type: 'video/webm' });
    await uploadRecording(recordedBlob);
  };
  
  mediaRecorder.start(1000); // Record in 1-second chunks
};
```

#### **12. Upload & Thumbnail Generation**
```javascript
const uploadRecording = async (videoBlob) => {
  // 1. Upload video file
  const formData = new FormData();
  formData.append('video', videoBlob);
  
  const uploadResponse = await fetch(`/livestreams/${streamId}/upload`, {
    method: 'POST',
    body: formData
  });
  
  // 2. Generate thumbnail
  const thumbnail = await generateThumbnail(videoBlob);
  const thumbnailUrl = await uploadThumbnail(thumbnail, streamId);
  
  // 3. Update livestream record
  await fetch(`/livestreams/${streamId}`, {
    method: 'PUT',
    body: JSON.stringify({
      videoUrl: `uploads/livestreams/${filename}`,
      thumbnailUrl: thumbnailUrl,
      isRecorded: true
    })
  });
};
```

### **Phase 7: Stream Termination**

#### **13. Stop Stream**
```javascript
// AdminLiveStream.vue
const toggleStream = async () => {
  if (isStreaming.value) {
    // 1. Stop recording
    stopRecording();
    
    // 2. Stop WebRTC broadcast
    livestreamStore.stopWebRTCBroadcast();
    
    // 3. Stop media stream
    stopMediaStream();
    
    // 4. Update database
    await stopLiveStream();
    
    // 5. Clear pinned products
    livestreamStore.clearPinnedProducts();
  }
};
```

## 🔧 **Key Technologies & Their Roles**

### **WebRTC (Web Real-Time Communication)**
- **Purpose**: Peer-to-peer video streaming
- **Benefits**: Low latency, direct browser-to-browser connection
- **Components**: MediaStream, RTCPeerConnection, RTCDataChannel

### **WebSocket**
- **Purpose**: Real-time bidirectional communication
- **Features**: Chat, likes, pinned products, viewer count
- **Port**: 3000 (separate from HTTP server)

### **MediaRecorder API**
- **Purpose**: Record video streams for later playback
- **Format**: WebM with VP9/Opus codecs
- **Storage**: Server filesystem with database references

### **MongoDB**
- **Purpose**: Persistent storage of stream metadata
- **Collections**: livestreams, products, users
- **Relationships**: Embedded documents for pinned products

## 🚀 **Real-time Features**

1. **Video Streaming**: WebRTC peer-to-peer connections
2. **Live Chat**: WebSocket message broadcasting
3. **Like System**: Real-time like counting and user tracking
4. **Pinned Products**: Live product promotion and shopping
5. **Viewer Count**: Automatic counting of connected users
6. **Stream Status**: Real-time start/stop notifications

## 📊 **Data Flow Summary**

```
Admin Browser → WebRTC → Customer Browsers
     ↓              ↓
WebSocket ←→ WebSocket Server ←→ WebSocket
     ↓              ↓
REST API → Database (MongoDB)
     ↓
File Storage (Videos/Thumbnails)
```

This architecture ensures **low-latency video streaming**, **real-time interactivity**, and **persistent data storage** for a complete livestreaming experience with e-commerce integration.