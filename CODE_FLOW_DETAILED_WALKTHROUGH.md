# Code Flow: Detailed Walkthrough with Code Snippets

## 🎯 Complete Request-Response Cycle

### **User sends query: "I have red patches on my cheeks"**

---

## 1️⃣ Frontend Sends Request

### **Vue.js Frontend** (`AIDermatologyExpert.vue`)
```javascript
// User clicks send button
async sendMessage() {
    const message = "I have red patches on my cheeks";
    
    try {
        const response = await axios.post(
            '/api/ai-dermatology-expert/chat',
            {
                message: message,
                conversationHistory: this.conversationHistory
            }
        );
        
        // Display response
        this.messages.push({
            role: 'assistant',
            content: response.data.response,
            sources: response.data.sources
        });
    } catch (error) {
        console.error('Error:', error);
    }
}
```

**HTTP Request:**
```
POST /api/ai-dermatology-expert/chat HTTP/1.1
Content-Type: application/json

{
    "message": "I have red patches on my cheeks",
    "conversationHistory": [
        {"role": "user", "content": "What is rosacea?"},
        {"role": "assistant", "content": "Rosacea is a chronic..."}
    ]
}
```

---

## 2️⃣ Backend Route Handler

### **Route Definition** (`backend/routes/skin-study/aiDermatologyExpert.js`)
```javascript
/**
 * POST /api/ai-dermatology-expert/chat
 * Send a message to the AI Dermatology Expert
 */
router.post('/chat', aiDermatologyExpertController.chat);
```

**Request flows to:** `aiDermatologyExpertController.chat()`

---

## 3️⃣ Controller: Main Logic

### **Controller** (`backend/controllers/skin-study/aiDermatologyExpertController.js`)

```javascript
exports.chat = async (req, res) => {
    try {
        const totalStart = performanceMonitor.startTimer();
        const { message, conversationHistory } = req.body;

        console.log(`[object Object] question: "${message}"`);

        // ===== STEP 1: Language Detection & Translation =====
        console.log('🌍 Detecting language and translating if needed...');
        const translationResult = await geminiService.detectAndTranslate(message);
        const queryForRAG = translationResult.translatedText;
        
        console.log(`📝 Query for RAG: "${queryForRAG}"`);
        // Output: "I have red patches on my cheeks" (already English)

        // ===== STEP 2: Check Cache =====
        const isSampleQuestion = cacheService.isSampleQuestion(message);
        console.log(`🎯 Is sample question: ${isSampleQuestion}`);

        let cachedResponse = null;
        if (isSampleQuestion || !conversationHistory || conversationHistory.length === 0) {
            cachedResponse = await cacheService.getAIDermatologyResponse(
                message, 
                translationResult.languageName || 'English'
            );
        }

        if (cachedResponse) {
            console.log(`⚡ Returning cached response`);
            const totalTime = performanceMonitor.endTimer(totalStart);
            cachedResponse._performance = {
                totalTime,
                cached: true,
                cacheType: 'exact'
            };
            return res.json(cachedResponse);
        }

        // ===== STEP 3: No Cache Hit - Generate New Response =====
        console.log('🔄 No cache hit, generating new response...');

        // ===== STEP 4: RAG Query =====
        const ragResult = await vectorService.ragQuery(queryForRAG, conversationHistory || []);
        // This will:
        // 1. Generate embedding for query
        // 2. Search Qdrant vector database
        // 3. Return top 3 relevant chunks

        // ===== STEP 5: Generate Response with Context =====
        const result = await geminiService.generateResponseWithContext(
            message,
            ragResult.context,
            conversationHistory || []
        );

        const totalTime = performanceMonitor.endTimer(totalStart);
        performanceMonitor.record('totalTime', totalTime);

        // ===== STEP 6: Build Response Object =====
        const responseObj = {
            response: result.response,
            sources: ragResult.sources,
            images: result.images || [],
            timestamp: new Date(),
            _performance: {
                totalTime,
                contextSize: ragResult.context.length,
                chunks: ragResult.sources.length,
                detectedLanguage: translationResult.languageName,
                cached: false
            }
        };

        // ===== STEP 7: Cache Response =====
        if (isSampleQuestion || !conversationHistory || conversationHistory.length === 0) {
            console.log('💾 Caching response for future use...');
            await cacheService.setAIDermatologyResponse(
                message,
                result,
                translationResult.languageName || 'English',
                2592000 // 30 days
            );
        }

        res.json(responseObj);
    } catch (error) {
        console.error('AI Chat error:', error);
        res.status(500).json({ error: 'Failed to generate response' });
    }
};
```

---

## 4️⃣ Language Detection & Translation

### **Gemini Service** (`backend/services/geminiService.js`)

```javascript
async detectAndTranslate(text) {
    await this.ensureInitialized();
    
    try {
        console.log(`🌐 Detecting language for text: "${text}"`);
        
        const prompt = `Analyze this text and respond ONLY with a JSON object:
{
  "language": "<detected language code>",
  "languageName": "<language name>",
  "translation": "<English translation>"
}

Text to analyze: "${text}"`;

        const result = await this.translationModel.generateContent(prompt);
        const response = await result.response;
        let responseText = response.text().trim();
        
        // Remove markdown code blocks if present
        responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        
        const parsed = JSON.parse(responseText);
        
        const isEnglish = parsed.language === 'en';
        
        console.log(`✅ Detected language: ${parsed.languageName}`);
        
        return {
            isEnglish: isEnglish,
            originalText: text,
            translatedText: parsed.translation,
            detectedLanguage: parsed.language,
            languageName: parsed.languageName
        };
    } catch (error) {
        console.error('⚠️ Translation failed, using original text:', error.message);
        return { 
            isEnglish: true, 
            originalText: text, 
            translatedText: text, 
            detectedLanguage: 'unknown' 
        };
    }
}
```

**Output for our example:**
```javascript
{
    isEnglish: true,
    originalText: "I have red patches on my cheeks",
    translatedText: "I have red patches on my cheeks",
    detectedLanguage: "en",
    languageName: "English"
}
```

---

## 5️⃣ RAG Query: Vector Search

### **Vector Service** (`backend/services/vectorService.js`)

```javascript
async ragQuery(userQuery, conversationHistory = []) {
    try {
        const startTime = performanceMonitor.startTimer();
        
        console.log('\n' + '='.repeat(80));
        console.log('🔍 RAG QUERY ANALYSIS');
        console.log('='.repeat(80));
        console.log(`📝 User Query: "${userQuery}"`);
        
        // ===== STEP 1: Generate Query Embedding =====
        const searchStart = performanceMonitor.startTimer();
        const relevantDocs = await this.searchRelevantDocs(userQuery, 3, false);
        const searchTime = performanceMonitor.endTimer(searchStart);
        
        console.log(`\n📚 Retrieved ${relevantDocs.length} chunks from Qdrant:\n`);
        
        // ===== STEP 2: Analyze Scores =====
        const scores = relevantDocs.map(d => d.score);
        const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        const maxScore = Math.max(...scores);
        const minScore = Math.min(...scores);
        
        console.log(`📈 Score Statistics:`);
        console.log(`   Highest: ${maxScore.toFixed(4)} (${(maxScore * 100).toFixed(1)}%)`);
        console.log(`   Average: ${avgScore.toFixed(4)} (${(avgScore * 100).toFixed(1)}%)`);
        console.log(`   Lowest:  ${minScore.toFixed(4)} (${(minScore * 100).toFixed(1)}%)`);
        
        // ===== STEP 3: Display Chunk Details =====
        console.log('\n💡 Chunk Details (sorted by relevance):\n');
        relevantDocs.forEach((doc, idx) => {
            const chunkId = doc.metadata.chunkIndex;
            const score = doc.score;
            const preview = doc.content.substring(0, 120).replace(/\n/g, ' ');
            
            console.log(`   ${idx + 1}. Chunk #${chunkId}`);
            console.log(`      Score: ${score.toFixed(4)} (${(score * 100).toFixed(1)}%)`);
            console.log(`      Text: "${preview}..."`);
        });
        
        // ===== STEP 4: Build Context =====
        const context = relevantDocs
            .map((doc, idx) => {
                const bookTitle = doc.metadata.source;
                return `[Source ${idx + 1} - "${bookTitle}"]\n${doc.content}`;
            })
            .join('\n\n---\n\n');
        
        // ===== STEP 5: Return Results =====
        return {
            context: context,
            sources: relevantDocs.map(doc => ({
                text: doc.content.substring(0, 200) + '...',
                score: doc.score,
                metadata: doc.metadata
            }))
        };
    } catch (error) {
        console.error('❌ Error in RAG query:', error);
        throw error;
    }
}
```

### **Search Relevant Docs** (The Vector Search Magic!)

```javascript
async searchRelevantDocs(query, limit = 5, debugMode = false) {
    await this.ensureInitialized();
    
    try {
        // ===== STEP 1: Generate Query Embedding =====
        console.log(`\n🔍 Generating embedding for query: "${query}"`);
        const queryEmbedding = await this.embeddings.embedQuery(query);
        
        console.log(`   Query Vector Length: ${queryEmbedding.length}`);
        console.log(`   Query Vector Sample: [${queryEmbedding.slice(0, 5).map(v => v.toFixed(4)).join(', ')}...]`);
        
        // Output:
        // Query Vector Length: 768
        // Query Vector Sample: [0.2340, -0.5670, 0.8910, 0.1230, -0.4560...]
        
        // ===== STEP 2: Search Qdrant Vector Database =====
        console.log(`\n🔎 Searching Qdrant collection...`);
        const searchResults = await this.qdrantClient.search(this.collectionName, {
            vector: queryEmbedding,    // 768-dimensional vector
            limit: limit,               // Top 3 results
            with_payload: true,
            score_threshold: 0.4        // Filter out scores < 0.4
        });
        
        console.log(`   Found ${searchResults.length} results from Qdrant`);
        
        // ===== STEP 3: Display Results =====
        searchResults.forEach((result, idx) => {
            console.log(`   ${idx + 1}. Score: ${result.score.toFixed(4)} (${(result.score * 100).toFixed(2)}%)`);
            console.log(`      Chunk: ${result.payload.metadata.chunkIndex}`);
            console.log(`      Text: "${result.payload.text.substring(0, 60)}..."`);
        });
        
        // ===== STEP 4: Return Formatted Results =====
        return searchResults.map(result => ({
            content: result.payload.text,
            metadata: result.payload.metadata,
            score: result.score
        }));
    } catch (error) {
        console.error('Error searching documents:', error);
        throw error;
    }
}
```

**Console Output for our example:**
```
🔍 Generating embedding for query: "I have red patches on my cheeks"
   Query Vector Length: 768
   Query Vector Sample: [0.2340, -0.5670, 0.8910, 0.1230, -0.4560...]

🔎 Searching Qdrant collection...
   Found 3 results from Qdrant

   1. Score: 0.8234 (82.34%)
      Chunk: 45
      Text: "Rosacea is a chronic inflammatory skin condition..."

   2. Score: 0.7156 (71.56%)
      Chunk: 127
      Text: "Contact dermatitis presents as localized erythema..."

   3. Score: 0.6234 (62.34%)
      Chunk: 203
      Text: "Inflammatory skin conditions require proper diagnosis..."
```

---

## 6️⃣ Generate Response with Gemini LLM

### **Gemini Service** (`backend/services/geminiService.js`)

```javascript
async generateResponseWithContext(userMessage, ragContext, conversationHistory = []) {
    await this.ensureInitialized();
    
    try {
        console.log(`📚 Using RAG context for query: "${userMessage}"`);
        
        // ===== STEP 1: Build Comprehensive Prompt =====
        let fullPrompt = this.systemContext;
        
        // System instruction
        fullPrompt += `\n\nYou are a Virtual Dermatology Expert with extensive knowledge in:
- Dermatology and skin conditions
- Skincare ingredients and formulations
- Cosmetic procedures and treatments
- Evidence-based skincare routines
- Product recommendations based on skin type and concerns

You provide professional, evidence-based advice while being empathetic.`;
        
        // ===== STEP 2: Add RAG Context =====
        fullPrompt += '\n\n=== RELEVANT KNOWLEDGE FROM DERMATOLOGY TEXTBOOK ===\n';
        fullPrompt += ragContext;  // The 3 retrieved chunks
        fullPrompt += '\n=== END OF KNOWLEDGE BASE ===\n\n';
        
        // ===== STEP 3: Add Citation Instructions =====
        fullPrompt += `CRITICAL INSTRUCTIONS:
1. Use the information from the knowledge base above
2. Cite your sources inline using [1], [2], [3] format
3. Place citations at end of sentences
4. At END of response, add "### References" section

CITATION REQUIREMENT:
- Use bracketed numbers [1], [2], [3] to reference source chunks
- Example: "Rosacea is a chronic inflammatory condition.[1]"
- At the END, add:
  ### References
  [1] Fitzpatrick's Dermatology in General Medicine
  [2] Textbook of Cosmetic Dermatology
  [3] Cosmetic Dermatology - Principles and Practice`;
        
        // ===== STEP 4: Add Conversation History =====
        if (conversationHistory.length > 0) {
            fullPrompt += '\n\nPrevious conversation:\n';
            conversationHistory.slice(-5).forEach(msg => {
                fullPrompt += `${msg.role === 'user' ? 'Patient' : 'Dermatology Expert'}: ${msg.content}\n`;
            });
        }
        
        // ===== STEP 5: Add Current Question =====
        fullPrompt += `\nPatient: ${userMessage}\nDermatology Expert:`;
        
        // ===== STEP 6: Call Gemini API =====
        console.log('🚀 Calling Gemini API...');
        const genStart = performanceMonitor.startTimer();
        
        const result = await this.generateWithRetry(fullPrompt);
        const response = await result.response;
        let text = response.text();
        
        const genTime = performanceMonitor.endTimer(genStart);
        console.log(`⏱️ AI Generation: ${genTime}ms`);
        
        // ===== STEP 7: Return Response =====
        return {
            response: text,
            method: 'rag-vector-search'
        };
    } catch (error) {
        console.error('Error generating RAG response:', error);
        throw new Error('Failed to generate response with RAG context');
    }
}
```

**Gemini Model Configuration:**
```javascript
this.model = this.genAI.getGenerativeModel({ 
    model: 'gemini-2.0-flash',
    generationConfig: {
        temperature: 0.7,           // Balanced creativity/accuracy
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 4096       // Allow detailed responses
    }
});
```

---

## 7️⃣ Gemini Generates Response

### **Gemini API Call**

**Input to Gemini:**
```
You are a Virtual Dermatology Expert...

=== RELEVANT KNOWLEDGE FROM DERMATOLOGY TEXTBOOK ===
[Source 1 - "Fitzpatrick's Dermatology in General Medicine"]
Rosacea is a chronic inflammatory skin condition characterized by facial 
erythema, telangiectasia, papules, and pustules. It typically affects the 
central face and is more common in fair-skinned individuals...

[Source 2 - "Textbook of Cosmetic Dermatology"]
Contact dermatitis presents as localized erythema, pruritus, and inflammation 
following exposure to allergens or irritants. The condition can be acute or 
chronic depending on the duration and intensity of exposure...

[Source 3 - "Cosmetic Dermatology - Principles and Practice"]
Inflammatory skin conditions require proper diagnosis through clinical 
examination and sometimes patch testing. Treatment options vary based on 
the underlying cause and severity of the condition...
=== END OF KNOWLEDGE BASE ===

Patient: I have red patches on my cheeks
Dermatology Expert:
```

**Gemini Output:**
```
Based on your description of red patches on your cheeks, there are several 
possible conditions that could be responsible. Here are the most likely 
possibilities:

## Possible Conditions

### 1. Rosacea[1]
Rosacea is a chronic inflammatory skin condition characterized by facial 
erythema (redness) and is more common in fair-skinned individuals.[1] 
The condition typically affects the central face, including the cheeks, 
nose, and forehead. Key features include:
- Persistent facial redness
- Visible blood vessels (telangiectasia)
- Papules and pustules in some cases[1]

### 2. Contact Dermatitis[2]
Contact dermatitis presents as localized erythema and inflammation following 
exposure to allergens or irritants.[2] This could occur if you've recently 
used new skincare products, cosmetics, or been exposed to irritating substances.

### 3. General Inflammatory Response[3]
Inflammatory skin conditions require proper diagnosis through clinical 
examination.[3] The redness could be a response to environmental factors, 
stress, or other triggers.

## Recommendations

1. **Avoid Triggers**: Identify and avoid potential irritants
2. **Gentle Skincare**: Use mild, fragrance-free products
3. **Sun Protection**: Use broad-spectrum SPF 30+ daily
4. **Professional Evaluation**: Consult a dermatologist for proper diagnosis

### References
[1] Fitzpatrick's Dermatology in General Medicine
[2] Textbook of Cosmetic Dermatology
[3] Cosmetic Dermatology - Principles and Practice
```

---

## 8️⃣ Save to Cache & Database

### **Cache Service** (`backend/services/cacheService.js`)

```javascript
async setAIDermatologyResponse(question, responseData, language, ttl) {
    try {
        console.log('💾 Caching response...');
        
        // Save to MongoDB with TTL
        const cacheEntry = {
            question: question,
            response: responseData.response,
            sources: responseData.sources || [],
            language: language,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + ttl * 1000)
        };
        
        await db.collection('ai_dermatology_cache').insertOne(cacheEntry);
        console.log('✅ Response cached successfully');
    } catch (error) {
        console.error('Error caching response:', error);
    }
}
```

---

## 9️⃣ Return Response to Frontend

### **HTTP Response**

```json
{
    "response": "Based on your description of red patches on your cheeks, there are several possible conditions...",
    "sources": [
        {
            "text": "Rosacea is a chronic inflammatory skin condition characterized by facial erythema...",
            "score": 0.8234,
            "metadata": {
                "source": "Fitzpatrick's Dermatology in General Medicine",
                "chunkIndex": 45
            }
        },
        {
            "text": "Contact dermatitis presents as localized erythema, pruritus, and inflammation...",
            "score": 0.7156,
            "metadata": {
                "source": "Textbook of Cosmetic Dermatology",
                "chunkIndex": 127
            }
        },
        {
            "text": "Inflammatory skin conditions require proper diagnosis through clinical examination...",
            "score": 0.6234,
            "metadata": {
                "source": "Cosmetic Dermatology - Principles and Practice",
                "chunkIndex": 203
            }
        }
    ],
    "timestamp": "2024-11-30T11:05:42.567Z",
    "_performance": {
        "totalTime": 4523,
        "contextSize": 4187,
        "chunks": 3,
        "detectedLanguage": "English",
        "cached": false
    }
}
```

---

## 🔟 Frontend Displays Response

### **Vue.js Frontend** (`AIDermatologyExpert.vue`)

```javascript
// Response received
this.messages.push({
    role: 'assistant',
    content: response.data.response,
    sources: response.data.sources,
    timestamp: response.data.timestamp
});

// Display sources
response.data.sources.forEach((source, idx) => {
    console.log(`Source ${idx + 1}: ${source.metadata.source}`);
    console.log(`Relevance: ${(source.score * 100).toFixed(1)}%`);
    console.log(`Preview: ${source.text.substring(0, 100)}...`);
});

// Show performance metrics
console.log(`Total time: ${response.data._performance.totalTime}ms`);
console.log(`Chunks retrieved: ${response.data._performance.chunks}`);
```

---

## 📊 Complete Timing Breakdown

```
Total Request Time: ~4,500 ms

1. Language Detection:        ~800 ms
   └─ Gemini API call to detect language

2. Cache Check:               ~50 ms
   └─ MongoDB query

3. Query Embedding:           ~400 ms
   └─ Gemini text-embedding-004 model

4. Vector Search:             ~100 ms
   └─ Qdrant cosine similarity search

5. Context Building:          ~50 ms
   └─ String concatenation

6. Response Generation:       ~2,500 ms
   └─ Gemini LLM generation with context

7. Response Formatting:       ~50 ms
   └─ JSON serialization

8. Database Save:             ~600 ms
   └─ MongoDB write operation

─────────────────────────────────────
Total:                        ~4,500 ms
```

---

## 🎯 Key Code Locations

| Step | File | Function |
|------|------|----------|
| 1. Route | `backend/routes/skin-study/aiDermatologyExpert.js` | `router.post('/chat', ...)` |
| 2. Controller | `backend/controllers/skin-study/aiDermatologyExpertController.js` | `exports.chat()` |
| 3. Language Detection | `backend/services/geminiService.js` | `detectAndTranslate()` |
| 4. Cache Check | `backend/services/cacheService.js` | `getAIDermatologyResponse()` |
| 5. RAG Query | `backend/services/vectorService.js` | `ragQuery()` |
| 6. Vector Search | `backend/services/vectorService.js` | `searchRelevantDocs()` |
| 7. Response Generation | `backend/services/geminiService.js` | `generateResponseWithContext()` |
| 8. Cache Save | `backend/services/cacheService.js` | `setAIDermatologyResponse()` |

---

This document provides the complete code walkthrough showing exactly how a user query flows through the entire system, from frontend to backend, through vector search, LLM generation, and back to the user.

