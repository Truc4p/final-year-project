# Container Diagram (Level 2) - Wrencos Platform Architecture

## Overview
Based on the actual project code analysis, the Container Diagram (Level 2) shows the internal structure of the Wrencos Platform system, breaking it down into major containers/applications and their interactions.

---

## 🏗️ Main Containers

### 1. **Web Application (Frontend)**
**Technology Stack:** Vue.js 3 + Vite + Tailwind CSS

**Location:** `/frontend`

**Key Components:**
- **Vue.js 3 SPA** - Single Page Application
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling framework
- **Vue Router** - Client-side routing
- **Vue i18n** - Internationalization (multi-language support)
- **Axios** - HTTP client for API communication
- **Chart.js** - Data visualization
- **Tesseract.js** - OCR capabilities
- **JWT Decode** - Token parsing

**Key Features:**
- Product browsing and search
- Shopping cart management
- Order management
- User profile management
- Analytics dashboard
- Newsletter subscription
- Email campaign management
- Admin interface

**Communication:**
- REST API calls to Backend API Server (HTTP/HTTPS)
- WebSocket connections for real-time updates

---

### 2. **Backend API Server**
**Technology Stack:** Node.js + Express.js

**Location:** `/backend`

**Port:** 3000 (default)

**Key Components:**

#### **Express.js Application (`app.js`)**
- RESTful API endpoints
- CORS enabled for cross-origin requests
- Rate limiting (100 requests per 15 minutes per IP)
- Body parser for JSON/form data
- Static file serving (uploads directory)
- Swagger/OpenAPI documentation

#### **API Routes (Modular Architecture)**

| Route Module | Purpose | Endpoints |
|---|---|---|
| **Authentication** | User auth & management | `/auth`, `/users` |
| **E-Commerce** | Products & Orders | `/products`, `/categories`, `/orders`, `/payments` |
| **Communication** | Chat & Support | `/chat` |
| **Livestream** | Live shopping events | `/livestreams` |
| **Marketing** | Email campaigns | `/newsletter`, `/email-campaigns`, `/email-templates`, `/email-segments` |
| **Finance** | Cash flow tracking | `/cashflow` |
| **HR** | Employee management | `/hr` |
| **Analytics** | Business metrics | `/analytics` |
| **AI Dermatology** | Skin consultation | `/api/ai-dermatology-expert` |
| **Uploads** | File management | `/uploads` |

#### **Core Services**

1. **Email Service** (`emailService.js`)
   - Transactional email sending
   - Marketing email campaigns
   - Newsletter distribution
   - Uses SMTP server integration

2. **Gemini AI Service** (`geminiService.js`)
   - AI-powered dermatology consultation
   - Product recommendations
   - Intelligent chat responses
   - RAG (Retrieval-Augmented Generation) capabilities

3. **Vector Service** (`vectorService.js`)
   - Vector database integration (Qdrant)
   - Semantic search capabilities
   - Knowledge base embedding

4. **Text-to-Speech Service** (`ttsService.js`)
   - Audio generation for product descriptions
   - Accessibility features
   - Uses Google Text-to-Speech API

#### **Middleware**
- `auth.js` - JWT authentication
- `optionalAuth.js` - Optional authentication
- `role.js` - Role-based access control (RBAC)

#### **Database Models**

| Category | Models |
|---|---|
| **Auth** | User (authentication, profiles, roles) |
| **E-Commerce** | Product, Category, Order |
| **Communication** | ChatConversation |
| **Finance** | CashFlowTransaction, BusinessExpense |
| **HR** | Employee |
| **Livestream** | LiveStream |
| **Marketing** | EmailCampaign, EmailTemplate, EmailSegment, EmailAnalytics, NewsletterSubscription |
| **Skin Study** | DermatologyKnowledge |
| **Core** | FAQ |

#### **WebSocket Manager** (`websocket.js`)
- Real-time bidirectional communication
- **Customer Connections:** Session-based tracking
- **Admin Connections:** User ID-based tracking
- **Features:**
  - Live chat messaging
  - Stream status updates (start/stop)
  - Viewer count tracking
  - Like/engagement tracking
  - WebRTC signaling for video streaming
  - Pinned products broadcasting
  - Chat history management

---

### 3. **Mobile Apps**

#### **3a. Customer Mobile App**
**Technology Stack:** React Native + Expo

**Location:** `/mobile-app-customer`

**Key Features:**
- Product browsing
- Live shopping participation
- AI dermatology consultation
- Order tracking
- Payment processing
- Live chat during streams
- Agora SDK integration for video streaming

**Communication:**
- REST API to Backend
- WebSocket for real-time updates
- Agora SDK for live video

#### **3b. Admin/Seller Mobile App**
**Technology Stack:** React Native + Expo

**Location:** `/mobile-app-admin`

**Key Features:**
- Livestream hosting
- Product management
- Order management
- Analytics dashboard
- Customer support
- Agora SDK integration for broadcasting

**Communication:**
- REST API to Backend
- WebSocket for real-time updates
- Agora SDK for video broadcasting

---

### 4. **Database**
**Technology:** MongoDB Atlas (Cloud)

**Connection:** MongoDB+SRV connection string

**Collections:**
- Users (authentication, profiles)
- Products & Categories
- Orders & Payments
- Chat Conversations
- Livestreams & Chat Messages
- Email Campaigns & Templates
- Marketing Segments
- Employee Records
- Financial Transactions
- Dermatology Knowledge Base
- FAQs

**Features:**
- Cloud-hosted (Atlas)
- Automatic backups
- Scalable storage
- Real-time data synchronization

---

### 5. **Vector Database**
**Technology:** Qdrant (Vector Search Engine)

**Location:** Docker container (optional)

**Purpose:**
- Semantic search for products
- Knowledge base embeddings
- RAG (Retrieval-Augmented Generation) support
- AI model embeddings

**Docker Compose:** `docker-compose.qdrant.yml`

---

## 🔌 External System Integrations

### 1. **Google Gemini AI API**
- AI-powered dermatology consultation
- Product recommendations
- Intelligent chatbot responses
- Knowledge base querying

### 2. **VNPay Payment Gateway**
- Payment processing
- Transaction handling
- Payment status callbacks
- Order fulfillment

### 3. **SMTP Email Server**
- Transactional emails
- Marketing campaigns
- Newsletter distribution
- Email notifications

### 4. **Agora SDK**
- Live video streaming
- Real-time video communication
- Multi-user video sessions
- Mobile app integration

---

## 📊 Data Flow Architecture

### **REST API Communication Flow**
```
Frontend/Mobile → HTTP/HTTPS → Express.js API → Controllers → Services → MongoDB
                                    ↓
                            Middleware (Auth, RBAC)
```

### **Real-Time Communication Flow**
```
Frontend/Mobile ← WebSocket → WebSocket Manager → MongoDB
                    ↓
            (Chat, Stream Status, Likes, Viewer Count)
```

### **AI Processing Flow**
```
User Query → Backend API → Gemini AI Service → Google Gemini API
                ↓
            Vector Service (Qdrant) → Semantic Search
                ↓
            Response → Frontend/Mobile
```

### **Payment Flow**
```
Frontend/Mobile → Payment Route → VNPay Gateway → Payment Processing
                                        ↓
                                Order Update → MongoDB
```

### **Email Flow**
```
Backend Service → Email Service → SMTP Server → User Email
```

---

## [object Object] Structure Summary

```
wrencos/
├── backend/                          # Node.js Express API
│   ├── app.js                       # Express app configuration
│   ├── server.js                    # Server entry point
│   ├── websocket.js                 # WebSocket manager
│   ├── db.js                        # MongoDB connection
│   ├── routes/                      # API route handlers
│   │   ├── auth/
│   │   ├── ecommerce/
│   │   ├── communication/
│   │   ├── livestream/
│   │   ├── marketing/
│   │   ├── finance/
│   │   ├── hr/
│   │   ├── analytics/
│   │   ├── skin-study/
│   │   └── core/
│   ├── controllers/                 # Business logic
│   ├── models/                      # MongoDB schemas
│   ├── services/                    # External integrations
│   │   ├── emailService.js
│   │   ├── geminiService.js
│   │   ├── vectorService.js
│   │   └── ttsService.js
│   ├── middleware/                  # Auth & RBAC
│   ├── utils/                       # Helper functions
│   ├── scripts/                     # Utility scripts
│   ├── seed-data/                   # Initial data
│   ├── Dockerfile                   # Container configuration
│   └── package.json                 # Dependencies
│
├── frontend/                         # Vue.js 3 SPA
│   ├── src/
│   │   ├── components/              # Vue components
│   │   ├── pages/                   # Page components
│   │   ├── router/                  # Vue Router config
│   │   ├── services/                # API services
│   │   ├── stores/                  # State management
│   │   ├── assets/                  # Styles & images
│   │   ├── App.vue                  # Root component
│   │   └── main.js                  # Entry point
│   ├── vite.config.js               # Vite configuration
│   ├── tailwind.config.js           # Tailwind CSS config
│   ├── Dockerfile                   # Container configuration
│   └── package.json                 # Dependencies
│
├── mobile-app-customer/             # React Native (Expo)
│   ├── src/
│   │   ├── screens/                 # Screen components
│   │   ├── components/              # Reusable components
│   │   ├── services/                # API services
│   │   ├── contexts/                # React Context
│   │   └── constants/               # App constants
│   ├── App.js                       # App entry point
│   ├── app.json                     # Expo config
│   └── package.json                 # Dependencies
│
├── mobile-app-admin/                # React Native (Expo)
│   ├── src/
│   │   ├── screens/                 # Screen components
│   │   ├── components/              # Reusable components
│   │   ├── services/                # API services
│   │   └── constants/               # App constants
│   ├── App.js                       # App entry point
│   ├── app.json                     # Expo config
│   └── package.json                 # Dependencies
│
└── report/                          # Documentation
```

---

## 🔐 Security & Authentication

### **JWT Authentication**
- Token-based authentication
- Role-based access control (RBAC)
- Middleware-based authorization
- Token verification on WebSocket connections

### **Rate Limiting**
- 1000 requests per 15 minutes per IP
- Prevents abuse and DDoS attacks

### **CORS**
- Enabled for cross-origin requests
- Configurable origins

---

## 📱 Technology Stack Summary

| Layer | Technology |
|---|---|
| **Frontend** | Vue.js 3, Vite, Tailwind CSS, Axios |
| **Backend** | Node.js, Express.js, Mongoose |
| **Mobile** | React Native, Expo |
| **Database** | MongoDB Atlas |
| **Vector DB** | Qdrant |
| **Real-time** | WebSocket (ws), WebRTC |
| **AI/ML** | Google Gemini API, LangChain |
| **Payment** | VNPay Gateway |
| **Email** | SMTP, Nodemailer |
| **Video** | Agora SDK |
| **Containerization** | Docker |

---

## 🚀 Deployment Architecture

### **Backend Deployment**
- Docker container (Node.js 16.20.1)
- Port: 3000
- Environment variables: `.env` file
- Swagger API docs: `/api-docs`

### **Frontend Deployment**
- Static build artifacts (Vite)
- Can be served by any web server
- Docker container available

### **Mobile Deployment**
- Expo Go for development
- EAS Build for production
- iOS and Android builds

---

## 🔄 Key Integration Points

1. **Frontend ↔ Backend:** REST API + WebSocket
2. **Backend ↔ MongoDB:** Mongoose ODM
3. **Backend ↔ Gemini AI:** HTTP API calls
4. **Backend ↔ VNPay:** Payment gateway API
5. **Backend ↔ SMTP:** Email service
6. **Backend ↔ Agora:** Video streaming SDK
7. **Backend ↔ Qdrant:** Vector search API
8. **Mobile ↔ Backend:** REST API + WebSocket
9. **Mobile ↔ Agora:** Video streaming SDK

---

## 📊 Scalability Considerations

1. **Horizontal Scaling:** Multiple backend instances behind load balancer
2. **Database Scaling:** MongoDB Atlas auto-scaling
3. **WebSocket Scaling:** Redis pub/sub for multi-instance support
4. **CDN:** Static assets can be served via CDN
5. **Caching:** Redis for session and data caching
6. **Message Queue:** For async operations (email, notifications)

---

## 🎯 Key Features by Container

### **Web Application**
- Product discovery
- Shopping cart
- Order management
- User authentication
- Analytics dashboard
- Admin panel

### **Backend API**
- RESTful endpoints
- Real-time WebSocket server
- AI integration
- Payment processing
- Email campaigns
- Livestream management

### **Mobile Apps**
- Native mobile experience
- Offline capabilities
- Push notifications
- Camera integration
- Live video streaming

### **Database**
- Persistent data storage
- Relationships between entities
- Indexing for performance
- Backup and recovery

---

## 📝 API Documentation

**Swagger/OpenAPI Available at:** `http://localhost:3000/api-docs`

**Main API Endpoints:**
- `/auth` - Authentication
- `/products` - Product catalog
- `/orders` - Order management
- `/payments` - Payment processing
- `/chat` - Customer support chat
- `/livestreams` - Live shopping events
- `/newsletter` - Email subscriptions
- `/email-campaigns` - Marketing campaigns
- `/api/ai-dermatology-expert` - AI consultation
- `/analytics` - Business analytics

---

## 🔗 Container Dependencies

```
Frontend → Backend API Server
Mobile Apps → Backend API Server
Backend API Server → MongoDB Atlas
Backend API Server → Qdrant (Vector DB)
Backend API Server → Google Gemini API
Backend API Server → VNPay Gateway
Backend API Server → SMTP Server
Backend API Server → Agora SDK
```

---

## 📈 Performance Monitoring

- **Performance Monitor Utility:** `/backend/utils/performanceMonitor.js`
- **Score Analyzer:** `/backend/utils/scoreAnalyzer.js`
- **Analytics Routes:** Track user behavior and business metrics

---

## 🛠️ Development Setup

### **Backend:**
```bash
cd backend
npm install
npm start
```

### **Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### **Mobile (Customer):**
```bash
cd mobile-app-customer
npm install
npm start
```

### **Mobile (Admin):**
```bash
cd mobile-app-admin
npm install
npm start
```

---

## 📦 Docker Deployment

### **Backend:**
```bash
docker build -t wrencos-backend .
docker run -p 3000:3000 wrencos-backend
```

### **Frontend:**
```bash
docker build -t wrencos-frontend .
docker run -p 80:80 wrencos-frontend
```

---

## ✅ Conclusion

The Container Diagram (Level 2) reveals a **modern, scalable, multi-platform e-commerce system** with:
- **Microservices-oriented backend** with modular routes and services
- **Real-time capabilities** via WebSocket for live shopping
- **AI integration** for intelligent recommendations and consultation
- **Multi-platform support** (Web, iOS, Android)
- **Cloud-native architecture** with MongoDB Atlas and containerization
- **Enterprise features** including payment processing, email marketing, and analytics

This architecture supports the core business requirements of an AI-powered beauty & skincare e-commerce platform with livestream shopping capabilities.

