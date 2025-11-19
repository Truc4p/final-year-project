# Quick Start Guide - Skin Study in Wrencos Mobile App

## ✅ Integration Complete!

The Skin Study mobile app has been successfully integrated into the Wrencos mobile app as a new navigation tab.

## 🚀 How to Run

### 1. Start the Wrencos Backend (Required)

Make sure the Wrencos backend server is running:

```bash
cd wrencos/backend
npm start
```

The backend runs on **port 3000** and includes the AI Dermatology Expert routes.

**Important**: You do NOT need to run the standalone `skin-study/backend` - the AI features are now integrated into Wrencos backend!

### 2. Install Dependencies (Already Done)

Dependencies have already been installed, but if needed:

```bash
cd wrencos/mobile-app-customer
npm install
```

### 3. Run the Mobile App

```bash
cd wrencos/mobile-app-customer
npm start
```

Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator

### 4. Access Skin Study

1. **Login** to your Wrencos account (or register)
2. Look at the **bottom navigation bar**
3. Tap the **"Skin Study" tab** (✨ sparkle icon)
4. Choose your chat mode:
   - **"Go Live with AI"** - Voice chat with AI
   - **"Chat History"** - View past conversations
   - Or simply **type a message** to start text chat

## 📱 Features Available

### AI Dermatology Expert (Text Chat)
- Ask questions about skincare, cosmetics, and dermatology
- Get AI-powered responses with markdown formatting
- Listen to responses with text-to-speech
- Save and load chat history
- Sample questions to get started

### Live Chat AI (Voice Chat)
- Tap and hold to record your voice
- AI transcribes and responds with voice
- Beautiful animated interface
- Real-time conversation
- Session history

## 🎨 What's New in the Navigation Bar

The bottom navigation now has **6 tabs**:

1. **Shop** 🏠 - Browse products
2. **Live** 📹 - Watch livestreams
3. **Cart** 🛒 - Your shopping cart
4. **Orders** 📦 - Order history
5. **Profile** 👤 - User profile
6. **Skin Study** ✨ - AI dermatology expert (NEW!)

## ⚙️ Configuration

If you need to change the backend API URL (for testing on physical devices):

Edit: `wrencos/mobile-app-customer/src/services/skinStudy/api.js`

```javascript
const getApiBaseUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://YOUR_IP:3000'; // Change YOUR_IP to your computer's IP
  }
  return 'http://localhost:3000'; // iOS simulator
};
```

## 🐛 Troubleshooting

### Backend Connection Issues
- Make sure the Wrencos backend is running on port 3000
- Check the API URL in `src/services/skinStudy/api.js` matches your setup
- For Android physical devices, use your computer's IP address
- Verify AI Dermatology routes are working: `http://localhost:3000/api/ai-dermatology-expert/`

### Audio/Recording Issues
- Ensure microphone permissions are granted
- iOS Simulator: Audio features work best on physical devices
- Android Emulator: Make sure audio input is enabled

### Missing Dependencies
If you see errors about missing packages:
```bash
cd wrencos/mobile-app-customer
npm install
```

## 📚 Sample Questions to Try

- "What's a good routine for oily skin?"
- "How do I reduce wrinkles naturally?"
- "What ingredients should I avoid for sensitive skin?"
- "Can you recommend products for acne-prone skin?"
- "How often should I exfoliate?"

## 🎯 Next Steps

The integration is complete and ready to use! You can now:
- Test the text chat functionality
- Try the voice chat feature
- Explore chat history
- Start asking skincare questions

Enjoy your AI-powered skincare assistant! ✨
