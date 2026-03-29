import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8000', // Placeholder backend baseURL
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
