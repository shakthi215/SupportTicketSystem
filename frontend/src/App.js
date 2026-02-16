import React, { useState } from 'react';
import TicketForm from './components/TicketForm';
import TicketList from './components/TicketList';
import StatsDisplay from './components/StatsDisplay';
import './App.css';

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleTicketCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="container">
          <h1>🎫 AI-Powered Support Ticket System</h1>
          <p className="subtitle">
            Submit tickets and let AI intelligently categorize them
          </p>
        </div>
      </header>

      <main className="container">
        <StatsDisplay refreshTrigger={refreshTrigger} />
        <TicketForm onTicketCreated={handleTicketCreated} />
        <TicketList refreshTrigger={refreshTrigger} />
      </main>

      <footer className="app-footer">
        <div className="container">
          <p>
            Built with Django, React, and Claude AI •
            Powered by Anthropic's Claude Sonnet 4
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
