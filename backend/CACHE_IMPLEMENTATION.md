# Redis Cache Implementation for AI Dermatology Expert

This implementation adds Redis caching specifically for AI Dermatology Expert responses to improve performance for frequently asked sample questions.

## 🎯 Features

### ✅ Implemented Features
- **Sample Question Detection**: Automatically detects and caches responses for predefined sample questions
- **Multi-language Support**: Caches responses by language (English, Vietnamese, etc.)
- **Smart Cache Keys**: Generates unique keys based on normalized questions and language
- **TTL Configuration**: Different cache durations (7 days for sample questions, 1 day for others)
- **Graceful Fallback**: Works without Redis - automatically bypasses cache if Redis is unavailable
- **Cache Management**: Development endpoints for cache statistics and clearing

### 📊 Cache Strategy
- **Sample Questions**: Cached for 7 days (high confidence, stable answers)
- **New Chat Questions**: Cached for 1 day (no conversation history)
- **Conversation Questions**: Not cached (context-dependent)

## 🚀 Getting Started

### 1. Start Redis Service
```bash
# Start Redis and Qdrant services
cd backend
docker compose up -d

# Check if services are running
docker compose ps
```

### 2. Environment Variables (Optional)
Add to your `.env` file:
```env
REDIS_URL=redis://localhost:6379
```

### 3. Test the Implementation
```bash
# Run the cache test script
cd backend
node test-cache.js
```

## 📡 API Endpoints

### Chat Endpoint (with caching)
```http
POST /api/ai-dermatology-expert/chat
Content-Type: application/json

{
  "message": "What are the different types of chemical peels and how do they work?",
  "conversationHistory": []
}
```

**Response includes cache information:**
```json
{
  "response": "Chemical peels are cosmetic treatments...",
  "sources": ["source1.pdf"],
  "images": [],
  "timestamp": "2025-11-30T...",
  "_performance": {
    "totalTime": 150,
    "cached": true,
    "detectedLanguage": "English"
  }
}
```

### Cache Management Endpoints (Development Only)

#### Get Cache Statistics
```http
GET /api/ai-dermatology-expert/cache/stats
```

**Response:**
```json
{
  "message": "Cache statistics retrieved successfully",
  "stats": {
    "connected": true,
    "totalKeys": 25,
    "memoryInfo": "...",
    "uptime": "..."
  }
}
```

#### Clear Cache
```http
DELETE /api/ai-dermatology-expert/cache
```

**Response:**
```json
{
  "message": "Cache cleared successfully", 
  "deletedEntries": 25
}
```

## 🧠 How It Works

### 1. Sample Question Detection
The cache service identifies sample questions using pattern matching:

```javascript
// Sample questions from frontend/mobile app
const sampleQuestions = [
  "What are the different types of chemical peels",
  "How does retinol work", 
  "What is the Fitzpatrick skin type classification",
  // ... more patterns
];
```

### 2. Cache Key Generation
Cache keys are generated with the format:
```
ai_dermatology:{language}:{hash}:{normalized_question}
```

Example:
```
ai_dermatology:English:d2hhdCBhcmU...:what are the different types of chemical peels
```

### 3. Caching Logic
```javascript
// Check cache for sample questions and new chats
if (isSampleQuestion || !conversationHistory || conversationHistory.length === 0) {
  cachedResponse = await cacheService.getAIDermatologyResponse(message, language);
}

// Cache successful responses
if (responseGenerated && shouldCache) {
  await cacheService.setAIDermatologyResponse(message, response, language, ttl);
}
```

## 📁 File Structure

```
backend/
├── services/
│   └── cacheService.js          # Redis cache service
├── controllers/skin-study/
│   └── aiDermatologyExpertController.js  # Updated with caching
├── routes/skin-study/
│   └── aiDermatologyExpert.js   # Cache management endpoints
├── docker-compose.yml           # Redis + Qdrant services
├── test-cache.js               # Cache testing script
└── package.json                # Added redis dependency
```

## 🔧 Configuration

### Docker Compose Services
```yaml
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - ./redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
```

### Cache Settings
- **Sample Questions TTL**: 7 days (604800 seconds)
- **Regular Questions TTL**: 1 day (86400 seconds)
- **Connection Timeout**: 5 seconds
- **Reconnect Strategy**: Exponential backoff (max 10 retries)

## 🎯 Sample Questions Cached

The system automatically caches responses for these sample question categories:

1. **Fundamentals of Cosmetic Dermatology**
   - Chemical peels types and mechanisms
   - Fitzpatrick skin type classification
   - Skin barrier function

2. **Cosmetic Ingredients & Formulations**
   - Retinol usage and benefits
   - Chemical vs physical sunscreens
   - Peptides in skincare
   - Vitamin C formulations
   - Niacinamide concentrations

3. **Professional Procedures**
   - Laser treatments
   - Microneedling
   - Botox vs fillers

4. **Pathophysiology & Treatment**
   - Rosacea treatment plans
   - Melasma management
   - Adult acne approaches

5. **Holistic & Preventive Care**
   - Lifestyle effects on aging
   - Nutrition and skin health
   - Premature aging prevention

## 💡 Performance Benefits

### Before Caching
- **Sample Question Response**: ~2-5 seconds
- **Vector Search**: Required for every request
- **AI Generation**: Full processing every time

### After Caching
- **Cached Sample Questions**: ~50-150ms
- **Cache Hit Rate**: Expected 70-80% for sample questions
- **Resource Savings**: Reduces AI API calls and vector searches

## 🛠 Troubleshooting

### Redis Not Connected
- **Symptom**: Cache operations show `connected: false`
- **Solution**: Start Redis with `docker compose up -d redis`

### Cache Not Working
- **Check**: Redis health with `docker compose ps`
- **Check**: Redis logs with `docker compose logs redis`
- **Test**: Run `node test-cache.js` to verify implementation

### Performance Issues
- **Monitor**: Use cache stats endpoint to check hit rates
- **Optimize**: Adjust TTL values based on usage patterns
- **Scale**: Consider Redis clustering for high traffic

## 🔒 Security Notes

- Cache management endpoints are **development only**
- Redis data persists in `./redis_data` volume
- No sensitive user data is cached
- Only AI responses and metadata are stored

## 🚀 Future Enhancements

1. **Cache Warming**: Pre-populate cache with common responses
2. **Analytics**: Track cache hit rates and popular questions
3. **Distributed Caching**: Redis cluster for scaling
4. **Smart Invalidation**: Update cache when knowledge base changes
5. **Compression**: Reduce memory usage for large responses