# Backend Documentation

## Architecture Overview

The backend is built using Node.js with Express.js framework, following a modular MVC (Model-View-Controller) architecture with additional service layers.

## Directory Structure

```
backend/
├── app.js                 # Express app configuration
├── server.js              # Server entry point
├── db.js                  # Database connection
├── swagger.js             # Swagger/OpenAPI configuration
├── websocket.js           # WebSocket server implementation
├── controllers/           # Request handlers
│   ├── analytics/
│   ├── auth/
│   ├── communication/
│   ├── ecommerce/
│   ├── finance/
│   ├── hr/
│   ├── livestream/
│   └── marketing/
├── models/               # Mongoose schemas
│   ├── auth/
│   ├── communication/
│   ├── core/
│   ├── ecommerce/
│   ├── finance/
│   ├── hr/
│   ├── livestream/
│   └── marketing/
├── routes/               # API route definitions
│   ├── analytics/
│   ├── auth/
│   ├── communication/
│   ├── core/
│   ├── ecommerce/
│   ├── finance/
│   ├── hr/
│   ├── livestream/
│   └── marketing/
├── middleware/           # Custom middleware
│   ├── auth.js          # JWT authentication
│   ├── optionalAuth.js  # Optional authentication
│   └── role.js          # Role-based access control
├── services/            # Business logic services
│   └── emailService.js  # Email sending service
├── seed-data/           # Database seed files
└── uploads/             # File upload storage
    ├── hr-documents/
    ├── livestreams/
    └── thumbnails/
```

## Core Components

### 1. Server Configuration (server.js)

**Purpose**: Entry point for the application, initializes HTTP server and WebSocket server.

**Key Features**:
- Loads environment variables from `.env`
- Starts HTTP server on specified port
- Initializes WebSocket manager for real-time communication
- Logs server status and configuration

```javascript
// Server initialization
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
});

// WebSocket initialization
const wsManager = new WebSocketManager(server);
app.locals.wsManager = wsManager;
```

### 2. Express App (app.js)

**Purpose**: Configures Express application with middleware and routes.

**Middleware Stack**:
1. **CORS**: Enable cross-origin requests
2. **Rate Limiting**: Prevent abuse (1000 requests per 15 minutes per IP)
3. **Body Parser**: Parse JSON request bodies
4. **Static Files**: Serve uploaded files from `/uploads` directory
5. **Route Handlers**: Mount API routes
6. **Swagger UI**: API documentation at `/api-docs`

**Security Features**:
- Rate limiting to prevent DDoS attacks
- JWT-based authentication
- Role-based access control
- Input validation with express-validator

### 3. Database Connection (db.js)

**Purpose**: Establishes connection to MongoDB Atlas.

**Configuration**:
- Uses Mongoose ODM
- Connection string stored in environment variable
- Auto-retry on connection failure
- Graceful error handling

```javascript
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};
```

## API Modules

### Authentication Module

**Location**: `controllers/auth/`, `models/auth/`, `routes/auth/`

**Features**:
- User registration with role selection (admin/customer)
- Admin registration requires secret key
- JWT token generation (12-hour expiry)
- Password hashing with bcrypt
- Login with username/password

**Endpoints**:
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and receive JWT token

**Models**:
- **User**: Stores user credentials and profile information

### E-Commerce Module

**Location**: `controllers/ecommerce/`, `models/ecommerce/`, `routes/ecommerce/`

**Features**:
- Product catalog management
- Category organization
- Shopping cart (client-side)
- Order processing
- Payment integration (COD & Online)
- Inventory tracking

**Endpoints**:

**Products**:
- `GET /products` - List all products (with pagination, search, filters)
- `GET /products/:id` - Get product details
- `POST /products` - Create product (Admin only)
- `PUT /products/:id` - Update product (Admin only)
- `DELETE /products/:id` - Delete product (Admin only)

**Categories**:
- `GET /categories` - List all categories
- `POST /categories` - Create category (Admin only)
- `PUT /categories/:id` - Update category (Admin only)
- `DELETE /categories/:id` - Delete category (Admin only)

**Orders**:
- `GET /orders` - List orders (Admin: all, Customer: own)
- `GET /orders/:id` - Get order details
- `POST /orders` - Create new order
- `PUT /orders/:id` - Update order status (Admin only)
- `DELETE /orders/:id` - Cancel order

**Models**:
- **Product**: Product details with AI-enhanced fields (skinType, ingredients, benefits, etc.)
- **Category**: Product categories
- **Order**: Customer orders with products, pricing, and status

### Live Streaming Module

**Location**: `controllers/livestream/`, `models/livestream/`, `routes/livestream/`

**Features**:
- Real-time video streaming
- Live chat with WebSocket
- Product pinning during streams
- Viewer count tracking
- Like/unlike functionality
- Stream recording
- Past stream playback

**Endpoints**:
- `GET /livestreams` - List streams (active/past/all)
- `GET /livestreams/active` - Get current active stream
- `GET /livestreams/:id` - Get stream details
- `POST /livestreams` - Create new stream (Admin only)
- `PUT /livestreams/:id/stop` - Stop active stream (Admin only)
- `POST /livestreams/:id/pin-product` - Pin product to stream
- `DELETE /livestreams/:id/unpin-product/:productId` - Unpin product
- `DELETE /livestreams/:id` - Delete stream and files

**WebSocket Events**:
- `stream_started` - Broadcast stream start
- `stream_stopped` - Broadcast stream end
- `stream_update` - Update viewer count, likes
- `chat_message` - Send/receive chat messages
- `toggle_like` - Like/unlike stream
- `pinned_products_updated` - Update pinned products

**Models**:
- **LiveStream**: Stream metadata, chat messages, analytics, pinned products

### Communication Module (AI Chat)

**Location**: `controllers/communication/`, `models/communication/`, `routes/communication/`

**Features**:
- **Dual-Mode Chat**:
  1. FAQ-based (menu-driven)
  2. AI-powered (Gemini AI)
- Product recommendations based on skin type/concerns
- Conversation history
- Staff escalation for complex queries
- WebSocket for real-time messaging

**Endpoints**:

**Customer Chat**:
- `GET /chat/faqs` - Get FAQ list
- `GET /chat/faqs/:faqId` - Get specific FAQ answer
- `POST /chat/ai` - Send message to AI assistant
- `GET /chat/history/:sessionId` - Get conversation history
- `DELETE /chat/clear/:sessionId` - Clear conversation
- `POST /chat/connect-staff` - Escalate to human staff
- `POST /chat/send-message` - Send message to staff
- `GET /chat/staff-messages/:sessionId` - Poll for staff replies

**Admin/Staff Chat**:
- `GET /chat/admin/active-chats` - List active customer chats
- `GET /chat/admin/messages/:sessionId` - Get chat messages
- `POST /chat/staff/reply` - Reply to customer

**AI Integration**:
- Uses Google Gemini AI (gemini-2.0-flash model)
- RAG (Retrieval-Augmented Generation) approach
- Searches products and FAQs for relevant context
- Intent classification
- Personalized responses based on:
  - Skin type (oily, dry, combination, sensitive, normal)
  - Skin concerns (acne, aging, dark spots, etc.)
  - Product ingredients and benefits

**Models**:
- **ChatConversation**: Stores conversation history and metadata
- **FAQ**: Predefined questions and answers

### Marketing Module

**Location**: `controllers/marketing/`, `models/marketing/`, `routes/marketing/`

**Features**:
- Email campaign management
- Email templates
- Subscriber management
- Audience segmentation
- Campaign analytics
- Bulk email sending
- Unsubscribe handling

**Endpoints**:

**Newsletter Subscriptions**:
- `POST /newsletter/subscribe` - Subscribe to newsletter
- `POST /newsletter/unsubscribe` - Unsubscribe
- `GET /newsletter/subscribers` - List subscribers (Admin)

**Email Campaigns**:
- `GET /email-campaigns` - List campaigns
- `POST /email-campaigns` - Create campaign
- `PUT /email-campaigns/:id` - Update campaign
- `POST /email-campaigns/:id/send` - Send campaign
- `GET /email-campaigns/:id/analytics` - Get campaign analytics

**Email Templates**:
- `GET /email-templates` - List templates
- `POST /email-templates` - Create template
- `PUT /email-templates/:id` - Update template
- `DELETE /email-templates/:id` - Delete template

**Models**:
- **NewsletterSubscription**: Subscriber information and preferences
- **EmailCampaign**: Campaign details and analytics
- **EmailTemplate**: Reusable email templates
- **EmailSegment**: Audience segmentation rules
- **EmailAnalytics**: Detailed tracking (opens, clicks, etc.)

### Analytics Module

**Location**: `controllers/analytics/`, `routes/analytics/`

**Features**:
- Sales analytics
- Revenue tracking
- Customer insights
- Product performance
- Order statistics
- Time-based reporting (daily, weekly, monthly)

**Endpoints**:
- `GET /analytics/sales` - Get sales analytics
- `GET /analytics/revenue` - Get revenue analytics
- `GET /analytics/customers` - Get customer statistics
- `GET /analytics/products` - Get product performance

### Finance Module

**Location**: `controllers/finance/`, `models/finance/`, `routes/finance/`

**Features**:
- Cash flow tracking
- Business expense management
- Revenue vs. expense reports
- Recurring expense tracking
- Expense categorization

**Endpoints**:
- `GET /cashflow/transactions` - List transactions
- `POST /cashflow/transactions` - Add transaction
- `GET /cashflow/summary` - Get financial summary
- `GET /cashflow/expenses` - List expenses
- `POST /cashflow/expenses` - Add expense

**Models**:
- **CashFlowTransaction**: Income and expense transactions
- **BusinessExpense**: Detailed expense records with categorization

### HR Module

**Location**: `controllers/hr/`, `models/hr/`, `routes/hr/`

**Features**:
- Employee records management
- Document upload and storage
- Employee information tracking

**Endpoints**:
- `GET /hr/employees` - List employees
- `POST /hr/employees` - Add employee
- `PUT /hr/employees/:id` - Update employee
- `DELETE /hr/employees/:id` - Remove employee

**Models**:
- **Employee**: Employee information and documents

## Middleware

### Authentication Middleware (middleware/auth.js)

**Purpose**: Verify JWT tokens and protect routes.

**Features**:
- Supports both `Authorization: Bearer <token>` and `x-auth-token` headers
- Token verification with JWT secret
- User information extraction from token
- Reduced logging for polling endpoints

**Usage**:
```javascript
const auth = require('./middleware/auth');

router.get('/protected', auth, (req, res) => {
  // req.user contains decoded token data
  res.json({ user: req.user });
});
```

### Optional Auth Middleware (middleware/optionalAuth.js)

**Purpose**: Allow both authenticated and anonymous access.

**Usage**: For endpoints that work differently for logged-in vs. guest users.

### Role Middleware (middleware/role.js)

**Purpose**: Restrict routes based on user role.

**Usage**:
```javascript
const { requireAdmin } = require('./middleware/role');

router.post('/admin-only', auth, requireAdmin, (req, res) => {
  // Only admins can access
});
```

## Services

### Email Service (services/emailService.js)

**Purpose**: Handle all email sending operations.

**Features**:
- Gmail SMTP integration
- Bulk email sending with batching
- Email personalization with variables
- Rate limiting to avoid Gmail restrictions
- HTML to text conversion
- Unsubscribe link generation

**Variables Supported**:
- `{{subscriber_name}}` - Recipient name
- `{{subscriber_email}}` - Recipient email
- `{{company_name}}` - Company name
- `{{current_date}}` - Current date
- `{{unsubscribe_url}}` - Unsubscribe link

**Methods**:
- `sendEmail(to, subject, htmlContent, textContent)` - Send single email
- `sendBulkEmails(recipients, subject, htmlContent, textContent)` - Send to multiple recipients
- `sendCampaignEmails(campaign, recipients)` - Send campaign emails
- `replaceVariables(content, recipient)` - Replace template variables

## WebSocket Server (websocket.js)

**Purpose**: Enable real-time bidirectional communication.

**Features**:
- Customer and admin connections
- Live stream updates (viewer count, likes)
- Chat messages (customer support & live stream chat)
- WebRTC signaling for video streaming
- Session-based customer tracking
- User-based admin tracking

**Connection Types**:
1. **Customer Connections**: Tracked by sessionId
2. **Admin Connections**: Tracked by userId

**Message Types**:

**Registration**:
- `register` - Register customer connection
- `register_admin` - Register admin connection

**Chat**:
- `staff_message` - Staff sends message to customer
- `customer_message` - Customer sends message to staff

**Live Stream**:
- `stream_started` - Notify stream start
- `stream_stopped` - Notify stream end
- `stream_update` - Update stream metrics
- `toggle_like` - Like/unlike stream
- `chat_message` - Live stream chat message
- `pinned_products_updated` - Update pinned products

**WebRTC Signaling**:
- `webrtc_register` - Register peer for WebRTC
- `webrtc_offer` - Send WebRTC offer
- `webrtc_answer` - Send WebRTC answer
- `webrtc_ice_candidate` - Exchange ICE candidates
- `webrtc_broadcast_start` - Start broadcasting
- `webrtc_broadcast_stop` - Stop broadcasting

**Methods**:
- `sendToSession(sessionId, message)` - Send to specific customer
- `broadcastCustomerMessage(sessionId, message)` - Notify admins of customer message
- `sendStaffReply(sessionId, content)` - Send staff reply to customer
- `broadcast(message)` - Send to all connections
- `updateViewerCount()` - Update and broadcast viewer count
- `handleToggleLike(ws, data)` - Handle like toggle with deduplication

## Swagger Documentation

**Location**: `swagger.js`, Available at `/api-docs`

**Features**:
- OpenAPI 3.0 specification
- Interactive API testing
- Request/response examples
- Authentication documentation
- Model schemas

**Access**: http://localhost:3000/api-docs

## File Uploads

**Configuration**: Uses Multer middleware

**Storage Locations**:
- `uploads/hr-documents/` - Employee documents
- `uploads/livestreams/` - Recorded video files
- `uploads/thumbnails/` - Stream thumbnails
- `uploads/` - Product images and other files

**File Type Restrictions**:
- Videos: mp4, webm, ogg, avi, mov (500MB limit)
- Images: jpg, jpeg, png, gif
- Documents: pdf, doc, docx

## Error Handling

**Global Error Handler**:
```javascript
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});
```

**Common HTTP Status Codes**:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Performance Optimizations

1. **Database Indexing**: Critical fields indexed for faster queries
2. **Pagination**: Large datasets returned with pagination
3. **Caching**: Static files served efficiently
4. **Connection Pooling**: MongoDB connection pooling
5. **Rate Limiting**: Prevents API abuse
6. **WebSocket**: Real-time updates without polling

## Security Best Practices

1. **Authentication**: JWT tokens with expiry
2. **Password Hashing**: bcrypt with salt
3. **Input Validation**: express-validator
4. **CORS**: Configured for specific origins
5. **Rate Limiting**: DDoS protection
6. **File Upload Validation**: Type and size restrictions
7. **SQL Injection Prevention**: Mongoose ODM
8. **XSS Prevention**: Input sanitization

## Environment Variables

Required variables in `.env`:

```env
# Database
MONGODB_URI=mongodb+srv://...

# Authentication
JWT_SECRET=secret

# AI Service
GEMINI_API_KEY=your_api_key

# Email Service
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_app_password
COMPANY_NAME=Wrencos

# URLs
FRONTEND_URL=http://localhost:5173

# Server
PORT=3000
```

## Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## Deployment Checklist

- [ ] Set production MongoDB URI
- [ ] Set strong JWT_SECRET
- [ ] Configure production email credentials
- [ ] Set FRONTEND_URL to production domain
- [ ] Enable HTTPS
- [ ] Configure CORS for production domain
- [ ] Set appropriate rate limits
- [ ] Enable error logging service
- [ ] Set up monitoring
- [ ] Configure backup strategy
- [ ] Review file upload limits
- [ ] Set NODE_ENV=production

## API Rate Limits

- **Global**: 1000 requests per 15 minutes per IP
- **Email Sending**: Batched with 1-second delay between batches
- **WebSocket**: No explicit limit, managed by connection count

## Database Backup

Recommended: Daily automated backups using MongoDB Atlas backup feature.

## Monitoring & Logging

- Server logs to console (consider Winston for production)
- WebSocket connection logs
- Email sending logs
- Error stack traces
- Request logging with Morgan (commented out, can be enabled)

## Future Enhancements

- [ ] Redis caching layer
- [ ] GraphQL API
- [ ] Rate limiting per user
- [ ] Advanced analytics with aggregation pipelines
- [ ] Webhook support
- [ ] Multi-language support in backend
- [ ] Advanced search with Elasticsearch
- [ ] Payment gateway integration (Stripe, PayPal)
- [ ] SMS notifications
- [ ] Push notifications
- [ ] Two-factor authentication
