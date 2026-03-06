const mongoose = require('mongoose');
const secretManager = require('./services/secretManager');

const connectDB = async () => {
  try {
    // Get MongoDB URI from secret manager, fallback to environment variable
    const mongoUri = await secretManager.getSecret('MONGODB_URI').catch(() => {
      console.log('Using MongoDB URI from environment variable');
      return process.env.MONGODB_URI;
    });
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in secret manager or environment variables. Please set it in .env file.');
    }
    
    await mongoose.connect(mongoUri);
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;