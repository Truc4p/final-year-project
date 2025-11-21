# Skin Study Integration into Wrencos Mobile App

## Overview
Successfully integrated the Skin Study mobile app functionality into the Wrencos mobile app as a new navigation tab called "Skin Study".

## What Was Done

### 1. Copied Components
All Skin Study components were copied to Wrencos mobile app:
- **Location**: `wrencos/mobile-app-customer/src/components/skinStudy/`
- **Files**:
  - `AIDermatologyExpert.js` - Main AI dermatology chat interface
  - `AIDermatologyExpert.styles.js` - Styles for the chat interface
  - `ChatHistory.js` - Chat history modal component
  - `LiveChatAI.js` - Live voice chat with AI component

### 2. Copied Services
API services for Skin Study were copied:
- **Location**: `wrencos/mobile-app-customer/src/services/skinStudy/`
- **Files**:
  - `api.js` - API service for AI dermatology expert, including:
    - Chat functionality
    - Audio transcription (speech-to-text)
    - Text-to-speech
    - Chat history storage
    - Live chat session management

### 3. Updated Dependencies
Added the following dependencies to `package.json`:
- `@react-navigation/native-stack`: ^6.9.17 - For native stack navigation
- `expo-av`: ~13.10.4 - For audio recording and playback
- `expo-speech`: ~11.7.0 - For text-to-speech functionality
- `react-native-render-html`: ^6.3.4 - For rendering markdown/HTML in chat messages

### 4. Updated App.js
- Added imports for Skin Study components
- Added `LogBox.ignoreLogs` to suppress defaultProps warnings from react-native-render-html
- Created `SkinStudyStack()` navigator with two screens:
  - `AIDermatologyExpert` - Main chat interface
  - `LiveChatAI` - Live voice chat interface
- Added "Skin Study" tab to bottom navigation with ✨ icon
- Added `SkinStudyIcon` component

## Features Available

### AI Dermatology Expert (Text Chat)
- Text-based chat with AI dermatology expert
- Markdown rendering for formatted responses
- Text-to-speech for AI responses (sentence-by-sentence streaming)
- Sample questions to get started
- Chat history with search functionality
- Session management (text and live chat sessions)

### Live Chat AI (Voice Chat)
- Voice recording and transcription
- Real-time AI responses with audio playback
- Beautiful animated UI with wave effects
- Session history
- Background gradient design

## API Configuration

The Skin Study features use the **Wrencos backend** (port 3000) with integrated AI Dermatology routes:
- **iOS Simulator**: `http://localhost:3000`
- **Android Emulator**: `http://10.0.2.2:3000` or `http://192.168.88.55:3000` (physical device)

The AI Dermatology endpoints are available at `/api/ai-dermatology-expert/*` on the Wrencos backend.

You can update the API URL in `src/services/skinStudy/api.js` based on your environment.

## How to Use

1. **Install Dependencies** (Already done):
   ```bash
   cd wrencos/mobile-app-customer
   npm install
   ```

2. **Start the Wrencos Backend**:
   ```bash
   cd wrencos/backend
   npm start
   ```
   - The Wrencos backend runs on port 3000 and includes AI Dermatology routes
   - The backend has integrated endpoints for:
     - `/api/ai-dermatology-expert/chat`
     - `/api/ai-dermatology-expert/transcribe`
     - `/api/ai-dermatology-expert/text-to-speech`
   - **Note**: You do NOT need to run the standalone Skin Study backend

3. **Run the Mobile App**:
   ```bash
   npm start
   # Then press 'i' for iOS or 'a' for Android
   ```

4. **Access Skin Study**:
   - Open the app
   - Login to your Wrencos account
   - Tap the "Skin Study" tab (✨ icon) at the bottom
   - Choose between text chat or live voice chat

## Navigation Structure

```
MainTabs
├── Home (Shop)
├── Livestream (Live)
├── Cart
├── Orders
├── Profile
└── SkinStudy ✨ (NEW)
    ├── AIDermatologyExpert (Text Chat)
    └── LiveChatAI (Voice Chat)
```

## Notes

- All Skin Study functionality is isolated in the `skinStudy` folders
- The integration uses the existing Wrencos authentication context
- Chat history is stored using AsyncStorage
- The pink color scheme from Skin Study is preserved
- Audio features require permissions on the device

## Future Enhancements

Potential improvements:
- Integration with Wrencos user profile
- Product recommendations based on skin analysis
- Integration with Wrencos shopping cart for recommended products
- Shared chat history between Wrencos and standalone Skin Study app
