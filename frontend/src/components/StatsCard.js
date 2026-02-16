import React from 'react';

const StatsCard = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="stats-dashboard">
      {/* Summary Stats */}
      <div className="stats-summary">
        <div className="stat-card">
          <div className="stat-value">{stats.total_tickets}</div>
          <div className="stat-label">Total Tickets</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.open_tickets}</div>
          <div className="stat-label">Open Tickets</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.avg_tickets_per_day}</div>
          <div className="stat-label">Avg per Day</div>
        </div>
      </div>

      {/* Priority Breakdown */}
      <div className="stats-breakdown">
        <h3>Priority Distribution</h3>
        <div className="breakdown-grid">
          <div className="breakdown-item priority-low">
            <span className="breakdown-label">Low</span>
            <span className="breakdown-value">{stats.priority_breakdown.low || 0}</span>
          </div>
          <div className="breakdown-item priority-medium">
            <span className="breakdown-label">Medium</span>
            <span className="breakdown-value">{stats.priority_breakdown.medium || 0}</span>
          </div>
          <div className="breakdown-item priority-high">
            <span className="breakdown-label">High</span>
            <span className="breakdown-value">{stats.priority_breakdown.high || 0}</span>
          </div>
          <div className="breakdown-item priority-critical">
            <span className="breakdown-label">Critical</span>
            <span className="breakdown-value">{stats.priority_breakdown.critical || 0}</span>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="stats-breakdown">
        <h3>Category Distribution</h3>
        <div className="breakdown-grid">
          <div className="breakdown-item category-billing">
            <span className="breakdown-label">Billing</span>
            <span className="breakdown-value">{stats.category_breakdown.billing || 0}</span>
          </div>
          <div className="breakdown-item category-technical">
            <span className="breakdown-label">Technical</span>
            <span className="breakdown-value">{stats.category_breakdown.technical || 0}</span>
          </div>
          <div className="breakdown-item category-account">
            <span className="breakdown-label">Account</span>
            <span className="breakdown-value">{stats.category_breakdown.account || 0}</span>
          </div>
          <div className="breakdown-item category-general">
            <span className="breakdown-label">General</span>
            <span className="breakdown-value">{stats.category_breakdown.general || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
