# Quick Start Guide

## 1. Install Dependencies
```bash
cd mobile-app-customer
npm install
```

## 2. Configure Backend URL
Edit `src/constants/index.js` and update:
```javascript
export const API_BASE_URL = 'http://YOUR_LOCAL_IP:3000/api';
```

Find your IP:
- **macOS**: `ipconfig getifaddr en0`
- **Windows**: `ipconfig` (look for IPv4)

## 3. Start Backend Server
```bash
cd ../backend
npm start
```

## 4. Start Mobile App
```bash
cd ../mobile-app-customer
npm start
```

## 5. Run on Device
- Scan QR code with Expo Go app
- Or press 'i' for iOS simulator
- Or press 'a' for Android emulator

## Test Credentials
Create a new account in the app or use existing customer credentials from your backend.

**Note**: Make sure your mobile device and computer are on the same WiFi network!
