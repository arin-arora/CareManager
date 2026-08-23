import axios from 'axios';

const NODE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';

const getHeaders = (token) => ({
  headers: { Authorization: `Bearer ${token}` }
});

export const apiService = {
  // Auth APIs
  fetchUser: async (token) => {
    const response = await axios.get(`${NODE_API_URL}/api/auth/user`, getHeaders(token));
    return response.data;
  },
  
  login: async (authForm) => {
    const response = await axios.post(`${NODE_API_URL}/api/auth/login`, authForm);
    return response.data;
  },

  signup: async (authForm) => {
    const response = await axios.post(`${NODE_API_URL}/api/auth/signup`, authForm);
    return response.data;
  },

  verifyEmail: async (token) => {
    const response = await axios.post(`${NODE_API_URL}/api/auth/verify-email`, { token });
    return response.data;
  },

  resendVerification: async (email) => {
    const response = await axios.post(`${NODE_API_URL}/api/auth/resend-verification`, { email });
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await axios.post(`${NODE_API_URL}/api/auth/forgot-password`, { email });
    return response.data;
  },

  resetPassword: async (token, password) => {
    const response = await axios.post(`${NODE_API_URL}/api/auth/reset-password`, { token, password });
    return response.data;
  },

  // Health check API
  fetchHealthStatus: async () => {
    const response = await axios.get(`${NODE_API_URL}/api/health`);
    return response.data;
  }
};
