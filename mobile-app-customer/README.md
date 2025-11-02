# Customer Shopping Mobile App

A React Native Expo mobile application for customers to browse and purchase products.

## Features

- 🔐 **Authentication**: Login and registration for customers
- 🏪 **Product Browsing**: View products with search and category filtering
- 🛒 **Shopping Cart**: Add/remove items, update quantities
- 📦 **Order Management**: View order history and track orders
- 👤 **User Profile**: Manage account and settings
- 💳 **Payment Options**: Cash on Delivery (COD) and Online Payment

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Expo Go App](https://expo.dev/client) on your iOS or Android device

## Installation

1. **Navigate to the mobile app directory:**
   ```bash
   cd mobile-app-customer
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```
   or
   ```bash
   yarn install
   ```

3. **Configure the API endpoint:**
   
   Open `src/constants/index.js` and update the `API_BASE_URL`:
   
   ```javascript
   // For testing on a physical device, use your computer's local IP address
   export const API_BASE_URL = 'http://192.168.1.100:3000/api';
   
   // For iOS simulator/Android emulator
   // iOS Simulator: export const API_BASE_URL = 'http://localhost:3000/api';
   // Android Emulator: export const API_BASE_URL = 'http://10.0.2.2:3000/api';
   ```

   **Finding your local IP address:**
   - **macOS/Linux**: Run `ifconfig | grep "inet "` or `ipconfig getifaddr en0`
   - **Windows**: Run `ipconfig` and look for IPv4 Address

## Running the App

1. **Start the backend server first:**
   ```bash
   cd ../backend
   npm start
   ```

2. **Start the Expo development server:**
   ```bash
   cd ../mobile-app-customer
   npm start
   ```
   or
   ```bash
   expo start
   ```

3. **Run on your device:**
   - **iOS Device**: Scan the QR code with your camera app
   - **Android Device**: Scan the QR code with the Expo Go app
   - **iOS Simulator**: Press `i` in the terminal
   - **Android Emulator**: Press `a` in the terminal

## Project Structure

```
mobile-app-customer/
├── App.js                    # Main app entry point with navigation
├── app.json                  # Expo configuration
├── package.json              # Dependencies
├── babel.config.js           # Babel configuration
├── assets/                   # Images and assets
└── src/
    ├── constants/            # App constants and config
    │   └── index.js
    ├── screens/              # Screen components
    │   ├── LoginScreen.js
    │   ├── RegisterScreen.js
    │   ├── HomeScreen.js
    │   ├── ProductDetailScreen.js
    │   ├── CartScreen.js
    │   ├── OrdersScreen.js
    │   ├── OrderDetailScreen.js
    │   └── ProfileScreen.js
    ├── services/             # API services
    │   ├── api.js
    │   ├── authService.js
    │   ├── productService.js
    │   └── orderService.js
    └── utils/                # Utility functions
        └── storage.js
```

## API Endpoints Used

The app connects to the following backend endpoints:

- **Auth**: `/api/auth/login`, `/api/auth/register`
- **Products**: `/api/products`, `/api/products/:id`
- **Categories**: `/api/categories`
- **Orders**: `/api/orders`, `/api/orders/user/:userId`

## Features by Screen

### Login & Registration
- Secure authentication
- Form validation
- Customer role verification

### Home Screen
- Product grid view
- Search functionality
- Category filtering
- Pull-to-refresh

### Product Detail
- Product images and descriptions
- Stock availability
- Quantity selector
- Add to cart

### Shopping Cart
- Item management (add/remove/update)
- Real-time total calculation
- Checkout with payment method selection

### Orders
- Order history
- Order status tracking
- Order details view
- Cancel order (for processing orders)

### Profile
- User information
- Quick access to orders and cart
- Settings options
- Logout

## Configuration

### Change API URL
Edit `src/constants/index.js`:
```javascript
export const API_BASE_URL = 'http://your-api-url:3000/api';
```

### Customize Theme Colors
Edit `src/constants/index.js`:
```javascript
export const COLORS = {
  primary: '#4CAF50',
  secondary: '#FFC107',
  // ... other colors
};
```

## Troubleshooting

### Cannot connect to backend
1. Ensure the backend server is running
2. Check that the `API_BASE_URL` is correct
3. Make sure your device and computer are on the same network
4. Try disabling firewall temporarily

### App won't start
1. Clear Expo cache: `expo start -c`
2. Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
3. Clear Metro bundler cache: `npx react-native start --reset-cache`

### Images not loading
1. Verify the backend is serving static files correctly
2. Check the image URLs in the API response
3. Ensure the image paths are correct in `API_BASE_URL`

## Building for Production

### Android APK
```bash
expo build:android
```

### iOS IPA
```bash
expo build:ios
```

For more information, see [Expo Build Documentation](https://docs.expo.dev/classic/building-standalone-apps/).

## Technologies Used

- **React Native** - Mobile framework
- **Expo** - Development platform
- **React Navigation** - Navigation library
- **Axios** - HTTP client
- **AsyncStorage** - Local data persistence

## Future Enhancements

- [ ] Push notifications for order updates
- [ ] Product reviews and ratings
- [ ] Wishlist functionality
- [ ] Multiple delivery addresses
- [ ] Payment gateway integration
- [ ] Social media authentication
- [ ] Dark mode support

## Support

For issues or questions, please contact the development team.

## License

This project is part of the FYP-c1682 final project.
