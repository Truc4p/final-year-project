const redis = require('redis');
const secretManager = require('./secretManager');

class CacheService {
    constructor() {
        this.client = null;
        this.isConnected = false;
        this.isInitializing = false;
        this.vectorService = null; // Will be injected to avoid circular dependency
        this.semanticCacheEnabled = true; // Enable semantic similarity matching
        this.similarityThreshold = 0.85; // 85% similarity threshold (adjustable: 0.80-0.95)
        // Don't initialize immediately - wait for lazy initialization
    }

    /**
     * Set vector service for semantic similarity (dependency injection)
     * @param {Object} vectorService - The vector service instance
     */
    setVectorService(vectorService) {
        this.vectorService = vectorService;
        console.log('✅ CacheService: Vector service injected for semantic matching');
    }

    async ensureInitialized() {
        if (this.isConnected || this.isInitializing) {
            return;
        }
        
        this.isInitializing = true;
        await this.initializeClient();
        this.isInitializing = false;
    }

    async initializeClient() {
        try {
            // Get Redis URL from secret manager
            const redisUrl = await secretManager.getSecret('REDIS_URL').catch(() => 'redis://localhost:6379');
            
            // Create Redis client
            this.client = redis.createClient({
                url: redisUrl,
                socket: {
                    connectTimeout: 5000,
                    lazyConnect: true,
                    reconnectStrategy: (retries) => {
                        if (retries > 10) {
                            return new Error('Too many retries');
                        }
                        return Math.min(retries * 50, 1000);
                    }
                }
            });

            // Event handlers
            this.client.on('error', (err) => {
                console.error('❌ Redis connection error:', err.message);
                this.isConnected = false;
            });

            this.client.on('connect', () => {
                console.log('🔗 Redis client connecting...');
            });

            this.client.on('ready', () => {
                console.log('✅ Redis client connected successfully');
                this.isConnected = true;
            });

            this.client.on('end', () => {
                console.log('🔌 Redis client disconnected');
                this.isConnected = false;
            });

            // Connect to Redis
            await this.client.connect();
        } catch (error) {
            console.error('❌ Failed to initialize Redis client:', error.message);
            console.log('ℹ️ Cache will be bypassed. To enable caching, ensure Redis is running.');
            this.isConnected = false;
        }
    }

    /**
     * Generate cache key for AI dermatology responses
     * @param {string} question - The user question
     * @param {string} language - Detected language (optional)
     * @returns {string} Cache key
     */
    generateAIDermatologyKey(question, language = 'en') {
        // Normalize the question: trim, lowercase, remove extra spaces
        const normalizedQuestion = question.trim().toLowerCase().replace(/\s+/g, ' ');
        
        // Create hash-like key to handle long questions
        const questionHash = Buffer.from(normalizedQuestion).toString('base64').slice(0, 50);
        
        return `ai_dermatology:${language}:${questionHash}:${normalizedQuestion.slice(0, 100)}`;
    }

    /**
     * Get cached AI dermatology response with semantic similarity matching
     * @param {string} question - The user question
     * @param {string} language - Detected language
     * @returns {Object|null} Cached response or null
     */
    async getAIDermatologyResponse(question, language = 'en') {
        await this.ensureInitialized();
        
        if (!this.isConnected || !this.client) {
            console.log('⚠️ Redis not connected, skipping cache lookup');
            return null;
        }

        try {
            // Step 1: Try exact match first (fastest)
            const exactKey = this.generateAIDermatologyKey(question, language);
            console.log(`🔍 Step 1: Looking for exact match: ${exactKey.slice(0, 80)}...`);
            
            const exactCached = await this.client.get(exactKey);
            if (exactCached) {
                console.log('✅ Found exact cached response (exact string match)');
                const parsed = JSON.parse(exactCached);
                parsed._cacheType = 'exact';
                return parsed;
            }
            
            console.log('❌ No exact match found');
            
            // Step 2: Try semantic similarity matching (if enabled and vectorService available)
            if (this.semanticCacheEnabled && this.vectorService) {
                console.log(`🧠 Step 2: Trying semantic similarity matching (threshold: ${this.similarityThreshold})...`);
                const semanticMatch = await this.findSemanticallySimilarCache(question, language);
                
                if (semanticMatch) {
                    console.log(`✅ Found semantically similar cached response (similarity: ${semanticMatch.similarity.toFixed(3)})`);
                    console.log(`📝 Original question: "${semanticMatch.originalQuestion}"`);
                    console.log(`📝 Current question: "${question}"`);
                    semanticMatch.response._cacheType = 'semantic';
                    semanticMatch.response._similarity = semanticMatch.similarity;
                    semanticMatch.response._originalQuestion = semanticMatch.originalQuestion;
                    return semanticMatch.response;
                }
                
                console.log('❌ No semantically similar cached response found');
            } else {
                if (!this.semanticCacheEnabled) {
                    console.log('ℹ️ Semantic cache disabled, skipping similarity matching');
                } else {
                    console.log('⚠️ Vector service not available, skipping semantic matching');
                }
            }
            
            return null;
        } catch (error) {
            console.error('❌ Error getting cached AI response:', error);
            return null;
        }
    }

    /**
     * Find semantically similar cached questions using embeddings
     * @param {string} question - The user question
     * @param {string} language - Detected language
     * @returns {Object|null} {response, similarity, originalQuestion} or null
     */
    async findSemanticallySimilarCache(question, language = 'en') {
        try {
            if (!this.vectorService || !this.vectorService.isInitialized) {
                return null;
            }

            const startTime = Date.now();
            
            // Get all cached question keys for this language
            const pattern = `ai_dermatology:${language}:*`;
            const keys = await this.client.keys(pattern);
            
            if (keys.length === 0) {
                console.log('ℹ️ No cached questions found for semantic comparison');
                return null;
            }

            console.log(`🔍 Scanning ${keys.length} cached questions for semantic similarity...`);

            // Generate embedding for the current question
            const currentEmbedding = await this.vectorService.embeddings.embedQuery(question);

            let bestMatch = null;
            let highestSimilarity = 0;

            // Compare with each cached question
            for (const key of keys) {
                try {
                    const cached = await this.client.get(key);
                    if (!cached) continue;

                    const parsedCache = JSON.parse(cached);
                    const cachedQuestion = parsedCache.question;

                    // Generate embedding for cached question
                    const cachedEmbedding = await this.vectorService.embeddings.embedQuery(cachedQuestion);

                    // Calculate cosine similarity
                    const similarity = this.cosineSimilarity(currentEmbedding, cachedEmbedding);

                    // Track best match
                    if (similarity > highestSimilarity && similarity >= this.similarityThreshold) {
                        highestSimilarity = similarity;
                        bestMatch = {
                            response: parsedCache,
                            similarity: similarity,
                            originalQuestion: cachedQuestion,
                            cacheKey: key
                        };
                    }
                } catch (err) {
                    console.warn(`⚠️ Error processing cached key ${key}:`, err.message);
                    continue;
                }
            }

            const duration = Date.now() - startTime;
            console.log(`⏱️ Semantic search completed in ${duration}ms`);

            if (bestMatch) {
                console.log(`🎯 Best match found with similarity: ${highestSimilarity.toFixed(3)}`);
            }

            return bestMatch;
        } catch (error) {
            console.error('❌ Error in semantic similarity search:', error);
            return null;
        }
    }

    /**
     * Calculate cosine similarity between two vectors
     * @param {Array<number>} vecA - First vector
     * @param {Array<number>} vecB - Second vector
     * @returns {number} Similarity score (0-1)
     */
    cosineSimilarity(vecA, vecB) {
        if (vecA.length !== vecB.length) {
            throw new Error('Vectors must have the same length');
        }

        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }

        normA = Math.sqrt(normA);
        normB = Math.sqrt(normB);

        if (normA === 0 || normB === 0) {
            return 0;
        }

        return dotProduct / (normA * normB);
    }

    /**
     * Cache AI dermatology response
     * @param {string} question - The user question
     * @param {Object} response - The AI response to cache
     * @param {string} language - Detected language
     * @param {number} ttl - Time to live in seconds (default: 6 months for sample questions, 1 month for regular)
     */
    async setAIDermatologyResponse(question, response, language = 'en', ttl = 15552000) {
        await this.ensureInitialized();
        
        if (!this.isConnected || !this.client) {
            console.log('⚠️ Redis not connected, skipping cache storage');
            return false;
        }

        try {
            const key = this.generateAIDermatologyKey(question, language);
            console.log(`💾 Caching AI dermatology response: ${key}`);
            
            const cacheData = {
                question,
                response: response.response,
                sources: response.sources,
                images: response.images || [],
                timestamp: new Date().toISOString(),
                language,
                cached: true
            };
            
            await this.client.setEx(key, ttl, JSON.stringify(cacheData));
            console.log('✅ AI dermatology response cached successfully');
            return true;
        } catch (error) {
            console.error('❌ Error caching AI response:', error);
            return false;
        }
    }

    /**
     * Check if a question is a common sample question
     * @param {string} question - The user question
     * @returns {boolean} True if it's a sample question
     */
    isSampleQuestion(question) {
        const normalizedQuestion = question.trim().toLowerCase();
        
        // Complete list of sample question patterns from frontend Vue file
        const sampleQuestionPatterns = [
            // Fundamentals (Skin Biology & Assessment)
            'what are the different types of chemical peels and how do they work',
            'what is the difference between superficial, medium, and deep chemical peels',
            'what is the histology of the skin and how does it relate to aging',
            'how do different ethnicities experience skin aging differently',
            'what is the fitzpatrick skin type classification and why is it important',
            'how do dermatologists assess skin type and condition',
            'what is the skin barrier function and why is it important',
            'what factors contribute to premature skin aging',
            
            // Ingredients & Formulations
            'what ingredients should i look for in an anti-aging serum',
            'how does retinol work and what are the best practices for using it',
            'what is the difference between chemical and physical sunscreens',
            'can you explain what peptides do in skincare products',
            'how does vitamin c benefit the skin and how should it be formulated',
            'what concentration of niacinamide is most effective',
            'can you explain the benefits of hyaluronic acid',
            'what are the benefits of ceramides for the skin barrier',
            'can i use retinol and vitamin c together',
            'what ingredients should not be mixed in a skincare routine',
            'how do antioxidants protect the skin from free radical damage',
            
            // Chemical Peels & Procedures
            'how should i prepare my skin before getting a chemical peel',
            'what are the potential side effects and complications of chemical peels',
            'can you explain the mechanism of action of glycolic acid peels',
            'what are the contraindications for tca peels',
            'how do you treat post-inflammatory hyperpigmentation after a peel',
            'how should i care for my skin after a medium-depth chemical peel',
            
            // Laser & Advanced Treatments
            'what types of lasers are used for hair removal and how do they work',
            'can you explain fractional co₂ laser resurfacing',
            'what is ipl therapy used for',
            'how do lasers treat pigmentation issues like melasma',
            'what are the risks of laser treatments for darker skin tones',
            'how do i choose the right laser treatment for acne scars',
            'what is the recovery time for ablative vs non-ablative laser treatments',
            'can lasers treat vascular lesions like spider veins',
            'what is microdermabrasion and how does it benefit the skin',
            'how does microneedling stimulate collagen production',
            'what are dermal fillers and what areas can they be used on',
            'what is the difference between botox and fillers',
            'what is thread lifting and how long do results last',
            'how does radiofrequency treatment work for skin rejuvenation',
            'what are the principles of facial volume restoration',
            'how do you assess and treat facial asymmetry',
            
            // Cosmetic Dermatology & Adverse Reactions
            'what is the difference between cosmetics and cosmeceuticals',
            'what causes contact dermatitis from cosmetics',
            'how can i identify if i am allergic to a skincare ingredient',
            'what ingredients are most likely to cause skin sensitization',
            'how do i treat cosmetic-induced acne (acne cosmetica)',
            'what should i do if my skin becomes red and irritated after using a new product',
            'how can i rebuild my damaged skin barrier',
            'what causes perioral dermatitis and how is it treated',
            'can makeup cause or worsen skin conditions',
            
            // Skin Conditions & Treatment
            'what is a comprehensive treatment plan for rosacea',
            'how should melasma be treated in different skin types',
            'what are the best approaches for treating adult acne',
            'how does hormonal acne differ from teenage acne',
            'what are the best treatments for hyperpigmentation',
            'how do you treat keratosis pilaris effectively',
            'what causes seborrheic dermatitis and how is it managed',
            'can diet affect skin conditions like acne and eczema',
            
            // Lifestyle & Prevention
            'how does lifestyle affect skin aging and appearance',
            'what role does nutrition play in skin health',
            'how does sleep affect skin regeneration',
            'what are the effects of stress on skin conditions',
            'how can i prevent premature aging of my skin',
            'what are the most important steps in a daily skincare routine',
            'what is a good anti-aging skincare routine for someone in their 30s',
            'how does pollution affect skin health and how can i protect against it',
            
            // Advanced Science & Mechanisms
            'what is the molecular mechanism of collagen degradation in aging skin',
            'how do different wavelengths of light affect the skin',
            'what is the role of matrix metalloproteinases (mmps) in skin aging',
            'can you explain the difference between chronological and photoaging',
            'how do growth factors work in anti-aging skincare',
            'what is the role of the skin microbiome in skin health',
            'can you explain what transepidermal water loss (tewl) means',
            
            // Complex/Integrated Cases
            'i have acne scars, hyperpigmentation, and fine lines. what comprehensive treatment approach would you recommend',
            'how do i combine professional treatments (like lasers and peels) with at-home skincare',
            'what is the best protocol for treating photoaging in asian skin',
            'can you create a complete skincare routine for sensitive, acne-prone skin',
            'i am 45 with sun damage, wrinkles, and brown spots. what treatments should i consider',
            'what is the best treatment sequence for someone wanting to address multiple concerns',
            'how long should i wait between different cosmetic procedures',
            'can you explain the layering order for skincare products'
        ];

        return sampleQuestionPatterns.some(pattern => 
            normalizedQuestion.includes(pattern) || 
            pattern.includes(normalizedQuestion.split(' ').slice(0, 5).join(' '))
        );
    }

    /**
     * Get cache statistics
     * @returns {Object} Cache statistics
     */
    async getCacheStats() {
        await this.ensureInitialized();
        
        if (!this.isConnected || !this.client) {
            return { connected: false };
        }

        try {
            const info = await this.client.info('memory');
            const keys = await this.client.keys('ai_dermatology:*');
            
            return {
                connected: true,
                totalKeys: keys.length,
                memoryInfo: info,
                uptime: await this.client.info('server')
            };
        } catch (error) {
            console.error('❌ Error getting cache stats:', error);
            return { connected: false, error: error.message };
        }
    }

    /**
     * Clear all AI dermatology cache 
     * @returns {number} Number of keys deleted
     */
    async clearAIDermatologyCache() {
        await this.ensureInitialized();
        
        if (!this.isConnected || !this.client) {
            return 0;
        }

        try {
            const keys = await this.client.keys('ai_dermatology:*');
            if (keys.length > 0) {
                const deleted = await this.client.del(keys);
                console.log(`🗑️ Cleared ${deleted} AI dermatology cache entries`);
                return deleted;
            }
            return 0;
        } catch (error) {
            console.error('❌ Error clearing cache:', error);
            return 0;
        }
    }

    /**
     * Configure semantic cache settings
     * @param {Object} options - Configuration options
     * @param {boolean} options.enabled - Enable/disable semantic matching
     * @param {number} options.threshold - Similarity threshold (0.0-1.0)
     */
    configureSemanticCache(options = {}) {
        if (typeof options.enabled === 'boolean') {
            this.semanticCacheEnabled = options.enabled;
            console.log(`🔧 Semantic cache ${options.enabled ? 'enabled' : 'disabled'}`);
        }
        
        if (typeof options.threshold === 'number') {
            if (options.threshold >= 0 && options.threshold <= 1) {
                this.similarityThreshold = options.threshold;
                console.log(`🔧 Similarity threshold set to ${(options.threshold * 100).toFixed(0)}%`);
            } else {
                console.warn('⚠️ Invalid threshold value. Must be between 0 and 1');
            }
        }
    }

    /**
     * Get semantic cache configuration
     * @returns {Object} Current configuration
     */
    getSemanticCacheConfig() {
        return {
            enabled: this.semanticCacheEnabled,
            threshold: this.similarityThreshold,
            thresholdPercentage: `${(this.similarityThreshold * 100).toFixed(0)}%`
        };
    }

    /**
     * Close Redis connection
     */
    async disconnect() {
        if (this.client) {
            await this.client.quit();
            console.log('👋 Redis client disconnected');
        }
    }
}

// Create singleton instance
const cacheService = new CacheService();

module.exports = cacheService;