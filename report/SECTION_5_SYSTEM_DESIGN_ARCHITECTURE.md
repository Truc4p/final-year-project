# 5. System Design and Architecture

## 5.1 Rich Picture

### Rich Picture Narrative

## 5.2 System Architecture

### High-Level Architecture Overview


### C4 Model Diagrams

#### System Context Diagram (Level 1)

```mermaid
C4Context
    title System Context Diagram for WrenCOS - Skincare E-Commerce Platform

    Person(customer, "Customer", "End users purchasing skincare products, joining livestreams, and consulting AI dermatologist")
    Person(admin, "Administrator", "Staff managing products, orders, livestreams, marketing campaigns, and analytics")

    System(wrencos, "WrenCOS Platform", "Comprehensive skincare e-commerce platform with AI dermatology consultation, live shopping, and multi-channel customer support")

    System_Ext(gemini, "Google Gemini AI", "Provides AI-powered dermatology consultation, product recommendations, and conversational AI")
    System_Ext(vnpay, "VNPay Payment Gateway", "Processes online payments for customer orders")
    System_Ext(smtp, "SMTP Email Server", "Sends transactional emails, marketing campaigns, and newsletters")
    System_Ext(qdrant, "Qdrant Vector DB", "Stores and retrieves dermatology knowledge embeddings for RAG-based AI consultation")

    Rel(customer, wrencos, "Browses products, makes purchases, joins livestreams, consults AI dermatologist", "HTTPS/WSS")
    Rel(admin, wrencos, "Manages inventory, processes orders, creates campaigns, monitors analytics", "HTTPS/WSS")
    
    Rel(wrencos, gemini, "Sends queries for AI consultation and product recommendations", "REST API/HTTPS")
    Rel(wrencos, vnpay, "Processes payment transactions", "REST API/HTTPS")
    Rel(wrencos, smtp, "Sends emails", "SMTP")
    Rel(wrencos, qdrant, "Queries dermatology knowledge base", "REST API/HTTPS")

    UpdateRelStyle(customer, wrencos, $offsetY="-40")
    UpdateRelStyle(admin, wrencos, $offsetY="-40")
    UpdateRelStyle(wrencos, gemini, $offsetX="-50", $offsetY="20")
    UpdateRelStyle(wrencos, vnpay, $offsetY="-30")
    UpdateRelStyle(wrencos, smtp, $offsetX="50", $offsetY="20")
```

#### Container Diagram (Level 2)

```mermaid
C4Container
    title Container Diagram for WrenCOS Platform

    Person(customer, "Customer", "Purchases products, joins livestreams, consults AI dermatologist")
    Person(admin, "Administrator", "Manages platform operations")

    System_Ext(gemini, "Google Gemini AI", "AI consultation & recommendations")
    System_Ext(vnpay, "VNPay Gateway", "Payment processing")
    System_Ext(smtp, "SMTP Server", "Email delivery")
    System_Ext(qdrant, "Qdrant Vector DB", "Knowledge base embeddings")

    Container_Boundary(wrencos, "WrenCOS Platform") {
        Container(web, "Web Application", "Vue.js 3, Vite, Tailwind CSS", "Provides skincare e-commerce interface via web browser")
        Container(mobile_customer, "Customer Mobile App", "React Native, Expo", "Provides mobile shopping experience with livestream support")
        Container(mobile_admin, "Admin Mobile App", "React Native, Expo", "Provides mobile admin interface for operations management")
        
        Container_Boundary(backend_process, "Backend Node.js Process (Port 3000)") {
            Container(api, "REST API Layer", "Express.js routes & controllers", "Handles HTTP requests, authentication, business logic")
            Container(websocket, "WebSocket Manager", "ws library", "Manages real-time bidirectional communication")
            Container(services, "Service Layer", "Internal modules: GeminiService, VectorService, EmailService, TTSService", "Encapsulates business logic and external integrations")
        }
        
        ContainerDb(mongodb, "MongoDB Atlas", "MongoDB", "Stores users, products, orders, chats, livestreams, campaigns, analytics")
    }

    Rel(customer, web, "Browses and purchases", "HTTPS")
    Rel(customer, mobile_customer, "Shops and watches livestreams", "HTTPS")
    Rel(admin, web, "Manages platform", "HTTPS")
    Rel(admin, mobile_admin, "Manages operations", "HTTPS")

    Rel(web, api, "Makes API calls", "JSON/HTTPS")
    Rel(web, websocket, "Connects for real-time updates", "WebSocket/WSS")
    Rel(mobile_customer, api, "Makes API calls", "JSON/HTTPS")
    Rel(mobile_customer, websocket, "Connects for livestream & chat", "WebSocket/WSS")
    Rel(mobile_admin, api, "Makes API calls", "JSON/HTTPS")
    Rel(mobile_admin, websocket, "Connects for broadcasting & monitoring", "WebSocket/WSS")

    Rel(api, services, "Calls service methods", "In-process function calls")
    Rel(websocket, services, "Uses service methods", "In-process function calls")
    Rel(services, mongodb, "Reads/writes data", "MongoDB Protocol")
    
    Rel(services, gemini, "AI queries & embeddings", "REST/HTTPS")
    BiRel(services, qdrant, "Reads: semantic search<br/>Writes: index knowledge", "REST/HTTPS")
    Rel(services, vnpay, "Process payments", "REST/HTTPS")
    Rel(services, smtp, "Send emails", "SMTP")

    UpdateRelStyle(customer, web, $offsetY="-50")
    UpdateRelStyle(customer, mobile_customer, $offsetY="-50")
    UpdateRelStyle(admin, web, $offsetY="-50")
    UpdateRelStyle(admin, mobile_admin, $offsetY="-50")
    UpdateRelStyle(web, api, $offsetX="20")
    UpdateRelStyle(mobile_customer, api, $offsetX="-20")
    UpdateRelStyle(api, mongodb, $offsetY="-30")
    UpdateRelStyle(websocket, mongodb, $offsetY="-30")
```


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

### Entity Relationship Diagram (ERD) - Complete System

```mermaid
erDiagram
    %% AUTH & CORE
    User ||--o{ Order : "customer"
    User ||--o{ LiveStream : "createdBy"
    User ||--o{ EmailCampaign : "createdBy"
    User ||--o{ EmailTemplate : "createdBy"
    User ||--o{ EmailSegment : "createdBy"
    User ||--o{ ChatConversation : "userId (optional)"
    User ||--o{ ChatConversation : "assignedStaff (staff)"
    User ||--o{ NewsletterSubscription : "userId (optional)"
    User ||--o{ CashFlowTransaction : "createdBy"
    User ||--o{ BusinessExpense : "createdBy"
    User ||--o{ Employee : "1:1 userId"

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

    %% E-COMMERCE
    Category ||--o{ Product : "has"
    Product ||--o{ OrderItem : "in"
    Product ||--o{ PinnedProduct : "pinned"
    Product ||--o{ Message : "retrieved in"
    Order ||--o{ OrderItem : "contains"
    Order ||--o{ CashFlowTransaction : "generates"

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

    %% LIVESTREAM
    LiveStream ||--o{ ChatMessage : "has"
    LiveStream ||--o{ PinnedProduct : "displays"

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

    %% COMMUNICATION
    ChatConversation ||--o{ Message : "contains"
    Message }o--o| FAQ : "references"

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

    %% MARKETING
    EmailTemplate ||--o{ EmailCampaign : "used in"
    EmailCampaign ||--o{ EmailAnalytics : "tracks"
    NewsletterSubscription ||--o{ EmailAnalytics : "receives"

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

    %% HR
    Employee ||--o{ Employee : "manages"
    Employee ||--o{ PerformanceReview : "has"
    Employee ||--o{ Document : "owns"

    Employee {
        ObjectId _id PK
        String employeeId UK
        String firstName
        String lastName
        String email UK
        String phone
        Object address
        String department
        String position
        String employmentType
        String status
        Object salary
        Date startDate
        Date endDate
        ObjectId manager FK
        Array skills
        Object emergencyContact
        Object leaveBalance
        Object benefits
        String notes
        String profilePhoto
        Date createdAt
        Date updatedAt
    }

    PerformanceReview {
        ObjectId _id PK
        Date reviewDate
        Number rating
        String comments
        ObjectId reviewedBy FK
    }

    Document {
        ObjectId _id PK
        String name
        String type
        Date uploadDate
        String filePath
    }

    %% FINANCE
    BusinessExpense {
        ObjectId _id PK
        String category
        Number amount
        String description
        Boolean isRecurring
        String frequency
        Date date
        String vendor
        String invoiceNumber
        String paymentMethod
        String status
        Date dueDate
        Date nextOccurrence
        ObjectId createdBy FK
        String notes
        Date createdAt
        Date updatedAt
    }

    CashFlowTransaction {
        ObjectId _id PK
        String type
        String category
        Number amount
        String description
        ObjectId orderId FK
        Date date
        Boolean automated
        ObjectId createdBy FK
        Date createdAt
        Date updatedAt
    }

    %% SKIN STUDY
    DermatologyKnowledge {
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

#### 2.2 Use Case Diagram - Admin

#### 3. Activity Diagrams
#### 3.1 Activity Diagram – Customer Purchase Flow

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

#### 3.2 Activity Diagram – AI Dermatology Expert Consultation

```mermaid
flowchart TD
    start([Customer Starts])
    start --> access_expert
    access_expert[Customer Accesses AI Dermatology Expert]
    access_expert --> input_type
    
    input_type{Choose Input Type}
    input_type -->|Text Query| text_input
    input_type -->|Voice Input| voice_input
    input_type -->|Skin Image| image_input
    
    %% Voice Input Flow
    voice_input[Record Voice Message]
    voice_input --> transcribe
    transcribe[Transcribe Audio using Gemini]
    transcribe --> text_input
    
    %% Text Input Flow
    text_input[Enter Text Query]
    text_input --> detect_language
    detect_language[Detect Language & Translate to English]
    detect_language --> rag_search
    
    %% Image Input Flow
    image_input[Upload Skin Image]
    image_input --> optional_message
    optional_message[Optional: Add Description]
    optional_message --> image_rag
    image_rag[RAG: Search Dermatology Knowledge]
    image_rag --> analyze_image
    analyze_image[Analyze Image using Gemini Vision + RAG Context]
    analyze_image --> generate_image_response
    
    %% RAG Flow for Text
    rag_search[RAG: Query Vector Database]
    rag_search --> retrieve_context
    retrieve_context[Retrieve Relevant Dermatology Knowledge]
    retrieve_context --> load_history
    load_history[Load Conversation History]
    load_history --> generate_response
    
    %% AI Response Generation
    generate_response[Generate AI Response using Gemini + RAG Context]
    generate_response --> save_conversation
    
    generate_image_response[Generate Image Analysis Response]
    generate_image_response --> save_conversation
    
    save_conversation[Save Conversation to Database]
    save_conversation --> display_response
    
    display_response[Display AI Response + Sources]
    display_response --> tts_option
    
    tts_option{Enable Text-to-Speech?}
    tts_option -->|Yes| convert_tts
    tts_option -->|No| show_sources
    
    convert_tts[Convert Response to Speech using Google Cloud TTS]
    convert_tts --> play_audio
    play_audio[Play Audio Response]
    play_audio --> show_sources
    
    show_sources[Show Referenced Knowledge Sources]
    show_sources --> view_products
    view_products[Display Related Products if any]
    view_products --> continue_chat
    
    continue_chat{Continue Conversation?}
    continue_chat -->|Yes| input_type
    continue_chat -->|No| end_session
    
    end_session[End Consultation Session]
    end_session --> stop([End])
    
    style start fill:#e1f5ff
    style stop fill:#e1f5ff
    style voice_input fill:#ffe0b2
    style transcribe fill:#ffe0b2
    style image_input fill:#ffccbc
    style analyze_image fill:#ffccbc
    style text_input fill:#fff9c4
    style rag_search fill:#c8e6c9
    style retrieve_context fill:#c8e6c9
    style image_rag fill:#c8e6c9
    style generate_response fill:#d1c4e9
    style generate_image_response fill:#d1c4e9
    style convert_tts fill:#f8bbd0
    style play_audio fill:#f8bbd0
    style save_conversation fill:#b2dfdb
    style display_response fill:#dcedc8
```

**Explanation:** This Activity Diagram illustrates the complete AI Dermatology Expert consultation workflow. Customers can choose between three input methods: text queries, voice input (transcribed via Gemini), or skin image uploads. For text queries, the system detects and translates the language if needed, then performs RAG (Retrieval-Augmented Generation) by querying the vector database containing dermatology knowledge. The retrieved context, along with conversation history, is passed to Google Gemini API to generate an expert response. For image analysis, customers upload a skin image with an optional description, and the system retrieves relevant dermatology knowledge before using Gemini Vision to analyze the image. After generating the response, the system saves the conversation to MongoDB and displays the AI response along with referenced knowledge sources. Customers can optionally enable text-to-speech to hear the response via Google Cloud TTS. Related skincare products are also displayed based on the consultation. The customer can continue the conversation with follow-up questions or end the session. This diagram demonstrates the integration of multiple AI services (Gemini for text generation and vision analysis, Google Cloud TTS for speech synthesis) with RAG-based knowledge retrieval to provide accurate, context-aware dermatology consultations.

#### 4. Sequence Diagrams
#### 4.1 Sequence Diagram – AI Chat with Product Recommendation

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

#### 4.2 Sequence Diagram – Livestream with Product Pinning and Purchase

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

#### 4.3 Sequence Diagram – Email Campaign Creation and Delivery

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

#### 5. Data Flow Diagram – Customer Purchase to Analytics

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
| 1 | `/auth/register` | POST | Register user (admin/customer) | username, password, role, adminKey (when role=admin) | {token} |
| 2 | `/auth/login` | POST | Login with credentials | username, password | {token, role, userId} |
| 3 | `/products` | GET | List all products | - | [{...Product}] |
| 4 | `/products` | POST | Create product (admin only) | multipart/form-data: image, name, categoryId, price, description, stockQuantity, ingredients[], skinType[], benefits[], tags[], usage, skinConcerns[] | {...Product} |
| 5 | `/orders` | POST | Create order (checkout) | products[{productId, quantity, price?}], paymentMethod, totalPrice | {...Order} |
| 6 | `/orders` | GET | Get orders (admin: all, customer: own) | from JWT | [{...Order}] |
| 7 | `/chat/ai` | POST | Send message to AI chatbot | message, sessionId? | {success, data: {message, sessionId, intent, confidence, relatedProducts[], relatedFAQs[]}} |
| 8 | `/chat/conversation/:sessionId` | GET | Get conversation history | limit? | {success, data: {messages[], conversationState}} |
| 9 | `/livestreams` | POST | Create live stream (admin only) | title, description, startTime? | {...LiveStream} |
| 10 | `/analytics/sales` | GET | Sales analytics (admin only) | period? (days) | {period, salesData: [{date, revenue, orders}], totalRevenue, totalOrders, averageDailyRevenue} |
| 11 | `/analytics/products` | GET | Product analytics (admin only) | - | {topProducts: [{productId, name, totalSold, totalRevenue}], categoryDistribution: [{categoryId, name, count}], lowStockProducts: [{name, stockQuantity, price}]} |
| 12 | `/api/ai-dermatology-expert/chat` | POST | AI Dermatology Expert chat | message, conversationHistory[] | {response, sources: [{title, content}], images: [], timestamp} |
| 13 | `/api/ai-dermatology-expert/analyze-skin` | POST | Analyze skin image | image (multipart), message?, conversationHistory[]? | {response, sources: [{title, content}], timestamp} |
| 14 | `/api/ai-dermatology-expert/transcribe` | POST | Transcribe audio to text | audio (multipart) | {transcription, timestamp, processingTime} |
| 15 | `/api/ai-dermatology-expert/text-to-speech` | POST | Text to speech | text | {audio, format: 'mp3', timestamp, processingTime} |
| 16 | `/email-campaigns/campaigns` | POST | Create email campaign (admin only) | name, subject, templateId, scheduledAt, targetAudience/segmentCriteria | {...Campaign} |
| 17 | `/users` | GET | List users (admin only) | page?, limit?, role? | [{userId, username, role, createdAt}] |
| 18 | `/cashflow/dashboard` | GET | Cash flow dashboard (admin only) | period? (days) | {currentBalance, netCashFlow, totalInflows, totalOutflows, runway, ...} |
| 19 | `/livestreams/active` | GET | Get the currently active livestream | - | { message, livestream|null } |
| 20 | `/livestreams/past` | GET | Get paginated list of past livestreams | page, limit | { livestreams: [], pagination: { currentPage, totalPages, total } } |
| 21 | `/livestreams/agora/token` | POST | Generate Agora RTC token for streaming/viewing | channelName, uid?, role? | { token, appId, channelName, uid, expiresAt } |
| 22 | `/livestreams` | POST | Create a new livestream (admin only) | title, description, quality, categories, tags, streamUrl? | { message, livestream } |
| 23 | `/livestreams/:id` | DELETE | Delete livestream and associated files (admin only) | id (path) | { message, deletedFiles: [] } |
| 24 | `/livestreams/:id/pinned-products/order` | PUT | Update pinned product display order (admin only) | id (path), productOrders: [{ productId, displayOrder }] | { message, pinnedProducts: [] } |

### Sample Request/Response

**Example 1: **

**Example 2: **

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
