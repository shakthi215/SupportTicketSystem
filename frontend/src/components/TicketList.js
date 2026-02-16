import React, { useState } from 'react';

const TicketList = ({ tickets, onUpdateStatus }) => {
  const [expandedTicket, setExpandedTicket] = useState(null);

  if (tickets.length === 0) {
    return (
      <div className="no-tickets">
        <p>No tickets found. Try adjusting your filters or create a new ticket.</p>
      </div>
    );
  }

  const toggleExpand = (ticketId) => {
    setExpandedTicket(expandedTicket === ticketId ? null : ticketId);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getCategoryBadge = (category) => {
    const colors = {
      billing: '#10b981',
      technical: '#3b82f6',
      account: '#f59e0b',
      general: '#6b7280'
    };
    return colors[category] || '#6b7280';
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      low: '#10b981',
      medium: '#f59e0b',
      high: '#ef4444',
      critical: '#7c2d12'
    };
    return colors[priority] || '#6b7280';
  };

  const getStatusBadge = (status) => {
    const colors = {
      open: '#3b82f6',
      in_progress: '#f59e0b',
      resolved: '#10b981',
      closed: '#6b7280'
    };
    return colors[status] || '#6b7280';
  };

  const handleStatusChange = (ticketId, newStatus) => {
    if (onUpdateStatus) {
      onUpdateStatus(ticketId, newStatus);
    }
  };

  return (
    <div className="ticket-list">
      {tickets.map((ticket) => (
        <div key={ticket.id} className="ticket-card">
          <div className="ticket-header" onClick={() => toggleExpand(ticket.id)}>
            <div className="ticket-title-section">
              <h3>{ticket.title}</h3>
              <span className="ticket-id">#{ticket.id}</span>
            </div>
            <div className="ticket-badges">
              <span
                className="badge"
                style={{ backgroundColor: getCategoryBadge(ticket.category) }}
              >
                {ticket.category}
              </span>
              <span
                className="badge"
                style={{ backgroundColor: getPriorityBadge(ticket.priority) }}
              >
                {ticket.priority}
              </span>
              <span
                className="badge"
                style={{ backgroundColor: getStatusBadge(ticket.status) }}
              >
                {ticket.status.replace('_', ' ')}
              </span>
            </div>
          </div>

          {expandedTicket === ticket.id && (
            <div className="ticket-details">
              <div className="ticket-description">
                <strong>Description:</strong>
                <p>{ticket.description}</p>
              </div>
              
              <div className="ticket-meta">
                <p><strong>Created:</strong> {formatDate(ticket.created_at)}</p>
              </div>

              <div className="ticket-actions">
                <label><strong>Update Status:</strong></label>
                <select
                  value={ticket.status}
                  onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                  className="status-select"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>
          )}

          <div className="ticket-footer">
            <button
              className="expand-button"
              onClick={() => toggleExpand(ticket.id)}
            >
              {expandedTicket === ticket.id ? '▲ Collapse' : '▼ Expand Details'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TicketList;
