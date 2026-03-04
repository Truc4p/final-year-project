const gttsFactory = require('node-gtts');
const fs = require('fs').promises;
const path = require('path');
const { ElevenLabsClient } = require('elevenlabs-js');

class TTSService {
    constructor() {
        // Initialize ElevenLabs client if API key is available
        this.elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
        this.elevenLabsClient = null;
        this.monthlyCharacterUsage = 0;
        this.monthlyCharacterLimit = 10000; // Free tier limit
        
        if (this.elevenLabsApiKey) {
            try {
                this.elevenLabsClient = new ElevenLabsClient({
                    apiKey: this.elevenLabsApiKey
                });
                console.log('✅ ElevenLabs AI Voice service initialized (Free Tier)');
                console.log('📊 Monthly limit: 10,000 characters (~10 minutes of audio)');
            } catch (error) {
                console.warn('⚠️ ElevenLabs initialization failed:', error.message);
                this.elevenLabsClient = null;
            }
        } else {
            console.log('ℹ️ ELEVENLABS_API_KEY not found - ElevenLabs disabled');
        }
        
        console.log('✅ gTTS (Google Text-to-Speech) service initialized as fallback');
        console.log('📢 Using free Google Translate TTS API with auto language detection');
    }

    /**
     * Detect language from text
     * @param {string} text - Text to analyze
     * @returns {string} - Language code (e.g., 'en', 'vi', 'zh')
     */
    detectLanguage(text) {
        // Check for Vietnamese characters
        const vietnamesePattern = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
        if (vietnamesePattern.test(text)) {
            return 'vi';
        }
        
        // Check for Chinese characters
        const chinesePattern = /[\u4e00-\u9fa5]/;
        if (chinesePattern.test(text)) {
            return 'zh';
        }
        
        // Check for Japanese characters (Hiragana, Katakana, Kanji)
        const japanesePattern = /[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/;
        if (japanesePattern.test(text)) {
            return 'ja';
        }
        
        // Check for Korean characters
        const koreanPattern = /[\uac00-\ud7af]/;
        if (koreanPattern.test(text)) {
            return 'ko';
        }
        
        // Check for Thai characters
        const thaiPattern = /[\u0e00-\u0e7f]/;
        if (thaiPattern.test(text)) {
            return 'th';
        }
        
        // Default to English for Latin scripts
        return 'en';
    }

    /**
     * Check if ElevenLabs is available and has credits remaining
     * @returns {boolean}
     */
    canUseElevenLabs() {
        if (!this.elevenLabsClient) {
            return false;
        }
        
        // Check if we're within free tier limit (with 500 character buffer)
        const hasCredits = this.monthlyCharacterUsage < (this.monthlyCharacterLimit - 500);
        
        if (!hasCredits) {
            console.log('⚠️ [TTS SERVICE] ElevenLabs free tier limit reached, falling back to gTTS');
        }
        
        return hasCredits;
    }

    /**
     * Convert text to speech using ElevenLabs
     * @param {string} text - Text to convert to speech
     * @param {string} outputPath - Path to save the audio file
     * @returns {Promise<string>} - Path to the generated audio file
     */
    async textToSpeechElevenLabs(text, outputPath) {
        try {
            console.log(`🎙️ [TTS SERVICE] Generating speech with ElevenLabs AI Voice...`);
            
            // Use Rachel voice (free tier voice) with multilingual model
            const audio = await this.elevenLabsClient.textToSpeech.convert({
                voice_id: 'Rachel', // Popular free tier voice
                model_id: 'eleven_multilingual_v2',
                text: text,
            });

            // Ensure output directory exists
            const outputDir = path.dirname(outputPath);
            await fs.mkdir(outputDir, { recursive: true });

            // Write audio stream to file
            const writeStream = require('fs').createWriteStream(outputPath);
            
            // Convert async iterator to buffer and write
            const chunks = [];
            for await (const chunk of audio) {
                chunks.push(chunk);
            }
            const buffer = Buffer.concat(chunks);
            await fs.writeFile(outputPath, buffer);

            // Update character usage tracking
            this.monthlyCharacterUsage += text.length;
            const remainingChars = this.monthlyCharacterLimit - this.monthlyCharacterUsage;
            
            console.log(`✅ [TTS SERVICE] ElevenLabs speech generated successfully`);
            console.log(`📊 [TTS SERVICE] Used: ${this.monthlyCharacterUsage}/${this.monthlyCharacterLimit} chars (${remainingChars} remaining)`);
            
            return outputPath;
            
        } catch (error) {
            console.error('❌ [TTS SERVICE] ElevenLabs error:', error.message);
            throw error;
        }
    }

    /**
     * Convert text to speech using gTTS (Google Translate TTS)
     * @param {string} text - Text to convert to speech
     * @param {string} outputPath - Path to save the audio file
     * @param {string} languageCode - Optional language code (e.g., 'en', 'vi', 'zh'). If not provided, will auto-detect
     * @returns {Promise<string>} - Path to the generated audio file
     */
    async textToSpeech(text, outputPath, languageCode = null) {
        const startTime = Date.now();
        try {
            console.log('\n=== 🔊 [TTS SERVICE] TEXT-TO-SPEECH START ===');
            console.log('⏰ [TTS SERVICE] Start time:', new Date().toISOString());
            console.log('📝 [TTS SERVICE] Text length:', text.length, 'characters');
            console.log('📁 [TTS SERVICE] Output path:', outputPath);
            console.log('📄 [TTS SERVICE] RECEIVED TEXT:');
            console.log('   "' + text + '"');
            console.log('');
            
            // Try ElevenLabs first if available (better quality)
            if (this.canUseElevenLabs()) {
                try {
                    const result = await this.textToSpeechElevenLabs(text, outputPath);
                    
                    // Get file size
                    const stats = await fs.stat(outputPath);
                    const fileSize = stats.size;
                    const duration = Date.now() - startTime;
                    
                    console.log('📊 [TTS SERVICE] File size:', (fileSize / 1024).toFixed(2), 'KB');
                    console.log(`⏱️ [TTS SERVICE] Total duration: ${duration}ms`);
                    console.log('=== ✅ [TTS SERVICE] SUCCESS (ElevenLabs) ===\n');
                    
                    return result;
                } catch (elevenLabsError) {
                    console.warn('⚠️ [TTS SERVICE] ElevenLabs failed, falling back to gTTS:', elevenLabsError.message);
                    // Continue to gTTS fallback below
                }
            }
            
            // Use gTTS as fallback (always free)
            console.log('🔄 [TTS SERVICE] Using gTTS (free fallback)');
            
            // Use provided language code or detect from text
            const detectedLang = languageCode || this.detectLanguage(text);
            console.log('🌍 [TTS SERVICE] Language:', languageCode ? `${detectedLang} (provided)` : `${detectedLang} (detected)`);
            
            // Ensure output directory exists
            const outputDir = path.dirname(outputPath);
            await fs.mkdir(outputDir, { recursive: true });
            
            console.log(`🚀 [TTS SERVICE] Generating speech with gTTS (${detectedLang} voice)...`);
            console.log(`🔍 [TTS SERVICE] gTTS will process this text as-is (gTTS may split internally if > 500 chars)`);
            
            // Create gTTS instance with detected language
            const gtts = gttsFactory(detectedLang);
            
            // Generate speech using gTTS with detected language
            await new Promise((resolve, reject) => {
                gtts.save(outputPath, text, (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
            
            // Get file size
            const stats = await fs.stat(outputPath);
            const fileSize = stats.size;
            
            const duration = Date.now() - startTime;
            
            console.log(`✅ [TTS SERVICE] Speech generated successfully in ${duration}ms`);
            console.log('📊 [TTS SERVICE] File size:', (fileSize / 1024).toFixed(2), 'KB');
            console.log('=== ✅ [TTS SERVICE] SUCCESS (gTTS) ===\n');
            
            return outputPath;
            
        } catch (error) {
            const duration = Date.now() - startTime;
            console.error(`\n=== ❌ [TTS SERVICE] FAILED after ${duration}ms ===`);
            console.error('❌ [TTS SERVICE] Error:', error.message);
            console.error('=== ❌ [TTS SERVICE] ERROR END ===\n');
            throw error;
        }
    }

    /**
     * Get supported languages for gTTS
     * @returns {Array} - List of supported language codes - just showing users the 15 most relevant languages for application's target audience
     */
    getSupportedLanguages() {
        return [
            { code: 'en', name: 'English' },
            { code: 'vi', name: 'Vietnamese' },
            { code: 'zh', name: 'Chinese' },
            { code: 'ja', name: 'Japanese' },
            { code: 'ko', name: 'Korean' },
            { code: 'th', name: 'Thai' },
            { code: 'es', name: 'Spanish' },
            { code: 'fr', name: 'French' },
            { code: 'de', name: 'German' },
            { code: 'it', name: 'Italian' },
            { code: 'pt', name: 'Portuguese' },
            { code: 'ru', name: 'Russian' },
            { code: 'ar', name: 'Arabic' },
            { code: 'hi', name: 'Hindi' },
            { code: 'id', name: 'Indonesian' }
            // gTTS supports 100+ languages with auto-detection
        ];
    }

    /**
     * Get current ElevenLabs usage statistics
     * @returns {Object} - Usage statistics
     */
    getUsageStats() {
        return {
            enabled: !!this.elevenLabsClient,
            used: this.monthlyCharacterUsage,
            limit: this.monthlyCharacterLimit,
            remaining: this.monthlyCharacterLimit - this.monthlyCharacterUsage,
            percentUsed: ((this.monthlyCharacterUsage / this.monthlyCharacterLimit) * 100).toFixed(1)
        };
    }

    /**
     * Reset monthly usage counter (call at the start of each month)
     */
    resetMonthlyUsage() {
        this.monthlyCharacterUsage = 0;
        console.log('🔄 [TTS SERVICE] Monthly usage counter reset');
    }
}

module.exports = new TTSService();
