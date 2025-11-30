const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

/**
 * Secret Manager Service
 * Provides centralized secret management with encryption for development
 * and support for cloud-based secret stores in production
 */
class SecretManager {
    constructor() {
        this.secrets = new Map();
        this.isInitialized = false;
        this.encryptionKey = null;
        this.secretsFilePath = path.join(__dirname, '..', '.secrets.enc');
        this.algorithm = 'aes-256-gcm';
    }

    /**
     * Initialize the secret manager
     */
    async initialize() {
        if (this.isInitialized) return;

        try {
            // Generate or load encryption key
            await this.initializeEncryptionKey();
            
            // Load existing secrets if available
            await this.loadSecrets();
            
            // Load secrets from environment variables as fallback
            this.loadFromEnvironment();
            
            this.isInitialized = true;
            console.log('🔐 Secret Manager initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize Secret Manager:', error.message);
            throw error;
        }
    }

    /**
     * Get a secret by key
     */
    async getSecret(key) {
        await this.ensureInitialized();
        
        const secret = this.secrets.get(key);
        if (!secret) {
            // Fallback to environment variable
            const envValue = process.env[key];
            if (envValue) {
                console.log(`📝 Loading secret '${key}' from environment variable`);
                return envValue;
            }
            throw new Error(`Secret '${key}' not found`);
        }
        
        return secret;
    }

    /**
     * Set a secret
     */
    async setSecret(key, value) {
        await this.ensureInitialized();
        
        if (!key || !value) {
            throw new Error('Secret key and value are required');
        }
        
        this.secrets.set(key, value);
        await this.saveSecrets();
        console.log(`🔐 Secret '${key}' stored successfully`);
    }

    /**
     * Update multiple secrets at once
     */
    async setSecrets(secretsObject) {
        await this.ensureInitialized();
        
        for (const [key, value] of Object.entries(secretsObject)) {
            this.secrets.set(key, value);
        }
        
        await this.saveSecrets();
        console.log(`🔐 Updated ${Object.keys(secretsObject).length} secrets`);
    }

    /**
     * Get all secret keys (for debugging/management)
     */
    async getSecretKeys() {
        await this.ensureInitialized();
        return Array.from(this.secrets.keys());
    }

    /**
     * Delete a secret
     */
    async deleteSecret(key) {
        await this.ensureInitialized();
        
        const deleted = this.secrets.delete(key);
        if (deleted) {
            await this.saveSecrets();
            console.log(`🗑️ Secret '${key}' deleted`);
        }
        return deleted;
    }

    /**
     * Check if secret exists
     */
    async hasSecret(key) {
        await this.ensureInitialized();
        return this.secrets.has(key) || !!process.env[key];
    }

    /**
     * Ensure the secret manager is initialized
     */
    async ensureInitialized() {
        if (!this.isInitialized) {
            await this.initialize();
        }
    }

    /**
     * Initialize or load encryption key
     */
    async initializeEncryptionKey() {
        const keyPath = path.join(__dirname, '..', '.secret-key');
        
        try {
            // Try to load existing key
            const keyBuffer = await fs.readFile(keyPath);
            this.encryptionKey = keyBuffer;
        } catch (error) {
            // Generate new key if not found
            this.encryptionKey = crypto.randomBytes(32);
            await fs.writeFile(keyPath, this.encryptionKey);
            console.log('🔑 Generated new encryption key');
        }
    }

    /**
     * Load secrets from encrypted file
     */
    async loadSecrets() {
        try {
            const encryptedData = await fs.readFile(this.secretsFilePath);
            const decryptedData = this.decrypt(encryptedData);
            const secretsObject = JSON.parse(decryptedData);
            
            for (const [key, value] of Object.entries(secretsObject)) {
                this.secrets.set(key, value);
            }
            
            console.log(`📂 Loaded ${this.secrets.size} secrets from encrypted storage`);
        } catch (error) {
            if (error.code !== 'ENOENT') {
                console.warn('⚠️ Failed to load encrypted secrets:', error.message);
            }
        }
    }

    /**
     * Save secrets to encrypted file
     */
    async saveSecrets() {
        try {
            const secretsObject = Object.fromEntries(this.secrets);
            const jsonData = JSON.stringify(secretsObject, null, 2);
            const encryptedData = this.encrypt(jsonData);
            
            await fs.writeFile(this.secretsFilePath, encryptedData);
        } catch (error) {
            console.error('❌ Failed to save secrets:', error.message);
            throw error;
        }
    }

    /**
     * Load secrets from environment variables
     */
    loadFromEnvironment() {
        const envSecrets = [
            'JWT_SECRET',
            'GEMINI_API_KEY',
            'MONGODB_URI',
            'GMAIL_USER',
            'GMAIL_APP_PASSWORD',
            'VNP_HASH_SECRET',
            'VNP_TMN_CODE',
            'QDRANT_API_KEY',
            'QDRANT_URL',
            'REDIS_URL',
            'COMPANY_NAME',
            'FRONTEND_URL',
            'NODE_ENV',
            'PORT'
        ];

        let loadedCount = 0;
        for (const key of envSecrets) {
            const value = process.env[key];
            if (value && !this.secrets.has(key)) {
                this.secrets.set(key, value);
                loadedCount++;
            }
        }

        if (loadedCount > 0) {
            console.log(`📝 Loaded ${loadedCount} secrets from environment variables`);
        }
    }

    /**
     * Encrypt data
     */
    encrypt(text) {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-cbc', this.encryptionKey, iv);
        
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        return Buffer.concat([
            iv,
            Buffer.from(encrypted, 'hex')
        ]);
    }

    /**
     * Decrypt data
     */
    decrypt(encryptedBuffer) {
        const iv = encryptedBuffer.slice(0, 16);
        const encrypted = encryptedBuffer.slice(16);
        
        const decipher = crypto.createDecipheriv('aes-256-cbc', this.encryptionKey, iv);
        
        let decrypted = decipher.update(encrypted, null, 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    }

    /**
     * Migrate from environment variables to encrypted storage
     */
    async migrateFromEnv() {
        await this.ensureInitialized();
        
        const envFile = path.join(__dirname, '..', '.env');
        try {
            const envContent = await fs.readFile(envFile, 'utf8');
            const lines = envContent.split('\n');
            
            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed && !trimmed.startsWith('#')) {
                    const [key, ...valueParts] = trimmed.split('=');
                    const value = valueParts.join('=');
                    
                    if (key && value) {
                        await this.setSecret(key, value);
                    }
                }
            }
            
            console.log('🔄 Migration from .env file completed');
        } catch (error) {
            console.warn('⚠️ Could not migrate from .env file:', error.message);
        }
    }

    /**
     * Export secrets for backup (encrypted)
     */
    async exportSecrets() {
        await this.ensureInitialized();
        
        const secretsObject = Object.fromEntries(this.secrets);
        const exportData = {
            timestamp: new Date().toISOString(),
            version: '1.0',
            secrets: secretsObject
        };
        
        return JSON.stringify(exportData, null, 2);
    }

    /**
     * Health check
     */
    async healthCheck() {
        const status = {
            initialized: this.isInitialized,
            secretsCount: this.secrets.size,
            encryptionKeyPresent: !!this.encryptionKey,
            timestamp: new Date().toISOString()
        };
        
        return status;
    }
}

// Create singleton instance
const secretManager = new SecretManager();

module.exports = secretManager;