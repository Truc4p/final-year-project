import axios from 'axios';
import { API_BASE_URL } from '../constants';
import { StorageService } from '../utils/storage';

// Create axios instance with timeout configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
  // Add retry configuration for network errors
  validateStatus: function (status) {
    return status >= 200 && status < 500; // Don't reject on 4xx errors
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  async (config) => {
    const token = await StorageService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear storage
      await StorageService.clearAll();
    }
    return Promise.reject(error);
  }
);

export default api;
