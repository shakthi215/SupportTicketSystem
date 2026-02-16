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
    updateTicket 
  } = useTickets();
  
  const [statsRefreshTrigger, setStatsRefreshTrigger] = useState(0);

  const handleTicketCreated = (newTicket) => {
    // Refresh stats when a new ticket is created
    setStatsRefreshTrigger(prev => prev + 1);
  };

  const handleUpdateTicket = async (id, updates) => {
    await updateTicket(id, updates);
    // Refresh stats when ticket is updated
    setStatsRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="app">
      <div className="container">
        {/* Header */}
        <header className="header">
          <h1>🎫 Support Ticket System</h1>
          <p>AI-Powered Ticket Management with Smart Classification</p>
        </header>

        {/* Main Content */}
        <div className="main-content">
          {/* Left Column - Ticket Management */}
          <div>
            {/* Submit Form */}
            <TicketForm onTicketCreated={handleTicketCreated} />

            {/* Filters */}
            <Filters filters={filters} onFilterChange={setFilters} />

            {/* Ticket List */}
            <div className="card">
              <h2 className="card-title">
                📋 Tickets ({tickets.length})
              </h2>
              
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              <TicketList 
                tickets={tickets}
                onUpdateTicket={handleUpdateTicket}
                loading={loading}
              />
            </div>
          </div>

          {/* Right Column - Statistics */}
          <div>
            <StatsDashboard refreshTrigger={statsRefreshTrigger} />
          </div>
        </div>

        {/* Footer */}
        <footer style={{ 
          textAlign: 'center', 
          color: 'white', 
          marginTop: '40px',
          padding: '20px',
          opacity: 0.8 
        }}>
          <p>Built with Django, React, and Anthropic Claude AI</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
