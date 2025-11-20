const mongoose = require('mongoose');
const LiveStream = require('../models/livestream/liveStream');
require('dotenv').config({ path: '../.env' });

async function cleanupLivestreams() {
  try {
    // Connect to MongoDB Atlas
    const dbUri = process.env.MONGODB_URI || 'mongodb+srv://mongo-api:7TZYsdhwiXhiKRp9@cluster0.18pi3.mongodb.net/Wrencos?retryWrites=true&w=majority';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(dbUri);
    console.log('Connected to MongoDB');

    // Count existing livestream records
    const count = await LiveStream.countDocuments();
    console.log(`\nFound ${count} livestream records in database`);

    if (count === 0) {
      console.log('No livestream records to delete');
      await mongoose.connection.close();
      process.exit(0);
    }

    // Ask for confirmation
    console.log('\n⚠️  WARNING: This will delete ALL livestream records from the database!');
    console.log('Press Ctrl+C to cancel or wait 5 seconds to continue...\n');
    
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Delete all livestream records
    console.log('Deleting all livestream records...');
    const result = await LiveStream.deleteMany({});
    
    console.log(`✅ Successfully deleted ${result.deletedCount} livestream records`);

    // Verify deletion
    const remainingCount = await LiveStream.countDocuments();
    console.log(`Remaining records: ${remainingCount}`);

    // Close connection
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error cleaning up livestreams:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

cleanupLivestreams();
