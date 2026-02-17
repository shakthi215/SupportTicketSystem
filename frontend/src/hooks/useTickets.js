import { useState, useEffect, useCallback } from 'react';
import { ticketAPI } from '../services/api';

export const useTickets = (initialFilters = {}) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await ticketAPI.getTickets(filters);
      setTickets(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const createTicket = async (ticketData) => {
    try {
      const newTicket = await ticketAPI.createTicket(ticketData);
      setTickets(prev => [newTicket, ...prev]);
      return newTicket;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to create ticket');
    }
  };

  const updateTicket = async (id, updates) => {
    try {
      const updatedTicket = await ticketAPI.updateTicket(id, updates);
      setTickets(prev => 
        prev.map(ticket => ticket.id === id ? updatedTicket : ticket)
      );
      return updatedTicket;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to update ticket');
    }
  };

  return {
    tickets,
    loading,
    error,
    filters,
    setFilters,
    createTicket,
    updateTicket,
    refresh: fetchTickets,
  };
};

export const useStats = (refreshTrigger = 0) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await ticketAPI.getStats();
        setStats(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [refreshTrigger]);

  return { stats, loading, error };
};
