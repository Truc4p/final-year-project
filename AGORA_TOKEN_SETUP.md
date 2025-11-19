# Agora Token Authentication Setup

## ✅ What Was Fixed

The Agora error 110 ("token expired/invalid") has been resolved by implementing proper token authentication.

## 🔧 Changes Made

### Backend Changes:
1. ✅ Installed `agora-access-token` package
2. ✅ Added token generation endpoint: `POST /livestreams/agora/token`
3. ✅ Created `generateAgoraToken` controller in `livestreamController.js`

### Mobile App Changes:
1. ✅ Added `getAgoraToken()` method to `livestreamService.js`
2. ✅ Updated `AgoraBroadcaster.js` to fetch and use token before joining channel

## 📋 Setup Instructions

### Step 1: Get Your Agora Credentials

1. Go to [Agora Console](https://console.agora.io)
2. Select your project "wrencos"
3. Copy your **App ID**
4. Click "Primary Certificate" to reveal and copy your **App Certificate**

### Step 2: Configure Backend

Update `/backend/.env` file with your Agora credentials:

```env
# Agora Configuration
AGORA_APP_ID=your-actual-app-id-here
AGORA_APP_CERTIFICATE=your-actual-app-certificate-here
```

### Step 3: Restart Backend Server

```bash
cd backend
npm start
```

## 🎯 How It Works

1. When starting a livestream, the mobile app calls the backend: `POST /livestreams/agora/token`
2. Backend generates a secure token with 24-hour expiry using Agora SDK
3. Mobile app uses this token to join the Agora channel
4. Token is validated by Agora servers

## 🔒 Security Features

- ✅ Tokens expire after 24 hours
- ✅ Tokens are generated server-side (secure)
- ✅ App Certificate is never exposed to clients
- ✅ Only authenticated users can request tokens

## 🧪 Testing

1. Make sure backend is running with Agora credentials configured
2. Start the mobile app
3. Try starting a livestream
4. Check logs for:
   - `🔑 Fetching Agora token...`
   - `✅ Token received, joining channel...`
   - `✅ Broadcasting started`

## 🚨 Troubleshooting

### Still getting Error 110?
- Verify `AGORA_APP_ID` and `AGORA_APP_CERTIFICATE` are correct in `.env`
- Restart backend after updating `.env`
- Check backend logs for "Agora token generated"

### "Agora credentials not configured" error?
- Make sure `.env` file has both `AGORA_APP_ID` and `AGORA_APP_CERTIFICATE` set
- Restart backend server

### Token request fails?
- Check if backend is running
- Verify mobile app can reach backend (check API_BASE_URL)
- Check auth token is valid

## 💰 Cost Information

**Agora is FREE for development:**
- ✅ 10,000 minutes/month free tier
- ✅ No billing account required for testing
- ✅ Token generation is free
- ✅ Perfect for your project testing

## 📚 Resources

- [Agora Token Documentation](https://docs.agora.io/en/video-calling/develop/authentication-workflow)
- [Agora Console](https://console.agora.io)
