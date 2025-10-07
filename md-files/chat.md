## 1. 📋 **Get FAQs (Predefined Q&A System)**

### **How it works:**
- **Purpose**: Provides instant answers to common questions
- **Flow**: Menu-driven, structured responses
- **Data Source**: Predefined FAQ database

### **Process:**
```javascript
// 1. Customer requests FAQs
GET /chat/faqs?category=skincare&limit=10

// 2. System retrieves from database
const faqs = await FAQ.find({ isActive: true })
  .sort({ priority: -1, createdAt: -1 })
  .limit(10);

// 3. Customer selects specific FAQ
POST /chat/faq/{faqId}/answer
{
  "sessionId": "uuid-here"
}

// 4. System returns predefined answer
{
  "question": "Are products cruelty-free?",
  "answer": "Yes! All products are 100% cruelty-free...",
  "sessionId": "uuid-here"
}
```

### **Key Features:**
- ✅ **Categorized FAQs** (skincare, products, shipping, etc.)
- ✅ **Priority-based ordering** (most important first)
- ✅ **Session tracking** (conversation history saved)
- ✅ **Admin management** (create, update, delete FAQs)

---

## 2. 🤖 **Chat with AI (Intelligent Assistant)**

### **How it works:**
- **Purpose**: Provides intelligent, contextual responses using AI
- **Flow**: Natural language conversation with AI-powered responses
- **AI Engine**: Google Gemini 2.0 Flash

### **Process:**
```javascript
// 1. Customer sends message
POST /chat/ai
{
  "message": "What's the best serum for dry skin?",
  "sessionId": "uuid-here"
}

// 2. System performs RAG (Retrieval-Augmented Generation)
// a) Semantic search in FAQs
const faqs = await FAQ.find({ $text: { $search: query } });

// b) Product search with enhanced matching
const products = await Product.find({
  $or: [
    { skinConcerns: { $in: [queryLower] } },
    { skinType: { $in: [queryLower] } },
    { benefits: { $regex: queryLower, $options: 'i' } }
  ]
});

// 3. Build context for AI
let context = "You are Wrencos Beauty Assistant...";
context += "RELEVANT PRODUCTS:\n";
context += "RELEVANT FAQs:\n";
context += "CONVERSATION HISTORY:\n";

// 4. Generate AI response using Gemini
const result = await model.generateContent(prompt);
const aiResponse = response.text();

// 5. Return intelligent response with products/FAQs
{
  "message": "For dry skin, I recommend...",
  "intent": "product_recommendation",
  "confidence": 0.8,
  "relatedProducts": [...],
  "relatedFAQs": [...]
}
```

### **Key Features:**
- ✅ **RAG System** (Retrieval-Augmented Generation)
- ✅ **Semantic Search** (finds relevant products/FAQs)
- ✅ **Context Awareness** (remembers conversation history)
- ✅ **Intent Classification** (product_recommendation, pricing_inquiry, etc.)
- ✅ **Fallback System** (works even if AI fails)
- ✅ **Product Recommendations** (intelligent matching)

---

## 3. 👥 **Chat with Staff (Human Support)**

### **How it works:**
- **Purpose**: Connects customers with human staff for complex issues
- **Flow**: Real-time messaging with staff members
- **Technology**: WebSocket for real-time communication

### **Process:**

#### **Customer Side:**
```javascript
// 1. Connect to staff chat
POST /chat/staff/connect
{
  "sessionId": "uuid-here"
}

// 2. Send message to staff
POST /chat/staff/message
{
  "sessionId": "uuid-here",
  "message": "I need help with my order"
}

// 3. Get staff replies (real-time via WebSocket)
GET /chat/staff/messages/{sessionId}
```

#### **Staff Side:**
```javascript
// 1. Staff connects via WebSocket
WebSocket: ws://localhost:3000
{
  "type": "register_admin",
  "token": "jwt-token"
}

// 2. Get active customer chats
GET /chat/admin/active-chats
// Returns list of customers waiting for help

// 3. Get specific chat messages
GET /chat/admin/messages/{sessionId}

// 4. Reply to customer
POST /chat/admin/reply
{
  "sessionId": "uuid-here",
  "message": "How can I help you?"
}
```

### **WebSocket Real-time Features:**
```javascript
// WebSocket Manager handles:
- Customer connections (by sessionId)
- Admin connections (by userId)
- Real-time message broadcasting
- Connection state management
- Authentication (JWT tokens)
```

### **Key Features:**
- ✅ **Real-time Communication** (WebSocket)
- ✅ **Staff Dashboard** (see all active chats)
- ✅ **Message Broadcasting** (instant delivery)
- ✅ **Authentication** (JWT-based staff access)
- ✅ **Session Management** (track conversation state)
- ✅ **Unread Message Tracking** (staff notifications)

---

## 🔄 **System Integration & Flow**

### **Typical Customer Journey:**
1. **Start with FAQs** → Quick answers to common questions
2. **Escalate to AI** → If FAQ doesn't help, get intelligent assistance
3. **Connect to Staff** → If AI can't resolve, get human help

### **Data Flow:**
```
Customer → API Endpoint → Controller → Database/AI → Response
                ↓
         WebSocket Manager (for staff chat)
                ↓
         Real-time Broadcasting
```

### **Session Management:**
- **Session IDs**: Track conversation across all three systems
- **Conversation History**: Stored in MongoDB
- **State Tracking**: `isStaffChat`, `waitingForStaff`, `hasUnreadFromCustomer`

### **Fallback System:**
- **AI Failure**: Falls back to predefined responses
- **Staff Unavailable**: Customer can leave message, staff responds later
- **Connection Issues**: Messages stored in database, delivered when connected

This three-tier system ensures customers always get help, whether through instant FAQs, intelligent AI assistance, or human staff support! 🚀