import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

export const getDashboardData = async () => {
  const response = await api.get('/dashboard');
  return response.data;
};

export const getSellers = async (params = {}) => {
  const response = await api.get('/sellers', { params });
  return response.data;
};

export const getSellerDetails = async (sellerId) => {
  const response = await api.get(`/sellers/${sellerId}`);
  return response.data;
};

export const getCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};

export const getCustomerSatisfaction = async () => {
  const response = await api.get('/customer-satisfaction');
  return response.data;
};

export const getDeliveryPerformance = async () => {
  const response = await api.get('/delivery-performance');
  return response.data;
};

export const getPerformanceDistribution = async () => {
  const response = await api.get('/performance-distribution');
  return response.data;
};

export const predictPerformance = async (inputData) => {
  const response = await api.post('/predict', inputData);
  return response.data;
};

export default api;
