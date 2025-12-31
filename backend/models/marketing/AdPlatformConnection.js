const mongoose = require('mongoose');
const crypto = require('crypto');

const adPlatformConnectionSchema = new mongoose.Schema({
  platform: {
    type: String,
    enum: ['google_ads', 'facebook_ads', 'instagram_ads', 'tiktok_ads', 'linkedin_ads'],
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['connected', 'disconnected', 'error', 'expired'],
    default: 'disconnected'
  },
  credentials: {
    // For OAuth platforms
    accessToken: String,
    refreshToken: String,
    tokenType: String,
    expiresAt: Date,
    
    // For API key platforms
    apiKey: String,
    apiSecret: String,
    
    // Platform-specific IDs
    accountId: String,
    customerId: String,
    businessId: String,
    adAccountId: String,
    
    // Additional metadata
    scope: [String],
    metadata: mongoose.Schema.Types.Mixed
  },
  settings: {
    // Auto-sync settings
    autoSync: {
      type: Boolean,
      default: true
    },
    syncFrequency: {
      type: String,
      enum: ['realtime', 'hourly', 'daily'],
      default: 'hourly'
    },
    
    // What to sync
    syncCampaigns: {
      type: Boolean,
      default: true
    },
    syncAudiences: {
      type: Boolean,
      default: true
    },
    syncPerformance: {
      type: Boolean,
      default: true
    },
    
    // Notifications
    notifyOnError: {
      type: Boolean,
      default: true
    },
    notificationEmail: String
  },
  lastSync: {
    syncedAt: Date,
    status: String,
    itemsSynced: Number,
    errors: [String]
  },
  usage: {
    apiCallsToday: {
      type: Number,
      default: 0
    },
    apiCallsThisMonth: {
      type: Number,
      default: 0
    },
    dailyLimit: Number,
    monthlyLimit: Number,
    lastResetDate: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Encrypt sensitive credentials before saving
adPlatformConnectionSchema.pre('save', function(next) {
  if (this.isModified('credentials')) {
    // In production, use proper encryption with environment variables
    const algorithm = 'aes-256-cbc';
    const key = process.env.ENCRYPTION_KEY || crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);
    
    // Encrypt access token if present
    if (this.credentials.accessToken) {
      const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
      let encrypted = cipher.update(this.credentials.accessToken);
      encrypted = Buffer.concat([encrypted, cipher.final()]);
      this.credentials.accessToken = iv.toString('hex') + ':' + encrypted.toString('hex');
    }
  }
  next();
});

// Method to decrypt credentials
adPlatformConnectionSchema.methods.getDecryptedToken = function() {
  if (!this.credentials.accessToken) return null;
  
  try {
    const algorithm = 'aes-256-cbc';
    const key = process.env.ENCRYPTION_KEY || crypto.randomBytes(32);
    const textParts = this.credentials.accessToken.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    console.error('Token decryption failed:', error);
    return null;
  }
};

// Check if token is expired
adPlatformConnectionSchema.methods.isTokenExpired = function() {
  if (!this.credentials.expiresAt) return false;
  return new Date() >= this.credentials.expiresAt;
};

// Record API call
adPlatformConnectionSchema.methods.recordApiCall = function() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Reset daily counter if it's a new day
  if (!this.usage.lastResetDate || this.usage.lastResetDate < today) {
    this.usage.apiCallsToday = 0;
    this.usage.lastResetDate = today;
  }
  
  this.usage.apiCallsToday += 1;
  this.usage.apiCallsThisMonth += 1;
  
  return this.save();
};

const AdPlatformConnection = mongoose.model('AdPlatformConnection', adPlatformConnectionSchema);

module.exports = AdPlatformConnection;
