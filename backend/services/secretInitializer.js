const secretManager = require('./secretManager');
const crypto = require('crypto');

/**
 * Initialize secrets for the application
 * This should be run once during application setup
 */
async function initializeSecrets() {
    try {
        console.log('🔐 Initializing Secret Manager...');
        
        // Ensure secret manager is initialized
        await secretManager.initialize();
        
        // Generate secure JWT secret if not exists
        if (!await secretManager.hasSecret('JWT_SECRET')) {
            const jwtSecret = crypto.randomBytes(64).toString('hex');
            await secretManager.setSecret('JWT_SECRET', jwtSecret);
            console.log('🔑 Generated secure JWT secret');
        }
        
        // Generate secure admin key if not exists
        if (!await secretManager.hasSecret('ADMIN_KEY')) {
            const adminKey = crypto.randomBytes(32).toString('hex');
            await secretManager.setSecret('ADMIN_KEY', adminKey);
            console.log('🔑 Generated secure admin key');
            console.log('🔑 Admin key:', adminKey);
            console.log('⚠️  Save this admin key securely - it will be needed for admin registration');
        }
        
        // Set default values for missing environment variables
        const defaultSecrets = {
            NODE_ENV: 'development',
            PORT: '3000',
            QDRANT_URL: 'http://localhost:6333',
            REDIS_URL: 'redis://localhost:6379',
            FRONTEND_URL: 'http://localhost:5173',
            COMPANY_NAME: 'Wrencos'
        };
        
        for (const [key, value] of Object.entries(defaultSecrets)) {
            if (!await secretManager.hasSecret(key)) {
                await secretManager.setSecret(key, value);
                console.log(`📝 Set default value for ${key}`);
            }
        }
        
        // Migrate from .env if it exists
        await secretManager.migrateFromEnv().catch(() => {
            console.log('ℹ️  No .env file found - using secret manager configuration');
        });
        
        console.log('✅ Secret Manager initialization completed');
        
        // Display health check
        const health = await secretManager.healthCheck();
        console.log('🔍 Secret Manager Status:', {
            initialized: health.initialized,
            secretsCount: health.secretsCount,
            encryptionKeyPresent: health.encryptionKeyPresent
        });
        
        return true;
    } catch (error) {
        console.error('❌ Failed to initialize secrets:', error.message);
        throw error;
    }
}

module.exports = { initializeSecrets, secretManager };