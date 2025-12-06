# Container Diagram: AI Dermatology Expert - Executive Summary

## 📋 What's in the Container Diagram?

The Container Diagram (Level 2 of C4 Model) shows the **real code implementation** of how the AI Dermatology Expert chat system works. Here's what you'll find:

---

## 🏗️ 7 Main Containers

### **1. Frontend Container** (Vue.js / React Native)
- **What**: User interface for chatting with AI
- **How it works**: 
  - User types question or uploads image
  - Sends HTTP request to backend
  - Displays AI response with source citations
- **Code**: `frontend/src/pages/customer/skin-study/AIDermatologyExpert.vue`

### **2. API Gateway Container** (Express.js Backend)
- **What**: REST API server that orchestrates everything
- **How it works**:
  - Receives requests from frontend
  - Routes to appropriate service
  - Handles file uploads (images, audio)
  - Returns formatted responses
- **Code**: `backend/routes/skin-study/aiDermatologyExpert.js`
- **Port**: 3000

### **3. Vector Database Container** (Qdrant)
- **What**: Stores 768-dimensional embeddings of dermatology knowledge
- **How it works**:
  - Stores ~9,000 chunks of dermatology textbooks
  - Each chunk has a 768-dimensional vector
  - Performs fast similarity search using cosine distance
  - Returns top 3 most relevant chunks in ~100ms
- **URL**: `http://localhost:6333`
- **Collection**: `dermatology_knowledge`

### **4. Embedding Service** (Google Gemini)
- **What**: Converts text to 768-dimensional vectors
- **How it works**:
  - Takes user query: "I have red patches on my cheeks"
  - Converts to vector: `[0.234, -0.567, 0.891, ..., 0.345]`
  - Used for both query embedding and document indexing
- **Model**: `text-embedding-004`
- **Dimension**: 768

### **5. LLM Service** (Google Gemini API)
- **What**: Generates AI responses using retrieved context
- **How it works**:
  - Receives user query + retrieved knowledge chunks
  - Generates comprehensive, cited response
  - Supports vision analysis for skin images
  - Supports audio transcription
- **Model**: `gemini-2.0-flash`

### **6. Database Container** (MongoDB)
- **What**: Stores conversations, cache, user data
- **How it works**:
  - Saves chat history for future reference
  - Caches responses for repeated queries
  - Stores user information
- **Collections**: 
  - `conversations` - Chat history
  - `ai_dermatology_cache` - Cached responses

### **7. Knowledge Base Container** (Text Files)
- **What**: 6 dermatology textbooks in plain text
- **How it works**:
  - Loaded into Qdrant during initialization
  - Split into ~1,500 character chunks
  - Each chunk embedded and indexed
  - Ready for semantic search
- **Location**: `backend/knowledge-sources/extracted-content/`
- **Books**:
  1. Fitzpatrick's Dermatology in General Medicine
  2. Textbook of Cosmetic Dermatology
  3. Chemical Peels - Procedures in Cosmetic Dermatology
  4. Lasers in Dermatology and Medicine
  5. Cosmetic Dermatology - Products and Procedures
  6. Cosmetic Dermatology - Principles and Practice

---

## 🔄 How User Query Flows Through Containers

### **User Query: "I have red patches on my cheeks"**

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. FRONTEND CONTAINER                                           │
│    User types message and clicks send                           │
└────────────────────┬────────────────────────────────────────────┘
                     │ HTTP POST /api/ai-dermatology-expert/chat
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. API GATEWAY CONTAINER                                        │
│    Receives request, validates input                            │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ├──→ Check cache (MongoDB)
                     │
                     ├──→ Detect language (Gemini)
                     │
                     ├──→ Generate query embedding (Gemini)
                     │
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. EMBEDDING SERVICE (Gemini)                                   │
│    Converts query to 768-dimensional vector                     │
│    Output: [0.234, -0.567, 0.891, ..., 0.345]                 │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. VECTOR DATABASE (Qdrant)                                     │
│    Searches for 3 most similar chunks                           │
│    Uses Cosine Similarity: 0.0 (different) to 1.0 (identical)  │
│                                                                  │
│    Result 1: Score 0.8234 (82.34%) - Rosacea                  │
│    Result 2: Score 0.7156 (71.56%) - Contact Dermatitis       │
│    Result 3: Score 0.6234 (62.34%) - Inflammation             │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. API GATEWAY CONTAINER (continued)                            │
│    Builds RAG context from 3 retrieved chunks                   │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. LLM SERVICE (Gemini)                                         │
│    Generates response using:                                    │
│    - User query                                                 │
│    - Retrieved knowledge chunks                                 │
│    - Conversation history                                       │
│    Output: "Based on your description, you may have rosacea..."│
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ├──→ Save to MongoDB cache
                     │
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│ 7. FRONTEND CONTAINER                                           │
│    Displays response with source citations                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Embedding & Vector Comparison Process

### **What Happens When Query is Embedded?**

```
User Query: "I have red patches on my cheeks"
    ↓
Gemini text-embedding-004 Model
    ↓
768-Dimensional Vector:
[0.234, -0.567, 0.891, 0.123, -0.456, 0.678, ..., 0.345]
 └─────────────────────────────────────────────────────┘
 768 numbers representing semantic meaning
```

### **How Vectors Are Compared (Cosine Similarity)**

```
Query Vector:     [0.234, -0.567, 0.891, ..., 0.345]
Document Vector:  [0.245, -0.580, 0.905, ..., 0.358]

Cosine Similarity = (A · B) / (||A|| × ||B||)
                  = 612.45 / (28.34 × 28.67)
                  = 0.7534 (75.34% similar)

Interpretation:
- 0.90-1.00: Perfect match ✅
- 0.75-0.89: Excellent match ✅
- 0.60-0.74: Good match ✅
- 0.45-0.59: Fair match ✅
- 0.30-0.44: Weak match ❌
- 0.00-0.29: Poor match ❌
```

### **Vector Search Process**

```
1. Generate 768-dim embedding for query
2. Compare with all 9,000 document vectors
3. Calculate cosine similarity for each
4. Sort by similarity score (highest first)
5. Return top 3 with score > 0.4 threshold
6. Time: ~100ms (optimized with HNSW indexing)
```

---

## 📊 Real Code Flow

### **Request → Response Cycle**

```
1. Frontend sends POST /api/ai-dermatology-expert/chat
   ↓
2. Controller receives request (aiDermatologyExpertController.chat)
   ↓
3. Language detection (geminiService.detectAndTranslate)
   ↓
4. Cache check (cacheService.getAIDermatologyResponse)
   ↓
5. Query embedding (vectorService.embedQuery)
   ↓
6. Vector search (vectorService.searchRelevantDocs)
   ↓
7. Build RAG context from 3 chunks
   ↓
8. Generate response (geminiService.generateResponseWithContext)
   ↓
9. Save to cache (cacheService.setAIDermatologyResponse)
   ↓
10. Return JSON response to frontend
   ↓
11. Frontend displays response + sources
```

---

## 📈 Performance Metrics

### **Typical Response Time**
```
Total: ~4,500 ms

Breakdown:
- Language Detection:    ~800 ms (Gemini API)
- Query Embedding:       ~400 ms (Gemini embeddings)
- Vector Search:         ~100 ms (Qdrant)
- Response Generation:   ~2,500 ms (Gemini LLM)
- Database Save:         ~600 ms (MongoDB)
- Other:                 ~100 ms
```

### **Cache Performance**
```
First request (no cache):  ~4,500 ms
Second request (cached):   ~100 ms
Improvement:               45x faster!
```

---

## 🔌 API Endpoints

### **1. Chat Endpoint**
```
POST /api/ai-dermatology-expert/chat
Content-Type: application/json

Request:
{
    "message": "I have red patches on my cheeks",
    "conversationHistory": [...]
}

Response:
{
    "response": "Based on your description...",
    "sources": [
        {
            "text": "Rosacea is a chronic inflammatory...",
            "score": 0.8234,
            "metadata": {...}
        }
    ],
    "timestamp": "2024-11-30T11:05:42.567Z"
}
```

### **2. Analyze Skin Image**
```
POST /api/ai-dermatology-expert/analyze-skin
Content-Type: multipart/form-data

Request:
- image: [binary file]
- message: "I've been experiencing these red patches"

Response:
{
    "response": "Based on the image analysis...",
    "sources": [...],
    "timestamp": "..."
}
```

### **3. Transcribe Audio**
```
POST /api/ai-dermatology-expert/transcribe
Content-Type: multipart/form-data

Request:
- audio: [binary file]

Response:
{
    "transcription": "I have red patches on my cheeks",
    "timestamp": "...",
    "processingTime": 2345
}
```

### **4. Text-to-Speech**
```
POST /api/ai-dermatology-expert/text-to-speech
Content-Type: application/json

Request:
{
    "text": "Based on your description, you may have rosacea..."
}

Response:
{
    "audio": "SUQzBAAAI1IVVFJJVDIwMjQxMTMwVDExMDU0Mg==...",
    "format": "mp3",
    "timestamp": "..."
}
```

---

## 📚 Key Files

| Component | File | Purpose |
|-----------|------|---------|
| Routes | `backend/routes/skin-study/aiDermatologyExpert.js` | API endpoint definitions |
| Controller | `backend/controllers/skin-study/aiDermatologyExpertController.js` | Main business logic |
| Vector Service | `backend/services/vectorService.js` | RAG & vector search |
| Gemini Service | `backend/services/geminiService.js` | LLM & embedding API calls |
| Cache Service | `backend/services/cacheService.js` | Response caching |
| Frontend | `frontend/src/pages/customer/skin-study/AIDermatologyExpert.vue` | User interface |
| Knowledge Base | `backend/knowledge-sources/extracted-content/` | Dermatology textbooks |

---

## 🔐 Security Features

1. **Input Validation**: Message length, file types, file sizes
2. **Authentication**: JWT token validation
3. **Rate Limiting**: Exponential backoff for API failures
4. **Error Handling**: Graceful degradation with user-friendly messages
5. **File Upload**: Multer with type and size restrictions

---

## 🚀 Deployment

### **Development**
```
localhost:3000 (Backend)
├── Express.js API
├── Qdrant (localhost:6333)
└── MongoDB (local or Atlas)
```

### **Production**
```
Docker Containers:
├── Backend Service (Node.js)
├── Qdrant Vector DB
└── MongoDB Atlas (managed)

Environment Variables:
- GEMINI_API_KEY
- QDRANT_URL
- QDRANT_API_KEY
- MONGODB_URI
```

---

## 🎓 Key Concepts

### **RAG (Retrieval-Augmented Generation)**
1. **Retrieve**: Find relevant knowledge chunks using vector search
2. **Augment**: Add retrieved context to the prompt
3. **Generate**: Use LLM to generate response with context

### **Vector Embeddings**
- Convert text to 768-dimensional vectors
- Similar texts have similar vectors
- Enables semantic search (not just keyword matching)

### **Cosine Similarity**
- Mathematical measure of vector similarity (0-1)
- 1.0 = identical meaning
- 0.0 = completely different meaning

### **Qdrant Vector Database**
- Stores and searches high-dimensional vectors
- Uses HNSW algorithm for fast similarity search
- Returns results in ~100ms for 9,000 documents

---

## 📝 Summary

The **Container Diagram** shows:

1. **7 containers** working together
2. **User query** flows through embedding → vector search → LLM generation
3. **Embeddings** convert text to 768-dimensional vectors
4. **Vector comparison** uses cosine similarity (0-1 scale)
5. **RAG pipeline** combines retrieved knowledge with LLM
6. **Caching** dramatically improves performance
7. **Real code** in Node.js/Express.js with Gemini API integration

---

## 📖 Related Documents

- **CONTAINER_DIAGRAM_IMPLEMENTATION.md** - Detailed technical breakdown
- **EMBEDDING_VECTOR_COMPARISON_VISUAL.md** - Visual explanations with examples
- **CODE_FLOW_DETAILED_WALKTHROUGH.md** - Complete code walkthrough with snippets

---

This summary provides a complete overview of the Container Diagram implementation for the AI Dermatology Expert chat system, showing how embeddings, vector searches, and RAG work in the real codebase.

