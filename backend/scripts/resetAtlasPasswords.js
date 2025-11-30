const mongoose = require('mongoose');
const User = require('../models/auth/user');
require('dotenv').config();

// Password reset configuration
const PASSWORD_RESETS = {
  'Anne': 'Anne123',
  'an': 'an123',
  'Emma': 'Emma123',
  'cus': 'cus123',
  'ad': 'admin123',
  'customer': 'customer123'
};

async function resetPasswords() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    console.log('🔄 Resetting passwords for Atlas users...\n');
    
    for (const [username, newPassword] of Object.entries(PASSWORD_RESETS)) {
      try {
        const user = await User.findOne({ username });
        
        if (!user) {
          console.log(`⏭️  User "${username}" not found - skipping`);
          continue;
        }
        
        user.password = newPassword;
        await user.save();
        
        console.log(`✅ Reset password for: ${username}`);
        console.log(`   New password: ${newPassword}\n`);
        
      } catch (err) {
        console.error(`❌ Error resetting ${username}:`, err.message);
      }
    }
    
    console.log('\n🎉 Password reset complete!');
    console.log('\nYou can now login with:');
    Object.entries(PASSWORD_RESETS).forEach(([username, password]) => {
      console.log(`  - Username: ${username}, Password: ${password}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Password reset failed:', err);
    process.exit(1);
  }
}

resetPasswords();
