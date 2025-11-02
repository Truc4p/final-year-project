import api from './api';
import { API_ENDPOINTS } from '../constants';
import { StorageService } from '../utils/storage';

export const AuthService = {
  async login(username, password) {
    try {
      console.log('=== LOGIN API CALL ===');
      console.log('Username:', username);
      console.log('API URL:', API_ENDPOINTS.LOGIN);
      
      const response = await api.post(API_ENDPOINTS.LOGIN, {
        username,
        password,
      });
      
      console.log('Login API response status:', response.status);
      console.log('Login API response data:', JSON.stringify(response.data, null, 2));
      
      if (response.data.token) {
        console.log('Token received, saving to storage...');
        await StorageService.saveToken(response.data.token);
        
        // Backend returns { token, role, userId }, so we need to construct the user object
        const userData = {
          id: response.data.userId,
          username: username,
          role: response.data.role
        };
        console.log('Constructed user data:', JSON.stringify(userData, null, 2));
        
        await StorageService.saveUser(userData);
        console.log('Token and user saved successfully');
        
        // Return data in the format expected by LoginScreen
        return {
          token: response.data.token,
          user: userData
        };
      } else {
        console.warn('⚠️ No token in response');
        throw new Error('No token received from server');
      }
    } catch (error) {
      console.error('=== LOGIN API ERROR ===');
      console.error('Error details:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.message);
      throw error.response?.data || error;
    }
  },

  async register(username, password, email) {
    try {
      console.log('=== REGISTRATION ATTEMPT ===');
      console.log('Username:', username);
      console.log('Email:', email);
      console.log('API URL:', API_ENDPOINTS.REGISTER);
      
      const response = await api.post(API_ENDPOINTS.REGISTER, {
        username,
        password,
        email,
        role: 'customer',
      });
      
      console.log('Registration successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('=== REGISTRATION ERROR ===');
      console.error('Error details:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error message:', error.message);
      throw error.response?.data || error;
    }
  },

  async logout() {
    await StorageService.clearAll();
  },

  async getCurrentUser() {
    return await StorageService.getUser();
  },

  async isAuthenticated() {
    const token = await StorageService.getToken();
    return !!token;
  },
};
