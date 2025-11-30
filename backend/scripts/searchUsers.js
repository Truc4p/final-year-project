const mongoose = require('mongoose');
require('dotenv').config();

async function searchForUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    
    const searchNames = ['Anne', 'an', 'Emma', 'cus'];
    
    console.log('=== SEARCHING FOR USERS ===\n');
    
    for (const name of searchNames) {
      console.log(`Searching for: "${name}"`);
      
      // Search in users collection
      const users = await db.collection('users').find({
        $or: [
          { username: new RegExp(name, 'i') },
          { name: new RegExp(name, 'i') },
          { email: new RegExp(name, 'i') }
        ]
      }).toArray();
      
      if (users.length > 0) {
        users.forEach(u => {
          console.log(`  ✓ Found: ${u.username || u.name || u.email} (${u._id})`);
        });
      } else {
        console.log(`  ✗ Not found`);
      }
      console.log('');
    }
    
    // Check all collections
    console.log('\n=== ALL COLLECTIONS IN DATABASE ===');
    const collections = await db.listCollections().toArray();
    collections.forEach(c => console.log(`  - ${c.name}`));
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

searchForUsers();
