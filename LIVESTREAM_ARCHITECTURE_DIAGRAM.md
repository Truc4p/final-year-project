# Livestream Architecture Diagram (Web uses WebRTC; Mobile uses Agora)

## System Overview Diagram

```mermaid
graph TB
    subgraph AdminWeb["🖥️ Admin Web Interface"]
        AdminUI["Admin Live Stream Page<br/>AdminLiveStream.vue"]
        AdminControls["Stream Controls<br/>- Start/Stop<br/>- Camera Toggle<br/>- Mic Toggle<br/>- Pin Products"]
        AdminChat["Admin Chat<br/>Send/Receive Messages"]
    end

    subgraph CustomerWeb["👥 Customer Web Interface"]
        CustomerUI["Customer Live Stream Page<br/>LiveStream.vue"]
        VideoPlayer["Video Player<br/>Plays WebRTC Remote Media"]
        CustomerChat["Customer Chat<br/>Send Messages"]
        LikeButton["Like Button<br/>Toggle Like"]
    end

    subgraph Backend["⚙️ Backend Server"]
        Controller["Live Stream Controller<br/>liveStreamController.js"]
        Model["Live Stream Model<br/>liveStream.js"]
        Database["MongoDB<br/>Streams, Chat, Stats"]
        WebSocketMgr["WebSocket Manager<br/>websocket.js"]
        SecretMgr["Secret Manager<br/>secretManager.js"]
    end

    subgraph RealTime["🔄 Real-Time Communication"]
        WebSocket["WebSocket Server<br/>Signaling + Live updates"]
    end

    %% Web (Browser) Streaming via WebRTC
    subgraph WebStreaming["📹 Web Streaming (Browser)"]
        WebRTC["WebRTC (RTCPeerConnection)<br/>Peer-to-peer Media"]
        Signaling["Signaling via WebSocket<br/>webrtc_* messages"]
    end

    %% Mobile Streaming via Agora (Separate from Web)
    subgraph MobileStreaming["📱 Mobile Streaming (Agora)"]
        AgoraSDK["Agora SDK (Mobile Apps)"]
        AgoraToken["Token Endpoint<br/>/livestreams/agora/token"]
    end

    subgraph Storage["💾 Storage"]
        VideoFiles["Video Files<br/>uploads/livestreams/"]
        Thumbnails["Thumbnails<br/>uploads/thumbnails/"]
    end

    %% Admin Web Connections (WebRTC)
    AdminUI --> AdminControls
    AdminUI --> AdminChat
    AdminControls -->|Create/Stop Stream (REST)| Controller
    AdminChat -->|Send Message| WebSocketMgr

    %% Customer Web Connections (WebRTC)
    CustomerUI --> VideoPlayer
    CustomerUI --> CustomerChat
    CustomerUI --> LikeButton
    CustomerChat -->|Send Message| WebSocketMgr
    LikeButton -->|Toggle Like| WebSocketMgr

    %% WebRTC Signaling
    AdminUI -->|webrtc_register / broadcast_start| WebSocketMgr
    CustomerUI -->|webrtc_register| WebSocketMgr
    WebSocketMgr -->|offer/answer/ICE relay| AdminUI
    WebSocketMgr -->|offer/answer/ICE relay| CustomerUI

    %% Media Path (Web)
    AdminUI -->|Send Media Tracks| WebRTC
    WebRTC -->|Remote Media| VideoPlayer

    %% Backend Connections
    Controller -->|Save/Update| Model
    Model -->|Persist Data| Database
    Controller -->|Broadcast status| WebSocketMgr
    WebSocketMgr -->|Manage Connections| WebSocket

    %% Storage
    Controller -->|Save Video| VideoFiles
    Controller -->|Save Thumbnail| Thumbnails

    %% Mobile (Agora) - separate path from Web
    AgoraToken -->|Get credentials| SecretMgr
    AgoraSDK -->|Used by Mobile Apps| AgoraToken

    style AdminWeb fill:#e1f5ff
    style CustomerWeb fill:#f3e5f5
    style Backend fill:#fff3e0
    style RealTime fill:#e8f5e9
    style WebStreaming fill:#e8f4ff
    style MobileStreaming fill:#fce4ec
    style Storage fill:#f1f8e9
```

## Detailed Flow (Web): Admin Starts Livestream with WebRTC

```mermaid
sequenceDiagram
    participant Admin as Admin User (Web)
    participant AdminUI as Admin UI (Vue)
    participant Backend as Backend Server
    participant WS as WebSocket (Signaling)
    participant DB as MongoDB
    participant Customer as Customer User (Web)
    participant CustomerUI as Customer UI (Vue)

    Admin->>AdminUI: Click "Start Stream"
    AdminUI->>Backend: POST /livestreams {title, description, quality}
    Backend->>DB: Create stream (isActive: true)
    DB-->>Backend: Stream created (id)
    Backend->>WS: Broadcast stream_started
    WS-->>CustomerUI: Notify stream started

    AdminUI->>AdminUI: getUserMedia() to capture camera/mic
    AdminUI->>WS: webrtc_register + webrtc_broadcast_start
    CustomerUI->>WS: webrtc_register
    WS-->>AdminUI: webrtc_new_customer(customerId)
    AdminUI->>WS: webrtc_offer(to: customerId)
    WS-->>CustomerUI: webrtc_offer(from: admin)
    CustomerUI->>WS: webrtc_answer(to: admin)
    WS-->>AdminUI: webrtc_answer(from: customer)
    AdminUI-->>CustomerUI: ICE candidates exchanged via WS
    AdminUI-->>CustomerUI: WebRTC connection established (media flows)
    Customer->>CustomerUI: Watch video/audio
```

## Detailed Flow (Web): Customer Interactions During Livestream

```mermaid
sequenceDiagram
    participant Customer as Customer User (Web)
    participant CustomerUI as Customer UI (Vue)
    participant WS as WebSocket
    participant Backend as Backend
    participant DB as MongoDB
    participant AdminUI as Admin UI (Vue)
    participant Admin as Admin User

    rect rgb(200, 220, 255)
    Note over Customer,AdminUI: Chat Message Flow
    Customer->>CustomerUI: Type and send message
    CustomerUI->>WS: chat_message {username, message, timestamp}
    Backend->>DB: Save to activeStream.chatMessages
    WS->>AdminUI: Broadcast message
    WS->>CustomerUI: Broadcast message to all customers
    end

    rect rgb(220, 200, 255)
    Note over Customer,AdminUI: Like Toggle Flow
    Customer->>CustomerUI: Click Like button
    CustomerUI->>WS: toggle_like {userId/sessionId}
    WS->>Backend: Update likes/likedBy
    Backend->>DB: Persist likes/likedBy
    WS->>CustomerUI: stream_update {likes, likedBy}
    WS->>AdminUI: stream_update {likes}
    end

    rect rgb(200, 255, 220)
    Note over Customer,AdminUI: Viewer Count Update
    CustomerUI->>WS: register (on connect)
    WS->>WS: Update viewer count
    WS->>CustomerUI: stream_update {viewerCount}
    WS->>AdminUI: stream_update {viewerCount}
    end
```

## Detailed Flow (Web): Admin Stops Livestream

```mermaid
sequenceDiagram
    participant Admin as Admin User (Web)
    participant AdminUI as Admin UI (Vue)
    participant Backend as Backend
    participant DB as MongoDB
    participant WS as WebSocket
    participant CustomerUI as Customer UI (Vue)

    Admin->>AdminUI: Click "Stop Stream"
    AdminUI->>Backend: POST /livestreams/{id}/stop {stats}
    Backend->>DB: isActive:false, endTime, duration, stats
    Backend->>WS: Broadcast stream_stopped
    AdminUI->>WS: webrtc_broadcast_stop
    WS-->>CustomerUI: webrtc_broadcast_stopped
    AdminUI->>AdminUI: Stop tracks & cleanup WebRTC
    CustomerUI->>CustomerUI: Clear video element
```

## Detailed Flow: Pinned Products (Web)

```mermaid
sequenceDiagram
    participant Admin as Admin User (Web)
    participant AdminUI as Admin UI (Vue)
    participant Backend as Backend
    participant DB as MongoDB
    participant WS as WebSocket
    participant CustomerUI as Customer UI (Vue)

    Admin->>AdminUI: Select product to pin
    AdminUI->>Backend: POST /livestreams/{id}/pin-product {productId}
    Backend->>DB: Add pinnedProducts[].isActive=true
    Backend->>WS: Broadcast pinned_products_updated
    WS-->>CustomerUI: Update UI (featured products)

    Admin->>AdminUI: Unpin product
    AdminUI->>Backend: DELETE /livestreams/{id}/unpin-product/{productId}
    Backend->>DB: Set pinnedProducts[].isActive=false
    Backend->>WS: Broadcast pinned_products_updated
    WS-->>CustomerUI: Update UI
```

## WebSocket Message Types (Web + Signaling)

```mermaid
graph LR
    subgraph ClientToServer["Client → Server"]
        C1["register<br/>register_admin"]
        C2["chat_message"]
        C3["toggle_like"]
        C4["stream_started<br/>stream_stopped"]
        C5["pinned_products_updated"]
        C6["webrtc_register"]
        C7["webrtc_offer / webrtc_answer"]
        C8["webrtc_ice_candidate"]
        C9["webrtc_broadcast_start / stop"]
    end

    subgraph ServerToClient["Server → Client"]
        S1["stream_started / stream_stopped"]
        S2["stream_update (viewerCount, likes)"]
        S3["chat_message / chat_history"]
        S4["pinned_products_updated"]
        S5["registered / admin_registered"]
        S6["webrtc_broadcaster_available / webrtc_new_customer"]
        S7["webrtc_offer / webrtc_answer / webrtc_ice_candidate"]
        S8["webrtc_broadcast_stopped"]
    end

    style ClientToServer fill:#e3f2fd
    style ServerToClient fill:#f3e5f5
```

## Data Flow: Stream State Management (Web)

```mermaid
graph TB
    subgraph InMemory["In-Memory State<br/>WebSocket Manager"]
        State["currentStreamState<br/>- isActive<br/>- streamId<br/>- viewerCount<br/>- likes<br/>- likedBy Set<br/>- title, description"]
    end

    subgraph Database["MongoDB<br/>Persistent Storage"]
        StreamDoc["livestream Document<br/>- _id, title, description<br/>- isActive, startTime, endTime<br/>- duration, quality<br/>- viewCount, likes, likedBy<br/>- pinnedProducts[]<br/>- chatMessages[]<br/>- videoUrl, thumbnailUrl"]
    end

    subgraph ClientState["Client-Side State (Vue Store)"]
        AdminState["Admin: isStreaming, duration, pinnedProducts, chat"]
        CustomerState["Customer: isLive, currentStream, viewerCount, isLiked, chat"]
    end

    State -->|Sync on start/stop| StreamDoc
    State -->|Real-time updates| ClientState
    StreamDoc -->|Load on connect| State
    AdminState -->|User actions| State
    CustomerState -->|User actions| State

    style InMemory fill:#e8f5e9
    style Database fill:#fff3e0
    style ClientState fill:#f3e5f5
```

## Mobile-only: Agora Token Generation (Not used by Web)

```mermaid
graph LR
    subgraph MobileClients["Mobile Apps"]
        AdminReq["Mobile Admin requests token<br/>role: 'publisher'"]
        CustomerReq["Mobile Customer requests token<br/>role: 'subscriber'"]
    end

    subgraph Backend["Backend Server"]
        TokenEndpoint["POST /livestreams/agora/token"]
        TokenBuilder["RtcTokenBuilder.buildTokenWithUid"]
        SecretMgr["Secret Manager<br/>AGORA_APP_ID + AGORA_APP_CERTIFICATE"]
    end

    subgraph Agora["Agora Service"]
        AgoraSDK["Agora RTC Engine"]
    end

    AdminReq -->|POST with role| TokenEndpoint
    CustomerReq -->|POST with role| TokenEndpoint
    TokenEndpoint -->|Get credentials| SecretMgr
    TokenEndpoint -->|Build token| TokenBuilder
    TokenBuilder -->|Return token| AdminReq
    TokenBuilder -->|Return token| CustomerReq
    AdminReq -->|Initialize with token| AgoraSDK
    CustomerReq -->|Initialize with token| AgoraSDK

    style MobileClients fill:#e3f2fd
    style Backend fill:#fff3e0
    style Agora fill:#fce4ec
```

## Key Components Summary

- Web (Browser):
  - frontend/src/pages/admin/live-stream/AdminLiveStream.vue (captures camera/mic, starts/stops stream, pins products)
  - frontend/src/pages/customer/live-stream/LiveStream.vue (plays WebRTC remote stream, likes, chat)
  - frontend/src/stores/livestreamStore.js (WebSocket + WebRTC signaling, peer management)
  - backend/websocket.js (signaling server, chat/likes/viewers, pinned products)
  - backend/controllers/livestream/liveStreamController.js (REST CRUD, recording upload, pinned products)
- Mobile (Agora):
  - mobile-app-admin and mobile-app-customer use Agora SDK; backend exposes /livestreams/agora/token
