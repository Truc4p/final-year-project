// Script to add test email subscribers
// Run this with: node addTestSubscribers.js

require('dotenv').config();
const mongoose = require('mongoose');
const NewsletterSubscription = require('./models/marketing/newsletterSubscription');

async function addTestSubscribers() {
  try {
    console.log('🚀 Adding test email subscribers...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Test subscribers data
    const testSubscribers = [
      {
        email: 'truc9pham@gmail.com',
        name: 'Truc Pham',
        source: 'public_page',
        status: 'active',
        preferences: {
          newsletter: true,
          promotions: true,
          newProducts: true
        }
      },
      {
        email: 'test1@example.com',
        name: 'Test User 1',
        source: 'checkout',
        status: 'active',
        preferences: {
          newsletter: true,
          promotions: false,
          newProducts: true
        }
      },
      {
        email: 'test2@example.com', 
        name: 'Test User 2',
        source: 'public_page',
        status: 'active',
        preferences: {
          newsletter: true,
          promotions: true,
          newProducts: false
        }
      },
      {
        email: 'demo@wrencos.com',
        name: 'Demo User',
        source: 'manual',
        status: 'active',
        preferences: {
          newsletter: true,
          promotions: true,
          newProducts: true
        }
      }
    ];
    
    let addedCount = 0;
    let existingCount = 0;
    
    for (const subscriber of testSubscribers) {
      try {
        // Check if subscriber already exists
        const existing = await NewsletterSubscription.findOne({ email: subscriber.email });
        
        if (existing) {
          console.log(`ℹ️  Subscriber already exists: ${subscriber.email}`);
          existingCount++;
        } else {
          const newSubscriber = new NewsletterSubscription(subscriber);
          await newSubscriber.save();
          console.log(`✅ Added subscriber: ${subscriber.email} (${subscriber.name})`);
          addedCount++;
        }
      } catch (error) {
        console.log(`❌ Error adding subscriber ${subscriber.email}:`, error.message);
      }
    }
    
    // Get total count
    const totalSubscribers = await NewsletterSubscription.countDocuments({ status: 'active' });
    
    console.log('\n📊 Summary:');
    console.log(`✅ Added: ${addedCount} new subscribers`);
    console.log(`ℹ️  Existing: ${existingCount} subscribers`);
    console.log(`📧 Total active subscribers: ${totalSubscribers}`);
    
    console.log('\n🎉 Test subscribers ready!');
    console.log('📝 You can now test sending campaigns to:');
    console.log('   - All Subscribers (will reach all active subscribers)');
    console.log('   - Segments (filter by source, preferences, etc.)');
    console.log('   - Custom emails (manually enter email addresses)');
    
  } catch (error) {
    console.error('❌ Failed to add test subscribers:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

if (require.main === module) {
  addTestSubscribers();
}