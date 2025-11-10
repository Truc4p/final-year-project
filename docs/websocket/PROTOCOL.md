# WebSocket Protocol Documentation

## Overview

The Wrencos platform uses WebSocket for real-time bidirectional communication between clients (customers and admins) and the server.

**Library**: `ws` (WebSocket library for Node.js)
**Port**: Same as HTTP server (default: 3000)
**Protocol**: ws:// (development), wss:// (production with SSL)

## Connection URL

```
ws://localhost:3000
```

Production:
```
wss://your-domain.com
```

## Connection Types

### 1. Customer Connections

**Tracking**: By `sessionId` (UUID)
**Purpose**: 
- Live stream viewing
- Live stream chat
- Customer support chat
- Real-time updates

**Registration Flow**:
```javascript
// Client connects
const ws = new WebSocket('ws://localhost:3000');

// Client registers with sessionId
ws.send(JSON.stringify({
  type: 'register',
  sessionId: 'unique-session-id',
  token: 'optional-jwt-token' // if authenticated
}));

// Server confirms
// Receives: { type: 'registered', sessionId: '...', status: 'connected' }
```

### 2. Admin Connections

**Tracking**: By `userId` (from JWT token)
**Purpose**:
- Manage live streams
- Customer support chat
- Real-time analytics
- Broadcasting updates

**Registration Flow**:
```javascript
// Admin connects
const ws = new WebSocket('ws://localhost:3000');

// Admin registers with token (required)
ws.send(JSON.stringify({
  type: 'register_admin',
  userId: 'admin-user-id',
  token: 'jwt-token' // required and verified
}));

// Server confirms
// Receives: { type: 'admin_registered', userId: '...', status: 'connected' }
```

## Message Types

All messages are JSON-formatted strings with a `type` field.

### Authentication & Registration

#### `register` (Customer)
**Direction**: Client → Server
**Purpose**: Register customer WebSocket connection

```json
{
  "type": "register",
  "sessionId": "sess-uuid-12345",
  "token": "optional-jwt-token"
}
```

**Response**:
```json
{
  "type": "registered",
  "sessionId": "sess-uuid-12345",
  "status": "connected"
}
```

#### `register_admin` (Admin)
**Direction**: Client → Server
**Purpose**: Register admin WebSocket connection

```json
{
  "type": "register_admin",
  "userId": "admin-user-id",
  "token": "required-jwt-token"
}
```

**Response**:
```json
{
  "type": "admin_registered",
  "userId": "admin-user-id",
  "status": "connected"
}
```

### Live Streaming

#### `stream_started`
**Direction**: Server → All Clients (Broadcast)
**Purpose**: Notify that a live stream has started

```json
{
  "type": "stream_started",
  "streamData": {
    "streamId": "507f1f77bcf86cd799439040",
    "title": "Product Launch Event",
    "description": "New serum collection",
    "startTime": "2024-02-01T18:00:00.000Z",
    "viewerCount": 0,
    "likes": 0,
    "likedBy": [],
    "streamUrl": "http://stream.example.com/live123",
    "quality": "1080p"
  }
}
```

#### `stream_stopped`
**Direction**: Server → All Clients (Broadcast)
**Purpose**: Notify that a live stream has stopped

```json
{
  "type": "stream_stopped",
  "streamId": "507f1f77bcf86cd799439040"
}
```

#### `stream_update`
**Direction**: Server → All Clients (Broadcast)
**Purpose**: Update stream metrics (viewers, likes)

```json
{
  "type": "stream_update",
  "viewerCount": 250,
  "likes": 45,
  "likedBy": ["user123", "session456"]
}
```

#### `toggle_like`
**Direction**: Client → Server
**Purpose**: Like or unlike the current stream

```json
{
  "type": "toggle_like",
  "userId": "user-id", // if authenticated
  "sessionId": "session-id" // if anonymous
}
```

**Server broadcasts**:
```json
{
  "type": "stream_update",
  "likes": 46,
  "likedBy": ["user123", "session456", "user789"]
}
```

### Live Stream Chat

#### `chat_message`
**Direction**: Client → Server → All Clients (Broadcast)
**Purpose**: Send/receive chat messages during live stream

**Client sends**:
```json
{
  "type": "chat_message",
  "username": "JohnDoe",
  "message": "This product looks amazing!",
  "isAdmin": false,
  "timestamp": "2024-02-01T18:05:00.000Z"
}
```

**Server broadcasts to all**:
```json
{
  "type": "chat_message",
  "username": "JohnDoe",
  "message": "This product looks amazing!",
  "isAdmin": false,
  "timestamp": "2024-02-01T18:05:00.000Z"
}
```

#### `chat_history`
**Direction**: Server → Client
**Purpose**: Send chat history to newly connected client

```json
{
  "type": "chat_history",
  "messages": [
    {
      "username": "User1",
      "message": "Hello!",
      "timestamp": "2024-02-01T18:01:00.000Z",
      "isAdmin": false
    },
    {
      "username": "Admin",
      "message": "Welcome everyone!",
      "timestamp": "2024-02-01T18:00:30.000Z",
      "isAdmin": true
    }
  ]
}
```

### Pinned Products

#### `pinned_products_updated`
**Direction**: Server → All Clients (Broadcast)
**Purpose**: Notify clients when products are pinned/unpinned during stream

```json
{
  "type": "pinned_products_updated",
  "pinnedProducts": [
    {
      "productId": "507f1f77bcf86cd799439012",
      "name": "Hydrating Serum",
      "price": 49.99,
      "image": "/uploads/products/serum.jpg",
      "displayOrder": 1
    }
  ]
}
```

### Customer Support Chat

#### `customer_message`
**Direction**: Server → Admin Clients (Broadcast to all admins)
**Purpose**: Notify admins of customer message

```json
{
  "type": "customer_message",
  "sessionId": "sess-uuid-12345",
  "message": "I need help with my order",
  "customerName": "Customer #12345",
  "timestamp": "2024-02-01T10:00:00.000Z"
}
```

#### `staff_message`
**Direction**: Admin → Server
**Purpose**: Admin wants to send a message (triggers DB save + WebSocket send)

```json
{
  "type": "staff_message",
  "sessionId": "sess-uuid-12345",
  "content": "I'll help you with that right away!"
}
```

#### `staff_reply`
**Direction**: Server → Specific Customer Client
**Purpose**: Send staff reply to customer

```json
{
  "type": "staff_reply",
  "message": "I'll help you with that right away!",
  "timestamp": "2024-02-01T10:00:05.000Z"
}
```

### WebRTC Signaling (for Live Streaming)

#### `webrtc_register`
**Direction**: Client → Server
**Purpose**: Register peer for WebRTC connection

```json
{
  "type": "webrtc_register",
  "peerId": "peer-uuid-12345",
  "userType": "admin" // or "customer"
}
```

**Response**:
```json
{
  "type": "webrtc_registered",
  "peerId": "peer-uuid-12345",
  "userType": "admin"
}
```

#### `webrtc_offer`
**Direction**: Client → Server → Target Client
**Purpose**: Send WebRTC offer to establish connection

```json
{
  "type": "webrtc_offer",
  "from": "peer-admin-123",
  "to": "peer-customer-456",
  "offer": {
    "type": "offer",
    "sdp": "..."
  }
}
```

#### `webrtc_answer`
**Direction**: Client → Server → Target Client
**Purpose**: Send WebRTC answer

```json
{
  "type": "webrtc_answer",
  "from": "peer-customer-456",
  "to": "peer-admin-123",
  "answer": {
    "type": "answer",
    "sdp": "..."
  }
}
```

#### `webrtc_ice_candidate`
**Direction**: Client ↔ Server ↔ Client
**Purpose**: Exchange ICE candidates for WebRTC connection

```json
{
  "type": "webrtc_ice_candidate",
  "from": "peer-admin-123",
  "to": "peer-customer-456",
  "candidate": {
    "candidate": "...",
    "sdpMLineIndex": 0,
    "sdpMid": "..."
  }
}
```

#### `webrtc_broadcast_start`
**Direction**: Admin Client → Server
**Purpose**: Notify server that broadcaster is ready

```json
{
  "type": "webrtc_broadcast_start",
  "peerId": "peer-admin-123"
}
```

**Server notifies customers**:
```json
{
  "type": "webrtc_broadcaster_available",
  "broadcaster": "peer-admin-123"
}
```

#### `webrtc_broadcast_stop`
**Direction**: Admin Client → Server
**Purpose**: Notify server that broadcast has stopped

```json
{
  "type": "webrtc_broadcast_stop",
  "peerId": "peer-admin-123"
}
```

**Server notifies customers**:
```json
{
  "type": "webrtc_broadcast_stopped",
  "broadcaster": "peer-admin-123"
}
```

#### `webrtc_new_customer`
**Direction**: Server → Broadcaster
**Purpose**: Notify broadcaster of new customer connection

```json
{
  "type": "webrtc_new_customer",
  "customerId": "peer-customer-789"
}
```

### Error Messages

#### `error`
**Direction**: Server → Client
**Purpose**: Notify client of error

```json
{
  "type": "error",
  "message": "Invalid message format"
}
```

Common error messages:
- "Invalid message format"
- "No token, authorization denied"
- "Authentication failed"
- "No active stream"
- "Token required"

## Connection Management

### Customer Connection Lifecycle

1. **Connect**: Client opens WebSocket connection
2. **Register**: Send `register` message with sessionId
3. **Receive State**: Get current stream status if active
4. **Active**: Send/receive messages
5. **Disconnect**: Connection closed, viewer count updated

### Admin Connection Lifecycle

1. **Connect**: Client opens WebSocket connection
2. **Authenticate**: Send `register_admin` with JWT token
3. **Verify**: Server verifies token and role
4. **Active**: Manage streams, chat with customers
5. **Disconnect**: Connection closed

### Heartbeat/Keep-Alive

**Not explicitly implemented** - relies on browser/server defaults.

**Recommendation**: Implement ping/pong for production:
```javascript
// Client-side
setInterval(() => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'ping' }));
  }
}, 30000); // Every 30 seconds
```

## State Management

### In-Memory Stream State

The server maintains real-time stream state in memory:

```javascript
{
  isActive: false,
  streamId: null,
  viewerCount: 0,
  likes: 0,
  likedBy: new Set(), // Deduplicated user/session IDs
  startTime: null,
  title: '',
  description: '',
  streamUrl: '',
  quality: '720p'
}
```

This state is:
- Updated in real-time
- Synced with database on changes
- Sent to new connections
- Reset when stream stops

### Connection Tracking

**Customer Connections**:
```javascript
Map<sessionId, { ws, userId, userRole }>
```

**Admin Connections**:
```javascript
Map<userId, { ws, userRole }>
```

**WebRTC Connections**:
```javascript
Map<peerId, { type: 'admin'|'customer', ws, peerId }>
```

## Best Practices

### Client-Side

1. **Reconnection Logic**:
```javascript
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;

function connect() {
  const ws = new WebSocket('ws://localhost:3000');
  
  ws.onopen = () => {
    reconnectAttempts = 0;
    // Register connection
  };
  
  ws.onclose = () => {
    if (reconnectAttempts < maxReconnectAttempts) {
      reconnectAttempts++;
      setTimeout(connect, 1000 * reconnectAttempts);
    }
  };
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
}
```

2. **Message Handling**:
```javascript
ws.onmessage = (event) => {
  try {
    const data = JSON.parse(event.data);
    
    switch (data.type) {
      case 'stream_started':
        handleStreamStart(data.streamData);
        break;
      case 'chat_message':
        handleChatMessage(data);
        break;
      // ... other cases
    }
  } catch (error) {
    console.error('Error parsing message:', error);
  }
};
```

3. **State Synchronization**:
- Keep local state in sync with WebSocket updates
- Use reactive frameworks (Vue, React) for automatic UI updates
- Handle race conditions (e.g., like button double-click)

### Server-Side

1. **Connection Cleanup**:
- Remove closed connections from maps
- Update metrics when connections close
- Broadcast updates to remaining connections

2. **Error Handling**:
- Wrap message handlers in try-catch
- Send error messages to client
- Log errors for debugging

3. **Scalability**:
- Consider Redis pub/sub for multi-server deployments
- Implement connection limits per user
- Monitor memory usage for large connection counts

## Security Considerations

1. **Authentication**:
- Admin connections require valid JWT token
- Token verified against secret key
- Role checked before granting admin privileges

2. **Rate Limiting**:
- Implement message rate limits per connection
- Prevent spam in chat
- Limit like toggle frequency

3. **Input Validation**:
- Validate all incoming messages
- Sanitize chat messages for XSS
- Check message size limits

4. **Authorization**:
- Verify user can perform action
- Check stream ownership for admin actions
- Prevent unauthorized broadcasts

## Troubleshooting

### Connection Issues

**Problem**: "WebSocket connection failed"
**Solutions**:
- Check server is running
- Verify WebSocket port is open
- Check firewall settings
- Ensure CORS allows WebSocket upgrade

**Problem**: "Authentication failed"
**Solutions**:
- Verify JWT token is valid
- Check token hasn't expired
- Ensure correct secret key
- Verify user role

### Message Issues

**Problem**: Messages not received
**Solutions**:
- Check WebSocket readyState (should be OPEN = 1)
- Verify message format is correct JSON
- Check server logs for errors
- Ensure connection is registered

**Problem**: Duplicate messages
**Solutions**:
- Implement message deduplication
- Use unique message IDs
- Track last processed message

### Performance Issues

**Problem**: High memory usage
**Solutions**:
- Limit chat message history
- Implement message pagination
- Clear old connections
- Monitor connection count

**Problem**: Slow message delivery
**Solutions**:
- Reduce message size
- Batch updates
- Optimize broadcast logic
- Consider Redis for pub/sub

## Testing

### Manual Testing

```javascript
// Connect
const ws = new WebSocket('ws://localhost:3000');

// Register
ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'register',
    sessionId: 'test-session-123'
  }));
};

// Log messages
ws.onmessage = (event) => {
  console.log('Received:', event.data);
};

// Send test message
ws.send(JSON.stringify({
  type: 'chat_message',
  username: 'TestUser',
  message: 'Hello from test!',
  timestamp: new Date().toISOString()
}));
```

### Automated Testing

Use tools like:
- `ws` library for Node.js tests
- `socket.io-client` for integration tests
- Postman for WebSocket testing

## Monitoring

**Key Metrics**:
- Active connections count
- Messages per second
- Average message size
- Connection duration
- Error rate
- Memory usage

**Logging**:
```javascript
console.log('🔌 New WebSocket connection established');
console.log('✅ Registered customer WebSocket connection: ${sessionId}');
console.log('📤 Broadcasted to ${count} connections');
console.log('❌ WebSocket error:', error);
```

## Future Enhancements

- [ ] Message acknowledgment system
- [ ] Automatic reconnection on server
- [ ] Message queuing for offline users
- [ ] Compression for large messages
- [ ] Binary message support
- [ ] Presence indicators
- [ ] Typing indicators
- [ ] Read receipts
- [ ] Message history sync
- [ ] WebSocket clustering with Redis
