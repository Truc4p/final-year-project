#!/usr/bin/env node

/**
 * Continue indexing script for resuming vector database setup
 * Use this when indexing was interrupted and you want to continue from where it stopped
 */

require('dotenv').config();
const vectorService = require('../../services/vectorService');

async function main() {
    // Get starting batch from command line argument or auto-detect from checkpoint
    const batchSize = 50;
    let startBatch = parseInt(process.argv[2]) || null;
    
    console.log('🚀 Continuing Vector Database Setup...\n');
    
    try {
        // Auto-detect resume point from checkpoint if no argument given
        if (!startBatch) {
            try {
                const checkpointData = require('../../.vector-index-checkpoint.json');
                startBatch = Math.floor(checkpointData.resumeFrom / batchSize) + 1;
                console.log(`📌 Auto-detected resume point from checkpoint: batch ${startBatch} (doc ${checkpointData.resumeFrom})`);
            } catch (e) {
                startBatch = 1;
                console.log('📌 No checkpoint found, starting from batch 1');
            }
        }
        
        const startIndex = (startBatch - 1) * batchSize;
        console.log(`📍 Starting from batch ${startBatch} (document index ${startIndex})`);

        // Initialize vectorService
        await vectorService.ensureInitialized();
        // Check if collection exists
        const stats = await vectorService.getStats();
        if (!stats) {
            console.error('❌ Collection does not exist. Please run setupVectorDB.js first.');
            process.exit(1);
        }
        
        console.log(`\n📊 Current collection status:`);
        console.log(`   Collection: ${vectorService.collectionName}`);
        console.log(`   Documents already indexed: ${stats.pointsCount}`);
        console.log(`   Vector size: ${stats.vectorSize}\n`);
        
        // Load all documents
        console.log('📚 Loading knowledge base...');
        const documents = await vectorService.loadKnowledgeBase();
        
        console.log(`\n✅ Total documents in knowledge base: ${documents.length}`);
        console.log(`📍 Documents already indexed: ${startIndex}`);
        console.log(`📍 Documents remaining: ${documents.length - startIndex}\n`);
        
        if (startIndex >= documents.length) {
            console.log('✅ All documents are already indexed!');
            process.exit(0);
        }
        
        // Get documents that need to be indexed
        const remainingDocuments = documents.slice(startIndex);
        console.log(`🔄 Indexing ${remainingDocuments.length} remaining documents...\n`);
        
        // Index only the remaining documents
        await indexRemainingDocuments(remainingDocuments, startIndex);
        
        // Get final stats
        console.log('\n📊 Getting final collection statistics...');
        const finalStats = await vectorService.getStats();
        
        if (finalStats) {
            console.log('\n✅ Indexing Complete!');
            console.log('=================');
            console.log(`Collection Name: ${vectorService.collectionName}`);
            console.log(`Total Documents: ${finalStats.pointsCount}`);
            console.log(`Vector Size: ${finalStats.vectorSize}`);
            console.log(`Status: ${finalStats.status}`);
        }
        
        // Test a sample query
        console.log('\n🔍 Testing sample query...');
        const testQuery = "What causes acne?";
        const results = await vectorService.searchRelevantDocs(testQuery, 3);
        
        console.log(`\nQuery: "${testQuery}"`);
        console.log(`Found ${results.length} relevant documents:`);
        results.forEach((doc, idx) => {
            console.log(`\n${idx + 1}. Score: ${doc.score.toFixed(4)}`);
            console.log(`   Source: ${doc.metadata.fileName}`);
            console.log(`   Preview: ${doc.content.substring(0, 150)}...`);
        });
        
        console.log('\n✨ Vector database is ready to use!\n');
        
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Continue failed:', error);
        process.exit(1);
    }
}

/**
 * Index remaining documents starting from a specific index, with TPM-aware rate limiting
 */
async function indexRemainingDocuments(documents, startIndex) {
    try {
        const batchSize = 50;
        const totalBatches = Math.ceil(documents.length / batchSize);
        let successfulBatches = 0;
        let failedBatches = 0;
        const failedBatchNumbers = [];
        const startTime = Date.now();

        // Use TPM tracker from vectorService (900K tokens/min limit)
        const tpmTracker = vectorService.createTPMTracker(900000);
        
        const formatETA = (docsRemaining, msPerDoc) => {
            const totalMs = docsRemaining * msPerDoc;
            const mins = Math.floor(totalMs / 60000);
            const secs = Math.floor((totalMs % 60000) / 1000);
            if (mins > 60) return `~${(mins / 60).toFixed(1)}h`;
            return `~${mins}m ${secs}s`;
        };
        
        for (let i = 0; i < documents.length; i += batchSize) {
            const batch = documents.slice(i, i + batchSize);
            const absoluteIndex = startIndex + i;
            const batchNum = Math.floor(absoluteIndex / batchSize) + 1;
            const texts = batch.map(doc => doc.pageContent);
            const estimatedTokens = vectorService.estimateTokens(texts);
            
            let retries = 5;
            let success = false;
            let backoffDelay = 65000;
            
            while (retries > 0 && !success) {
                try {
                    // Proactively wait if we'd exceed TPM limit
                    await tpmTracker.waitIfNeeded(estimatedTokens);

                    // Generate embeddings for batch
                    const embeddings = await vectorService.embeddings.embedDocuments(texts);
                    tpmTracker.record(estimatedTokens);
                    
                    // Validate embeddings before uploading
                    const invalidEmbeddings = embeddings
                        .map((emb, idx) => ({ idx, len: Array.isArray(emb) ? emb.length : -1, allZero: Array.isArray(emb) && !emb.some(v => v !== 0) }))
                        .filter(e => e.len !== 3072 || e.allZero);
                    
                    if (invalidEmbeddings.length > 0) {
                        const details = invalidEmbeddings.map(e => `doc[${e.idx}]: dim=${e.len}`).join(', ');
                        throw new Error(`RATE_LIMITED: ${details}`);
                    }
                    
                    // Prepare points for Qdrant with correct IDs
                    const points = batch.map((doc, index) => ({
                        id: absoluteIndex + index,
                        vector: embeddings[index],
                        payload: {
                            text: doc.pageContent,
                            metadata: doc.metadata
                        }
                    }));
                    
                    // Upload to Qdrant
                    await vectorService.qdrantClient.upsert(vectorService.collectionName, {
                        wait: true,
                        points: points
                    });
                    
                    success = true;
                    successfulBatches++;
                    
                    // Progress logging
                    const docsIndexed = i + batch.length;
                    const totalDocsRemaining = documents.length - docsIndexed;
                    if (batchNum <= 3 || successfulBatches % 5 === 0 || i + batchSize >= documents.length) {
                        const pct = (docsIndexed / documents.length * 100).toFixed(1);
                        const elapsed = Date.now() - startTime;
                        const msPerDoc = docsIndexed > 0 ? elapsed / docsIndexed : 0;
                        const eta = docsIndexed > 0 ? formatETA(totalDocsRemaining, msPerDoc) : '...';
                        const tpmUsed = tpmTracker.getUsed();
                        console.log(`✅ Batch ${batchNum} | ${absoluteIndex + batch.length} total docs | ${pct}% of remaining | TPM: ${(tpmUsed/1000).toFixed(0)}K/900K | ETA: ${eta}`);
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
                        // Final fallback: split into sub-batches of 5
                        console.log(`   🔄 Batch ${batchNum}: splitting into sub-batches...`);
                        let fallbackSuccess = 0;
                        const subBatchSize = 5;
                        
                        console.log(`   ⏱️  Waiting 65s for rate limit to fully reset...`);
                        await new Promise(resolve => setTimeout(resolve, 65000));
                        
                        for (let s = 0; s < batch.length; s += subBatchSize) {
                            const subBatch = batch.slice(s, s + subBatchSize);
                            try {
                                const subTexts = subBatch.map(doc => doc.pageContent);
                                const subTokens = vectorService.estimateTokens(subTexts);
                                await tpmTracker.waitIfNeeded(subTokens);
                                
                                const subEmbeddings = await vectorService.embeddings.embedDocuments(subTexts);
                                tpmTracker.record(subTokens);
                                
                                const validPairs = subEmbeddings
                                    .map((emb, idx) => ({ emb, idx }))
                                    .filter(p => Array.isArray(p.emb) && p.emb.length === 3072 && p.emb.some(v => v !== 0));
                                
                                if (validPairs.length > 0) {
                                    const subPoints = validPairs.map(p => ({
                                        id: absoluteIndex + s + p.idx,
                                        vector: p.emb,
                                        payload: {
                                            text: subBatch[p.idx].pageContent,
                                            metadata: subBatch[p.idx].metadata
                                        }
                                    }));
                                    await vectorService.qdrantClient.upsert(vectorService.collectionName, { wait: true, points: subPoints });
                                    fallbackSuccess += validPairs.length;
                                }
                                await new Promise(resolve => setTimeout(resolve, 1000));
                            } catch (e) {
                                await new Promise(resolve => setTimeout(resolve, 10000));
                            }
                        }
                        
                        if (fallbackSuccess > 0) {
                            console.log(`   ✅ Batch ${batchNum}: recovered ${fallbackSuccess}/${batch.length} docs`);
                            successfulBatches++;
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
        
        const totalTime = ((Date.now() - startTime) / 1000).toFixed(0);
        console.log('\n' + '='.repeat(60));
        console.log('Indexing Summary:');
        console.log('='.repeat(60));
        console.log(`✅ Successful batches: ${successfulBatches}/${totalBatches}`);
        console.log(`❌ Failed batches: ${failedBatches}/${totalBatches}`);
        if (failedBatches > 0) {
            console.log(`   Failed batch numbers: ${failedBatchNumbers.join(', ')}`);
            console.log(`   Documents skipped: ~${failedBatches * batchSize}`);
        }
        console.log(`⏱️  Total time: ${totalTime}s`);
        console.log('='.repeat(60));
        
        console.log('\n✅ Remaining documents indexed successfully');
    } catch (error) {
        console.error('Error indexing remaining documents:', error);
        throw error;
    }
}

main();
