# Mobile Livestream Architecture - Detailed Code Flow

This document provides comprehensive diagrams explaining how the livestream code works between Mobile App Admin and Mobile App Customer, based on the actual implementation in the codebase.

```mermaid
sequenceDiagram
    autonumber
    participant Admin as Mobile App Admin<br/>(Broadcaster)
    participant AgoraBroadcaster as Agora Broadcaster<br/>Component
    participant Backend as Backend Server<br/>(Node.js)
    participant WebSocket as WebSocket Server
    participant AgoraServer as Agora RTC Server
    participant Customer as Mobile App Customer<br/>(Viewer)
    participant AgoraViewer as Agora Viewer<br/>Component

    rect rgb(230, 240, 255)
    Note over Admin,Backend: Stream Setup Phase
    Admin->>+Backend: POST /livestreams<br/>{title, description, quality}
    Backend->>Backend: Check for active streams
    Backend->>Backend: Create LiveStream in DB<br/>(status: active)
    Backend-->>-Admin: 201 Created<br/>{livestream: {_id, title, ...}}
    Admin->>Admin: Store streamId<br/>Show stream UI
    end

    rect rgb(255, 240, 230)
    Note over Admin,AgoraServer: Initialize Agora Broadcasting
    Admin->>+AgoraBroadcaster: Initialize with streamId
    AgoraBroadcaster->>AgoraBroadcaster: Create Agora RTC Engine
    AgoraBroadcaster->>AgoraBroadcaster: Set Channel Profile:<br/>Live Broadcasting
    AgoraBroadcaster->>AgoraBroadcaster: Set Client Role:<br/>Broadcaster
    AgoraBroadcaster->>+Backend: POST /livestreams/agora/token<br/>{channelName, uid: 0}
    Backend->>Backend: Generate Agora Token<br/>(RtcTokenBuilder)
    Backend-->>-AgoraBroadcaster: {token, channelName}
    AgoraBroadcaster->>AgoraBroadcaster: Start camera preview
    AgoraBroadcaster->>+AgoraServer: Join Channel<br/>(token, channelName, uid: 0)
    AgoraServer-->>-AgoraBroadcaster: Channel joined successfully
    AgoraBroadcaster-->>-Admin: Broadcasting started
    end

    rect rgb(240, 255, 240)
    Note over Admin,Customer: WebSocket Real-time Updates
    Admin->>+WebSocket: WebSocket: start_stream<br/>{streamId}
    WebSocket->>Backend: Fetch stream data from DB
    Backend-->>WebSocket: LiveStream document
    WebSocket->>WebSocket: Update in-memory state<br/>{isActive: true, viewerCount: 0}
    WebSocket-->>Customer: Broadcast: stream_started<br/>{streamData: {...}}
    WebSocket-->>-Admin: Stream started confirmed
    end

    rect rgb(255, 250, 240)
    Note over Customer,AgoraServer: Customer Joins Stream
    Customer->>Customer: Receive stream_started<br/>via WebSocket
    Customer->>Customer: Display "LIVE" banner<br/>Show stream info
    Customer->>+WebSocket: WebSocket: register<br/>{sessionId, token}
    WebSocket->>WebSocket: Store customer connection<br/>Increment viewerCount
    WebSocket-->>Admin: Broadcast: viewer_count<br/>{count: 1}
    WebSocket-->>-Customer: Registration confirmed
    
    Customer->>+AgoraViewer: Initialize with streamId
    AgoraViewer->>AgoraViewer: Create Agora RTC Engine
    AgoraViewer->>AgoraViewer: Set Channel Profile:<br/>Live Broadcasting
    AgoraViewer->>AgoraViewer: Set Client Role:<br/>Audience
    AgoraViewer->>+Backend: POST /livestreams/agora/token<br/>{channelName, uid: 0, role: 'audience'}
    Backend->>Backend: Generate Agora Token<br/>(Subscriber role)
    Backend-->>-AgoraViewer: {token, channelName}
    AgoraViewer->>+AgoraServer: Join Channel<br/>(token, channelName, uid: 0)
    AgoraServer-->>-AgoraViewer: Channel joined
    AgoraServer->>AgoraViewer: Stream remote video<br/>(from broadcaster uid)
    AgoraViewer-->>-Customer: Display live video
    
    Customer->>+Backend: POST /livestreams/{id}/view
    Backend->>Backend: Increment view count in DB
    Backend-->>-Customer: View recorded
    end

    rect rgb(250, 240, 255)
    Note over Admin,Customer: Interactive Features
    
    par Product Pinning
        Admin->>+Backend: POST /livestreams/{id}/pin-product<br/>{productId}
        Backend->>Backend: Add product to pinned list
        Backend-->>-Admin: Product pinned
        Admin->>+WebSocket: WebSocket: pinned_products_updated<br/>{streamId, products}
        WebSocket-->>Customer: Broadcast: pinned_products_updated
        WebSocket-->>-Admin: Update confirmed
        Customer->>Customer: Display pinned products
    and Chat Messages
        Customer->>+WebSocket: WebSocket: chat_message<br/>{streamId, message, username}
        WebSocket-->>Admin: Broadcast: new_message<br/>{message, username, timestamp}
        WebSocket-->>-Customer: Broadcast: new_message
        Admin->>Admin: Display chat message
        Customer->>Customer: Display chat message
    and Like/Unlike
        Customer->>+WebSocket: WebSocket: toggle_like<br/>{streamId, userId/sessionId}
        WebSocket->>WebSocket: Update likes in memory<br/>Add/remove from likedBy set
        WebSocket-->>Admin: Broadcast: like_update<br/>{likes, likedBy}
        WebSocket-->>-Customer: Broadcast: like_update
        Admin->>Admin: Update like count display
        Customer->>Customer: Update like button state
    end
    end

    rect rgb(255, 240, 240)
    Note over Admin,Customer: Stream Termination
    Admin->>+AgoraBroadcaster: Stop broadcasting
    AgoraBroadcaster->>AgoraBroadcaster: Stop camera preview
    AgoraBroadcaster->>+AgoraServer: Leave channel
    AgoraServer-->>-AgoraBroadcaster: Channel left
    AgoraBroadcaster-->>-Admin: Broadcasting stopped
    
    Admin->>+Backend: POST /livestreams/{id}/stop<br/>{maxViewers, viewCount, likes}
    Backend->>Backend: Update LiveStream in DB<br/>{isActive: false, endTime, duration}
    Backend-->>-Admin: 200 OK<br/>{message: "Stream stopped"}
    
    Admin->>+WebSocket: WebSocket: stop_stream<br/>{streamId}
    WebSocket->>WebSocket: Update in-memory state<br/>{isActive: false}
    WebSocket-->>Customer: Broadcast: stream_stopped<br/>{streamId}
    WebSocket-->>-Admin: Stop confirmed
    
    Customer->>Customer: Hide LIVE banner<br/>Show "Stream ended"
    Customer->>+AgoraViewer: Stop viewing
    AgoraViewer->>+AgoraServer: Leave channel
    AgoraServer-->>-AgoraViewer: Channel left
    AgoraViewer-->>-Customer: Viewing stopped
    
    Customer->>+Backend: GET /livestreams/past
    Backend->>Backend: Query completed streams
    Backend-->>-Customer: {livestreams: [past streams]}
    Customer->>Customer: Display past streams list
    end
```

## Key Technologies

### Agora RTC (Real-Time Communication)
- **For Admin**: Uses `ClientRoleType.ClientRoleBroadcaster` to publish video/audio
- **For Customer**: Uses `ClientRoleType.ClientRoleAudience` to subscribe to video/audio
- **Token-based authentication**: Backend generates tokens with appropriate privileges
- **Channel-based**: Both broadcaster and viewers join the same channel using streamId

### WebSocket (Real-Time Updates)
- **Connection Management**: Separate maps for admin and customer connections
- **Real-time Events**: 
  - `stream_started` / `stream_stopped`
  - `chat_message`
  - `toggle_like`
  - `pinned_products_updated`
  - `viewer_count`
- **In-memory State**: Maintains current stream state for instant updates

### Backend API
- **RESTful Endpoints**: CRUD operations for livestreams
- **Database**: MongoDB with LiveStream model
- **Authentication**: JWT tokens for admin actions
- **Optional Auth**: Customers can view without login (uses sessionId)

## Flow Summary

1. **Admin starts stream**: Creates livestream record, initializes Agora broadcaster, broadcasts via WebSocket
2. **Customers receive notification**: WebSocket notifies all connected customers of new stream
3. **Customers join**: Connect to Agora channel as audience, receive video stream
4. **Interactive features**: Chat, likes, and product pins synchronized via WebSocket
5. **Admin stops stream**: Leaves Agora channel, updates database, broadcasts stop event
6. **Customers notified**: Receive stop event, leave channel, can view past streams

---

## Additional Detailed Diagrams

### 1. Component Architecture Diagram

```mermaid
graph TB
    subgraph "Mobile App Admin"
        A1[LivestreamScreen.js]
        A2[AgoraBroadcaster.js]
        A3[livestreamService.js<br/>Admin]
        A1 -->|"manages"| A2
        A1 -->|"uses"| A3
        A2 -->|"uses"| A3
    end
    
    subgraph "Mobile App Customer"
        C1[LivestreamScreen.js]
        C2[AgoraViewer.js]
        C3[livestreamService.js<br/>Customer]
        C1 -->|"manages"| C2
        C1 -->|"uses"| C3
        C2 -->|"uses"| C3
    end
    
    subgraph "Backend Server"
        B1[WebSocket Server]
        B2[REST API]
        B3[MongoDB]
        B4[Agora Token Generator]
        B2 -->|"reads/writes"| B3
        B2 -->|"generates tokens"| B4
    end
    
    subgraph "External Services"
        E1[Agora RTC Server]
    end
    
    A3 -.->|"WebSocket"| B1
    A3 -.->|"HTTP/REST"| B2
    A2 -.->|"RTC Channel"| E1
    
    C3 -.->|"WebSocket"| B1
    C3 -.->|"HTTP/REST"| B2
    C2 -.->|"RTC Channel"| E1
    
    B1 -.->|"broadcasts events"| C3
    B1 -.->|"broadcasts events"| A3
    
    style A1 fill:#ffcccc
    style A2 fill:#ffdddd
    style A3 fill:#ffeeee
    style C1 fill:#ccffcc
    style C2 fill:#ddffdd
    style C3 fill:#eeffee
    style B1 fill:#ccccff
    style B2 fill:#ddddff
    style E1 fill:#ffffcc
```

### 2. WebSocket Connection & Message Flow

```mermaid
sequenceDiagram
    autonumber
    participant AdminService as Admin Service<br/>(livestreamService.js)
    participant WS as WebSocket Server<br/>(websocket.js)
    participant CustomerService as Customer Service<br/>(livestreamService.js)

    rect rgb(255, 240, 240)
    Note over AdminService,WS: Admin Connection Setup
    AdminService->>+WS: new WebSocket(wsUrl + "?token=...&role=admin")
    WS-->>AdminService: onopen event
    AdminService->>WS: {type: 'register_admin',<br/>userId, token}
    WS->>WS: Verify JWT token<br/>Check admin/staff role
    WS->>WS: adminConnections.set(userId, {ws, userRole})
    WS-->>-AdminService: {type: 'admin_registered',<br/>userId, status: 'connected'}
    end

    rect rgb(240, 255, 240)
    Note over CustomerService,WS: Customer Connection Setup
    CustomerService->>+WS: new WebSocket(wsUrl)
    WS-->>CustomerService: onopen event
    CustomerService->>WS: {type: 'register',<br/>sessionId, token}
    WS->>WS: customerConnections.set(sessionId,<br/>{ws, userId, userRole})
    WS->>WS: updateViewerCount()
    WS-->>CustomerService: {type: 'registered',<br/>sessionId, status: 'connected'}
    WS-->>-CustomerService: {type: 'current_stream_status', ...}
    end

    rect rgb(240, 240, 255)
    Note over AdminService,CustomerService: Stream Start Broadcast
    AdminService->>+WS: {type: 'start_stream',<br/>streamId}
    WS->>WS: Fetch LiveStream from DB
    WS->>WS: Update in-memory state:<br/>{isActive: true, streamId, ...}
    WS-->>AdminService: Confirm to admin
    WS-->>-CustomerService: Broadcast: {type: 'stream_started',<br/>streamData: {...}}
    end

    rect rgb(255, 250, 240)
    Note over AdminService,CustomerService: Interactive Messages
    par Chat Message
        CustomerService->>WS: {type: 'chat_message',<br/>username, message, timestamp}
        WS-->>AdminService: Broadcast to all
        WS-->>CustomerService: Broadcast to all
    and Toggle Like
        CustomerService->>WS: {type: 'toggle_like',<br/>userId, sessionId}
        WS->>WS: Update likes in memory<br/>Add/remove from likedBy Set
        WS-->>AdminService: Broadcast: {type: 'like_update',<br/>likes, likedBy}
        WS-->>CustomerService: Broadcast: {type: 'like_update',<br/>likes, likedBy}
    and Product Pin
        AdminService->>WS: {type: 'pinned_products_updated',<br/>streamId, products}
        WS-->>CustomerService: Broadcast to all customers
    end
    end

    rect rgb(255, 240, 240)
    Note over AdminService,CustomerService: Stream Stop
    AdminService->>+WS: {type: 'stop_stream',<br/>streamId}
    WS->>WS: Update in-memory state:<br/>{isActive: false}
    WS-->>AdminService: Confirm to admin
    WS-->>-CustomerService: Broadcast: {type: 'stream_stopped',<br/>streamData: {streamId}}
    end
```

### 3. Admin Livestream Lifecycle (State Machine)

```mermaid
stateDiagram-v2
    [*] --> Idle: App Launch
    
    Idle --> PermissionsCheck: User taps Start Stream button
    PermissionsCheck --> StreamSetup: Permissions Granted
    PermissionsCheck --> Idle: Permissions Denied
    
    StreamSetup --> CreatingStream: User enters title and submits
    
    CreatingStream --> InitializingAgora: POST livestreams returns streamId
    
    InitializingAgora --> Broadcasting: Agora initialized and Channel joined
    
    Broadcasting --> Broadcasting: Handle events for chat products viewers
    
    Broadcasting --> Stopping: User stops or App backgrounds
    
    Stopping --> Cleanup: Stop API Leave channel WebSocket stop
    
    Cleanup --> Idle: Reset state and Clear data
    
    Idle --> [*]: App Exit
    
    note right of Broadcasting
        State Variables:
        isStreaming true
        currentStreamId
        streamDuration timer
        viewerCount
        likes
        chatMessages array
        pinnedProducts array
    end note
    
    note right of Cleanup
        Cleanup Actions:
        stopBroadcasting
        leaveChannel
        stopPreview
        disconnectWebSocket
    end note
```

### 4. Customer Viewing Flow (State Machine)

```mermaid
stateDiagram-v2
    [*] --> Loading: Screen Mount
    
    Loading --> CheckingStream: Initialize session and Connect WebSocket
    
    CheckingStream --> NoStream: No active stream found
    CheckingStream --> StreamAvailable: Active stream found
    
    NoStream --> NoStream: Display past streams and listen
    NoStream --> StreamAvailable: Stream started received
    
    StreamAvailable --> JoiningAgora: Display LIVE banner and Initialize Viewer
    
    JoiningAgora --> Viewing: Channel joined and video streaming
    
    Viewing --> Viewing: Interactive actions chat likes cart
    
    Viewing --> StreamEnded: Stream stopped received
    
    StreamEnded --> NoStream: Leave channel Hide video
    
    NoStream --> [*]: Screen Unmount
    
    note right of Viewing
        State Variables:
        isLive true
        currentStream
        viewerCount
        likes and likedBy array
        isLiked
        chatMessages array
        pinnedProducts array
    end note
```

### 5. Agora Broadcasting Implementation (Admin)

```mermaid
flowchart TD
    Start([Component Mount]) --> Init[Initialize Agora Engine]
    
    Init --> CreateEngine[createAgoraRtcEngine]
    CreateEngine --> InitEngine["engine.initialize with appId"]
    InitEngine --> RegisterHandlers["Register Event Handlers"]
    RegisterHandlers --> EnableVideo["engine.enableVideo"]
    EnableVideo --> SetInitialized["setIsInitialized: true"]
    
    SetInitialized --> WaitStream{"isStreaming and streamId ready?"}
    
    WaitStream -->|No| WaitStream
    WaitStream -->|Yes| StartBroadcast[Start Broadcasting]
    
    StartBroadcast --> SetProfile["setChannelProfile: LiveBroadcasting"]
    SetProfile --> SetRole["setClientRole: Broadcaster"]
    SetRole --> StartPreview["startPreview - Enable camera"]
    StartPreview --> FetchToken["Fetch Agora Token from API"]
    
    FetchToken --> JoinChannel["joinChannel with token and channelName"]
    
    JoinChannel --> Broadcasting{Broadcasting}
    
    Broadcasting -->|Stream continues| Broadcasting
    Broadcasting -->|"isStreaming: false"| StopBroadcast[Stop Broadcasting]
    
    StopBroadcast --> StopPreview[stopPreview]
    StopPreview --> LeaveChannel[leaveChannel]
    LeaveChannel --> WaitStream
    
    Broadcasting -->|Component unmount| Cleanup[Cleanup]
    Cleanup --> LeaveChannel2[leaveChannel]
    LeaveChannel2 --> ReleaseEngine["engine.release"]
    ReleaseEngine --> End([End])
    
    style Start fill:#ffcccc
    style Broadcasting fill:#ffddaa
    style End fill:#ffcccc
```

### 6. Agora Viewing Implementation (Customer)

```mermaid
flowchart TD
    Start([Component Mount]) --> Init[Initialize Agora Engine]
    
    Init --> CreateEngine[createAgoraRtcEngine]
    CreateEngine --> InitEngine["engine.initialize with appId"]
    InitEngine --> RegisterHandlers["Register Event Handlers"]
    RegisterHandlers --> EnableVideo["engine.enableVideo"]
    EnableVideo --> SetInitialized["setIsInitialized: true"]
    
    SetInitialized --> WaitLive{"isLive and streamId ready?"}
    
    WaitLive -->|No| WaitLive
    WaitLive -->|Yes| JoinChannel[Join Channel as Audience]
    
    JoinChannel --> FetchToken["Fetch Agora Token from API"]
    FetchToken --> SetProfile["setChannelProfile: LiveBroadcasting"]
    SetProfile --> SetRole["setClientRole: Audience"]
    SetRole --> Join["joinChannel with token and channelName"]
    
    Join --> WaitRemote{Wait for remote user}
    
    WaitRemote -->|onUserJoined| RemoteJoined["setRemoteUid: uid"]
    RemoteJoined --> Viewing[Viewing Stream]
    
    Viewing --> RenderVideo["Render RtcSurfaceView with remoteUid"]
    
    Viewing -->|"isLive: false"| Leave[Leave Channel]
    Viewing -->|onUserOffline| RemoteLeft["setRemoteUid: null"]
    RemoteLeft --> WaitRemote
    
    Leave --> LeaveChannel[leaveChannel]
    LeaveChannel --> ResetState["Reset remoteUid and isJoined"]
    ResetState --> WaitLive
    
    Viewing -->|Component unmount| Cleanup[Cleanup]
    Cleanup --> LeaveChannel2[leaveChannel]
    LeaveChannel2 --> ReleaseEngine["engine.release"]
    ReleaseEngine --> End([End])
    
    WaitRemote -->|Timeout or no broadcaster| ShowPlaceholder["Show: Connecting to stream..."]
    
    style Start fill:#ccffcc
    style Viewing fill:#aaffdd
    style End fill:#ccffcc
```

### 7. Data Flow - REST API Calls

```mermaid
sequenceDiagram
    autonumber
    participant Admin as Admin App
    participant Backend as Backend API
    participant DB as MongoDB
    participant AgoraToken as Agora Token<br/>Generator
    participant Customer as Customer App

    rect rgb(255, 245, 245)
    Note over Admin,DB: Create Livestream
    Admin->>+Backend: POST /livestreams<br/>{title, description, quality}
    Backend->>DB: Check for active streams
    Backend->>DB: Create new LiveStream document<br/>{isActive: true, startTime: now()}
    DB-->>Backend: {_id, title, ...}
    Backend-->>-Admin: 201 Created<br/>{livestream: {...}}
    end

    rect rgb(245, 255, 245)
    Note over Admin,AgoraToken: Get Agora Token (Admin)
    Admin->>+Backend: POST /livestreams/agora/token<br/>{channelName, uid: 0}
    Backend->>AgoraToken: RtcTokenBuilder.buildTokenWithUid<br/>role: PUBLISHER
    AgoraToken-->>Backend: token (24h expiry)
    Backend-->>-Admin: {token, channelName}
    end

    rect rgb(245, 245, 255)
    Note over Customer,AgoraToken: Get Active Stream & Token (Customer)
    Customer->>+Backend: GET /livestreams/active
    Backend->>DB: findOne({isActive: true})
    DB-->>Backend: LiveStream document
    Backend-->>-Customer: {livestream: {...}}
    
    Customer->>+Backend: POST /livestreams/agora/token<br/>{channelName, uid: 0, role: 'audience'}
    Backend->>AgoraToken: RtcTokenBuilder.buildTokenWithUid<br/>role: SUBSCRIBER
    AgoraToken-->>Backend: token (24h expiry)
    Backend-->>-Customer: {token, channelName}
    end

    rect rgb(255, 250, 245)
    Note over Admin,DB: Product Pinning
    Admin->>+Backend: POST /livestreams/{id}/pin-product<br/>{productId}
    Backend->>DB: Update LiveStream:<br/>push to pinnedProducts array
    Backend->>DB: Populate product details
    DB-->>Backend: Updated stream with products
    Backend-->>-Admin: {pinnedProducts: [...]}
    end

    rect rgb(255, 245, 255)
    Note over Customer,DB: Increment View Count
    Customer->>+Backend: POST /livestreams/{id}/view
    Backend->>DB: findByIdAndUpdate:<br/>$inc: {viewCount: 1}
    DB-->>Backend: Updated document
    Backend-->>-Customer: 200 OK
    end

    rect rgb(255, 240, 240)
    Note over Admin,DB: Stop Livestream
    Admin->>+Backend: POST /livestreams/{id}/stop<br/>{maxViewers, viewCount, likes}
    Backend->>DB: Update LiveStream:<br/>{isActive: false,<br/>endTime: now(),<br/>duration: calculated,<br/>maxViewers, likes}
    DB-->>Backend: Updated document
    Backend-->>-Admin: 200 OK<br/>{message: "Stream stopped"}
    end
```

### 8. WebSocket Event Handlers (Code-level)

```mermaid
graph TB
    subgraph "Admin App - handleWebSocketMessage"
        AMsg[Receive WebSocket Message]
        AMsg --> ASwitch{data.type}
        
        ASwitch -->|stream_update| A1["Update viewerCount and likes"]
        ASwitch -->|chat_message| A2["Check duplicate, Add to chatMessages, Auto-scroll"]
        ASwitch -->|pinned_products_updated| A3["Update pinnedProducts array"]
        ASwitch -->|default| A4["Ignore unknown type"]
    end
    
    subgraph "Customer App - handleWebSocketMessage"
        CMsg[Receive WebSocket Message]
        CMsg --> CSwitch{data.type}
        
        CSwitch -->|stream_started| C1["Set isLive true, setCurrentStream, Update stats, Fetch products"]
        CSwitch -->|stream_stopped| C2["Set isLive false, Clear currentStream, Stop Agora viewer"]
        CSwitch -->|stream_update| C3["Update viewerCount, likes, likedBy array"]
        CSwitch -->|chat_message| C4["Add to chatMessages, Auto-scroll"]
        CSwitch -->|chat_history| C5["Set chatMessages with history"]
        CSwitch -->|pinned_products_updated| C6["Update pinnedProducts array"]
        CSwitch -->|default| C7["Log unknown type"]
    end
    
    subgraph "Backend - WebSocket Manager"
        BMsg[handleMessage]
        BMsg --> BSwitch{data.type}
        
        BSwitch -->|register| B1["registerConnection, Store in customerConnections, Send stream status"]
        BSwitch -->|register_admin| B2["registerAdminConnection, Verify token, Store in adminConnections"]
        BSwitch -->|start_stream| B3["Fetch stream from DB, broadcastStreamStatus"]
        BSwitch -->|stop_stream| B4["Update in-memory state, broadcastStreamStatus"]
        BSwitch -->|chat_message| B5["broadcastChatMessage to all connections"]
        BSwitch -->|toggle_like| B6["handleToggleLike, Update likes, Broadcast"]
        BSwitch -->|pinned_products_updated| B7["broadcastPinnedProductsUpdate"]
    end
    
    style A2 fill:#ffdddd
    style C1 fill:#ddffdd
    style C2 fill:#ffdddd
    style B3 fill:#ddddff
    style B4 fill:#ffdddd
```

## Key Implementation Details

### Admin Service (livestreamService.js)
```javascript
// Connection
connectWebSocket(token)
  ├─> new WebSocket(wsUrl + "?token=...&role=admin")
  ├─> onopen: send {type: 'register_admin', userId, token}
  ├─> onmessage: notify all messageHandlers
  └─> attemptReconnect on close

// Core Methods
createLivestream(data) → POST /livestreams
stopLivestream(streamId, data) → POST /livestreams/{id}/stop
getAgoraToken(channelName, uid) → POST /livestreams/agora/token

// WebSocket Actions
startStream(streamId) → send {type: 'start_stream', streamId}
stopStream(streamId) → send {type: 'stop_stream', streamId}
sendChatMessage(message, username) → send {type: 'chat_message', ...}
```

### Customer Service (livestreamService.js)
```javascript
// Connection
connectWebSocket(token)
  ├─> new WebSocket(wsUrl)
  ├─> onopen: send {type: 'register', sessionId, token}
  ├─> onmessage: notify all messageHandlers
  └─> attemptReconnect with exponential backoff

// Core Methods
getActiveStream() → GET /livestreams/active
getPastStreams(limit) → GET /livestreams/past?limit={limit}
getPinnedProducts(streamId) → GET /livestreams/{id}/pinned-products
incrementViewCount(streamId) → POST /livestreams/{id}/view

// WebSocket Actions
sendChatMessage(message, username) → send {type: 'chat_message', ...}
toggleLike(userId, sessionId) → send {type: 'toggle_like', ...}
```

### State Management

**Admin LivestreamScreen State:**
- `isStreaming`: boolean - Broadcasting status
- `currentStreamId`: string - Active stream ID
- `streamDuration`: number - Timer in seconds
- `viewerCount`, `likes`: numbers - Real-time stats
- `chatMessages[]`: Array of message objects
- `pinnedProducts[]`: Array of pinned products
- `showStreamSetup`: boolean - Modal visibility

**Customer LivestreamScreen State:**
- `isLive`: boolean - Whether stream is active
- `currentStream`: object - Stream data
- `viewerCount`, `likes`, `likedBy[]`: Real-time stats
- `isLiked`: boolean - Current user's like status
- `chatMessages[]`: Array of message objects
- `pinnedProducts[]`: Array of pinned products
- `pastStreams[]`: Array of completed streams

### Component Lifecycle

**AgoraBroadcaster:**
1. Mount → Initialize engine → Register handlers
2. isStreaming=true → Start broadcasting → Join channel
3. isStreaming=false → Stop broadcasting → Leave channel
4. Unmount → Cleanup → Release engine

**AgoraViewer:**
1. Mount → Initialize engine → Register handlers
2. isLive=true + streamId → Join channel as audience
3. onUserJoined → Render remote video
4. isLive=false → Leave channel
5. Unmount → Cleanup → Release engine
