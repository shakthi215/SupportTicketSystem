import React, { useState } from 'react';
import './App.css';
import TicketForm from './components/TicketForm';
import TicketList from './components/TicketList';
import Filters from './components/Filters';
import StatsDashboard from './components/StatsDashboard';
import { useTickets } from './hooks/useTickets';

function App() {
  const {
    tickets,
    loading,
    error,
    filters,
    setFilters,
    createTicket,
    updateTicket,
  } = useTickets();

  const [statsRefreshTrigger, setStatsRefreshTrigger] = useState(0);
  const activeFiltersCount = ['category', 'priority', 'status', 'search']
    .filter((key) => Boolean(filters[key]))
    .length;

  const handleTicketCreated = () => {
    setStatsRefreshTrigger((prev) => prev + 1);
  };

  const handleUpdateTicket = async (id, updates) => {
    await updateTicket(id, updates);
    setStatsRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <p className="eyebrow">Operations Console</p>
          <h1>Support Ticket Dashboard</h1>
          <p>AI-assisted triage, lifecycle tracking, and live workload insights.</p>
          <div className="header-metrics">
            <div className="header-metric">
              <span>Visible Tickets</span>
              <strong>{tickets.length}</strong>
            </div>
            <div className="header-metric">
              <span>Active Filters</span>
              <strong>{activeFiltersCount}</strong>
            </div>
          </div>
        </header>

        <div className="main-content">
          <div>
            <TicketForm
              onCreateTicket={createTicket}
              onTicketCreated={handleTicketCreated}
            />

            <Filters filters={filters} onFilterChange={setFilters} />

            <div className="card">
              <h2 className="card-title">Ticket Queue ({tickets.length})</h2>

              {error && <div className="error-message">{error}</div>}

              <TicketList
                tickets={tickets}
                onUpdateTicket={handleUpdateTicket}
                loading={loading}
              />
            </div>
          </div>

          <div>
            <StatsDashboard refreshTrigger={statsRefreshTrigger} />
          </div>
        </div>

        <footer className="footer">
          <p>Built with Django and React</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
