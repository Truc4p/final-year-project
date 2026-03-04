# ElevenLabs AI Voice Setup Guide

## Overview
Your Live Chat AI now supports **ElevenLabs natural AI voice** with automatic fallback to gTTS to ensure **zero charges**.

### How It Works
1. **First Choice**: ElevenLabs AI Voice (natural, human-like)
2. **Automatic Fallback**: gTTS (robotic but unlimited and free)

The system automatically:
- Tracks your monthly character usage
- Stops using ElevenLabs when you approach the free tier limit (9,500/10,000 chars)
- Falls back to gTTS to prevent any charges
- Resets usage counter every month

---

## 🆓 Free Tier Details

**ElevenLabs Free Tier:**
- **10,000 characters per month** (~10 minutes of audio)
- Multiple natural voices available
- Multilingual support
- Zero cost
- **Important**: NO commercial license (for personal/testing only)

**Usage Reset**: Credits reset on the 1st of each month

---

## 📝 Setup Instructions

### Step 1: Get Your FREE API Key

1. **Sign up** at [https://elevenlabs.io/sign-up](https://elevenlabs.io/sign-up)
   - Use your email (no credit card required)
   - Verify your email

2. **Get API Key**:
   - Log in to your ElevenLabs account
   - Click on your **Profile icon** (top right)
   - Go to **"Profile + API Key"** or **"Settings"**
   - Find the **API Keys** section
   - Click **"Copy"** to copy your API key
   
   It should look like: `sk_abcd1234efgh5678ijkl9012mnop3456`

### Step 2: Add to Your Backend

1. Open your backend `.env` file:
   ```bash
   cd backend
   nano .env
   # or use your favorite editor
   ```

2. Add this line:
   ```env
   ELEVENLABS_API_KEY=sk_your_actual_api_key_here
   ```

3. Save the file

### Step 3: Restart Your Backend Server

```bash
# If running locally
cd backend
npm start

# If using Docker
docker-compose restart backend
```

### Step 4: Verify It's Working

Check your backend logs when the server starts. You should see:

```
✅ ElevenLabs AI Voice service initialized (Free Tier)
📊 Monthly limit: 10,000 characters (~10 minutes of audio)
✅ gTTS (Google Text-to-Speech) service initialized as fallback
```

---

## 🧪 Testing

### Test the Live Chat AI:

1. Open your mobile app (customer app)
2. Go to **Skin Study** > **Live Chat AI**
3. Start a voice conversation
4. Listen to the AI response voice

**What to Expect:**
- **With ElevenLabs**: Natural, smooth, human-like voice
- **With gTTS (fallback)**: More robotic but still clear

### Check Usage:

The backend logs will show your usage after each voice generation:

```
✅ [TTS SERVICE] ElevenLabs speech generated successfully
📊 [TTS SERVICE] Used: 150/10000 chars (9850 remaining)
```

---

## 📊 Monitoring Your Usage

### View Current Usage

You can check your usage on the ElevenLabs dashboard:
1. Log in to [https://elevenlabs.io](https://elevenlabs.io)
2. Go to **Settings** > **Subscription**
3. See your credit usage for the month

### Backend Tracking

The TTS service automatically tracks usage:
- Updates after each voice generation
- Prevents overuse (stops at 9,500 chars)
- Automatically falls back to gTTS

---

## ⚙️ Configuration Options

### Disable ElevenLabs (Use gTTS Only)

If you want to use only gTTS (maybe to save credits for later):

```env
# Comment out or remove the API key
# ELEVENLABS_API_KEY=sk_your_key_here
```

Or leave it blank:
```env
ELEVENLABS_API_KEY=
```

### Voice Selection

The default voice is **Rachel** (popular, natural female voice).

To change the voice, edit [backend/services/ttsService.js](../backend/services/ttsService.js):

```javascript
// Line ~80 in textToSpeechElevenLabs method
const audio = await this.elevenLabsClient.textToSpeech.convert({
    voice_id: 'Rachel',  // Change this
    model_id: 'eleven_multilingual_v2',
    text: text,
});
```

**Available Free Tier Voices:**
- `Rachel` - Natural female voice (English)
- `Adam` - Natural male voice (English)
- `Antoni` - Warm male voice (English)
- `Bella` - Friendly female voice (English)
- `Josh` - Deep male voice (English)

Find more voices at: [https://elevenlabs.io/app/voice-library](https://elevenlabs.io/app/voice-library)

---

## 🚨 Troubleshooting

### Issue: "ElevenLabs initialization failed"

**Solution:**
1. Check if your API key is correct
2. Make sure there are no extra spaces
3. Ensure the API key starts with `sk_`

### Issue: "ElevenLabs free tier limit reached"

**Solution:**
- This is normal! The system automatically falls back to gTTS
- Wait until next month for credits to reset
- Or upgrade to a paid plan ($5/month for 30k characters)

### Issue: Voice still sounds robotic

**Solution:**
- Check backend logs to see if ElevenLabs is actually being used
- If it says "(gTTS)", then either:
  - Your API key is not configured
  - You've reached the monthly limit
  - ElevenLabs API is having issues

### Issue: "Cannot find module 'elevenlabs-js'"

**Solution:**
```bash
cd backend
npm install elevenlabs-js
npm start
```

---

## 💰 Cost Management

### Free Tier Strategy

To maximize your free tier:

1. **Test with gTTS first** (unlimited free)
2. **Enable ElevenLabs** only when demoing or for VIP users
3. **Monitor usage** regularly
4. **The system automatically protects you** from overages

### If You Need More

**Paid Plans** (optional):
- **Starter**: $5/month - 30,000 characters
- **Creator**: $22/month - 100,000 characters

For production with many users, consider:
- Keeping gTTS as default
- Using ElevenLabs only for premium features

---

## 🔐 Security Notes

### Keep Your API Key Secret

**DO NOT:**
- ❌ Commit `.env` file to Git
- ❌ Share your API key publicly
- ❌ Hardcode API key in your code

**DO:**
- ✅ Keep API key in `.env` file only
- ✅ Add `.env` to `.gitignore` (already done)
- ✅ Use environment variables

---

## 📱 Mobile App Changes

**No changes needed!** The mobile app already works with the updated TTS service.

The app sends text to the backend, and the backend automatically:
1. Tries ElevenLabs (natural voice)
2. Falls back to gTTS if needed
3. Returns audio to the app

---

## 🎉 Success Checklist

- [ ] Signed up for ElevenLabs free account
- [ ] Got API key from ElevenLabs dashboard
- [ ] Added `ELEVENLABS_API_KEY` to `.env` file
- [ ] Restarted backend server
- [ ] Verified initialization in logs
- [ ] Tested Live Chat AI voice
- [ ] Heard natural AI voice (not robotic)

---

## 📞 Support

If you encounter any issues:

1. **Check Logs**: Look at backend console for error messages
2. **Verify API Key**: Make sure it's correct and active
3. **Check ElevenLabs Status**: [https://status.elevenlabs.io/](https://status.elevenlabs.io/)
4. **Test Fallback**: Remove API key temporarily to test gTTS works

---

## 🔄 Automatic Fallback Scenarios

The system uses gTTS (free) in these cases:

1. ✅ **No API Key** - ELEVENLABS_API_KEY not set
2. ✅ **Limit Reached** - Used 9,500+ characters this month
3. ✅ **API Error** - ElevenLabs service is down
4. ✅ **Network Issue** - Can't connect to ElevenLabs

**Result**: Your app NEVER fails, always has voice!

---

## 📈 Future Enhancements

Possible improvements:
- [ ] Add usage dashboard endpoint
- [ ] Add voice selection in mobile app settings
- [ ] Implement voice caching for repeated phrases
- [ ] Add usage alerts via email
- [ ] Support multiple ElevenLabs voices

---

Enjoy your natural AI voice! 🎙️✨
