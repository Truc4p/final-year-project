const mongoose = require('mongoose');

const postTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String
  },
  category: {
    type: String,
    enum: ['product_launch', 'promotion', 'announcement', 'engagement', 'holiday', 'tips', 'behind_the_scenes', 'user_generated', 'general'],
    default: 'general'
  },
  content: {
    type: String,
    required: true
  },
  defaultHashtags: [{
    type: String,
    trim: true
  }],
  platforms: [{
    type: String,
    enum: ['facebook', 'instagram', 'twitter', 'linkedin']
  }],
  variables: [{
    name: { type: String, required: true },
    label: { type: String, required: true },
    type: { type: String, enum: ['text', 'number', 'url', 'date'], default: 'text' },
    defaultValue: { type: String },
    required: { type: Boolean, default: false }
  }],
  thumbnail: {
    type: String
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  usageCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
postTemplateSchema.index({ category: 1, isPublic: 1 });
postTemplateSchema.index({ createdBy: 1 });

module.exports = mongoose.model('PostTemplate', postTemplateSchema);
