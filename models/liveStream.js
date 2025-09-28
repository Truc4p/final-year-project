const mongoose = require('mongoose');

const liveStreamSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  videoUrl: {
    type: String,
    trim: true,
    default: ''
  },
  thumbnailUrl: {
    type: String,
    trim: true,
    default: ''
  },
  duration: {
    type: Number, // in seconds
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  startTime: {
    type: Date,
    default: null
  },
  endTime: {
    type: Date,
    default: null
  },
  quality: {
    type: String,
    enum: ['480p', '720p', '1080p', '4K'],
    default: '720p'
  },
  isActive: {
    type: Boolean,
    default: false
  },
  isRecorded: {
    type: Boolean,
    default: false
  },
  chatMessages: [{
    username: String,
    message: String,
    timestamp: Date,
    isAdmin: Boolean
  }],
  // Additional metadata
  maxViewers: {
    type: Number,
    default: 0
  },
  categories: [{
    type: String,
    trim: true
  }],
  tags: [{
    type: String,
    trim: true
  }],
  // Admin who created the stream
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for better performance
liveStreamSchema.index({ isActive: 1 });
liveStreamSchema.index({ createdAt: -1 });
liveStreamSchema.index({ viewCount: -1 });
liveStreamSchema.index({ isRecorded: 1 });

// Virtual for formatted duration
liveStreamSchema.virtual('formattedDuration').get(function() {
  const hours = Math.floor(this.duration / 3600);
  const minutes = Math.floor((this.duration % 3600) / 60);
  const seconds = this.duration % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

// Method to increment view count
liveStreamSchema.methods.incrementViewCount = function() {
  this.viewCount += 1;
  return this.save();
};

// Method to add chat message
liveStreamSchema.methods.addChatMessage = function(username, message, isAdmin = false) {
  this.chatMessages.push({
    username,
    message,
    timestamp: new Date(),
    isAdmin
  });
  return this.save();
};

// Static method to get active stream
liveStreamSchema.statics.getActiveStream = function() {
  return this.findOne({ isActive: true });
};

// Static method to get past streams
liveStreamSchema.statics.getPastStreams = function(limit = 10, skip = 0) {
  return this.find({ 
    isActive: false,
    endTime: { $exists: true } // Only require that the stream has ended
  })
  .sort({ endTime: -1 })
  .limit(limit)
  .skip(skip)
  .select('-chatMessages'); // Exclude chat messages for performance
};

const LiveStream = mongoose.model('LiveStream', liveStreamSchema);

module.exports = LiveStream;