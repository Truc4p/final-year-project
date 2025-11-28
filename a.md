
Admin                Backend                Customer
  |                     |                      |
  |---webrtc_offer----->|                      |
  |                     |---webrtc_offer------>|
  |                     |                      |
  |                     |<--webrtc_answer------|
  |<--webrtc_answer-----|                      |
  |                     |                      |
  |---ICE_candidate---->|---ICE_candidate----->|
  |<--ICE_candidate-----|<--ICE_candidate------|
  |                     |                      |
  |<========= Direct P2P Video Stream ========>|


┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│ Admin Web   │         │  Backend    │         │ Customer Web│
│   App       │         │  WebSocket  │         │    App      │
└─────────────┘         └─────────────┘         └─────────────┘
       │                       │                       │
       │  1. Start Stream      │                       │
       │──────────────────────>│                       │
       │                       │  2. stream_started    │
       │                       │──────────────────────>│
       │                       │                       │
       │  3. WebRTC Offer      │  4. Forward Offer     │
       │──────────────────────>│──────────────────────>│
       │                       │                       │
       │  6. Forward Answer    │  5. WebRTC Answer     │
       │<──────────────────────│<──────────────────────│
       │                       │                       │
       │  7. ICE Candidates exchanged                  │
       │<─────────────────────────────────────────────>│
       │                       │                       │
       │  8. ═══════ DIRECT P2P VIDEO STREAM ═══════> │
       │                       │                       │
       │  9. Like              │                       │
       │                       │<──────────────────────│
       │ 10. stream_update     │                       │
       │<──────────────────────│──────────────────────>│
       │  (likes: 42)          │  (likes: 42)          │

Key Technologies Used:
WebRTC (Peer-to-Peer): Direct video/audio streaming between admin and customers
WebSocket: Real-time signaling and metadata updates (viewer count, likes, chat)
REST API: CRUD operations for livestream records in MongoDB
MediaRecorder API: Records the stream for replay later
MongoDB: Stores livestream metadata, chat history, pinned products

Summary:
Admin captures camera → creates livestream via API → broadcasts via WebRTC + WebSocket
Backend stores metadata in MongoDB → acts as WebSocket/WebRTC signaling server → coordinates connections
Customers receive WebSocket notification → establish WebRTC connection → watch live video stream
Real-time updates (likes, viewer count, chat) flow through WebSocket
Video stream flows directly peer-to-peer via WebRTC (not through backend)
Recording saved to backend after stream ends for replay