const geminiService = require('../../services/geminiService');
const vectorService = require('../../services/vectorService');
const ttsService = require('../../services/ttsService');
const cacheService = require('../../services/cacheService');
const fs = require('fs').promises;
const path = require('path');
const performanceMonitor = require('../../utils/performanceMonitor');

// Inject vector service into cache service for semantic matching
cacheService.setVectorService(vectorService);

/**
 * @desc    Send a message to the AI Dermatology Expert
 * @route   POST /api/ai-dermatology-expert/chat
 * @access  Public
 */
exports.chat = async (req, res) => {
    try {
        const totalStart = performanceMonitor.startTimer();
        const { message, conversationHistory } = req.body;

        if (!message || message.trim() === '') {
            return res.status(400).json({ error: 'Message is required' });
        }

        console.log(`💬 Processing question: "${message}"`);

        // Detect and translate the query if needed for better RAG results
        console.log('🌍 Detecting language and translating if needed...');
        const translationResult = await geminiService.detectAndTranslate(message);
        const queryForRAG = translationResult.translatedText; // Use English for vector search
        
        console.log(`📝 Query for RAG: "${queryForRAG}"`);

        // Check if this is a sample question and try cache first
        const isSampleQuestion = cacheService.isSampleQuestion(message);
        console.log(`🎯 Is sample question: ${isSampleQuestion}`);

        // Try to get cached response for sample questions (regardless of conversation history)
        // or for new conversations without history
        let cachedResponse = null;
        if (isSampleQuestion || !conversationHistory || conversationHistory.length === 0) {
            cachedResponse = await cacheService.getAIDermatologyResponse(
                message, 
                translationResult.languageName || 'English'
            );
        }

        if (cachedResponse) {
            const cacheType = cachedResponse._cacheType || 'exact';
            const similarity = cachedResponse._similarity;
            const originalQuestion = cachedResponse._originalQuestion;
            
            console.log(`⚡ Returning cached response (${cacheType} match)`);
            if (cacheType === 'semantic') {
                console.log(`🎯 Semantic similarity: ${(similarity * 100).toFixed(1)}%`);
            }
            
            const totalTime = performanceMonitor.endTimer(totalStart);
            
            // Add performance info to cached response
            cachedResponse._performance = process.env.NODE_ENV === 'development' ? {
                totalTime,
                cached: true,
                cacheType: cacheType,
                similarity: cacheType === 'semantic' ? similarity : 1.0,
                originalQuestion: cacheType === 'semantic' ? originalQuestion : message,
                detectedLanguage: translationResult.languageName,
                translatedQuery: translationResult.isEnglish ? null : queryForRAG
            } : undefined;

            return res.json(cachedResponse);
        }

        // No cache hit, generate new response
        console.log('🔄 No cache hit, generating new response...');

        // Use RAG to retrieve relevant context (using translated English query)
        const ragResult = await vectorService.ragQuery(queryForRAG, conversationHistory || []);

        // Generate response using Gemini with retrieved context (original message for context)
        const result = await geminiService.generateResponseWithContext(
            message, // Pass original message so AI knows user's language
            ragResult.context,
            conversationHistory || []
        );

        const totalTime = performanceMonitor.endTimer(totalStart);
        performanceMonitor.record('totalTime', totalTime);
        
        // Log this request's performance
        performanceMonitor.logRequest({
            totalTime,
            contextSize: ragResult.context.length,
            chunksRetrieved: ragResult.sources.length
        });

        // Prepare response object
        const responseObj = {
            response: result.response,
            sources: ragResult.sources,
            images: result.images || [],
            timestamp: new Date(),
            _performance: process.env.NODE_ENV === 'development' ? {
                totalTime,
                contextSize: ragResult.context.length,
                chunks: ragResult.sources.length,
                detectedLanguage: translationResult.languageName,
                translatedQuery: translationResult.isEnglish ? null : queryForRAG,
                cached: false
            } : undefined
        };

        // Cache the response if it's a sample question (always) or new chat (no conversation history)
        if (isSampleQuestion || !conversationHistory || conversationHistory.length === 0) {
            console.log('💾 Caching response for future use...');
            await cacheService.setAIDermatologyResponse(
                message,
                result,
                translationResult.languageName || 'English',
                isSampleQuestion ? 15552000 : 2592000 // Sample questions: 6 months (180 days), others: 1 month (30 days)
            );
        }

        res.json(responseObj);
    } catch (error) {
        console.error('AI Chat error:', error);
        
        // Determine appropriate user-facing error message
        let userMessage = 'Failed to generate response';
        let statusCode = 500;
        
        if (error.message.includes('overloaded')) {
            userMessage = 'The AI service is currently experiencing high traffic. Please try again in a moment.';
            statusCode = 503;
        } else if (error.message.includes('rate limit')) {
            userMessage = 'Too many requests. Please wait a moment and try again.';
            statusCode = 429;
        }
        
        res.status(statusCode).json({ 
            error: userMessage,
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @desc    Analyze skin image with AI Dermatology Expert
 * @route   POST /api/ai-dermatology-expert/analyze-skin
 * @access  Public
 */
exports.analyzeSkinImage = async (req, res) => {
    let tempFilePath = null;
    
    try {
        const totalStart = performanceMonitor.startTimer();
        console.log('\n=== 🖼️ [BACKEND] SKIN IMAGE ANALYSIS REQUEST ===');
        console.log('⏰ [BACKEND] Request time:', new Date().toISOString());
        
        // Check if file was uploaded
        if (!req.file) {
            console.error('❌ [BACKEND] No image file in request');
            return res.status(400).json({ error: 'No image file provided' });
        }

        const { message } = req.body;
        let conversationHistory = [];
        
        // Parse conversation history if provided
        if (req.body.conversationHistory) {
            try {
                conversationHistory = JSON.parse(req.body.conversationHistory);
            } catch (e) {
                console.warn('Failed to parse conversation history:', e);
            }
        }

        console.log('📁 [BACKEND] Image details:', {
            originalName: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            path: req.file.path,
            sizeInMB: (req.file.size / 1024 / 1024).toFixed(2) + ' MB'
        });
        console.log('💬 [BACKEND] User message:', message);

        tempFilePath = req.file.path;

        // Use RAG to retrieve relevant context about skin conditions
        const userQuery = message || 'Analyze this skin image for any conditions or concerns';
        const ragResult = await vectorService.ragQuery(userQuery, conversationHistory);

        console.log('🎨 [BACKEND] Calling geminiService.analyzeSkinImage...');
        const analyzeStartTime = Date.now();
        
        // Analyze the image using Gemini Vision with RAG context
        const result = await geminiService.analyzeSkinImage(
            tempFilePath,
            userQuery,
            ragResult.context,
            conversationHistory
        );
        
        const analyzeDuration = Date.now() - analyzeStartTime;
        console.log(`✅ [BACKEND] Analysis completed in ${analyzeDuration}ms`);

        // Clean up the temporary file
        console.log('🗑️ [BACKEND] Cleaning up temp file:', tempFilePath);
        await fs.unlink(tempFilePath);
        tempFilePath = null;

        const totalTime = performanceMonitor.endTimer(totalStart);
        performanceMonitor.record('totalTime', totalTime);
        
        // Log this request's performance
        performanceMonitor.logRequest({
            totalTime,
            contextSize: ragResult.context.length,
            chunksRetrieved: ragResult.sources.length
        });

        console.log(`✅ [BACKEND] Request completed in ${totalTime}ms`);
        console.log('=== ✅ [BACKEND] IMAGE ANALYSIS SUCCESS ===\n');

        res.json({
            response: result.response,
            sources: ragResult.sources,
            timestamp: new Date(),
            _performance: process.env.NODE_ENV === 'development' ? {
                totalTime,
                contextSize: ragResult.context.length,
                chunks: ragResult.sources.length
            } : undefined
        });
    } catch (error) {
        console.error('\n=== ❌ [BACKEND] IMAGE ANALYSIS ERROR ===');
        console.error('❌ [BACKEND] Error type:', error.name);
        console.error('❌ [BACKEND] Error message:', error.message);
        console.error('❌ [BACKEND] Full error:', error);
        console.error('=== ❌ [BACKEND] ERROR END ===\n');
        
        // Clean up temp file if it exists
        if (tempFilePath) {
            try {
                console.log('🗑️ [BACKEND] Cleaning up temp file after error');
                await fs.unlink(tempFilePath);
            } catch (unlinkError) {
                console.error('Error deleting temp file:', unlinkError);
            }
        }
        
        // Determine appropriate user-facing error message
        let userMessage = 'Failed to analyze skin image';
        let statusCode = 500;
        
        if (error.message.includes('overloaded')) {
            userMessage = 'The AI service is currently experiencing high traffic. Please try again in a moment.';
            statusCode = 503;
        } else if (error.message.includes('rate limit')) {
            userMessage = 'Too many requests. Please wait a moment and try again.';
            statusCode = 429;
        }
        
        res.status(statusCode).json({ 
            error: userMessage,
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @desc    Transcribe audio to text using Gemini
 * @route   POST /api/ai-dermatology-expert/transcribe
 * @access  Public
 */
exports.transcribeAudio = async (req, res) => {
    let tempFilePath = null;
    
    try {
        const requestStartTime = Date.now();
        console.log('\n=== 📥 [BACKEND] TRANSCRIPTION REQUEST RECEIVED ===');
        console.log('⏰ [BACKEND] Request time:', new Date().toISOString());
        
        // Check if file was uploaded
        if (!req.file) {
            console.error('❌ [BACKEND] No file in request');
            return res.status(400).json({ error: 'No audio file provided' });
        }

        console.log('📁 [BACKEND] File details:', {
            originalName: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            path: req.file.path,
            sizeInMB: (req.file.size / 1024 / 1024).toFixed(2) + ' MB'
        });

        tempFilePath = req.file.path;

        console.log('🎤 [BACKEND] Calling geminiService.transcribeAudio...');
        const transcribeStartTime = Date.now();
        
        // Transcribe the audio using Gemini
        const transcribedText = await geminiService.transcribeAudio(tempFilePath);
        
        const transcribeDuration = Date.now() - transcribeStartTime;
        console.log(`✅ [BACKEND] Transcription completed in ${transcribeDuration}ms`);

        // Clean up the temporary file
        console.log('🗑️ [BACKEND] Cleaning up temp file:', tempFilePath);
        await fs.unlink(tempFilePath);
        tempFilePath = null;

        const totalDuration = Date.now() - requestStartTime;
        console.log(`✅ [BACKEND] Request completed in ${totalDuration}ms`);
        console.log('=== ✅ [BACKEND] TRANSCRIPTION SUCCESS ===\n');

        res.json({
            transcription: transcribedText,
            timestamp: new Date(),
            processingTime: totalDuration
        });
    } catch (error) {
        console.error('\n=== ❌ [BACKEND] TRANSCRIPTION ERROR ===');
        console.error('❌ [BACKEND] Error type:', error.name);
        console.error('❌ [BACKEND] Error message:', error.message);
        console.error('❌ [BACKEND] Full error:', error);
        console.error('=== ❌ [BACKEND] ERROR END ===\n');
        
        // Clean up temp file if it exists
        if (tempFilePath) {
            try {
                console.log('🗑️ [BACKEND] Cleaning up temp file after error');
                await fs.unlink(tempFilePath);
            } catch (unlinkError) {
                console.error('Error deleting temp file:', unlinkError);
            }
        }
        
        res.status(500).json({ 
            error: 'Failed to transcribe audio',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @desc    Convert text to speech using gTTS (Google Translate Text-to-Speech)
 * @route   POST /api/ai-dermatology-expert/text-to-speech
 * @access  Public
 */
exports.textToSpeech = async (req, res) => {
    let outputPath = null;
    
    try {
        const requestStartTime = Date.now();
        console.log('\n=== 🔊 [BACKEND] TEXT-TO-SPEECH REQUEST ===');
        console.log('⏰ [BACKEND] Request time:', new Date().toISOString());
        
        const { text } = req.body;
        
        if (!text || text.trim() === '') {
            console.error('❌ [BACKEND] No text provided');
            return res.status(400).json({ error: 'Text is required' });
        }
        
        console.log('📝 [BACKEND] Text length:', text.length);
        
        // Generate unique filename
        const timestamp = Date.now();
        const filename = `tts-${timestamp}.mp3`;
        outputPath = path.join(__dirname, '..', 'uploads', 'audio', filename);
        
        console.log('🚀 [BACKEND] Generating speech...');
        const ttsStartTime = Date.now();
        
        // Generate speech
        await ttsService.textToSpeech(text, outputPath);
        
        const ttsDuration = Date.now() - ttsStartTime;
        console.log(`✅ [BACKEND] Speech generated in ${ttsDuration}ms`);
        
        // Read the audio file
        const audioBuffer = await fs.readFile(outputPath);
        const audioBase64 = audioBuffer.toString('base64');
        
        // Clean up the file
        await fs.unlink(outputPath);
        outputPath = null;
        
        const totalDuration = Date.now() - requestStartTime;
        console.log(`✅ [BACKEND] Request completed in ${totalDuration}ms`);
        console.log('=== ✅ [BACKEND] TTS SUCCESS ===\n');
        
        res.json({
            audio: audioBase64,
            format: 'mp3',
            timestamp: new Date(),
            processingTime: totalDuration
        });
        
    } catch (error) {
        console.error('\n=== ❌ [BACKEND] TTS ERROR ===');
        console.error('❌ [BACKEND] Error:', error.message);
        console.error('=== ❌ [BACKEND] ERROR END ===\n');
        
        // Clean up file if it exists
        if (outputPath) {
            try {
                await fs.unlink(outputPath);
            } catch (unlinkError) {
                console.error('Error deleting temp file:', unlinkError);
            }
        }
        
        res.status(500).json({ 
            error: 'Failed to generate speech',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @desc    Get cache statistics for AI Dermatology Expert
 * @route   GET /api/ai-dermatology-expert/cache/stats
 * @access  Public (Development only)
 */
exports.getCacheStats = async (req, res) => {
    try {
        if (process.env.NODE_ENV === 'production') {
            return res.status(403).json({ error: 'Cache management not available in production' });
        }

        const stats = await cacheService.getCacheStats();
        res.json({
            message: 'Cache statistics retrieved successfully',
            stats
        });
    } catch (error) {
        console.error('Cache stats error:', error);
        res.status(500).json({ 
            error: 'Failed to retrieve cache statistics',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @desc    Clear AI Dermatology Expert cache
 * @route   DELETE /api/ai-dermatology-expert/cache
 * @access  Public (Development only)
 */
exports.clearCache = async (req, res) => {
    try {
        if (process.env.NODE_ENV === 'production') {
            return res.status(403).json({ error: 'Cache management not available in production' });
        }

        const deletedCount = await cacheService.clearAIDermatologyCache();
        res.json({
            message: 'Cache cleared successfully',
            deletedEntries: deletedCount
        });
    } catch (error) {
        console.error('Clear cache error:', error);
        res.status(500).json({ 
            error: 'Failed to clear cache',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
