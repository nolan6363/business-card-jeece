import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const login = (password) => api.post('/auth/login', { password });

// Cards
export const getCards = () => api.get('/cards');
export const getCard = (id) => api.get(`/cards/${id}`);
export const createCard = (formData) => api.post('/cards', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const updateCard = (id, formData) => api.put(`/cards/${id}`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const deleteCard = (id) => api.delete(`/cards/${id}`);

// Scans
export const recordScan = (id) => api.post(`/cards/${id}/scan`);

// Stats
export const getGlobalStats = () => api.get('/stats');
export const getCardStats = (id) => api.get(`/stats/${id}`);

// vCard download URL
export const getVCardUrl = (id) => `${API_URL}/api/cards/${id}/vcard`;

export default api;
