# Wrencos - AI-Powered Beauty & Skincare E-Commerce Platform
## Demo link 
https://drive.google.com/drive/folders/1iwjvt8mkcu22mxydmO0PtbtB-T-rY-uD?usp=sharing

## 📋 Project Overview

**Wrencos** is a comprehensive, multi-platform AI-powered e-commerce and customer engagement platform specifically designed for the beauty and skincare industry. The platform combines traditional e-commerce functionality with advanced AI features including a virtual dermatology expert, live streaming capabilities, and intelligent customer support.

### Key Features
- 🛍️ **E-Commerce Platform** - Product catalog, shopping cart, checkout, and order management
- 🤖 **AI Dermatology Expert** - Skin analysis, product recommendations, and skincare advice powered by Google Gemini AI
- 📺 **Live Streaming** - Real-time product demonstrations and customer engagement
- 💬 **AI Chat Support** - Intelligent customer support with RAG (Retrieval-Augmented Generation)
- 📧 **Email Marketing** - Campaign management, templates, segmentation, and analytics
- 📊 **Analytics Dashboard** - Business insights and performance metrics
- 👥 **HR Management** - Comprehensive human resources management
- 💰 **Finance Management** - Advanced accounting, invoicing, billing, and financial analytics
- 💳 **Payment Integration** - VNPay payment gateway for Vietnamese market
- 🔐 **Security & Secrets** - Encrypted secret management system
- ⚡ **Performance** - Redis caching with semantic similarity matching
- 📱 **Mobile Apps** - Native React Native apps for both admin and customer platforms
- 🌐 **Multi-Language Support** - Automatic language detection and translation

---

## [object Object]

### Technology Stack

#### Backend
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB (Atlas)
- **AI/ML**: Google Generative AI (Gemini 2.0 Flash), LangChain
- **Vector Database**: Qdrant (for RAG and semantic search)
- **Caching**: Redis (with semantic similarity matching)
- **Real-Time**: WebSocket (ws library)
- **Authentication**: JWT (JSON Web Tokens)
- **Payment Gateway**: VNPay (Vietnamese market)
- **Live Streaming**: Agora SDK
- **File Upload**: Multer
- **Email**: Nodemailer with Gmail SMTP
- **Security**: Helmet, bcryptjs, encrypted secret management
- **Testing**: Jest with Supertest
- **API Documentation**: Swagger/OpenAPI
- **Utilities**: Moment.js, UUID, QRCode, PDF-Parse, node-gtts (Text-to-Speech)

#### Frontend (Web)
- **Framework**: Vue 3
- **Build Tool**: Vite
- **Routing**: Vue Router 4
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Charts**: Chart.js with Vue-ChartJS
- **Internationalization**: Vue-i18n
- **Testing**: Vitest with Coverage
- **PDF Generation**: jsPDF with html2canvas
- **OCR**: Tesseract.js
- **Spreadsheet**: xlsx (Excel import/export)
- **Markdown**: Marked
- **Authentication**: JWT-decode

#### Mobile Apps
- **Framework**: React Native with Expo (~50.0.0)
- **Navigation**: React Navigation (Bottom Tabs, Stack, Native Stack)
- **State Management**: AsyncStorage
- **Real-Time Communication**: Agora SDK (for live streaming)
- **Media**: Expo AV, Expo Image Picker
- **Accessibility**: Expo Speech (Text-to-Speech)
- **UI**: React Native Vector Icons, React Native Gesture Handler
- **HTML Rendering**: React Native Render HTML
- **HTTP Client**: Axios

---

## 📁 Project Structure

```
wrencos/
├── backend/                          # Node.js Express API server
│   ├── controllers/                  # Business logic for each feature
│   │   ├── auth/                     # Authentication & user management
│   │   ├── ecommerce/                # Products, orders, payments
│   │   ├── communication/            # Chat and messaging
│   │   ├── livestream/               # Live streaming features
│   │   ├── marketing/                # Email campaigns and newsletters
│   │   ├── finance/                  # Cash flow and financial tracking
│   │   ├── hr/                       # Human resources management
│   │   ├── analytics/                # Business analytics
│   │   ├── skin-study/               # AI dermatology expert
│   │   └── uploads/                  # File upload handling
│   ├── models/                       # MongoDB schemas
│   │   ├── auth/                     # User model
│   │   ├── ecommerce/                # Product, Order, Category models
│   │   ├── communication/            # ChatConversation model
│   │   ├── livestream/               # LiveStream model
│   │   ├── marketing/                # Email templates, campaigns, segments
│   │   ├── finance/                  # CashFlow, BusinessExpense models
│   │   ├── hr/                       # Employee model
│   │   ├── core/                     # FAQ model
│   │   └── skin-study/               # DermatologyKnowledge model
│   ├── routes/                       # API endpoints
│   ├── middleware/                   # Auth, role-based access control
│   ├── services/                     # External service integrations
│   │   ├── geminiService.js          # Google Gemini AI integration
│   │   ├── vectorService.js          # Qdrant vector DB integration
│   │   ├── cacheService.js           # Redis caching with semantic similarity
│   │   ├── secretManager.js          # Encrypted secret management
│   │   ├── secretInitializer.js      # Secret initialization
│   │   ├── emailService.js           # Email sending service
│   │   ├── emailNotificationService.js # Email notifications
│   │   ├── emailScheduler.js         # Scheduled email campaigns
│   │   ├── financialReportService.js # Financial reporting
│   │   └── ttsService.js             # Text-to-speech service
│   ├── utils/                        # Utility functions
│   ├── scripts/                      # Maintenance and utility scripts
│   ├── seed-data/                    # Database seeding scripts
│   ├── knowledge-sources/            # Dermatology knowledge base
│   ├── uploads/                      # User-uploaded files
│   ├── app.js                        # Express app configuration
│   ├── server.js                     # Server entry point
│   ├── db.js                         # MongoDB connection
│   ├── websocket.js                  # WebSocket manager
│   ├── swagger.js                    # API documentation
│   └── package.json                  # Dependencies
│
├── frontend/                         # Vue 3 web application
│   ├── src/
│   │   ├── components/               # Reusable Vue components
│   │   │   ├── ChatWidget.vue        # Customer chat interface
│   │   │   └── AdminChatWidget.vue   # Admin chat interface
│   │   ├── pages/                    # Page components
│   │   │   ├── admin/                # Admin dashboard pages
│   │   │   │   ├── products/         # Product management
│   │   │   │   ├── categories/       # Category management
│   │   │   │   ├── orders/           # Order management
│   │   │   │   ├── users/            # User management
│   │   │   │   ├── analytics/        # Analytics dashboard
│   │   │   │   ├── finance/          # Finance & HR pages
│   │   │   │   ├── email-marketing/  # Email campaign management
│   │   │   │   └── live-stream/      # Live stream management
│   │   │   ├── customer/             # Customer pages
│   │   │   │   ├── products/         # Product browsing
│   │   │   │   ├── shopping/         # Cart & checkout
│   │   │   │   ├── orders/           # Order history
│   │   │   │   ├── account/          # User profile
│   │   │   │   ├── live-stream/      # Watch live streams
│   │   │   │   └── skin-study/       # AI dermatology expert
│   │   │   └── public/               # Public pages (login, register)
│   │   ├── layout/                   # Layout components
│   │   ├── router/                   # Vue Router configuration
│   │   ├── services/                 # API service layer
│   │   ├── stores/                   # State management
│   │   ├── utils/                    # Utility functions
│   │   ├── assets/                   # CSS and static assets
│   │   ├── App.vue                   # Root component
│   │   ├── main.js                   # Vue app entry point
│   │   └── i18n.js                   # Internationalization setup
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── mobile-app-admin/                 # React Native admin app (Expo)
│   ├── src/
│   │   ├── screens/                  # Screen components
│   │   ├── components/               # Reusable components
│   │   ├── services/                 # API services
│   │   ├── constants/                # App constants
│   │   └── App.js                    # App entry point
│   ├── app.json                      # Expo configuration
│   └── package.json
│
├── mobile-app-customer/              # React Native customer app (Expo)
│   ├── src/
│   │   ├── screens/                  # Screen components
│   │   ├── components/               # Reusable components
│   │   ├── services/                 # API services
│   │   ├── constants/                # App constants
│   │   └── App.js                    # App entry point
│   ├── app.json                      # Expo configuration
│   └── package.json
│
└── package.json                      # Root package.json (Expo dependencies)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- Google Generative AI API key
- Qdrant vector database (Docker or cloud)

### Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/Wrencos

# Authentication
JWT_SECRET=your_jwt_secret_key
ADMIN_KEY=secret

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# RAG & Vector Database Configuration
EMBEDDING_PROVIDER=gemini
QDRANT_URL=http://localhost:6333
# QDRANT_API_KEY=your_qdrant_api_key (only needed for Qdrant Cloud)

# Redis Cache
REDIS_URL=redis://localhost:6379

# Email Service (Gmail SMTP)
# Instructions:
# 1. Use your Gmail address
# 2. Generate an App Password (not your regular password):
#    - Go to Google Account settings
#    - Security > 2-Step Verification (must be enabled)
#    - App passwords > Select app: Mail > Generate password
#    - Use the 16-character password here
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_16_char_app_password
COMPANY_NAME=Wrencos

# VNPay Payment Gateway (Vietnam)
VNP_TMN_CODE=your_vnpay_tmn_code
VNP_HASH_SECRET=your_vnpay_hash_secret
VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNP_RETURN_URL=http://localhost:3000/payments/vnpay/return
VNP_EXCHANGE_RATE=24000

# Agora Live Streaming
# Get these from: https://console.agora.io
AGORA_APP_ID=your_agora_app_id
AGORA_APP_CERTIFICATE=your_agora_app_certificate

# Frontend URL
FRONTEND_URL=http://localhost:5173

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

### Installation & Running

#### Backend Setup
```bash
cd backend
npm install
npm run dev
```

The API will be available at `http://localhost:3000`
Swagger documentation: `http://localhost:3000/api-docs`

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`

#### Mobile Apps Setup

**Admin App:**
```bash
cd mobile-app-admin
npm install
npm start
```

**Customer App:**
```bash
cd mobile-app-customer
npm install
npm start
```

---

## 📚 Core Features Documentation

### 1. E-Commerce Module

#### Products
- **Model**: `Product` - Stores product information with skincare-specific fields
- **Fields**: name, category, price, stock, ingredients, skinType, benefits, skinConcerns, usage
- **Features**: 
  - Full-text search across name, description, ingredients, benefits
  - Categorization and filtering
  - Stock management

#### Orders
- **Model**: `Order` - Tracks customer purchases
- **Features**:
  - Order creation and management
  - Payment processing
  - Order history and tracking
  - Admin order modification

#### Categories
- **Model**: `Category` - Product categorization
- **Features**: Create, read, update, delete categories

### 2. AI Dermatology Expert

**Location**: `backend/controllers/skin-study/aiDermatologyExpertController.js`

**Features**:
- **Skin Image Analysis**: Upload skin images for AI analysis
- **Text-Based Consultation**: Ask skincare questions
- **Audio Input**: Voice-based queries with transcription
- **RAG Integration**: Uses vector database for evidence-based recommendations
- **Multi-Language Support**: Automatic language detection and response translation
- **Citation System**: All recommendations are cited from dermatology textbooks

**Key Service**: `backend/services/geminiService.js`
- Integrates Google Generative AI (Gemini 2.0 Flash)
- Handles image analysis, text generation, and audio transcription
- Implements retry logic for API rate limiting
- Manages language detection and translation

### 3. Live Streaming

**Model**: `LiveStream` - Manages live stream sessions

**Features**:
- **Stream Management**: Create, start, end, and archive streams
- **Real-Time Chat**: WebSocket-based chat during streams
- **Viewer Tracking**: Real-time viewer count and engagement metrics
- **Product Pinning**: Pin products for sale during streams
- **Like System**: Real-time like tracking
- **Quality Settings**: 480p, 720p, 1080p, 4K options
- **Recording**: Automatic stream recording and archival

**WebSocket Integration**: `backend/websocket.js`
- Real-time stream state management
- Chat message broadcasting
- Viewer count updates
- Like/engagement tracking

### 4. AI Chat Support

**Model**: `ChatConversation` - Stores chat conversations

**Features**:
- **AI-Powered Responses**: Gemini-based intelligent responses
- **RAG Context**: Retrieves relevant information from knowledge base
- **Staff Escalation**: Seamless handoff to human support
- **Session Management**: Supports both authenticated and anonymous users
- **Message History**: Maintains conversation context
- **FAQ Integration**: Predefined responses for common questions

**Vector Database**: Qdrant
- Stores embeddings of FAQ and knowledge base
- Enables semantic search for relevant information
- Powers RAG (Retrieval-Augmented Generation)

### 5. Email Marketing

**Models**:
- `EmailTemplate` - Email design templates
- `EmailCampaign` - Campaign management
- `EmailSegment` - Customer segmentation
- `NewsletterSubscription` - Subscriber management
- `EmailAnalytics` - Campaign performance metrics

**Features**:
- Template creation and management
- Campaign scheduling and sending
- Subscriber segmentation
- Performance analytics
- Unsubscribe management

### 6. Analytics Dashboard

**Features**:
- Sales metrics and trends
- Product performance
- Customer insights
- Order analytics
- Revenue tracking

### 7. Finance Management

**Models**:
- `ChartOfAccounts` - Account structure and hierarchy
- `GeneralLedger` - Double-entry bookkeeping ledger
- `JournalEntry` - Financial transactions journal
- `CashFlowTransaction` - Cash flow tracking
- `BusinessExpense` - Expense tracking
- `Invoice` - Customer invoicing
- `Bill` - Vendor bills and payables
- `Customer` - Customer financial records
- `Vendor` - Vendor/supplier management
- `BankAccount` - Bank account management

**Features**:
- **Double-Entry Accounting**: Complete general ledger system
- **Accounts Payable**: Bill management and vendor tracking
- **Accounts Receivable**: Invoice generation and customer management
- **Chart of Accounts**: Hierarchical account structure
- **Cash Flow Tracking**: Real-time cash flow monitoring
- **Financial Reports**: Balance sheet, income statement, cash flow reports
- **Bank Reconciliation**: Bank account management and reconciliation
- **Expense Management**: Comprehensive expense tracking and categorization
- **Multi-Currency**: Support for currency conversion

### 8. HR Management

**Model**: `Employee` - Employee information

**Features**:
- Employee records
- Department management
- Payroll information
- Performance tracking

---

## 🔐 Authentication & Authorization

### Authentication Flow
1. User registers with username and password
2. Password is hashed using bcryptjs
3. JWT token is issued upon login
4. Token is stored in localStorage (frontend) or AsyncStorage (mobile)
5. Token is included in Authorization header for API requests

### Role-Based Access Control
- **Admin**: Full access to all features
- **Customer**: Limited access to customer-specific features

**Middleware**: 
- `backend/middleware/auth.js` - Verifies JWT token
- `backend/middleware/role.js` - Checks user role
- `backend/middleware/optionalAuth.js` - Optional authentication

---

## 🔌 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/logout` - Logout user

### Products
- `GET /products` - Get all products
- `GET /products/:id` - Get product details
- `POST /products` - Create product (admin)
- `PUT /products/:id` - Update product (admin)
- `DELETE /products/:id` - Delete product (admin)

### Orders
- `GET /orders` - Get all orders
- `GET /orders/:id` - Get order details
- `POST /orders` - Create order
- `PUT /orders/:id` - Update order
- `DELETE /orders/:id` - Delete order

### Payments
- `POST /payments/vnpay/create` - Create VNPay payment URL
- `GET /payments/vnpay/return` - VNPay return URL handler
- `POST /payments/vnpay/ipn` - VNPay IPN (Instant Payment Notification)

### Chat
- `GET /chat/conversations/:sessionId` - Get conversation
- `POST /chat/message` - Send message
- `GET /chat/faq` - Get FAQ

### Live Streams
- `GET /livestreams` - Get all streams
- `GET /livestreams/:id` - Get stream details
- `POST /livestreams` - Create stream (admin)
- `PUT /livestreams/:id` - Update stream (admin)
- `DELETE /livestreams/:id` - Delete stream (admin)

### Email Marketing
- `GET /email-campaigns` - Get campaigns
- `POST /email-campaigns` - Create campaign
- `GET /email-templates` - Get templates
- `POST /email-templates` - Create template
- `GET /newsletter` - Get subscribers
- `POST /newsletter/subscribe` - Subscribe to newsletter

### Analytics
- `GET /analytics/sales` - Sales analytics
- `GET /analytics/products` - Product analytics
- `GET /analytics/customers` - Customer analytics

### Finance
- `GET /finance/chart-of-accounts` - Get chart of accounts
- `POST /finance/chart-of-accounts` - Create account
- `GET /finance/general-ledger` - Get general ledger entries
- `POST /finance/journal-entries` - Create journal entry
- `GET /finance/invoices` - Get invoices
- `POST /finance/invoices` - Create invoice
- `GET /finance/bills` - Get bills
- `POST /finance/bills` - Create bill
- `GET /finance/customers` - Get customers
- `GET /finance/vendors` - Get vendors
- `GET /finance/bank-accounts` - Get bank accounts
- `GET /finance/cash-flow` - Get cash flow transactions
- `GET /finance/reports/balance-sheet` - Balance sheet report
- `GET /finance/reports/income-statement` - Income statement
- `GET /finance/reports/cash-flow` - Cash flow statement

### AI Dermatology Expert
- `POST /api/ai-dermatology-expert/analyze-text` - Text-based consultation
- `POST /api/ai-dermatology-expert/analyze-image` - Image analysis
- `POST /api/ai-dermatology-expert/transcribe-audio` - Audio transcription

---

## 🗄️ Database Models

### User
```javascript
{
  username: String (unique),
  password: String (hashed),
  role: String (enum: ['admin', 'customer']),
  email: String,
  phone: String,
  address: String,
  createdAt: Date
}
```

### Product
```javascript
{
  name: String,
  category: ObjectId (ref: Category),
  image: String,
  description: String,
  price: Number,
  stockQuantity: Number,
  ingredients: [String],
  skinType: [String],
  benefits: [String],
  tags: [String],
  usage: String,
  skinConcerns: [String]
}
```

### Order
```javascript
{
  userId: ObjectId (ref: User),
  items: [{
    productId: ObjectId,
    quantity: Number,
    price: Number
  }],
  totalAmount: Number,
  status: String,
  shippingAddress: String,
  paymentMethod: String,
  createdAt: Date
}
```

### ChatConversation
```javascript
{
  sessionId: String,
  userId: ObjectId (ref: User),
  messages: [{
    role: String (enum: ['user', 'assistant']),
    content: String,
    timestamp: Date,
    messageType: String
  }],
  isActive: Boolean,
  isStaffChat: Boolean,
  assignedStaff: ObjectId (ref: User),
  lastActivity: Date
}
```

### LiveStream
```javascript
{
  title: String,
  description: String,
  videoUrl: String,
  streamUrl: String,
  thumbnailUrl: String,
  duration: Number,
  viewCount: Number,
  likes: Number,
  likedBy: [String],
  startTime: Date,
  endTime: Date,
  isActive: Boolean,
  isRecorded: Boolean,
  chatMessages: [{
    username: String,
    message: String,
    timestamp: Date
  }],
  pinnedProducts: [{
    productId: ObjectId,
    displayOrder: Number,
    isActive: Boolean
  }],
  createdBy: ObjectId (ref: User)
}
```

---

## [object Object]

#### Stream Events
- `stream_started` - Stream begins
- `stream_ended` - Stream ends
- `viewer_joined` - New viewer joins
- `viewer_left` - Viewer leaves
- `like_added` - User likes stream
- `chat_message` - New chat message

#### Chat Events
- `chat_message` - New message
- `typing_indicator` - User is typing
- `staff_assigned` - Staff takes over chat
- `chat_closed` - Chat ends

---

## 📱 Mobile Apps

### Admin App (React Native)
- **Purpose**: Manage livestreams, products, and orders on mobile
- **Key Features**:
  - Live stream broadcasting
  - Product management
  - Order tracking
  - Real-time notifications

### Customer App (React Native)
- **Purpose**: Browse products, watch livestreams, and interact with AI expert
- **Key Features**:
  - Product browsing and search
  - Shopping cart and checkout
  - Watch live streams
  - AI dermatology expert access
  - Order tracking

---

## 🛠️ Development Guidelines

### Code Structure
- **Controllers**: Handle request/response logic
- **Models**: Define database schemas
- **Routes**: Define API endpoints
- **Services**: Handle external integrations
- **Middleware**: Handle cross-cutting concerns
- **Utils**: Reusable utility functions

### Best Practices
1. Use async/await for asynchronous operations
2. Implement proper error handling
3. Validate input data
4. Use environment variables for configuration
5. Follow RESTful API conventions
6. Document API endpoints with Swagger
7. Use meaningful variable and function names
8. Keep functions small and focused

### Testing

**Backend (Jest):**
- Run all tests: `npm test`
- Watch mode: `npm run test:watch`
- Unit tests: `npm run test:unit`
- Integration tests: `npm run test:integration`
- Coverage report: `npm test` (coverage included by default)

**Frontend (Vitest):**
- Run tests: `npm run test`
- Watch mode: `npm run test:watch`
- UI mode: `npm run test:ui`
- Coverage: `npm run test -- --coverage`

---

## 🚨 Error Handling

### Common Error Codes
- `400` - Bad Request (validation error)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

### Error Response Format
```json
{
  "error": "Error message",
  "details": "Additional details if available"
}
```

---

## ⚡ Performance & Optimization

### Implemented Optimizations
1. **Database Indexing**: Indexes on frequently queried fields
2. **Redis Caching**: Multi-layer caching with semantic similarity matching
   - Exact match cache for identical queries
   - Semantic similarity cache (85% threshold) for similar queries
   - Vector-based cache lookup using embeddings
   - Automatic cache invalidation
3. **Pagination**: Limit results to prevent large data transfers
4. **Text Search**: MongoDB full-text search for product queries
5. **Vector Search**: Qdrant for semantic search in RAG
6. **Rate Limiting**: Express rate limiter to prevent abuse
7. **Compression**: Gzip compression for API responses
8. **Lazy Loading**: Redis client with lazy connection initialization
9. **Connection Pooling**: MongoDB connection pooling for better performance

### Performance Monitoring
- `backend/utils/performanceMonitor.js` - Tracks API performance metrics
- Logs execution times for AI operations
- Monitors database query performance
- Redis cache hit/miss tracking
- Semantic similarity matching performance metrics

---

## 🔒 Security Features

1. **Password Hashing**: bcryptjs with salt rounds
2. **JWT Authentication**: Secure token-based auth
3. **Secret Management**: Encrypted secret storage with AES-256-GCM
   - Centralized secret management system
   - Environment variable fallback
   - CLI tool for secret management (`npm run secrets`)
   - Automatic secret initialization
4. **CORS**: Cross-Origin Resource Sharing configured
5. **Rate Limiting**: Prevents brute force attacks
6. **Input Validation**: Express-validator for input sanitization
7. **Helmet**: Security headers middleware
8. **Payment Security**: Secure VNPay integration with HMAC-SHA512
9. **API Key Protection**: Encrypted storage for third-party API keys

---

## 📖 API Documentation

Swagger/OpenAPI documentation is available at:
```
http://localhost:3000/api-docs
```

To update API documentation:
1. Add JSDoc comments to route handlers
2. Use Swagger annotations
3. Documentation will auto-generate

---

## 🔧 Troubleshooting

**MongoDB Connection Error**
- Check MongoDB Atlas connection string
- Verify IP whitelist in MongoDB Atlas
- Ensure network connectivity

**Gemini API Rate Limit**
- Implemented exponential backoff retry logic
- Check API quota in Google Cloud Console
- Consider upgrading API tier

**Redis Connection Issues**
- Ensure Redis is running: `redis-server`
- Check Redis URL in environment variables
- Verify Redis port (default: 6379)
- Application continues to work without Redis (caching bypassed)

**VNPay Payment Errors**
- Verify VNP_TMN_CODE and VNP_HASH_SECRET
- Check VNP_RETURN_URL matches your domain
- Ensure proper HMAC-SHA512 signature generation
- Test with sandbox environment first

**Secret Management Issues**
- Initialize secrets: `npm run secrets:init`
- Check secret health: `npm run secrets:health`
- Manage secrets via CLI: `npm run secrets`
- Ensure .secrets.enc file permissions are correct

**WebSocket Connection Issues**
- Ensure WebSocket port is open
- Check firewall settings
- Verify client-side WebSocket URL

**Image Upload Failures**
- Check file size limits
- Verify upload directory permissions
- Ensure multer configuration is correct

**Agora Live Streaming Issues**
- Verify AGORA_APP_ID and AGORA_APP_CERTIFICATE
- Check Agora project settings in console
- Ensure proper token generation
- Test with Agora demo first

---

## 📝 Deployment

### Docker Support
- `backend/Dockerfile` - Backend containerization
- `frontend/Dockerfile` - Frontend containerization
- `backend/docker-compose.qdrant.yml` - Qdrant setup

### Deployment Steps
1. Build Docker images
2. Configure environment variables
3. Deploy to cloud platform (AWS, GCP, Azure, etc.)
4. Set up MongoDB Atlas
5. Configure Qdrant vector database
6. Set up email service
7. Configure API keys

---

## 📞 Support & Contact

For issues, questions, or contributions:
- Create an issue in the repository
- Contact the development team
- Check existing documentation

---

## 📄 License

This project is part of a Final Year Project (FYP) at the university.

---

## 🎯 Future Enhancements

- [ ] Advanced recommendation engine
- [ ] Machine learning for customer segmentation
- [ ] Video processing and streaming optimization
- [ ] Mobile app push notifications
- [ ] Advanced analytics and reporting
- [ ] Integration with payment gateways
- [ ] Multi-currency support
- [ ] Inventory management system
- [ ] Supplier management
- [ ] Loyalty program

---

**Last Updated**: December 2024
**Version**: 1.0.0
**Status**: Active Development

