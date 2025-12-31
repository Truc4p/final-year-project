/**
 * Initialize Retargeting Ads System
 * 
 * This script sets up the initial configuration for the retargeting ads system
 * including creating a default tracking pixel and sample audiences.
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Models
const TrackingPixel = require('../models/marketing/TrackingPixel');
const Audience = require('../models/marketing/Audience');

async function initializeRetargetingSystem() {
  try {
    console.log('🚀 Initializing Retargeting Ads System...\n');
    
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/wrencos');
    console.log('✅ Connected to database\n');
    
    // 1. Create default tracking pixel
    console.log('📍 Creating default tracking pixel...');
    const existingPixel = await TrackingPixel.findOne({ name: 'Main Website Pixel' });
    
    if (existingPixel) {
      console.log('ℹ️  Main tracking pixel already exists');
    } else {
      const pixel = await TrackingPixel.create({
        name: 'Main Website Pixel',
        type: 'pageview',
        status: 'active',
        description: 'Primary tracking pixel for website visitors',
        eventTypes: [
          'page_view',
          'product_view',
          'add_to_cart',
          'cart_abandon',
          'checkout_start',
          'purchase'
        ],
        settings: {
          trackAnonymous: true,
          sessionTimeout: 30,
          enableCrossDomain: false,
          cookieDuration: 365
        }
      });
      
      console.log('✅ Created tracking pixel:', pixel.pixelId);
      console.log('\n📋 Installation Code:');
      console.log('─'.repeat(80));
      console.log(pixel.installationCode);
      console.log('─'.repeat(80));
      console.log('\n💡 Copy this code and paste it before </head> on your website\n');
    }
    
    // 2. Create sample audiences
    console.log('👥 Creating sample audiences...');
    
    const audiences = [
      {
        name: 'All Visitors - Last 30 Days',
        description: 'All website visitors from the past 30 days',
        type: 'custom',
        rules: {
          conditions: [{
            field: 'eventType',
            operator: 'equals',
            value: 'page_view'
          }],
          logicalOperator: 'AND',
          timeWindow: { value: 30, unit: 'days' },
          excludeConverted: false
        }
      },
      {
        name: 'Cart Abandoners - Last 7 Days',
        description: 'Users who added items to cart but did not purchase',
        type: 'cart_abandoners',
        rules: {
          conditions: [{
            field: 'eventType',
            operator: 'equals',
            value: 'cart_abandon'
          }],
          logicalOperator: 'AND',
          timeWindow: { value: 7, unit: 'days' },
          excludeConverted: true
        }
      },
      {
        name: 'Product Viewers - Last 14 Days',
        description: 'Users who viewed products but did not purchase',
        type: 'product_viewers',
        rules: {
          conditions: [{
            field: 'eventType',
            operator: 'equals',
            value: 'product_view'
          }],
          logicalOperator: 'AND',
          timeWindow: { value: 14, unit: 'days' },
          excludeConverted: true
        }
      },
      {
        name: 'Recent Purchasers',
        description: 'Customers who made a purchase in the last 30 days',
        type: 'purchasers',
        rules: {
          conditions: [{
            field: 'eventType',
            operator: 'equals',
            value: 'purchase'
          }],
          logicalOperator: 'AND',
          timeWindow: { value: 30, unit: 'days' },
          excludeConverted: false
        }
      }
    ];
    
    for (const audienceData of audiences) {
      const existing = await Audience.findOne({ name: audienceData.name });
      if (existing) {
        console.log(`ℹ️  Audience "${audienceData.name}" already exists`);
      } else {
        const audience = await Audience.create(audienceData);
        console.log(`✅ Created audience: ${audience.name}`);
      }
    }
    
    console.log('\n✨ Retargeting Ads System initialized successfully!\n');
    console.log('📖 Next Steps:');
    console.log('1. Install the tracking pixel on your website');
    console.log('2. Connect your ad platform accounts (Google Ads, Facebook Ads)');
    console.log('3. Create ad campaigns and creatives');
    console.log('4. Monitor performance in the analytics dashboard\n');
    
    console.log('📚 Documentation: See RETARGETING_ADS_SETUP.md for complete guide\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Initialization failed:', error);
    process.exit(1);
  }
}

// Run initialization
initializeRetargetingSystem();
