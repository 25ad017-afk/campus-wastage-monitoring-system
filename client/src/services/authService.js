import api from './api';

export const authService = {
  // Official Google Identity / OAuth authentication
  googleLogin: async (credential, role = 'STUDENT') => {
    const response = await api.post('/auth/google', { credential, role });
    return response.data;
  },

  // Send 6-digit OTP verification email
  sendOtp: async (email, role = 'STUDENT') => {
    const response = await api.post('/auth/send-otp', { email, role });
    return response.data;
  },

  // Verify 6-digit OTP code
  verifyOtp: async (email, otp, role = 'STUDENT') => {
    const response = await api.post('/auth/verify-otp', { email, otp, role });
    return response.data;
  },

  // Login user and return data + JWT token
  login: async (email, password, role = 'STUDENT', otp = '') => {
    const response = await api.post('/auth/login', { email, password, role, otp });
    return response.data;
  },

  // Register new user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Get current logged-in profile
  getEmailStatus: async () => {
    const response = await api.get('/auth/email-status');
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};
