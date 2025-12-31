const mongoose = require('mongoose');

const trackingPixelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  pixelId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  type: {
    type: String,
    enum: ['pageview', 'event', 'conversion'],
    default: 'pageview'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'paused'],
    default: 'active'
  },
  description: {
    type: String
  },
  domains: [{
    type: String,
    trim: true
  }],
  eventTypes: [{
    type: String,
    enum: [
      'page_view',
      'product_view',
      'add_to_cart',
      'cart_abandon',
      'checkout_start',
      'purchase',
      'sign_up',
      'lead'
    ]
  }],
  customEvents: [{
    name: String,
    description: String
  }],
  settings: {
    trackAnonymous: {
      type: Boolean,
      default: true
    },
    sessionTimeout: {
      type: Number,
      default: 30 // minutes
    },
    enableCrossDomain: {
      type: Boolean,
      default: false
    },
    cookieDomain: String,
    cookieDuration: {
      type: Number,
      default: 365 // days
    }
  },
  installationCode: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastFiredAt: {
    type: Date
  },
  totalFires: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Generate pixel ID before saving
trackingPixelSchema.pre('save', function(next) {
  if (!this.pixelId) {
    this.pixelId = 'px_' + Math.random().toString(36).substr(2, 16);
  }
  
  // Generate installation code
  if (!this.installationCode) {
    this.installationCode = this.generateInstallationCode();
  }
  
  next();
});

// Method to generate installation code
trackingPixelSchema.methods.generateInstallationCode = function() {
  return `
<!-- Wrencos Tracking Pixel -->
<script>
(function() {
  var w = window;
  w._wrencosPixel = w._wrencosPixel || [];
  w._wrencosPixel.push(['init', '${this.pixelId}']);
  
  var s = document.createElement('script');
  s.type = 'text/javascript';
  s.async = true;
  s.src = '/api/marketing/tracking/pixel.js';
  var x = document.getElementsByTagName('script')[0];
  x.parentNode.insertBefore(s, x);
})();
</script>
<!-- End Wrencos Tracking Pixel -->
  `.trim();
};

// Method to track event
trackingPixelSchema.methods.trackEvent = async function(eventType, data) {
  this.lastFiredAt = new Date();
  this.totalFires += 1;
  await this.save();
  
  // Create tracking event record
  const TrackingEvent = mongoose.model('TrackingEvent');
  return TrackingEvent.create({
    pixelId: this._id,
    eventType,
    data,
    timestamp: new Date()
  });
};

const TrackingPixel = mongoose.model('TrackingPixel', trackingPixelSchema);

module.exports = TrackingPixel;
