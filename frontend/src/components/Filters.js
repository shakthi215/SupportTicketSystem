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
    filters.category || filters.priority || filters.status || filters.search;

  return (
    <div className="card filter-card">
      <div className="section-head">
        <h3>Filters</h3>
        {hasActiveFilters && (
          <button className="clear-filters" onClick={clearFilters}>
            Clear all
          </button>
        )}
      </div>

      <div className="filters">
        <div className="form-group search-box compact">
          <input
            type="text"
            name="search"
            placeholder="Search title or description"
            value={filters.search || ''}
            onChange={handleChange}
          />
        </div>

        <div className="form-group compact">
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

        <div className="form-group compact">
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

        <div className="form-group compact">
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
