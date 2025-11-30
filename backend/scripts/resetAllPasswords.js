const mongoose = require('mongoose');
const User = require('../models/auth/user');
require('dotenv').config();

// Strong password for all users
const COMMON_PASSWORD = 'Wrencos@2025!Strong';

async function resetAllPasswords() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    console.log('🔄 Resetting passwords for ALL users...\n');
    console.log(`📝 New password: ${COMMON_PASSWORD}\n`);
    
    const users = await User.find({});
    console.log(`Found ${users.length} users\n`);
    
    let updated = 0;
    let errors = 0;
    
    for (const user of users) {
      try {
        user.password = COMMON_PASSWORD;
        await user.save();
        
        console.log(`✅ Updated: ${user.username} (${user.role})`);
        updated++;
        
      } catch (err) {
        console.error(`❌ Error updating ${user.username}:`, err.message);
        errors++;
      }
    }
    
    console.log('\n=== PASSWORD RESET SUMMARY ===');
    console.log(`✅ Updated: ${updated}`);
    console.log(`❌ Errors: ${errors}`);
    console.log(`📊 Total: ${users.length}`);
    
    console.log('\n🎉 All passwords have been set to: ' + COMMON_PASSWORD);
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Password reset failed:', err);
    process.exit(1);
  }
}

resetAllPasswords();
