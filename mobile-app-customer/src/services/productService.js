import api from './api';
import { API_ENDPOINTS } from '../constants';

export const ProductService = {
  async getAllProducts() {
    try {
      console.log('Fetching products from:', API_ENDPOINTS.PRODUCTS);
      const response = await api.get(API_ENDPOINTS.PRODUCTS);
      console.log('Products API response status:', response.status);
      console.log('Products API response data length:', response.data?.length);
      return response.data;
    } catch (error) {
      console.error('ProductService.getAllProducts error:', error);
      console.error('Error response:', error.response?.data);
      throw error.response?.data || error;
    }
  },

  async getProductById(id) {
    try {
      const response = await api.get(API_ENDPOINTS.PRODUCT_BY_ID(id));
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async searchProducts(query) {
    try {
      const response = await api.get(`${API_ENDPOINTS.PRODUCTS}?search=${query}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export const CategoryService = {
  async getAllCategories() {
    try {
      console.log('Fetching categories from:', API_ENDPOINTS.CATEGORIES);
      const response = await api.get(API_ENDPOINTS.CATEGORIES);
      console.log('Categories API response status:', response.status);
      console.log('Categories API response data length:', response.data?.length);
      return response.data;
    } catch (error) {
      console.error('CategoryService.getAllCategories error:', error);
      console.error('Error response:', error.response?.data);
      throw error.response?.data || error;
    }
  },

  async getCategoryById(id) {
    try {
      const response = await api.get(API_ENDPOINTS.CATEGORY_BY_ID(id));
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};
