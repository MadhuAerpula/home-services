import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL || import.meta.env.VITE_API_BASE_URL,
  withCredentials: true
});

export default api;
