# WrenCos Livestream System - C4 Diagrams

## System Context Diagram (Level 1)

```mermaid
C4Context
    title System Context Diagram - WrenCos Livestream System

    Person(admin, "Admin User", "Content creator who broadcasts live product demonstrations and beauty tutorials")
    Person(customer, "Customer User", "Watches live streams, interacts via chat, and purchases featured products")

    System(wrencos, "WrenCos Livestream System", "Enables real-time video streaming with product showcasing, chat, and analytics")

    System_Ext(webrtc, "WebRTC Infrastructure", "Google STUN/TURN servers for peer-to-peer connection establishment")
    System_Ext(mongodb, "MongoDB Atlas", "Cloud-hosted database for livestream metadata, chat history, and analytics")
    System_Ext(storage, "File Storage", "Stores recorded livestream videos and thumbnails")

    Rel(admin, wrencos, "Creates and broadcasts livestreams", "HTTPS/WSS")
    Rel(customer, wrencos, "Watches livestreams and interacts", "HTTPS/WSS")
    Rel(wrencos, webrtc, "Establishes P2P connections", "WebRTC/ICE")
    Rel(wrencos, mongodb, "Reads/writes data", "MongoDB Protocol")
    Rel(wrencos, storage, "Uploads/retrieves videos", "HTTP")

    UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="1")
```

---

## Container Diagram (Level 2)

```mermaid
C4Container
    title Container Diagram - WrenCos Livestream System

    Person(admin, "Admin User", "Broadcasts livestreams")
    Person(customer, "Customer User", "Watches livestreams")

    Container_Boundary(wrencos, "WrenCos Livestream System") {
        Container(adminWeb, "Admin Web Application", "Vue.js SPA", "Provides livestream broadcasting interface with camera controls, product pinning, and chat monitoring")
        
        Container(customerWeb, "Customer Web Application", "Vue.js SPA", "Provides livestream viewing interface with real-time chat, likes, and product showcase")
        
        Container(api, "Backend API", "Node.js/Express", "Handles HTTP requests for livestream CRUD, authentication, and file uploads")
        
        Container(wsServer, "WebSocket Server", "Node.js/WebSocket", "Manages real-time bidirectional communication for stream status, chat, and WebRTC signaling")
        
        Container(livestreamStore, "Livestream State Store", "Vue Reactive Store", "Manages WebRTC connections, shared media streams, and real-time UI state")
    }

    System_Ext(webrtc, "WebRTC STUN/TURN", "Google servers")
    System_Ext(mongodb, "MongoDB Atlas", "Cloud database")
    System_Ext(fileSystem, "File Storage", "Server filesystem")

    Rel(admin, adminWeb, "Starts stream, pins products, monitors chat", "HTTPS")
    Rel(customer, customerWeb, "Watches stream, sends chat, likes", "HTTPS")
    
    Rel(adminWeb, api, "Creates livestream, uploads recordings", "HTTPS/REST")
    Rel(adminWeb, wsServer, "Broadcasts stream status, WebRTC signaling", "WSS")
    Rel(adminWeb, livestreamStore, "Manages local stream, peer connections")
    
    Rel(customerWeb, api, "Fetches stream info, updates views", "HTTPS/REST")
    Rel(customerWeb, wsServer, "Receives stream updates, WebRTC signaling", "WSS")
    Rel(customerWeb, livestreamStore, "Manages remote stream, viewer state")
    
    Rel(api, mongodb, "CRUD operations", "MongoDB Protocol")
    Rel(api, fileSystem, "Saves videos/thumbnails", "File I/O")
    
    Rel(wsServer, mongodb, "Saves chat messages", "MongoDB Protocol")
    
    Rel(livestreamStore, webrtc, "NAT traversal, ICE candidates", "STUN/TURN")
    
    Rel_Back(adminWeb, customerWeb, "Direct P2P video/audio stream", "WebRTC")

    UpdateLayoutConfig($c4ShapeInRow="2", $c4BoundaryInRow="1")
```

---

## Component Diagram (Level 3) - Livestream Flow

```mermaid
C4Component
    title Component Diagram - Livestream Broadcasting & Viewing Flow

    Container_Boundary(adminWeb, "Admin Web Application") {
        Component(adminUI, "Admin Livestream UI", "Vue Component", "Camera preview, stream controls, product management")
        Component(mediaCapture, "Media Capture", "MediaDevices API", "Captures camera and microphone input")
        Component(mediaRecorder, "Media Recorder", "MediaRecorder API", "Records stream for later playback")
        Component(adminWS, "Admin WebSocket Client", "WebSocket", "Sends stream control messages")
        Component(adminRTC, "Admin RTC Manager", "RTCPeerConnection", "Broadcasts to multiple customers")
    }

    Container_Boundary(backend, "Backend Services") {
        Component(livestreamAPI, "Livestream API", "Express Router", "CRUD endpoints for livestreams")
        Component(wsManager, "WebSocket Manager", "WebSocketManager class", "Connection management and message routing")
        Component(rtcSignaling, "WebRTC Signaling", "WebSocket handlers", "Coordinates offer/answer/ICE exchange")
        Component(uploadHandler, "Upload Handler", "Multer middleware", "Processes video/thumbnail uploads")
        Component(livestreamModel, "Livestream Model", "Mongoose Schema", "Database operations")
    }

    Container_Boundary(customerWeb, "Customer Web Application") {
        Component(customerUI, "Customer Livestream UI", "Vue Component", "Video player, chat, likes, products")
        Component(videoPlayer, "Video Player", "HTML5 Video", "Displays live or recorded stream")
        Component(customerWS, "Customer WebSocket Client", "WebSocket", "Receives stream updates")
        Component(customerRTC, "Customer RTC Manager", "RTCPeerConnection", "Receives stream from admin")
    }

    System_Ext(mongodb, "MongoDB Atlas")
    System_Ext(stunServer, "STUN Server")

    ' Admin flow
    Rel(adminUI, mediaCapture, "getUserMedia()")
    Rel(mediaCapture, adminUI, "MediaStream")
    Rel(adminUI, mediaRecorder, "Starts/stops recording")
    Rel(adminUI, adminWS, "Sends start_stream, stop_stream")
    Rel(adminUI, livestreamAPI, "POST /livestreams (create)")
    
    Rel(mediaCapture, adminRTC, "Attaches MediaStream tracks")
    Rel(adminRTC, rtcSignaling, "Sends offers via WebSocket")
    Rel(adminRTC, stunServer, "ICE candidate gathering")
    
    Rel(adminWS, wsManager, "stream_started, pinned_products")
    Rel(mediaRecorder, uploadHandler, "Uploads recorded blob")
    
    ' Backend processing
    Rel(livestreamAPI, livestreamModel, "Save/update livestream")
    Rel(livestreamModel, mongodb, "Persist data")
    Rel(wsManager, rtcSignaling, "Routes WebRTC messages")
    Rel(uploadHandler, livestreamModel, "Updates videoUrl")
    
    ' Customer flow
    Rel(customerUI, livestreamAPI, "GET /livestreams/:id")
    Rel(customerUI, customerWS, "Connects and registers")
    Rel(customerWS, wsManager, "Receives stream_started")
    Rel(wsManager, customerWS, "Broadcasts updates")
    
    Rel(customerWS, customerRTC, "Triggers WebRTC connection")
    Rel(customerRTC, rtcSignaling, "Sends answers via WebSocket")
    Rel(customerRTC, stunServer, "ICE candidate gathering")
    
    Rel(rtcSignaling, customerRTC, "Forwards offers from admin")
    Rel(adminRTC, customerRTC, "Direct P2P media stream", "WebRTC")
    Rel(customerRTC, videoPlayer, "Sets srcObject")
    Rel(videoPlayer, customerUI, "Displays video")

    UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="1")
```

---

## Sequence Diagram - Complete Livestream Flow

```mermaid
sequenceDiagram
    participant A as Admin Web App
    participant API as Backend API
    participant WS as WebSocket Server
    participant DB as MongoDB
    participant C as Customer Web App
    participant STUN as STUN Server

    Note over A,C: 1. STREAM INITIALIZATION
    A->>A: getUserMedia(camera + mic)
    A->>API: POST /livestreams<br/>{title, description, quality}
    API->>DB: Insert livestream record
    DB-->>API: livestream._id
    API-->>A: {livestream: {_id, ...}}
    
    Note over A,C: 2. WEBSOCKET & WEBRTC SETUP
    A->>WS: Connect WebSocket
    A->>WS: {type: "register_admin", userId}
    WS-->>A: {type: "admin_registered"}
    
    C->>WS: Connect WebSocket
    C->>WS: {type: "register", sessionId}
    WS-->>C: {type: "registered"}
    
    A->>WS: {type: "webrtc_register", userType: "admin"}
    C->>WS: {type: "webrtc_register", userType: "customer"}
    
    Note over A,C: 3. BROADCAST STREAM START
    A->>WS: {type: "stream_started", streamData}
    WS->>DB: Update currentStreamState
    WS->>C: Broadcast {type: "stream_started", streamData}
    
    Note over A,C: 4. WEBRTC PEER CONNECTION
    C->>WS: {type: "webrtc_new_customer", customerId}
    WS->>A: Forward new customer request
    
    A->>A: createOffer()
    A->>STUN: Gather ICE candidates
    STUN-->>A: ICE candidates
    A->>WS: {type: "webrtc_offer", to: customerId, offer}
    WS->>C: Forward offer
    
    C->>C: setRemoteDescription(offer)
    C->>C: createAnswer()
    C->>STUN: Gather ICE candidates
    STUN-->>C: ICE candidates
    C->>WS: {type: "webrtc_answer", to: adminId, answer}
    WS->>A: Forward answer
    
    A->>A: setRemoteDescription(answer)
    
    A->>WS: {type: "webrtc_ice_candidate"}
    WS->>C: Forward ICE candidate
    C->>WS: {type: "webrtc_ice_candidate"}
    WS->>A: Forward ICE candidate
    
    Note over A,C: 5. P2P VIDEO STREAMING
    A-->>C: Direct WebRTC video/audio stream
    
    Note over A,C: 6. REAL-TIME INTERACTIONS
    C->>WS: {type: "chat_message", message}
    WS->>DB: Save chat message
    WS->>A: Broadcast chat to admin
    WS->>C: Broadcast chat to all viewers
    
    C->>API: POST /livestreams/:id/like
    API->>DB: Update likes count
    API-->>C: {likes: 42}
    WS->>A: {type: "stream_update", likes: 42}
    WS->>C: Broadcast likes update
    
    A->>API: POST /livestreams/:id/pin-product
    API->>DB: Update pinnedProducts
    API-->>A: {pinnedProducts: [...]}
    A->>WS: {type: "pinned_products_updated"}
    WS->>C: Broadcast pinned products
    
    Note over A,C: 7. STREAM ENDING
    A->>A: Stop MediaRecorder
    A->>A: Generate thumbnail from recording
    A->>API: POST /uploads/livestream-video<br/>(video blob)
    API->>DB: Save video file
    API-->>A: {filename: "stream-123.webm"}
    
    A->>API: POST /uploads/thumbnail<br/>(thumbnail blob)
    API->>DB: Save thumbnail
    API-->>A: {thumbnailUrl: "/uploads/..."}
    
    A->>API: POST /livestreams/:id/stop<br/>{maxViewers, viewCount, likes}
    API->>DB: Update livestream<br/>{isActive: false, endTime, videoUrl}
    API-->>A: {livestream: {...}}
    
    A->>WS: {type: "stream_stopped", streamId}
    WS->>C: Broadcast stream_stopped
    
    C->>C: Close RTCPeerConnection
    A->>A: Close all peer connections
```

---

## Data Flow Diagram - Key Interactions

```mermaid
flowchart TB
    subgraph Admin["Admin Web Application"]
        A1[Camera/Mic Capture]
        A2[Stream Controls UI]
        A3[MediaRecorder]
        A4[WebSocket Client]
        A5[RTCPeerConnection Admin]
    end

    subgraph Backend["Backend Services"]
        B1[Express API<br/>Port 3000]
        B2[WebSocket Server<br/>Same Port]
        B3[WebRTC Signaling]
        B4[File Upload Handler]
    end

    subgraph Database["Data Layer"]
        D1[(MongoDB Atlas<br/>LiveStream Collection)]
        D2[(Chat Messages)]
        D3[(Pinned Products)]
        D4[File System<br/>Videos/Thumbnails]
    end

    subgraph Customer["Customer Web Application"]
        C1[Video Player UI]
        C2[Chat & Likes UI]
        C3[WebSocket Client]
        C4[RTCPeerConnection Customer]
    end

    subgraph External["External Services"]
        E1[STUN Server<br/>stun.l.google.com]
    end

    %% Admin flows
    A1 -->|MediaStream| A5
    A2 -->|Start Stream| B1
    A2 -->|Stream Metadata| B2
    A3 -->|Record Blob| B4
    A4 -->|Control Messages| B2
    A5 -->|ICE Candidates| E1
    A5 -.->|WebRTC Signaling| B3

    %% Backend flows
    B1 -->|Save/Update| D1
    B2 -->|Save Chats| D2
    B2 -->|Update Products| D3
    B3 -.->|Route Messages| B2
    B4 -->|Store Files| D4
    B4 -->|Update URLs| D1

    %% Customer flows
    C3 -->|Register/Subscribe| B2
    B2 -->|Broadcast Events| C3
    C3 -->|Stream Updates| C1
    C4 -->|ICE Candidates| E1
    C4 -.->|WebRTC Signaling| B3
    C2 -->|Chat/Likes| B1
    B1 -->|Updates| C2

    %% P2P connection
    A5 ==>|Direct Video/Audio<br/>WebRTC P2P| C4
    C4 -->|MediaStream| C1

    %% Styling
    classDef adminStyle fill:#e1f5ff,stroke:#01579b,stroke-width:2px
    classDef backendStyle fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    classDef customerStyle fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef dataStyle fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px
    classDef externalStyle fill:#fce4ec,stroke:#880e4f,stroke-width:2px

    class A1,A2,A3,A4,A5 adminStyle
    class B1,B2,B3,B4 backendStyle
    class C1,C2,C3,C4 customerStyle
    class D1,D2,D3,D4 dataStyle
    class E1 externalStyle
```

---

## Deployment Diagram

```mermaid
C4Deployment
    title Deployment Diagram - WrenCos Livestream System

    Deployment_Node(client, "Client Device", "Browser (Chrome/Firefox/Safari)") {
        Container(spa, "Web Application", "Vue.js SPA", "Admin or Customer interface")
    }

    Deployment_Node(server, "Application Server", "Node.js Server") {
        Container(express, "Backend API", "Express.js", "REST API endpoints")
        Container(websocket, "WebSocket Server", "ws library", "Real-time messaging")
        Container(uploads, "Upload Directory", "File System", "Stores videos & thumbnails")
    }

    Deployment_Node(database, "Cloud Database", "MongoDB Atlas") {
        ContainerDb(mongo, "Primary Database", "MongoDB", "Livestream data, chat, analytics")
    }

    Deployment_Node(stun, "Google Cloud", "Public STUN/TURN") {
        System_Ext(stunServers, "WebRTC Infrastructure", "NAT traversal & ICE")
    }

    Rel(spa, express, "API calls", "HTTPS/REST")
    Rel(spa, websocket, "Real-time events", "WSS")
    Rel(spa, stunServers, "ICE gathering", "STUN/TURN")
    Rel(express, mongo, "Data operations", "MongoDB Protocol")
    Rel(websocket, mongo, "Chat persistence", "MongoDB Protocol")
    Rel(express, uploads, "File I/O", "Node.js fs")

    UpdateLayoutConfig($c4ShapeInRow="2", $c4BoundaryInRow="2")
```

---

## Technology Stack Summary

### Frontend (Admin & Customer Web Apps)
- **Framework**: Vue.js 3 with Composition API
- **State Management**: Reactive Store (`livestreamStore.js`)
- **HTTP Client**: Axios
- **WebSocket**: Native WebSocket API
- **WebRTC**: RTCPeerConnection API
- **Media**: MediaDevices API, MediaRecorder API
- **UI**: Tailwind CSS

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **WebSocket**: `ws` library
- **Database ODM**: Mongoose
- **File Upload**: Multer
- **Authentication**: JWT (JSON Web Tokens)

### Database & Storage
- **Database**: MongoDB Atlas (Cloud)
- **File Storage**: Local filesystem (`uploads/livestreams/`)

### External Services
- **WebRTC**: Google STUN servers (`stun.l.google.com:19302`)
- **NAT Traversal**: ICE (Interactive Connectivity Establishment)

### Communication Protocols
- **REST API**: HTTPS for CRUD operations
- **WebSocket**: WSS for real-time bidirectional messaging
- **WebRTC**: Peer-to-peer media streaming (UDP/SRTP)
- **MongoDB Protocol**: Database communication

---

## Key Architectural Decisions

### 1. **Hybrid Architecture: REST + WebSocket + WebRTC**
   - **REST**: Stateless operations (create livestream, fetch history)
   - **WebSocket**: Real-time signaling and metadata updates
   - **WebRTC**: Efficient P2P video/audio streaming

### 2. **WebRTC for Video Streaming (Not Server-Relayed)**
   - Direct peer-to-peer connections reduce server bandwidth
   - Lower latency for live video
   - Scalable: Server only handles signaling, not media

### 3. **Centralized State Management**
   - `livestreamStore.js` manages all WebRTC connections
   - Single source of truth for stream state
   - Reactive updates to UI components

### 4. **Recording for VOD (Video on Demand)**
   - MediaRecorder captures live stream
   - Automatically uploaded after stream ends
   - Thumbnails generated client-side using Canvas API

### 5. **Separation of Concerns**
   - Admin app: Broadcasting, product management, analytics
   - Customer app: Viewing, chat, likes, purchases
   - Backend: Orchestration, persistence, signaling

---

## Security Considerations

1. **Authentication**: JWT tokens for API and WebSocket connections
2. **Authorization**: Role-based access (admin vs customer)
3. **HTTPS/WSS**: Encrypted communication channels
4. **SRTP**: Encrypted WebRTC media streams
5. **Input Validation**: API request sanitization
6. **Rate Limiting**: Express rate limiter on API endpoints
7. **CORS**: Configured origin restrictions

---

## Scalability Considerations

### Current Architecture (Single Server)
- WebSocket connections: ~1,000 concurrent
- WebRTC: P2P reduces server load
- Bottleneck: Signaling and file uploads

### Future Improvements
1. **Horizontal Scaling**: Multiple backend instances with Redis for WebSocket pub/sub
2. **CDN**: Serve recorded videos via CDN (CloudFront, Cloudflare)
3. **Media Server**: Integrate SFU (Selective Forwarding Unit) like Janus or Mediasoup
4. **Database Sharding**: Partition livestream data by date/region
5. **Load Balancer**: Nginx or AWS ALB for traffic distribution
