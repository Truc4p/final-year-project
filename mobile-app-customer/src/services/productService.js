import api from './api';
import { API_ENDPOINTS } from '../constants';

export const ProductService = {
  async getAllProducts() {
    try {
      const response = await api.get(API_ENDPOINTS.PRODUCTS);
      return response.data;
    } catch (error) {
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
      const response = await api.get(API_ENDPOINTS.CATEGORIES);
      return response.data;
    } catch (error) {
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
