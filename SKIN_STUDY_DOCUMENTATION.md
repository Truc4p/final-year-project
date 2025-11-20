# Skin Study Feature Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Components](#components)
4. [API Documentation](#api-documentation)
5. [Setup Guide](#setup-guide)
6. [Usage Examples](#usage-examples)
7. [Knowledge Base](#knowledge-base)
8. [Performance & Monitoring](#performance--monitoring)

## Overview

The Skin Study feature is an AI-powered dermatology expert system integrated into the Wrencos platform. It provides intelligent skincare consultation through text chat, voice interaction, and image analysis capabilities.

### Key Features
- **AI Dermatology Expert**: Advanced conversational AI with specialized dermatology knowledge
- **Multi-modal Interaction**: Text, voice, and image analysis
- **RAG (Retrieval-Augmented Generation)**: Context-aware responses using curated dermatology literature
- **Cross-platform**: Available on both web (Vue.js) and mobile (React Native)
- **Real-time Voice Chat**: Live audio interaction with AI
- **Chat History**: Persistent conversation storage and retrieval
- **Multi-language Support**: Automatic language detection and translation

## Architecture

### System Overview
```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend Layer                           │
├─────────────────────────────────────────────────────────────────┤
│  Web (Vue.js)                    │  Mobile (React Native)       │
│  ├── AIDermatologyExpert.vue     │  ├── AIDermatologyExpert.js  │
│  └── Chat Interface              │  ├── LiveChatAI.js           │
│                                  │  └── ChatHistory.js          │
└─────────────────────────────────────────────────────────────────┘
                                   │
                              HTTP/REST API
                                   │
┌─────────────────────────────────────────────────────────────────┐
│                        Backend Layer                            │
├─────────────────────────────────────────────────────────────────┤
│  Controllers                     │  Services                    │
│  └── aiDermatologyExpertController │ ├── geminiService          │
│                                  │  ├── vectorService          │
│                                  │  └── ttsService             │
└─────────────────────────────────────────────────────────────────┘
                                   │
┌─────────────────────────────────────────────────────────────────┐
│                      Data & AI Layer                           │
├─────────────────────────────────────────────────────────────────┤
│  Vector Database (Qdrant)       │  Knowledge Sources           │
│  ├── Embeddings Storage         │  ├── Dermatology Textbooks   │
│  └── Similarity Search          │  ├── Research Papers         │
│                                  │  └── Clinical Guidelines     │
│                                  │                              │
│  AI Services                     │  Database (MongoDB)          │
│  ├── Google Gemini Pro          │  └── DermatologyKnowledge    │
│  ├── Google Cloud TTS           │                              │
│  └── Speech Recognition         │                              │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

#### 1. Text Chat Flow
```
User Input → Frontend → Backend Controller → Vector Search (RAG) → Gemini AI → Response → Frontend
```

#### 2. Image Analysis Flow
```
User Image → Frontend → Backend Controller → Image Processing → Gemini Vision + RAG Context → Analysis → Frontend
```

#### 3. Voice Chat Flow
```
User Speech → Frontend → Speech Recognition → Text Processing → AI Response → Text-to-Speech → Audio Response
```

### Technology Stack

**Frontend:**
- **Web**: Vue.js 3, Composition API, Marked (Markdown parsing)
- **Mobile**: React Native, Expo, React Native Render HTML

**Backend:**
- **Runtime**: Node.js with Express.js
- **AI Services**: Google Gemini Pro, Google Cloud Text-to-Speech
- **Vector Database**: Qdrant (for RAG implementation)
- **Database**: MongoDB with Mongoose
- **File Processing**: Multer for file uploads

**AI & ML:**
- **Language Model**: Google Gemini Pro (text and vision)
- **Embeddings**: Google Embedding API
- **TTS**: Google Cloud Text-to-Speech
- **STT**: Google Speech-to-Text (via Gemini)

## Components

### Frontend Components

#### Web (Vue.js)
**File**: `wrencos/frontend/src/pages/customer/skin-study/AIDermatologyExpert.vue`

**Features:**
- Responsive chat interface with markdown support
- Image upload and preview
- Sample question categories (9 categories with 70+ questions)
- Chat history with search functionality
- Real-time typing indicators
- Mobile-responsive design

**Key Methods:**
- `sendMessage()`: Handles user input and API communication
- `getAIResponse()`: Manages AI service calls with fallback
- `handleImageSelect()`: Processes image uploads
- `formatMessage()`: Converts markdown to HTML
- `generateContextualResponse()`: Provides offline fallback responses

#### Mobile (React Native)
**Files:**
- `wrencos/mobile-app-customer/src/components/skinStudy/AIDermatologyExpert.js`
- `wrencos/mobile-app-customer/src/components/skinStudy/LiveChatAI.js`
- `wrencos/mobile-app-customer/src/components/skinStudy/ChatHistory.js`

**Features:**
- Native mobile chat interface
- Voice recording and playback
- Real-time audio streaming
- Cross-platform chat history
- Performance optimizations with memoization
- Text-to-speech with sentence-by-sentence streaming

### Backend Components

#### Controller
**File**: `wrencos/backend/controllers/skin-study/aiDermatologyExpertController.js`

**Endpoints:**
- `POST /api/ai-dermatology-expert/chat` - Text chat
- `POST /api/ai-dermatology-expert/analyze-skin` - Image analysis
- `POST /api/ai-dermatology-expert/transcribe` - Audio transcription
- `POST /api/ai-dermatology-expert/text-to-speech` - Voice synthesis

#### Services

**Gemini Service** (`services/geminiService.js`):
- Text generation with context
- Image analysis with vision model
- Audio transcription
- Language detection and translation

**Vector Service** (`services/vectorService.js`):
- Document embedding and indexing
- Similarity search for RAG
- Context retrieval and ranking

**TTS Service** (`services/ttsService.js`):
- Google Cloud Text-to-Speech integration
- Audio file generation and streaming

#### Data Model
**File**: `wrencos/backend/models/skin-study/DermatologyKnowledge.js`

```javascript
{
  category: String,        // skin-conditions, ingredients, treatments, etc.
  subcategory: String,     // Specific area within category
  title: String,          // Document title
  content: String,        // Full content text
  keywords: [String],     // Search keywords
  sourceReference: String, // Source book/paper reference
  chapterNumber: String,  // Optional chapter reference
  verified: Boolean,      // Content verification status
  timestamps: Date        // Created/updated timestamps
}
```

## API Documentation

### Authentication
All endpoints are currently public. Add authentication headers as needed:
```javascript
headers: {
  'Authorization': 'Bearer <token>',
  'Content-Type': 'application/json'
}
```

### Endpoints

#### 1. Text Chat
**POST** `/api/ai-dermatology-expert/chat`

**Request Body:**
```json
{
  "message": "What's a good routine for oily skin?",
  "conversationHistory": [
    {
      "role": "user",
      "content": "Hello",
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**Response:**
```json
{
  "response": "For oily skin, I recommend...",
  "sources": [
    {
      "title": "Oily Skin Management",
      "content": "...",
      "score": 0.95,
      "source": "Cosmetic Dermatology Textbook"
    }
  ],
  "timestamp": "2024-01-01T00:00:00.000Z",
  "_performance": {
    "totalTime": 1250,
    "contextSize": 2048,
    "chunks": 3
  }
}
```

#### 2. Image Analysis
**POST** `/api/ai-dermatology-expert/analyze-skin`

**Request (multipart/form-data):**
```
image: <file>
message: "Please analyze this skin condition"
conversationHistory: "[...]"
```

**Response:**
```json
{
  "response": "Based on the image analysis...",
  "sources": [...],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### 3. Audio Transcription
**POST** `/api/ai-dermatology-expert/transcribe`

**Request (multipart/form-data):**
```
audio: <audio file>
```

**Response:**
```json
{
  "transcription": "What skincare routine do you recommend?",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "processingTime": 850
}
```

#### 4. Text-to-Speech
**POST** `/api/ai-dermatology-expert/text-to-speech`

**Request Body:**
```json
{
  "text": "For oily skin, use a gentle cleanser twice daily..."
}
```

**Response:**
```json
{
  "audio": "<base64-encoded-mp3>",
  "format": "mp3",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "processingTime": 650
}
```

### Error Handling

**Standard Error Response:**
```json
{
  "error": "User-friendly error message",
  "details": "Technical details (development only)"
}
```

**Common Status Codes:**
- `400`: Bad Request (missing parameters)
- `429`: Rate Limited
- `500`: Internal Server Error
- `503`: Service Unavailable (AI overloaded)

## Setup Guide

### Prerequisites
- Node.js 16+
- MongoDB
- Qdrant Vector Database
- Google Cloud Account (for AI services)
- Expo CLI (for mobile development)

### Environment Variables
Create `.env` file in backend directory:

```env
# AI Services
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_CLOUD_PROJECT_ID=your_project_id
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json

# Vector Database
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=your_qdrant_api_key

# Database
MONGODB_URI=mongodb://localhost:27017/wrencos

# Server
PORT=3000
NODE_ENV=development
```

### Installation Steps

#### 1. Backend Setup
```bash
cd wrencos/backend

# Install dependencies
npm install

# Setup vector database
node scripts/vectorDB/setupVectorDB.js

# Start server
npm run dev
```

#### 2. Frontend Setup (Web)
```bash
cd wrencos/frontend

# Install dependencies
npm install

# Start development server
npm run serve
```

#### 3. Mobile Setup
```bash
cd wrencos/mobile-app-customer

# Install dependencies
npm install

# Start Expo development server
npx expo start
```

### Vector Database Setup

The knowledge base is automatically indexed from curated dermatology sources:

**Available Scripts:**
```bash
# Initial setup (run once)
node scripts/vectorDB/setupVectorDB.js

# Reset database
node scripts/vectorDB/resetVectorDB.js

# Continue interrupted indexing
node scripts/vectorDB/continueVectorDB.js

# Retry failed batches
node scripts/vectorDB/retryFailedBatches.js
```

**Knowledge Sources Location:**
```
wrencos/backend/knowledge-sources/extracted-content/
├── Chemical Peels - Procedures in Cosmetic Dermatology Series.txt
├── Cosmeceuticals and Cosmetic Ingredients.txt
├── Cosmetic Dermatology - Principles and Practice.txt
├── Fitzpatrick's Dermatology in General Medicine.txt
├── Lasers in Dermatology and Medicine.txt
├── Skin Care - Beyond the Basics.txt
├── Textbook of Cosmetic Dermatology.txt
└── The Art of Skin Health Restoration and Rejuvenation.txt
```

## Usage Examples

### Web Integration
```vue
<template>
  <div class="skin-study-container">
    <AIDermatologyExpert />
  </div>
</template>

<script>
import AIDermatologyExpert from '@/pages/customer/skin-study/AIDermatologyExpert.vue'

export default {
  components: {
    AIDermatologyExpert
  }
}
</script>
```

### Mobile Integration
```javascript
// In your navigation stack
import AIDermatologyExpert from './src/components/skinStudy/AIDermatologyExpert';
import LiveChatAI from './src/components/skinStudy/LiveChatAI';

// Navigation setup
const SkinStudyStack = createStackNavigator();

function SkinStudyNavigator() {
  return (
    <SkinStudyStack.Navigator>
      <SkinStudyStack.Screen 
        name="AIDermatologyExpert" 
        component={AIDermatologyExpert} 
        options={{ title: 'AI Dermatology Expert' }}
      />
      <SkinStudyStack.Screen 
        name="LiveChatAI" 
        component={LiveChatAI} 
        options={{ title: 'Live Chat with AI' }}
      />
    </SkinStudyStack.Navigator>
  );
}
```

### API Usage Examples

#### JavaScript/Node.js
```javascript
const axios = require('axios');

// Text chat
async function chatWithAI(message, history = []) {
  try {
    const response = await axios.post('http://localhost:3000/api/ai-dermatology-expert/chat', {
      message,
      conversationHistory: history
    });
    return response.data;
  } catch (error) {
    console.error('Chat error:', error.response?.data || error.message);
  }
}

// Image analysis
async function analyzeImage(imageFile, message) {
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('message', message);
  
  try {
    const response = await axios.post(
      'http://localhost:3000/api/ai-dermatology-expert/analyze-skin',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  } catch (error) {
    console.error('Image analysis error:', error.response?.data || error.message);
  }
}
```

#### React Native
```javascript
// Text chat service
export const aiDermatologyExpertService = {
  async chat(message, conversationHistory = []) {
    const response = await fetch(`${API_BASE_URL}/api/ai-dermatology-expert/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, conversationHistory })
    });
    return response.json();
  },

  async analyzeImage(imageUri, message) {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'skin-image.jpg'
    });
    formData.append('message', message);
    
    const response = await fetch(`${API_BASE_URL}/api/ai-dermatology-expert/analyze-skin`, {
      method: 'POST',
      headers: { 'Content-Type': 'multipart/form-data' },
      body: formData
    });
    return response.json();
  }
};
```

## Knowledge Base

### Content Categories

1. **Fundamentals of Cosmetic Dermatology**
   - Skin structure and physiology
   - Aging mechanisms
   - Skin type classification (Fitzpatrick scale)

2. **Skincare Science & Active Ingredients**
   - Retinoids, vitamin C, niacinamide
   - Peptides, antioxidants, ceramides
   - Ingredient interactions and contraindications

3. **Chemical Peels & Exfoliative Procedures**
   - AHA, BHA, TCA peels
   - Preparation and aftercare
   - Complications management

4. **Energy-Based and Aesthetic Procedures**
   - Laser treatments (CO₂, IPL, etc.)
   - Microneedling, radiofrequency
   - Dermal fillers, neurotoxins

5. **Cosmetics, Cosmeceuticals, and Skin Reactions**
   - Product classification
   - Contact dermatitis, sensitization
   - Acne cosmetica

6. **Pathophysiology & Treatment of Skin Conditions**
   - Acne, rosacea, melasma
   - Hyperpigmentation disorders
   - Inflammatory conditions

7. **Holistic & Preventive Dermatology**
   - Lifestyle factors
   - Nutrition and skin health
   - Environmental protection

8. **Advanced Science & Mechanisms of Aging**
   - Molecular mechanisms
   - Collagen degradation, MMPs
   - Photoaging vs chronological aging

9. **Clinical Scenarios & Integrated Care**
   - Multi-modal treatment approaches
   - Case-based recommendations
   - Treatment sequencing

### Source Materials
- **Fitzpatrick's Dermatology in General Medicine** (8th Edition)
- **Chemical Peels - Procedures in Cosmetic Dermatology Series** (3rd Edition)
- **Cosmetic Dermatology - Products and Procedures** (2nd Edition)
- **Textbook of Cosmetic Dermatology**
- **The Art of Skin Health Restoration and Rejuvenation**
- **Cosmeceuticals and Cosmetic Ingredients**
- **Lasers in Dermatology and Medicine**
- **Skin Care - Beyond the Basics** (4th Edition)

## Performance & Monitoring

### Performance Metrics
- **Response Time**: Average 1-3 seconds for text queries
- **Image Analysis**: 2-5 seconds depending on image size
- **Voice Processing**: Real-time transcription and TTS
- **Vector Search**: Sub-second similarity search
- **Concurrent Users**: Supports 100+ simultaneous users

### Monitoring Features
- Request timing and performance logging
- Error rate tracking
- AI service usage monitoring
- Vector database performance metrics

### Optimization Strategies
1. **Caching**: Frequent queries cached for faster responses
2. **Batch Processing**: Multiple embeddings processed together
3. **Streaming**: Real-time audio streaming for better UX
4. **Fallback Responses**: Offline knowledge base for service failures
5. **Memory Management**: Efficient cleanup of temporary files and audio

### Troubleshooting

**Common Issues:**

1. **Vector Database Connection**
   ```bash
   # Check Qdrant status
   curl http://localhost:6333/collections
   
   # Restart Qdrant
   docker restart qdrant
   ```

2. **AI Service Rate Limits**
   - Implement exponential backoff
   - Use fallback responses
   - Monitor API quotas

3. **Audio Processing Issues**
   - Check file format compatibility
   - Verify Google Cloud credentials
   - Monitor temporary file cleanup

4. **Mobile Performance**
   - Use memoization for expensive operations
   - Implement proper cleanup for audio resources
   - Optimize image compression before upload

---

## Contributing

### Adding New Knowledge Sources
1. Place text files in `backend/knowledge-sources/extracted-content/`
2. Run vector database setup: `node scripts/vectorDB/setupVectorDB.js`
3. Test with sample queries

### Extending Functionality
1. **New AI Capabilities**: Extend `geminiService.js`
2. **Additional Endpoints**: Add to `aiDermatologyExpertController.js`
3. **UI Enhancements**: Modify Vue/React Native components
4. **Performance Improvements**: Update caching and optimization strategies

### Testing
```bash
# Backend tests
npm run test

# Vector database tests
node scripts/testRAG.js

# Performance benchmarks
node scripts/testScoreCalculation.js
```

This comprehensive documentation covers all aspects of the Skin Study feature implementation. The system provides a robust, scalable AI-powered dermatology consultation platform with multi-modal interaction capabilities and extensive knowledge base integration.
