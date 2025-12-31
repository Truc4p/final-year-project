const mongoose = require('mongoose');

const trackingEventSchema = new mongoose.Schema({
  pixelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TrackingPixel',
    required: true,
    index: true
  },
  eventType: {
    type: String,
    required: true,
    enum: [
      'page_view',
      'product_view',
      'add_to_cart',
      'cart_abandon',
      'checkout_start',
      'purchase',
      'sign_up',
      'lead',
      'custom'
    ],
    index: true
  },
  eventName: {
    type: String,
    index: true
  },
  visitorId: {
    type: String,
    index: true
  },
  sessionId: {
    type: String,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  data: {
    url: String,
    referrer: String,
    userAgent: String,
    ipAddress: String,
    country: String,
    city: String,
    device: String,
    browser: String,
    os: String,
    
    // E-commerce specific
    productId: mongoose.Schema.Types.ObjectId,
    productName: String,
    productPrice: Number,
    quantity: Number,
    cartValue: Number,
    orderId: String,
    orderValue: Number,
    currency: {
      type: String,
      default: 'VND'
    },
    
    // Custom data
    customProperties: mongoose.Schema.Types.Mixed
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Index for querying recent events
trackingEventSchema.index({ timestamp: -1 });
trackingEventSchema.index({ pixelId: 1, timestamp: -1 });
trackingEventSchema.index({ visitorId: 1, timestamp: -1 });
trackingEventSchema.index({ eventType: 1, timestamp: -1 });

// TTL index - automatically delete events older than 90 days
trackingEventSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 });

const TrackingEvent = mongoose.model('TrackingEvent', trackingEventSchema);

module.exports = TrackingEvent;
