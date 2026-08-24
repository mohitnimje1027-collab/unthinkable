import axios from './axios';

export const createComplaint = (formData) =>
  axios.post('/api/complaints', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

export const getMyComplaints = () => axios.get('/api/complaints/my');
export const getAllComplaints = (params) => axios.get('/api/complaints', { params });
export const getComplaint = (id) => axios.get(`/api/complaints/${id}`);
export const updateComplaint = (id, data) => axios.patch(`/api/complaints/${id}`, data);
export const flagOverdue = (id, is_overdue) => axios.patch(`/api/complaints/${id}/overdue`, { is_overdue });
export const detectOverdue = () => axios.post('/api/complaints/detect-overdue');
