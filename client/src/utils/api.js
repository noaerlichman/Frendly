import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Auth services
export const authService = {
  // Register a new user
  register: async (userData) => {
    try {
      const response = await api.post('/api/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error connecting to server' };
    }
  },

  // Login a user
  login: async (userData) => {
    try {
      console.log('api url: ', API_URL);
      const response = await api.post('/api/auth/login', userData);
      
      // Store the token in localStorage for future requests
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error connecting to server' };
    }
  },

  // Logout a user
  logout: () => {
    localStorage.removeItem('token');
  },
  
  // Get current auth token
  getToken: () => {
    return localStorage.getItem('token');
  }
};

// Add an interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api; 