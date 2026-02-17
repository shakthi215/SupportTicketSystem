import axios from 'axios';

// Configure axios instance
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Response interceptor for uniform error propagation
api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

// Ticket API functions
export const ticketAPI = {
  // Get all tickets with optional filters
  getTickets: async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.category) params.append('category', filters.category);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    
    const response = await api.get(`/tickets/?${params.toString()}`);
    return response.data;
  },

  // Create a new ticket
  createTicket: async (ticketData) => {
    const response = await api.post('/tickets/', ticketData);
    return response.data;
  },

  // Update ticket (PATCH)
  updateTicket: async (id, updates) => {
    const response = await api.patch(`/tickets/${id}/`, updates);
    return response.data;
  },

  // Get ticket statistics
  getStats: async () => {
    const response = await api.get('/tickets/stats/');
    return response.data;
  },

  // Classify ticket description using LLM
  classifyTicket: async (description) => {
    const response = await api.post('/tickets/classify/', { description });
    return response.data;
  },
};

export default api;
