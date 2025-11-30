const mongoose = require('mongoose');
require('dotenv').config();

async function checkAllUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    const users = await db.collection('users').find({}).toArray();
    
    console.log('=== ALL USERS IN DATABASE ===\n');
    users.forEach((u, i) => {
      console.log(`${i+1}. ID: ${u._id}`);
      console.log(`   Username: ${u.username || 'MISSING'}`);
      console.log(`   Name: ${u.name || 'N/A'}`);
      console.log(`   Email: ${u.email || 'N/A'}`);
      console.log(`   Role: ${u.role}`);
      console.log(`   Created: ${u.createdAt}`);
      console.log('');
    });
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkAllUsers();
