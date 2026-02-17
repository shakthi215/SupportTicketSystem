import React from 'react';
import { useStats } from '../hooks/useTickets';

const StatsDashboard = ({ refreshTrigger }) => {
  const { stats, loading, error } = useStats(refreshTrigger);

  if (loading) {
    return (
      <div className="card">
        <h2 className="card-title">Live Statistics</h2>
        <div className="loading">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <h2 className="card-title">Live Statistics</h2>
        <div className="error-message">Failed to load statistics</div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const maxCount = Math.max(
    ...Object.values(stats.priority_breakdown || {}),
    ...Object.values(stats.category_breakdown || {}),
    1
  );

  return (
    <div className="card">
      <h2 className="card-title">Live Statistics</h2>

      <div className="stats-grid">
        <div className="stat-box">
          <div className="stat-value">{stats.total_tickets}</div>
          <div className="stat-label">Total Tickets</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{stats.open_tickets}</div>
          <div className="stat-label">Open Tickets</div>
        </div>
        <div className="stat-box stat-box-wide">
          <div className="stat-value">{stats.avg_tickets_per_day}</div>
          <div className="stat-label">Average per Day</div>
        </div>
      </div>

      <div className="breakdown-section">
        <h3>Priority Breakdown</h3>
        <div className="breakdown-list">
          {Object.entries(stats.priority_breakdown || {}).map(([priority, count]) => (
            <div key={priority} className="breakdown-item">
              <div className="breakdown-head">
                <span className={`badge badge-priority-${priority}`}>{priority}</span>
                <strong>{count}</strong>
              </div>
              <div
                className="breakdown-bar"
                style={{ width: `${(count / maxCount) * 100}%` }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="breakdown-section">
        <h3>Category Breakdown</h3>
        <div className="breakdown-list">
          {Object.entries(stats.category_breakdown || {}).map(([category, count]) => (
            <div key={category} className="breakdown-item">
              <div className="breakdown-head">
                <span className={`badge badge-category-${category}`}>{category}</span>
                <strong>{count}</strong>
              </div>
              <div
                className="breakdown-bar"
                style={{ width: `${(count / maxCount) * 100}%` }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;
