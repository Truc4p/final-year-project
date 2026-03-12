const { QdrantClient } = require('@qdrant/js-client-rest');
const { GoogleGenerativeAIEmbeddings } = require('@langchain/google-genai');
const { RecursiveCharacterTextSplitter } = require('@langchain/textsplitters');
const { Document } = require('@langchain/core/documents');
const fs = require('fs').promises;
const path = require('path');
const performanceMonitor = require('../utils/performanceMonitor');
const secretManager = require('./secretManager');

class VectorService {
    constructor() {
        this.qdrantClient = null;
        this.embeddings = null;
        this.isInitialized = false;
        this.vectorSize = 3072; // gemini-embedding-001 dimension
        this.collectionName = 'dermatology_knowledge';
    }
    
    async initialize() {
        if (this.isInitialized) return;
        
        try {
            // Initialize Qdrant client with secrets
            const qdrantUrl = await secretManager.getSecret('QDRANT_URL').catch(() => 'http://localhost:6333');
            const qdrantApiKey = await secretManager.getSecret('QDRANT_API_KEY').catch(() => null);
            
            this.qdrantClient = new QdrantClient({
                url: qdrantUrl,
                apiKey: qdrantApiKey
            });
            
            // Initialize Gemini embeddings
            const geminiApiKey = await secretManager.getSecret('GEMINI_API_KEY');
            console.log('🆓 Using Gemini embeddings');
            this.embeddings = new GoogleGenerativeAIEmbeddings({
                apiKey: geminiApiKey,
                modelName: 'gemini-embedding-001' // Latest Gemini embedding model
            });
            
            this.isInitialized = true;
            console.log('🔗 VectorService initialized with secure credentials');
        } catch (error) {
            console.error('❌ Failed to initialize VectorService:', error.message);
            throw error;
        }
    }
    
    async ensureInitialized() {
        if (!this.isInitialized) {
            await this.initialize();
        }
    }

    /**
     * Initialize the Qdrant collection
     */
    async initializeCollection() {
        try {
            // Check if collection exists
            const collections = await this.qdrantClient.getCollections();
            const exists = collections.collections.some(
                col => col.name === this.collectionName
            );

            if (!exists) {
                // Create collection with Gemini vector size (3072)
                await this.qdrantClient.createCollection(this.collectionName, {
                    vectors: {
                        size: this.vectorSize,
                        distance: 'Cosine'
                    }
                });
                console.log(`Collection '${this.collectionName}' created successfully with vector size ${this.vectorSize}`);
            } else {
                console.log(`Collection '${this.collectionName}' already exists`);
            }
        } catch (error) {
            console.error('Error initializing collection:', error);
            throw error;
        }
    }

    /**
     * Load and process all text files from the knowledge base directory
     */
    async loadKnowledgeBase() {
        try {
            const knowledgeBasePath = path.join(
                __dirname,
                '../knowledge-sources/extracted-content'
            );
            
            // Read all files in the directory
            const files = await fs.readdir(knowledgeBasePath);
            
            // Filter for .txt files only
            const txtFiles = files.filter(file => file.endsWith('.txt'));
            
            if (txtFiles.length === 0) {
                throw new Error('No .txt files found in knowledge-sources/extracted-content/');
            }
            
            console.log(`Found ${txtFiles.length} text files:`);
            txtFiles.forEach(file => console.log(`  - ${file}`));
            
            let allDocuments = [];
            let globalChunkIndex = 0;
            
            // Process each text file
            for (const file of txtFiles) {
                const filePath = path.join(knowledgeBasePath, file);
                const content = await fs.readFile(filePath, 'utf-8');
                
                console.log(`\nProcessing: ${file}`);
                console.log(`  Content length: ${content.length} characters`);
                
                // Split the text into chunks
                const textSplitter = new RecursiveCharacterTextSplitter({
                    chunkSize: 3000,  // Larger chunks = fewer total docs = faster indexing
                    chunkOverlap: 500, // Good overlap to ensure continuity
                    separators: ['\n\n', '\n', '. ', ' ', '']
                });

                const chunks = await textSplitter.splitText(content);
                console.log(`  Created ${chunks.length} chunks`);
                
                // Map chunks to documents with metadata
                const documents = chunks.map((chunk, index) => ({
                    pageContent: chunk,
                    metadata: {
                        source: file.replace('.txt', ''),
                        fileName: file,
                        chunkIndex: globalChunkIndex + index,
                        fileChunkIndex: index,
                        totalChunksInFile: chunks.length
                    }
                }));
                
                allDocuments = allDocuments.concat(documents);
                globalChunkIndex += chunks.length;
            }
            
            console.log(`\n✅ Total documents created: ${allDocuments.length} from ${txtFiles.length} files`);
            
            return allDocuments;
        } catch (error) {
            console.error('Error loading knowledge base:', error);
            throw error;
        }
    }

    /**
     * Estimate tokens from text array (rough: 1 token ≈ 4 chars for English)
     */
    estimateTokens(texts) {
        return texts.reduce((sum, t) => sum + Math.ceil(t.length / 4), 0);
    }

    /**
     * TPM (tokens-per-minute) rate limiter for Gemini embedding API.
     * Tracks tokens in a rolling 60s window and proactively waits before exceeding quota.
     */
    createTPMTracker(maxTPM = 900000) {
        const tokenLog = []; // { timestamp, tokens }
        const self = this;
        return {
            async waitIfNeeded(tokens) {
                const now = Date.now();
                // Remove entries older than 60s
                while (tokenLog.length > 0 && now - tokenLog[0].timestamp > 60000) {
                    tokenLog.shift();
                }
                const usedTokens = tokenLog.reduce((sum, e) => sum + e.tokens, 0);
                if (usedTokens + tokens > maxTPM) {
                    const waitMs = tokenLog.length > 0
                        ? 60000 - (now - tokenLog[0].timestamp) + 2000 // wait until oldest entry expires + 2s margin
                        : 10000;
                    console.log(`   ⏱️  TPM limit approaching (${usedTokens.toLocaleString()}+${tokens.toLocaleString()} > ${maxTPM.toLocaleString()}), cooling ${(waitMs/1000).toFixed(0)}s...`);
                    await new Promise(resolve => setTimeout(resolve, waitMs));
                    return this.waitIfNeeded(tokens); // re-check after waiting
                }
            },
            record(tokens) {
                tokenLog.push({ timestamp: Date.now(), tokens });
            },
            getUsed() {
                const now = Date.now();
                while (tokenLog.length > 0 && now - tokenLog[0].timestamp > 60000) {
                    tokenLog.shift();
                }
                return tokenLog.reduce((sum, e) => sum + e.tokens, 0);
            }
        };
    }

    /**
     * Index documents into Qdrant with TPM-aware rate limiting and resume support
     */
    async indexDocuments(documents, { resumeFrom = 0 } = {}) {
        try {
            const batchSize = 50;
            const totalBatches = Math.ceil(documents.length / batchSize);
            const startBatch = Math.floor(resumeFrom / batchSize);
            let successfulDocs = resumeFrom;
            let failedBatches = 0;
            const failedBatchNumbers = [];
            const startTime = Date.now();

            // TPM tracker: Gemini free tier ≈ 1M TPM, we cap at 900K for safety
            const tpmTracker = this.createTPMTracker(900000);

            // Checkpoint file for resume support
            const checkpointPath = path.join(__dirname, '../.vector-index-checkpoint.json');

            console.log(`Indexing ${documents.length} documents (batch size: ${batchSize}, ${totalBatches} batches)...`);
            if (resumeFrom > 0) {
                console.log(`📌 Resuming from document ${resumeFrom} (batch ${startBatch + 1})`);
            }

            const formatETA = (docsRemaining, msPerDoc) => {
                const totalMs = docsRemaining * msPerDoc;
                const mins = Math.floor(totalMs / 60000);
                const secs = Math.floor((totalMs % 60000) / 1000);
                if (mins > 60) return `~${(mins / 60).toFixed(1)}h`;
                return `~${mins}m ${secs}s`;
            };
            
            for (let i = startBatch * batchSize; i < documents.length; i += batchSize) {
                const batch = documents.slice(i, i + batchSize);
                const batchNum = Math.floor(i / batchSize) + 1;
                const texts = batch.map(doc => doc.pageContent);
                const estimatedTokens = this.estimateTokens(texts);
                
                let retries = 5;
                let success = false;
                let backoffDelay = 65000; // Start at 65s — full minute window reset + margin
                
                while (retries > 0 && !success) {
                    try {
                        // Proactively wait if we'd exceed the TPM limit
                        await tpmTracker.waitIfNeeded(estimatedTokens);

                        // Generate embeddings for batch
                        const embeddings = await this.embeddings.embedDocuments(texts);
                        
                        // Record tokens used after successful API call
                        tpmTracker.record(estimatedTokens);
                        
                        // Validate embeddings before uploading
                        const invalidEmbeddings = embeddings
                            .map((emb, idx) => ({ idx, len: Array.isArray(emb) ? emb.length : -1, allZero: Array.isArray(emb) && !emb.some(v => v !== 0) }))
                            .filter(e => e.len !== this.vectorSize || e.allZero);
                        
                        if (invalidEmbeddings.length > 0) {
                            const details = invalidEmbeddings.map(e => `doc[${e.idx}]: dim=${e.len}`).join(', ');
                            throw new Error(`RATE_LIMITED: ${details}`);
                        }
                        
                        // Prepare points for Qdrant
                        const points = batch.map((doc, index) => ({
                            id: i + index,
                            vector: embeddings[index],
                            payload: {
                                text: doc.pageContent,
                                metadata: doc.metadata
                            }
                        }));
                        
                        // Upload to Qdrant
                        await this.qdrantClient.upsert(this.collectionName, {
                            wait: true,
                            points: points
                        });
                        
                        successfulDocs += batch.length;
                        success = true;
                        
                        // Save checkpoint every 5 batches
                        if (batchNum % 5 === 0) {
                            await fs.writeFile(checkpointPath, JSON.stringify({
                                resumeFrom: i + batch.length,
                                timestamp: new Date().toISOString(),
                                totalDocs: documents.length
                            }));
                        }
                        
                        // Progress logging (every 5 batches or key milestones)
                        if (batchNum <= 3 || batchNum % 5 === 0 || batchNum === totalBatches) {
                            const pct = (successfulDocs / documents.length * 100).toFixed(1);
                            const elapsed = Date.now() - startTime;
                            const docsProcessed = successfulDocs - resumeFrom;
                            const msPerDoc = docsProcessed > 0 ? elapsed / docsProcessed : 0;
                            const remaining = documents.length - successfulDocs;
                            const eta = docsProcessed > 0 ? formatETA(remaining, msPerDoc) : '...';
                            const tpmUsed = tpmTracker.getUsed();
                            console.log(`✅ Batch ${batchNum}/${totalBatches} | ${successfulDocs}/${documents.length} docs (${pct}%) | TPM: ${(tpmUsed/1000).toFixed(0)}K/900K | ETA: ${eta}`);
                        }
                        
                        // Small base delay — TPM tracker handles the real throttling
                        await new Promise(resolve => setTimeout(resolve, 500));
                        
                    } catch (error) {
                        retries--;
                        
                        const isRateLimited = error.message.includes('RATE_LIMITED') || 
                                              error.message.includes('429') || 
                                              error.message.includes('Resource exhausted');
                        
                        if (retries > 0) {
                            const delay = isRateLimited ? backoffDelay : 5000;
                            console.log(`   ⏳ Batch ${batchNum}: waiting ${(delay/1000).toFixed(0)}s before retry... (${retries} retries left)${isRateLimited ? ' [rate limited]' : ''}`);
                            await new Promise(resolve => setTimeout(resolve, delay));
                            backoffDelay = Math.min(backoffDelay * 1.5, 120000);
                        } else {
                            // Final fallback: split into sub-batches of 5 with TPM tracking
                            console.log(`   🔄 Batch ${batchNum}: splitting into smaller sub-batches...`);
                            let fallbackSuccess = 0;
                            const subBatchSize = 5;
                            
                            // Wait 65s first to let rate limit fully reset
                            console.log(`   ⏱️  Waiting 65s for rate limit window to fully reset...`);
                            await new Promise(resolve => setTimeout(resolve, 65000));
                            
                            for (let s = 0; s < batch.length; s += subBatchSize) {
                                const subBatch = batch.slice(s, s + subBatchSize);
                                try {
                                    const subTexts = subBatch.map(doc => doc.pageContent);
                                    const subTokens = this.estimateTokens(subTexts);
                                    await tpmTracker.waitIfNeeded(subTokens);
                                    
                                    const subEmbeddings = await this.embeddings.embedDocuments(subTexts);
                                    tpmTracker.record(subTokens);
                                    
                                    const validPairs = subEmbeddings
                                        .map((emb, idx) => ({ emb, idx }))
                                        .filter(p => Array.isArray(p.emb) && p.emb.length === this.vectorSize && p.emb.some(v => v !== 0));
                                    
                                    if (validPairs.length > 0) {
                                        const subPoints = validPairs.map(p => ({
                                            id: i + s + p.idx,
                                            vector: p.emb,
                                            payload: {
                                                text: subBatch[p.idx].pageContent,
                                                metadata: subBatch[p.idx].metadata
                                            }
                                        }));
                                        await this.qdrantClient.upsert(this.collectionName, { wait: true, points: subPoints });
                                        fallbackSuccess += validPairs.length;
                                    }
                                    
                                    await new Promise(resolve => setTimeout(resolve, 1000));
                                } catch (e) {
                                    // Wait and skip this sub-batch
                                    await new Promise(resolve => setTimeout(resolve, 10000));
                                }
                            }
                            
                            if (fallbackSuccess > 0) {
                                console.log(`   ✅ Batch ${batchNum}: recovered ${fallbackSuccess}/${batch.length} docs via sub-batch fallback`);
                                successfulDocs += fallbackSuccess;
                            } else {
                                console.log(`   ❌ Batch ${batchNum}: completely failed, skipping`);
                                failedBatches++;
                                failedBatchNumbers.push(batchNum);
                            }
                            success = true;
                        }
                    }
                }
            }

            // Cleanup checkpoint on completion
            try { await fs.unlink(checkpointPath); } catch (e) { /* ignore */ }
            
            const totalTime = ((Date.now() - startTime) / 1000).toFixed(0);
            console.log('\n' + '='.repeat(60));
            console.log('Indexing Summary:');
            console.log('='.repeat(60));
            console.log(`✅ Documents indexed: ${successfulDocs}/${documents.length}`);
            console.log(`❌ Failed batches: ${failedBatches}/${totalBatches}`);
            if (failedBatches > 0) {
                console.log(`   Failed batch numbers: ${failedBatchNumbers.join(', ')}`);
                console.log(`   Documents skipped: ~${failedBatches * batchSize}`);
            }
            console.log(`⏱️  Total time: ${totalTime}s`);
            console.log('='.repeat(60));
            
            if (failedBatches === totalBatches) {
                throw new Error('All batches failed - check Gemini API key and rate limits');
            }
            
            console.log('\n✅ Indexing completed!');
        } catch (error) {
            console.error('Error indexing documents:', error);
            throw error;
        }
    }

    /**
     * Search for relevant documents based on query
     */
    async searchRelevantDocs(query, limit = 5, debugMode = false) {
        await this.ensureInitialized();
        
        try {
            // Generate embedding for the query
            const queryEmbedding = await this.embeddings.embedQuery(query);
            
            if (debugMode) {
                console.log('\n🔍 VECTOR SEARCH DEBUG INFO:');
                console.log(`   Query: "${query}"`);
                console.log(`   Query Vector Length: ${queryEmbedding.length}`);
                console.log(`   Query Vector Sample: [${queryEmbedding.slice(0, 5).map(v => v.toFixed(4)).join(', ')}...]`);
                console.log(`   Search Limit: ${limit}`);
            }
            
            // Search in Qdrant with score threshold to filter out irrelevant results
            const searchResults = await this.qdrantClient.search(this.collectionName, {
                vector: queryEmbedding,
                limit: limit,
                with_payload: true,
                score_threshold: 0.4 // Only return results with >40% similarity
            });
            
            if (debugMode) {
                console.log(`   Found ${searchResults.length} results from Qdrant`);
                searchResults.forEach((result, idx) => {
                    console.log(`   ${idx + 1}. Score: ${result.score.toFixed(8)} (${(result.score * 100).toFixed(2)}%)`);
                    console.log(`      Chunk: ${result.payload.metadata.chunkIndex}`);
                    console.log(`      Text: "${result.payload.text.substring(0, 60)}..."`);
                });
            }
            
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

    /**
     * Helper: Analyze and categorize score
     */
    scoreCategory(score) {
        if (score >= 0.90) return '🟢 PERFECT (90-100%)';
        if (score >= 0.75) return '🟢 EXCELLENT (75-89%)';
        if (score >= 0.60) return '🟡 GOOD (60-74%)';
        if (score >= 0.45) return '🟡 FAIR (45-59%)';
        if (score >= 0.30) return '🔴 WEAK (30-44%)';
        return '⚫ POOR (<30%)';
    }

    /**
     * Complete RAG pipeline: search + generate response with detailed scoring
     */
    async ragQuery(userQuery, conversationHistory = [], debugMode = false) {
        try {
            const startTime = performanceMonitor.startTimer();
            
            console.log('\n' + '='.repeat(80));
            console.log('🔍 RAG QUERY ANALYSIS');
            console.log('='.repeat(80));
            console.log(`📝 User Query: "${userQuery}"`);
            console.log(`📊 Query Length: ${userQuery.length} chars, ${userQuery.split(' ').length} words`);
            
            // 1. Retrieve relevant context - OPTIMIZED: reduced from 5 to 3 chunks for faster processing
            const searchStart = performanceMonitor.startTimer();
            const relevantDocs = await this.searchRelevantDocs(userQuery, 3, debugMode);
            const searchTime = performanceMonitor.endTimer(searchStart);
            performanceMonitor.record('vectorSearch', searchTime);
            
            console.log(`\n📚 Retrieved ${relevantDocs.length} chunks from Qdrant:\n`);
            
            // Calculate statistics
            const scores = relevantDocs.map(d => d.score);
            const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
            const maxScore = Math.max(...scores);
            const minScore = Math.min(...scores);
            
            console.log(`📈 Score Statistics:`);
            console.log(`   Highest: ${maxScore.toFixed(4)} (100% match)`);
            console.log(`   Average: ${avgScore.toFixed(4)} (${(avgScore * 100).toFixed(1)}% avg similarity)`);
            console.log(`   Lowest:  ${minScore.toFixed(4)} (${(minScore * 100).toFixed(1)}% similarity)`);
            console.log(`   Range:   ${(maxScore - minScore).toFixed(4)} (score spread)\n`);
            
            // Detailed breakdown
            console.log('💡 Chunk Details (sorted by relevance):\n');
            relevantDocs.forEach((doc, idx) => {
                const chunkId = doc.metadata.chunkIndex;
                const score = doc.score;
                const category = this.scoreCategory(score);
                const preview = doc.content
                    .substring(0, 120)
                    .replace(/\n/g, ' ')
                    .replace(/\s+/g, ' ')
                    .trim();
                
                console.log(`   ${idx + 1}. Chunk #${chunkId}`);
                console.log(`      Score: ${score.toFixed(4)} (${(score * 100).toFixed(1)}%) ${category}`);
                console.log(`      Text: "${preview}..."`);
                console.log(`      Length: ${doc.content.length} chars`);
                console.log('');
            });
            
            // Scoring explanation
            console.log('📖 SCORING EXPLAINED:');
            console.log('   Score = Cosine Similarity between query vector and chunk vector');
            console.log('   Range: 0.0 (completely different) to 1.0 (identical meaning)');
            console.log('   Distance metric: Cosine');
            console.log('   Vector dimensions: 3072 (gemini-embedding-001)');
            console.log('   Model: gemini-embedding-001\n');
            
            // Analyze why scores are what they are
            console.log('🧠 WHY THESE SCORES?:');
            relevantDocs.slice(0, 3).forEach((doc, idx) => {
                const score = doc.score;
                const content = doc.content;
                
                // Detect matching keywords
                const queryWords = userQuery.toLowerCase().split(/\W+/);
                const matchedWords = queryWords.filter(w => 
                    content.toLowerCase().includes(w) && w.length > 3
                );
                
                console.log(`   Chunk ${idx + 1} (${score.toFixed(4)}):`);
                if (matchedWords.length > 0) {
                    console.log(`      ✓ Matching keywords: ${matchedWords.slice(0, 3).join(', ')}`);
                }
                if (score < 0.50) {
                    console.log(`      ⚠ Lower score: may be tangentially related or semantic drift`);
                }
                console.log('');
            });
            
            console.log('='.repeat(80) + '\n');
            
            // 2. Build context from retrieved documents
            const context = relevantDocs
                .map((doc, idx) => {
                    const bookTitle = doc.metadata.source || doc.metadata.fileName?.replace('.txt', '') || 'Unknown Source';
                    return `[Source ${idx + 1} - "${bookTitle}"]\n${doc.content}`;
                })
                .join('\n\n---\n\n');
            
            // Record metrics
            performanceMonitor.record('contextSize', context.length);
            performanceMonitor.record('chunksRetrieved', relevantDocs.length);
            
            // 3. Return context and sources for use with Gemini
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

    /**
     * Setup the entire vector database (run once)
     */
    async setup() {
        try {
            console.log('Starting vector database setup...');
            
            // 0. Ensure service is initialized (connects to Qdrant)
            await this.ensureInitialized();
            
            // 1. Initialize collection
            await this.initializeCollection();
            
            // 2. Load knowledge base
            const documents = await this.loadKnowledgeBase();
            
            // 3. Index documents
            await this.indexDocuments(documents);
            
            console.log('Vector database setup completed!');
        } catch (error) {
            console.error('Error during setup:', error);
            throw error;
        }
    }

    /**
     * Get collection stats
     */
    async getStats() {
        try {
            const collectionInfo = await this.qdrantClient.getCollection(this.collectionName);
            return {
                pointsCount: collectionInfo.points_count,
                vectorSize: collectionInfo.config.params.vectors.size,
                status: collectionInfo.status
            };
        } catch (error) {
            console.error('Error getting stats:', error);
            return null;
        }
    }

    /**
     * Delete the collection (reset the vector database)
     */
    async deleteCollection() {
        try {
            const collections = await this.qdrantClient.getCollections();
            const exists = collections.collections.some(
                col => col.name === this.collectionName
            );

            if (exists) {
                await this.qdrantClient.deleteCollection(this.collectionName);
                console.log(`✅ Collection '${this.collectionName}' deleted successfully`);
                return true;
            } else {
                console.log(`ℹ️  Collection '${this.collectionName}' does not exist`);
                return false;
            }
        } catch (error) {
            console.error('Error deleting collection:', error);
            throw error;
        }
    }

    /**
     * Reset and rebuild the entire vector database
     */
    async reset() {
        try {
            console.log('🔄 Resetting vector database...\n');
            
            // 0. Ensure initialized (need qdrantClient to delete)
            await this.ensureInitialized();
            
            // 1. Delete existing collection
            await this.deleteCollection();
            
            // 2. Run setup again (re-create collection + re-index)
            await this.initializeCollection();
            const documents = await this.loadKnowledgeBase();
            await this.indexDocuments(documents);
            
            console.log('\n✅ Vector database reset completed!');
        } catch (error) {
            console.error('Error during reset:', error);
            throw error;
        }
    }
}

module.exports = new VectorService();
