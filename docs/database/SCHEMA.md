# Database Schema Documentation

## Overview

Wrencos uses MongoDB as the primary database with Mongoose ODM for schema definition and validation.

**Database**: MongoDB Atlas
**ODM**: Mongoose
**Connection**: Cloud-hosted (Atlas)

## Collections

### 1. Users

**Collection Name**: `users`

**Purpose**: Store user accounts for both customers and administrators.

**Schema**:
```javascript
{
  username: String (required, unique),
  password: String (required, hashed with bcrypt),
  role: String (enum: ['admin', 'customer'], default: 'customer'),
  email: String (indexed),
  phone: String,
  address: String,
  createdAt: Date (auto-generated)
}
```

**Indexes**:
- `username`: Unique index
- `email`: Regular index for search

**Methods**:
- `matchPassword(password)`: Compare plain password with hashed password

**Hooks**:
- `pre('save')`: Hash password before saving if modified

**Sample Document**:
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "username": "johndoe",
  "password": "$2a$10$...",
  "role": "customer",
  "email": "john@example.com",
  "phone": "+1234567890",
  "address": "123 Main St",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

---

### 2. Products

**Collection Name**: `products`

**Purpose**: Store product catalog with AI-enhanced metadata for recommendations.

**Schema**:
```javascript
{
  name: String (required),
  category: ObjectId (ref: 'Category', required),
  image: String (URL/path),
  description: String,
  price: Number (required),
  stockQuantity: Number (required, default: 0),
  
  // AI-Enhanced Fields
  ingredients: [String] (lowercase),
  skinType: [String] (enum: ['oily', 'dry', 'combination', 'sensitive', 'normal', 'all']),
  benefits: [String] (lowercase),
  tags: [String] (lowercase),
  usage: String,
  skinConcerns: [String] (enum: ['acne', 'aging', 'dark-spots', 'wrinkles', 'dryness', 
                                   'sensitivity', 'dullness', 'pores', 'uneven-tone'])
}
```

**Indexes**:
- Text index on: `name`, `description`, `ingredients`, `benefits`, `tags`, `usage`
- Regular index on: `category`

**Sample Document**:
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "name": "Hydrating Serum",
  "category": "507f1f77bcf86cd799439020",
  "image": "/uploads/products/serum.jpg",
  "description": "Deep hydration for dry skin",
  "price": 49.99,
  "stockQuantity": 150,
  "ingredients": ["hyaluronic acid", "vitamin e", "glycerin"],
  "skinType": ["dry", "normal", "combination"],
  "benefits": ["hydration", "plumping", "anti-aging"],
  "tags": ["serum", "moisturizer", "hydrating"],
  "usage": "Apply 2-3 drops after cleansing",
  "skinConcerns": ["dryness", "aging", "dullness"]
}
```

---

### 3. Categories

**Collection Name**: `categories`

**Purpose**: Organize products into categories.

**Schema**:
```javascript
{
  name: String (required),
  description: String,
  createdAt: Date (auto-generated)
}
```

**Sample Document**:
```json
{
  "_id": "507f1f77bcf86cd799439020",
  "name": "Serums",
  "description": "Face serums and treatments",
  "createdAt": "2024-01-10T09:00:00.000Z"
}
```

---

### 4. Orders

**Collection Name**: `orders`

**Purpose**: Store customer orders and transaction history.

**Schema**:
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
  orderDate: Date (default: now),
  status: String (enum: ['pending', 'processing', 'shipping', 'completed', 'cancelled'], 
                  default: 'processing'),
  totalPrice: Number (required, default: 0),
  subtotal: Number (default: 0),
  tax: Number (default: 0),
  taxRate: Number (default: 0),
  shippingFee: Number (default: 0),
  shippingLocation: String (enum: ['major', 'other'])
}
```

**Indexes**:
- `user`: For user order lookup
- `orderDate`: For date-based queries
- `status`: For filtering by order status

**Sample Document**:
```json
{
  "_id": "507f1f77bcf86cd799439030",
  "user": "507f1f77bcf86cd799439011",
  "products": [
    {
      "productId": "507f1f77bcf86cd799439012",
      "quantity": 2,
      "price": 49.99
    }
  ],
  "paymentMethod": "cod",
  "paymentStatus": "pending",
  "orderDate": "2024-02-01T14:30:00.000Z",
  "status": "processing",
  "totalPrice": 109.98,
  "subtotal": 99.98,
  "tax": 5.00,
  "taxRate": 0.05,
  "shippingFee": 5.00,
  "shippingLocation": "major"
}
```

---

### 5. LiveStreams

**Collection Name**: `livestreams`

**Purpose**: Store live streaming sessions with analytics and chat history.

**Schema**:
```javascript
{
  title: String (required),
  description: String,
  videoUrl: String (for recorded playback),
  streamUrl: String (for live streaming),
  thumbnailUrl: String,
  duration: Number (in seconds, default: 0),
  viewCount: Number (default: 0),
  likes: Number (default: 0),
  likedBy: [String] (user IDs or session IDs, indexed),
  startTime: Date,
  endTime: Date,
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
  categories: [String],
  tags: [String],
  createdBy: ObjectId (ref: 'User'),
  pinnedProducts: [{
    productId: ObjectId (ref: 'Product', required),
    pinnedAt: Date (default: now),
    displayOrder: Number (default: 0),
    isActive: Boolean (default: true)
  }],
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `isActive`: For finding active stream
- `createdAt`: For sorting by date
- `viewCount`: For popular streams
- `isRecorded`: For filtering recorded streams
- `likedBy`: For tracking user likes

**Virtuals**:
- `formattedDuration`: Returns duration as "HH:MM:SS" or "MM:SS"

**Methods**:
- `incrementViewCount()`: Increment view count
- `addChatMessage(username, message, isAdmin)`: Add chat message

**Static Methods**:
- `getActiveStream()`: Get currently active stream
- `getPastStreams(limit, skip)`: Get recorded streams

**Sample Document**:
```json
{
  "_id": "507f1f77bcf86cd799439040",
  "title": "New Product Launch",
  "description": "Introducing our new serum line",
  "streamUrl": "http://stream.example.com/live123",
  "videoUrl": "/uploads/livestreams/recording-123.mp4",
  "thumbnailUrl": "/uploads/thumbnails/thumb-123.jpg",
  "duration": 3600,
  "viewCount": 250,
  "likes": 45,
  "likedBy": ["user123", "session456"],
  "startTime": "2024-02-01T18:00:00.000Z",
  "endTime": "2024-02-01T19:00:00.000Z",
  "quality": "1080p",
  "isActive": false,
  "isRecorded": true,
  "chatMessages": [
    {
      "username": "customer1",
      "message": "Looks great!",
      "timestamp": "2024-02-01T18:05:00.000Z",
      "isAdmin": false
    }
  ],
  "maxViewers": 300,
  "categories": ["Product Launch"],
  "tags": ["serum", "skincare"],
  "createdBy": "507f1f77bcf86cd799439011",
  "pinnedProducts": [
    {
      "productId": "507f1f77bcf86cd799439012",
      "pinnedAt": "2024-02-01T18:10:00.000Z",
      "displayOrder": 1,
      "isActive": true
    }
  ]
}
```

---

### 6. ChatConversations

**Collection Name**: `chatconversations`

**Purpose**: Store customer chat conversations (both AI and staff).

**Schema**:
```javascript
{
  sessionId: String (required, unique, indexed),
  userId: ObjectId (ref: 'User'),
  messages: [{
    role: String (enum: ['user', 'assistant'], required),
    content: String (required),
    messageType: String (enum: ['text', 'predefined', 'ai', 'staff'], default: 'text'),
    timestamp: Date (default: now),
    metadata: {
      intent: String,
      confidence: Number,
      faqId: ObjectId (ref: 'FAQ'),
      retrievedProducts: [ObjectId] (ref: 'Product')
    }
  }],
  isStaffChat: Boolean (default: false),
  waitingForStaff: Boolean (default: false),
  isActive: Boolean (default: true),
  hasUnreadFromCustomer: Boolean (default: false),
  assignedStaff: ObjectId (ref: 'User'),
  lastActivity: Date (default: now),
  lastStaffRead: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `sessionId`: Unique index
- `userId`: For user lookup
- `isStaffChat`: For filtering staff chats
- `isActive`: For active conversations
- `lastActivity`: For sorting

**Sample Document**:
```json
{
  "_id": "507f1f77bcf86cd799439050",
  "sessionId": "sess-uuid-12345",
  "userId": "507f1f77bcf86cd799439011",
  "messages": [
    {
      "role": "user",
      "content": "I need a moisturizer for dry skin",
      "messageType": "text",
      "timestamp": "2024-02-01T10:00:00.000Z"
    },
    {
      "role": "assistant",
      "content": "I recommend our Hydrating Serum...",
      "messageType": "ai",
      "timestamp": "2024-02-01T10:00:02.000Z",
      "metadata": {
        "intent": "product_recommendation",
        "confidence": 0.95,
        "retrievedProducts": ["507f1f77bcf86cd799439012"]
      }
    }
  ],
  "isStaffChat": false,
  "isActive": true,
  "lastActivity": "2024-02-01T10:00:00.000Z"
}
```

---

### 7. FAQs

**Collection Name**: `faqs`

**Purpose**: Store frequently asked questions for menu-driven chat.

**Schema**:
```javascript
{
  question: String (required),
  answer: String (required),
  category: String (enum: ['product', 'shipping', 'return', 'general', 'skincare'], 
                   default: 'general'),
  tags: [String],
  priority: Number (default: 0),
  isActive: Boolean (default: true),
  viewCount: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- Text index on: `question`, `answer`
- `category`: For filtering
- `isActive`: For active FAQs
- `priority`: For sorting

**Sample Document**:
```json
{
  "_id": "507f1f77bcf86cd799439060",
  "question": "What is your return policy?",
  "answer": "We accept returns within 30 days of purchase...",
  "category": "return",
  "tags": ["return", "policy", "refund"],
  "priority": 10,
  "isActive": true,
  "viewCount": 156
}
```

---

### 8. NewsletterSubscriptions

**Collection Name**: `newslettersubscriptions`

**Purpose**: Store email newsletter subscribers.

**Schema**:
```javascript
{
  email: String (required, unique, lowercase, indexed),
  name: String,
  source: String (enum: ['website', 'checkout', 'popup', 'manual'], default: 'website'),
  preferences: {
    newProducts: Boolean (default: true),
    promotions: Boolean (default: true),
    newsletter: Boolean (default: true)
  },
  isActive: Boolean (default: true),
  unsubscribeToken: String (unique),
  subscriptionDate: Date (default: now),
  lastEmailSent: Date,
  emailsSent: Number (default: 0),
  emailsOpened: Number (default: 0),
  emailsClicked: Number (default: 0)
}
```

**Indexes**:
- `email`: Unique index
- `isActive`: For active subscribers
- `subscriptionDate`: For date-based queries
- `unsubscribeToken`: For unsubscribe links

**Sample Document**:
```json
{
  "_id": "507f1f77bcf86cd799439070",
  "email": "subscriber@example.com",
  "name": "Jane Smith",
  "source": "checkout",
  "preferences": {
    "newProducts": true,
    "promotions": true,
    "newsletter": false
  },
  "isActive": true,
  "unsubscribeToken": "token-uuid-67890",
  "subscriptionDate": "2024-01-20T12:00:00.000Z",
  "emailsSent": 10,
  "emailsOpened": 7,
  "emailsClicked": 3
}
```

---

### 9. EmailCampaigns

**Collection Name**: `emailcampaigns`

**Purpose**: Store email marketing campaigns.

**Schema**:
```javascript
{
  name: String (required),
  subject: String (required),
  content: String (required, plain text),
  htmlContent: String (required, HTML),
  templateId: ObjectId (ref: 'EmailTemplate'),
  status: String (enum: ['draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled'], 
                  default: 'draft'),
  type: String (enum: ['newsletter', 'promotion', 'announcement', 'welcome', 
                        'product_launch', 'abandoned_cart'], default: 'newsletter'),
  createdBy: ObjectId (ref: 'User', required),
  
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
  
  scheduledAt: Date,
  sentAt: Date,
  
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
  
  settings: {
    trackOpens: Boolean (default: true),
    trackClicks: Boolean (default: true),
    enableUnsubscribe: Boolean (default: true)
  },
  
  errorLogs: [{
    type: String,
    message: String,
    timestamp: Date (default: now)
  }],
  
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `status`: For filtering campaigns
- `type`: For campaign types
- `createdBy`: For user campaigns
- `scheduledAt`: For scheduled campaigns
- `sentAt`: For sent campaigns (descending)

**Virtuals**:
- `openRate`: Percentage of opens (emailsOpened / emailsDelivered * 100)
- `clickRate`: Percentage of clicks
- `unsubscribeRate`: Percentage of unsubscribes

**Methods**:
- `getTargetedSubscribers()`: Get subscribers matching criteria

**Sample Document**:
```json
{
  "_id": "507f1f77bcf86cd799439080",
  "name": "February Newsletter",
  "subject": "New Products This Month",
  "content": "Check out our new arrivals...",
  "htmlContent": "<html>...</html>",
  "status": "sent",
  "type": "newsletter",
  "createdBy": "507f1f77bcf86cd799439011",
  "targetAudience": "all",
  "sentAt": "2024-02-01T09:00:00.000Z",
  "analytics": {
    "totalRecipients": 1000,
    "emailsSent": 1000,
    "emailsDelivered": 985,
    "emailsBounced": 15,
    "emailsOpened": 450,
    "uniqueOpens": 420,
    "emailsClicked": 120,
    "uniqueClicks": 110,
    "unsubscribes": 5
  }
}
```

---

### 10. EmailTemplates

**Collection Name**: `emailtemplates`

**Purpose**: Store reusable email templates.

**Schema**:
```javascript
{
  name: String (required),
  subject: String (required),
  htmlContent: String (required),
  textContent: String,
  type: String (enum: ['newsletter', 'promotion', 'transactional', 'welcome'], 
                default: 'newsletter'),
  variables: [String] (available variables like {{subscriber_name}}),
  isActive: Boolean (default: true),
  createdBy: ObjectId (ref: 'User'),
  usageCount: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

**Sample Document**:
```json
{
  "_id": "507f1f77bcf86cd799439090",
  "name": "Welcome Email",
  "subject": "Welcome to {{company_name}}",
  "htmlContent": "<html>...</html>",
  "type": "welcome",
  "variables": ["subscriber_name", "company_name", "unsubscribe_url"],
  "isActive": true,
  "usageCount": 150
}
```

---

### 11. CashFlowTransactions

**Collection Name**: `cashflowtransactions`

**Purpose**: Track all cash flow (income and expenses).

**Schema**:
```javascript
{
  type: String (enum: ['income', 'expense'], required),
  amount: Number (required, min: 0),
  category: String,
  description: String,
  date: Date (required, default: now),
  paymentMethod: String,
  reference: String,
  createdBy: ObjectId (ref: 'User'),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `type`: For filtering
- `date`: For date-based queries (descending)
- `category`: For categorization

---

### 12. BusinessExpenses

**Collection Name**: `businessexpenses`

**Purpose**: Detailed business expense tracking.

**Schema**:
```javascript
{
  title: String (required),
  amount: Number (required, min: 0),
  category: String (enum: ['rent', 'utilities', 'salaries', 'marketing', 'supplies', 
                           'equipment', 'software', 'travel', 'other'], required),
  description: String,
  date: Date (required),
  dueDate: Date,
  status: String (enum: ['pending', 'paid', 'overdue'], default: 'pending'),
  vendor: String,
  invoiceNumber: String,
  paymentMethod: String,
  isRecurring: Boolean (default: false),
  recurringFrequency: String (enum: ['daily', 'weekly', 'monthly', 'yearly']),
  nextOccurrence: Date,
  attachments: [String],
  createdBy: ObjectId (ref: 'User')
}
```

**Indexes**:
- `date`: Descending
- `category`: For filtering
- `isRecurring` + `nextOccurrence`: For recurring expenses
- `status` + `dueDate`: For overdue tracking

---

### 13. Employees

**Collection Name**: `employees`

**Purpose**: Store employee records.

**Schema**:
```javascript
{
  firstName: String (required),
  lastName: String (required),
  email: String (required, unique),
  phone: String,
  position: String,
  department: String,
  hireDate: Date,
  salary: Number,
  status: String (enum: ['active', 'inactive', 'terminated'], default: 'active'),
  documents: [String] (file paths),
  createdAt: Date,
  updatedAt: Date
}
```

---

## Relationships

### One-to-Many Relationships

1. **Category → Products**: One category has many products
2. **User → Orders**: One user has many orders
3. **User → Campaigns**: One admin creates many campaigns
4. **LiveStream → ChatMessages**: One stream has many messages
5. **EmailTemplate → Campaigns**: One template used in many campaigns

### Many-to-Many Relationships

1. **Products ↔ Orders**: Products can be in many orders, orders have many products
2. **Products ↔ LiveStreams**: Products pinned in streams
3. **Users ↔ LiveStreams**: Users can like many streams (via likedBy array)

## Data Flow Examples

### Order Creation Flow

1. Customer selects products → Cart (client-side)
2. Checkout → Create Order document
3. Order contains:
   - User reference
   - Product IDs with quantities and prices
   - Payment information
   - Calculated totals
4. Product stock decremented (application logic)

### Live Stream Flow

1. Admin creates LiveStream → `isActive: true`
2. Customers join → WebSocket connections
3. Real-time updates:
   - Viewer count increments
   - Chat messages added to array
   - Likes tracked in `likedBy` array
4. Stream stops → `isActive: false`, `endTime` set
5. Recording saved → `videoUrl` populated

### Email Campaign Flow

1. Admin creates EmailCampaign → `status: 'draft'`
2. Sets targeting criteria → `segmentCriteria`
3. Schedules or sends → `status: 'sending'`
4. EmailService.sendCampaignEmails():
   - Query subscribers based on criteria
   - Send emails in batches
   - Update analytics
5. Campaign complete → `status: 'sent'`, analytics populated

## Performance Considerations

### Indexes

All collections have appropriate indexes for:
- Frequently queried fields
- Foreign key references
- Text search fields
- Sorting fields

### Aggregation Pipelines

Used for:
- Analytics calculations
- Campaign statistics
- Order reports
- Revenue tracking

### Pagination

Implemented for:
- Product listings
- Order history
- Live stream archive
- Email campaigns

## Backup Strategy

**Recommended**:
- Daily automated backups via MongoDB Atlas
- Point-in-time recovery enabled
- Backup retention: 30 days minimum
- Test restoration quarterly

## Data Retention

- **Orders**: Indefinite (legal/accounting requirement)
- **ChatConversations**: 90 days for inactive
- **LiveStream ChatMessages**: Indefinite (with stream)
- **Email Analytics**: Indefinite
- **Logs**: 30 days

## Security

- **Sensitive Data**: Passwords hashed with bcrypt (salt rounds: 10)
- **PII**: Email, phone, address stored with appropriate access controls
- **Tokens**: Unsubscribe tokens are unique UUIDs
- **API Keys**: Never stored in database, only in environment variables

## Migration Strategy

When making schema changes:
1. Test in development environment
2. Create migration script if needed
3. Backup production database
4. Apply changes during low-traffic period
5. Verify data integrity
6. Monitor application logs

## Monitoring

**Key Metrics to Monitor**:
- Query performance (slow queries)
- Connection pool usage
- Database size growth
- Index usage
- Failed transactions
