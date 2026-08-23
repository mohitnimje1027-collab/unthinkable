import axios from 'axios';

export const getNotices = () => axios.get('/api/notices');
export const createNotice = (data) => axios.post('/api/notices', data);
export const deleteNotice = (id) => axios.delete(`/api/notices/${id}`);
