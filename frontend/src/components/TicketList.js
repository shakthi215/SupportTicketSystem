import React, { useState } from 'react';

const TicketList = ({ tickets, onUpdateTicket, loading }) => {
  const [expandedTicket, setExpandedTicket] = useState(null);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const truncateText = (text, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      await onUpdateTicket(ticketId, { status: newStatus });
    } catch (err) {
      alert('Failed to update ticket status');
    }
  };

  const toggleExpand = (ticketId) => {
    setExpandedTicket(expandedTicket === ticketId ? null : ticketId);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p style={{ marginTop: '20px' }}>Loading tickets...</p>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="empty-state">
        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📭</div>
        <h3>No tickets found</h3>
        <p>Try adjusting your filters or create a new ticket</p>
      </div>
    );
  }

  return (
    <div className="ticket-list">
      {tickets.map((ticket) => {
        const isExpanded = expandedTicket === ticket.id;
        
        return (
          <div 
            key={ticket.id} 
            className="ticket-item"
            onClick={() => toggleExpand(ticket.id)}
          >
            <div className="ticket-header">
              <h3 className="ticket-title">
                #{ticket.id} - {ticket.title}
              </h3>
              <div className="ticket-badges">
                <span className={`badge badge-category-${ticket.category}`}>
                  {ticket.category}
                </span>
                <span className={`badge badge-priority-${ticket.priority}`}>
                  {ticket.priority}
                </span>
                <span className={`badge badge-status-${ticket.status}`}>
                  {ticket.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            <p className="ticket-description">
              {isExpanded ? ticket.description : truncateText(ticket.description)}
            </p>

            <div className="ticket-meta">
              <span>Created: {formatDate(ticket.created_at)}</span>
              {ticket.updated_at !== ticket.created_at && (
                <span>Updated: {formatDate(ticket.updated_at)}</span>
              )}
            </div>

            {isExpanded && (
              <div 
                className="ticket-actions"
                onClick={(e) => e.stopPropagation()}
              >
                <label>
                  <strong>Update Status:</strong>
                  <select
                    value={ticket.status}
                    onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </label>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TicketList;
