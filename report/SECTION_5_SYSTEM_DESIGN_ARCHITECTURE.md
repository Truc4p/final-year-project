# 5. System Design and Architecture

## 5.1 Rich Picture

### Rich Picture Narrative

**Overview:** Wrencos is an integrated full-stack e-commerce platform engineered for small to medium-sized beauty businesses, consolidating fragmented technology ecosystems into a unified solution. The platform addresses the beauty market's dual challenge: (1) customers' inability to physically evaluate products (sensory deficit); (2) businesses' operational complexity managing 5–8 disconnected platforms.

**Key Actors:**
- **Customers:** Browse products, receive AI-powered recommendations (Google Gemini), attend live streams, participate in real-time chat, purchase with VNPay, track orders, subscribe to newsletters
- **Business Admins/Staff:** Manage product catalog, conduct live streams with product pinning, respond to customer chats (AI escalations), view analytics dashboards, configure email campaigns, manage orders/inventory, track finances and cash flow, manage HR and employees

**System Components:**
- **Client Layer:** Vue.js 3 web app, React Native mobile app, Admin dashboard
- **Backend API:** Node.js + Express.js with 8 service modules (E-Commerce, Live Streaming, Communication, Marketing, Analytics, Finance, HR, Auth)
- **Real-Time Layer:** WebSocket server for live streaming, chat, notifications
- **AI Integration:** Google Gemini API for conversational product recommendations
- **Data Layer:** MongoDB Atlas with 15+ collections via Mongoose ODM
- **External Services:** VNPay (payments), SMTP (email), Google Gemini (AI)

**Core Data Flows:**
1. **Shopping Journey:** Browse → AI Chat → Cart → VNPay Checkout → Order Tracking → Email Confirmation
2. **Live Streaming:** Admin creates stream → Broadcasts (WebSocket) → Customers view (WebRTC) → Real-time chat → Product pinning → Purchases
3. **AI Assistance:** Customer query → FAQ/Product search → Gemini API → Personalized response → Optional staff escalation
4. **Email Marketing:** Create campaign → Select template → Target segment → Bulk send (Nodemailer) → Track analytics
5. **Analytics:** Services → MongoDB aggregation → Chart.js visualizations → Dashboard insights

---

## 5.2 System Architecture

### High-Level Architecture Overview

**Architecture Pattern:** Client-Server with microservices-oriented backend modules. Frontend (web/mobile) communicates with centralized RESTful API; backend orchestrates business logic, database operations, external service integration. Real-time communication via WebSocket for live streaming and notifications. Asynchronous job processing for email marketing, analytics aggregation.

### C4 Model Diagrams

#### System Context Diagram (Level 1)
```
┌──────────────────────────────────────────────────────────────────────────┐
│                         External Systems                                 │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐           │
│  │  Google Gemini  │  │     VNPay       │  │   SMTP Server   │           │
│  │  (AI Engine)    │  │   (Payments)    │  │    (Email)      │           │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘           │
│           │                    │                    │                    │
│           └────────────────────┼────────────────────┘                    │
│                                │                                         │
│                        ┌───────▼────────┐                                │
│                        │   Wrencos      │                                │
│                        │   Platform     │                                │
│                        │  (E-Commerce)  │                                │
│                        └───────▲────────┘                                │
│                                │                                         │
│                  ┌─────────────┼─────────────┐                           │
│                  │             │             │                           │
│              ┌───▼───┐     ┌───▼───┐     ┌───▼────┐                      │
│              │  Web  │     │Mobile │     │ Admin  │                      │
│              │Portal │     │ App   │     │  Web   │                      │
│              │(Cust) │     │(Cust) │     │(Admin) │                      │
│              └───────┘     └───────┘     └────────┘                      │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐    │
│  │              AWS/GCP (Cloud Infrastructure)                      │    │
│  │  • Application Hosting  • File Storage  • Database Backups       │    │
│  └──────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

**Explanation:**

The System Context Diagram provides the highest-level view of the Wrencos platform and its interactions with external systems and users. It establishes the system boundary and shows how different actors interact with the core platform.

**External Systems (Integration Points):**

| System | Purpose | Key Functions |
|---|---|---|
| **Google Gemini (AI Engine)** | Artificial intelligence integration | Provides conversational AI for product recommendations, handles customer inquiries, delivers personalized suggestions |
| **VNPay (Payments)** | Payment processing gateway | Processes transactions, handles order checkout authorization, manages refunds and payment reconciliation |
| **SMTP Server (Email)** | Email communication service | Sends transactional emails (order confirmations, password resets), delivers marketing campaigns to segmented customers |
| **AWS/GCP (Cloud Infrastructure)** | Infrastructure and storage | Hosts platform applications, stores product images and user avatars, provides scalability and reliability |

**Central System:**

The **Wrencos Platform** acts as the integrated hub coordinating all business logic, user interactions, and external service integrations. It consolidates fragmented operations into a unified system.

**User Types and Their Roles:**

| User Role | Primary Interface | Key Responsibilities |
|---|---|---|
| **Customer** | Web Portal (Vue.js) + Mobile App (React Native) | Browse products, receive AI recommendations, attend livestreams, manage shopping cart, checkout, track orders, participate in chat |
| **Admin** | Administrative Dashboard (Web) | Manage product catalog, view analytics and financial reports, configure marketing campaigns, schedule and conduct livestreams, manage orders, update inventory, handle staff/admin operations, respond to escalated customer inquiries |

#### Container Diagram (Level 2)
```
┌─────────────────────────────────────────────────────────────────────┐
│                        Wrencos Platform                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────┐              ┌─────────────────────┐      │
│  │   Web Frontend       │              │   Mobile App        │      │
│  │   (Vue.js)           │              │   (React Native)    │      │
│  │ - Customer Portal    │              │ - Customer Interface│      │
│  │ - Admin Dashboard    │              │ - Shopping & Orders │      │
│  └──────────┬───────────┘              └────────────┬────────┘      │
│             │                                       │               │
│             └──────────────────┬────────────────────┘               │
│                                │                                    │
│                ┌───────────────▼────────────────┐                   │
│                │  REST API Gateway              │                   │
│                │  (Express.js + Node.js)        │                   │
│                │  • Authentication (JWT)        │                   │
│                │  • Authorization (Role-based)  │                   │
│                │  • Request Routing & Validation│                   │
│                │  • Error Handling              │                   │
│                └───────────────┬────────────────┘                   │
│                                │                                    │
│    ┌───────────────────────────▼────────────────────────┐           │
│    │      Backend Services Layer                        │           │
│    ├────────────────────────────────────────────────────┤           │
│    │    ┌─────────┐ ┌─────────┐ ┌─────────┐             │           │
│    │    │E-Comm.  │ │Live     │ │Analytics│             │           │
│    │    │Service  │ │Stream   │ │Service  │             │           │
│    │    │         │ │Service  │ │         │             │           │
│    │    └─────────┘ └─────────┘ └─────────┘             │           │
│    │    ┌─────────┐ ┌─────────┐ ┌─────────┐             │           │
│    │    │  Email  │ │Marketing│ │   HR    │             │           │
│    │    │Service  │ │Service  │ │Service  │             │           │
│    │    │         │ │         │ │         │             │           │
│    │    └─────────┘ └─────────┘ └─────────┘             │           │
│    │    ┌─────────┐ ┌─────────┐ ┌───────────────┐       │           │
│    │    │ Finance │ │  Auth   │ │ Communication │       │           │
│    │    │Service  │ │Service  │ │   Service     │       │           │ 
│    │    │         │ │         │ └───────────────┘       │           │             
│    │    └─────────┘ └─────────┘                         │           │    
│    │                                                    │           │   
│    └────────────────────┬───────────────────────────────┘           │
│                         │                                           │
│                ┌────────▼─────────────┐                             │
│                │  MongoDB Atlas       │                             │
│                │  Database            │                             │
│                │  • Users & Auth      │                             │
│                │  • Products & Orders │                             │
│                │  • Live Streams      │                             │
│                │  • Email Campaigns   │                             │
│                │  • HR & Finance Data │                             │
│                │  • Chat & Analytics  │                             │
│                └──────────────────────┘                             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│     External Service Integrations        │
├──────────────────────────────────────────┤
│ • Google Gemini API (AI Engine)          │
│ • VNPay API (Payment Gateway)            │
│ • SMTP Server (Email Delivery)           │
│ • AWS/GCP (File Storage & Hosting)       │
└──────────────────────────────────────────┘
```
**Backend Services Summary:**


| **Service** | **Primary Models** | **Core Functions** |
|---|---|---|
| **E-Commerce** | Product, Category, Order | Catalog management, shopping cart, order processing, payment integration |
| **Live Streaming** | LiveStream | Real-time streaming, live chat, product showcase, viewer management |
| **Analytics** | (Aggregates data from other services) | Sales reports, customer analytics, dashboard metrics, business intelligence |
| **Email** | EmailTemplate, EmailCampaign, EmailSegment | Email campaign management, template design, subscriber segmentation, bulk sending |
| **Marketing** | EmailCampaign, EmailTemplate, EmailSegment, EmailAnalytics, NewsletterSubscription | Campaign orchestration, audience segmentation, email analytics, newsletter management |
| **HR** | Employee | Employee records, staff management, permissions and access control |
| **Finance** | BusinessExpense, CashFlowTransaction | Expense tracking, cash flow reporting, financial analytics |
| **Auth** | User | User registration, login, authentication, role-based access control |
| **Communication** | ChatConversation, FAQ | **Three distinct features:** (1) FAQ management (predefined Q&A lookup), (2) AI-powered chatbot (Google Gemini integration with product recommendations), (3) Customer support escalation (route to staff with live chat) |

**Key Data Flow:**
- Web Frontend ──HTTP──► REST API ──► Services ──► Database
- Mobile App ──HTTP──► REST API ──► Services ──► Database
- Both frontends communicate ONLY through the REST API Gateway
- Services do NOT communicate directly with frontends
- All services share MongoDB Atlas as the single source of truth

**Architecture Layers Explained:**

| Layer | Components | Responsibility |
|---|---|---|
| **Frontend Layer** | Web Frontend (Vue.js), Mobile App (React Native) | User interfaces for customers and admins; handles UI/UX, state management, form validation |
| **Backend Layer (API Gateway)** | REST API Gateway (Express.js) | Centralized entry point; handles request routing, CORS, rate limiting, request/response parsing; applies auth middleware to protected routes |
| **Backend Layer (Services)** | 8 Backend Services (E-Commerce, Live Streaming, Analytics, Email, Marketing, HR, Finance, **Auth**, Communication) | Business logic implementation; handles specific domain operations and data persistence |
| **Data Layer** | MongoDB Atlas Database | Persists all application data; managed through Mongoose ORM for schema validation and data integrity |

---

### REST API Gateway vs Auth Service: Architecture Clarification

**Important Note:** The **REST API Gateway** and **Auth Service** are **two different components** that work together:

| Component | Responsibility | Technology | Functions |
|---|---|---|---|
| **REST API Gateway** (Express.js middleware layer) | Route management, middleware orchestration, cross-cutting concerns | Express.js, body-parser, CORS, rate-limit | ✓ HTTP request routing<br>✓ CORS handling<br>✓ Rate limiting<br>✓ Body parsing<br>✓ JWT token verification (auth middleware)<br>✓ Request/response handling |
| **Auth Service** (Business logic layer) | User identity management, authentication operations | Node.js, JWT library, bcryptjs | ✓ User registration<br>✓ User login<br>✓ JWT token generation<br>✓ Password hashing<br>✓ Role management<br>✓ User profile queries |

**How They Work Together:**

1. **User Registration/Login** (Auth Service):
   - Customer sends credentials → `/auth/register` or `/auth/login` (Auth Service routes)
   - Auth Controller validates, hashes password, queries User model, generates JWT token
   - Token returned to frontend

2. **Protected Requests** (REST API Gateway + Auth Service):
   - Customer includes JWT in header → Any protected endpoint
   - REST API Gateway applies **auth middleware** (verifies JWT signature, extracts user ID)
   - Auth middleware passes user info to backend service handler
   - Service processes request with authenticated user context

3. **Data Flow**:
   ```
   Frontend (has JWT token)
      ↓
   REST API Gateway
      ↓ (applies auth middleware)
   Auth Middleware (verifies JWT)
      ↓ (extracts user context)
   Other Services (e.g., E-Commerce, Chat)
      ↓ (processes business logic)
   Database Query
      ↓ (returns result)
   Response to Frontend
   ```

**Key Difference:**
- **REST API Gateway = Infrastructure/Middleware** (how requests are routed and processed)
- **Auth Service = Business Logic** (what happens with authentication operations)

Both are **necessary and separate** - removing either breaks the system:
- Without REST API Gateway: No routing, no middleware execution
- Without Auth Service: No user management, no JWT generation

---

### 8 Backend Services: Detailed Breakdown

**Architecture Overview:**
The backend services layer handles all business logic, data persistence, and external service integrations. Each service is independent but may interact with others through the shared database and REST API Gateway. All services follow the same architectural pattern:
- **Routes** → **Controllers** → **Models** → **Database (MongoDB)**

**Service Descriptions:**

| Service | Responsibility | Key Models | Key Routes | External Dependencies |
|---|---|---|---|---|
| **E-Commerce Service** | Product catalog, inventory, order management | Product, Category, Order | `/products`, `/orders`, `/categories`, `/payments` | VNPay (payment processing), Cloud Storage (product images) |
| **Live Streaming Service** | Video streaming coordination, event management | LiveStream, Viewer | `/livestreams`, `/live` | WebSocket server, Cloud storage (video), CDN |
| **Analytics Service** | Sales reports, traffic analysis, performance metrics | Analytics data | `/analytics`, `/reports` | None (internal data aggregation) |
| **Email Service** | Transactional and marketing emails | EmailTemplate, EmailSegment, EmailCampaign | `/emails`, `/campaigns` | SMTP Server, Email provider |
| **Marketing Service** | Campaign management, email marketing, promotions | EmailCampaign, EmailSegment, Newsletter | `/marketing`, `/segments`, `/newsletters` | Email Service |
| **HR Service** | Employee management, payroll, attendance | Staff, Attendance, Payroll | `/hr`, `/staff`, `/attendance` | None (internal) |
| **Finance Service** | Expense tracking, cash flow analysis, reporting | BusinessExpense, CashFlowTransaction | `/finance`, `/expenses`, `/cash-flow` | None (internal) |
| **Auth Service** | User registration, login, token generation, password management | User | `/auth/register`, `/auth/login`, `/users` | JWT library, bcryptjs for password hashing |
| **Communication Service** | Customer chat, FAQ management, AI-powered support | ChatConversation, FAQ | `/chat`, `/faqs` | Google Gemini API (for AI-powered responses) |

**Communication Service & AI Integration:**

**Important Note:** There is **NO separate "AI Service"** in the architecture. **AI functionality is fully integrated into the Communication Service** as one of its features.

| Aspect | Details |
|---|---|
| **Service Structure** | Single Communication Service with AI as an integrated feature |
| **Primary Responsibility** | Manage all customer communication channels (chat, FAQs, AI responses) |
| **Models Used** | ChatConversation, FAQ (stores all conversations including AI responses) |
| **Key Features** | • FAQ management (predefined Q&A)<br>• Customer chat interface<br>• Staff escalation system<br>• Conversation history tracking<br>• AI-powered responses (Google Gemini integration)<br>• Product recommendation engine<br>• Semantic search (FAQs + Products) |
| **Data Flow** | Customer → REST API Gateway → `/chat/ai` endpoint → Communication Service → Google Gemini API + Product/FAQ database search → Response → ChatConversation model → MongoDB → Back to customer |
| **Routes Available** | **Customer Routes:**<br>`/chat/faqs` (GET all FAQs)<br>`/chat/faq/:id/answer` (GET specific answer)<br>`/chat/ai` (POST - AI-powered chat)<br>`/chat/staff/connect` (POST - escalate to staff)<br>`/chat/staff/message` (POST - send message to staff)<br>`/chat/staff/messages/:sessionId` (GET - receive staff replies)<br><br>**Admin/Staff Routes** (requires authentication):<br>`/chat/admin/faq` (POST/PUT/DELETE - FAQ management)<br>`/chat/admin/active-chats` (GET - view all customer chats)<br>`/chat/admin/messages/:sessionId` (GET - view customer messages)<br>`/chat/admin/reply` (POST - staff replies to customer) |

**How Communication Service + AI Work Together:**

**Customer Chat Flow (3 Pathways):**

1. **FAQ Pathway** (Self-service):
   - Customer queries FAQs → `/chat/faqs` or `/chat/faq/:id/answer`
   - Communication Service retrieves predefined answers
   - No human intervention needed

2. **AI Pathway** (AI-powered support):
   - Customer sends message → `/chat/ai` endpoint
   - REST API Gateway applies auth middleware → validates JWT, extracts user context
   - Communication Service processes:
     - Searches FAQ database for relevant predefined answers
     - Searches Product database for matching products
     - Sends message + context + conversation history to Google Gemini API
   - Gemini generates intelligent response → Product recommendations, FAQ references
   - Communication Service saves conversation → ChatConversation model stores both message and AI response
   - Returns complete response → Related products, FAQ suggestions, intent classification, AI-generated answer

3. **Staff Escalation Pathway** (Human support):
   - Customer initiates escalation → `/chat/staff/connect` (creates staff chat session)
   - Customer sends message → `/chat/staff/message` (sends to staff queue)
   - REST API Gateway validates authentication → extracts user context
   - Communication Service routes message to staff
   - Staff/Admin view pending chats → `/chat/admin/active-chats` (staff only)
   - Staff/Admin reads customer message → `/chat/admin/messages/:sessionId` (staff only)
   - Staff/Admin replies to customer → `/chat/admin/reply` (staff only)
   - Customer retrieves staff response → `/chat/staff/messages/:sessionId` (polls for new messages)
   - Communication Service saves entire conversation → ChatConversation model

**Role-Based Access Control:**

| Route Pattern | Auth Requirement | Behavior | Purpose |
|---|---|---|---|
| `/chat/faqs`, `/chat/faq/:id/answer` | **None** | Accessible to anyone (guest or logged-in) | Self-service FAQ lookup |
| `/chat/ai` | **Optional** | Works for guests (req.user = null) or authenticated users; personalization enabled if user is logged in | AI-powered chat with optional user context |
| `/chat/staff/connect`, `/chat/staff/message`, `/chat/staff/messages/:sessionId` | **Optional** | Works for guests or authenticated users; session tracking enhanced if user is logged in | Escalate to staff, communicate with staff |
| `/chat/admin/*` (FAQ management, view chats, reply) | **Required** (staff/admin role) | 401 Unauthorized if no valid token; verified on every request | Manage FAQs, view all customer chats, reply to customers |

**Authentication Behavior Explained:**

- **No Auth (`/chat/faqs`):** Token is never checked. Request accepted regardless of authentication status. Used for public, read-only operations.

- **Optional Auth (`/chat/ai`, `/chat/staff/*`):** Token is checked IF provided, but request succeeds even without one. Enables two modes:
  - **Authenticated mode:** User info available in req.user → Can personalize responses, track conversation history with user account
  - **Anonymous mode:** No user info (req.user = null) → Generic responses, session-based tracking only

- **Required Auth (`/chat/admin/*`):** Token MUST be present and valid. Request rejected with 401 error if missing or invalid. Staff-only operations require role verification.

**Why This Architecture:**
- **Single responsibility** → Communication Service owns all communication logic (chat, FAQs, AI)
- **Clear integration** → Google Gemini API is consumed as a dependency, not a separate service
- **Scalability** → Communication Service can be scaled independently; Google Gemini API handles AI computations
- **Flexibility** → Easy to add new AI features (voice chat, recommendation refinement) without creating new services


---

## 5.3 Technology Stack

| Category | Technology | Version | Justification | References |
|---|---|---|---|---|
| **Frontend Web** | Vue.js | 3.5.12 | Progressive framework with intuitive Composition API; lower learning curve than React; superior code organization for rapid development. | Biørn-Hansen et al. (2018); Majchrzak et al. (2020) |
| **Frontend Build** | Vite | 5.4.10 | Instant hot module replacement accelerating development velocity; superior performance vs. Webpack. | Vite Docs (2024) |
| **Frontend Styling** | Tailwind CSS | 3.4.14 | Utility-first CSS framework enabling rapid UI development without writing custom CSS; reduces development time. | Tailwind Docs (2024) |
| **Frontend Charting** | Chart.js & Vue-ChartJS | 4.5.0 | Lightweight charting library for analytics dashboards; integrates seamlessly with Vue.js. | Chart.js Docs (2024) |
| **Frontend Internationalization** | Vue-i18n | 11.0.0-beta.1 | Multi-language support for global market reach; enables customer interface localization. | Vue-i18n Docs (2024) |
| **Frontend HTTP Client** | Axios | 1.7.7 | Promise-based HTTP client for API communication; superior error handling and request interception. | Axios Docs (2024) |
| **Mobile Framework** | React Native | 0.73.6 | Single JavaScript codebase targeting iOS/Android; reduces native development effort ~50%. | Gartner (2023) |
| **Mobile Tooling** | Expo | 50.0.0 | Simplified development environment, eliminates native compilation, over-the-air updates; accelerates iteration. | Kieras (2020) |
| **Mobile Navigation** | React Navigation | 6.1.9 | Industry-standard navigation library for React Native apps; supports stack, tab, drawer navigation patterns. | React Navigation Docs (2024) |
| **Mobile Storage** | AsyncStorage | 1.21.0 | Persistent local storage for React Native; stores auth tokens, user preferences, offline data. | AsyncStorage Docs (2024) |
| **Mobile Icons** | React Native Vector Icons | 10.0.3 | Comprehensive icon library for mobile UI; reduces asset bundle size vs. image-based icons. | Vector Icons Docs (2024) |
| **Mobile Media Picker** | Expo Image Picker | 14.7.1 | Unified API for accessing device camera roll and camera; simplifies photo upload workflows. | Expo Docs (2024) |
| **Backend Runtime** | Node.js | 18+ LTS | Event-driven I/O architecture naturally accommodates concurrent WebSocket connections; Netflix achieved 70% startup time improvement. | Netflix Tech Blog (2023); Tilkov & Vinoski (2010) |
| **Backend Framework** | Express.js | 4.19.2 | Minimal middleware abstraction enabling rapid API endpoint development; full control over real-time infrastructure. | Express Docs (2024) |
| **Database** | MongoDB Atlas | 8.0+ | Document-oriented NoSQL supporting schema flexibility for iterative development; accommodates varied beauty product attributes without migrations. | Abadi & Stonebraker (2009) |
| **Database ORM** | Mongoose | 8.5.2 | Schema validation and type safety for MongoDB; reduces boilerplate; simplifies data model management. | Mongoose Docs (2024) |
| **HTTP Client** | Axios | 1.12.2 | Promise-based HTTP client for external API integration (Google Gemini, payment gateways, email services). | Axios Docs (2024) |
| **Body Parser** | body-parser | 1.20.2 | Middleware for parsing request bodies (JSON, URL-encoded); essential for API request handling. | Body-parser Docs (2024) |
| **CORS** | cors | 2.8.5 | Cross-Origin Resource Sharing middleware enabling secure communication between frontend/mobile and API. | CORS Docs (2024) |
| **Rate Limiting** | express-rate-limit | 7.4.0 | Rate limiting middleware protecting API from abuse; prevents brute-force attacks on authentication endpoints. | Express-rate-limit Docs (2024) |
| **Input Validation** | express-validator | 7.1.0 | Request validation middleware; sanitizes and validates user input preventing injection attacks. | Express-validator Docs (2024) |
| **Request Logging** | morgan | 1.10.0 | HTTP request logging middleware; aids debugging and performance monitoring. | Morgan Docs (2024) |
| **File Upload** | multer | 1.4.5-lts.1 | Middleware for handling multipart/form-data file uploads; essential for product images, user avatars. | Multer Docs (2024) |
| **Task Scheduling** | node-cron | 4.2.1 | Cron job scheduler for background tasks (email campaigns, analytics aggregation, cache cleanup). | node-cron Docs (2024) |
| **Email Service** | Nodemailer | 7.0.9 | SMTP client for sending transactional emails (order confirmations, password resets, marketing campaigns). | Nodemailer Docs (2024) |
| **Environment Config** | dotenv | 17.2.1 | Loads environment variables from .env file; manages secrets (database URLs, API keys) securely. | dotenv Docs (2024) |
| **Query String Parser** | qs | 6.14.0 | Parses and stringifies URL query strings; handles complex filter parameters in API requests. | qs Docs (2024) |
| **Real-time Communication** | ws (WebSocket) | 8.18.3 | Industry-standard real-time bidirectional communication; proven in Netflix, Discord, Slack for high-concurrency scenarios. | WebSocket RFC 6455 (2011) |
| **Authentication** | JSON Web Token (JWT) | 9.0.2 | Stateless authentication enabling horizontal API scaling; industry standard for REST APIs. | RFC 7519 (2015) |
| **Password Hashing** | bcryptjs | 2.4.3 | Industry-standard password hashing with automatic salt; resistant to GPU-accelerated attacks; pure JavaScript implementation. | Provos & Mazières (1999) |
| **QR Code Generation** | qrcode | 1.5.4 | Generates QR codes for product links, event registration, sharing features during live streams. | QRCode Docs (2024) |
| **Date/Time Utilities** | moment.js | 2.30.1 | Date/time parsing, formatting, manipulation; essential for scheduling live streams, reporting date ranges. | Moment.js Docs (2024) |
| **API Documentation** | Swagger/OpenAPI | 6.2.8 | Standard API documentation format enabling interactive testing; auto-generated from code annotations. | Swagger-jsdoc Docs (2024) |
| **Swagger UI** | swagger-ui-express | 5.0.1 | Interactive API documentation UI; enables developers to test endpoints directly from browser. | Swagger-ui-express Docs (2024) |
| **Router** | vue-router | 4.4.5 | Official Vue.js routing library; enables SPA navigation between customer/admin interfaces. | Vue-router Docs (2024) |
| **Frontend Build** | Vite | 5.4.10 | Modern frontend build tool; instant hot module replacement; superior performance vs. Webpack. | Vite Docs (2024) |
| **Frontend Styling** | Tailwind CSS | 3.4.14 | Utility-first CSS framework enabling rapid UI development; includes PostCSS for optimization. | Tailwind Docs (2024) |
| **PostCSS** | postcss | 8.4.47 | CSS transformation tool; required for Tailwind CSS; enables autoprefixing for browser compatibility. | PostCSS Docs (2024) |
| **Autoprefixer** | autoprefixer | 10.4.20 | PostCSS plugin adding vendor prefixes automatically; ensures CSS works across browsers. | Autoprefixer Docs (2024) |
| **Version Control** | Git & GitHub | Latest | Industry standard for source code management; enables collaboration, code review, CI/CD integration. | GitHub Docs (2024) |
| **API Testing** | Postman | Latest | Interactive API endpoint testing and contract validation; essential for development and UAT. | Postman Docs (2024) |
| **AI Integration** | Google Gemini API | 0.24.1 | State-of-the-art conversational AI; REST API integration; supports context awareness and conversation history. | Google Generative AI Docs (2024) |

---

## 5.4 Detailed Design Diagrams

### Entity Relationship Diagram (ERD) - Organized by Service

---

####  AUTH SERVICE

```mermaid
erDiagram
    User ||--o{ Order : "customer (user)"
    User ||--o{ LiveStream : "createdBy"
    User ||--o{ EmailCampaign : "createdBy"
    User ||--o{ EmailTemplate : "createdBy"
    User ||--o{ EmailSegment : "createdBy"
    User ||--o{ ChatConversation : "userId (nullable)"
    User ||--o{ ChatConversation : "assignedStaff (staff)"
    User ||--o{ NewsletterSubscription : "userId (nullable)"
    User ||--o{ CashFlowTransaction : "createdBy (optional)"
    User ||--o{ BusinessExpense : "createdBy"

    User {
        ObjectId _id PK
        String username UK
        String password
        String role
        String email
        String phone
        String address
        Date createdAt
    }

    Order {
        ObjectId _id PK
        ObjectId user FK
        Number totalPrice
        String paymentStatus
        String status
        Date orderDate
    }

    LiveStream {
        ObjectId _id PK
        ObjectId createdBy FK
    }

    EmailCampaign {
        ObjectId _id PK
        ObjectId createdBy FK
    }

    EmailTemplate {
        ObjectId _id PK
        ObjectId createdBy FK
    }

    EmailSegment {
        ObjectId _id PK
        ObjectId createdBy FK
    }

    ChatConversation {
        ObjectId _id PK
        ObjectId userId FK
        ObjectId assignedStaff FK
    }

    NewsletterSubscription {
        ObjectId _id PK
        String email UK
        ObjectId userId FK
    }

    CashFlowTransaction {
        ObjectId _id PK
        String type
        String category
        Number amount
        ObjectId orderId FK
        ObjectId createdBy FK
    }

    BusinessExpense {
        ObjectId _id PK
        String category
        Number amount
        ObjectId createdBy FK
    }
```

The Auth service manages the User entity, which is the single source of truth for identities and roles (admin, customer). All other services reference User via foreign keys to enforce ownership, auditing, and permissions: customers place Orders; admins create Email assets and LiveStreams; chats can belong to a user or be assigned to a staff member; finance entries record who created them. Passwords are stored hashed, and role-based access is enforced at the API gateway.

---

####  E-COMMERCE SERVICE

---

####  LIVESTREAM SERVICE

---

####  COMMUNICATION SERVICE

---

####  MARKETING SERVICE

```mermaid
erDiagram
    User ||--o{ EmailCampaign : creates
    User ||--o{ EmailTemplate : creates
    User ||--o{ EmailSegment : creates
    User ||--o{ NewsletterSubscription : "links to"
    
    EmailTemplate ||--o{ EmailCampaign : "used in"
    EmailCampaign ||--o{ EmailAnalytics : "tracks"
    NewsletterSubscription ||--o{ EmailAnalytics : "receives"
    
    User {
        ObjectId _id PK
        String username UK
        String password
        String role
        String email
        String phone
        String address
        Date createdAt
    }
    
    EmailCampaign {
        ObjectId _id PK
        String name
        String subject
        String content
        String htmlContent
        ObjectId templateId FK
        String status
        String type
        ObjectId createdBy FK
        String targetAudience
        Object segmentCriteria
        Date scheduledAt
        Date sentAt
        Object analytics
        Object settings
        Array errorLogs
        Date createdAt
        Date updatedAt
    }
    
    EmailTemplate {
        ObjectId _id PK
        String name
        String description
        String category
        String htmlContent
        String textContent
        String thumbnail
        Array variables
        Object styles
        Boolean isDefault
        Boolean isActive
        Number usageCount
        Date lastUsed
        ObjectId createdBy FK
        Date createdAt
        Date updatedAt
    }
    
    EmailSegment {
        ObjectId _id PK
        String name
        String description
        Object criteria
        Number subscriberCount
        ObjectId createdBy FK
        Boolean isDefault
        Date lastUpdated
        Date createdAt
        Date updatedAt
    }
    
    NewsletterSubscription {
        ObjectId _id PK
        String email UK
        Date subscriptionDate
        Boolean isActive
        String source
        String unsubscribeToken UK
        Date unsubscribedDate
        ObjectId userId FK
        Object preferences
        String ipAddress
        String userAgent
        Date createdAt
        Date updatedAt
    }
    
    EmailAnalytics {
        ObjectId _id PK
        ObjectId campaignId FK
        String subscriberEmail
        ObjectId subscriberId FK
        Date sentAt
        Date deliveredAt
        Date bouncedAt
        String bounceReason
        Array opens
        Array clicks
        Date unsubscribedAt
        Date complainedAt
        Date forwardedAt
        String status
        Object deviceInfo
        Date createdAt
        Date updatedAt
    }
```

---

####  HR SERVICE

```mermaid
erDiagram
    USER ||--o{ EMPLOYEE : "1:1 (userId)"
    EMPLOYEE ||--o{ EMPLOYEE : "1:N (manager)"
    EMPLOYEE ||--o{ PERFORMANCE_REVIEW : "1:N"
    EMPLOYEE ||--o{ DOCUMENT : "1:N"

    USER {
        ObjectId _id PK
        string email
        string username
        string role
    }

    EMPLOYEE {
        ObjectId _id PK
        string employeeId UK
        string firstName
        string lastName
        string email UK
        string phone
        object address
        string department
        string position
        string employmentType
        string status
        object salary
        Date startDate
        Date endDate
        ObjectId manager FK
        array skills
        object emergencyContact
        object leaveBalance
        object benefits
        string notes
        string profilePhoto
        Date createdAt
        Date updatedAt
    }

    PERFORMANCE_REVIEW {
        ObjectId _id PK
        Date reviewDate
        number rating
        string comments
        ObjectId reviewedBy FK
    }

    DOCUMENT {
        ObjectId _id PK
        string name
        string type
        Date uploadDate
        string filePath
    }
```

**HR SERVICE - Entity Relationship Diagram Explanation:**

The HR Service manages employee records with comprehensive workforce management capabilities. The diagram shows four main entities and their relationships:

| Entity | Purpose | Key Fields | Relationships |
|---|---|---|---|
| **USER** | Central identity provider (from Auth Service) | _id, email, username, role | 1:1 → Employee (optional link) |
| **EMPLOYEE** | Core HR entity for employee records | employeeId, firstName, lastName, department, position, salary, status | 1:N → Performance Reviews<br>1:N → Documents<br>1:N → Manager (self-referencing) |
| **PERFORMANCE_REVIEW** | Performance evaluation records | reviewDate, rating (1-5), comments, reviewedBy | N:1 ← Employee |
| **DOCUMENT** | Employee documents (contracts, certifications, etc.) | name, type, uploadDate, filePath | N:1 ← Employee |

**Key Relationships Explained:**

1. **USER ↔ EMPLOYEE (1:1 Optional)**
   - Each Employee may have an associated User account (optional)
   - Not all Users are Employees (customers don't have Employee records)
   - Not all Employees need User accounts (can be managed via HR system only)
   - Implementation: Employee stores userId reference (nullable)

2. **EMPLOYEE ↔ EMPLOYEE (1:N Self-Referencing)**
   - Represents manager-subordinate hierarchy
   - Each Employee has ONE manager (nullable for top-level executives)
   - Each manager can have MANY subordinates
   - Implementation: Employee.manager stores ObjectId reference to another Employee

3. **EMPLOYEE → PERFORMANCE_REVIEW (1:N)**
   - Each Employee has MANY performance reviews over time
   - Each review belongs to ONE employee
   - Tracks historical performance ratings and feedback
   - Implementation: PerformanceReview.employeeId references Employee

4. **EMPLOYEE → DOCUMENT (1:N)**
   - Each Employee has MANY documents (contracts, certifications, etc.)
   - Each document belongs to ONE employee
   - Documents stored with file paths and metadata
   - Implementation: Document.employeeId references Employee

**Field Details:**

| Field | Type | Purpose | Constraints |
|---|---|---|---|
| **employeeId** | String | Unique employee identifier | Unique, Required |
| **department** | String (Enum) | Department assignment | engineering, marketing, sales, finance, hr, operations, customer_service, design, management |
| **employmentType** | String (Enum) | Employment classification | full_time, part_time, contract, intern |
| **status** | String (Enum) | Current employment status | active, inactive, terminated, on_leave |
| **salary** | Object | Compensation details | {amount, currency, payFrequency} |
| **leaveBalance** | Object | Leave entitlements | {vacation, sick, personal} |
| **benefits** | Object | Employee benefits | {healthInsurance, dentalInsurance, retirementPlan, lifeInsurance} |
| **manager** | ObjectId (FK) | Direct manager reference | Self-referencing to Employee, nullable |
| **skills** | Array | Employee competencies | Array of strings |
| **emergencyContact** | Object | Emergency contact info | {name, relationship, phone, email} |

**Data Integrity Constraints:**

1. **Unique Constraints:**
   - `employeeId` - Each employee has unique ID
   - `email` - Each employee has unique email

2. **Enum Constraints:**
   - Department must be from predefined list
   - Employment type restricted to 4 options
   - Status limited to active/inactive/terminated/on_leave

3. **Validation Rules:**
   - Performance rating: 1-5 scale
   - startDate must be before endDate (if endDate exists)
   - manager field is optional (for executives with no manager)

**HR Service Features Supported by This ERD:**

| Feature | Entities Used | Description |
|---|---|---|
| **Employee Management** | Employee | Create, read, update, delete employee records |
| **Organizational Hierarchy** | Employee (self-ref) | Track manager-subordinate relationships |
| **Performance Tracking** | Performance Review | Record and track employee performance ratings |
| **Document Management** | Document | Store employee contracts, certifications, etc. |
| **Payroll Integration** | Employee.salary | Calculate payroll based on salary data |
| **Leave Management** | Employee.leaveBalance | Track vacation, sick, personal leave |
| **Department Analytics** | Employee.department | Generate department-level statistics |
| **Search & Filtering** | Employee | Search by name, department, status, position |

---

#### FINANCE SERVICE

```mermaid
erDiagram
    USER ||--o{ BUSINESS_EXPENSE : "createdBy"
    USER ||--o{ CASH_FLOW_TRANSACTION : "createdBy"
    ORDER ||--o{ CASH_FLOW_TRANSACTION : "1:N (orderId)"

    USER {
        ObjectId _id PK
        string email
        string username
        string role
    }

    BUSINESS_EXPENSE {
        ObjectId _id PK
        string category
        number amount
        string description
        boolean isRecurring
        string frequency
        Date date
        string vendor
        string invoiceNumber
        string paymentMethod
        string status
        Date dueDate
        Date nextOccurrence
        ObjectId createdBy FK
        string notes
        Date createdAt
        Date updatedAt
    }

    CASH_FLOW_TRANSACTION {
        ObjectId _id PK
        string type
        string category
        number amount
        string description
        ObjectId orderId FK
        Date date
        boolean automated
        ObjectId createdBy FK
        Date createdAt
        Date updatedAt
    }

    ORDER {
        ObjectId _id PK
        ObjectId userId FK
        number totalPrice
        string paymentStatus
        string status
        Date orderDate
    }
```

**FINANCE SERVICE - Entity Relationship Diagram Explanation:**

The Finance service contains two primary entities that capture company expenses and cash movements. It also references orders and users for traceability and automation.

- BUSINESS_EXPENSE: Tracks non-order expenses like rent, marketing, payroll, equipment, etc. Supports recurring expenses with frequency and nextOccurrence.
- CASH_FLOW_TRANSACTION: Unified ledger for both inflows and outflows. Inflows commonly come from completed orders (orderId FK), while outflows capture operating costs and refunds. Records whether entries are automated or manually created by admins.

**Key Relationships:**
- USER → BUSINESS_EXPENSE (1:N via createdBy): Which admin created the expense record.
- USER → CASH_FLOW_TRANSACTION (1:N via createdBy): Which admin recorded a manual transaction.
- ORDER → CASH_FLOW_TRANSACTION (1:N via orderId): A single order may spawn multiple transactions (e.g., sale inflow, refund outflow).

**Notable Fields and Constraints:**
- BUSINESS_EXPENSE.category: enum of rent, utilities, payroll, marketing, shipping, equipment, software, other
- BUSINESS_EXPENSE.isRecurring + frequency: frequency is required when isRecurring = true
- CASH_FLOW_TRANSACTION.type: inflow or outflow
- CASH_FLOW_TRANSACTION.category: separate enum values for inflow vs outflow
- createdAt/updatedAt: added via timestamps in both models

**Typical Flows Supported:**
- Sync completed orders to inflow transactions (cashFlowRoutes: /sync-orders)
- Generate dashboards and forecasts from transactions (/dashboard, /history, /categories, /forecast)
- Manual admin entries for ad-hoc cash movements (/transactions POST)

---

#### RELATIONSHIPS SUMMARY

```
┌─────────────────────────────────────────────────────────────────────┐
│                 KEY RELATIONSHIPS ACROSS SERVICES                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ FROM USER (Auth Service):                                          │
│   1:N → Order (E-Commerce)                                         │
│   1:N → LiveStream (Livestream)                                    │
│   1:N → ChatConversation (Communication, nullable)                 │
│   1:N → EmailCampaign (Marketing)                                  │
│   1:N → Employee (HR)                                              │
│   1:1 → ChatConversation assignedStaff (staff escalation)         │
│                                                                     │
│ E-COMMERCE SERVICE:                                                 │
│   Category 1:N → Product (categoryId FK)                           │
│   Product M:N → Order (via embedded Order.products[])              │
│                                                                     │
│ LIVESTREAM SERVICE:                                                 │
│   LiveStream.creatorId → User (FK)                                 │
│   LiveStream.chatMessages[] → embedded (no separate collection)    │
│                                                                     │
│ COMMUNICATION SERVICE:                                              │
│   ChatConversation.userId → User (FK, nullable)                    │
│   ChatConversation.assignedStaff → User (FK)                      │
│   ChatConversation.messages[] → embedded array                     │
│   Message metadata.faqId → FAQ (FK)                               │
│   Message metadata.retrievedProducts[] → Product (FK refs)        │
│                                                                     │
│ MARKETING SERVICE:                                                  │
│   EmailCampaign.creatorId → User (FK)                             │
│   EmailCampaign.templateId → EmailTemplate (FK)                   │
│   EmailCampaign N:N → EmailSegment (via filters)                  │
│   EmailAnalytics.campaignId → EmailCampaign (FK)                  │
│   NewsletterSubscription.userId → User (FK)                       │
│                                                                     │
│ HR SERVICE:                                                          │
│   Employee.userId → User (FK, 1:1 relationship)                   │
│                                                                     │
│ FINANCE SERVICE:                                                    │
│   BusinessExpense.createdBy → User (FK)                            │
│   CashFlowTransaction.createdBy → User (FK, optional)             │
│   CashFlowTransaction.orderId → Order (FK)                        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Use Case Diagram



### Activity Diagram – Customer Purchase Flow



---

## 5.5 API Design

### Key API Endpoints

| ID | URL | Method | Description | Params | Returns |
|---|---|---|---|---|---|
| 1 | `/api/auth/register` | POST | User registration (customer/admin/staff) | email, password, firstName, lastName, role | {userId, token, refreshToken} |
| 2 | `/api/auth/login` | POST | User login with credentials | email, password | {token, refreshToken, user} |
| 3 | `/api/auth/refresh` | POST | Refresh expired JWT token | refreshToken | {token, refreshToken} |
| 4 | `/api/products` | GET | List all products with optional filters | page, limit, category, skinType, concern, search | {products: [], totalCount, page, totalPages} |
| 5 | `/api/products/:id` | GET | Get product details including ingredients, reviews | productId | {product: {name, description, price, ingredients[], reviews[]}} |
| 6 | `/api/products` | POST | Create new product (admin only) | name, price, description, ingredients[], skinTypes[], concern[] | {productId, message} |
| 7 | `/api/products/:id` | PUT | Update product details (admin only) | productId, name, price, description, inventory | {message, updatedProduct} |
| 8 | `/api/cart` | GET | Get current user's cart | userId (from JWT) | {items: [{productId, name, price, quantity}], total} |
| 9 | `/api/cart/items` | POST | Add product to cart | productId, quantity | {cartId, message} |
| 10 | `/api/cart/items/:itemId` | PUT | Update cart item quantity | itemId, quantity | {message, updatedCart} |
| 11 | `/api/cart/items/:itemId` | DELETE | Remove item from cart | itemId | {message, updatedCart} |
| 12 | `/api/cart/checkout` | POST | Process checkout and create order | paymentMethodId, shippingAddress | {orderId, totalPrice, estimatedDelivery} |
| 13 | `/api/orders` | GET | Get user's order history | userId (from JWT), page, limit | {orders: [{orderId, date, totalPrice, status, items[]}], totalCount} |
| 14 | `/api/orders/:id` | GET | Get order details | orderId | {order: {orderId, items[], totalPrice, status, shippingAddress, trackingNumber}} |
| 15 | `/api/orders/:id/status` | PUT | Update order status (admin/staff only) | orderId, newStatus | {message, updatedOrder} |
| 16 | `/api/recommendations` | GET | Get AI-powered product recommendations | userId (from JWT), skinType, concerns[] | {recommendations: [{productId, name, relevanceScore, reason}]} |
| 17 | `/api/chat` | POST | Send message to AI chatbot | userId (from JWT), message, conversationId | {response, conversationId, messageId} |
| 18 | `/api/chat/history` | GET | Get conversation history with AI | userId (from JWT), conversationId | {messages: [{role, content, timestamp}]} |
| 19 | `/api/livestreams` | GET | List upcoming/ongoing live streams | status, page, limit | {streams: [{streamId, title, scheduledStart, viewerCount, status}], totalCount} |
| 20 | `/api/livestreams` | POST | Create new live stream (admin/staff) | title, description, scheduledStart, productIds[] | {streamId, message} |
| 21 | `/api/livestreams/:id` | GET | Get live stream details | streamId | {stream: {title, description, status, viewers, chat[], pinnedProducts[]}} |
| 22 | `/api/livestreams/:id/messages` | POST | Send message in live stream chat (via WebSocket) | streamId, userId, message | {messageId, timestamp} |
| 23 | `/api/livestreams/:id/analytics` | GET | Get stream analytics (admin only) | streamId | {analytics: {totalViewers, avgWatchTime, conversions, topProducts[]}} |
| 24 | `/api/analytics/sales` | GET | Get sales analytics dashboard | startDate, endDate, groupBy | {totalRevenue, totalOrders, conversionRate, topProducts[], dailyRevenue[]} |
| 25 | `/api/analytics/customers` | GET | Get customer analytics (admin only) | startDate, endDate | {newCustomers, repeatCustomers, avgOrderValue, churnRate} |
| 26 | `/api/campaigns` | GET | Get email campaigns (admin only) | page, limit | {campaigns: [{campaignId, name, audience, sentCount, openRate}], totalCount} |
| 27 | `/api/campaigns` | POST | Create email campaign (admin only) | name, subject, template, audienceFilter, scheduledTime | {campaignId, message} |
| 28 | `/api/campaigns/:id/send` | POST | Send email campaign (admin only) | campaignId | {message, sentCount} |
| 29 | `/api/users` | GET | List all users (admin only) | page, limit, role | {users: [{userId, email, role, createdAt}], totalCount} |
| 30 | `/api/users/:id/roles` | PUT | Update user role (admin only) | userId, newRole | {message, updatedUser} |
| 31 | `/api/financial/reports` | GET | Get financial reports (admin only) | month, year | {revenue, expenses, profit, productBreakdown[], categoryBreakdown[]} |
| 32 | `/api/reviews` | POST | Submit product review (customer only) | productId, rating, comment | {reviewId, message} |
| 33 | `/api/reviews/product/:id` | GET | Get all reviews for product | productId, page, limit | {reviews: [{userId, rating, comment, createdAt}], avgRating, totalCount} |

### Sample Request/Response

**Example 1: Get Product Recommendations**

```javascript
// Request
GET /api/recommendations
Headers: {
  Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

// Response (200 OK)
{
  "recommendations": [
    {
      "productId": "prod_12345",
      "name": "Hydrating Essence Serum",
      "price": 29.99,
      "relevanceScore": 0.92,
      "reason": "Recommended based on your combination skin + sensitivity concerns; 89% of users with your profile rated this 4+/5 stars"
    },
    {
      "productId": "prod_12346",
      "name": "Niacinamide Night Cream",
      "price": 34.99,
      "relevanceScore": 0.87,
      "reason": "Addresses breakouts without irritation; contains non-comedogenic ingredients matching your skin concerns"
    }
  ]
}
```

**Example 2: Create Order**

```javascript
// Request
POST /api/cart/checkout
Headers: {
  Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  Content-Type: "application/json"
}
Body: {
  "paymentMethodId": "pm_stripe_12345",
  "shippingAddress": {
    "street": "123 Main St",
    "city": "San Francisco",
    "state": "CA",
    "zip": "94102",
    "country": "US"
  }
}

// Response (201 Created)
{
  "orderId": "order_98765",
  "totalPrice": 74.98,
  "itemCount": 2,
  "status": "confirmed",
  "estimatedDelivery": "2025-11-24",
  "message": "Order placed successfully. Confirmation email sent to user@example.com"
}
```

**Example 3: Send Live Stream Chat Message**

```javascript
// WebSocket Connection
wss://api.wrencos.com/ws/livestream/:streamId

// Emit Event
{
  "type": "message",
  "userId": "user_abc123",
  "message": "Does this serum work for sensitive skin?",
  "timestamp": "2025-11-17T14:30:45Z"
}

// Receive Event
{
  "type": "message",
  "id": "msg_12345",
  "userId": "user_abc123",
  "username": "Sarah Chen",
  "message": "Does this serum work for sensitive skin?",
  "avatar": "https://...",
  "timestamp": "2025-11-17T14:30:45Z",
  "isModerator": false
}
```

---
