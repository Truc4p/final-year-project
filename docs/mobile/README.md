# Mobile App Documentation

## Overview

The mobile application is built with React Native and Expo, providing customers with a native shopping experience on iOS and Android devices.

**Framework**: React Native
**Build System**: Expo (~50.0.0)
**Navigation**: React Navigation
**State Management**: React Context API
**HTTP Client**: Axios

## Directory Structure

```
mobile-app-customer/
├── App.js                  # Main app entry point
├── app.json               # Expo configuration
├── package.json           # Dependencies
├── babel.config.js        # Babel configuration
├── eas.json              # Expo Application Services config
├── assets/               # Static assets
│   ├── icon.png         # App icon
│   └── splash.png       # Splash screen
├── src/
│   ├── constants/       # App constants
│   │   └── index.js    # Colors, API URLs
│   ├── contexts/        # React Context providers
│   │   └── AuthContext.js
│   ├── screens/         # Screen components
│   │   ├── LoginScreen.js
│   │   ├── RegisterScreen.js
│   │   ├── HomeScreen.js
│   │   ├── ProductDetailScreen.js
│   │   ├── CartScreen.js
│   │   ├── OrdersScreen.js
│   │   ├── OrderDetailScreen.js
│   │   ├── ProfileScreen.js
│   │   └── LivestreamScreen.js
│   ├── services/        # API services
│   │   └── api.js
│   └── utils/           # Utility functions
├── scripts/             # Build scripts
    ├── generate-icon.js
    └── generate_icon.py

```

## Key Dependencies

```json
{
  "@react-navigation/native": "^6.1.9",
  "@react-navigation/stack": "^6.3.20",
  "@react-navigation/bottom-tabs": "^6.5.11",
  "@react-native-async-storage/async-storage": "1.21.0",
  "expo": "~50.0.0",
  "expo-image-picker": "~14.7.1",
  "react-native": "0.73.6",
  "axios": "^1.6.2",
  "react-native-vector-icons": "^10.0.3"
}
```

## App Architecture

### Navigation Structure

```
AuthStack (Not Authenticated)
├── Login
└── Register

MainTabs (Authenticated)
├── Home (Stack)
│   ├── HomeMain
│   ├── ProductDetail
│   └── Cart
├── Livestream
├── Cart
├── Orders (Stack)
│   ├── OrdersList
│   └── OrderDetail
└── Profile
```

### Navigation Implementation

**File**: `App.js`

```javascript
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Auth screens for non-authenticated users
function AuthStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// Main tabs for authenticated users
function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Livestream" component={LivestreamScreen} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Orders" component={OrdersStack} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// Root navigator switches between Auth and Main based on auth state
function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}
```

## Authentication System

### AuthContext

**File**: `src/contexts/AuthContext.js`

**Purpose**: Manage authentication state across the app.

**Features**:
- Login/logout functionality
- Token storage in AsyncStorage
- User state management
- Auto-login on app start

**Implementation**:
```javascript
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing token on app start
  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');
      
      if (token && userId) {
        setUser({ id: userId });
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(username, password) {
    try {
      const response = await axios.post('/auth/login', {
        username,
        password
      });
      
      const { token, userId, role } = response.data;
      
      // Store in AsyncStorage
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('userId', userId);
      await AsyncStorage.setItem('role', role);
      
      setUser({ id: userId, role });
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.msg || 'Login failed'
      };
    }
  }

  async function logout() {
    await AsyncStorage.multiRemove(['token', 'userId', 'role']);
    setUser(null);
    setIsAuthenticated(false);
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoading,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
```

## Screens

### LoginScreen

**File**: `src/screens/LoginScreen.js`

**Features**:
- Username/password input
- Login button
- Navigation to Register
- Error handling
- Loading state

**UI Components**:
- TextInput for username
- SecureTextInput for password
- TouchableOpacity for buttons
- ActivityIndicator for loading

### RegisterScreen

**File**: `src/screens/RegisterScreen.js`

**Features**:
- Username/password input
- Role selection (customer only in mobile)
- Form validation
- Account creation
- Auto-login after registration

### HomeScreen

**File**: `src/screens/HomeScreen.js`

**Features**:
- Product grid/list
- Search functionality
- Category filtering
- Pull-to-refresh
- Infinite scroll/pagination
- Add to cart from list
- Navigate to product details

**Layout**:
```javascript
<SafeAreaView>
  <SearchBar />
  <CategoryFilter />
  <FlatList
    data={products}
    renderItem={({ item }) => <ProductCard product={item} />}
    keyExtractor={item => item._id}
    numColumns={2}
    refreshControl={<RefreshControl />}
    onEndReached={loadMore}
  />
</SafeAreaView>
```

### ProductDetailScreen

**File**: `src/screens/ProductDetailScreen.js`

**Features**:
- Product image gallery
- Product name, price, description
- Stock availability
- Quantity selector
- Add to cart button
- Product information (ingredients, skin type, benefits)

**Data Loading**:
```javascript
useEffect(() => {
  loadProduct();
}, [productId]);

async function loadProduct() {
  try {
    const response = await axios.get(`/products/${productId}`);
    setProduct(response.data);
  } catch (error) {
    Alert.alert('Error', 'Failed to load product');
  }
}
```

### CartScreen

**File**: `src/screens/CartScreen.js`

**Features**:
- List cart items
- Update quantities
- Remove items
- Calculate totals (subtotal, tax, shipping)
- Proceed to checkout
- Empty cart message

**Cart Management**:
```javascript
// Cart stored in AsyncStorage
const [cartItems, setCartItems] = useState([]);

useEffect(() => {
  loadCart();
}, []);

async function loadCart() {
  const cart = await AsyncStorage.getItem('cart');
  setCartItems(cart ? JSON.parse(cart) : []);
}

async function updateQuantity(productId, quantity) {
  const updatedCart = cartItems.map(item =>
    item.product._id === productId ? { ...item, quantity } : item
  );
  setCartItems(updatedCart);
  await AsyncStorage.setItem('cart', JSON.stringify(updatedCart));
}

async function removeItem(productId) {
  const updatedCart = cartItems.filter(item => item.product._id !== productId);
  setCartItems(updatedCart);
  await AsyncStorage.setItem('cart', JSON.stringify(updatedCart));
}
```

### OrdersScreen

**File**: `src/screens/OrdersScreen.js`

**Features**:
- List all user orders
- Order status badges
- Filter by status
- Navigate to order details
- Pull to refresh

**Order Statuses**:
- Pending (yellow)
- Processing (blue)
- Shipping (purple)
- Completed (green)
- Cancelled (red)

### OrderDetailScreen

**File**: `src/screens/OrderDetailScreen.js`

**Features**:
- Order information
- Products list with quantities
- Payment details
- Shipping information
- Order timeline
- Cancel order (if pending)

### ProfileScreen

**File**: `src/screens/ProfileScreen.js`

**Features**:
- User information
- Edit profile
- Order history summary
- Settings
- Logout button

### LivestreamScreen

**File**: `src/screens/LivestreamScreen.js`

**Features**:
- Browse active/past streams
- Watch live stream
- Live chat integration
- Like/unlike stream
- View pinned products
- Add products to cart from stream

**Video Player**: Uses native video component or third-party library

**WebSocket Integration**:
```javascript
import { useState, useEffect } from 'react';

function LivestreamScreen() {
  const [ws, setWs] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const [viewers, setViewers] = useState(0);
  const [chatMessages, setChatMessages] = useState([]);

  useEffect(() => {
    // Connect to WebSocket
    const websocket = new WebSocket('ws://localhost:3000');
    
    websocket.onopen = () => {
      // Register connection
      websocket.send(JSON.stringify({
        type: 'register',
        sessionId: generateSessionId(),
        token: getToken()
      }));
    };
    
    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'stream_started':
          setIsLive(true);
          break;
        case 'stream_update':
          setViewers(data.viewerCount);
          break;
        case 'chat_message':
          setChatMessages(prev => [...prev, data]);
          break;
      }
    };
    
    setWs(websocket);
    
    return () => {
      websocket.close();
    };
  }, []);

  function sendMessage(message) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'chat_message',
        username: user.username,
        message: message,
        timestamp: new Date().toISOString()
      }));
    }
  }

  return (
    <View>
      <Video source={{ uri: streamUrl }} />
      <Text>Viewers: {viewers}</Text>
      <ChatView messages={chatMessages} onSend={sendMessage} />
    </View>
  );
}
```

## API Service

**File**: `src/services/api.js`

**Purpose**: Centralized API client with authentication.

```javascript
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to all requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear auth data and redirect to login
      await AsyncStorage.multiRemove(['token', 'userId', 'role']);
      // Navigation.navigate('Login');
    }
    return Promise.reject(error);
  }
);

export default api;
```

**Usage in Components**:
```javascript
import api from '../services/api';

// Get products
const products = await api.get('/products');

// Create order
const order = await api.post('/orders', orderData);
```

## Constants

**File**: `src/constants/index.js`

```javascript
export const COLORS = {
  primary: '#4F46E5',
  secondary: '#06B6D4',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  white: '#FFFFFF',
  black: '#000000',
  gray: '#6B7280',
  lightGray: '#F3F4F6',
  background: '#F9FAFB'
};

export const API_URL = 'http://localhost:3000';
export const WS_URL = 'ws://localhost:3000';
```

## Styling

### React Native StyleSheet

```javascript
import { StyleSheet } from 'react-native';
import { COLORS } from '../constants';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center'
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold'
  }
});
```

## State Management

### Local State (useState)

```javascript
import { useState } from 'react';

function ProductDetail() {
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
}
```

### AsyncStorage (Persistent)

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Store data
await AsyncStorage.setItem('key', JSON.stringify(data));

// Retrieve data
const data = await AsyncStorage.getItem('key');
const parsedData = data ? JSON.parse(data) : null;

// Remove data
await AsyncStorage.removeItem('key');

// Clear all
await AsyncStorage.clear();
```

### Context API (Global State)

Used for:
- Authentication state
- User information
- Cart (optional)

## Image Handling

### Expo Image Picker

```javascript
import * as ImagePicker from 'expo-image-picker';

async function pickImage() {
  // Request permission
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
  if (status !== 'granted') {
    Alert.alert('Permission needed', 'Please grant camera roll permission');
    return;
  }
  
  // Pick image
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 1
  });
  
  if (!result.canceled) {
    setImage(result.assets[0].uri);
  }
}
```

## Running the App

### Development

```bash
# Install dependencies
npm install

# Start Expo
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on web
npm run web
```

### Building for Production

```bash
# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```

## App Configuration

**File**: `app.json`

```json
{
  "expo": {
    "name": "Wrencos",
    "slug": "wrencos-customer",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.wrencos.customer"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "package": "com.wrencos.customer"
    }
  }
}
```

## Performance Optimizations

1. **FlatList Optimization**:
```javascript
<FlatList
  data={products}
  renderItem={renderProduct}
  keyExtractor={item => item._id}
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={10}
  initialNumToRender={6}
/>
```

2. **Image Optimization**:
- Use optimized image sizes
- Implement lazy loading
- Cache images

3. **Memoization**:
```javascript
import { useMemo, useCallback } from 'react';

const sortedProducts = useMemo(() => 
  products.sort((a, b) => a.price - b.price),
  [products]
);

const handlePress = useCallback(() => {
  // Handle press
}, [dependencies]);
```

## Error Handling

```javascript
try {
  const response = await api.get('/products');
  setProducts(response.data);
} catch (error) {
  if (error.response) {
    // Server responded with error
    Alert.alert('Error', error.response.data.message);
  } else if (error.request) {
    // Request made but no response
    Alert.alert('Network Error', 'Please check your connection');
  } else {
    // Something else happened
    Alert.alert('Error', error.message);
  }
}
```

## Testing

```bash
# Run tests
npm test
```

## Platform-Specific Code

```javascript
import { Platform } from 'react-native';

const styles = StyleSheet.create({
  container: {
    marginTop: Platform.OS === 'ios' ? 20 : 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3
      },
      android: {
        elevation: 5
      }
    })
  }
});
```

## Common Issues & Solutions

### 1. Metro Bundler Issues

```bash
# Clear cache
npm start -- --reset-cache
```

### 2. Android Build Issues

```bash
cd android
./gradlew clean
cd ..
npm run android
```

### 3. iOS Build Issues

```bash
cd ios
pod install
cd ..
npm run ios
```

## Future Enhancements

- [ ] Push notifications
- [ ] Offline mode
- [ ] Biometric authentication
- [ ] Dark mode
- [ ] Multiple languages
- [ ] Payment gateway integration
- [ ] Social sharing
- [ ] Product reviews
- [ ] Wishlist feature
- [ ] Barcode scanner
