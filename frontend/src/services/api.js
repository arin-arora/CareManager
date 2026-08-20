import axios from 'axios';

const NODE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5051';
const ML_API_URL = import.meta.env.VITE_ML_API_URL || 'http://localhost:8000';

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
  },

  runFullDiagnostics: async () => {
    const response = await axios.post(`${NODE_API_URL}/api/health/run-diagnostics`);
    return response.data;
  },

  // Symptoms APIs
  fetchSymptomHistory: async (token) => {
    const response = await axios.get(`${NODE_API_URL}/api/symptoms`, getHeaders(token));
    return response.data;
  },

  predictSymptom: async (token, payload) => {
    const response = await axios.post(`${NODE_API_URL}/api/symptoms/predict`, payload, getHeaders(token));
    return response.data;
  },

  saveSymptom: async (token, payload) => {
    const response = await axios.post(`${NODE_API_URL}/api/symptoms`, payload, getHeaders(token));
    return response.data;
  },

  // Medications APIs
  fetchMedicines: async (token) => {
    const response = await axios.get(`${NODE_API_URL}/api/medicines`, getHeaders(token));
    return response.data;
  },

  addMedicine: async (token, medForm) => {
    const response = await axios.post(`${NODE_API_URL}/api/medicines`, medForm, getHeaders(token));
    return response.data;
  },

  deleteMedicine: async (token, id) => {
    const response = await axios.delete(`${NODE_API_URL}/api/medicines/${id}`, getHeaders(token));
    return response.data;
  },

  // Lab Reports APIs
  fetchLabReports: async (token) => {
    const response = await axios.get(`${NODE_API_URL}/api/lab-reports`, getHeaders(token));
    return response.data;
  },

  parseLabReport: async (token, payload) => {
    const response = await axios.post(`${NODE_API_URL}/api/lab-reports`, payload, getHeaders(token));
    return response.data;
  }
};
