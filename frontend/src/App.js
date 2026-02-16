import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import TicketForm from './components/TicketForm';
import TicketList from './components/TicketList';
import StatsCard from './components/StatsCard';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

function App() {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    priority: '',
    status: '',
    search: ''
  });
  const [loading, setLoading] = useState(false);

  // Fetch tickets based on filters
  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);

      const response = await axios.get(`${API_BASE_URL}/tickets/?${params.toString()}`);
      setTickets(response.data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tickets/stats/`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Initial load
  useEffect(() => {
    fetchTickets();
    fetchStats();
  }, []);

  // Reload when filters change
  useEffect(() => {
    fetchTickets();
  }, [filters]);

  // Handle new ticket submission
  const handleTicketCreated = () => {
    fetchTickets();
    fetchStats();
  };

  // Handle ticket status update
  const handleTicketUpdate = async (ticketId, newStatus) => {
    try {
      await axios.patch(`${API_BASE_URL}/tickets/${ticketId}/`, {
        status: newStatus
      });
      fetchTickets();
      fetchStats();
    } catch (error) {
      console.error('Error updating ticket:', error);
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>🎫 Support Ticket System</h1>
        <p>AI-Powered Ticket Classification & Management</p>
      </header>

      <div className="container">
        {/* Stats Dashboard */}
        <section className="stats-section">
          <h2>📊 Dashboard</h2>
          {stats ? <StatsCard stats={stats} /> : <div className="loading">Loading stats...</div>}
        </section>

        {/* Ticket Submission Form */}
        <section className="form-section">
          <h2>✍️ Submit New Ticket</h2>
          <TicketForm onTicketCreated={handleTicketCreated} apiBaseUrl={API_BASE_URL} />
        </section>

        {/* Filters */}
        <section className="filters-section">
          <h2>🔍 Filter Tickets</h2>
          <div className="filters">
            <div className="filter-group">
              <label>Search:</label>
              <input
                type="text"
                placeholder="Search title or description..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>

            <div className="filter-group">
              <label>Category:</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              >
                <option value="">All Categories</option>
                <option value="billing">Billing</option>
                <option value="technical">Technical</option>
                <option value="account">Account</option>
                <option value="general">General</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Priority:</label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              >
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Status:</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="">All Statuses</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <button
              className="clear-filters"
              onClick={() => setFilters({ category: '', priority: '', status: '', search: '' })}
            >
              Clear Filters
            </button>
          </div>
        </section>

        {/* Tickets List */}
        <section className="tickets-section">
          <h2>📋 Tickets ({tickets.length})</h2>
          {loading ? (
            <div className="loading">Loading tickets...</div>
          ) : (
            <TicketList tickets={tickets} onUpdateStatus={handleTicketUpdate} />
          )}
        </section>
      </div>
    </div>
  );
}

export default App;
