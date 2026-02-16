import React, { useState, useEffect } from 'react';
import { ticketService } from '../services/api';
import './TicketList.css';

const TicketList = ({ refreshTrigger }) => {
  const [tickets, setTickets] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    priority: '',
    status: '',
    search: '',
  });
  const [loading, setLoading] = useState(true);
  const [expandedTicket, setExpandedTicket] = useState(null);

  useEffect(() => {
    fetchTickets();
  }, [filters, refreshTrigger]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const response = await ticketService.getTickets(filters);
      setTickets(response.data);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      await ticketService.updateTicket(ticketId, { status: newStatus });
      fetchTickets(); // Refresh list
    } catch (error) {
      console.error('Failed to update ticket:', error);
    }
  };

  const toggleTicket = (ticketId) => {
    setExpandedTicket(expandedTicket === ticketId ? null : ticketId);
  };

  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getPriorityClass = (priority) => {
    const classes = {
      low: 'priority-low',
      medium: 'priority-medium',
      high: 'priority-high',
      critical: 'priority-critical',
    };
    return classes[priority] || '';
  };

  const getStatusClass = (status) => {
    const classes = {
      open: 'status-open',
      in_progress: 'status-in-progress',
      resolved: 'status-resolved',
      closed: 'status-closed',
    };
    return classes[status] || '';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  return (
    <div className="ticket-list-container">
      <div className="ticket-list-header">
        <h2>Support Tickets</h2>
        
        <div className="filters">
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Search tickets..."
            className="search-input"
          />
          
          <select
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">All Categories</option>
            <option value="billing">Billing</option>
            <option value="technical">Technical</option>
            <option value="account">Account</option>
            <option value="general">General</option>
          </select>
          
          <select
            name="priority"
            value={filters.priority}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading tickets...</div>
      ) : tickets.length === 0 ? (
        <div className="no-tickets">
          No tickets found. {filters.search || filters.category || filters.priority || filters.status ? 'Try adjusting your filters.' : 'Create your first ticket above!'}
        </div>
      ) : (
        <div className="tickets">
          {tickets.map(ticket => (
            <div key={ticket.id} className="ticket-card">
              <div className="ticket-header" onClick={() => toggleTicket(ticket.id)}>
                <div className="ticket-title-row">
                  <h3 className="ticket-title">{ticket.title}</h3>
                  <span className="ticket-id">#{ticket.id}</span>
                </div>
                
                <div className="ticket-badges">
                  <span className={`badge ${getPriorityClass(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                  <span className={`badge ${getStatusClass(ticket.status)}`}>
                    {ticket.status.replace('_', ' ')}
                  </span>
                  <span className="badge category-badge">
                    {ticket.category}
                  </span>
                </div>
              </div>

              <div className="ticket-description">
                {expandedTicket === ticket.id
                  ? ticket.description
                  : truncateText(ticket.description)}
              </div>

              <div className="ticket-footer">
                <span className="ticket-date">{formatDate(ticket.created_at)}</span>
                
                <div className="ticket-actions">
                  <select
                    value={ticket.status}
                    onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                    className="status-select"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                  
                  <button
                    className="expand-button"
                    onClick={() => toggleTicket(ticket.id)}
                  >
                    {expandedTicket === ticket.id ? 'Show less' : 'Show more'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TicketList;
