import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const ticketService = {
  getTickets: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    
    const queryString = params.toString();
    return api.get(`/tickets/${queryString ? '?' + queryString : ''}`);
  },

  createTicket: (ticketData) => {
    return api.post('/tickets/', ticketData);
  },

  updateTicket: (id, updates) => {
    return api.patch(`/tickets/${id}/`, updates);
  },

  getStats: () => {
    return api.get('/tickets/stats/');
  },

  classifyTicket: (description) => {
    return api.post('/tickets/classify/', { description });
  },
};

export default api;
