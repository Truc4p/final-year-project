#!/usr/bin/env node

/**
 * Reset script for clearing the vector database
 * Use this when you want to completely reset and rebuild the knowledge base
 * 
 * Usage:
 *   node scripts/vectorDB/resetVectorDB.js          # Full reset
 *   node scripts/vectorDB/resetVectorDB.js --resume  # Resume from last checkpoint
 */

require('dotenv').config();
const vectorService = require('../../services/vectorService');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const isResume = process.argv.includes('--resume');

async function main() {
    const checkpointPath = path.join(__dirname, '../../.vector-index-checkpoint.json');
    let checkpoint = null;

    if (isResume && fs.existsSync(checkpointPath)) {
        checkpoint = JSON.parse(fs.readFileSync(checkpointPath, 'utf-8'));
        console.log(`📌 Found checkpoint from ${checkpoint.timestamp}`);
        console.log(`   Resuming from document ${checkpoint.resumeFrom}/${checkpoint.totalDocs}\n`);
    } else if (isResume) {
        console.log('⚠️  No checkpoint found, starting fresh.\n');
    }

    if (!isResume) {
        console.log('⚠️  WARNING: Vector Database Reset\n');
        console.log('This will DELETE all existing data in the vector database.');
        console.log('The database will be rebuilt from your knowledge sources.\n');
    }
    
    rl.question(`Are you sure you want to ${isResume && checkpoint ? 'resume' : 'continue'}? (yes/no): `, async (answer) => {
        if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
            try {
                console.log('\n🔄 Starting process...\n');
                
                if (isResume && checkpoint) {
                    // Resume: just re-index from checkpoint
                    await vectorService.ensureInitialized();
                    const documents = await vectorService.loadKnowledgeBase();
                    await vectorService.indexDocuments(documents, { resumeFrom: checkpoint.resumeFrom });
                } else {
                    // Full reset
                    await vectorService.reset();
                }
                
                // Get and display stats
                console.log('\n📊 Getting collection statistics...');
                const stats = await vectorService.getStats();
                
                if (stats) {
                    console.log('\n✅ Complete!');
                    console.log('=================');
                    console.log(`Collection Name: ${vectorService.collectionName}`);
                    console.log(`Total Documents: ${stats.pointsCount}`);
                    console.log(`Vector Size: ${stats.vectorSize}`);
                    console.log(`Status: ${stats.status}`);
                }
                
                // Test a sample query
                console.log('\n🔍 Testing sample query...');
                const testQuery = "What is acne and how to treat it?";
                const results = await vectorService.searchRelevantDocs(testQuery, 3);
                
                console.log(`\nQuery: "${testQuery}"`);
                console.log(`Found ${results.length} relevant documents:`);
                results.forEach((doc, idx) => {
                    console.log(`\n${idx + 1}. Score: ${doc.score.toFixed(4)}`);
                    console.log(`   Preview: ${doc.content.substring(0, 150)}...`);
                });
                
                console.log('\n✨ Vector database is ready to use!\n');
                
                process.exit(0);
            } catch (error) {
                console.error('\n❌ Failed:', error);
                console.error('\n💡 Tip: Run with --resume flag to continue from where it stopped:');
                console.error('   node scripts/vectorDB/resetVectorDB.js --resume\n');
                process.exit(1);
            }
        } else {
            console.log('\n❌ Cancelled.');
            process.exit(0);
        }
        
        rl.close();
    });
}

main();
