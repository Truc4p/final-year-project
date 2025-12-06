# Quick Reference Guide: Container Diagram Implementation

## 🎯 At a Glance

### **What is the Container Diagram?**
Shows how the AI Dermatology Expert system works with 7 containers communicating via APIs and databases.

### **What Happens When User Sends Query?**
```
User Query
    ↓
Embed to 768-dim vector (Gemini)
    ↓
Search vector DB (Qdrant) - Cosine Similarity
    ↓
Get top 3 chunks with scores (0.82, 0.71, 0.62)
    ↓
Build RAG context
    ↓
Generate response (Gemini LLM)
    ↓
Return to user with citations
```

---

## 🏗️ Container Quick Reference

| # | Container | Technology | Purpose | Key Code |
|---|-----------|-----------|---------|----------|
| 1 | Frontend | Vue.js 3 | User interface | `AIDermatologyExpert.vue` |
| 2 | API Gateway | Express.js | Route requests | `aiDermatologyExpert.js` (routes) |
| 3 | Vector DB | Qdrant | Store embeddings | `vectorService.js` |
| 4 | Embedding | Gemini API | Generate vectors | `text-embedding-004` |
| 5 | LLM | Gemini API | Generate responses | `gemini-2.0-flash` |
| 6 | Database | MongoDB | Store data | `conversations`, `cache` |
| 7 | Knowledge | Text files | Dermatology books | `knowledge-sources/` |

---

## 📊 Embedding & Vector Comparison

### **Query Embedding Process**
```
Input:  "I have red patches on my cheeks"
        ↓
Model:  Gemini text-embedding-004
        ↓
Output: [0.234, -0.567, 0.891, ..., 0.345]  (768 dimensions)
```

### **Vector Comparison (Cosine Similarity)**
```
Formula: similarity = (A · B) / (||A|| × ||B||)
Range:   0.0 (different) to 1.0 (identical)

Example:
Query Vector:     [0.234, -0.567, 0.891, ...]
Document Vector:  [0.245, -0.580, 0.905, ...]
Similarity:       0.7534 (75.34%)
```

### **Search Results**
```
Query: "I have red patches on my cheeks"

Result 1: 0.8234 (82.34%) - Rosacea ✅ EXCELLENT
Result 2: 0.7156 (71.56%) - Contact Dermatitis ✅ GOOD
Result 3: 0.6234 (62.34%) - Inflammation ✅ FAIR
Result 4: 0.3891 (38.91%) - Acne ❌ FILTERED OUT (< 0.4)
```

---

## 🔄 Request Flow

### **Step-by-Step**
```
1. Frontend sends POST /api/ai-dermatology-expert/chat
2. Controller receives request
3. Detect language & translate if needed
4. Check cache for existing response
5. If not cached:
   a. Generate query embedding (768 dims)
   b. Search Qdrant vector DB
   c. Get top 3 chunks with similarity scores
   d. Build RAG context
   e. Call Gemini LLM with context
   f. Cache response
6. Return response with sources
7. Frontend displays with citations
```

---

## 📁 Key Files Location

```
backend/
├── routes/
│   └── skin-study/
│       └── aiDermatologyExpert.js          ← API routes
├── controllers/
│   └── skin-study/
│       └── aiDermatologyExpertController.js ← Main logic
├── services/
│   ├── vectorService.js                    ← RAG & vector search
│   ├── geminiService.js                    ← LLM & embeddings
│   └── cacheService.js                     ← Response caching
└── knowledge-sources/
    └── extracted-content/                  ← Dermatology books
        ├── Fitzpatrick's Dermatology...txt
        ├── Textbook of Cosmetic...txt
        └── ... (6 books total)

frontend/
└── src/pages/customer/skin-study/
    └── AIDermatologyExpert.vue             ← User interface
```

---

## 🔌 API Endpoints

### **Chat**
```
POST /api/ai-dermatology-expert/chat
{
    "message": "I have red patches",
    "conversationHistory": [...]
}
→ Returns: response, sources, timestamp
```

### **Analyze Image**
```
POST /api/ai-dermatology-expert/analyze-skin
multipart/form-data:
- image: [file]
- message: [text]
→ Returns: response, sources
```

### **Transcribe Audio**
```
POST /api/ai-dermatology-expert/transcribe
multipart/form-data:
- audio: [file]
→ Returns: transcription, timestamp
```

### **Text-to-Speech**
```
POST /api/ai-dermatology-expert/text-to-speech
{
    "text": "Response text"
}
→ Returns: audio (base64), format, timestamp
```

---

## ⏱️ Performance

### **Response Time Breakdown**
```
Language Detection:    ~800 ms
Query Embedding:       ~400 ms
Vector Search:         ~100 ms
Response Generation:   ~2,500 ms
Database Save:         ~600 ms
─────────────────────────────
Total:                 ~4,500 ms
```

### **With Cache**
```
First request:  ~4,500 ms
Cached request: ~100 ms
Improvement:    45x faster!
```

---

## 🎯 Cosine Similarity Scores Explained

```
Score    Category      Meaning
─────────────────────────────────────────
0.90+    🟢 PERFECT    Directly answers question
0.75-89  🟢 EXCELLENT  Highly relevant
0.60-74  🟡 GOOD       Relevant information
0.45-59  🟡 FAIR       Tangentially related
0.30-44  🔴 WEAK       Barely related
0.00-29  ⚫ POOR        Completely unrelated
```

---

## 🔍 Vector Search Process

### **In Qdrant**
```
1. Receive 768-dimensional query vector
2. Compare with all 9,000 document vectors
3. Calculate cosine similarity for each
4. Sort by score (highest first)
5. Filter by threshold (0.4)
6. Return top 3 results
Time: ~100ms (with HNSW optimization)
```

---

## 📚 Knowledge Base

### **6 Dermatology Textbooks**
1. Fitzpatrick's Dermatology in General Medicine
2. Textbook of Cosmetic Dermatology
3. Chemical Peels - Procedures in Cosmetic Dermatology
4. Lasers in Dermatology and Medicine
5. Cosmetic Dermatology - Products and Procedures
6. Cosmetic Dermatology - Principles and Practice

### **Processing**
```
Load all .txt files
    ↓
Split into ~1,500 char chunks
    ↓
Generate embeddings for each chunk
    ↓
Index into Qdrant
    ↓
Total: ~9,000 chunks ready for search
```

---

## 🛠️ Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | Vue.js | 3.5.12 |
| Backend | Node.js | 18+ LTS |
| Framework | Express.js | 4.19.2 |
| Vector DB | Qdrant | Latest |
| Database | MongoDB | 8.0+ |
| Embeddings | Gemini API | text-embedding-004 |
| LLM | Gemini API | gemini-2.0-flash |
| File Upload | Multer | 1.4.5 |
| HTTP Client | Axios | 1.12.2 |

---

## 🔐 Security

- ✅ JWT authentication
- ✅ Input validation
- ✅ File type/size restrictions
- ✅ Rate limiting with exponential backoff
- ✅ Error handling with user-friendly messages

---

## 🚀 Deployment

### **Development**
```
npm install
npm start
→ Backend: http://localhost:3000
→ Qdrant: http://localhost:6333
```

### **Environment Variables**
```
GEMINI_API_KEY=your_key
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=your_key
MONGODB_URI=your_uri
NODE_ENV=development
```

---

## 📊 Data Flow Diagram

```
┌─────────────┐
│   Frontend  │
└──────┬──────┘
       │ HTTP POST
       ↓
┌─────────────────────────────────┐
│   API Gateway (Express.js)      │
├─────────────────────────────────┤
│ 1. Receive request              │
│ 2. Validate input               │
│ 3. Check cache                  │
│ 4. Generate embedding           │
│ 5. Search vector DB             │
│ 6. Build context                │
│ 7. Call LLM                     │
│ 8. Save to cache                │
└──────┬──────────────────────────┘
       │
       ├─→ Gemini (Embedding)
       ├─→ Qdrant (Vector Search)
       ├─→ Gemini (LLM)
       └─→ MongoDB (Cache)
       │
       ↓ JSON Response
┌─────────────┐
│   Frontend  │
│  (Display)  │
└─────────────┘
```

---

## 💡 Key Concepts

### **RAG (Retrieval-Augmented Generation)**
1. **Retrieve**: Search vector DB for relevant chunks
2. **Augment**: Add chunks to prompt
3. **Generate**: LLM generates response with context

### **Embeddings**
- Text → 768-dimensional vector
- Similar texts → similar vectors
- Enables semantic search

### **Vector Database**
- Stores millions of embeddings
- Fast similarity search (~100ms)
- Uses HNSW algorithm

### **Cosine Similarity**
- Measures angle between vectors
- Range: 0 (perpendicular) to 1 (parallel)
- Formula: (A · B) / (||A|| × ||B||)

---

## 🎓 Learning Path

1. **Start Here**: `CONTAINER_DIAGRAM_SUMMARY.md`
2. **Deep Dive**: `CONTAINER_DIAGRAM_IMPLEMENTATION.md`
3. **Visual Explanation**: `EMBEDDING_VECTOR_COMPARISON_VISUAL.md`
4. **Code Walkthrough**: `CODE_FLOW_DETAILED_WALKTHROUGH.md`
5. **Quick Reference**: This file

---

## 🔗 Related Documentation

- System Design Document: `report/SECTION_5_SYSTEM_DESIGN_ARCHITECTURE without code.md`
- API Endpoints: See section 5.5 in design document
- Database Schema: See section 5.4 ERD in design document

---

## ❓ FAQ

**Q: Why 768 dimensions for embeddings?**
A: Gemini's text-embedding-004 uses 768 dimensions as a balance between semantic richness and computational efficiency.

**Q: How fast is vector search?**
A: ~100ms for 9,000 documents using HNSW optimization in Qdrant.

**Q: What's the difference between cached and non-cached responses?**
A: Cached: ~100ms | Non-cached: ~4,500ms (45x faster!)

**Q: How are sources cited?**
A: Using bracketed numbers [1], [2], [3] with a References section at the end.

**Q: Can it analyze images?**
A: Yes! Uses Gemini Vision API with RAG context for skin image analysis.

**Q: Can it transcribe audio?**
A: Yes! Uses Gemini's multimodal capabilities for audio transcription.

**Q: How many languages are supported?**
A: Any language! Automatically detected and translated to English for RAG, then response generated in original language.

---

## 📞 Support

For questions about:
- **Architecture**: See CONTAINER_DIAGRAM_IMPLEMENTATION.md
- **Embeddings**: See EMBEDDING_VECTOR_COMPARISON_VISUAL.md
- **Code**: See CODE_FLOW_DETAILED_WALKTHROUGH.md
- **API**: See section 5.5 in design document

---

**Last Updated**: 2024-12-06
**Status**: Complete Implementation
**Version**: 1.0

