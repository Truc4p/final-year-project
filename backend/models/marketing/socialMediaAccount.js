const mongoose = require('mongoose');

const socialMediaAccountSchema = new mongoose.Schema({
  platform: {
    type: String,
    enum: ['facebook', 'instagram', 'twitter', 'linkedin'],
    required: true
  },
  accountName: {
    type: String,
    required: true
  },
  accountId: {
    type: String,
    required: true
  },
  accessToken: {
    type: String,
    required: true
  },
  refreshToken: {
    type: String
  },
  tokenExpiresAt: {
    type: Date
  },
  profilePicture: {
    type: String
  },
  followers: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  connectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastSyncedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for faster queries
socialMediaAccountSchema.index({ platform: 1, isActive: 1 });
socialMediaAccountSchema.index({ connectedBy: 1 });

module.exports = mongoose.model('SocialMediaAccount', socialMediaAccountSchema);
