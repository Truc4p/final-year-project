# Simple System Connections

```mermaid
flowchart LR
    Admin["Admin<br/>Mobile App"]
    Customer["Customer<br/>Mobile App"]
    Frontend["Frontend<br/>Web App"]
    Backend["Backend API<br/>Port 3000"]
    WS["WebSocket<br/>Port 3000"]
    Agora["Agora<br/>Video Service"]
    
    Admin -->|REST API| Backend
    Admin -->|WebSocket| WS
    Admin -->|Video Stream| Agora
    
    Customer -->|REST API| Backend
    Customer -->|WebSocket| WS
    Customer -->|Video Stream| Agora
    
    Frontend -->|REST API| Backend
    Frontend -->|WebSocket| WS
    
    Backend -.->|Token| Agora
    WS -.->|Events| Backend

    classDef client fill:#e1f5ff,stroke:#0288d1,stroke-width:2px
    classDef server fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef external fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    
    class Admin,Customer,Frontend client
    class Backend,WS server
    class Agora external
```

## Connection Types:

**Solid lines (→)**: Active data flow
- REST API: HTTP requests/responses
- WebSocket: Real-time bidirectional messages
- Video Stream: Direct RTC connection

**Dotted lines (-.->)**: Coordination/Support
- Backend generates tokens for Agora
- WebSocket shares state with Backend
