import React from 'react';

const Filters = ({ filters, onFilterChange }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({
      ...filters,
      [name]: value === '' ? undefined : value,
    });
  };

  const clearFilters = () => {
    onFilterChange({
      category: undefined,
      priority: undefined,
      status: undefined,
      search: undefined,
    });
  };

  const hasActiveFilters = 
    filters.category || 
    filters.priority || 
    filters.status || 
    filters.search;

  return (
    <div className="card" style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ margin: 0 }}>🔍 Filters</h3>
        {hasActiveFilters && (
          <button 
            onClick={clearFilters}
            style={{
              background: 'none',
              border: 'none',
              color: '#667eea',
              cursor: 'pointer',
              fontSize: '0.9rem',
              textDecoration: 'underline',
            }}
          >
            Clear All
          </button>
        )}
      </div>

      <div className="filters">
        <div className="form-group search-box" style={{ margin: 0 }}>
          <input
            type="text"
            name="search"
            placeholder="Search title or description..."
            value={filters.search || ''}
            onChange={handleChange}
          />
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <select
            name="category"
            value={filters.category || ''}
            onChange={handleChange}
          >
            <option value="">All Categories</option>
            <option value="billing">Billing</option>
            <option value="technical">Technical</option>
            <option value="account">Account</option>
            <option value="general">General</option>
          </select>
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <select
            name="priority"
            value={filters.priority || ''}
            onChange={handleChange}
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <select
            name="status"
            value={filters.status || ''}
            onChange={handleChange}
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default Filters;
