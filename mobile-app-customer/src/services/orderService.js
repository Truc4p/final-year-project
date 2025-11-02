import api from './api';
import { API_ENDPOINTS } from '../constants';

export const OrderService = {
  async createOrder(orderData) {
    try {
      const response = await api.post(API_ENDPOINTS.ORDERS, orderData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async getUserOrders(userId) {
    try {
      const response = await api.get(API_ENDPOINTS.USER_ORDERS(userId));
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async getOrderById(orderId) {
    try {
      const response = await api.get(API_ENDPOINTS.ORDER_BY_ID(orderId));
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async cancelOrder(orderId) {
    try {
      const response = await api.delete(`${API_ENDPOINTS.ORDERS}/${orderId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};
