# 🚀 Getting Started Checklist

Use this checklist to get your mobile app up and running!

## ✅ Prerequisites

- [ ] Node.js installed (v14 or higher)
- [ ] npm or yarn installed
- [ ] Expo CLI installed (`npm install -g expo-cli`)
- [ ] Expo Go app installed on your mobile device
- [ ] Backend server code available
- [ ] Computer and mobile device on same WiFi network

## 📝 Setup Steps

### Step 1: Install Dependencies
- [ ] Navigate to `mobile-app-customer` folder
- [ ] Run `npm install` (or `./setup.sh`)
- [ ] Wait for installation to complete

### Step 2: Configure API Connection
- [ ] Find your computer's local IP address
  - macOS: Run `ipconfig getifaddr en0` in terminal
  - Windows: Run `ipconfig` and find IPv4 Address
  - Linux: Run `hostname -I`
- [ ] Open `src/constants/index.js`
- [ ] Update `API_BASE_URL` with your IP:
  ```javascript
  export const API_BASE_URL = 'http://YOUR_IP:3000/api';
  ```
- [ ] Save the file

### Step 3: Prepare Assets (Optional)
- [ ] Add `icon.png` (1024x1024) to `assets/` folder
- [ ] Add `splash.png` (1242x2436) to `assets/` folder
- [ ] Add `adaptive-icon.png` (1024x1024) to `assets/` folder
- [ ] Or use placeholders for now (app will still work)

### Step 4: Start Backend Server
- [ ] Open new terminal window
- [ ] Navigate to `backend` folder
- [ ] Run `npm start`
- [ ] Verify server is running on port 3000
- [ ] Check for "Server is running" message

### Step 5: Start Mobile App
- [ ] Open new terminal window
- [ ] Navigate to `mobile-app-customer` folder
- [ ] Run `npm start` or `expo start`
- [ ] Wait for QR code to appear
- [ ] Note: Keep this terminal open

### Step 6: Run on Device
- [ ] Open Expo Go app on your phone
- [ ] Scan the QR code from terminal
  - iOS: Use Camera app to scan
  - Android: Use Expo Go app to scan
- [ ] Wait for app to build and load
- [ ] App should open automatically

## 🧪 Testing

### Test Authentication
- [ ] Register a new customer account
- [ ] Verify registration success message
- [ ] Login with created credentials
- [ ] Verify successful login and redirect to home

### Test Product Features
- [ ] Browse products on home screen
- [ ] Use search to find products
- [ ] Filter by category
- [ ] Click on a product to view details
- [ ] Add product to cart
- [ ] Verify success message

### Test Cart
- [ ] Navigate to Cart tab
- [ ] Verify added items appear
- [ ] Update quantity (increase/decrease)
- [ ] Remove an item
- [ ] Add more items from home

### Test Checkout
- [ ] Click "Proceed to Checkout"
- [ ] Select payment method (COD or Online)
- [ ] Confirm order placement
- [ ] Verify success message

### Test Orders
- [ ] Navigate to Orders tab
- [ ] Verify recent order appears
- [ ] Click on order to view details
- [ ] Check order status
- [ ] Try canceling a processing order

### Test Profile
- [ ] Navigate to Profile tab
- [ ] Verify user information displayed
- [ ] Try navigation to orders from profile
- [ ] Test logout functionality
- [ ] Verify redirect to login screen

## 🐛 Troubleshooting

### If app won't start:
- [ ] Run `expo start -c` to clear cache
- [ ] Delete `node_modules` and run `npm install` again
- [ ] Check for error messages in terminal

### If can't connect to backend:
- [ ] Verify backend is running
- [ ] Check API_BASE_URL is correct
- [ ] Confirm both devices on same WiFi
- [ ] Try pinging your computer from phone
- [ ] Temporarily disable firewall

### If images don't load:
- [ ] Check backend serves static files
- [ ] Verify image paths in API response
- [ ] Check uploads folder exists in backend
- [ ] Try adding a product with image via admin panel

### If login fails:
- [ ] Verify backend /api/auth/login endpoint works
- [ ] Check username and password are correct
- [ ] Ensure user has 'customer' role
- [ ] Check backend logs for errors

## 📱 Platform-Specific Notes

### iOS
- [ ] Can use `http://localhost:3000/api` for simulator
- [ ] Use local IP for physical device
- [ ] Camera app can scan QR directly

### Android
- [ ] Use `http://10.0.2.2:3000/api` for emulator
- [ ] Use local IP for physical device
- [ ] Must use Expo Go app to scan QR

## ✨ Next Steps

After successful setup:
- [ ] Read DEVELOPMENT.md for development guidelines
- [ ] Customize colors in `src/constants/index.js`
- [ ] Add your own app icons and splash screen
- [ ] Configure app.json with your app details
- [ ] Test on both iOS and Android if possible

## 📚 Resources

- [ ] README.md - Full documentation
- [ ] QUICKSTART.md - Quick reference
- [ ] DEVELOPMENT.md - Developer guide
- [ ] PROJECT_SUMMARY.md - Feature overview
- [ ] Expo Docs - https://docs.expo.dev/

## 🎉 Success Criteria

You're all set when you can:
- ✅ Login/register successfully
- ✅ Browse and search products
- ✅ Add items to cart
- ✅ Complete a purchase
- ✅ View order history
- ✅ See user profile

---

**Need help?** Check the README.md or DEVELOPMENT.md for detailed information!
