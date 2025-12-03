// Test script for semantic cache functionality
const cacheService = require('./services/cacheService');
const vectorService = require('./services/vectorService');

async function testSemanticCache() {
    console.log('🧪 Testing Semantic Cache System\n');
    
    try {
        // Initialize services
        await vectorService.initialize();
        cacheService.setVectorService(vectorService);
        
        console.log('📊 Current Configuration:');
        console.log(cacheService.getSemanticCacheConfig());
        console.log('');
        
        // Test 1: Cache a question
        console.log('=== Test 1: Caching Original Question ===');
        const originalQuestion = "My skin gets oily by noon";
        const mockResponse = {
            response: "For oily skin that becomes oily by noon, I recommend...",
            sources: ["dermatology_textbook.pdf"],
            images: []
        };
        
        await cacheService.setAIDermatologyResponse(
            originalQuestion,
            mockResponse,
            'English',
            2592000 // 1 month
        );
        console.log('✅ Cached original question\n');
        
        // Test 2: Exact match
        console.log('=== Test 2: Testing Exact Match ===');
        const exactMatch = await cacheService.getAIDermatologyResponse(
            "My skin gets oily by noon",
            'English'
        );
        console.log('Result:', exactMatch ? '✅ Found' : '❌ Not found');
        console.log('Cache Type:', exactMatch?._cacheType || 'N/A');
        console.log('');
        
        // Test 3: Semantic match - word order
        console.log('=== Test 3: Testing Semantic Match (Word Order) ===');
        const wordOrderMatch = await cacheService.getAIDermatologyResponse(
            "By noon my skin gets oily",
            'English'
        );
        console.log('Result:', wordOrderMatch ? '✅ Found' : '❌ Not found');
        if (wordOrderMatch) {
            console.log('Cache Type:', wordOrderMatch._cacheType);
            console.log('Similarity:', (wordOrderMatch._similarity * 100).toFixed(1) + '%');
            console.log('Original Question:', wordOrderMatch._originalQuestion);
        }
        console.log('');
        
        // Test 4: Semantic match - paraphrasing
        console.log('=== Test 4: Testing Semantic Match (Paraphrasing) ===');
        const paraphraseMatch = await cacheService.getAIDermatologyResponse(
            "At noon my skin is too oily",
            'English'
        );
        console.log('Result:', paraphraseMatch ? '✅ Found' : '❌ Not found');
        if (paraphraseMatch) {
            console.log('Cache Type:', paraphraseMatch._cacheType);
            console.log('Similarity:', (paraphraseMatch._similarity * 100).toFixed(1) + '%');
            console.log('Original Question:', paraphraseMatch._originalQuestion);
        }
        console.log('');
        
        // Test 5: Semantic match - synonyms
        console.log('=== Test 5: Testing Semantic Match (Synonyms) ===');
        const synonymMatch = await cacheService.getAIDermatologyResponse(
            "Around midday my face becomes greasy",
            'English'
        );
        console.log('Result:', synonymMatch ? '✅ Found' : '❌ Not found');
        if (synonymMatch) {
            console.log('Cache Type:', synonymMatch._cacheType);
            console.log('Similarity:', (synonymMatch._similarity * 100).toFixed(1) + '%');
            console.log('Original Question:', synonymMatch._originalQuestion);
        }
        console.log('');
        
        // Test 6: Different topic (should not match)
        console.log('=== Test 6: Testing Different Topic (Should Not Match) ===');
        const differentTopic = await cacheService.getAIDermatologyResponse(
            "I have dry skin in winter",
            'English'
        );
        console.log('Result:', differentTopic ? '⚠️ Found (unexpected)' : '✅ Not found (expected)');
        if (differentTopic) {
            console.log('Similarity:', (differentTopic._similarity * 100).toFixed(1) + '%');
        }
        console.log('');
        
        // Test 7: Adjust threshold
        console.log('=== Test 7: Adjusting Similarity Threshold ===');
        cacheService.configureSemanticCache({ threshold: 0.80 });
        console.log('New threshold:', cacheService.getSemanticCacheConfig().thresholdPercentage);
        console.log('');
        
        console.log('✅ All tests completed successfully!');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        // Cleanup
        await cacheService.disconnect();
        process.exit(0);
    }
}

// Run tests
testSemanticCache();
