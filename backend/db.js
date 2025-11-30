const mongoose = require('mongoose');
const secretManager = require('./services/secretManager');

const connectDB = async () => {
  try {
    // Get MongoDB URI from secret manager
    const mongoUri = await secretManager.getSecret('MONGODB_URI').catch(() => {
      // Fallback to hardcoded URI for initial setup
      console.log('⚠️  Using fallback MongoDB URI - consider setting MONGODB_URI in secret manager');
      return "mongodb+srv://mongo-api:7TZYsdhwiXhiKRp9@cluster0.18pi3.mongodb.net/Wrencos?retryWrites=true&w=majority";
    });
    
    await mongoose.connect(mongoUri);
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;