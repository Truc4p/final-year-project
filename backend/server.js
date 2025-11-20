require('dotenv').config();
const app = require("./app");
const WebSocketManager = require("./websocket");
const LiveStream = require("./models/livestream/liveStream");
const PORT = process.env.PORT || 3000;

// Cleanup stuck active streams on server start
const cleanupStuckStreams = async () => {
  try {
    const result = await LiveStream.updateMany(
      { isActive: true, endTime: null },
      { 
        isActive: false, 
        endTime: new Date(),
        duration: 0 
      }
    );
    if (result.modifiedCount > 0) {
      console.log(`🧹 Cleaned up ${result.modifiedCount} stuck active stream(s)`);
    }
  } catch (error) {
    console.error('❌ Error cleaning up stuck streams:', error);
  }
};

const server = app.listen(PORT, '0.0.0.0', async () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
  if (!process.env.GEMINI_API_KEY) {
    console.warn('⚠️  Warning: GEMINI_API_KEY not set. AI chat functionality will use fallback responses.');
  } else {
    console.log('✅ Gemini AI is configured and ready for chat assistance.');
  }
  
  // Clean up any stuck active streams
  await cleanupStuckStreams();
});

// Initialize WebSocket server
const wsManager = new WebSocketManager(server);

// Make WebSocket manager available to other modules
app.locals.wsManager = wsManager;