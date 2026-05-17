import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:5000';
axios.defaults.timeout = 8000; // 8 seconds max per request

axios.interceptors.response.use(
  response => response,
  error => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timed out:', error.config?.url);
    }
    return Promise.reject(error);
  }
);

export default axios;