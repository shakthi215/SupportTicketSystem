import React, { useState, useEffect } from 'react';
import { ticketService } from '../services/api';
import './StatsDisplay.css';

const StatsDisplay = ({ refreshTrigger }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [refreshTrigger]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await ticketService.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="stats-loading">Loading statistics...</div>;
  }

  if (!stats) {
    return null;
  }

  const priorityColors = {
    low: '#4caf50',
    medium: '#ff9800',
    high: '#f44336',
    critical: '#9c27b0',
  };

  const categoryColors = {
    billing: '#2196f3',
    technical: '#ff5722',
    account: '#00bcd4',
    general: '#9e9e9e',
  };

  const calculatePercentage = (value, total) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  return (
    <div className="stats-container">
      <h2>Dashboard Statistics</h2>
      
      <div className="stats-grid">
        <div className="stat-card highlight">
          <div className="stat-value">{stats.total_tickets}</div>
          <div className="stat-label">Total Tickets</div>
        </div>
        
        <div className="stat-card highlight">
          <div className="stat-value">{stats.open_tickets}</div>
          <div className="stat-label">Open Tickets</div>
        </div>
        
        <div className="stat-card highlight">
          <div className="stat-value">{stats.avg_tickets_per_day}</div>
          <div className="stat-label">Avg per Day</div>
        </div>
      </div>

      <div className="breakdown-section">
        <div className="breakdown-card">
          <h3>Priority Breakdown</h3>
          <div className="breakdown-list">
            {Object.entries(stats.priority_breakdown).map(([priority, count]) => (
              <div key={priority} className="breakdown-item">
                <div className="breakdown-header">
                  <span className="breakdown-label">
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </span>
                  <span className="breakdown-count">
                    {count} ({calculatePercentage(count, stats.total_tickets)}%)
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${calculatePercentage(count, stats.total_tickets)}%`,
                      backgroundColor: priorityColors[priority],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="breakdown-card">
          <h3>Category Breakdown</h3>
          <div className="breakdown-list">
            {Object.entries(stats.category_breakdown).map(([category, count]) => (
              <div key={category} className="breakdown-item">
                <div className="breakdown-header">
                  <span className="breakdown-label">
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </span>
                  <span className="breakdown-count">
                    {count} ({calculatePercentage(count, stats.total_tickets)}%)
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${calculatePercentage(count, stats.total_tickets)}%`,
                      backgroundColor: categoryColors[category],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsDisplay;
