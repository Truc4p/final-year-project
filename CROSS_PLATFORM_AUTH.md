# Cross-Platform Authentication Guide

## Overview

Your application now supports **unified authentication** across all platforms:
- ✅ Web Frontend (Vue.js)
- ✅ Mobile App (React Native)

Accounts created on **any platform** can be used to login on **all platforms**.

## What Was Changed

### 1. Mobile App API Configuration
**File:** `mobile-app-customer/src/constants/index.js`

Updated the API base URL to match the web frontend's backend:
```javascript
// Before
export const API_BASE_URL = 'http://192.168.88.55:3000';

// After
export const API_BASE_URL = 'http://172.25.175.149:3000';
```

### 2. Web Frontend Registration
**File:** `frontend/src/pages/public/Register.vue`

Added email field to registration form for consistency with mobile app:
- Mobile app already collected email during registration
- Web frontend now also collects email (optional)
- Both platforms store email in the same database field

### 3. Added Translations
**File:** `frontend/src/i18n.js`

Added email label translations for both English and Vietnamese:
```javascript
email: 'Email',           // English
email: 'Email',           // Vietnamese
```

## How It Works

### Shared Backend
Both platforms connect to the same:
- **MongoDB Database**: User credentials stored in one place
- **Authentication Endpoints**: 
  - `POST /auth/register` - Create new account
  - `POST /auth/login` - Login to existing account
- **User Model**: Same schema with fields:
  - `username` (required, unique)
  - `password` (required, hashed with bcrypt)
  - `email` (optional)
  - `role` (customer or admin)

### Authentication Flow

#### Registration
1. User enters credentials (username, password, email)
2. Backend hashes password with bcrypt
3. User document saved to MongoDB
4. JWT token generated and returned

#### Login
1. User enters username and password
2. Backend finds user by username
3. Password verified using bcrypt
4. JWT token generated with user data (id, username, role)
5. Token stored locally:
   - **Web**: localStorage
   - **Mobile**: AsyncStorage

## Testing Cross-Platform Authentication

### Test Scenario 1: Register on Mobile, Login on Web

1. **On Mobile App:**
   ```
   Username: testuser123
   Email: test@example.com
   Password: MyPassword123!
   ```
   - Tap "Register"
   - Account created successfully

2. **On Web Frontend:**
   - Navigate to Login page (`/login`)
   - Enter same credentials:
     ```
     Username: testuser123
     Password: MyPassword123!
     ```
   - Click "Sign In"
   - ✅ **Should login successfully!**

### Test Scenario 2: Register on Web, Login on Mobile

1. **On Web Frontend:**
   - Navigate to Register page (`/register`)
   - Enter credentials:
     ```
     Username: webuser456
     Email: web@example.com
     Password: WebPass456!
     Role: Customer
     ```
   - Click "Register"
   - Account created successfully

2. **On Mobile App:**
   - Open Login screen
   - Enter same credentials:
     ```
     Username: webuser456
     Password: WebPass456!
     ```
   - Tap "Login"
   - ✅ **Should login successfully!**

## Important Notes

### ⚠️ Backend Server Must Be Running
Ensure your backend server is running and accessible:
```bash
cd backend
npm start
```

The server should be running on: `http://172.25.175.149:3000`

### 🌐 Network Configuration

**For Local Testing:**
- Web: `http://localhost:3000` (when accessed locally)
- Web: `http://172.25.175.149:3000` (when accessed via network)
- Mobile: `http://172.25.175.149:3000`

**For Production:**
Update both `API_BASE_URL` and `API_URL` to point to your production server.

### 📱 Mobile Network Access

If mobile app can't connect:
1. Ensure your device is on the same network as the backend server
2. Check firewall settings allow connections on port 3000
3. Try alternative configurations in `mobile-app-customer/src/constants/index.js`:
   ```javascript
   // For iOS Simulator
   export const API_BASE_URL = 'http://localhost:3000';
   
   // For Android Emulator
   export const API_BASE_URL = 'http://10.0.2.2:3000';
   ```

## Troubleshooting

### Issue: "Invalid Credentials" when logging in
**Possible Causes:**
1. Account created on different backend instance
2. Typo in username or password
3. Backend server restarted and database not persisted

**Solution:**
- Verify backend is running: `http://172.25.175.149:3000`
- Check MongoDB connection in backend logs
- Try creating a new account and logging in immediately

### Issue: Mobile app can't connect to backend
**Possible Causes:**
1. Wrong network or IP address
2. Firewall blocking connections
3. Backend not accessible from device's network

**Solution:**
1. Get your computer's IP address:
   ```bash
   # macOS/Linux
   ifconfig | grep "inet "
   
   # Windows
   ipconfig
   ```
2. Update `API_BASE_URL` in `mobile-app-customer/src/constants/index.js`
3. Restart the mobile app

### Issue: Web frontend can't reach backend
**Solution:**
Check `frontend/src/utils/config.js` and ensure the IP matches your backend server.

## Database Schema

### User Model
```javascript
{
  username: String (required, unique),
  password: String (required, hashed),
  email: String (optional),
  phone: String (optional),
  address: String (optional),
  role: String (enum: ['admin', 'customer'], default: 'customer'),
  createdAt: Date (default: now)
}
```

## Security Features

1. **Password Hashing**: bcrypt with 10 salt rounds
2. **JWT Tokens**: 12-hour expiration
3. **Password Strength**: Web requires strong passwords (8+ chars, mixed case, numbers, special chars)
4. **Mobile Validation**: Minimum 6 characters

## Next Steps

To fully verify cross-platform authentication:

1. ✅ Ensure backend is running
2. ✅ Test registration on one platform
3. ✅ Test login on the other platform
4. ✅ Verify user data persists across sessions
5. ✅ Test with both customer and admin roles

## Support

If you encounter issues:
1. Check backend logs for error messages
2. Verify network connectivity between platforms
3. Ensure MongoDB is running and accessible
4. Check browser/mobile console for detailed error logs
