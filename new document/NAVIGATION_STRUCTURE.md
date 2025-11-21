# Wrencos Mobile App Navigation Structure

## Updated Navigation Hierarchy

```
App
│
├── Authentication Flow (Not Authenticated)
│   ├── Login Screen
│   └── Register Screen
│
└── Main Tabs (Authenticated)
    │
    ├── [1] Home Tab (Shop) 🏠
    │   ├── Home Screen (Product List)
    │   ├── Product Detail Screen
    │   └── Cart Screen
    │
    ├── [2] Livestream Tab 📹
    │   └── Livestream Screen
    │
    ├── [3] Cart Tab 🛒
    │   └── Cart Screen
    │
    ├── [4] Orders Tab 📦
    │   ├── Orders List Screen
    │   └── Order Detail Screen
    │
    ├── [5] Profile Tab 👤
    │   └── Profile Screen
    │
    └── [6] Skin Study Tab ✨ **NEW!**
        ├── AI Dermatology Expert (Text Chat)
        │   ├── Chat Interface
        │   ├── Sample Questions
        │   ├── Text-to-Speech
        │   └── Chat History Modal
        │       ├── Text Chat Sessions
        │       └── Live Chat Sessions
        │
        └── Live Chat AI (Voice Chat)
            ├── Voice Recording
            ├── Speech-to-Text Transcription
            ├── AI Response with TTS
            ├── Animated Wave Interface
            └── Session Management
```

## Screen Components Mapping

### Original Wrencos Screens
```
src/screens/
├── LoginScreen.js
├── RegisterScreen.js
├── HomeScreen.js
├── ProductDetailScreen.js
├── CartScreen.js
├── OrdersScreen.js
├── OrderDetailScreen.js
├── ProfileScreen.js
└── LivestreamScreen.js
```

### New Skin Study Components
```
src/components/skinStudy/
├── AIDermatologyExpert.js         # Main text chat interface
├── AIDermatologyExpert.styles.js  # Styles for text chat
├── ChatHistory.js                  # Chat history modal
└── LiveChatAI.js                   # Voice chat interface

src/services/skinStudy/
└── api.js                          # API service layer
    ├── aiDermatologyExpertService
    ├── liveChatService
    ├── chatStorage
    └── liveChatStorage
```

## Navigation Flow Examples

### Flow 1: Text Chat with AI
```
User taps "Skin Study" tab (✨)
  → AIDermatologyExpert screen opens
  → User types question or selects sample question
  → AI responds with formatted text
  → User can tap speaker icon to hear response
  → Can tap "Live" to switch to voice chat
  → Can tap "History" to view past conversations
```

### Flow 2: Voice Chat with AI
```
User taps "Skin Study" tab (✨)
  → AIDermatologyExpert screen opens
  → User taps "Live" button
  → LiveChatAI screen opens (full screen modal)
  → User taps and holds mic button to record
  → Audio is transcribed to text
  → AI responds with voice
  → Conversation history is saved
  → User can tap "X" to end session
```

### Flow 3: Chat History
```
User taps "Skin Study" tab (✨)
  → AIDermatologyExpert screen opens
  → User taps "History" button
  → ChatHistory modal opens
  → Shows list of text and live chat sessions
  → User can:
    - Search conversations
    - Load text chat (stays in modal)
    - View live chat details (expands in modal)
    - Delete sessions
```

## Tab Bar Icons

| Tab | Icon | Label | Type |
|-----|------|-------|------|
| 1 | 🏠 | Shop | Original |
| 2 | 📹 | Live | Original |
| 3 | 🛒 | Cart | Original |
| 4 | 📦 | Orders | Original |
| 5 | 👤 | Profile | Original |
| 6 | ✨ | Skin Study | **NEW** |

## Color Schemes

### Wrencos Theme
- Primary: `#FF6B35` (Orange)
- Background: White/Light gray
- Accent: Dark gray

### Skin Study Theme (Preserved)
- Primary: `#A44A6B` (Pink/Rose)
- Background: `#FDFBF7` (Cream)
- Accent: Pink shades

## API Endpoints Used

### Wrencos Backend with AI Dermatology (Port 3000)
```
POST /api/ai-dermatology-expert/chat
- Body: { message, conversationHistory }
- Returns: { response, sources }

POST /api/ai-dermatology-expert/transcribe
- Body: FormData with audio file
- Returns: { transcription }

POST /api/ai-dermatology-expert/text-to-speech
- Body: { text }
- Returns: { audio: base64 }
```

## State Management

### AsyncStorage Keys
- `aiDermatologyExpertChat` - Current text chat history
- `liveChatHistory` - Current live chat messages
- `liveChatSessions` - All saved live chat sessions
- `liveChatCurrentSession` - Current session ID

### Navigation Context
- Uses React Navigation with nested navigators
- Stack navigation for screens within tabs
- Bottom tab navigation for main sections
- Modal presentation for LiveChatAI

## Integration Points

The Skin Study tab is:
- ✅ Fully isolated in separate folders
- ✅ Uses existing AuthProvider from Wrencos
- ✅ Compatible with Wrencos navigation
- ✅ Maintains its own color scheme
- ✅ Has independent state management
- ✅ Can be easily removed if needed

No changes were made to:
- Wrencos authentication system
- Wrencos database/API
- Other Wrencos screens
- Wrencos styling/theming
