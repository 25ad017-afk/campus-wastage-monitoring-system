import api from './api';

export const authService = {
  // Login user and return data + token
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  // Register user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Get current logged-in profile
  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};
