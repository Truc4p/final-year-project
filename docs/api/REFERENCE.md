# API Reference

## Base URL

**Development**: `http://localhost:3000`
**Production**: `https://api.wrencos.com`

## Authentication

Most endpoints require authentication via JWT token.

### Headers

```
Authorization: Bearer <token>
```

Or (legacy):
```
x-auth-token: <token>
```

### Getting a Token

Send POST request to `/auth/login` with credentials.

---

## Authentication Endpoints

### Register User

**POST** `/auth/register`

Register a new user account.

**Request Body**:
```json
{
  "username": "johndoe",
  "password": "securepassword123",
  "role": "customer",
  "adminKey": "secret"  // Required only for admin role
}
```

**Response** (201):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors**:
- `400`: User already exists or invalid admin key
- `500`: Server error

---

### Login

**POST** `/auth/login`

Authenticate user and receive token.

**Request Body**:
```json
{
  "username": "johndoe",
  "password": "securepassword123"
}
```

**Response** (200):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "customer",
  "userId": "507f1f77bcf86cd799439011"
}
```

**Errors**:
- `400`: Invalid credentials
- `500`: Server error

---

## Product Endpoints

### Get All Products

**GET** `/products`

Retrieve list of products with optional filtering.

**Query Parameters**:
- `category` (ObjectId): Filter by category
- `search` (string): Search in name/description
- `minPrice` (number): Minimum price
- `maxPrice` (number): Maximum price
- `skinType` (string): Filter by skin type
- `skinConcern` (string): Filter by skin concern
- `page` (number, default: 1): Page number
- `limit` (number, default: 10): Items per page

**Response** (200):
```json
{
  "products": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Hydrating Serum",
      "category": {
        "_id": "507f1f77bcf86cd799439020",
        "name": "Serums"
      },
      "image": "/uploads/products/serum.jpg",
      "description": "Deep hydration",
      "price": 49.99,
      "stockQuantity": 150,
      "ingredients": ["hyaluronic acid", "vitamin e"],
      "skinType": ["dry", "normal"],
      "benefits": ["hydration", "plumping"],
      "skinConcerns": ["dryness", "aging"]
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "total": 50,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

### Get Product by ID

**GET** `/products/:id`

Retrieve single product details.

**Response** (200):
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "name": "Hydrating Serum",
  "category": { "name": "Serums" },
  "price": 49.99,
  "description": "Deep hydration for dry skin",
  "stockQuantity": 150,
  "ingredients": ["hyaluronic acid"],
  "skinType": ["dry", "normal"],
  "benefits": ["hydration"],
  "usage": "Apply 2-3 drops after cleansing"
}
```

**Errors**:
- `404`: Product not found

---

### Create Product

**POST** `/products`

Create a new product. **Requires admin authentication**.

**Request Body**:
```json
{
  "name": "New Serum",
  "category": "507f1f77bcf86cd799439020",
  "price": 39.99,
  "stockQuantity": 100,
  "description": "Amazing product",
  "image": "/uploads/products/new-serum.jpg",
  "ingredients": ["vitamin c"],
  "skinType": ["all"],
  "benefits": ["brightening"],
  "skinConcerns": ["dark-spots"]
}
```

**Response** (201):
```json
{
  "_id": "507f1f77bcf86cd799439099",
  "name": "New Serum",
  ...
}
```

**Errors**:
- `401`: Unauthorized
- `403`: Not admin
- `400`: Validation error

---

### Update Product

**PUT** `/products/:id`

Update product. **Requires admin authentication**.

**Request Body**: Partial product object

**Response** (200): Updated product

---

### Delete Product

**DELETE** `/products/:id`

Delete product. **Requires admin authentication**.

**Response** (200):
```json
{
  "message": "Product deleted successfully"
}
```

---

## Category Endpoints

### Get All Categories

**GET** `/categories`

**Response** (200):
```json
[
  {
    "_id": "507f1f77bcf86cd799439020",
    "name": "Serums",
    "description": "Face serums and treatments"
  }
]
```

---

### Create Category

**POST** `/categories`

**Requires admin authentication**.

**Request Body**:
```json
{
  "name": "Cleansers",
  "description": "Facial cleansers"
}
```

---

## Order Endpoints

### Get Orders

**GET** `/orders`

Get all orders (admin) or user's orders (customer).

**Requires authentication**.

**Query Parameters**:
- `status`: Filter by order status
- `page`: Page number
- `limit`: Items per page

**Response** (200):
```json
{
  "orders": [
    {
      "_id": "507f1f77bcf86cd799439030",
      "user": {
        "_id": "507f1f77bcf86cd799439011",
        "username": "johndoe"
      },
      "products": [
        {
          "productId": {
            "_id": "507f1f77bcf86cd799439012",
            "name": "Hydrating Serum"
          },
          "quantity": 2,
          "price": 49.99
        }
      ],
      "totalPrice": 109.98,
      "status": "processing",
      "paymentMethod": "cod",
      "paymentStatus": "pending",
      "orderDate": "2024-02-01T14:30:00.000Z"
    }
  ]
}
```

---

### Create Order

**POST** `/orders`

Place a new order. **Requires authentication**.

**Request Body**:
```json
{
  "products": [
    {
      "productId": "507f1f77bcf86cd799439012",
      "quantity": 2
    }
  ],
  "paymentMethod": "cod",
  "shippingLocation": "major"
}
```

**Response** (201): Created order object

---

### Update Order

**PUT** `/orders/:id`

Update order status. **Requires admin authentication**.

**Request Body**:
```json
{
  "status": "shipping",
  "paymentStatus": "paid"
}
```

---

### Cancel Order

**DELETE** `/orders/:id`

Cancel order (customer: if pending, admin: any status).

---

## Live Stream Endpoints

### Get All Streams

**GET** `/livestreams`

**Query Parameters**:
- `status`: 'active', 'past', 'all'
- `page`: Page number
- `limit`: Items per page

**Response** (200):
```json
{
  "livestreams": [
    {
      "_id": "507f1f77bcf86cd799439040",
      "title": "Product Launch",
      "description": "New serum line",
      "isActive": true,
      "startTime": "2024-02-01T18:00:00.000Z",
      "viewCount": 250,
      "likes": 45,
      "quality": "1080p",
      "streamUrl": "http://stream.example.com/live123"
    }
  ],
  "pagination": { ... }
}
```

---

### Get Active Stream

**GET** `/livestreams/active`

Get currently active stream.

**Response** (200):
```json
{
  "livestream": {
    "_id": "507f1f77bcf86cd799439040",
    "title": "Live Now!",
    "isActive": true,
    ...
  }
}
```

Or if no active stream:
```json
{
  "message": "No active livestream",
  "livestream": null
}
```

---

### Create Stream

**POST** `/livestreams`

Start a new live stream. **Requires admin authentication**.

**Request Body**:
```json
{
  "title": "Product Launch Event",
  "description": "Introducing new products",
  "quality": "1080p",
  "streamUrl": "http://stream.example.com/live456",
  "categories": ["Product Launch"],
  "tags": ["serum", "skincare"]
}
```

**Response** (201):
```json
{
  "message": "Livestream created successfully",
  "livestream": { ... }
}
```

**Errors**:
- `400`: Another stream is already active

---

### Stop Stream

**PUT** `/livestreams/:id/stop`

Stop active stream. **Requires admin authentication**.

**Request Body**:
```json
{
  "videoUrl": "/uploads/livestreams/recording-123.mp4",
  "thumbnailUrl": "/uploads/thumbnails/thumb-123.jpg",
  "maxViewers": 300,
  "viewCount": 250,
  "likes": 45
}
```

---

### Pin Product

**POST** `/livestreams/:id/pin-product`

Pin a product to stream. **Requires admin authentication**.

**Request Body**:
```json
{
  "productId": "507f1f77bcf86cd799439012",
  "displayOrder": 1
}
```

**Response** (200):
```json
{
  "message": "Product pinned successfully",
  "pinnedProducts": [ ... ]
}
```

---

### Unpin Product

**DELETE** `/livestreams/:id/unpin-product/:productId`

Unpin product from stream. **Requires admin authentication**.

---

### Get Pinned Products

**GET** `/livestreams/:id/pinned-products`

Get all pinned products for a stream.

**Response** (200):
```json
{
  "pinnedProducts": [
    {
      "productId": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Hydrating Serum",
        "price": 49.99,
        "image": "/uploads/products/serum.jpg"
      },
      "displayOrder": 1,
      "pinnedAt": "2024-02-01T18:10:00.000Z",
      "isActive": true
    }
  ]
}
```

---

## Chat Endpoints

### Get FAQs

**GET** `/chat/faqs`

Get list of frequently asked questions.

**Query Parameters**:
- `category`: Filter by category
- `limit`: Number of FAQs to return

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439060",
      "question": "What is your return policy?",
      "answer": "We accept returns within 30 days...",
      "category": "return",
      "priority": 10
    }
  ]
}
```

---

### Chat with AI

**POST** `/chat/ai`

Send message to AI assistant.

**Request Body**:
```json
{
  "message": "I need a moisturizer for dry skin",
  "sessionId": "sess-uuid-12345"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "message": "I recommend our Hydrating Serum...",
    "sessionId": "sess-uuid-12345",
    "intent": "product_recommendation",
    "confidence": 0.95,
    "relatedProducts": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Hydrating Serum",
        "price": 49.99
      }
    ],
    "relatedFAQs": []
  }
}
```

---

### Get Conversation History

**GET** `/chat/history/:sessionId`

Get chat conversation history.

**Response** (200):
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "role": "user",
        "content": "I need help",
        "timestamp": "2024-02-01T10:00:00.000Z",
        "messageType": "text"
      },
      {
        "role": "assistant",
        "content": "How can I help you?",
        "timestamp": "2024-02-01T10:00:02.000Z",
        "messageType": "ai"
      }
    ],
    "conversationState": {
      "isStaffChat": false,
      "waitingForStaff": false,
      "isActive": true
    }
  }
}
```

---

### Connect to Staff

**POST** `/chat/connect-staff`

Escalate conversation to human staff. **Requires authentication**.

**Request Body**:
```json
{
  "sessionId": "sess-uuid-12345"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Connected to staff chat"
}
```

---

### Send Message to Staff (Customer)

**POST** `/chat/send-message`

Customer sends message to staff. **Requires authentication**.

**Request Body**:
```json
{
  "sessionId": "sess-uuid-12345",
  "message": "I need help with my order"
}
```

---

### Get Active Chats (Admin)

**GET** `/chat/admin/active-chats`

Get all active customer support chats. **Requires admin authentication**.

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "sessionId": "sess-uuid-12345",
      "customerName": "John Doe",
      "customerEmail": "john@example.com",
      "customerId": "507f1f77bcf86cd799439011",
      "lastMessage": "I need help...",
      "lastActivity": "2024-02-01T10:00:00.000Z",
      "unreadCount": 2,
      "waitingForStaff": true
    }
  ]
}
```

---

### Staff Reply

**POST** `/chat/staff/reply`

Staff sends reply to customer. **Requires admin authentication**.

**Request Body**:
```json
{
  "sessionId": "sess-uuid-12345",
  "message": "I'll help you right away!"
}
```

---

## Email Marketing Endpoints

### Subscribe to Newsletter

**POST** `/newsletter/subscribe`

Subscribe email to newsletter.

**Request Body**:
```json
{
  "email": "customer@example.com",
  "name": "John Doe",
  "source": "website",
  "preferences": {
    "newProducts": true,
    "promotions": true,
    "newsletter": true
  }
}
```

**Response** (201):
```json
{
  "success": true,
  "message": "Subscribed successfully",
  "subscriber": { ... }
}
```

---

### Unsubscribe

**POST** `/newsletter/unsubscribe`

Unsubscribe from newsletter.

**Request Body**:
```json
{
  "email": "customer@example.com"
}
```

Or via token:
**GET** `/newsletter/unsubscribe/:token`

---

### Get Subscribers (Admin)

**GET** `/newsletter/subscribers`

Get all subscribers. **Requires admin authentication**.

**Query Parameters**:
- `isActive`: Filter active/inactive
- `source`: Filter by source
- `page`, `limit`: Pagination

---

### Create Email Campaign

**POST** `/email-campaigns`

Create email campaign. **Requires admin authentication**.

**Request Body**:
```json
{
  "name": "February Newsletter",
  "subject": "New Products This Month",
  "content": "Check out our new arrivals...",
  "htmlContent": "<html>...</html>",
  "type": "newsletter",
  "targetAudience": "all",
  "scheduledAt": "2024-02-01T09:00:00.000Z"
}
```

---

### Send Campaign

**POST** `/email-campaigns/:id/send`

Send email campaign. **Requires admin authentication**.

**Response** (200):
```json
{
  "success": true,
  "message": "Campaign sent successfully",
  "stats": {
    "totalSent": 985,
    "totalFailed": 15
  }
}
```

---

### Get Campaign Analytics

**GET** `/email-campaigns/:id/analytics`

Get campaign performance analytics. **Requires admin authentication**.

**Response** (200):
```json
{
  "analytics": {
    "totalRecipients": 1000,
    "emailsSent": 1000,
    "emailsDelivered": 985,
    "emailsOpened": 450,
    "emailsClicked": 120,
    "unsubscribes": 5,
    "openRate": "45.69%",
    "clickRate": "12.18%"
  }
}
```

---

## Analytics Endpoints

### Get Sales Analytics

**GET** `/analytics/sales`

Get sales statistics. **Requires admin authentication**.

**Query Parameters**:
- `period`: 'daily', 'weekly', 'monthly'
- `startDate`, `endDate`: Date range

**Response** (200):
```json
{
  "totalSales": 15000,
  "totalOrders": 150,
  "averageOrderValue": 100,
  "salesByDay": [
    { "date": "2024-02-01", "sales": 1500, "orders": 15 }
  ],
  "topProducts": [
    {
      "product": "Hydrating Serum",
      "totalSales": 5000,
      "unitsSold": 100
    }
  ]
}
```

---

## Finance Endpoints

### Get Cash Flow Transactions

**GET** `/cashflow/transactions`

Get financial transactions. **Requires admin authentication**.

**Query Parameters**:
- `type`: 'income', 'expense', 'all'
- `startDate`, `endDate`: Date range
- `category`: Filter by category

---

### Add Transaction

**POST** `/cashflow/transactions`

Add income or expense transaction. **Requires admin authentication**.

**Request Body**:
```json
{
  "type": "expense",
  "amount": 500,
  "category": "Marketing",
  "description": "Facebook Ads",
  "date": "2024-02-01",
  "paymentMethod": "Credit Card"
}
```

---

### Get Financial Summary

**GET** `/cashflow/summary`

Get financial overview. **Requires admin authentication**.

**Response** (200):
```json
{
  "totalIncome": 50000,
  "totalExpense": 20000,
  "netProfit": 30000,
  "profitMargin": "60%"
}
```

---

## HR Endpoints

### Get Employees

**GET** `/hr/employees`

Get all employees. **Requires admin authentication**.

---

### Add Employee

**POST** `/hr/employees`

Add new employee. **Requires admin authentication**.

**Request Body**:
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@wrencos.com",
  "phone": "+1234567890",
  "position": "Sales Manager",
  "department": "Sales",
  "hireDate": "2024-02-01",
  "salary": 50000
}
```

---

## Error Responses

### Standard Error Format

```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information"
}
```

### HTTP Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error, missing required fields)
- `401`: Unauthorized (no token or invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `429`: Too Many Requests (rate limit exceeded)
- `500`: Internal Server Error

---

## Rate Limiting

**Limit**: 1000 requests per 15 minutes per IP

**Response when exceeded**:
```json
{
  "message": "Too many requests from this IP, please try again after 15 minutes"
}
```

Status Code: `429`

---

## Pagination

Endpoints that return lists support pagination:

**Query Parameters**:
- `page` (default: 1): Page number
- `limit` (default: 10): Items per page

**Response Structure**:
```json
{
  "data": [ ... ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "total": 50,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## File Uploads

### Upload Product Image

**POST** `/uploads/product-image`

**Content-Type**: `multipart/form-data`

**Form Data**:
- `image`: Image file (jpg, png, gif)

**Response** (200):
```json
{
  "url": "/uploads/products/image-123.jpg"
}
```

---

## API Versioning

Current version: v1 (no prefix)

Future versions will use: `/api/v2/...`

---

## Support

For API support, contact: support@wrencos.com

Documentation last updated: February 2024
