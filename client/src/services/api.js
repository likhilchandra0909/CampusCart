import axios from 'axios';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  googleLogin: (token) => api.post('/auth/google', { token }),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  toggle2FA: () => api.put('/auth/2fa')
};

export const productService = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (formData) => api.post('/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, formData) => api.put(`/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

export const wishlistService = {
  get: () => api.get('/wishlist'),
  add: (id) => api.post(`/wishlist/${id}`),
  remove: (id) => api.delete(`/wishlist/${id}`)
};

export const chatService = {
  getConversations: () => api.get('/chat'),
  createConversation: (sellerId, productId) => api.post('/chat', { sellerId, productId }),
  getMessages: (conversationId) => api.get(`/chat/messages/${conversationId}`),
  sendMessage: (messageData) => api.post('/chat/messages', messageData),
  markAsSeen: (conversationId) => api.put(`/chat/seen/${conversationId}`)
};

export const notificationService = {
  get: () => api.get('/notifications'),
  read: (id) => api.put(`/notifications/read/${id}`),
  readAll: () => api.put('/notifications/read-all')
};

export const dashboardService = {
  getStats: () => api.get('/dashboard')
};


export default api;
