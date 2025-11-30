const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// This script migrates users from MongoDB Atlas (Wrencos database) to local MongoDB
const ATLAS_URI = 'mongodb+srv://mongo-api:7TZYsdhwiXhiKRp9@cluster0.18pi3.mongodb.net/Wrencos?retryWrites=true&w=majority';
const LOCAL_URI = 'mongodb://localhost:27017/wrencos_db';

// Users from your Atlas database (from the screenshot)
const atlasUsers = [
  {
    _id: '68624e5b92c09310c2ee72ae',
    username: 'Anne',
    password: '$2a$10$.zRoIG4f5jfOpDcAYvgSM0r89DLhzveVhS3h3/gvhYYlujmQSi+ZC',
    role: 'customer',
    email: 'truc9pham@gmail.com',
    phone: '+842367302266',
    address: '658 Ng. Quyền, An Hải Bắc, Sơn Trà, Đà Nẵng 550000, Vietnam'
  },
  {
    _id: '68637la48a2034f952e0ff6a',
    username: 'ad',
    password: '$2a$10$T2jBhvP6pqbN3lEAQkuy/eIOXXDq4bJtK8xyfT6TPq3y0320KriEm',
    role: 'admin'
  },
  {
    _id: '687223280466004511509660',
    username: 'cus',
    password: '$2a$10$oZy6XdiE27/2rPK5NUq7we0ZqNlT.AUrQwH/aZtYAHARmc05X56IG',
    role: 'customer',
    email: 'truc9pham@gmail.com',
    phone: '+842367302266',
    address: '658 Ng. Quyền, An Hải Bắc, Sơn Trà, Đà Nẵng 550000, Vietnam'
  },
  {
    _id: '687223cb7e87aa1c383c74c4',
    username: 'customer',
    password: '$2a$10$oCYJhLPM.Jqy1iAp0/d5T0G0n0D5ybIqa36CqqrWPIp48uJrtmpva',
    role: 'customer',
    createdAt: '2025-07-12T08:58:51.860+00:00'
  }
];

async function migrateUsers() {
  try {
    console.log('🔄 Starting user migration from Atlas to Local MongoDB...\n');
    
    // Connect to local database
    await mongoose.connect(LOCAL_URI);
    console.log('✅ Connected to local MongoDB\n');
    
    const User = mongoose.model('User', new mongoose.Schema({
      username: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      role: { type: String, enum: ['admin', 'customer'], default: 'customer' },
      email: String,
      phone: String,
      address: String,
      createdAt: { type: Date, default: Date.now }
    }));
    
    let migrated = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const atlasUser of atlasUsers) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ username: atlasUser.username });
        
        if (existingUser) {
          console.log(`⏭️  User "${atlasUser.username}" already exists - skipping`);
          skipped++;
          continue;
        }
        
        // Create new user with the same hashed password
        const newUser = new User({
          username: atlasUser.username,
          password: atlasUser.password, // Keep the existing hash
          role: atlasUser.role,
          email: atlasUser.email,
          phone: atlasUser.phone,
          address: atlasUser.address,
          createdAt: atlasUser.createdAt || new Date()
        });
        
        // Save without triggering password re-hashing
        await newUser.save({ validateBeforeSave: false });
        
        console.log(`✅ Migrated user: ${atlasUser.username} (${atlasUser.role})`);
        migrated++;
        
      } catch (err) {
        console.error(`❌ Error migrating ${atlasUser.username}:`, err.message);
        errors++;
      }
    }
    
    console.log('\n=== MIGRATION SUMMARY ===');
    console.log(`✅ Migrated: ${migrated}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log(`❌ Errors: ${errors}`);
    console.log(`📊 Total: ${atlasUsers.length}`);
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

migrateUsers();
