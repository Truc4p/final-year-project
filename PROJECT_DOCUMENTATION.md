# Final Project - WrenCos Beauty E-commerce Platform

## Overview

**WrenCos** is a comprehensive full-stack beauty and skincare e-commerce platform built with **Vue.js 3** frontend and **Node.js/Express** backend. The application combines traditional e-commerce functionality with innovative features including **AI-powered product recommendations**, **WebRTC live streaming commerce**, **real-time customer support**, and **automated email marketing**. 

This platform is specifically designed for the beauty and skincare industry, featuring specialized product attributes such as skin types, ingredients, skin concerns, and benefits to enable intelligent product matching and recommendations.

### Key Innovations
- **Live Commerce**: Integration of WebRTC live streaming with pinned products for interactive shopping experiences
- **AI Shopping Assistant**: Google Gemini-powered chatbot for personalized product recommendations
- **Beauty-Specific Search**: Advanced product search with skin type, concerns, and ingredient filters
- **Multi-language Support**: Full internationalization (English/Vietnamese) for diverse customer base
- **Real-time Analytics**: Live tracking of sales, customers, and live stream engagement

## Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 4.19.2
- **Database**: MongoDB Atlas (Mongoose ODM 8.5.2)
- **Authentication**: JWT (jsonwebtoken 9.0.2) + bcryptjs 2.4.3
- **Real-time Communication**: WebSocket (ws 8.18.3)
- **AI Integration**: Google Generative AI (@google/generative-ai 0.24.1)
- **Email Service**: Nodemailer 7.0.9
- **API Documentation**: Swagger (swagger-jsdoc 6.2.8, swagger-ui-express 5.0.1)
- **File Upload**: Multer 1.4.5-lts.1
- **Rate Limiting**: express-rate-limit 7.4.0
- **Scheduled Tasks**: node-cron 4.2.1
- **QR Code Generation**: qrcode 1.5.4

### Frontend
- **Framework**: Vue.js 3.5.12
- **Build Tool**: Vite 5.4.10
- **Router**: Vue Router 4.4.5
- **Styling**: TailwindCSS 3.4.14
- **Charts**: Chart.js 4.5.0 + vue-chartjs 5.3.2
- **HTTP Client**: Axios 1.7.7
- **Internationalization**: vue-i18n 11.0.0-beta.1
- **JWT Handling**: jwt-decode 4.0.0
- **Utilities**: lodash-es 4.17.21

## Project Structure

```
final-project/
├── backend/                    # Node.js/Express API Server
│   ├── app.js                 # Express application configuration
│   ├── server.js              # Server entry point with WebSocket setup
│   ├── db.js                  # MongoDB connection setup
│   ├── websocket.js           # WebSocket manager for real-time features
│   ├── swagger.js             # Swagger/OpenAPI documentation config
│   ├── Dockerfile             # Backend Docker container config
│   │
│   ├── controllers/           # Business logic controllers
│   │   ├── analytics/        # Analytics and reporting
│   │   ├── auth/             # Authentication & user management
│   │   ├── communication/    # Chat and messaging
│   │   ├── ecommerce/        # Products, orders, payments
│   │   ├── finance/          # Cash flow and expenses
│   │   ├── hr/               # Human resources management
│   │   ├── livestream/       # Live streaming functionality
│   │   └── marketing/        # Email campaigns and newsletters
│   │
│   ├── models/               # MongoDB/Mongoose schemas
│   │   ├── auth/            # User model
│   │   ├── communication/   # Chat conversation model
│   │   ├── ecommerce/       # Product, Category, Order models
│   │   ├── finance/         # CashFlow, BusinessExpense models
│   │   ├── hr/              # Employee model
│   │   ├── livestream/      # LiveStream model
│   │   └── marketing/       # Email templates, campaigns, analytics
│   │
│   ├── routes/              # API route definitions
│   │   ├── analytics/
│   │   ├── auth/
│   │   ├── communication/
│   │   ├── core/            # Upload routes
│   │   ├── ecommerce/       # Product, category, order, payment routes
│   │   ├── finance/
│   │   ├── hr/
│   │   ├── livestream/
│   │   └── marketing/
│   │
│   ├── middleware/          # Express middleware
│   │   ├── auth.js         # JWT authentication
│   │   ├── optionalAuth.js # Optional authentication
│   │   └── role.js         # Role-based access control
│   │
│   ├── services/           # External service integrations
│   │   └── emailService.js # Email sending functionality
│   │
│   ├── seed-data/          # Database seeding scripts
│   └── uploads/            # File upload storage directory
│
└── frontend/               # Vue.js 3 SPA
    ├── Dockerfile         # Frontend Docker container config
    ├── index.html         # HTML entry point
    ├── vite.config.js     # Vite build configuration
    ├── tailwind.config.js # TailwindCSS configuration
    ├── postcss.config.js  # PostCSS configuration
    │
    └── src/
        ├── App.vue        # Root Vue component
        ├── main.js        # Application entry point
        ├── i18n.js        # Internationalization setup
        │
        ├── components/    # Reusable Vue components
        │   ├── ChatWidget.vue        # Customer chat widget
        │   └── AdminChatWidget.vue   # Admin chat interface
        │
        ├── layout/        # Layout components
        │   ├── PublicLayout.vue      # Public pages layout
        │   ├── AdminLayout.vue       # Admin dashboard layout
        │   └── CustomerLayout.vue    # Customer portal layout
        │
        ├── pages/         # Page components
        │   ├── public/    # Public pages (login, register, etc.)
        │   ├── admin/     # Admin dashboard pages
        │   │   ├── categories/       # Category management
        │   │   ├── products/         # Product management
        │   │   ├── orders/           # Order management
        │   │   ├── users/            # User management
        │   │   ├── analytics/        # Analytics dashboard
        │   │   ├── finance/          # Financial management
        │   │   ├── live-stream/      # Live streaming admin
        │   │   └── email-marketing/  # Email marketing tools
        │   └── customer/  # Customer portal pages
        │       ├── products/         # Product browsing
        │       ├── shopping/         # Cart & checkout
        │       ├── orders/           # Order history
        │       ├── account/          # Profile management
        │       └── live-stream/      # Live stream viewing
        │
        ├── router/        # Vue Router configuration
        │   └── index.js   # Route definitions & guards
        │
        ├── stores/        # State management
        ├── utils/         # Utility functions
        └── assets/        # Static assets (images, styles)
```

## Core Features

### 1. **Authentication & Authorization**
- JWT-based authentication
- Role-based access control (Admin, Customer, Staff)
- Protected routes with route guards
- Token refresh mechanism
- Secure password hashing with bcryptjs

### 2. **E-commerce Functionality**
- **Product Management**: CRUD operations with image uploads
- **Category Management**: Product categorization system
- **Shopping Cart**: Add, update, remove items
- **Checkout Process**: Order placement and confirmation
- **Order Management**: Track order status and history
- **Payment Integration**: Payment processing routes

### 3. **Real-time Communication**
- **WebSocket Manager**: Bidirectional real-time communication
- **Customer Chat**: AI-powered chat assistance using Google Gemini
- **Admin Chat Widget**: Real-time customer support interface
- **Session-based messaging**: Track conversations by session ID
- **Online/Offline status**: Connection state management

### 4. **Live Streaming**
- **WebRTC Integration**: Real-time video streaming
- **Admin Broadcasting**: Start/stop live streams
- **Customer Viewing**: Watch live streams with real-time updates
- **Interactive Features**:
  - Live chat during streams
  - Like/unlike functionality
  - Viewer count tracking
  - Pinned products during streams
- **Stream Management**: Title, description, quality settings

### 5. **Email Marketing System**
- **Newsletter Subscriptions**: Subscriber management with unsubscribe tokens
- **Email Templates**: Reusable email templates with variable placeholders
- **Email Campaigns**: Create and send bulk email campaigns
- **Email Segments**: Target specific user groups
- **Analytics**: Track email open rates, click rates, and engagement

### 6. **Analytics & Reporting**
- **Sales Analytics**: Revenue tracking and visualization
- **User Analytics**: Customer behavior insights
- **Order Analytics**: Order status and trends
- **Chart Visualizations**: Chart.js integration for data display

### 7. **Finance & HR Management**
- **Cash Flow Tracking**: Income and expense monitoring
- **Business Expenses**: Expense categorization and reporting
- **Human Resources**: Employee management system
- **Financial Reports**: Cash flow statements and summaries

### 8. **Multi-language Support**
- **i18n Integration**: Vue I18n for internationalization
- **Language Options**: English and Vietnamese support
- **Dynamic Content**: Translated UI elements

## API Documentation

### Base URL
```
http://localhost:3000
```

### Swagger Documentation
Available at: `http://localhost:3000/api-docs`

### Key API Endpoints

#### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /auth/logout` - User logout

#### Products
- `GET /products` - List all products
- `GET /products/:id` - Get product details
- `POST /products` - Create product (Admin)
- `PUT /products/:id` - Update product (Admin)
- `DELETE /products/:id` - Delete product (Admin)

#### Categories
- `GET /categories` - List all categories
- `GET /categories/:id` - Get category details
- `POST /categories` - Create category (Admin)
- `PUT /categories/:id` - Update category (Admin)
- `DELETE /categories/:id` - Delete category (Admin)

#### Orders
- `GET /orders` - List orders
- `GET /orders/:id` - Get order details
- `POST /orders` - Create order
- `PUT /orders/:id` - Update order status (Admin)
- `DELETE /orders/:id` - Delete order

#### Chat
- `GET /chat/conversations` - Get chat conversations
- `POST /chat/message` - Send chat message
- `POST /chat/staff-reply` - Staff reply to customer

#### Live Streams
- `GET /livestreams` - List live streams
- `POST /livestreams` - Create live stream (Admin)
- `PUT /livestreams/:id` - Update live stream (Admin)
- `GET /livestreams/active` - Get active stream

#### Email Marketing
- `POST /newsletter/subscribe` - Subscribe to newsletter
- `GET /newsletter/unsubscribe/:token` - Unsubscribe from newsletter
- `GET /email-templates` - List email templates
- `POST /email-campaigns` - Create email campaign
- `GET /email-campaigns/:id/analytics` - Get campaign analytics

## WebSocket Events

### Connection
- `register` - Register customer connection
- `register_admin` - Register admin connection

### Chat
- `staff_message` - Staff sends message to customer
- `customer_message` - Customer sends message to staff

### Live Streaming
- `stream_started` - Stream broadcast started
- `stream_stopped` - Stream broadcast stopped
- `stream_update` - Stream metrics update (viewers, likes)
- `toggle_like` - User likes/unlikes stream
- `chat_message` - Live stream chat message
- `pinned_products_updated` - Update pinned products

### WebRTC Signaling
- `webrtc_register` - Register peer for WebRTC
- `webrtc_offer` - Send WebRTC offer
- `webrtc_answer` - Send WebRTC answer
- `webrtc_ice_candidate` - Exchange ICE candidates
- `webrtc_broadcast_start` - Start WebRTC broadcast
- `webrtc_broadcast_stop` - Stop WebRTC broadcast

## Database Models

### User Schema
```javascript
{
  username: String (required),
  password: String (required, hashed),
  email: String (required, unique),
  role: String (enum: ['admin', 'customer', 'staff']),
  address: String,
  phone: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Product Schema (Beauty-Specific)
```javascript
{
  name: String (required),
  category: ObjectId (ref: 'Category', required),
  image: String,
  description: String,
  price: Number (required),
  stockQuantity: Number (required, default: 0),
  
  // AI-powered product matching fields
  ingredients: [String] (lowercase),
  skinType: [String] (enum: ['oily', 'dry', 'combination', 'sensitive', 'normal', 'all']),
  benefits: [String] (lowercase),
  tags: [String] (lowercase),
  usage: String,
  skinConcerns: [String] (enum: ['acne', 'aging', 'dark-spots', 'wrinkles', 
                                  'dryness', 'sensitivity', 'dullness', 
                                  'pores', 'uneven-tone']),
  
  // Text indexes for advanced search
  indexes: {
    text: ['name', 'description', 'ingredients', 'benefits', 'tags', 'usage']
  }
}
```

### Order Schema
```javascript
{
  user: ObjectId (ref: 'User', required),
  products: [{
    productId: ObjectId (ref: 'Product', required),
    quantity: Number (required, min: 1),
    price: Number (required, min: 0)
  }],
  paymentMethod: String (enum: ['cod', 'onlinePayment'], required),
  paymentStatus: String (enum: ['pending', 'paid', 'failed'], default: 'pending'),
  orderDate: Date (default: Date.now),
  status: String (enum: ['pending', 'processing', 'shipping', 'completed', 'cancelled']),
  totalPrice: Number (required, default: 0),
  subtotal: Number (default: 0),
  tax: Number (default: 0),
  taxRate: Number (default: 0),
  shippingFee: Number (default: 0),
  shippingLocation: String (enum: ['major', 'other'])
}
```

### LiveStream Schema
```javascript
{
  title: String (required, trim),
  description: String (trim, default: ''),
  videoUrl: String (trim, default: ''),
  streamUrl: String (trim, default: '', comment: 'URL for active stream'),
  thumbnailUrl: String (trim, default: ''),
  duration: Number (in seconds, default: 0),
  viewCount: Number (default: 0),
  likes: Number (default: 0),
  likedBy: [String] (user IDs or session IDs, indexed),
  startTime: Date (default: null),
  endTime: Date (default: null),
  quality: String (enum: ['480p', '720p', '1080p', '4K'], default: '720p'),
  isActive: Boolean (default: false),
  isRecorded: Boolean (default: false),
  chatMessages: [{
    username: String,
    message: String,
    timestamp: Date,
    isAdmin: Boolean
  }],
  maxViewers: Number (default: 0),
  categories: [String] (trim),
  tags: [String] (trim),
  createdBy: ObjectId (ref: 'User'),
  
  // Pinned products during livestream
  pinnedProducts: [{
    productId: ObjectId (ref: 'Product', required),
    pinnedAt: Date (default: Date.now),
    displayOrder: Number (default: 0),
    isActive: Boolean (default: true)
  }],
  
  // Indexes
  indexes: {
    isActive: 1,
    createdAt: -1,
    viewCount: -1,
    isRecorded: 1
  },
  
  // Virtual fields
  formattedDuration: String (computed),
  
  // Methods
  incrementViewCount(),
  addChatMessage(username, message, isAdmin),
  
  // Static methods
  getActiveStream(),
  getPastStreams(limit, skip)
}
```

### EmailCampaign Schema
```javascript
{
  name: String (required, trim),
  subject: String (required, trim),
  content: String (required),
  htmlContent: String (required),
  templateId: ObjectId (ref: 'EmailTemplate', default: null),
  status: String (enum: ['draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled']),
  type: String (enum: ['newsletter', 'promotion', 'announcement', 
                       'welcome', 'product_launch', 'abandoned_cart']),
  createdBy: ObjectId (ref: 'User', required),
  
  // Targeting
  targetAudience: String (enum: ['all', 'segment', 'custom'], default: 'all'),
  segmentCriteria: {
    subscriptionDateFrom: Date,
    subscriptionDateTo: Date,
    sources: [String],
    preferences: {
      newProducts: Boolean,
      promotions: Boolean,
      newsletter: Boolean
    },
    customEmails: [String]
  },
  
  // Scheduling
  scheduledAt: Date (default: null),
  sentAt: Date (default: null),
  
  // Analytics
  analytics: {
    totalRecipients: Number (default: 0),
    emailsSent: Number (default: 0),
    emailsDelivered: Number (default: 0),
    emailsBounced: Number (default: 0),
    emailsOpened: Number (default: 0),
    uniqueOpens: Number (default: 0),
    emailsClicked: Number (default: 0),
    uniqueClicks: Number (default: 0),
    unsubscribes: Number (default: 0),
    complaints: Number (default: 0)
  },
  
  // Settings
  settings: {
    trackOpens: Boolean (default: true),
    trackClicks: Boolean (default: true),
    enableUnsubscribe: Boolean (default: true)
  },
  
  errorLogs: [{
    type: String,
    message: String,
    timestamp: Date (default: Date.now)
  }],
  
  // Virtual fields (computed)
  openRate: Number (percentage),
  clickRate: Number (percentage),
  unsubscribeRate: Number (percentage),
  
  // Methods
  getTargetedSubscribers(),
  
  // Static methods
  getCampaignStats()
}
```

### ChatConversation Schema
```javascript
{
  sessionId: String (required, unique),
  messages: [{
    role: String (enum: ['user', 'assistant', 'staff']),
    content: String,
    timestamp: Date (default: Date.now)
  }],
  userId: ObjectId (ref: 'User', optional),
  status: String (enum: ['active', 'resolved', 'waiting'], default: 'active'),
  createdAt: Date,
  updatedAt: Date
}
```

### NewsletterSubscription Schema
```javascript
{
  email: String (required, unique, lowercase, trim),
  isActive: Boolean (default: true),
  subscriptionDate: Date (default: Date.now),
  unsubscribeToken: String (unique),
  source: String (enum: ['website', 'checkout', 'promotion'], default: 'website'),
  preferences: {
    newProducts: Boolean (default: true),
    promotions: Boolean (default: true),
    newsletter: Boolean (default: true)
  }
}
```

### Category Schema
```javascript
{
  name: String (required),
  description: String,
  parentCategory: ObjectId (ref: 'Category', optional),
  createdAt: Date,
  updatedAt: Date
}
```

### CashFlow Schema
```javascript
{
  type: String (enum: ['income', 'expense'], required),
  amount: Number (required),
  category: String,
  description: String,
  date: Date (default: Date.now),
  reference: String,
  createdBy: ObjectId (ref: 'User')
}
```

### Employee Schema (HR)
```javascript
{
  employeeId: String (required, unique),
  firstName: String (required),
  lastName: String (required),
  email: String (required, unique),
  phone: String,
  position: String,
  department: String,
  hireDate: Date,
  salary: Number,
  status: String (enum: ['active', 'inactive', 'terminated'], default: 'active')
}
```

## Detailed Controller Breakdown

### Analytics Controller (`controllers/analytics/analyticsController.js`)
**Purpose**: Provides business intelligence and reporting functionality

**Key Features**:
- Sales analytics and revenue tracking
- Customer analytics and behavior insights
- Order statistics and trends
- Product performance metrics
- Time-based analytics (daily, weekly, monthly)
- Dashboard summary data aggregation

### E-commerce Controllers

#### Product Controller (`controllers/ecommerce/productController.js`)
**Purpose**: Manages product CRUD operations with AI-enhanced features

**Methods**:
- `getAllProducts()` - Retrieves all products with category population
- `getProductById(id)` - Gets single product with full details
- `createProduct(data)` - Creates product with image upload and AI fields
  - Supports: ingredients, skinType, benefits, tags, usage, skinConcerns
  - Handles multipart/form-data with image files
  - Validates and parses JSON array fields
- `updateProduct(id, data)` - Updates product with image replacement
  - Safely handles old image deletion
  - Rollback on failure
- `deleteProduct(id)` - Removes product and associated image file

**Special Features**:
- Image file management with cleanup utilities
- JSON field parsing for array attributes
- MongoDB text index for advanced search
- Error handling with file cleanup on failure

#### Category Controller (`controllers/ecommerce/categoryController.js`)
**Purpose**: Manages product categorization

**Methods**:
- `getAllCategories()` - Lists all categories
- `getCategoryById(id)` - Gets category details
- `createCategory(data)` - Creates new category
- `updateCategory(id, data)` - Updates category
- `deleteCategory(id)` - Removes category

#### Order Controller (`controllers/ecommerce/orderController.js`)
**Purpose**: Handles order lifecycle management

**Methods**:
- `getAllOrders()` - Lists all orders (admin view)
- `getOrderById(id)` - Gets order details with product info
- `getUserOrders(userId)` - Gets customer's order history
- `createOrder(data)` - Creates new order with validation
  - Calculates subtotal, tax, shipping
  - Updates product stock quantities
- `updateOrderStatus(id, status)` - Updates order progress
- `cancelOrder(id)` - Cancels pending order
- `deleteOrder(id)` - Removes order record

**Business Logic**:
- Tax calculation based on taxRate
- Shipping fee calculation by location
- Stock management on order placement
- Order status workflow enforcement

#### Payment Controller (`controllers/ecommerce/paymentController.js`)
**Purpose**: Manages payment processing

**Methods**:
- `processPayment(orderId, paymentData)` - Handles payment transactions
- `verifyPayment(transactionId)` - Validates payment status
- `refundPayment(orderId)` - Processes refunds
- Payment method support: COD, Online Payment

### Marketing Controllers

#### Email Campaign Controller (`controllers/marketing/emailCampaignController.js`)
**Purpose**: Manages email marketing campaigns

**Methods**:
- `getAllCampaigns()` - Lists all campaigns
- `getCampaignById(id)` - Gets campaign details with analytics
- `createCampaign(data)` - Creates new email campaign
- `updateCampaign(id, data)` - Modifies campaign
- `deleteCampaign(id)` - Removes campaign
- `sendCampaign(id)` - Executes email sending
- `scheduleCampaign(id, date)` - Schedules future send
- `getCampaignAnalytics(id)` - Retrieves performance metrics

**Advanced Features**:
- Audience segmentation (all, segment, custom)
- Email template integration
- Real-time analytics tracking
- Scheduled sending with node-cron
- Target subscriber filtering

#### Email Template Controller (`controllers/marketing/emailTemplateController.js`)
**Purpose**: Manages reusable email templates

**Methods**:
- `getAllTemplates()` - Lists templates
- `getTemplateById(id)` - Gets template content
- `createTemplate(data)` - Creates template with variables
- `updateTemplate(id, data)` - Modifies template
- `deleteTemplate(id)` - Removes template

**Template Features**:
- Variable placeholders ({{variable}})
- HTML and plain text versions
- Template categories
- Preview functionality

#### Email Segment Controller (`controllers/marketing/emailSegmentController.js`)
**Purpose**: Manages subscriber segmentation

**Methods**:
- `getAllSegments()` - Lists segments
- `getSegmentById(id)` - Gets segment criteria
- `createSegment(data)` - Creates subscriber segment
- `updateSegment(id, data)` - Modifies segment
- `deleteSegment(id)` - Removes segment
- `getSegmentSubscribers(id)` - Gets matching subscribers

**Segmentation Criteria**:
- Subscription date ranges
- Source filtering
- Preference matching
- Custom email lists

#### Newsletter Controller (`controllers/marketing/newsletterController.js`)
**Purpose**: Manages newsletter subscriptions

**Methods**:
- `subscribe(email, preferences)` - Adds subscriber
- `unsubscribe(token)` - Removes subscriber via token
- `updatePreferences(token, preferences)` - Updates settings
- `getAllSubscribers()` - Lists active subscribers
- `getSubscriberStats()` - Gets subscription analytics

**Features**:
- Unique unsubscribe tokens
- Preference management
- Source tracking
- Subscription analytics

### Communication Controller

#### Chat Controller (`controllers/communication/chatController.js`)
**Purpose**: Manages customer support chat

**Methods**:
- `getConversations()` - Lists all chat conversations (admin)
- `getConversation(sessionId)` - Gets specific conversation
- `sendMessage(sessionId, message)` - Customer sends message
  - Integrates with Google Gemini AI for responses
  - Real-time WebSocket notification
- `sendStaffReply(sessionId, message)` - Staff responds to customer
  - Updates conversation in database
  - Broadcasts via WebSocket
- `resolveConversation(sessionId)` - Marks conversation as resolved
- `deleteConversation(sessionId)` - Removes conversation

**AI Integration**:
- Google Generative AI (Gemini 1.5 Flash)
- Context-aware product recommendations
- Natural language understanding
- Conversation history maintenance

### Live Stream Controller

#### Live Stream Controller (`controllers/livestream/liveStreamController.js`)
**Purpose**: Manages WebRTC live streaming

**Methods**:
- `getAllStreams()` - Lists all streams
- `getActiveStream()` - Gets currently active stream
- `getPastStreams(limit, skip)` - Gets stream history
- `getStreamById(id)` - Gets stream details
- `createStream(data)` - Creates new stream
- `updateStream(id, data)` - Modifies stream
- `startStream(id)` - Activates stream broadcast
  - WebSocket notification to all clients
  - Initializes viewer tracking
- `stopStream(id)` - Ends stream broadcast
  - Records end time and duration
  - Saves final analytics
- `deleteStream(id)` - Removes stream
- `updateViewerCount(id, count)` - Updates viewers
- `toggleLike(id, userId)` - Handles like/unlike
- `pinProduct(streamId, productId)` - Pins product to stream
- `unpinProduct(streamId, productId)` - Unpins product
- `reorderPinnedProducts(streamId, order)` - Changes product order

**Real-time Features**:
- WebSocket integration for live updates
- Viewer count tracking
- Live chat message storage
- Like/unlike functionality
- Pinned products management

### Finance Controller

#### Cash Flow Controller (`controllers/finance/cashFlowController.js`)
**Purpose**: Tracks business income and expenses

**Methods**:
- `getAllTransactions()` - Lists all transactions
- `getTransactionById(id)` - Gets transaction details
- `createTransaction(data)` - Records income/expense
- `updateTransaction(id, data)` - Modifies transaction
- `deleteTransaction(id)` - Removes transaction
- `getCashFlowSummary(startDate, endDate)` - Generates report
- `getIncomeByCategory()` - Income breakdown
- `getExpensesByCategory()` - Expense breakdown

### HR Controller

#### HR Controller (`controllers/hr/hrController.js`)
**Purpose**: Manages employee records

**Methods**:
- `getAllEmployees()` - Lists all employees
- `getEmployeeById(id)` - Gets employee details
- `createEmployee(data)` - Adds new employee
- `updateEmployee(id, data)` - Modifies employee record
- `deleteEmployee(id)` - Removes employee (soft delete)
- `getEmployeesByDepartment(dept)` - Department filtering
- `getActiveEmployees()` - Lists active employees only

### Authentication Controller

#### Auth Controller (`controllers/auth/authController.js`)
**Purpose**: Handles user authentication

**Methods**:
- `register(username, password, email, role)` - Creates new user
  - Password hashing with bcryptjs
  - Role validation (admin requires key)
  - JWT token generation
- `login(username, password)` - Authenticates user
  - Password verification
  - JWT token issuance
  - Role-based response
- `logout()` - Invalidates session (client-side)
- `verifyToken(token)` - Validates JWT token
- `refreshToken(token)` - Renews expired token

#### User Controller (`controllers/auth/userController.js`)
**Purpose**: Manages user accounts

**Methods**:
- `getAllUsers()` - Lists all users (admin only)
- `getUserById(id)` - Gets user profile
- `updateUser(id, data)` - Modifies user info
- `deleteUser(id)` - Removes user account
- `updatePassword(id, oldPassword, newPassword)` - Changes password
- `getUserProfile(id)` - Gets own profile (customer)
- `updateProfile(id, data)` - Updates own profile

### Rate Limiting
- 1000 requests per 15 minutes per IP address
- Prevents DDoS and brute force attacks

### Authentication
- JWT tokens with secure secret
- Password hashing with bcryptjs (salt rounds: 10)
- Token verification middleware

### CORS
- Cross-Origin Resource Sharing enabled
- Allows frontend-backend communication

### Input Validation
- Express-validator for request validation
- Sanitization of user inputs

### File Upload Security
- Multer configuration for safe file handling
- File type and size restrictions

## Environment Variables

### Backend (.env)
```env
PORT=3000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
```

### Frontend
```env
VITE_API_URL=http://localhost:3000
```

## Running the Application

### Backend
```bash
cd backend
npm install
npm start          # Production
npm run dev        # Development
```

### Frontend
```bash
cd frontend
npm install
npm run dev        # Development server
npm run build      # Production build
npm run preview    # Preview production build
```

### Docker Deployment

#### Backend
```bash
cd backend
docker build -t final-project-backend .
docker run -p 3000:3000 final-project-backend
```

#### Frontend
```bash
cd frontend
docker build -t final-project-frontend .
docker run -p 80:80 final-project-frontend
```

## Routes & Navigation

### Public Routes
- `/` - Public homepage
- `/login` - User login
- `/register` - User registration
- `/logout` - User logout
- `/unsubscribe/:token` - Newsletter unsubscribe

### Admin Routes (Protected)
- `/admin` - Admin dashboard (redirects to cashflow)
- `/admin/categories` - Category management
- `/admin/products` - Product management
- `/admin/orders` - Order management
- `/admin/users` - User management
- `/admin/analytics` - Analytics dashboard
- `/admin/cashflow` - Cash flow management
- `/admin/hr` - Human resources
- `/admin/live-stream` - Live stream management
- `/admin/email-marketing/*` - Email marketing tools

### Customer Routes (Protected)
- `/customer` - Customer homepage
- `/customer/products` - Browse products
- `/customer/products/:id` - Product details
- `/customer/cart` - Shopping cart
- `/customer/checkout` - Checkout process
- `/customer/orders` - Order history
- `/customer/live-stream` - View live streams
- `/customer/profile` - User profile

## Key Dependencies

### Backend Security & Authentication
- `jsonwebtoken` - JWT token generation/verification
- `bcryptjs` - Password hashing
- `express-rate-limit` - API rate limiting
- `express-validator` - Request validation

### Backend Real-time Features
- `ws` - WebSocket server implementation
- `@google/generative-ai` - AI chat integration

### Frontend UI & UX
- `vue-router` - Client-side routing
- `chart.js` + `vue-chartjs` - Data visualization
- `tailwindcss` - Utility-first CSS framework
- `axios` - HTTP client

## Best Practices Implemented

1. **MVC Architecture**: Separation of concerns with models, controllers, and routes
2. **Middleware Pattern**: Reusable authentication and authorization middleware
3. **Error Handling**: Centralized error handling and validation
4. **Code Organization**: Modular structure with clear separation of features
5. **Security First**: JWT authentication, rate limiting, input validation
6. **Real-time Updates**: WebSocket integration for live features
7. **Scalable Database**: MongoDB with indexed queries
8. **API Documentation**: Swagger/OpenAPI specification
9. **Containerization**: Docker support for deployment
10. **State Management**: Centralized stores for Vue components

## Advanced Architecture Features

### WebSocket Manager (`backend/websocket.js`)

The WebSocket Manager is a sophisticated real-time communication system that powers multiple features:

#### Connection Management
- **Customer Connections**: Tracked by `sessionId` (Map structure)
  - Stores: WebSocket connection, userId (if authenticated), userRole
  - Supports anonymous and authenticated users
- **Admin Connections**: Tracked by `userId` (Map structure)
  - Requires JWT authentication
  - Role verification (admin/staff only)
- **WebRTC Connections**: Tracked by `peerId` (Map structure)
  - Manages broadcaster and viewer relationships

#### Real-time Features

**1. Customer Support Chat**
- Bidirectional messaging between customers and staff
- Session-based conversation tracking
- Online/offline status detection
- Message queuing for offline users
- Admin notification for new customer messages

**2. Live Stream Management**
- In-memory stream state tracking
- Real-time viewer count updates
- Like/unlike with duplicate prevention
- Live chat message broadcasting
- Stream status notifications (started/stopped)
- Pinned products synchronization

**3. WebRTC Signaling**
- Peer connection establishment
- SDP offer/answer exchange
- ICE candidate negotiation
- Broadcaster-viewer connection management
- Automatic reconnection handling

### Frontend Page Structure

#### Admin Pages (`frontend/src/pages/admin/`)

**1. Analytics Dashboard** (`analytics/`)
- Sales metrics and trends
- Customer insights
- Order statistics
- Revenue tracking with Chart.js
- Real-time data updates

**2. Category Management** (`categories/`)
- Category CRUD operations
- Hierarchical category support
- Category-product relationship management

**3. Product Management** (`products/`)
- Product listing with search/filter
- Create/edit products with image upload
- AI fields: ingredients, skin types, benefits, concerns
- Stock quantity tracking
- Bulk product operations

**4. Order Management** (`orders/`)
- Order listing with filters (status, date)
- Order detail view with product info
- Status update workflow
- Payment status tracking
- Order deletion/cancellation

**5. User Management** (`users/`)
- User listing (customers, staff)
- Role management
- User activity tracking
- Account suspension/deletion

**6. Finance Dashboard** (`finance/`)
- Cash flow tracking
- Income vs. expense charts
- Transaction history
- Financial reports
- Category-wise breakdown

**7. Live Stream Admin** (`live-stream/`)
- Stream creation and configuration
- WebRTC broadcast controls
- Real-time viewer/like monitoring
- Live chat moderation
- Product pinning interface
- Stream history with analytics

**8. Email Marketing** (`email-marketing/`)
- Campaign management
- Email template editor
- Subscriber segmentation
- Campaign scheduling
- Analytics (open rate, click rate)
- Newsletter subscriber management

**9. HR Management** (`hr/`)
- Employee directory
- Department organization
- Salary tracking
- Hire/termination records

#### Customer Pages (`frontend/src/pages/customer/`)

**1. Product Browsing** (`products/`)
- Product grid with pagination
- Category filtering
- Search with AI-powered suggestions
- Product detail view with:
  - Image gallery
  - Ingredient list
  - Skin type compatibility
  - Benefits and usage
  - Related products

**2. Shopping Cart** (`shopping/`)
- Cart item management
- Quantity updates
- Real-time price calculation
- Stock availability check
- Checkout process

**3. Order History** (`orders/`)
- Past orders listing
- Order tracking
- Order detail view
- Reorder functionality

**4. Account Management** (`account/`)
- Profile information
- Password change
- Address book
- Order preferences

**5. Live Stream Viewer** (`live-stream/`)
- Active stream viewing (WebRTC)
- Live chat participation
- Like/unlike functionality
- Pinned products display
- Past streams archive

### Deployment Configuration

#### Docker Setup

**Backend Dockerfile**:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

**Frontend Dockerfile**:
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose (Production)
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
    restart: unless-stopped
    
  frontend:
    build: ./frontend
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - backend
    restart: unless-stopped
```

### Performance Optimizations

**Backend**:
1. **Database Indexing**:
   - Product text indexes for full-text search
   - LiveStream indexes (isActive, viewCount, createdAt)
   - Order indexes (userId, orderDate, status)
   
2. **Rate Limiting**:
   - 1000 requests per 15 minutes per IP
   - Prevents API abuse and DDoS
   
3. **Static File Serving**:
   - Express static middleware for uploads
   - Nginx reverse proxy in production
   
4. **WebSocket Connection Pooling**:
   - Efficient Map-based connection tracking
   - Automatic cleanup on disconnect
   - Memory-efficient state management

**Frontend**:
1. **Vite Build Optimization**:
   - Code splitting
   - Tree shaking
   - Asset optimization
   
2. **Lazy Loading**:
   - Route-based code splitting
   - Dynamic imports for large components
   
3. **Image Optimization**:
   - Compressed uploads
   - Responsive image loading
   
4. **Caching Strategy**:
   - LocalStorage for auth tokens
   - SessionStorage for temporary data
   - Browser caching for static assets

### Monitoring & Logging

**Backend Logging**:
```javascript
// Winston logger configuration
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Log HTTP requests
app.use(morgan('combined', { stream: logger.stream }));
```

**Error Tracking**:
- Centralized error handling middleware
- Structured error responses
- WebSocket error logging
- Database operation error capture

**Analytics Tracking**:
- Live stream metrics (viewers, duration, engagement)
- Email campaign performance (open/click rates)
- Sales analytics (revenue, orders, products)
- User activity (logins, purchases, browsing)

## Troubleshooting Guide

### Common Issues

**1. MongoDB Connection Failed**
```
Error: MongoNetworkError: connection timed out
```
**Solution**:
- Check MONGODB_URI in .env
- Verify MongoDB Atlas IP whitelist
- Ensure network connectivity
- Check firewall settings

**2. WebSocket Connection Error**
```
WebSocket connection failed: Error during WebSocket handshake
```
**Solution**:
- Verify WebSocket server port (should match HTTP server)
- Check CORS configuration
- Ensure client uses correct WebSocket URL (ws:// or wss://)
- Check for proxy/firewall blocking WebSocket

**3. JWT Authentication Error**
```
Error: JsonWebTokenError: invalid signature
```
**Solution**:
- Verify JWT_SECRET matches between client and server
- Check token expiration
- Ensure token is properly formatted in Authorization header
- Clear localStorage and re-login

**4. Image Upload Failed**
```
MulterError: Unexpected field
```
**Solution**:
- Check field name matches 'image'
- Verify file size limits
- Ensure uploads/ directory exists and is writable
- Check file type restrictions

**5. Email Sending Failed**
```
Error: Invalid login: 535 Authentication failed
```
**Solution**:
- Verify EMAIL_USER and EMAIL_PASS in .env
- Enable "Less secure app access" for Gmail
- Use App Password for Gmail with 2FA
- Check SMTP server settings

**6. Live Stream Not Starting**
```
Error: Cannot access camera/microphone
```
**Solution**:
- Grant browser permissions for camera/microphone
- Ensure HTTPS for WebRTC (required in production)
- Check if another app is using camera
- Verify WebRTC browser compatibility

**7. Build Errors**
```
Error: Cannot find module 'xyz'
```
**Solution**:
- Run `npm install` in both frontend and backend
- Delete node_modules and package-lock.json, reinstall
- Check Node.js version (requires Node 16+)
- Verify all dependencies in package.json

### Debug Mode

**Enable Backend Debug Logging**:
```bash
# In .env
DEBUG=true
LOG_LEVEL=debug

# Or via command line
DEBUG=* npm start
```

**Enable Frontend Dev Tools**:
```javascript
// In main.js
if (process.env.NODE_ENV === 'development') {
  Vue.config.devtools = true;
  Vue.config.debug = true;
}
```

### Health Checks

**Backend Health Endpoint**:
```javascript
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    websocket: wss.clients.size + ' connections'
  });
});
```

**Access**: `GET http://localhost:3000/health`

## Testing Strategy

### Unit Tests (Backend)
```javascript
// Example: Test product creation
describe('Product Controller', () => {
  it('should create a product with valid data', async () => {
    const productData = {
      name: 'Test Product',
      category: categoryId,
      price: 29.99,
      stockQuantity: 100
    };
    
    const res = await request(app)
      .post('/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(productData);
    
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Test Product');
  });
});
```

**Testing Framework**: Jest + Supertest

### Integration Tests
```javascript
// Example: Test order workflow
describe('Order Workflow', () => {
  it('should create order and update stock', async () => {
    // Create order
    const order = await createOrder(orderData);
    expect(order.status).toBe('processing');
    
    // Verify stock decreased
    const product = await Product.findById(productId);
    expect(product.stockQuantity).toBe(initialStock - orderQuantity);
  });
});
```

### E2E Tests (Frontend)
```javascript
// Example: Cypress test
describe('Customer Shopping Flow', () => {
  it('should complete purchase', () => {
    cy.visit('/customer/products');
    cy.get('.product-card').first().click();
    cy.get('.add-to-cart-btn').click();
    cy.get('.cart-icon').click();
    cy.get('.checkout-btn').click();
    cy.get('.confirm-order-btn').click();
    cy.contains('Order placed successfully');
  });
});
```

**Testing Framework**: Cypress

### WebSocket Testing
```javascript
// Example: Test live stream chat
const WebSocket = require('ws');

describe('Live Stream Chat', () => {
  let ws;
  
  beforeEach(() => {
    ws = new WebSocket('ws://localhost:3000');
  });
  
  it('should broadcast chat message', (done) => {
    ws.on('open', () => {
      ws.send(JSON.stringify({
        type: 'chat_message',
        username: 'testuser',
        message: 'Hello World'
      }));
    });
    
    ws.on('message', (data) => {
      const msg = JSON.parse(data);
      if (msg.type === 'chat_message') {
        expect(msg.message).toBe('Hello World');
        done();
      }
    });
  });
});
```

## API Request/Response Examples

### Product Creation
**Request**:
```http
POST /products HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: multipart/form-data

name=Hydrating Serum
categoryId=507f1f77bcf86cd799439011
price=45.99
stockQuantity=50
description=A lightweight hydrating serum for all skin types
ingredients=["hyaluronic acid","vitamin B5","glycerin"]
skinType=["dry","normal","combination"]
benefits=["hydration","plumping","smoothing"]
skinConcerns=["dryness","dullness"]
tags=["serum","hydrating","morning routine"]
usage=Apply 2-3 drops to clean face morning and evening
image=@serum.jpg
```

**Response**:
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Hydrating Serum",
  "category": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Serums"
  },
  "image": "uploads/1234567890-serum.jpg",
  "description": "A lightweight hydrating serum for all skin types",
  "price": 45.99,
  "stockQuantity": 50,
  "ingredients": ["hyaluronic acid", "vitamin b5", "glycerin"],
  "skinType": ["dry", "normal", "combination"],
  "benefits": ["hydration", "plumping", "smoothing"],
  "skinConcerns": ["dryness", "dullness"],
  "tags": ["serum", "hydrating", "morning routine"],
  "usage": "Apply 2-3 drops to clean face morning and evening",
  "createdAt": "2024-11-01T10:30:00.000Z",
  "updatedAt": "2024-11-01T10:30:00.000Z"
}
```

### Order Creation
**Request**:
```json
POST /orders HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "products": [
    {
      "productId": "507f1f77bcf86cd799439011",
      "quantity": 2,
      "price": 45.99
    },
    {
      "productId": "507f1f77bcf86cd799439012",
      "quantity": 1,
      "price": 29.99
    }
  ],
  "paymentMethod": "onlinePayment",
  "shippingLocation": "major",
  "taxRate": 0.1
}
```

**Response**:
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "user": "507f1f77bcf86cd799439010",
  "products": [
    {
      "productId": "507f1f77bcf86cd799439011",
      "quantity": 2,
      "price": 45.99,
      "_id": "507f1f77bcf86cd799439014"
    },
    {
      "productId": "507f1f77bcf86cd799439012",
      "quantity": 1,
      "price": 29.99,
      "_id": "507f1f77bcf86cd799439015"
    }
  ],
  "paymentMethod": "onlinePayment",
  "paymentStatus": "pending",
  "orderDate": "2024-11-01T10:35:00.000Z",
  "status": "processing",
  "subtotal": 121.97,
  "tax": 12.20,
  "taxRate": 0.1,
  "shippingFee": 5.00,
  "totalPrice": 139.17,
  "shippingLocation": "major"
}
```

### Email Campaign Analytics
**Request**:
```http
GET /email-campaigns/507f1f77bcf86cd799439016/analytics HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response**:
```json
{
  "campaignId": "507f1f77bcf86cd799439016",
  "name": "New Product Launch",
  "sentAt": "2024-11-01T08:00:00.000Z",
  "analytics": {
    "totalRecipients": 1000,
    "emailsSent": 1000,
    "emailsDelivered": 985,
    "emailsBounced": 15,
    "emailsOpened": 450,
    "uniqueOpens": 420,
    "emailsClicked": 180,
    "uniqueClicks": 165,
    "unsubscribes": 5,
    "complaints": 2
  },
  "rates": {
    "deliveryRate": "98.50%",
    "openRate": "45.69%",
    "clickRate": "18.27%",
    "clickToOpenRate": "40.00%",
    "unsubscribeRate": "0.51%"
  },
  "topLinks": [
    {
      "url": "https://wrencos.com/products/new-serum",
      "clicks": 120
    },
    {
      "url": "https://wrencos.com/sale",
      "clicks": 60
    }
  ]
}
```

## Future Enhancements

- [ ] Payment gateway integration (Stripe/PayPal)
- [ ] Advanced product search and filtering
- [ ] Product reviews and ratings
- [ ] Wishlist functionality
- [ ] Push notifications
- [ ] Mobile app development
- [ ] Advanced analytics and reporting
- [ ] Multi-vendor support
- [ ] Social media integration
- [ ] Automated inventory management

## Contributing

This is a university final year project (FYP). For questions or contributions, please contact the project maintainer.

## License

This project is developed for educational purposes as part of a university final year project.

---

**Project Name**: Final Project - E-commerce Platform  
**Version**: 1.0.0  
**Last Updated**: November 1, 2025  
**Repository**: Truc4p/final-project
