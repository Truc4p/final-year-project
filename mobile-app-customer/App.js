import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View, Text, LogBox } from 'react-native';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { COLORS } from './src/constants';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import ProductDetailScreen from './src/screens/ProductDetailScreen';
import CartScreen from './src/screens/CartScreen';
import OrdersScreen from './src/screens/OrdersScreen';
import OrderDetailScreen from './src/screens/OrderDetailScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import LivestreamScreen from './src/screens/LivestreamScreen';

// Skin Study Components
import AIDermatologyExpert from './src/components/skinStudy/AIDermatologyExpert';
import LiveChatAI from './src/components/skinStudy/LiveChatAI';

// Suppress defaultProps warnings from react-native-render-html library
LogBox.ignoreLogs([
  'Warning: TRenderEngineProvider: Support for defaultProps',
  'Warning: MemoizedTNodeRenderer: Support for defaultProps',
  'Warning: TNodeChildrenRenderer: Support for defaultProps',
  'Warning: bound renderChildren: Support for defaultProps',
]);

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.white,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen}
        options={{ title: 'Create Account' }}
      />
    </Stack.Navigator>
  );
}

function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.white,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen 
        name="HomeMain" 
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="ProductDetail" 
        component={ProductDetailScreen}
        options={{ title: 'Product Details' }}
      />
      <Stack.Screen 
        name="Cart" 
        component={CartScreen}
        options={{ title: 'Shopping Cart' }}
      />
    </Stack.Navigator>
  );
}

function OrdersStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.white,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen 
        name="OrdersList" 
        component={OrdersScreen}
        options={{ title: 'My Orders' }}
      />
      <Stack.Screen 
        name="OrderDetail" 
        component={OrderDetailScreen}
        options={{ title: 'Order Details' }}
      />
    </Stack.Navigator>
  );
}

function SkinStudyStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#A44A6B' },
        headerTintColor: COLORS.white,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen 
        name="AIDermatologyExpert" 
        component={AIDermatologyExpert}
        options={{ title: 'AI Dermatology Expert' }}
      />
      <Stack.Screen 
        name="LiveChatAI" 
        component={LiveChatAI}
        options={{ 
          title: 'Live Chat with AI',
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray,
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.white,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStack}
        options={{
          headerShown: false,
          tabBarLabel: 'Shop',
          tabBarIcon: ({ color, size }) => <HomeIcon color={color} size={size} />,
        }}
      />
      <Tab.Screen 
        name="Livestream" 
        component={LivestreamScreen}
        options={{
          title: 'Live Stream',
          tabBarLabel: 'Live',
          tabBarIcon: ({ color, size }) => <LivestreamIcon color={color} size={size} />,
        }}
      />
      <Tab.Screen 
        name="Cart" 
        component={CartScreen}
        options={{
          tabBarLabel: 'Cart',
          tabBarIcon: ({ color, size }) => <CartIcon color={color} size={size} />,
        }}
      />
      <Tab.Screen 
        name="Orders" 
        component={OrdersStack}
        options={{
          headerShown: false,
          tabBarLabel: 'Orders',
          tabBarIcon: ({ color, size }) => <OrdersIcon color={color} size={size} />,
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => <ProfileIcon color={color} size={size} />,
        }}
      />
      <Tab.Screen 
        name="SkinStudy" 
        component={SkinStudyStack}
        options={{
          headerShown: false,
          tabBarLabel: 'Skin Study',
          tabBarIcon: ({ color, size }) => <SkinStudyIcon color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}

// Simple icon components (you can replace with actual icons from react-native-vector-icons)
const HomeIcon = ({ color, size }) => (
  <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ fontSize: size, color }}>🏠</Text>
  </View>
);

const LivestreamIcon = ({ color, size }) => (
  <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ fontSize: size, color }}>📹</Text>
  </View>
);

const CartIcon = ({ color, size }) => (
  <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ fontSize: size, color }}>🛒</Text>
  </View>
);

const OrdersIcon = ({ color, size }) => (
  <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ fontSize: size, color }}>📦</Text>
  </View>
);

const ProfileIcon = ({ color, size }) => (
  <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ fontSize: size, color }}>👤</Text>
  </View>
);

const SkinStudyIcon = ({ color, size }) => (
  <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ fontSize: size, color }}>✨</Text>
  </View>
);

function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
