# Wrencos Platform - Rich Picture Diagram

This Rich Picture provides a comprehensive visual overview of the Wrencos e-commerce platform, showing all actors, systems, services, and interactions.

## System Overview Diagram

```mermaid
graph TB
    subgraph "EXTERNAL ACTORS"
        Customer["👤 CUSTOMERS<br/>• Browse products<br/>• AI chat assistance<br/>• Watch live streams<br/>• Shopping & checkout<br/>• Track orders<br/>• Subscribe newsletter"]
        Admin["👔 ADMIN/STAFF<br/>• Manage catalog<br/>• Conduct livestreams<br/>• View analytics<br/>• Email campaigns<br/>• Finance & HR<br/>• Customer support"]
    end

    subgraph "EXTERNAL SERVICES"
        Gemini["🤖 Google Gemini API<br/>gemini-2.0-flash<br/>AI Recommendations"]
        VNPay["💳 VNPay Gateway<br/>Payment Processing"]
        SMTP["📧 SMTP Server<br/>Gmail/SendGrid<br/>Email Delivery"]
    end

    subgraph "CLIENT LAYER"
        WebApp["🌐 Web Application<br/>Vue.js 3 + Vite<br/>• Customer portal<br/>• Shopping cart<br/>• Live streaming<br/>• AI chat<br/>• Tailwind CSS"]
        MobileApp["📱 Mobile App<br/>React Native + Expo<br/>• Product browsing<br/>• Live streaming<br/>• Push notifications<br/>• Offline support"]
        AdminDash["⚙️ Admin Dashboard<br/>Vue.js 3<br/>• Product CRUD<br/>• Analytics<br/>• Campaigns<br/>• Livestream mgmt"]
    end

    subgraph "BACKEND API SERVER - Node.js + Express.js"
        subgraph "API Gateway"
            Gateway["🚪 API Gateway<br/>• JWT Auth<br/>• CORS<br/>• Rate Limiting<br/>• Validation<br/>• Multer uploads<br/>• Swagger docs"]
        end

        subgraph "8 BACKEND SERVICES"
            EcomService["🛍️ E-COMMERCE<br/>• Products<br/>• Categories<br/>• Orders<br/>• Cart<br/>• Inventory<br/>• VNPay integration"]
            LiveService["📺 LIVESTREAM<br/>• Stream mgmt<br/>• WebSocket<br/>• Real-time chat<br/>• Product pinning<br/>• Recording<br/>• Analytics"]
            CommService["💬 COMMUNICATION<br/>• AI Chat (Gemini)<br/>• FAQ mgmt<br/>• Staff escalation<br/>• Conversation logs<br/>• Product search"]
            MarketService["📧 MARKETING<br/>• Email campaigns<br/>• Templates<br/>• Segments<br/>• Analytics<br/>• Newsletter<br/>• Nodemailer"]
            AnalyticsService["📊 ANALYTICS<br/>• Sales reports<br/>• Revenue metrics<br/>• Customer insights<br/>• Chart.js<br/>• Dashboard data"]
            FinanceService["💰 FINANCE<br/>• Expense tracking<br/>• Cash flow<br/>• P&L statements<br/>• Balance calc"]
            HRService["👥 HR<br/>• Employee records<br/>• Departments<br/>• Documents<br/>• Salaries"]
            AuthService["🔐 AUTH<br/>• Registration<br/>• Login/Logout<br/>• JWT tokens<br/>• Bcrypt hashing<br/>• Role mgmt"]
        end

        WebSocketServer["📡 WebSocket Server<br/>• Real-time messaging<br/>• Live chat broadcast<br/>• Viewer tracking<br/>• Like system<br/>• Admin notifications"]
    end

    subgraph "DATA LAYER"
        MongoDB["💾 MongoDB Atlas<br/>Mongoose ODM<br/><br/>Collections:<br/>• users<br/>• products<br/>• categories<br/>• orders<br/>• livestreams<br/>• chatconversations<br/>• faqs<br/>• emailcampaigns<br/>• emailtemplates<br/>• newslettersubscriptions<br/>• employees<br/>• cashflowtransactions<br/>• businessexpenses"]
    end

    %% Customer flows
    Customer -->|HTTP/WebSocket| WebApp
    Customer -->|HTTP/WebSocket| MobileApp
    
    %% Admin flows
    Admin -->|HTTP/WebSocket| AdminDash
    Admin -->|HTTP/WebSocket| WebApp
    
    %% Client to Gateway
    WebApp -->|REST API| Gateway
    MobileApp -->|REST API| Gateway
    AdminDash -->|REST API| Gateway
    
    %% Client to WebSocket
    WebApp -.->|WebSocket| WebSocketServer
    MobileApp -.->|WebSocket| WebSocketServer
    AdminDash -.->|WebSocket| WebSocketServer
    
    %% Gateway to Services
    Gateway --> EcomService
    Gateway --> LiveService
    Gateway --> CommService
    Gateway --> MarketService
    Gateway --> AnalyticsService
    Gateway --> FinanceService
    Gateway --> HRService
    Gateway --> AuthService
    
    %% Services to Database
    EcomService --> MongoDB
    LiveService --> MongoDB
    CommService --> MongoDB
    MarketService --> MongoDB
    AnalyticsService --> MongoDB
    FinanceService --> MongoDB
    HRService --> MongoDB
    AuthService --> MongoDB
    
    %% WebSocket to Database
    WebSocketServer --> MongoDB
    WebSocketServer --> LiveService
    
    %% External Service Integrations
    CommService -->|API calls| Gemini
    EcomService -->|Payment| VNPay
    MarketService -->|SMTP| SMTP
    
    %% Styling
    classDef actorStyle fill:#e1f5ff,stroke:#01579b,stroke-width:2px
    classDef externalStyle fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef clientStyle fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef serviceStyle fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px
    classDef dataStyle fill:#fce4ec,stroke:#880e4f,stroke-width:2px
    classDef gatewayStyle fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    classDef wsStyle fill:#e0f2f1,stroke:#004d40,stroke-width:2px
    
    class Customer,Admin actorStyle
    class Gemini,VNPay,SMTP externalStyle
    class WebApp,MobileApp,AdminDash clientStyle
    class EcomService,LiveService,CommService,MarketService,AnalyticsService,FinanceService,HRService,AuthService serviceStyle
    class MongoDB dataStyle
    class Gateway gatewayStyle
    class WebSocketServer wsStyle
```

## Key Data Flows

```mermaid
sequenceDiagram
    autonumber
    
    participant C as Customer
    participant W as Web/Mobile App
    participant G as API Gateway
    participant A as Auth Service
    participant E as E-Commerce Service
    participant AI as Communication Service
    participant Gem as Google Gemini
    participant L as Live Stream Service
    participant WS as WebSocket Server
    participant M as Marketing Service
    participant DB as MongoDB
    participant VP as VNPay
    participant SM as SMTP Server

    Note over C,SM: Flow 1: Customer Shopping Journey with AI Assistance
    
    C->>W: Browse products
    W->>G: GET /products
    G->>E: Fetch products
    E->>DB: Query products
    DB-->>E: Product data
    E-->>W: Product list
    
    C->>W: Ask AI for recommendations
    W->>G: POST /chat/ai
    G->>AI: Process chat
    AI->>DB: Search products & FAQs
    AI->>Gem: Generate AI response
    Gem-->>AI: Personalized recommendation
    AI->>DB: Save conversation
    AI-->>W: AI response + product links
    
    C->>W: Add to cart & checkout
    W->>G: POST /orders
    G->>E: Create order
    E->>VP: Process payment
    VP-->>E: Payment confirmation
    E->>DB: Save order
    E->>M: Trigger order email
    M->>SM: Send confirmation
    SM-->>C: Email received
    E-->>W: Order success

    Note over C,SM: Flow 2: Live Streaming Experience
    
    C->>W: Join live stream
    W->>WS: WebSocket connect
    WS->>L: Register viewer
    L->>DB: Increment viewer count
    WS-->>W: Stream data
    
    C->>WS: Send chat message
    WS->>L: Save message
    L->>DB: Store chat
    WS-->>W: Broadcast to all viewers
    
    C->>WS: Like stream
    WS->>L: Toggle like
    L->>DB: Update likes
    WS-->>W: Broadcast like count

    Note over C,SM: Flow 3: Email Marketing Campaign
    
    Note over M,SM: Admin creates campaign
    M->>DB: Fetch segments
    M->>DB: Get subscribers
    M->>SM: Bulk email send
    SM-->>C: Marketing email
    C->>W: Open/Click tracking
    W->>M: Track analytics
    M->>DB: Save analytics
```

## Service Interaction Map

```mermaid
graph LR
    subgraph "Customer-Facing Services"
        EC[E-Commerce Service]
        LS[LiveStream Service]
        CM[Communication Service]
    end
    
    subgraph "Admin Services"
        AN[Analytics Service]
        MK[Marketing Service]
        FN[Finance Service]
        HR[HR Service]
    end
    
    subgraph "Core Services"
        AU[Auth Service]
        WS[WebSocket Server]
    end
    
    subgraph "External APIs"
        GM[Google Gemini]
        VN[VNPay]
        EM[Email SMTP]
    end
    
    AU -.->|Authenticates| EC
    AU -.->|Authenticates| LS
    AU -.->|Authenticates| CM
    AU -.->|Authenticates| MK
    AU -.->|Authenticates| AN
    AU -.->|Authenticates| FN
    AU -.->|Authenticates| HR
    
    EC -->|Payment| VN
    CM -->|AI Query| GM
    MK -->|Send Email| EM
    
    WS -->|Real-time updates| LS
    WS -->|Chat notifications| CM
    
    EC -.->|Sales data| AN
    LS -.->|Stream analytics| AN
    MK -.->|Campaign metrics| AN
    
    classDef customerService fill:#4caf50,color:#fff
    classDef adminService fill:#2196f3,color:#fff
    classDef coreService fill:#ff9800,color:#fff
    classDef externalService fill:#9c27b0,color:#fff
    
    class EC,LS,CM customerService
    class AN,MK,FN,HR adminService
    class AU,WS coreService
    class GM,VN,EM externalService
```

## Technology Stack Overview

```mermaid
graph TB
    subgraph "Frontend Technologies"
        VueJS["Vue.js 3.5.12<br/>Composition API"]
        Vite["Vite 5.4.10<br/>Build Tool"]
        Tailwind["Tailwind CSS 3.4.14<br/>Styling"]
        VueRouter["Vue Router 4.4.5<br/>SPA Routing"]
        ChartJS["Chart.js 4.5.0<br/>Analytics Viz"]
        VueI18n["Vue I18n 11.0<br/>Multi-language"]
        Axios1["Axios 1.7.7<br/>HTTP Client"]
    end
    
    subgraph "Mobile Technologies"
        RN["React Native 0.73.6<br/>Cross-platform"]
        Expo["Expo 50.0<br/>Dev Platform"]
        RNav["React Navigation 6.1.9<br/>Navigation"]
        AsyncStor["AsyncStorage 1.21.0<br/>Local Storage"]
        VectorIcons["Vector Icons 10.0.3<br/>UI Icons"]
        Axios2["Axios 1.6.2<br/>HTTP Client"]
    end
    
    subgraph "Backend Technologies"
        NodeJS["Node.js 18+<br/>Runtime"]
        Express["Express.js 4.19.2<br/>Web Framework"]
        WS["WebSocket ws 8.18.3<br/>Real-time"]
        JWT["JWT 9.0.2<br/>Authentication"]
        Bcrypt["Bcryptjs 2.4.3<br/>Password Hash"]
        Mongoose["Mongoose 8.5.2<br/>MongoDB ODM"]
        GeminiSDK["@google/generative-ai 0.24.1<br/>AI Integration"]
        Nodemailer["Nodemailer 7.0.9<br/>Email Service"]
        Multer["Multer 1.4.5<br/>File Upload"]
        RateLimit["express-rate-limit 7.4.0<br/>API Protection"]
        Swagger["Swagger 6.2.8<br/>API Docs"]
        NodeCron["node-cron 4.2.1<br/>Task Scheduler"]
    end
    
    subgraph "Database & Cloud"
        MongoDB["MongoDB Atlas 8.0+<br/>NoSQL Database"]
        Cloud["Cloud Storage<br/>File Hosting"]
    end
    
    VueJS --> Vite
    VueJS --> Tailwind
    VueJS --> VueRouter
    VueJS --> ChartJS
    VueJS --> VueI18n
    VueJS --> Axios1
    
    RN --> Expo
    RN --> RNav
    RN --> AsyncStor
    RN --> VectorIcons
    RN --> Axios2
    
    NodeJS --> Express
    Express --> WS
    Express --> JWT
    Express --> Bcrypt
    Express --> Mongoose
    Express --> GeminiSDK
    Express --> Nodemailer
    Express --> Multer
    Express --> RateLimit
    Express --> Swagger
    Express --> NodeCron
    
    Mongoose --> MongoDB
    Multer --> Cloud
    
    Axios1 -.->|API Calls| Express
    Axios2 -.->|API Calls| Express
    
    classDef frontendTech fill:#42b983,color:#fff
    classDef mobileTech fill:#61dafb,color:#000
    classDef backendTech fill:#68a063,color:#fff
    classDef dataTech fill:#4db33d,color:#fff
    
    class VueJS,Vite,Tailwind,VueRouter,ChartJS,VueI18n,Axios1 frontendTech
    class RN,Expo,RNav,AsyncStor,VectorIcons,Axios2 mobileTech
    class NodeJS,Express,WS,JWT,Bcrypt,Mongoose,GeminiSDK,Nodemailer,Multer,RateLimit,Swagger,NodeCron backendTech
    class MongoDB,Cloud dataTech
```

## Data Model Relationships

```mermaid
erDiagram
    USER ||--o{ ORDER : places
    USER ||--o{ LIVESTREAM : creates
    USER ||--o{ CHATCONVERSATION : participates
    USER ||--o{ NEWSLETTERSUBSCRIPTION : subscribes
    USER ||--o{ EMPLOYEE : "is linked to"
    
    PRODUCT ||--o{ ORDER : contains
    PRODUCT }o--|| CATEGORY : "belongs to"
    PRODUCT ||--o{ LIVESTREAM_PINNED : "pinned in"
    
    ORDER ||--|| PAYMENT : processes
    
    LIVESTREAM ||--o{ CHAT_MESSAGE : contains
    LIVESTREAM ||--o{ LIVESTREAM_PINNED : has
    
    EMAILCAMPAIGN ||--|| EMAILTEMPLATE : uses
    EMAILCAMPAIGN ||--o{ EMAILANALYTICS : tracks
    EMAILCAMPAIGN }o--|| USER : "created by"
    
    CHATCONVERSATION ||--o{ MESSAGE : contains
    CHATCONVERSATION }o--o| FAQ : references
    CHATCONVERSATION }o--o| USER : "assigned to staff"
    
    CASHFLOWTRANSACTION }o--|| USER : "recorded by"
    BUSINESSEXPENSE }o--|| USER : "recorded by"
    
    USER {
        string username
        string password
        string email
        string role
        string phone
        object address
    }
    
    PRODUCT {
        string name
        string description
        number price
        array ingredients
        array skinTypes
        array concerns
        string imageUrl
        number inventory
        objectId categoryId
    }
    
    ORDER {
        objectId userId
        array products
        string paymentMethod
        string paymentStatus
        string status
        number totalPrice
        object shippingAddress
    }
    
    LIVESTREAM {
        string title
        objectId creatorId
        string streamUrl
        number viewerCount
        number likes
        array likedBy
        array chatMessages
        array pinnedProducts
        boolean isActive
    }
    
    CHATCONVERSATION {
        string sessionId
        objectId userId
        array messages
        boolean isStaffChat
        objectId assignedStaff
    }
    
    EMAILCAMPAIGN {
        string name
        objectId createdBy
        objectId templateId
        string type
        string status
        object segmentCriteria
        object analytics
    }
```

## Security & Infrastructure

```mermaid
graph TB
    subgraph "Security Layers"
        HTTPS[HTTPS/TLS Encryption]
        CORS[CORS Policy]
        RateLimit[Rate Limiting<br/>1000 req/15min]
        JWT[JWT Authentication<br/>1hr access + 7d refresh]
        Bcrypt[Bcrypt Password Hash<br/>Salt factor 10]
        Validation[Input Validation<br/>express-validator]
        RBAC[Role-Based Access<br/>admin/customer/staff]
    end
    
    subgraph "Infrastructure"
        MongoDB[MongoDB Atlas<br/>Cloud Database]
        CloudStore[Cloud Storage<br/>Images/Videos]
        WebSocket[WebSocket Server<br/>Real-time Comm]
        EmailServ[Email Service<br/>SMTP]
    end
    
    Client[Client Apps] --> HTTPS
    HTTPS --> CORS
    CORS --> RateLimit
    RateLimit --> Validation
    Validation --> JWT
    JWT --> RBAC
    RBAC --> Backend[Backend Services]
    
    Backend --> MongoDB
    Backend --> CloudStore
    Backend --> WebSocket
    Backend --> EmailServ
    
    Bcrypt -.->|Hash passwords| Backend
    
    classDef securityStyle fill:#f44336,color:#fff
    classDef infraStyle fill:#2196f3,color:#fff
    
    class HTTPS,CORS,RateLimit,JWT,Bcrypt,Validation,RBAC securityStyle
    class MongoDB,CloudStore,WebSocket,EmailServ infraStyle
```

## Key Features Summary

### 🎯 Core Value Propositions
1. **Operational Consolidation**: 8 services unified in one platform (E-Commerce, Live Streaming, Marketing, Analytics, Finance, HR, Communication, Auth)
2. **AI-Powered Personalization**: Google Gemini integration for intelligent product recommendations
3. **Real-Time Engagement**: WebSocket-based live streaming with chat and product pinning
4. **Data-Driven Insights**: Comprehensive analytics across sales, customers, campaigns, and streams
5. **Multi-Platform Access**: Web (Vue.js), Mobile (React Native), Admin Dashboard

### 📊 Technology Highlights
- **Backend**: Node.js + Express.js + WebSocket + MongoDB Atlas
- **Frontend**: Vue.js 3 + Vite + Tailwind CSS
- **Mobile**: React Native 0.73.6 + Expo 50.0
- **AI**: Google Gemini API (gemini-2.0-flash model)
- **Payments**: VNPay Gateway integration
- **Email**: Nodemailer with SMTP (Gmail/SendGrid)
- **Security**: JWT tokens, bcrypt hashing, rate limiting, CORS, input validation

### 🔄 Key Workflows
1. **Shopping**: Browse → AI Chat → Add to Cart → VNPay Checkout → Order Tracking
2. **Live Stream**: Admin broadcasts → Customers watch → Real-time chat → Product pinning → Purchases
3. **AI Chat**: Customer query → FAQ/Product search → Gemini AI → Personalized response
4. **Email Marketing**: Create campaign → Segment audience → Bulk send → Track analytics
5. **Analytics**: Data aggregation → Chart.js visualization → Dashboard insights
