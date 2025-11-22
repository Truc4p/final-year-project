# Wrencos - AI-Powered Beauty & Skincare E-Commerce Platform

## 📋 Project Overview

**Wrencos** is a comprehensive, multi-platform AI-powered e-commerce and customer engagement platform specifically designed for the beauty and skincare industry. The platform combines traditional e-commerce functionality with advanced AI features including a virtual dermatology expert, live streaming capabilities, and intelligent customer support.

### Key Features
- [object Object] Platform** - Product catalog, shopping cart, checkout, and order management
- 🤖 **AI Dermatology Expert** - Skin analysis, product recommendations, and skincare advice powered by Google Gemini AI
- [object Object]-time product demonstrations and customer engagement
- 💬 **AI Chat Support** - Intelligent customer support with RAG (Retrieval-Augmented Generation)
- [object Object]** - Campaign management, templates, segmentation, and analytics
- [object Object] insights and performance metrics
- [object Object]d human resources management
- [object Object] Management** - Cash flow tracking and financial analytics
- [object Object]** - Native React Native apps for both admin and customer platforms
- [object Object] Support** - Automatic language detection and translation

---

## [object Object]

### Technology Stack

#### Backend
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB (Atlas)
- **AI/ML**: Google Generative AI (Gemini 2.0 Flash)
- **Vector Database**: Qdrant (for RAG)
- **Real-Time**: WebSocket (ws library)
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Email**: Nodemailer
- **API Documentation**: Swagger/OpenAPI

#### Frontend (Web)
- **Framework**: Vue 3
- **Build Tool**: Vite
- **Routing**: Vue Router 4
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Charts**: Chart.js with Vue-ChartJS
- **Internationalization**: Vue-i18n

#### Mobile Apps
- **Framework**: React Native with Expo
- **Navigation**: React Navigation
- **State Management**: AsyncStorage
- **Real-Time Communication**: Agora SDK (for live streaming)
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
│   │   ├── emailService.js           # Email sending service
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

# Qdrant Vector Database
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=your_qdrant_api_key

# Email Service
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

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
- `CashFlowTransaction` - Financial transactions
- `BusinessExpense` - Expense tracking

**Features**:
- Cash flow tracking
- Expense management
- Financial reporting
- Budget analysis

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
- Run tests: `npm test`
- Test coverage: `npm run coverage`

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

##[object Object] Implemented Optimizations
1. **Database Indexing**: Indexes on frequently queried fields
2. **Caching**: In-memory caching for frequently accessed data
3. **Pagination**: Limit results to prevent large data transfers
4. **Text Search**: MongoDB full-text search for product queries
5. **Vector Search**: Qdrant for semantic search in RAG
6. **Rate Limiting**: Express rate limiter to prevent abuse
7. **Compression**: Gzip compression for API responses

### Performance Monitoring
- `backend/utils/performanceMonitor.js` - Tracks API performance metrics
- Logs execution times for AI operations
- Monitors database query performance

---

## 🔒 Security Features

1. **Password Hashing**: bcryptjs with salt rounds
2. **JWT Authentication**: Secure token-based auth
3. **CORS**: Cross-Origin Resource Sharing configured
4. **Rate Limiting**: Prevents brute force attacks
5. **Input Validation**: Express-validator for input sanitization
6. **Helmet**: Security headers middleware
7. **Environment Variables**: Sensitive data in .env files

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

## [object Object]

**MongoDB Connection Error**
- Check MongoDB Atlas connection string
- Verify IP whitelist in MongoDB Atlas
- Ensure network connectivity

**Gemini API Rate Limit**
- Implemented exponential backoff retry logic
- Check API quota in Google Cloud Console
- Consider upgrading API tier

**WebSocket Connection Issues**
- Ensure WebSocket port is open
- Check firewall settings
- Verify client-side WebSocket URL

**Image Upload Failures**
- Check file size limits
- Verify upload directory permissions
- Ensure multer configuration is correct

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

**Last Updated**: November 2024
**Version**: 1.0.0
**Status**: Active Development

