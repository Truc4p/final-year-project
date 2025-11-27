# 5. System Design and Architecture

## 5.1 Rich Picture

### Rich Picture Narrative

## 5.2 System Architecture

### High-Level Architecture Overview


### C4 Model Diagrams

#### System Context Diagram (Level 1)


Primary Actors (Users):
Customer - Browses products, makes purchases, watches livestreams, browses FAQ, chats with AI, chats with staff, chats with AI dermatology expert 
Admin - Manages products, orders, users, livestreams, analytics, finances, HR, email marketing
Guest User - View product catalog, subscribe email

External Systems:
Google Gemini AI API

Provides AI-powered dermatology consultation
Product recommendations
Intelligent chat responses
Image analysis for skin conditions
Text-to-speech and audio transcription
Qdrant Vector Database

Stores embeddings for RAG (Retrieval-Augmented Generation)
Enables semantic search for FAQ and knowledge base
Powers contextual AI responses
MongoDB Atlas

Cloud database storing all application data
User accounts, products, orders, conversations, etc.
VNPay Payment Gateway

Processes customer payments
Handles transactions for orders
SMTP Email Server

Sends transactional emails (order confirmations, password resets)
Delivers marketing campaigns
Newsletter distribution
Agora SDK

Powers live video streaming for product demonstrations
Real-time video delivery to mobile apps
WebSocket Server

Real-time bidirectional communication
Live chat during streams
Instant messaging support
Key Interactions:
Customers → Browse products, place orders, watch livestreams, chat with AI, receive emails
Admins → Manage content, create campaigns, monitor analytics, conduct livestreams
Wrencos Platform ↔ Gemini AI → AI consultations and recommendations
Wrencos Platform ↔ MongoDB → Data persistence and retrieval
Wrencos Platform ↔ VNPay → Payment processing
Wrencos Platform ↔ Email Server → Email communications
Wrencos Platform ↔ Qdrant → Semantic search and RAG
Wrencos Platform ↔ Agora → Live streaming infrastructure
This is a Level 1 C4 diagram showing the big picture - the system boundary and how it fits into the broader ecosystem with external actors and systems. Would you like me to create the actual Mermaid diagram code for this System Context Diagram?


#### Container Diagram (Level 2)


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

## 5.4 Detailed Design Diagrams

### Entity Relationship Diagram (ERD) - Organized by Service

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

####  E-COMMERCE SERVICE

```mermaid
erDiagram
    User ||--o{ Order : "customer (user)"
    Category ||--o{ Product : "1:N"
    Product ||--o{ OrderItem : "in items"
    Order ||--o{ OrderItem : "has items"

    User {
        ObjectId _id PK
        String username UK
        String email
        String role
    }

    Category {
        ObjectId _id PK
        String name
    }

    Product {
        ObjectId _id PK
        String name
        ObjectId category FK
        String image
        String description
        Number price
        Number stockQuantity
        Array ingredients
        Array skinType
        Array benefits
        Array tags
        String usage
        Array skinConcerns
    }

    Order {
        ObjectId _id PK
        ObjectId user FK
        String paymentMethod
        String paymentStatus
        Date orderDate
        String status
        Number totalPrice
        Number subtotal
        Number tax
        Number taxRate
        Number shippingFee
        String shippingLocation
    }

    OrderItem {
        ObjectId _id PK
        ObjectId productId FK
        Number quantity
        Number price
    }
```

The E‑Commerce service manages the product catalog, category taxonomy, and customer orders. Products belong to a Category, and each Order belongs to a User. Order items are stored as embedded subdocuments in Order.products[]; in the ERD they are represented as a conceptual OrderItem entity to make the Product↔Order many‑to‑many explicit. The model also captures pricing and fulfillment details as well as inventory and rich product attributes used by search and AI recommendations.

####  LIVESTREAM SERVICE

```mermaid
erDiagram
    User ||--o{ LiveStream : "createdBy"
    LiveStream ||--o{ ChatMessage : "embedded"
    LiveStream ||--o{ PinnedProduct : "embedded"
    Product ||--o{ PinnedProduct : "pinned in"

    User {
        ObjectId _id PK
        String username UK
        String email
        String role
    }

    LiveStream {
        ObjectId _id PK
        String title
        String description
        String videoUrl
        String streamUrl
        String thumbnailUrl
        Number duration
        Number viewCount
        Number likes
        Array likedBy
        Number maxViewers
        Date startTime
        Date endTime
        String quality
        Boolean isActive
        Boolean isRecorded
        Array categories
        Array tags
        ObjectId createdBy FK
        Date createdAt
        Date updatedAt
    }

    ChatMessage {
        ObjectId _id PK
        String username
        String message
        Date timestamp
        Boolean isAdmin
    }

    PinnedProduct {
        ObjectId _id PK
        ObjectId productId FK
        Date pinnedAt
        Number displayOrder
        Boolean isActive
    }

    Product {
        ObjectId _id PK
        String name
        Number price
    }
```

The Livestream service manages live video sessions created by admin users. Each LiveStream is owned by a User (createdBy). Real‑time chat and product promotions are stored as embedded arrays in the LiveStream document; in the ERD they appear as conceptual entities (ChatMessage, PinnedProduct) so the relationships are explicit. PinnedProduct forms an associative link between LiveStream and Product (many‑to‑many), while ChatMessage captures the stream’s chat timeline. Operational and discovery fields (isActive, isRecorded, quality, tags, categories, views/likes/maxViewers) support analytics, playback, and search.

####  COMMUNICATION SERVICE

```mermaid
erDiagram
    User ||--o{ ChatConversation : "userId (optional)"
    User ||--o{ ChatConversation : "assignedStaff (staff)"
    ChatConversation ||--o{ Message : "messages[] embedded"
    Message }o--|| FAQ : "metadata.faqId"
    Product ||--o{ Message : "metadata.retrievedProducts"

    User {
        ObjectId _id PK
        String username UK
        String email
        String role
        Date createdAt
    }

    ChatConversation {
        ObjectId _id PK
        String sessionId
        ObjectId userId FK
        Boolean isActive
        Boolean isStaffChat
        Boolean waitingForStaff
        Boolean hasUnreadFromCustomer
        Date lastStaffRead
        ObjectId assignedStaff FK
        Date lastActivity
        Date createdAt
    }

    Message {
        ObjectId _id PK
        String role
        String content
        Date timestamp
        String messageType
        Object metadata
    }

    FAQ {
        ObjectId _id PK
        String question
        String answer
        String category
        Array tags
        Boolean isActive
        Number priority
        Date createdAt
        Date updatedAt
    }

    Product {
        ObjectId _id PK
        String name
        Number price
    }
```

The Communication service orchestrates customer conversations, FAQs, and AI-assisted replies. A ChatConversation can be anonymous or linked to a User; staff can be assigned for escalation. Each conversation embeds a timeline of Message items. Message metadata optionally links to one FAQ (for predefined answers) and may reference multiple Products retrieved for recommendations. Operational flags (isActive, isStaffChat, waitingForStaff, unread, lastStaffRead, lastActivity) support routing, triage, and analytics.

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

The Marketing service manages email campaign orchestration, template design, and subscriber segmentation. Admins create EmailCampaigns using reusable EmailTemplates and define targeting criteria through EmailSegments. Each campaign tracks delivery and engagement metrics through EmailAnalytics, which records opens, clicks, bounces, and unsubscribes for every NewsletterSubscription recipient. Campaigns reference templates via foreign keys and apply segment criteria to target relevant subscribers; analytics link campaigns to subscriber interactions, enabling performance measurement and audience insights. All marketing assets are created and owned by admin users (createdBy), ensuring audit trails and role-based permissions.

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

The HR service manages employee records, organizational hierarchy, performance evaluations, and document storage. Each Employee is linked to a User account (1:1 via userId) for authentication and system access; employees form a hierarchical structure through self-referential manager relationships, enabling multi-level reporting chains. Performance reviews track evaluation history with ratings, comments, and reviewer attribution (reviewedBy), while Documents store employment-related files (contracts, certifications, policies) with metadata. Employee records capture comprehensive HR data including compensation, benefits, leave balances, skills, and emergency contacts, providing a complete personnel management system with audit trails through createdAt/updatedAt timestamps.

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

The Finance service models operational spending and cash movements via BusinessExpense and CashFlowTransaction. Expenses capture non-order outflows (e.g., rent, marketing) with optional recurrence metadata, while cash‑flow entries record both inflows and outflows; inflows often reference an Order (orderId), and manual/adjustment entries are attributed to a User (createdBy) for auditability. This schema supports automated syncing of completed orders into the ledger, handling of refunds and ad‑hoc adjustments, and reliable dashboarding and forecasting through consistent timestamps, categories, and linkage to users and orders.

#### SKIN STUDY SERVICE

```mermaid
erDiagram
    DERMATOLOGY_KNOWLEDGE {
        ObjectId _id PK
        String category
        String subcategory
        String title
        String content
        Array keywords
        String sourceReference
        String chapterNumber
        String chapterTitle
        String pageReference
        Boolean verified
        Date lastUpdated
        Date createdAt
        Date updatedAt
    }
```

The Skin Study service provides a curated dermatology knowledge base used by the AI Dermatology Expert. Entries capture category/subcategory, title, rich content, keywords for search, and full source citations, plus verification status and update timestamps. There are no direct foreign-key relations to users or other services; instead, this collection is retrieved via text search and vector RAG (vectorService) to ground AI answers with authoritative references.

### UML Diagrams

#### 1. Class Diagram – Core Domain Model

```mermaid
classDiagram
    class User {
        -_id: ObjectId
        -username: String
        -password: String
        -role: String
        -email: String
        -phone: String
        -address: String
        -createdAt: Date
        +register(): void
        +login(): Token
        +updateProfile(): void
        +matchPassword(): Boolean
    }

    class Product {
        -_id: ObjectId
        -name: String
        -price: Number
        -description: String
        -category: ObjectId
        -stockQuantity: Number
        -ingredients: Array
        -skinType: Array
        -benefits: Array
        -tags: Array
        -usage: String
        -skinConcerns: Array
        +getDetails(): Product
        +updateStock(): void
        +getRecommendations(): Array
    }

    class Order {
        -_id: ObjectId
        -user: ObjectId
        -items: Array
        -totalPrice: Number
        -paymentStatus: String
        -status: String
        -orderDate: Date
        -shippingLocation: String
        -taxRate: Number
        +createOrder(): Order
        +updateStatus(): void
        +calculateTotal(): Number
        +trackOrder(): OrderStatus
    }

    class LiveStream {
        -_id: ObjectId
        -title: String
        -description: String
        -videoUrl: String
        -streamUrl: String
        -createdBy: ObjectId
        -startTime: Date
        -endTime: Date
        -viewCount: Number
        -isActive: Boolean
        -pinnedProducts: Array
        -chatMessages: Array
        +startStream(): void
        +endStream(): void
        +pinProduct(): void
        +getAnalytics(): Analytics
    }

    class ChatConversation {
        -_id: ObjectId
        -sessionId: String
        -userId: ObjectId
        -assignedStaff: ObjectId
        -messages: Array
        -isActive: Boolean
        -isStaffChat: Boolean
        -lastActivity: Date
        +sendMessage(): Message
        +escalateToStaff(): void
        +getHistory(): Array
        +closeConversation(): void
    }

    class EmailCampaign {
        -_id: ObjectId
        -name: String
        -subject: String
        -templateId: ObjectId
        -createdBy: ObjectId
        -targetAudience: String
        -status: String
        -scheduledAt: Date
        -sentAt: Date
        -analytics: Object
        +createCampaign(): Campaign
        +sendCampaign(): void
        +trackAnalytics(): Analytics
        +getOpenRate(): Number
    }

    class Employee {
        -_id: ObjectId
        -employeeId: String
        -firstName: String
        -lastName: String
        -email: String
        -department: String
        -position: String
        -manager: ObjectId
        -salary: Object
        -startDate: Date
        +getDetails(): Employee
        +updateSalary(): void
        +assignManager(): void
    }

    class BusinessExpense {
        -_id: ObjectId
        -category: String
        -amount: Number
        -description: String
        -date: Date
        -vendor: String
        -createdBy: ObjectId
        -isRecurring: Boolean
        +recordExpense(): void
        +calculateTotal(): Number
    }

    class CashFlowTransaction {
        -_id: ObjectId
        -type: String
        -category: String
        -amount: Number
        -orderId: ObjectId
        -date: Date
        -createdBy: ObjectId
        +recordTransaction(): void
        +getBalance(): Number
    }

    class FAQ {
        -_id: ObjectId
        -question: String
        -answer: String
        -category: String
        -tags: Array
        -isActive: Boolean
        -priority: Number
        +searchFAQ(): Array
        +updateAnswer(): void
    }

    User "1" --> "*" Order : places
    User "1" --> "*" LiveStream : creates
    User "1" --> "*" EmailCampaign : creates
    User "1" --> "*" ChatConversation : initiates
    User "1" --> "*" BusinessExpense : records
    User "1" --> "*" CashFlowTransaction : records
    User "1" --> "*" Employee : manages
    
    Product "1" --> "*" Order : contains
    Product "1" --> "*" LiveStream : pinned in
    
    Order "1" --> "*" CashFlowTransaction : generates
    
    LiveStream "1" --> "*" ChatConversation : has
    
    EmailCampaign "1" --> "*" FAQ : references
```

**Explanation:** This Class Diagram represents the core domain entities and their relationships. The User class is central, acting as the primary actor across all services. Products are managed in the E-Commerce service and referenced in Orders and LiveStreams. Orders generate financial transactions, while LiveStreams facilitate real-time customer engagement. EmailCampaigns manage marketing communications, and Employees represent the organizational structure. The diagram shows how entities interact through one-to-many relationships, establishing clear ownership and data flow patterns.

#### 2. Use Case Diagram
#### 2.1 Use Case Diagram - Customer

```mermaid
graph TB
    subgraph CustomerActors["Customer Actors"]
        GuestCustomer["Guest Customer<br/>(No Account)"]
        RegisteredCustomer["Registered Customer<br/>(Logged In)"]
    end

    subgraph BrowsingFeatures["Browsing & Discovery"]
        ViewProducts["View Product Catalog"]
        SearchProducts["Search Products<br/>(by name, category, concern)"]
        FilterProducts["Filter Products<br/>(by skin type, price, rating)"]
        ViewDetails["View Product Details<br/>(ingredients, reviews, usage)"]
        ViewReviews["View Customer Reviews<br/>& Ratings"]
        GetRecommendations["Get AI Recommendations<br/>(Gemini-powered)"]
    end

    subgraph ChatFeatures["Communication & Support"]
        AccessFAQ["Access FAQ<br/>(Self-service)"]
        ChatWithAI["Chat with AI Bot<br/>(Product recommendations)"]
        EscalateToStaff["Escalate to Staff<br/>(Human support)"]
        ViewChatHistory["View Chat History<br/>(Registered only)"]
    end

    subgraph ShoppingFeatures["Shopping & Cart"]
        AddToCart["Add Product to Cart"]
        ViewCart["View Shopping Cart"]
        UpdateQuantity["Update Item Quantity"]
        RemoveFromCart["Remove Item from Cart"]
        SaveForLater["Save for Later<br/>(Registered only)"]
    end

    subgraph CheckoutFeatures["Checkout & Payment"]
        EnterShippingInfo["Enter Shipping Address"]
        SelectPaymentMethod["Select Payment Method<br/>(VNPay)"]
        ReviewOrder["Review Order Summary"]
        ApplyCoupon["Apply Coupon/Discount<br/>(if available)"]
        CompletePayment["Complete Payment<br/>(VNPay Gateway)"]
    end

    subgraph OrderFeatures["Order Management"]
        ViewOrders["View Order History<br/>(Registered only)"]
        TrackOrder["Track Order Status<br/>& Delivery"]
        ViewOrderDetails["View Order Details<br/>(items, receipt, tracking)"]
        CancelOrder["Cancel Order<br/>(if eligible)"]
        RequestReturn["Request Return/Refund<br/>(if eligible)"]
    end

    subgraph LivestreamFeatures["Livestream & Events"]
        ViewLivestreams["View Upcoming Livestreams"]
        JoinLivestream["Join Livestream<br/>(Watch live video)"]
        ChatInLivestream["Chat in Livestream<br/>(Real-time messages)"]
        ViewPinnedProducts["View Pinned Products<br/>(from livestream)"]
        BuyFromLivestream["Buy Pinned Product<br/>(direct checkout)"]
    end

    subgraph AccountFeatures["Account Management"]
        Register["Register Account<br/>(email, password)"]
        Login["Login to Account"]
        UpdateProfile["Update Profile<br/>(name, email, phone, address)"]
        ChangePassword["Change Password"]
        ManagePreferences["Manage Preferences<br/>(notifications, language)"]
        Logout["Logout"]
    end

    subgraph NewsletterFeatures["Newsletter & Marketing"]
        SubscribeNewsletter["Subscribe to Newsletter"]
        UnsubscribeNewsletter["Unsubscribe from Newsletter"]
        ViewPromotions["View Promotions<br/>& Special Offers"]
    end

    subgraph ReviewFeatures["Reviews & Feedback"]
        SubmitReview["Submit Product Review<br/>(rating, comment)"]
        RateProduct["Rate Product<br/>(1-5 stars)"]
        ReportReview["Report Inappropriate Review"]
    end

    %% Guest Customer Use Cases
    GuestCustomer --> ViewProducts
    GuestCustomer --> SearchProducts
    GuestCustomer --> FilterProducts
    GuestCustomer --> ViewDetails
    GuestCustomer --> ViewReviews
    GuestCustomer --> AccessFAQ
    GuestCustomer --> ChatWithAI
    GuestCustomer --> EscalateToStaff
    GuestCustomer --> AddToCart
    GuestCustomer --> ViewCart
    GuestCustomer --> UpdateQuantity
    GuestCustomer --> RemoveFromCart
    GuestCustomer --> EnterShippingInfo
    GuestCustomer --> SelectPaymentMethod
    GuestCustomer --> ReviewOrder
    GuestCustomer --> CompletePayment
    GuestCustomer --> ViewLivestreams
    GuestCustomer --> JoinLivestream
    GuestCustomer --> ChatInLivestream
    GuestCustomer --> ViewPinnedProducts
    GuestCustomer --> Register

    %% Registered Customer Use Cases (all guest features + more)
    RegisteredCustomer --> ViewProducts
    RegisteredCustomer --> SearchProducts
    RegisteredCustomer --> FilterProducts
    RegisteredCustomer --> ViewDetails
    RegisteredCustomer --> ViewReviews
    RegisteredCustomer --> GetRecommendations
    RegisteredCustomer --> AccessFAQ
    RegisteredCustomer --> ChatWithAI
    RegisteredCustomer --> EscalateToStaff
    RegisteredCustomer --> ViewChatHistory
    RegisteredCustomer --> AddToCart
    RegisteredCustomer --> ViewCart
    RegisteredCustomer --> UpdateQuantity
    RegisteredCustomer --> RemoveFromCart
    RegisteredCustomer --> SaveForLater
    RegisteredCustomer --> EnterShippingInfo
    RegisteredCustomer --> SelectPaymentMethod
    RegisteredCustomer --> ReviewOrder
    RegisteredCustomer --> ApplyCoupon
    RegisteredCustomer --> CompletePayment
    RegisteredCustomer --> ViewOrders
    RegisteredCustomer --> TrackOrder
    RegisteredCustomer --> ViewOrderDetails
    RegisteredCustomer --> CancelOrder
    RegisteredCustomer --> RequestReturn
    RegisteredCustomer --> ViewLivestreams
    RegisteredCustomer --> JoinLivestream
    RegisteredCustomer --> ChatInLivestream
    RegisteredCustomer --> ViewPinnedProducts
    RegisteredCustomer --> BuyFromLivestream
    RegisteredCustomer --> UpdateProfile
    RegisteredCustomer --> ChangePassword
    RegisteredCustomer --> ManagePreferences
    RegisteredCustomer --> Logout
    RegisteredCustomer --> SubscribeNewsletter
    RegisteredCustomer --> UnsubscribeNewsletter
    RegisteredCustomer --> ViewPromotions
    RegisteredCustomer --> SubmitReview
    RegisteredCustomer --> RateProduct
    RegisteredCustomer --> ReportReview

    %% Dependencies and Extensions
    AddToCart --> ViewCart
    ViewCart --> UpdateQuantity
    ViewCart --> RemoveFromCart
    ViewCart --> CompletePayment
    CompletePayment --> SelectPaymentMethod
    SelectPaymentMethod --> ReviewOrder
    ReviewOrder --> EnterShippingInfo
    EnterShippingInfo --> ApplyCoupon
    ApplyCoupon --> CompletePayment
    
    JoinLivestream --> ChatInLivestream
    JoinLivestream --> ViewPinnedProducts
    ViewPinnedProducts --> BuyFromLivestream
    BuyFromLivestream --> CompletePayment
    
    ViewDetails --> SubmitReview
    ViewDetails --> RateProduct
    ViewDetails --> GetRecommendations
    
    ChatWithAI --> GetRecommendations
    ChatWithAI --> EscalateToStaff
    
    ViewOrders --> TrackOrder
    ViewOrders --> ViewOrderDetails
    ViewOrderDetails --> CancelOrder
    ViewOrderDetails --> RequestReturn

    style GuestCustomer fill:#e1f5ff
    style RegisteredCustomer fill:#c8e6c9
    style BrowsingFeatures fill:#fff9c4
    style ChatFeatures fill:#ffe0b2
    style ShoppingFeatures fill:#f8bbd0
    style CheckoutFeatures fill:#d1c4e9
    style OrderFeatures fill:#b2dfdb
    style LivestreamFeatures fill:#ffccbc
    style AccountFeatures fill:#c5cae9
    style NewsletterFeatures fill:#f0f4c3
    style ReviewFeatures fill:#dcedc8
```

**Explanation:**

This Use Case Diagram illustrates all customer-facing features in the Wrencos ecommerce platform, divided into two actor types and multiple feature categories:

**Actor Types:**
1. **Guest Customer** - Unregistered users with limited functionality (browsing, shopping, guest checkout)
2. **Registered Customer** - Logged-in users with full access (order history, saved items, personalized recommendations, account management)

**Feature Categories:**

| Category | Use Cases | Description |
|---|---|---|
| **Browsing & Discovery** | View Catalog, Search, Filter, View Details, View Reviews, Get AI Recommendations | Core product discovery features; AI recommendations available only to registered customers |
| **Communication & Support** | Access FAQ, Chat with AI, Escalate to Staff, View Chat History | Multi-channel customer support; AI chat powered by Google Gemini; staff escalation for complex issues |
| **Shopping & Cart** | Add to Cart, View Cart, Update Quantity, Remove Item, Save for Later | Shopping cart management; "Save for Later" exclusive to registered customers |
| **Checkout & Payment** | Enter Shipping, Select Payment, Review Order, Apply Coupon, Complete Payment | Secure checkout flow; VNPay integration; coupon support for registered customers |
| **Order Management** | View Orders, Track Status, View Details, Cancel, Request Return | Post-purchase order tracking and management; exclusive to registered customers |
| **Livestream & Events** | View Livestreams, Join Stream, Chat, View Pinned Products, Buy from Livestream | Real-time shopping experience; product pinning during streams; direct purchase from livestream |
| **Account Management** | Register, Login, Update Profile, Change Password, Manage Preferences, Logout | User account lifecycle and personalization |
| **Newsletter & Marketing** | Subscribe, Unsubscribe, View Promotions | Email marketing engagement; promotional content access |
| **Reviews & Feedback** | Submit Review, Rate Product, Report Review | Community-driven product feedback and quality control |

**Key Relationships:**
- Dependencies show logical flow (e.g., "Add to Cart" → "View Cart" → "Complete Payment")
- Extensions show conditional features (e.g., "Escalate to Staff" extends "Chat with AI")
- Registered customers inherit all guest capabilities plus exclusive features

**Business Value:**
- **Guest checkout** reduces friction for first-time buyers
- **AI recommendations** increase average order value for registered users
- **Livestream integration** creates urgency and drives impulse purchases
- **Multi-channel support** (FAQ, AI, staff) improves customer satisfaction
- **Order tracking** reduces support inquiries and builds trust

#### 2.2 Use Case Diagram - Admin
#### 3. Activity Diagram – Customer Purchase Flow

```mermaid
flowchart TD
    start(Start)
    start --> customer_browses
    customer_browses(Customer Browses Products)
    customer_browses --> customer_views
    customer_views(Customer Views Product Details)
    customer_views --> interested
    interested{Interested?}
    interested -->|Yes| add_to_cart
    add_to_cart(Add Product to Cart)
    add_to_cart --> continue_shopping
    continue_shopping{Continue Shopping?}
    continue_shopping -->|Yes| back_to_browse
    back_to_browse(Back to Browse)
    continue_shopping -->|No| proceed_checkout
    proceed_checkout(Proceed to Checkout)
    interested -->|No| exit
    exit(Exit)
    exit --> stop(stop)
    
    proceed_checkout --> enter_shipping
    enter_shipping(Enter Shipping Address)
    enter_shipping --> select_payment
    select_payment(Select Payment Method)
    select_payment --> review_order
    review_order(Review Order Summary)
    
    review_order --> confirm_order
    confirm_order{Confirm Order?}
    confirm_order -->|Yes| process_payment
    process_payment(Process Payment via VNPay)
    process_payment --> payment_successful
    payment_successful{Payment Successful?}
    payment_successful -->|Yes| create_order
    create_order(Create Order Record)
    create_order --> send_confirmation
    send_confirmation(Send Confirmation Email)
    send_confirmation --> display_tracking
    display_tracking(Display Order Tracking)
    display_tracking --> customer_receives
    customer_receives(Customer Receives Order)
    customer_receives --> order_completed
    order_completed(Order Completed)
    order_completed --> stop

    payment_successful -->|No| payment_failed
    payment_failed(Payment Failed)
    payment_failed --> display_error
    display_error(Display Error Message)
    display_error --> retry_payment
    retry_payment(Retry Payment)

    confirm_order -->|No| cancel_order
    cancel_order(Cancel Order)
    cancel_order --> cart_saved
    cart_saved(Cart Saved)
    cart_saved --> stop
```

**Explanation:** This Activity Diagram models the complete customer purchase flow from product discovery to order fulfillment. The flow begins with product browsing and detail viewing, followed by conditional logic for cart addition and checkout initiation. The customer then provides shipping and payment information, reviews the order, and confirms. The system processes payment through VNPay; if successful, an order record is created, confirmation email is sent, and order tracking is displayed. If payment fails, the customer can retry. The diagram captures decision points (Interested?, Continue Shopping?, Confirm Order?, Payment Successful?) and alternative paths (cancellation, payment retry), representing the complete customer journey.

#### 4. Sequence Diagram – AI Chat with Product Recommendation

```mermaid
sequenceDiagram
    participant Customer
    participant WebApp as Web/Mobile App
    participant APIGateway as REST API Gateway
    participant ChatService as Communication Service
    participant GeminiAPI as Google Gemini API
    participant ProductDB as Product Database
    participant MongoDB as MongoDB

    Customer->>WebApp: Send Chat Message
    WebApp->>APIGateway: POST /chat/ai (with JWT token)
    APIGateway->>APIGateway: Verify JWT Token
    APIGateway->>ChatService: Route to Chat Handler
    
    ChatService->>MongoDB: Query FAQ Database
    MongoDB-->>ChatService: Return Matching FAQs
    
    ChatService->>ProductDB: Search Products by Keywords
    ProductDB-->>ChatService: Return Matching Products
    
    ChatService->>GeminiAPI: Send Message + Context + Products
    GeminiAPI->>GeminiAPI: Process with AI Model
    GeminiAPI-->>ChatService: Return AI Response + Recommendations
    
    ChatService->>MongoDB: Save ChatConversation
    MongoDB-->>ChatService: Conversation Saved
    
    ChatService-->>APIGateway: Return Response
    APIGateway-->>WebApp: JSON Response
    WebApp->>Customer: Display AI Response + Product Recommendations
```

**Explanation:** This Sequence Diagram illustrates the AI-powered chat interaction flow. When a customer sends a message, the Web/Mobile app transmits it to the REST API Gateway with JWT authentication. The gateway verifies the token and routes the request to the Communication Service. The service simultaneously queries the FAQ database and searches the product catalog for relevant context. This context, along with the customer message and conversation history, is sent to Google Gemini API, which generates an intelligent response with product recommendations. The entire conversation is persisted to MongoDB for audit trails and future reference. The response flows back through the API Gateway to the frontend, where AI-generated recommendations and answers are displayed to the customer.

#### 5. Sequence Diagram – Livestream with Product Pinning and Purchase

```mermaid
sequenceDiagram
    participant Admin
    participant WebApp as Admin Dashboard
    participant APIGateway as REST API Gateway
    participant LivestreamService as Livestream Service
    participant WebSocketServer as WebSocket Server
    participant Customer
    participant CustomerApp as Customer App
    participant EcommerceService as E-Commerce Service
    participant MongoDB as MongoDB

    Admin->>WebApp: Create Livestream
    WebApp->>APIGateway: POST /livestreams
    APIGateway->>LivestreamService: Create Stream Record
    LivestreamService->>MongoDB: Save Livestream Document
    MongoDB-->>LivestreamService: Stream Created
    
    Admin->>WebApp: Start Broadcasting
    WebApp->>WebSocketServer: Connect to Stream
    WebSocketServer->>MongoDB: Update isActive = true
    
    Customer->>CustomerApp: Join Livestream
    CustomerApp->>WebSocketServer: Connect to Stream
    WebSocketServer-->>CustomerApp: Stream Video Feed
    
    Admin->>WebApp: Pin Product to Stream
    WebApp->>APIGateway: POST /livestreams/:id/pin-product
    APIGateway->>LivestreamService: Add Product to pinnedProducts[]
    LivestreamService->>MongoDB: Update Livestream
    
    WebSocketServer->>CustomerApp: Broadcast Pinned Product
    CustomerApp->>Customer: Display Pinned Product
    
    Customer->>CustomerApp: Click "Add to Cart"
    CustomerApp->>APIGateway: POST /cart/items
    APIGateway->>EcommerceService: Add to Cart
    EcommerceService->>MongoDB: Update Cart
    
    Customer->>CustomerApp: Proceed to Checkout
    CustomerApp->>APIGateway: POST /cart/checkout
    APIGateway->>EcommerceService: Process Order
    EcommerceService->>MongoDB: Create Order Record
    
    Admin->>WebApp: View Stream Analytics
    WebApp->>APIGateway: GET /livestreams/:id/analytics
    APIGateway->>LivestreamService: Aggregate Analytics
    LivestreamService-->>WebApp: Return Metrics
```

**Explanation:** This Sequence Diagram demonstrates the complete livestream experience with product pinning and purchase integration. An admin creates a livestream, starts broadcasting via WebSocket connection, and pins products during the stream. Customers join the livestream, receive the video feed and pinned product notifications in real-time via WebSocket. When a customer clicks on a pinned product, it's added to their cart and they can proceed to checkout. The E-Commerce Service processes the order, and the admin can view comprehensive analytics including viewer count, engagement metrics, and conversion data. This diagram shows the seamless integration between livestream broadcasting, real-time notifications, and e-commerce transactions.

#### 6. Sequence Diagram – Email Campaign Creation and Delivery

```mermaid
sequenceDiagram
    participant Admin
    participant AdminDash as Admin Dashboard
    participant APIGateway as REST API Gateway
    participant MarketingService as Marketing Service
    participant EmailService as Email Service
    participant SMTPServer as SMTP Server
    participant MongoDB as MongoDB
    participant Customer
    participant CustomerEmail as Customer Email

    Admin->>AdminDash: Create Email Campaign
    AdminDash->>APIGateway: POST /campaigns
    APIGateway->>MarketingService: Create Campaign
    MarketingService->>MongoDB: Save EmailCampaign
    
    Admin->>AdminDash: Select Email Template
    AdminDash->>APIGateway: GET /templates/:id
    APIGateway->>MarketingService: Fetch Template
    MarketingService->>MongoDB: Query EmailTemplate
    MongoDB-->>MarketingService: Return Template
    
    Admin->>AdminDash: Define Target Segment
    AdminDash->>APIGateway: POST /segments
    APIGateway->>MarketingService: Create Segment
    MarketingService->>MongoDB: Query NewsletterSubscriptions
    MongoDB-->>MarketingService: Return Matching Subscribers
    
    Admin->>AdminDash: Schedule/Send Campaign
    AdminDash->>APIGateway: POST /campaigns/:id/send
    APIGateway->>EmailService: Trigger Send
    
    EmailService->>MongoDB: Get Subscriber List
    MongoDB-->>EmailService: Return Subscribers
    
    loop For Each Subscriber
        EmailService->>SMTPServer: Send Email
        SMTPServer->>CustomerEmail: Deliver Email
        EmailService->>MongoDB: Create EmailAnalytics Record
    end
    
    Customer->>CustomerEmail: Open Email
    EmailService->>MongoDB: Record Open Event
    
    Customer->>CustomerEmail: Click Link
    EmailService->>MongoDB: Record Click Event
    
    Admin->>AdminDash: View Campaign Analytics
    AdminDash->>APIGateway: GET /campaigns/:id/analytics
    APIGateway->>MarketingService: Aggregate Analytics
    MarketingService->>MongoDB: Query EmailAnalytics
    MongoDB-->>MarketingService: Return Metrics
    MarketingService-->>AdminDash: Display Open Rate, Click Rate, Conversions
```

**Explanation:** This Sequence Diagram illustrates the complete email marketing campaign lifecycle. An admin creates a campaign, selects a template, and defines a target audience segment based on subscriber criteria. The Marketing Service queries the database to identify matching subscribers. When the campaign is sent, the Email Service retrieves the subscriber list and uses SMTP to deliver emails to each recipient. The system tracks engagement metrics: opens, clicks, and unsubscribes are recorded in the EmailAnalytics collection. The admin can then view comprehensive campaign performance metrics including open rates, click-through rates, and conversion data. This diagram demonstrates the integration between marketing, email delivery, and analytics services.

#### 7. Component Diagram – Service Architecture

```mermaid
graph TB
    subgraph ClientLayer["Client Layer"]
        WebPortal["Web Portal<br/>(Vue.js 3)"]
        MobileApp["Mobile App<br/>(React Native)"]
        AdminDash["Admin Dashboard<br/>(Vue.js 3)"]
    end

    subgraph APILayer["API Gateway Layer"]
        APIGateway["REST API Gateway<br/>(Express.js)<br/>- Routing<br/>- Auth Middleware<br/>- CORS<br/>- Rate Limiting"]
    end

    subgraph ServiceLayer["Backend Services Layer"]
        AuthService["Auth Service<br/>- User Registration<br/>- Login/Logout<br/>- JWT Generation<br/>- Password Management"]
        
        EcommerceService["E-Commerce Service<br/>- Product Catalog<br/>- Shopping Cart<br/>- Order Management<br/>- Inventory"]
        
        LivestreamService["Livestream Service<br/>- Stream Management<br/>- Product Pinning<br/>- Viewer Analytics<br/>- Chat Integration"]
        
        CommunicationService["Communication Service<br/>- FAQ Management<br/>- AI Chat (Gemini)<br/>- Staff Escalation<br/>- Conversation History"]
        
        MarketingService["Marketing Service<br/>- Email Campaigns<br/>- Audience Segmentation<br/>- Template Management<br/>- Campaign Analytics"]
        
        AnalyticsService["Analytics Service<br/>- Sales Reports<br/>- Customer Analytics<br/>- Performance Metrics<br/>- Dashboard Data"]
        
        FinanceService["Finance Service<br/>- Expense Tracking<br/>- Cash Flow Analysis<br/>- Financial Reports<br/>- Profit Calculation"]
        
        HRService["HR Service<br/>- Employee Management<br/>- Staff Records<br/>- Performance Reviews<br/>- Payroll"]
    end

    subgraph DataLayer["Data Layer"]
        MongoDB["MongoDB Atlas<br/>- User Collection<br/>- Product Collection<br/>- Order Collection<br/>- Livestream Collection<br/>- Chat Collection<br/>- Campaign Collection<br/>- Employee Collection<br/>- Finance Collection"]
    end

    subgraph ExternalServices["External Services"]
        GeminiAPI["Google Gemini API<br/>(AI Engine)"]
        VNPayAPI["VNPay API<br/>(Payment Gateway)"]
        SMTPServer["SMTP Server<br/>(Email Delivery)"]
        WebSocketServer["WebSocket Server<br/>(Real-time Communication)"]
    end

    WebPortal -->|HTTP/REST| APIGateway
    MobileApp -->|HTTP/REST| APIGateway
    AdminDash -->|HTTP/REST| APIGateway
    
    APIGateway -->|Routes| AuthService
    APIGateway -->|Routes| EcommerceService
    APIGateway -->|Routes| LivestreamService
    APIGateway -->|Routes| CommunicationService
    APIGateway -->|Routes| MarketingService
    APIGateway -->|Routes| AnalyticsService
    APIGateway -->|Routes| FinanceService
    APIGateway -->|Routes| HRService
    
    AuthService -->|CRUD| MongoDB
    EcommerceService -->|CRUD| MongoDB
    LivestreamService -->|CRUD| MongoDB
    CommunicationService -->|CRUD| MongoDB
    MarketingService -->|CRUD| MongoDB
    AnalyticsService -->|Read| MongoDB
    FinanceService -->|CRUD| MongoDB
    HRService -->|CRUD| MongoDB
    
    CommunicationService -->|API Call| GeminiAPI
    EcommerceService -->|API Call| VNPayAPI
    MarketingService -->|API Call| SMTPServer
    LivestreamService -->|WebSocket| WebSocketServer
    CommunicationService -->|WebSocket| WebSocketServer
```

**Explanation:** This Component Diagram illustrates the layered architecture of the Wrencos platform. The Client Layer contains three frontend applications (Web Portal, Mobile App, Admin Dashboard) that communicate exclusively through the REST API Gateway. The API Gateway layer handles cross-cutting concerns including routing, authentication middleware, CORS, and rate limiting. The Backend Services Layer contains eight independent services, each responsible for a specific business domain. All services interact with MongoDB Atlas as the single source of truth for data persistence. External services (Google Gemini, VNPay, SMTP, WebSocket) are integrated at the service level for specialized functionality. This architecture ensures separation of concerns, scalability, and maintainability.

#### 8. State Diagram – Order Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Pending: Customer Creates Order
    
    Pending --> Processing: Payment Verified
    Pending --> Cancelled: Payment Failed
    Pending --> Cancelled: Customer Cancels
    
    Processing --> Packed: Order Confirmed
    Processing --> Cancelled: System Error
    
    Packed --> Shipped: Warehouse Ships
    Packed --> Cancelled: Out of Stock
    
    Shipped --> InTransit: Carrier Picks Up
    
    InTransit --> Delivered: Package Arrives
    InTransit --> Delayed: Delivery Issue
    
    Delayed --> Delivered: Issue Resolved
    Delayed --> Returned: Customer Requests Return
    
    Delivered --> Completed: Delivery Confirmed
    Delivered --> Returned: Customer Initiates Return
    
    Returned --> ReturnProcessing: Return Approved
    
    ReturnProcessing --> Refunded: Refund Processed
    
    Refunded --> [*]
    Cancelled --> [*]
    Completed --> [*]
```

**Explanation:** This State Diagram models the complete lifecycle of an order from creation to completion or cancellation. An order begins in the Pending state after customer creation. Upon successful payment verification, it transitions to Processing. From Processing, it moves to Packed once confirmed. The Packed state transitions to Shipped when the warehouse processes it. During transit, the order can be Delayed due to logistics issues, which can be resolved or result in a return. Once Delivered, the order reaches Completed state or transitions to Returned if the customer initiates a return. Returns follow a separate flow through ReturnProcessing to Refunded. Cancelled orders can occur at multiple points (payment failure, customer cancellation, system errors, stock issues) and terminate the flow. This diagram captures all possible order states and transitions, enabling robust order management and customer communication.

#### 9. Deployment Diagram – Infrastructure Architecture

```mermaid
graph TB
    subgraph Cloud["Cloud Infrastructure (AWS/GCP)"]
        subgraph Frontend["Frontend Hosting"]
            WebServer["Web Server<br/>(Vue.js SPA)<br/>Nginx/Vercel"]
            MobileServer["Mobile App<br/>(React Native)<br/>Expo/App Store"]
        end
        
        subgraph Backend["Backend Hosting"]
            APIServer["API Server<br/>(Node.js/Express)<br/>Docker Container"]
            WebSocketServer["WebSocket Server<br/>(Node.js ws)<br/>Docker Container"]
        end
        
        subgraph Database["Database Tier"]
            MongoDB["MongoDB Atlas<br/>Managed Database<br/>Replication & Backup"]
            VectorDB["Vector Database<br/>(Qdrant)<br/>RAG Storage"]
        end
        
        subgraph Storage["Storage Services"]
            S3["Object Storage<br/>(AWS S3/GCP Storage)<br/>Product Images<br/>User Avatars<br/>Livestream Videos"]
            CDN["Content Delivery<br/>Network (CloudFront)<br/>Image Optimization<br/>Video Streaming"]
        end
    end
    
    subgraph External["External Services"]
        GeminiAPI["Google Gemini API"]
        VNPayAPI["VNPay Payment API"]
        SMTPServer["Email SMTP Server"]
        AgoraSDK["Agora SDK<br/>(Livestream)"]
    end
    
    subgraph Monitoring["Monitoring & Logging"]
        CloudWatch["CloudWatch<br/>Performance Metrics"]
        LogService["Log Aggregation<br/>Error Tracking"]
    end
    
    WebServer -->|HTTPS| APIServer
    MobileServer -->|HTTPS| APIServer
    
    APIServer -->|Query/Update| MongoDB
    WebSocketServer -->|Query/Update| MongoDB
    
    APIServer -->|Store/Retrieve| S3
    S3 -->|Distribute| CDN
    
    APIServer -->|API Call| GeminiAPI
    APIServer -->|API Call| VNPayAPI
    APIServer -->|SMTP| SMTPServer
    WebSocketServer -->|API Call| AgoraSDK
    
    APIServer -->|Metrics| CloudWatch
    APIServer -->|Logs| LogService
    WebSocketServer -->|Metrics| CloudWatch
    WebSocketServer -->|Logs| LogService
```

**Explanation:** This Deployment Diagram illustrates the cloud infrastructure architecture for the Wrencos platform. Frontend applications (Web and Mobile) are hosted on cloud platforms with CDN distribution. The backend consists of containerized Node.js services (API Server and WebSocket Server) running on cloud infrastructure. MongoDB Atlas provides managed database services with replication and automated backups. Object storage (S3) and CDN services handle media distribution for product images, user avatars, and livestream videos. External services (Google Gemini, VNPay, SMTP, Agora) are integrated via APIs. Monitoring and logging services track performance metrics and errors. This architecture ensures scalability, reliability, and high availability for the platform.

#### 10. Data Flow Diagram – Customer Purchase to Analytics

```mermaid
graph LR
    Customer["Customer"]
    WebApp["Web/Mobile App"]
    APIGateway["API Gateway"]
    
    subgraph Services["Backend Services"]
        EcommService["E-Commerce<br/>Service"]
        PaymentService["Payment<br/>Service"]
        AnalyticsService["Analytics<br/>Service"]
        EmailService["Email<br/>Service"]
    end
    
    subgraph Data["Data Storage"]
        OrderDB["Order<br/>Collection"]
        AnalyticsDB["Analytics<br/>Collection"]
        EmailDB["Email<br/>Collection"]
    end
    
    Dashboard["Admin<br/>Dashboard"]
    
    Customer -->|Browse & Add to Cart| WebApp
    WebApp -->|POST /cart/checkout| APIGateway
    APIGateway -->|Route| EcommService
    
    EcommService -->|Process Payment| PaymentService
    PaymentService -->|Verify| VNPay["VNPay<br/>Gateway"]
    VNPay -->|Payment Status| PaymentService
    
    PaymentService -->|Create Order| EcommService
    EcommService -->|Save Order| OrderDB
    
    EcommService -->|Send Confirmation| EmailService
    EmailService -->|Save Email Log| EmailDB
    EmailService -->|Send via SMTP| SMTP["SMTP<br/>Server"]
    
    OrderDB -->|Aggregate Data| AnalyticsService
    AnalyticsService -->|Store Metrics| AnalyticsDB
    
    AnalyticsDB -->|Query| Dashboard
    Dashboard -->|Display| Admin["Admin User"]
```

**Explanation:** This Data Flow Diagram traces the complete flow of data from a customer purchase through to analytics reporting. A customer browses products and initiates checkout via the Web/Mobile app. The API Gateway routes the request to the E-Commerce Service, which processes payment through the Payment Service and VNPay gateway. Upon successful payment, an order is created and stored in the Order Collection. The E-Commerce Service triggers the Email Service to send a confirmation email, which is logged in the Email Collection. The Analytics Service aggregates order data and stores metrics in the Analytics Collection. Admins query the Analytics Collection through the Admin Dashboard to view business intelligence and performance metrics. This diagram illustrates the complete data pipeline from transaction to insight.


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
