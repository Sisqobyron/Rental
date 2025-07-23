import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const auth = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
};

// Properties API
export const properties = {
  getAll: () => api.get('/properties'),
  create: (propertyData) => api.post('/properties', propertyData),
  createWithImages: (formData) => api.post('/properties', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  update: (id, propertyData) => api.put(`/properties/${id}`, propertyData),
  delete: (id) => api.delete(`/properties/${id}`),
  getById: (id) => api.get(`/properties/${id}`),
  search: (filters) => api.get('/properties/search', { params: filters }),
  getAvailable: () => api.get('/properties/available'),
  // Image management
  getImages: (propertyId) => api.get(`/properties/${propertyId}/images`),
  uploadImages: (propertyId, formData) => api.post(`/properties/${propertyId}/images`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  deleteImage: (propertyId, imageId) => api.delete(`/properties/${propertyId}/images/${imageId}`),
  setPrimaryImage: (propertyId, imageId) => api.put(`/properties/${propertyId}/images/${imageId}/primary`),
};

// Tenants API
export const tenants = {
  getAll: () => api.get('/tenants'),
  create: (tenantData) => api.post('/tenants', tenantData),
  updateStatus: (id, status) => api.put(`/tenants/${id}/status`, { status }),
  getUsers: () => api.get('/tenants/users'),
  getTenantProperties: () => api.get('/tenants/properties'), // Get properties for current tenant
};

// Payments API
export const payments = {
  getAll: () => api.get('/rent-payments'),
  create: (paymentData) => api.post('/rent-payments', paymentData),
  confirm: (id) => api.put(`/rent-payments/${id}/confirm`),
  reject: (id) => api.put(`/rent-payments/${id}/reject`),
};

// Maintenance API
export const maintenance = {
  getAll: () => api.get('/maintenance-requests'),
  create: (requestData) => api.post('/maintenance-requests', requestData),
  updateStatus: (id, status) => api.put(`/maintenance-requests/${id}/status`, { status }),
};

// Dashboard API
export const dashboard = {
  getStats: () => api.get('/dashboard/stats'),
  getMonthlySummary: () => api.get('/dashboard/monthly-summary'),
};

// Messages API
export const messages = {
  getAll: () => api.get('/messages'),
  send: (messageData) => api.post('/messages', messageData),
  getConversations: () => api.get('/messages/conversations'),
  getConversationMessages: (otherUserId) => api.get(`/messages/conversations/${otherUserId}`),
  markAsRead: (messageId) => api.patch(`/messages/${messageId}/read`),
  getUnreadCount: () => api.get('/messages/unread-count'),
  getLandlords: () => api.get('/messages/landlords'),
};

// Legal Agreements API
export const legalAgreements = {
  getAll: (propertyId) => api.get('/legal-agreements', { params: { propertyId } }),
  create: (agreementData) => api.post('/legal-agreements', agreementData),
  getById: (id) => api.get(`/legal-agreements/${id}`),
  update: (id, agreementData) => api.put(`/legal-agreements/${id}`, agreementData),
  delete: (id) => api.delete(`/legal-agreements/${id}`),
  sign: (id) => api.post(`/legal-agreements/${id}/sign`),
  getTemplate: () => api.get('/legal-agreements/template'),
};

// Export the main api instance
export { api };
export const propertyApi = properties;

export default api;
