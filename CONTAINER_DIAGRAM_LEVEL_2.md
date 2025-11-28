# Container Diagram (Level 2) - Wrencos Platform

## Mermaid Diagram

```mermaid
graph TB
    subgraph "User Interfaces"
        WEB["🌐 Web Application<br/>Vue.js 3 + Vite<br/>Tailwind CSS"]
        MOBILE_CUST["📱 Mobile App - Customer<br/>React Native + Expo"]
        MOBILE_ADMIN["📱 Mobile App - Admin<br/>React Native + Expo"]
    end

    subgraph "Backend Services"
        API["🔧 Backend API Server<br/>Node.js + Express.js<br/>Port: 3000"]
        WS["🔌 WebSocket Manager<br/>Real-time Communication<br/>Chat, Streams, Likes"]
    end

    subgraph "Data & Storage"
        MONGO["🗄️ MongoDB Atlas<br/>Cloud Database<br/>Users, Products, Orders,<br/>Chats, Livestreams"]
        VECTOR["🔍 Qdrant Vector DB<br/>Semantic Search<br/>Knowledge Base<br/>Embeddings"]
    end

    subgraph "External Services"
        GEMINI["🤖 Google Gemini AI<br/>Dermatology Consultation<br/>Product Recommendations<br/>AI Chat"]
        VNPAY["💳 VNPay Gateway<br/>Payment Processing<br/>Transaction Handling"]
        SMTP["📧 SMTP Email Server<br/>Transactional Emails<br/>Marketing Campaigns<br/>Newsletters"]
        AGORA["🎥 Agora SDK<br/>Live Video Streaming<br/>Real-time Video<br/>Communication"]
    end

    %% Web Application Connections
    WEB -->|REST API| API
    WEB -->|WebSocket| WS

    %% Mobile Customer Connections
    MOBILE_CUST -->|REST API| API
    MOBILE_CUST -->|WebSocket| WS
    MOBILE_CUST -->|Video Stream| AGORA

    %% Mobile Admin Connections
    MOBILE_ADMIN -->|REST API| API
    MOBILE_ADMIN -->|WebSocket| WS
    MOBILE_ADMIN -->|Video Broadcast| AGORA

    %% Backend to Data Storage
    API -->|Read/Write| MONGO
    API -->|Query| VECTOR
    WS -->|Read/Write| MONGO

    %% Backend to External Services
    API -->|AI Queries| GEMINI
    API -->|Process Payments| VNPAY
    API -->|Send Emails| SMTP
    API -->|Video Config| AGORA

    %% Styling
    classDef ui fill:#4A90E2,stroke:#2E5C8A,stroke-width:2px,color:#fff
    classDef backend fill:#7B68EE,stroke:#5A4BA8,stroke-width:2px,color:#fff
    classDef storage fill:#50C878,stroke:#2D7A4A,stroke-width:2px,color:#fff
    classDef external fill:#FF6B6B,stroke:#CC5555,stroke-width:2px,color:#fff

    class WEB,MOBILE_CUST,MOBILE_ADMIN ui
    class API,WS backend
    class MONGO,VECTOR storage
    class GEMINI,VNPAY,SMTP,AGORA external
```

## Container Descriptions

### **User Interfaces**
| Container | Technology | Purpose |
|-----------|-----------|---------|
| **Web Application** | Vue.js 3, Vite, Tailwind CSS | Web-based shopping, admin dashboard, analytics |
| **Mobile App - Customer** | React Native, Expo | Mobile shopping, livestream participation, AI consultation |
| **Mobile App - Admin** | React Native, Expo | Livestream hosting, product management, customer support |

### **Backend Services**
| Container | Technology | Purpose |
|-----------|-----------|---------|
| **Backend API Server** | Node.js, Express.js | RESTful API endpoints, business logic, route handlers |
| **WebSocket Manager** | ws library | Real-time chat, stream status, viewer counts, likes |

### **Data & Storage**
| Container | Technology | Purpose |
|-----------|-----------|---------|
| **MongoDB Atlas** | MongoDB Cloud | Persistent data storage (users, products, orders, chats) |
| **Qdrant Vector DB** | Vector Database | Semantic search, knowledge base embeddings, RAG |

### **External Services**
| Container | Service | Purpose |
|-----------|---------|---------|
| **Google Gemini AI** | Google API | AI dermatology consultation, recommendations, chat |
| **VNPay Gateway** | Payment Service | Payment processing, transaction handling |
| **SMTP Email Server** | Email Service | Transactional emails, marketing campaigns, newsletters |
| **Agora SDK** | Video Service | Live video streaming, real-time communication |

## Data Flow Summary

### **REST API Communication**
```
Frontend/Mobile → HTTP/HTTPS → Backend API → Controllers → MongoDB
```

### **Real-Time Communication**
```
Frontend/Mobile ← WebSocket → WebSocket Manager → MongoDB
```

### **AI Processing**
```
User Query → Backend API → Gemini AI → Response
```

### **Payment Processing**
```
Frontend → Backend API → VNPay → Payment Status → MongoDB
```

### **Email Distribution**
```
Backend Service → SMTP Server → User Email
```

### **Video Streaming**
```
Mobile Admin → Agora SDK → Mobile Customer
```

## Key Interactions

1. **Web & Mobile Apps** communicate with Backend API via REST and WebSocket
2. **Backend API** manages all business logic and routes requests
3. **WebSocket Manager** handles real-time updates (chat, streams, engagement)
4. **MongoDB** stores all persistent data
5. **Qdrant** provides semantic search capabilities
6. **External Services** handle specialized functions (AI, payments, email, video)

## Technology Stack

- **Frontend:** Vue.js 3, Vite, Tailwind CSS
- **Mobile:** React Native, Expo
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas
- **Vector DB:** Qdrant
- **Real-time:** WebSocket
- **AI:** Google Gemini API
- **Payment:** VNPay
- **Email:** SMTP/Nodemailer
- **Video:** Agora SDK

