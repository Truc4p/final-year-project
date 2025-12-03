/**
 * Email Connection Model
 * Stores email account connections for bank notification parsing
 */

const mongoose = require('mongoose');

const emailConnectionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    bankAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BankAccount',
      required: true
    },
    provider: {
      type: String,
      enum: ['gmail', 'outlook', 'yahoo', 'imap'],
      required: true
    },
    bankName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
      // Note: This should be encrypted in production
    },
    imapServer: {
      type: String
    },
    imapPort: {
      type: Number,
      default: 993
    },
    autoSync: {
      type: Boolean,
      default: false
    },
    lastSyncDate: {
      type: Date,
      default: null
    },
    syncStatus: {
      type: String,
      enum: ['active', 'error', 'inactive'],
      default: 'active'
    },
    lastError: {
      type: String,
      default: null
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
emailConnectionSchema.index({ userId: 1, bankAccountId: 1 });
emailConnectionSchema.index({ userId: 1, isActive: 1 });

module.exports = mongoose.model('EmailConnection', emailConnectionSchema);

