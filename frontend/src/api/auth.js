import axios from 'axios';

export const register = (data) => axios.post('/api/auth/register', data);
export const login = (data) => axios.post('/api/auth/login', data);
export const getMe = () => axios.get('/api/auth/me');
