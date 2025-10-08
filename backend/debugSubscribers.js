// Debug script to check subscribers
require('dotenv').config();
const mongoose = require('mongoose');
const NewsletterSubscription = require('./models/marketing/newsletterSubscription');

async function debugSubscribers() {
  try {
    console.log('🔍 Checking newsletter subscribers...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Get all subscribers
    const allSubs = await NewsletterSubscription.find({});
    console.log(`📊 Total subscribers in database: ${allSubs.length}`);
    
    if (allSubs.length > 0) {
      console.log('\n📋 All subscribers:');
      allSubs.forEach((sub, index) => {
        console.log(`${index + 1}. Email: ${sub.email}`);
        console.log(`   isActive: ${sub.isActive}`);
        console.log(`   source: ${sub.source}`);
        console.log(`   preferences:`, sub.preferences);
        console.log('   ---');
      });
    }
    
    // Get active subscribers (what the campaign will use)
    const activeSubs = await NewsletterSubscription.find({ isActive: true });
    console.log(`\n✅ Active subscribers: ${activeSubs.length}`);
    
    if (activeSubs.length > 0) {
      console.log('\n📧 Active subscriber emails:');
      activeSubs.forEach((sub, index) => {
        console.log(`${index + 1}. ${sub.email}`);
      });
    } else {
      console.log('❌ No active subscribers found!');
      console.log('💡 Make sure your subscribers have isActive: true');
    }
    
    // Test the exact query the campaign will use
    const campaignQuery = { isActive: true };
    const campaignSubs = await NewsletterSubscription.find(campaignQuery)
      .select('email name source preferences');
    
    console.log(`\n🎯 Campaign query result: ${campaignSubs.length} recipients`);
    if (campaignSubs.length > 0) {
      console.log('📮 Recipients for campaign:');
      campaignSubs.forEach((sub, index) => {
        console.log(`${index + 1}. ${sub.email} (name: ${sub.name || 'not set'})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

if (require.main === module) {
  debugSubscribers();
}