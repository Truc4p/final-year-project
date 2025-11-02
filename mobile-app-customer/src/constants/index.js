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

// Theme colors - Matching frontend website theme
export const COLORS = {
  // Primary - Modern Pink Color Palette
  primary: '#C97F98',        // primary-500
  primaryLight: '#F0D7CC',   // primary-300
  primaryDark: '#A44A6B',    // primary-600
  primaryDarker: '#8C3154',  // primary-700
  
  // Secondary - Slate Gray Palette
  secondary: '#64748b',      // secondary-500
  secondaryLight: '#e2e8f0', // secondary-200
  secondaryDark: '#475569',  // secondary-600
  
  // Accent colors
  accent: '#ec4899',         // pink accent
  
  // Background colors
  background: '#f8fafc',     // secondary-50
  backgroundAlt: '#f1f5f9',  // secondary-100
  
  // Basic colors
  white: '#FFFFFF',
  black: '#000000',
  
  // Gray shades
  gray: '#94a3b8',           // secondary-400
  lightGray: '#cbd5e1',      // secondary-300
  darkGray: '#334155',       // secondary-700
  
  // Status colors
  success: '#008000',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  
  // Text colors
  text: '#0f172a',           // secondary-900
  textSecondary: '#64748b',  // secondary-500
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
