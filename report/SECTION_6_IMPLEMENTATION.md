# 6. Implementation

## 6.1 Development Environment

| Aspect | Details |
|---|---|
| IDE | Visual Studio Code with extensions for debugging and linting, supporting JavaScript, Vue.js, and Python |
| Version Control | Git and GitHub with Issues and Projects for collaborative development tracking |
| Project Management | Trello and GitHub Projects for organizing tasks across multiple modules |
| Runtime | Node.js 16.20.1 with npm for package management |
| Containerization | Docker for consistent development, testing, and production deployments |
| API Documentation and Testing | Swagger UI integrated at /api-docs; Postman for comprehensive endpoint validation and integration testing |
| Logging and Monitoring | Morgan (optional) for HTTP request logging; express-rate-limit for DDoS protection |
| Backend Technology Stack | Express.js, Mongoose, JSON Web Tokens (JWT), Multer, WebSocket (ws), Swagger JSDoc, Swagger UI Express, express-rate-limit, Nodemailer, @google/generative-ai, LangChain, @qdrant/js-client-rest |
| Frontend Technology Stack | Vue 3, Vue Router, Vue i18n, Tailwind CSS, Axios, Chart.js, Vue Chart.js |
| Mobile Applications | React Native with Expo for admin and customer platforms targeting iOS and Android |

## 6.2 Backend & Frontend Implementation

### Folder Structure
#### Backend
This is a classic MVC-inspired Node.js backend with clear separation between request handling (controllers/routes), business logic (services), and data management (models), plus specialized modules for domain-specific features and infrastructure concerns.

| Layer | Folder/File | Purpose | Key Responsibilities |
|-------|-------------|---------|----------------------|
| **Core Layers** | | | |
| | `controllers/` | Entry point for HTTP requests | Handles routing logic, request validation, and response formatting |
| | `routes/` | API endpoint definitions | Maps HTTP routes to controller methods and applies middleware |
| | `services/` | Business logic layer | Core application functionality, data processing, and business rules |
| | `models/` | Data models/schemas | Defines database structure, validation rules, and data relationships |
| | `middleware/` | Cross-cutting concerns | Authentication, logging, error handling, and request preprocessing |
| **Supporting Modules** | | | |
| | `knowledge-sources/, tools/, utils/, seed-data/, scripts/, uploads/` | Domain utilities & initialization | AI knowledge sources, common helpers, DB seeding, batch scripts, media storage |
| **Infrastructure** | | | |
| | `app.js`, `server.js`, `db.js`, `swagger.js`, `websocket.js`, `Dockerfile`, `docker-compose.qdrant.yml`, `.env` | Configuration & Setup Files | Server initialization, database connection, API docs, WebSocket, containerization |

##### Meaningful Code Sample: Livestream (Backend)

1) Model — chat, views, and retrieval helpers

```javascript
// backend/models/livestream/liveStream.js
// Methods and statics used throughout the livestream workflow

// Method to increment view count
liveStreamSchema.methods.incrementViewCount = function() {
  this.viewCount += 1;
  return this.save();
};

// Method to add chat message
liveStreamSchema.methods.addChatMessage = function(username, message, isAdmin = false) {
  this.chatMessages.push({
    username,
    message,
    timestamp: new Date(),
    isAdmin
  });
  return this.save();
};

// Static method to get active stream
liveStreamSchema.statics.getActiveStream = function() {
  return this.findOne({ isActive: true });
};

// Static method to get past streams (excludes chat for performance)
liveStreamSchema.statics.getPastStreams = function(limit = 10, skip = 0) {
  return this.find({ 
    isActive: false,
    endTime: { $exists: true }
  })
  .sort({ endTime: -1 })
  .limit(limit)
  .skip(skip)
  .select('-chatMessages');
};
```

2) Controller — safe start/stop with final stats

```javascript
// backend/controllers/livestream/liveStreamController.js
// Create a new livestream. Prevent duplicate active streams; auto-clean if a stream is stuck > 24h
exports.createLiveStream = async (req, res) => {
  try {
    const { title, description, quality, categories, tags, streamUrl } = req.body;

    // Ensure only one active stream at a time; auto-clean if stuck > 24h
    let activeStream = await LiveStream.getActiveStream();
    if (activeStream) {
      const hoursSinceStart = (Date.now() - activeStream.startTime.getTime()) / (1000 * 60 * 60);
      if (hoursSinceStart > 24) {
        activeStream.isActive = false;
        activeStream.endTime = new Date();
        activeStream.duration = Math.floor((Date.now() - activeStream.startTime.getTime()) / 1000);
        await activeStream.save();
      } else {
        return res.status(400).json({ 
          message: 'Another livestream is currently active. Please stop it before starting a new one.' 
        });
      }
    }

    const liveStream = new LiveStream({
      title,
      description,
      quality,
      streamUrl: streamUrl || '',
      categories: categories ? categories.split(',').map(c => c.trim()) : [],
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      isActive: true,
      startTime: new Date(),
      createdBy: req.user ? req.user.id : null
    });

    await liveStream.save();
    res.status(201).json({ message: 'Livestream created successfully', livestream: liveStream });
  } catch (error) {
    console.error('Error creating livestream:', error);
    res.status(500).json({ message: 'Failed to create livestream', error: error.message });
  }
};

// Stop livestream. Computes duration and persists final metrics and media references.
exports.stopLiveStream = async (req, res) => {
  try {
    const { id } = req.params;
    const { videoUrl, thumbnailUrl, maxViewers, viewCount, likes } = req.body;

    const livestream = await LiveStream.findById(id);
    if (!livestream) return res.status(404).json({ message: 'Livestream not found' });
    if (!livestream.isActive) return res.status(400).json({ message: 'Livestream is not active' });

    // Finalize stream
    const endTime = new Date();
    const duration = Math.floor((endTime - livestream.startTime) / 1000);

    livestream.isActive = false;
    livestream.endTime = endTime;
    livestream.duration = duration;
    livestream.isRecorded = !!videoUrl;
    livestream.videoUrl = videoUrl || '';
    livestream.thumbnailUrl = thumbnailUrl || '';
    livestream.maxViewers = maxViewers || livestream.maxViewers;
    livestream.viewCount = viewCount || livestream.viewCount;
    livestream.likes = likes || livestream.likes;

    await livestream.save();
    res.json({ message: 'Livestream stopped successfully', livestream });
  } catch (error) {
    console.error('Error stopping livestream:', error);
    res.status(500).json({ message: 'Failed to stop livestream', error: error.message });
  }
};
```

3) WebSocket — reactions and viewer count with single-like enforcement

```javascript
// backend/websocket.js
// Each user (auth userId) or guest (sessionId) can only like once; state is broadcast to all clients.
async handleToggleLike(ws, data) {
  const { userId, sessionId } = data;
  const identifier = userId || sessionId; // prefer userId
  if (!identifier) return;
  if (!this.currentStreamState.isActive) {
    return ws.send(JSON.stringify({ type: 'error', message: 'No active stream' }));
  }

  // Toggle like in memory and persist to DB
  const hasLiked = this.currentStreamState.likedBy.has(identifier);
  if (hasLiked) {
    this.currentStreamState.likedBy.delete(identifier);
    this.currentStreamState.likes = Math.max(0, this.currentStreamState.likes - 1);
  } else {
    this.currentStreamState.likedBy.add(identifier);
    this.currentStreamState.likes++;
  }

  // Persist aggregate like count and who liked
  if (this.currentStreamState.streamId) {
    const LiveStream = require('./models/livestream/liveStream');
    await LiveStream.findByIdAndUpdate(this.currentStreamState.streamId, {
      likes: this.currentStreamState.likes,
      likedBy: Array.from(this.currentStreamState.likedBy)
    });
  }

  // Broadcast to all viewers/admins
  const updateData = {
    type: 'stream_update',
    likes: this.currentStreamState.likes,
    likedBy: Array.from(this.currentStreamState.likedBy)
  };
  for (const c of this.customerConnections.values()) if (c.ws.readyState === WebSocket.OPEN) c.ws.send(JSON.stringify(updateData));
  for (const a of this.adminConnections.values()) if (a.ws.readyState === WebSocket.OPEN) a.ws.send(JSON.stringify(updateData));
}

// Viewer count is derived from active WebSocket sessions and broadcast to all clients.
async updateViewerCount() {
  const viewerCount = this.customerConnections.size;
  this.currentStreamState.viewerCount = viewerCount;

  const updateData = { type: 'stream_update', viewerCount };
  for (const c of this.customerConnections.values()) if (c.ws.readyState === WebSocket.OPEN) c.ws.send(JSON.stringify(updateData));
  for (const a of this.adminConnections.values()) if (a.ws.readyState === WebSocket.OPEN) a.ws.send(JSON.stringify(updateData));
}
```

4) Mobile (React Native) — Admin broadcaster using react-native-agora

```javascript
// mobile-app-admin/src/components/AgoraBroadcaster.js
// Initializes Agora, starts camera preview, fetches a publisher token, and joins the channel
useEffect(() => { initializeAgora(); return () => cleanup(); }, []);

async function initializeAgora() {
  agoraEngine.current = createAgoraRtcEngine();
  agoraEngine.current.initialize({ appId: AGORA_APP_ID });
  agoraEngine.current.enableVideo();
  // Event handlers omitted for brevity (join success, errors, etc.)
}

async function startBroadcasting() {
  const channelName = getChannelName(streamId);
  // Live broadcast profile + broadcaster role
  agoraEngine.current.setChannelProfile(ChannelProfileType.ChannelProfileLiveBroadcasting);
  agoraEngine.current.setClientRole(ClientRoleType.ClientRoleBroadcaster);
  // Local camera preview
  agoraEngine.current.startPreview();
  // Get SUBSCRIBER/PUBLISHER token from backend for this channel
  const { token } = await livestreamService.getAgoraToken(channelName, 0);
  // Join channel as broadcaster (uid 0)
  await agoraEngine.current.joinChannel(token, channelName, 0, {
    clientRoleType: ClientRoleType.ClientRoleBroadcaster,
  });
}

// JSX: renders the local camera view while broadcasting
<RtcSurfaceView style={styles.videoView} canvas={{ sourceType: VideoSourceType.VideoSourceCamera, uid: 0 }} />
```

5) Mobile (React Native) — Customer viewer (audience)

```javascript
// mobile-app-customer/src/components/AgoraViewer.js
// Initializes Agora as audience, fetches an audience token, joins, and renders the remote stream
useEffect(() => { initializeAgora(); return () => cleanup(); }, []);

async function initializeAgora() {
  agoraEngine.current = createAgoraRtcEngine();
  agoraEngine.current.initialize({ appId: AGORA_APP_ID });
  agoraEngine.current.enableVideo();
  // Track the broadcaster uid when it joins
  agoraEngine.current.registerEventHandler({
    onUserJoined: (_, uid) => setRemoteUid(uid),
    onUserOffline: () => setRemoteUid(null),
  });
}

async function joinChannel() {
  const channelName = getChannelName(streamId);
  // Request audience token from backend
  const { data } = await api.post('/livestreams/agora/token', {
    channelName,
    uid: 0,
    role: 'audience', // server maps to RtcRole.SUBSCRIBER
  });
  const token = data.token;
  // Live broadcast profile + audience role
  agoraEngine.current.setChannelProfile(ChannelProfileType.ChannelProfileLiveBroadcasting);
  agoraEngine.current.setClientRole(ClientRoleType.ClientRoleAudience);
  await agoraEngine.current.joinChannel(token, channelName, 0, {
    clientRoleType: ClientRoleType.ClientRoleAudience,
  });
}

// JSX: renders the broadcaster's remote video when available
{remoteUid && (
  <RtcSurfaceView
    canvas={{ uid: remoteUid, sourceType: VideoSourceType.VideoSourceRemote }}
    style={styles.videoView}
  />
)}
```

#### Frontend 
The frontend follows a modular, page-driven architecture with clear separation between view composition (pages/components), navigation (router), data access (services), and state (stores), supported by utilities and internationalization.

| Layer | Folder/File | Purpose | Key Responsibilities |
|---|---|---|---|
| Core UI | `pages/` | Route-level views | Compose page logic with Composition API, call services, render components |
| Core UI | `components/` | Reusable UI components | Presentational widgets, forms, charts, inputs |
| Core UI | `layout/` | Shared layouts | Navigation bars, shells, headers/footers |
| Navigation | `router/` | Client-side routing | Route definitions, lazy-loading, guards |
| State | `stores/` | Global state (Pinia) | Cross-page state, session/user, caching |
| Data | `services/` | API clients (Axios) | REST calls, error handling, auth headers/interceptors |
| Utilities | `utils/` | Helper functions | Formatting, validators, common helpers |
| Assets | `assets/` | Static assets | Images, icons, global styles |
| i18n | `i18n.js` | Internationalization setup | Locale config and message loading |
| App bootstrap | `main.js`, `App.vue` | App entry and root component | Mount Vue app, register plugins, provide layouts |
| Build/Config | `index.html`, `tailwind.config.js`, `postcss.config.js`, `vite.config.js`, `Dockerfile` | Tooling & build | HTML template, CSS pipeline, dev/build config, containerization |

##### Meaningful Code Sample: Livestream (Frontend)

1) Customer Watch Page — load recording, play video, and count views

```vue
<!-- frontend/src/pages/customer/live-stream/LiveStreamWatch.vue -->
<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const apiUrl = 'http://localhost:3000';
const stream = ref(null);
const loading = ref(true);

// Fetch the livestream document and related items from the backend
const fetchStream = async () => {
  loading.value = true;
  const streamId = route.params.id;
  const res = await fetch(`${apiUrl}/livestreams/${streamId}`);
  if (!res.ok) throw new Error('Stream not found');
  const data = await res.json();
  stream.value = data.livestream;
  loading.value = false;
};

// Called when the <video> actually starts playing
const incrementViewCount = async () => {
  if (!stream.value) return;
  await fetch(`${apiUrl}/livestreams/${stream.value._id}/view`, { method: 'POST' });
  // Update UI optimistically
  stream.value.viewCount = (stream.value.viewCount || 0) + 1;
};

// Like button (simplified UI update; production uses WebSocket server enforcement)
const isLiked = ref(false);
const toggleLike = () => {
  if (!stream.value) return;
  isLiked.value = !isLiked.value;
  stream.value.likes = (stream.value.likes || 0) + (isLiked.value ? 1 : -1);
};

onMounted(fetchStream);
</script>

<template>
  <div v-if="!loading && stream">
    <video
      v-if="stream.videoUrl"
      :src="stream.videoUrl.startsWith('http') ? stream.videoUrl : `${apiUrl}/${stream.videoUrl.replace(/^\/+/, '')}`"
      controls
      class="w-full h-auto"
      @play="incrementViewCount"
    />
    <button @click="toggleLike">❤️ {{ stream.likes || 0 }}</button>
  </div>
</template>
```

2) Shared Livestream Store — real-time updates and WebRTC signaling

```javascript
// frontend/src/stores/livestreamStore.js
export const livestreamStore = reactive({
  ws: null,
  isConnected: false,
  connectionType: null, // 'admin' | 'customer'
  adminStreamData: { viewerCount: 0, likes: 0, likedBy: [] },

  // Establish WebSocket and register as admin or customer
  connectWebSocket(type = 'customer', token = null) {
    this.ws = new WebSocket('ws://localhost:3000');
    this.connectionType = type;
    this.ws.onopen = () => {
      this.isConnected = true;
      this.ws.send(JSON.stringify(type === 'admin'
        ? { type: 'register_admin', token }
        : { type: 'register', sessionId: `customer-${Date.now()}`, token }
      ));
    };
    this.ws.onmessage = (e) => this.handleWebSocketMessage(JSON.parse(e.data));
  },

  // React to server broadcasts (started/stopped/updates/chat)
  handleWebSocketMessage(data) {
    switch (data.type) {
      case 'stream_started':
        Object.assign(this.adminStreamData, data.streamData);
        break;
      case 'stream_update':
        if (data.viewerCount !== undefined) this.adminStreamData.viewerCount = data.viewerCount;
        if (data.likes !== undefined) this.adminStreamData.likes = data.likes;
        if (data.likedBy !== undefined) this.adminStreamData.likedBy = data.likedBy;
        break;
      // ...other handlers (chat history, pinned products, WebRTC)
    }
  },

  // Ask server to toggle like for current user or session
  toggleLike(userId, sessionId) {
    this.ws?.send(JSON.stringify({ type: 'toggle_like', userId, sessionId }));
  },

  // WebRTC entry points (admin broadcast start/stop)
  async startWebRTCBroadcast(mediaStream) {
    // setLocalMediaStream, create offers for customers, and notify server
    // this.ws.send({ type: 'webrtc_broadcast_start', peerId })
  },
  stopWebRTCBroadcast() {
    // close peer connections and notify server
    // this.ws.send({ type: 'webrtc_broadcast_stop', peerId })
  }
});
```

3) Admin Live Stream — start/stop broadcasting and persist final stats

```vue
<!-- frontend/src/pages/admin/live-stream/AdminLiveStream.vue -->
<script setup>
import { ref } from 'vue';
import { livestreamStore } from '@/stores/livestreamStore';

const isStreaming = ref(false);
const streamTitle = ref('WrenCos Beauty Live Session');
const streamDescription = ref('Tips, tricks, and product demos');
const streamQuality = ref('720p');
const apiUrl = 'http://localhost:3000';
const currentStreamId = ref(null);

// Create livestream record in DB, then broadcast via WebRTC
async function startStream() {
  const media = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  await livestreamStore.startWebRTCBroadcast(media); // WebRTC to customers
  const res = await fetch(`${apiUrl}/livestreams`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: streamTitle.value, description: streamDescription.value, quality: streamQuality.value })
  });
  const { livestream } = await res.json();
  currentStreamId.value = livestream._id;
  isStreaming.value = true;
}

// Stop WebRTC, save final metrics (viewers/likes), and mark stream inactive
async function stopStream(viewerCount, likes) {
  await livestreamStore.stopWebRTCBroadcast();
  await fetch(`${apiUrl}/livestreams/${currentStreamId.value}/stop`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ maxViewers: viewerCount, viewCount: viewerCount, likes })
  });
  isStreaming.value = false; currentStreamId.value = null;
}
</script>
```

#### Mobile Apps

The mobile apps (Admin and Customer) follow a screen-driven, modular architecture: presentation (screens/components), shared state (contexts), data access (services), and configuration (constants), supported by platform assets, scripts, and Expo tooling.

| Layer | Folder/File | Purpose | Key Responsibilities |
|---|---|---|---|
| Core UI | `src/screens/` | Screen-level views | Orchestrate UI/logic per feature, call services, manage local state |
| Core UI | `src/components/` | Reusable components | Video players (AgoraViewer/Broadcaster), form inputs, widgets |
| State | `src/contexts/` | React Context providers | Session/auth context, livestream state/sharing across screens |
| Data | `src/services/` | API clients | REST calls, token fetch, error handling |
| Config | `src/constants/` | App constants | AGORA_APP_ID, channel/name helpers, API endpoints |
| Utilities | `src/utils/` | Helper functions | Formatters, validators, generic helpers |
| Assets | `assets/` | Static assets | Images, fonts, icons, splash/screens |
| App bootstrap | `App.js`, `app.json` | Entry/config | Root component, Expo app configuration |
| Platform | `android/`, `ios/` | Native projects | Platform-specific settings, builds, signing |
| Plugins | `plugins/` | Expo config plugins | Native capability hooks |
| Scripts | `scripts/`, `setup.sh` | Dev automation | Local setup, CI/CD scripts |
| Environment | `.env.example` | Env template | Document required variables |
| Build/CI | `eas.json` | EAS build config | Build profiles for development/production |
| Tooling | `babel.config.js`, `package.json` | Tooling & deps | Metro/Babel config, dependencies and scripts |

##### Meaningful Code Sample: Live chat with AI dermatology expert (Mobile)

1) Text chat component — send message, call backend (RAG), render response, and optional TTS per message

```javascript
// mobile-app-customer/src/components/skinStudy/AIDermatologyExpert.js
// Key parts: sendMessage(), getAIResponse(), handleSpeak()

// Send user message and request AI response
const sendMessage = useCallback(async () => {
  if (!userInput.trim() || isLoading) return;
  const userMessage = { role: 'user', content: userInput.trim(), timestamp: new Date().toISOString() };
  setMessages(prev => [...prev, userMessage]);
  setUserInput('');
  setIsLoading(true);
  try {
    await getAIResponse(userMessage.content);
  } finally {
    setIsLoading(false);
  }
}, [userInput, isLoading, messages]);

// Call backend AI endpoint with last 10 messages as conversation history
const getAIResponse = useCallback(async (userMessage) => {
  const response = await aiDermatologyExpertService.chat(userMessage, messages.slice(-10));
  setMessages(prev => [...prev, {
    role: 'assistant',
    content: response.response,
    sources: response.sources,
    timestamp: new Date().toISOString()
  }]);
}, [messages]);

// Toggle text‑to‑speech for an assistant message (Expo AV + backend TTS)
const handleSpeak = useCallback(async (messageIndex) => {
  const message = messages[messageIndex];
  if (!message || message.role !== 'assistant') return;
  // Sentence-by-sentence playback using backend TTS
  const sentences = splitIntoSentences(stripFormattingForSpeech(message.content));
  for (const s of sentences) {
    const { audio } = await liveChatService.textToSpeech(s);
    const { sound } = await Audio.Sound.createAsync({ uri: `data:audio/mp3;base64,${audio}` }, { shouldPlay: true });
    await new Promise(resolve => sound.setOnPlaybackStatusUpdate(st => st.didJustFinish && resolve()));
    await sound.unloadAsync();
  }
}, [messages]);
```

2) Live voice chat screen — record voice, transcribe, get AI reply, stream TTS back to user

```javascript
// mobile-app-customer/src/components/skinStudy/LiveChatAI.js
// Key parts: startRecording(), stopRecording(), processAudioWithAI(), speakAIResponse()

// Start microphone capture with Expo AV
const startRecording = async () => {
  const { status } = await Audio.requestPermissionsAsync();
  if (status !== 'granted') return;
  setIsRecording(true);
  await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
  const { recording: rec } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
  setRecording(rec);
};

// Stop recording and send audio to backend ASR
const stopRecording = async () => {
  if (!recording) return;
  setIsRecording(false);
  setIsProcessing(true);
  const st = await recording.getStatusAsync();
  if (st.isRecording) await recording.stopAndUnloadAsync();
  const uri = recording.getURI();
  setRecording(null);
  await processAudioWithAI(uri);
};

// ASR -> AI answer
const processAudioWithAI = async (audioUri) => {
  const { transcription } = await liveChatService.transcribeAudio(audioUri);
  const userMessage = transcription.trim();
  const newHistory = [...conversationHistory, { role: 'user', content: userMessage }];
  setConversationHistory(newHistory);
  const response = await liveChatService.chat(userMessage, newHistory);
  const fullHistory = [...newHistory, { role: 'assistant', content: response.response }];
  setConversationHistory(fullHistory);
  setIsProcessing(false);
  await speakAIResponse(response.response);
};

// Stream TTS sentence by sentence to reduce latency
const speakAIResponse = async (text) => {
  const sentences = splitIntoSentences(text);
  await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });
  for (const s of sentences) {
    const tts = await liveChatService.textToSpeech(s);
    const { sound } = await Audio.Sound.createAsync({ uri: `data:audio/mp3;base64,${tts.audio}` }, { shouldPlay: true });
    await new Promise(resolve => sound.setOnPlaybackStatusUpdate(st => st.didJustFinish && resolve()));
    await sound.unloadAsync();
  }
};
```

3) Mobile API service — platform‑aware base URL, auth, and endpoints

```javascript
// mobile-app-customer/src/services/skinStudy/api.js
// Axios instance with AsyncStorage token, and AI endpoints used above

const api = axios.create({ baseURL: getApiBaseUrl(), timeout: 60000, headers: { 'Content-Type': 'application/json' } });
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('authToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const aiDermatologyExpertService = {
  chat(message, conversationHistory = []) {
    return api.post('/ai-dermatology-expert/chat', { message, conversationHistory }).then(r => r.data);
  }
};

export const liveChatService = {
  chat(message, conversationHistory = []) {
    return api.post('/ai-dermatology-expert/chat', { message, conversationHistory }).then(r => r.data);
  },
  transcribeAudio(audioUri) {
    const formData = new FormData();
    formData.append('audio', { uri: audioUri, type: 'audio/m4a', name: 'recording.m4a' });
    return api.post('/ai-dermatology-expert/transcribe', formData, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 90000 }).then(r => r.data);
  },
  textToSpeech(text) {
    return api.post('/ai-dermatology-expert/text-to-speech', { text }, { timeout: 60000 }).then(r => r.data);
  }
};
```

## 6.3 Database Implementation

### MongoDB Atlas and Mongoose Integration

The physical database was implemented using MongoDB Atlas, a fully managed cloud database service providing high availability, automated backups, and global distribution capabilities. The connection is established through Mongoose, an Object Data Modeling (ODM) library that provides schema validation, middleware hooks, and query building utilities. The db.js file contains the connection logic, establishing a secure connection to the MongoDB cluster using connection strings with authentication credentials.

### Schema Design and Collection Structure

The database schema reflects the modular architecture of the application, with collections organized by functional domain. The ecommerce module includes Product, Category, Order, and Payment collections. The auth module contains User and Session collections with password hashing and token management. The livestream module includes LiveStream, StreamComment, and StreamLike collections for real-time interaction tracking. The communication module contains Chat and Message collections for user messaging. The marketing module includes Newsletter, EmailCampaign, EmailTemplate, and EmailSegment collections for campaign management. The finance module contains CashFlow records for financial tracking. The hr module includes Employee, Department, and Leave records. The skin-study module contains DermatologyRecord and SkinAnalysis collections for specialized analysis features.

### Vector Database Integration

Qdrant, a vector database optimized for similarity search and retrieval-augmented generation (RAG), was deployed using Docker Compose as defined in docker-compose.qdrant.yml. The vectorService.js module provides an abstraction layer for vector operations, enabling semantic search capabilities across product descriptions, customer reviews, and knowledge base content. This integration supports advanced features such as AI-powered product recommendations and intelligent customer support through RAG-enhanced chatbots.

### Data Initialization and Seeding

The backend includes seed scripts under the seed-data directory that populate the database with initial content. The seedChatData.js script initializes chat templates and conversation starters, while seedEmailTemplates.js populates email campaign templates. These scripts ensure that the application has essential data available immediately after deployment, reducing setup time and providing a consistent baseline for testing and demonstration.

## 6.4 Deployment

### Containerization Strategy

The application was containerized using Docker to ensure consistency across development, staging, and production environments. The backend Dockerfile specifies Node.js 16.20.1 as the base image, installs dependencies from package.json, copies application code, exposes port 3000, and executes npm start as the entry point. The frontend includes a separate Dockerfile that builds the Vue application using npm run build and serves the static dist directory through a lightweight HTTP server. The Qdrant vector database is orchestrated through docker-compose.qdrant.yml, defining the service configuration, port mappings, and persistent volume mounts.

### Local Development Deployment

For local development, the backend is deployed by building the Docker image with docker build -t wrencos-backend ./backend and running it with docker run -p 3000:3000 --env-file .env wrencos-backend, exposing the API on localhost:3000. The Qdrant service is started with docker compose -f backend/docker-compose.qdrant.yml up -d, making the vector database available on localhost:6333. The frontend development server is launched with npm run dev in the frontend directory, providing hot module reloading for rapid iteration during development.

### Production Deployment

For production deployment, the application can be deployed to cloud platforms such as Render, Railway, AWS EC2, or Heroku. The deployment process involves pushing the Docker images to a container registry, configuring environment variables including PORT, GEMINI_API_KEY, JWT_SECRET, SMTP credentials, and MongoDB connection strings, and deploying the containers through the platform's orchestration system. HTTPS is enforced through a reverse proxy such as Nginx or the platform's built-in SSL termination. Database backups are configured through MongoDB Atlas's automated backup feature with point-in-time recovery capabilities. The WebSocket connection is maintained through the reverse proxy's WebSocket upgrade support, enabling real-time features in production.

### Environment Configuration

The application uses environment variables defined in .env files for configuration management. Critical variables include GEMINI_API_KEY for AI features, JWT_SECRET for token signing, MONGODB_URI for database connection, SMTP credentials for email services, and QDRANT_URL for vector database access. The server.js file includes startup checks that warn if critical variables such as GEMINI_API_KEY are not configured, allowing graceful degradation of optional features while maintaining core functionality.

## 6.5 Project Management

### Task Tracking and Collaboration

Project management was conducted through GitHub Projects and Trello boards, providing visibility into task status, priority, and assignment. The task tracking system organized work into columns representing workflow stages: Backlog for future work, In Progress for active development, Review for code review and testing, and Done for completed features. Each task card included acceptance criteria, estimated effort, assigned team members, and linked pull requests or commits. This structured approach ensured that all team members understood priorities and dependencies, reducing context-switching overhead and improving delivery predictability.

### Version Control and Commit History

The project maintained a comprehensive commit history on GitHub demonstrating consistent, incremental development. Feature branches were created for each major feature (e.g., feature/ecommerce, feature/livestream, feature/ai-dermatology) and merged into the main branch through pull requests after code review. Commit messages followed a consistent format describing the changes made, enabling easy navigation of project history and identification of when specific features were introduced. The commit graph shows regular activity across multiple team members, indicating active collaboration and distributed development effort. Hotfix branches were created for production issues, ensuring rapid resolution without disrupting ongoing feature development.

### Documentation and Knowledge Management

Technical documentation was maintained in Markdown files within the report directory, including requirements analysis, system design, and implementation details. API documentation was automatically generated through Swagger JSDoc and served through the Swagger UI, ensuring that API specifications remained synchronized with implementation. Database schema documentation was maintained through Mongoose schema definitions with inline comments explaining field purposes and constraints. This multi-layered documentation approach ensured that knowledge was captured at the appropriate level of abstraction, from high-level architecture decisions to low-level implementation details.
