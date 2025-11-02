// API Configuration
// For testing on physical device (recommended)
// IMPORTANT: Backend routes do NOT use /api prefix, so we connect directly to the base URL
export const API_BASE_URL = 'http://192.168.88.55:3000';

// Alternative configurations:
// For iOS Simulator: export const API_BASE_URL = 'http://localhost:3000';
// For Android Emulator: export const API_BASE_URL = 'http://10.0.2.2:3000';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  
  // Products
  PRODUCTS: '/products',
  PRODUCT_BY_ID: (id) => `/products/${id}`,
  
  // Categories
  CATEGORIES: '/categories',
  CATEGORY_BY_ID: (id) => `/categories/${id}`,
  
  // Orders
  ORDERS: '/orders',
  ORDER_BY_ID: (id) => `/orders/order/${id}`,
  USER_ORDERS: (userId) => `/orders/user/${userId}`,
};

// Theme colors
export const COLORS = {
  primary: '#4CAF50',
  secondary: '#FFC107',
  accent: '#FF5722',
  background: '#F5F5F5',
  white: '#FFFFFF',
  black: '#000000',
  gray: '#9E9E9E',
  lightGray: '#E0E0E0',
  darkGray: '#424242',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3',
  text: '#212121',
  textSecondary: '#757575',
};

// Order status
export const ORDER_STATUS = {
  PROCESSING: 'processing',
  SHIPPING: 'shipping',
  COMPLETED: 'completed',
};

// Payment methods
export const PAYMENT_METHODS = {
  COD: 'cod',
  ONLINE: 'online',
};
