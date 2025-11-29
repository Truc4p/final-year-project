# WrenCOS System Connections Diagram

This diagram shows the connections between Backend API, Agora, Admin App, Customer App, and WebSocket.

```mermaid
flowchart TB
    subgraph "Mobile Apps"
        Admin["Admin Mobile App<br/>(React Native)"]
        Customer["Customer Mobile App<br/>(React Native)"]
    end
    
    subgraph "Backend Server" 
        API["Backend API<br/>(Express.js)<br/>Port 3000"]
        WS["WebSocket Server<br/>(ws library)<br/>Same Port 3000"]
        DB[("MongoDB<br/>Database")]
    end
    
    subgraph "External Services"
        Agora["Agora RTC<br/>(Video Streaming)"]
    end
    
    %% Admin to Backend connections
    Admin -->|"HTTP/REST API<br/>Auth Token"| API
    Admin -->|"WebSocket<br/>register_admin<br/>stream control"| WS
    Admin -->|"Agora SDK<br/>Video Broadcast<br/>(Publisher)"| Agora
    
    %% Customer to Backend connections
    Customer -->|"HTTP/REST API<br/>Optional Auth"| API
    Customer -->|"WebSocket<br/>register<br/>chat, likes"| WS
    Customer -->|"Agora SDK<br/>Video Viewer<br/>(Subscriber)"| Agora
    
    %% Backend internal connections
    API <-->|"Query/Update<br/>Stream data"| DB
    WS <-->|"Access models<br/>Stream state"| DB
    API -.->|"Share wsManager<br/>instance"| WS
    
    %% Backend to Agora
    API -->|"Generate RTC Token<br/>/livestreams/agora/token"| Agora
    
    %% WebSocket broadcasts
    WS -->|"Real-time updates<br/>stream_started<br/>stream_stopped<br/>viewer_count<br/>likes, chat"| Admin
    WS -->|"Real-time updates<br/>stream_started<br/>stream_stopped<br/>viewer_count<br/>likes, chat"| Customer
    
    %% API endpoints used
    API -->|"REST Endpoints:<br/>/livestreams (CRUD)<br/>/livestreams/active<br/>/livestreams/:id/view<br/>/livestreams/:id/chat<br/>/products<br/>/orders<br/>/auth"| Admin
    API -->|"REST Endpoints:<br/>/livestreams/active<br/>/livestreams/past<br/>/livestreams/:id<br/>/livestreams/:id/view<br/>/products<br/>/orders"| Customer

    classDef mobileApp fill:#e1f5ff,stroke:#0288d1,stroke-width:2px
    classDef backend fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef external fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef database fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
    
    class Admin,Customer mobileApp
    class API,WS backend
    class Agora external
    class DB database
```

## Connection Details

### Admin Mobile App
- **REST API**: Authenticates with JWT token, manages livestreams (create, update, stop)
- **WebSocket**: Registers as admin, sends stream control messages (start_stream, stop_stream)
- **Agora SDK**: Uses `ClientRoleBroadcaster` to publish video stream to channel

### Customer Mobile App
- **REST API**: Fetches active/past streams, products, optional authentication
- **WebSocket**: Registers with sessionId, sends chat messages, likes, receives real-time updates
- **Agora SDK**: Uses `ClientRoleAudience` to subscribe to video stream from channel

### Backend API (Express.js)
- **HTTP Server**: Runs on port 3000, provides REST endpoints for all operations
- **Routes**: Authentication, livestreams, products, orders, analytics, chat, payments, etc.
- **Token Generation**: Generates Agora RTC tokens using AGORA_APP_ID and AGORA_APP_CERTIFICATE

### WebSocket Server
- **Same Port**: Runs on same port 3000 as HTTP server (WebSocket upgrade)
- **Connection Types**: Tracks admin connections (by userId) and customer connections (by sessionId)
- **Real-time Broadcasting**: 
  - `stream_started` / `stream_stopped`: Notifies all clients when stream state changes
  - `stream_update`: Updates viewer count, likes, quality
  - `chat_message`: Broadcasts chat to all viewers
  - `toggle_like`: Updates like count in real-time
  - `pinned_products_updated`: Notifies when products are pinned during stream

### Agora RTC
- **Video Streaming**: Handles real-time video transmission
- **Channel-based**: Each livestream has unique channel name (derived from streamId)
- **Roles**: 
  - Broadcaster (Admin) - publishes video
  - Audience (Customer) - subscribes to video
- **Token Auth**: Requires token from backend for secure channel access
