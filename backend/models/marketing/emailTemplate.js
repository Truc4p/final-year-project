const mongoose = require('mongoose');

const emailTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['newsletter', 'promotion', 'announcement', 'welcome', 'product_launch', 'abandoned_cart', 'general'],
    default: 'general'
  },
  htmlContent: {
    type: String,
    required: true
  },
  textContent: {
    type: String,
    default: ''
  },
  thumbnail: {
    type: String, // Base64 or URL to template preview image
    default: ''
  },
  
  // Template variables that can be customized
  variables: [{
    name: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['text', 'image', 'url', 'color', 'number'],
      default: 'text'
    },
    defaultValue: String,
    required: {
      type: Boolean,
      default: false
    }
  }],
  
  // Predefined styles
  styles: {
    primaryColor: {
      type: String,
      default: '#007bff'
    },
    secondaryColor: {
      type: String,
      default: '#6c757d'
    },
    backgroundColor: {
      type: String,
      default: '#ffffff'
    },
    textColor: {
      type: String,
      default: '#333333'
    },
    fontFamily: {
      type: String,
      default: 'Arial, sans-serif'
    }
  },
  
  isDefault: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Usage tracking
  usageCount: {
    type: Number,
    default: 0
  },
  lastUsed: {
    type: Date,
    default: null
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes
emailTemplateSchema.index({ category: 1 });
emailTemplateSchema.index({ isActive: 1 });
emailTemplateSchema.index({ isDefault: 1 });
emailTemplateSchema.index({ createdBy: 1 });

// Instance method to render template with variables
emailTemplateSchema.methods.render = function(variables = {}) {
  let renderedHtml = this.htmlContent;
  let renderedText = this.textContent;
  
  // Replace template variables
  this.variables.forEach(variable => {
    const value = variables[variable.name] || variable.defaultValue || '';
    const placeholder = new RegExp(`{{${variable.name}}}`, 'g');
    
    renderedHtml = renderedHtml.replace(placeholder, value);
    renderedText = renderedText.replace(placeholder, value);
  });
  
  // Replace style variables
  Object.keys(this.styles).forEach(styleKey => {
    const placeholder = new RegExp(`{{style.${styleKey}}}`, 'g');
    const value = variables[`style.${styleKey}`] || this.styles[styleKey];
    
    renderedHtml = renderedHtml.replace(placeholder, value);
  });
  
  return {
    html: renderedHtml,
    text: renderedText
  };
};

// Instance method to increment usage
emailTemplateSchema.methods.incrementUsage = function() {
  this.usageCount += 1;
  this.lastUsed = new Date();
  return this.save();
};

// Static method to get popular templates
emailTemplateSchema.statics.getPopularTemplates = function(limit = 10) {
  return this.find({ isActive: true })
    .sort({ usageCount: -1 })
    .limit(limit)
    .select('name description category thumbnail usageCount');
};

// Static method to get templates by category
emailTemplateSchema.statics.getByCategory = function(category) {
  return this.find({ 
    category: category, 
    isActive: true 
  }).sort({ usageCount: -1 });
};

module.exports = mongoose.model('EmailTemplate', emailTemplateSchema);