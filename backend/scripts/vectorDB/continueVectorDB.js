#!/usr/bin/env node

/**
 * Continue indexing script for resuming vector database setup
 * Use this when indexing was interrupted and you want to continue from where it stopped
 */

require('dotenv').config();
const vectorService = require('../../services/vectorService');

async function main() {
    // Get starting batch from command line argument or default to batch 118
    const startBatch = parseInt(process.argv[2]) || 118;
    const batchSize = 50;
    const startIndex = (startBatch - 1) * batchSize; // Batch 118 starts at index 5850
    
    console.log('🚀 Continuing Vector Database Setup...\n');
    console.log(`📍 Starting from batch ${startBatch} (document index ${startIndex})`);
    
    try {
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
 * Index remaining documents starting from a specific index
 */
async function indexRemainingDocuments(documents, startIndex) {
    try {
        const batchSize = 10; // Small batches for gemini-embedding-001 rate limits
        const totalBatches = Math.ceil(documents.length / batchSize);
        const startBatch = Math.floor(startIndex / batchSize) + 1;
        let successfulBatches = 0;
        let failedBatches = 0;
        const failedBatchNumbers = [];
        
        for (let i = 0; i < documents.length; i += batchSize) {
            const batch = documents.slice(i, i + batchSize);
            const actualBatchNum = startBatch + Math.floor(i / batchSize);
            const absoluteIndex = startIndex + i;
            
            let retries = 5;
            let success = false;
            
            while (retries > 0 && !success) {
                try {
                    // Generate embeddings for batch
                    const texts = batch.map(doc => doc.pageContent);
                    const embeddings = await vectorService.embeddings.embedDocuments(texts);
                    
                    // Validate embeddings before uploading
                    const invalidEmbeddings = embeddings
                        .map((emb, idx) => ({ idx, len: Array.isArray(emb) ? emb.length : -1, allZero: Array.isArray(emb) && !emb.some(v => v !== 0) }))
                        .filter(e => e.len !== 3072 || e.allZero);
                    
                    if (invalidEmbeddings.length > 0) {
                        const details = invalidEmbeddings.map(e => `doc[${e.idx}]: dim=${e.len}`).join(', ');
                        throw new Error(`Invalid embeddings (expected dim 3072): ${details}`);
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
                    
                    console.log(`Indexed batch ${actualBatchNum} (${absoluteIndex + batch.length} docs so far)`);
                    success = true;
                    successfulBatches++;
                    
                    // Delay between batches to respect rate limits
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                } catch (error) {
                    retries--;
                    if (retries > 0) {
                        const delay = 3000 * (6 - retries);
                        console.log(`   ⚠️  Batch ${actualBatchNum} failed, retrying in ${delay/1000}s... (${retries} attempts left) - ${error.message}`);
                        await new Promise(resolve => setTimeout(resolve, delay));
                    } else {
                        console.log(`   ❌ Batch ${actualBatchNum} failed after 5 attempts - SKIPPING and continuing...`);
                        console.log(`      Error: ${error.message}`);
                        failedBatches++;
                        failedBatchNumbers.push(actualBatchNum);
                        success = true; // Continue to next batch
                    }
                }
            }
        }
        
        console.log('\n' + '='.repeat(60));
        console.log('Indexing Summary:');
        console.log('='.repeat(60));
        console.log(`✅ Successful batches: ${successfulBatches}/${totalBatches}`);
        console.log(`❌ Failed batches: ${failedBatches}/${totalBatches}`);
        if (failedBatches > 0) {
            console.log(`   Failed batch numbers: ${failedBatchNumbers.join(', ')}`);
            console.log(`   Documents skipped: ~${failedBatches * batchSize}`);
        }
        console.log('='.repeat(60));
        
        console.log('\n✅ Remaining documents indexed successfully');
    } catch (error) {
        console.error('Error indexing remaining documents:', error);
        throw error;
    }
}

main();
