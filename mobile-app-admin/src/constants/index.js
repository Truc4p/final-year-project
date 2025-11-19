// API Configuration
export const API_BASE_URL = 'http://192.168.88.55:3000'; // Change to your backend IP
export const WS_BASE_URL = 'ws://192.168.88.55:3000'; // WebSocket URL

// Colors
export const COLORS = {
  primary: '#8BB8A8',
  primaryLight: '#D8E9E4',
  primaryDark: '#6B9A8A',
  primaryDarker: '#4A7A6A',
  secondary: '#F1F2CE',
  accent: '#F7E0E5',
  accentDark: '#E5C8CE',
  background: '#F5F5F5',
  backgroundAlt: '#FAFAFA',
  white: '#FFFFFF',
  text: '#333333',
  textSecondary: '#666666',
  gray: '#999999',
  lightGray: '#E0E0E0',
  error: '#FF4444',
  success: '#4CAF50',
  warning: '#FFA726',
  info: '#29B6F6',
};

// Stream Quality Settings
export const STREAM_QUALITY = {
  LOW: { width: 640, height: 480, bitrate: 500000 },
  MEDIUM: { width: 1280, height: 720, bitrate: 1500000 },
  HIGH: { width: 1920, height: 1080, bitrate: 3000000 },
};
