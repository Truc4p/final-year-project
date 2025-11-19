# Mobile Admin Livestreaming Setup Guide

## Overview

This guide explains the complete mobile livestreaming architecture where:
- **Admin Mobile App** broadcasts livestreams using device camera
- **Customer Mobile App** receives and displays the live stream info
- **Web Admin** can still broadcast from browser
- **Web Customer** can view all streams
- **Backend** coordinates all real-time communication via WebSocket

## Architecture

```
┌─────────────────────┐
│  Admin Mobile App   │
│  (React Native)     │
│   📹 Camera Stream  │
└──────────┬──────────┘
           │
           │ WebSocket + REST API
           │ - Creates livestream
           │ - Records video
           │ - Sends chat messages
           │ - Pins products
           ▼
┌─────────────────────────────────┐
│         Backend Server          │
│  - Express.js API               │
│  - WebSocket Server             │
│  - MongoDB Database             │
│  - File Storage (videos)        │
└──────────┬──────────────────────┘
           │
           │ WebSocket Broadcasts
           │ - stream_started
           │ - stream_stopped
           │ - stream_update
           │ - chat_message
           │ - pinned_products
           ▼
┌──────────────────────────────────────┐
│         All Connected Clients        │
│  ┌──────────────┐  ┌──────────────┐ │
│  │Customer Mobile│  │Customer Web  │ │
│  │ (React Native)│  │    (Vue.js)  │ │
│  │  📱 Viewer    │  │  💻 Viewer   │ │
│  └──────────────┘  └──────────────┘ │
└──────────────────────────────────────┘
```

## How It Works

### 1. Admin Starts Livestream (Mobile App)

```javascript
// Admin Mobile App
1. User taps "Start Stream" button
2. App requests camera/microphone permissions
3. Camera preview starts
4. User enters title and description
5. App calls API: POST /livestreams
6. Backend creates livestream record
7. App starts recording video locally
8. WebSocket sends: { type: 'start_stream', streamId: '...' }
9. Backend broadcasts to all clients: { type: 'stream_started', streamData: {...} }
```

### 2. Customers Receive Notification

```javascript
// Customer Apps (Mobile & Web)
1. WebSocket receives: { type: 'stream_started', streamData: {...} }
2. UI updates: isLive = true
3. Display stream title, description
4. Show live indicator (red dot)
5. Enable chat input
6. Display pinned products
```

### 3. During Livestream

#### Admin Actions:
- **Send Chat**: Messages broadcast to all viewers
- **Pin Products**: Updates broadcast to all viewers
- **View Stats**: Real-time viewer count and likes

#### Customer Actions:
- **View Info**: See stream title, description, stats
- **Chat**: Send messages visible to everyone
- **Like**: Increment like counter
- **View Products**: See pinned products, add to cart

### 4. Admin Stops Livestream

```javascript
// Admin Mobile App
1. User taps "Stop Stream" button
2. App stops video recording
3. App calls API: POST /livestreams/:id/stop
4. App uploads recorded video: POST /livestreams/:id/upload
5. WebSocket sends: { type: 'stop_stream', streamId: '...' }
6. Backend broadcasts: { type: 'stream_stopped' }
7. Recording saved to backend storage
```

## Setup Instructions

### Step 1: Backend Configuration

The backend is already set up to support mobile streaming! No changes needed to existing endpoints.

#### Verify these endpoints exist:
- ✅ `POST /livestreams` - Create livestream
- ✅ `POST /livestreams/:id/stop` - Stop livestream
- ✅ `POST /livestreams/:id/upload` - Upload video
- ✅ `POST /livestreams/:id/pin-product` - Pin product
- ✅ `DELETE /livestreams/:id/pin-product/:productId` - Unpin product
- ✅ WebSocket connection at `/` with `?token=...&role=admin`

### Step 2: Admin Mobile App Setup

1. **Navigate to admin app directory:**
```bash
cd /Users/phamthanhtruc/Documents/uni/FYP-c1682/wrencos/mobile-app-admin
```

2. **Update API URLs:**
Edit `src/constants/index.js`:
```javascript
// Find your local network IP address:
// macOS: System Preferences > Network > Wi-Fi > IP Address
// Windows: ipconfig
// Linux: ifconfig or ip addr

export const API_BASE_URL = 'http://YOUR_LOCAL_IP:3000';
export const WS_BASE_URL = 'ws://YOUR_LOCAL_IP:3000';

// Example:
export const API_BASE_URL = 'http://192.168.1.100:3000';
export const WS_BASE_URL = 'ws://192.168.1.100:3000';
```

3. **Install dependencies (already done):**
```bash
npm install
```

4. **Start the app:**
```bash
# Start Metro bundler
npm start

# Or run directly on device
npm run ios    # For iOS
npm run android # For Android
```

### Step 3: Test the Full Flow

1. **Start Backend:**
```bash
cd backend
npm start
```

2. **Start Customer Mobile App:**
```bash
cd mobile-app-customer
npm start
```

3. **Start Admin Mobile App:**
```bash
cd mobile-app-admin
npm start
```

4. **Login to Admin App:**
   - Email: admin@example.com
   - Password: (your admin password)

5. **Start Livestream:**
   - Tap the record button
   - Enter title: "Test Stream"
   - Tap "Start"
   - Grant camera/microphone permissions

6. **Check Customer App:**
   - Should see "LIVE NOW" indicator
   - Should see stream title
   - Should see viewer count updating

7. **Test Features:**
   - Send chat messages from both apps
   - Pin a product from admin app
   - Like the stream from customer app
   - Stop the stream from admin app

## Troubleshooting

### Issue: Customer app doesn't show stream

**Solution:**
1. Check WebSocket connection in both apps
2. Verify backend is running
3. Check network connectivity
4. Look at console logs for errors

### Issue: Cannot connect to backend

**Solution:**
1. Ensure using local network IP (not localhost)
2. Ensure devices on same Wi-Fi network
3. Check firewall settings
4. Verify backend port (3000) is accessible

### Issue: Camera not working

**Solution:**
1. Grant camera permissions in device settings
2. Check if other apps can access camera
3. Restart the app
4. Check console for permission errors

### Issue: Video not uploading

**Solution:**
1. Check backend upload endpoint
2. Verify file size limits
3. Check network connection
4. Look at backend logs for errors

## Key Differences from Web Streaming

| Feature | Web Admin | Mobile Admin |
|---------|-----------|--------------|
| Broadcasting | Browser WebRTC | Native Camera API |
| Recording | MediaRecorder API | Expo Camera Recording |
| Video Format | WebM | MP4/MOV |
| Viewing (Web) | WebRTC peer connection | Via uploaded recording |
| Viewing (Mobile) | N/A | Via WebSocket sync |
| Quality | Up to 1080p | 720p (configurable) |

## File Structure

```
mobile-app-admin/
├── App.js                          # Main app entry with navigation
├── app.json                        # Expo configuration
├── package.json                    # Dependencies
└── src/
    ├── constants/
    │   └── index.js               # API URLs and constants
    ├── services/
    │   ├── api.js                 # Axios instance
    │   └── livestreamService.js   # Livestream API & WebSocket
    └── screens/
        ├── LoginScreen.js         # Admin login
        └── LivestreamScreen.js    # Main broadcast screen
```

## WebSocket Message Types

### Admin → Backend:
```javascript
{ type: 'start_stream', streamId: 'abc123' }
{ type: 'stop_stream', streamId: 'abc123' }
{ type: 'chat_message', message: 'Hello!', isAdmin: true }
{ type: 'stream_update', viewerCount: 10, likes: 5 }
```

### Backend → All Clients:
```javascript
{ type: 'stream_started', streamData: { _id, title, description, ... } }
{ type: 'stream_stopped' }
{ type: 'stream_update', viewerCount: 10, likes: 5 }
{ type: 'chat_message', id, username, message, timestamp, isAdmin }
{ type: 'pinned_products_updated', pinnedProducts: [...] }
```

## Security Considerations

1. **Authentication**: Admin token required for all admin operations
2. **Permissions**: Camera, microphone, storage permissions requested
3. **WebSocket**: Token validation on connection
4. **Upload**: File type and size validation on backend
5. **Rate Limiting**: Consider adding rate limits for chat messages

## Performance Tips

1. **Video Quality**: Use 720p for balance of quality and file size
2. **Network**: Ensure stable Wi-Fi connection during streaming
3. **Storage**: Clear old recordings periodically
4. **Battery**: Keep device plugged in during long streams
5. **Memory**: Close other apps to free up resources

## Future Enhancements

- [ ] Real-time video streaming (WebRTC peer-to-peer)
- [ ] Multiple camera support (picture-in-picture)
- [ ] Beauty filters and effects
- [ ] Screen recording option
- [ ] Scheduled livestreams
- [ ] Analytics dashboard
- [ ] Multi-streaming to different platforms
- [ ] Guest co-hosting
- [ ] Polls and Q&A features
- [ ] Virtual backgrounds

## Support

For issues or questions:
1. Check console logs in both apps
2. Verify backend logs
3. Check network connectivity
4. Review this documentation
5. Test with the flow diagram above
