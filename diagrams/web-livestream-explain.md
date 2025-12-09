RTCPeerConnection and Direct P2P are located in the BROWSERS (Frontend), NOT in the backend.

Let me show you the exact locations in the code:

1. Admin Web Browser (Frontend)
Located in: livestreamStore.js

2. Customer Web Browser (Frontend)
Same file: livestreamStore.js

3. Backend Role (WebSocket Server ONLY)
Located in: websocket.js

Architecture Diagram:

Admin Web Browser
     │
     ├──► REST API ──► Create Livestream Record ──► Backend Database
     │                  (title, description, metadata)
     │
     ├──► navigator.mediaDevices.getUserMedia() ──► Camera/Mic Access
     │                                               (Local Browser API)
     │
     ├──► MediaRecorder API ──► Local Recording ──► Recorded Chunks
     │    (Records to browser memory)                (Saved in browser)
     │
     ├──► WebSocket ──► Backend WebSocket Server ◄──── WebSocket ◄──── Customer Web Browser
     │    (WebRTC Signaling: offers, answers, ICE candidates)
     │    (Chat, Likes, Viewer Count, Stream Events)
     │
     └──► RTCPeerConnection ──► DIRECT P2P ◄──── RTCPeerConnection ◄──── Customer Web Browser
          (Video/Audio Stream)    (No Backend)         (Receives Stream)
                 │                                              │
                 └──────────────── Peer-to-Peer ───────────────┘
                        (Video data NEVER touches backend)


When Stream Ends:
     Admin Browser
          │
          └──► REST API ──► Upload Recorded Video File ──► Backend Storage
               (POST /livestreams/:id/upload-video)        (saves as .webm file)


Admin → getUserMedia() → Local camera/mic stream
Admin → POST /livestreams → Backend creates DB record
Admin → WebSocket 'stream_started' → Notifies all customers

Admin establishes RTCPeerConnection with each customer:
  
  Admin → WebSocket 'webrtc_offer' → Backend → Customer
  Customer → WebSocket 'webrtc_answer' → Backend → Admin
  Admin ↔ WebSocket 'webrtc_ice_candidate' ↔ Customer
  
  Once connected:
  Admin RTCPeerConnection ═══► DIRECT P2P ═══► Customer RTCPeerConnection
       (video/audio packets flow directly, bypassing backend)

MediaRecorder (Admin only):
  Records stream locally → Stores chunks in memory
  
WebSocket (Both Admin & Customers):
  Chat messages, likes, viewer counts, stream events
  
RTCPeerConnection (Direct P2P):
  Live video/audio streaming between browsers

Admin stops stream:
  1. MediaRecorder.stop() → Creates Blob from chunks
  2. Upload Blob to backend via FormData
  3. Backend saves as /uploads/livestreams/video-xxx.webm
  4. POST /livestreams/:id/stop → Updates DB record
  5. WebSocket 'stream_stopped' → Notifies customers

┌─────────────────────────────────────────────────────────────┐
│                    Admin Browser (Frontend)                  │
│  ┌────────────────────────────────────────────────────┐    │
│  │ RTCPeerConnection (WebRTC API)                     │    │
│  │ - Creates peer connection                          │    │
│  │ - Sends video/audio packets directly to customer   │    │
│  └────────────────────────────────────────────────────┘    │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               │ Signaling only              │ DIRECT P2P Video
               │ (via WebSocket)             │ (bypasses backend)
               │                              │
               ↓                              ↓
    ┌──────────────────┐           ┌──────────────────┐
    │  Your Backend    │           │  STUN Server     │
    │  WebSocket       │           │ (Google/Public)  │
    │  (Port 3000)     │           │ - NAT traversal  │
    │                  │           │ - Find public IP │
    │ - Relays offers  │           └──────────────────┘
    │ - Relays answers │                    │
    │ - Relays ICE     │                    │ Help establish
    └──────────────────┘                    │ P2P connection
               │                              │
               │ Signaling only              │
               ↓                              ↓
┌─────────────────────────────────────────────────────────────┐
│                 Customer Browser (Frontend)                  │
│  ┌────────────────────────────────────────────────────┐    │
│  │ RTCPeerConnection (WebRTC API)                     │    │
│  │ - Receives peer connection                         │    │
│  │ - Receives video/audio packets directly from admin │    │
│  │ - Displays in <video> element                      │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘

Key Points:
✅ RTCPeerConnection = Browser API (JavaScript), runs in frontend only
✅ Direct P2P = Connection between browsers, completely bypasses your backend
✅ Your Backend = Only relays signaling messages (WebSocket), never touches video data
✅ STUN Servers = External Google servers (stun.l.google.com:19302), help browsers find their public IPs for NAT traversal

What Flows Where:
Data Type	Path
Video/Audio	Admin Browser ↔ DIRECT ↔ Customer Browser
WebRTC Signaling	Admin Browser → Backend WebSocket → Customer Browser
Chat, Likes, Events	Browser → Backend WebSocket → Browser
Video NEVER enters your backend server. It flows peer-to-peer directly between browsers using WebRTC.