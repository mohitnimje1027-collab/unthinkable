import axios from 'axios';

// In production (Vercel), VITE_API_URL is set to the Render backend URL.
// In development, it falls back to '' so the Vite proxy handles /api requests.
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
});

// Attach JWT token to every request automatically
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;
