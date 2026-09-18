import api from './api';

export const demoService = {
  // Load full realistic demo dataset for viva demonstration
  seed: async () => {
    const response = await api.post('/demo/seed');
    return response.data;
  },

  // Reset database back to clean baseline state
  reset: async () => {
    const response = await api.post('/demo/reset');
    return response.data;
  },

  // Check current dataset counts and status
  getStatus: async () => {
    const response = await api.get('/demo/status');
    return response.data;
  }
};
