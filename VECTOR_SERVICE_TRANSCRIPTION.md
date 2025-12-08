# Vector Service Explanation - Examiner Transcription

## Overview

"The Vector Service is the core component that powers our AI-driven dermatology consultation feature using Retrieval-Augmented Generation, or RAG. Let me walk you through how it works."

## 1. Architecture & Technology Stack

"We're using **Qdrant** as our vector database, **Google's Gemini** for generating embeddings, and **LangChain** for document processing. The system converts medical knowledge into 768-dimensional vectors that capture semantic meaning, not just keywords."

## 2. Initial Setup Process

"During the one-time setup, the service:

1. **Loads** all dermatology textbooks from the knowledge base directory
2. **Chunks** them into 1,500-character segments with 300-character overlap to maintain context
3. **Generates embeddings** - converting each chunk into a 768-dimensional vector using Gemini's text-embedding-004 model
4. **Stores** these vectors in Qdrant with metadata like source file and chunk index

This creates a searchable semantic index of our entire medical knowledge base."

## 3. RAG Query Pipeline

"When a user asks a question about a skin condition, here's what happens:

**Step 1 - Query Embedding:** The user's question is converted into the same 768-dimensional vector space.

**Step 2 - Semantic Search:** We search Qdrant using cosine similarity to find the 3 most relevant knowledge chunks. Cosine similarity measures the angle between vectors - a score of 1.0 means identical meaning, 0.0 means completely unrelated.

**Step 3 - Context Building:** The retrieved chunks are assembled with their source citations.

**Step 4 - AI Response:** This context is passed to Gemini, which generates an accurate, grounded answer based on our medical knowledge base rather than generic information."

## 4. Key Features

"The service includes several important features:

- **Score threshold filtering:** Only returns results above 40% similarity to avoid irrelevant information
- **Batch processing:** Indexes documents in batches of 50 with retry logic for reliability
- **Detailed debugging:** Provides similarity scores, matched keywords, and performance metrics
- **Performance monitoring:** Tracks search time, context size, and retrieval efficiency"

## 5. Why RAG Over Pure LLM?

"This RAG approach solves three critical problems:

1. **Accuracy:** Responses are grounded in verified medical literature, not generic AI knowledge
2. **Traceability:** We can cite exact sources for every claim
3. **Domain specificity:** The AI has access to specialized dermatology knowledge that wasn't in its training data

Without RAG, the AI might provide generic or potentially inaccurate medical advice. With RAG, it retrieves relevant sections from actual dermatology textbooks before formulating responses."

## 6. Technical Highlights

"Some technical details worth noting:

- **Vector dimensions:** 768 dimensions capture nuanced semantic relationships
- **Distance metric:** Cosine similarity is ideal for text because it measures semantic closeness regardless of document length
- **Chunk strategy:** 1,500 characters with 300 overlap balances detail with context preservation
- **Batch size:** 50 documents per batch optimizes speed while preventing API timeouts"

## 7. Production Considerations

"The service is production-ready with:

- Secure credential management through our secret manager
- Comprehensive error handling and retry logic
- Performance monitoring and metrics collection
- Support for both local and cloud Qdrant deployments
- Database reset capabilities for knowledge base updates"

---

**Closing Statement:**
"In summary, the Vector Service transforms our static medical knowledge base into an intelligent, searchable system that enables context-aware AI responses. It's the bridge between raw medical text and clinically-relevant answers for our users."
