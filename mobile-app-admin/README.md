# Admin Livestream Mobile App

Mobile application for admin users to broadcast livestreams that can be viewed by customers on both web and mobile platforms.

## Features

- 📹 Live video broadcasting with camera
- 🎙️ Audio streaming
- 💬 Real-time chat with viewers
- 🛍️ Product pinning during livestream
- 📊 Live viewer count and likes
- 💾 Automatic recording and upload
- 🔄 Camera flip (front/back)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Backend URL

Edit `src/constants/index.js` and update the URLs:

```javascript
export const API_BASE_URL = 'http://YOUR_BACKEND_IP:3000';
export const WS_BASE_URL = 'ws://YOUR_BACKEND_IP:3000';
```

**Important:** Use your local network IP address (not localhost) so the mobile app can reach the backend.

### 3. Run the App

```bash
# Start Metro bundler
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## Usage

### Login
- Use admin credentials to login
- Email and password must match an admin user in the database

### Start Livestream
1. Tap the record button (center)
2. Enter stream title and description
3. Tap "Start" to begin broadcasting
4. The camera will start recording automatically

### During Livestream
- **Flip Camera**: Tap the 🔄 button (left)
- **Pin Products**: Tap the 🛍️ button (right) to select products to display
- **Chat**: Use the bottom section to send messages to viewers
- **View Stats**: See live viewer count and likes in the top-right overlay

### Stop Livestream
1. Tap the record button again
2. Confirm stop action
3. Recording will be saved and uploaded automatically

## Permissions Required

- **Camera**: For video broadcasting
- **Microphone**: For audio streaming
- **Photo Library**: To save recordings

## Technical Details

### Recording
- Videos are recorded in 720p quality
- Maximum duration: 2 hours
- Format: MP4/MOV (device dependent)
- Automatically uploaded to backend after stream ends

### WebSocket Communication
- Real-time updates to all connected viewers
- Chat messages synchronized across platforms
- Product pin updates broadcast instantly
- Viewer count and likes updated in real-time

### Architecture
```
Admin Mobile App → Backend API → WebSocket → Customer Apps (Web & Mobile)
                ↓
            Recording
                ↓
            Upload to Server
```

## Troubleshooting

### Cannot Connect to Backend
- Ensure backend is running
- Check that you're on the same network
- Verify IP address in constants file
- Check firewall settings

### Camera Not Working
- Grant camera permissions in device settings
- Restart the app
- Check if other apps can access camera

### Recording Not Saving
- Grant photo library permissions
- Check device storage space
- Ensure backend upload endpoint is working

## Building for Production

### iOS
```bash
expo build:ios
```

### Android
```bash
expo build:android
```

## Environment Variables

Create a `.env` file (optional):
```
API_BASE_URL=http://your-backend-url:3000
WS_BASE_URL=ws://your-backend-url:3000
```
