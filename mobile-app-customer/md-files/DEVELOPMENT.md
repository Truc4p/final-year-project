# Development Guide

## Development Workflow

### 1. Setup Development Environment

```bash
# Install Expo CLI globally (if not already installed)
npm install -g expo-cli

# Install dependencies
npm install

# Start development server
npm start
```

### 2. Project Structure Explanation

```
src/
├── constants/           # Configuration and constants
│   └── index.js        # API URLs, colors, status values
├── screens/            # All screen components
│   ├── Auth/           # Login, Register
│   ├── Products/       # Home, ProductDetail
│   ├── Cart/           # Shopping cart
│   ├── Orders/         # Order history and details
│   └── Profile/        # User profile
├── services/           # API communication layer
│   ├── api.js         # Axios configuration with interceptors
│   ├── authService.js  # Authentication API calls
│   ├── productService.js # Product API calls
│   └── orderService.js # Order API calls
└── utils/              # Utility functions
    └── storage.js      # AsyncStorage wrapper
```

### 3. Adding a New Screen

1. Create screen component in `src/screens/`
2. Add route in `App.js` navigation
3. Import and add to appropriate navigator (Stack or Tab)

Example:
```javascript
// In App.js
import NewScreen from './src/screens/NewScreen';

// Add to navigator
<Stack.Screen name="NewScreen" component={NewScreen} />
```

### 4. Adding a New API Service

1. Create service file in `src/services/`
2. Import `api` instance
3. Export service functions

Example:
```javascript
// src/services/newService.js
import api from './api';
import { API_ENDPOINTS } from '../constants';

export const NewService = {
  async getData() {
    try {
      const response = await api.get(API_ENDPOINTS.NEW_ENDPOINT);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};
```

### 5. State Management

Currently using:
- React useState for local state
- AsyncStorage for persistence
- Props for component communication

For larger apps, consider:
- Redux or Zustand for global state
- React Query for server state
- Context API for theme/auth state

### 6. Styling Guidelines

- Use constants from `src/constants/index.js` for colors
- Follow consistent spacing (multiples of 4 or 8)
- Use StyleSheet.create for performance
- Keep styles at bottom of component files

Example:
```javascript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: COLORS.background,
  },
});
```

## Testing

### Manual Testing Checklist

- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Register new account
- [ ] Browse products
- [ ] Search products
- [ ] Filter by category
- [ ] View product details
- [ ] Add to cart
- [ ] Update cart quantities
- [ ] Remove from cart
- [ ] Checkout with COD
- [ ] Checkout with Online Payment
- [ ] View order history
- [ ] View order details
- [ ] Cancel order
- [ ] Logout

### Testing on Different Devices

**iOS Simulator:**
```bash
npm start
# Press 'i' to open iOS simulator
```

**Android Emulator:**
```bash
npm start
# Press 'a' to open Android emulator
```

**Physical Device:**
1. Install Expo Go app
2. Scan QR code from terminal
3. Ensure device and computer are on same network

## Common Development Tasks

### Clearing Cache
```bash
expo start -c
```

### Updating Dependencies
```bash
npm update
expo upgrade
```

### Debugging

**Console Logs:**
- Use `console.log()` - visible in terminal
- Use React Native Debugger for better experience

**Network Debugging:**
- Check API calls in terminal output
- Use React Native Debugger Network tab
- Verify backend is responding correctly

**Common Issues:**

1. **"Network request failed"**
   - Check API_BASE_URL is correct
   - Verify backend is running
   - Ensure devices are on same network

2. **"Unable to resolve module"**
   - Delete node_modules and reinstall
   - Clear Metro cache

3. **Images not loading**
   - Check image URLs in API response
   - Verify backend serves static files
   - Check imageUrl path construction

## Code Style

### Component Structure
```javascript
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ComponentName() {
  // 1. State declarations
  const [state, setState] = useState(initialValue);

  // 2. Effects
  useEffect(() => {
    // effect code
  }, [dependencies]);

  // 3. Event handlers
  const handleEvent = () => {
    // handler code
  };

  // 4. Render helpers
  const renderItem = () => {
    // render code
  };

  // 5. Main render
  return (
    <View style={styles.container}>
      {/* JSX */}
    </View>
  );
}

// 6. Styles
const styles = StyleSheet.create({
  container: {
    // styles
  },
});
```

### Naming Conventions
- Components: PascalCase (e.g., `ProductCard`)
- Files: PascalCase for components (e.g., `ProductCard.js`)
- Variables/Functions: camelCase (e.g., `handleSubmit`)
- Constants: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)

## Performance Tips

1. **Optimize Images**
   - Use appropriate image sizes
   - Consider image caching libraries
   - Use `resizeMode` appropriately

2. **List Optimization**
   - Use `FlatList` instead of `ScrollView` for long lists
   - Implement `keyExtractor`
   - Use `getItemLayout` when possible

3. **Avoid Unnecessary Re-renders**
   - Use `useMemo` and `useCallback`
   - Extract components when appropriate
   - Use React.memo for pure components

## Deployment

### Building for Production

**Android:**
```bash
expo build:android
```

**iOS:**
```bash
expo build:ios
```

### Publishing Updates
```bash
expo publish
```

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Expo Examples](https://docs.expo.dev/guides/examples/)

## Getting Help

1. Check the README.md
2. Review the Expo documentation
3. Search for similar issues on GitHub
4. Ask the development team
