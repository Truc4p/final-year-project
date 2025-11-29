
### Overview

The WrenCos system employs a dual-database architecture combining **MongoDB** for relational and transactional data and **Qdrant** for vector-based semantic search and AI-powered retrieval. This hybrid approach leverages MongoDB's flexibility and ACID compliance for business logic while Qdrant provides high-performance similarity search for AI dermatology recommendations.

### MongoDB Implementation

**Database Management System:** MongoDB (via MongoDB Atlas)

MongoDB serves as the primary operational database, implementing the complete ERD schema with the following key collections:

#### Core Collections

1. **User Collection**
   - Stores authentication credentials, roles (admin/customer), contact information, and timestamps
   - Implements bcrypt password hashing with pre-save middleware
   - Unique index on username field for efficient login lookups
   - Example schema:
   ```javascript
   {
     _id: ObjectId,
     username: String (unique),
     password: String (hashed),
     role: String (enum: ['admin', 'customer']),
     email: String,
     phone: String,
     address: String,
     createdAt: Date
   }
   ```

2. **E-Commerce Collections**
   - **Product:** Stores beauty product information with full-text search indexes on name, description, ingredients, benefits, tags, and usage
   - **Category:** Hierarchical product categorization
   - **Order:** Transaction records with payment status, shipping details, and financial calculations
   - **OrderItem:** Line items linking products to orders with quantity and price snapshots
   - Product schema includes specialized fields for AI recommendations: ingredients, skinType, benefits, skinConcerns, and tags

3. **Livestream Collection**
   - Tracks live broadcast sessions with metrics (viewCount, likes, maxViewers)
   - Stores embedded chat messages with timestamps and admin flags
   - Maintains relationships to pinned products for in-stream shopping
   - Includes performance indexes on isActive, createdAt, viewCount, and isRecorded fields
   - Supports virtual fields for formatted duration display

4. **Marketing Collections**
   - **EmailCampaign:** Campaign metadata and scheduling
   - **EmailTemplate:** Reusable email templates with HTML/text content
   - **EmailSegment:** Customer segmentation for targeted campaigns
   - **EmailAnalytics:** Tracking opens, clicks, and conversions
   - **NewsletterSubscription:** Opt-in tracking for compliance

5. **Communication Collections**
   - **ChatConversation:** Stores AI dermatology expert conversations with message history
   - Supports multi-turn dialogue with optional staff assignment for escalation

6. **Finance Collections**
   - **CashFlowTransaction:** Records all monetary movements (sales, refunds, expenses)
   - **BusinessExpense:** Operational expense tracking with categorization

7. **HR Collection**
   - **Employee:** Staff information with 1:1 relationship to User collection

#### Database Connection

The MongoDB connection is established through Mongoose ODM with connection pooling:

```javascript
// backend/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://[username]:[password]@cluster0.18pi3.mongodb.net/Wrencos?retryWrites=true&w=majority"
    );
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};
```

**Connection Features:**
- Automatic retry writes for transient failures
- Write concern set to majority for data durability
- Connection pooling for efficient resource utilization
- Graceful error handling with process exit on connection failure

### Qdrant Vector Database Implementation

**Database Management System:** Qdrant (Vector Database)

Qdrant is deployed as a specialized vector database for semantic search and AI-powered product recommendations. It stores embeddings of dermatological knowledge and enables similarity-based retrieval for the AI dermatology expert feature.

#### Architecture

1. **Collection Structure**
   - Collection name: `dermatology_knowledge`
   - Vector size: 768 dimensions (Gemini text-embedding-004 model)
   - Distance metric: Cosine similarity
   - Payload storage: Full text chunks with metadata

2. **Embedding Generation**
   - Model: Google Gemini `text-embedding-004`
   - Generated via LangChain's `GoogleGenerativeAIEmbeddings`
   - Embeddings created for knowledge base documents (1500 characters per chunk with 300-character overlap)

3. **Document Indexing Pipeline**
   ```javascript
   // backend/services/vectorService.js
   async indexDocuments(documents) {
     // Batch processing: 50 documents per batch
     // Generate embeddings for each batch
     // Validate embeddings (768-dimensional vectors)
     // Upsert to Qdrant with retry logic (3 attempts per batch)
     // Small delays between batches to prevent rate limiting
   }
   ```

4. **Search and Retrieval**
   - Query embedding generated using the same Gemini model
   - Cosine similarity search with score threshold of 0.4 (40% minimum relevance)
   - Returns top-K results (default: 3-5 chunks) with relevance scores
   - Metadata includes source document, chunk index, and file information

#### Docker Deployment

Qdrant is containerized using docker-compose for consistent deployment:

```yaml
# backend/docker-compose.qdrant.yml
version: '3.8'
services:
  qdrant:
    image: qdrant/qdrant:latest
    container_name: skin-study-qdrant
    ports:
      - "6333:6333"  # REST API
      - "6334:6334"  # gRPC API
    volumes:
      - ./qdrant_storage:/qdrant/storage
    environment:
      - QDRANT__SERVICE__GRPC_PORT=6334
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:6333/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

**Key Features:**
- Persistent storage via volume mount at `./qdrant_storage`
- Dual API support: REST (port 6333) and gRPC (port 6334)
- Health checks ensure service availability
- Automatic restart on failure

### Physical Database Schema Implementation

#### MongoDB Mongoose Schemas

Each collection is implemented using Mongoose schemas with:
- Field validation (type, required, enum constraints)
- Indexes for query optimization (compound indexes on frequently queried fields)
- Pre/post hooks for business logic (e.g., password hashing on User save)
- Virtual fields for computed properties (e.g., formatted duration in LiveStream)
- Static methods for common queries (e.g., `LiveStream.getActiveStream()`)
- Instance methods for domain operations (e.g., `liveStream.incrementViewCount()`)

**Example: Product Schema with Full-Text Search**
```javascript
// backend/models/ecommerce/product.js
productSchema.index({ 
  name: 'text', 
  description: 'text', 
  ingredients: 'text', 
  benefits: 'text', 
  tags: 'text',
  usage: 'text'
});
```

#### Relationships and References

- **Foreign Keys:** Implemented using `mongoose.Schema.Types.ObjectId` with `ref` for automatic population
- **One-to-Many:** User → Orders, User → LiveStreams, Category → Products
- **Embedded Documents:** ChatMessages embedded in LiveStream, PinnedProducts embedded in LiveStream
- **Many-to-Many:** Implemented through arrays of ObjectIds (e.g., likedBy array in LiveStream)

### Data Integrity and Constraints

1. **Unique Constraints:** Username uniqueness enforced at database level
2. **Referential Integrity:** Foreign key relationships maintained through Mongoose refs
3. **Validation:** Schema-level validation for enums (role, quality, skinType, skinConcerns)
4. **Indexing Strategy:**
   - Single-field indexes on frequently filtered fields (isActive, createdAt, viewCount)
   - Compound indexes for multi-field queries
   - Text indexes for full-text search on product information

### RAG (Retrieval-Augmented Generation) Integration

The vector database enables a complete RAG pipeline for AI dermatology responses:

1. **Query Embedding:** User question converted to 768-dimensional vector
2. **Similarity Search:** Qdrant retrieves top-3 most relevant knowledge chunks (score > 0.4)
3. **Context Assembly:** Retrieved chunks combined with source attribution
4. **Generation:** Gemini AI generates response using retrieved context
5. **Source Attribution:** Original sources returned with relevance scores for transparency

**Performance Metrics:**
- Vector search latency: ~100-200ms per query
- Batch indexing: 50 documents per batch with 3-retry fallback
- Embedding generation: ~2-3 seconds per batch via Gemini API

### Backup and Recovery

- **MongoDB:** Automated backups via MongoDB Atlas with point-in-time recovery
- **Qdrant:** Persistent storage ensures data survives container restarts; manual backups via volume snapshots
