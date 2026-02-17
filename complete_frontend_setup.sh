#!/bin/bash
cd /home/user/support-ticket-system/frontend

# Create Dockerfile
cat > Dockerfile << 'EOF'
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
EOF

# Create all component CSS files
cat > src/components/TicketForm.css << 'EOF'
.ticket-form-container {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.ticket-form h2 {
  margin-bottom: 1.5rem;
  color: #2c3e50;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #34495e;
}

.required {
  color: #e74c3c;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #dfe6e9;
  border-radius: 4px;
  font-size: 1rem;
  font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #3498db;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.classification-loading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #3498db;
  margin-top: 0.5rem;
  font-size: 0.9rem;
}

.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #3498db;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.classification-hint {
  color: #27ae60;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.submit-button {
  width: 100%;
  background-color: #3498db;
  color: white;
  padding: 0.875rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;
}

.submit-button:hover:not(:disabled) {
  background-color: #2980b9;
}

.submit-button:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

.error-message {
  background-color: #fee;
  color: #c33;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
EOF

cat > src/components/TicketList.css << 'EOF'
.ticket-list-container {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.ticket-list-header h2 {
  margin-bottom: 1.5rem;
  color: #2c3e50;
}

.filters {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.search-input,
.filter-select {
  padding: 0.625rem;
  border: 1px solid #dfe6e9;
  border-radius: 4px;
}

.tickets {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.ticket-card {
  border: 1px solid #e1e8ed;
  border-radius: 6px;
  padding: 1.25rem;
  transition: box-shadow 0.2s;
}

.ticket-card:hover {
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.15);
}

.ticket-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

.ticket-badges {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.badge {
  padding: 0.25rem 0.625rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.priority-low { background-color: #e8f5e9; color: #2e7d32; }
.priority-medium { background-color: #fff3e0; color: #ef6c00; }
.priority-high { background-color: #ffe0e0; color: #c62828; }
.priority-critical { background-color: #f3e5f5; color: #6a1b9a; }

.status-open { background-color: #e3f2fd; color: #1565c0; }
.status-in-progress { background-color: #fff9c4; color: #f57f17; }
.status-resolved { background-color: #e8f5e9; color: #2e7d32; }
.status-closed { background-color: #f5f5f5; color: #616161; }

.ticket-description {
  color: #4a5568;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.ticket-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.75rem;
  border-top: 1px solid #e1e8ed;
}

.ticket-actions {
  display: flex;
  gap: 0.5rem;
}

.status-select {
  padding: 0.375rem 0.5rem;
  border: 1px solid #dfe6e9;
  border-radius: 4px;
  font-size: 0.875rem;
}

.expand-button {
  padding: 0.375rem 0.75rem;
  background-color: #f8f9fa;
  color: #3498db;
  border: 1px solid #dfe6e9;
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: pointer;
}

@media (max-width: 768px) {
  .filters {
    grid-template-columns: 1fr;
  }
}
EOF

cat > src/components/StatsDisplay.css << 'EOF'
.stats-container {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.stats-container h2 {
  margin-bottom: 1.5rem;
  color: #2c3e50;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  padding: 1.5rem;
  border-radius: 6px;
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  color: white;
  text-align: center;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.95rem;
  opacity: 0.95;
}

.breakdown-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.breakdown-card {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 1.5rem;
}

.breakdown-card h3 {
  margin-bottom: 1rem;
  color: #2c3e50;
}

.breakdown-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.breakdown-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.breakdown-header {
  display: flex;
  justify-content: space-between;
}

.breakdown-label {
  font-weight: 600;
  color: #34495e;
}

.breakdown-count {
  color: #7f8c8d;
  font-size: 0.875rem;
}

.progress-bar {
  height: 8px;
  background-color: #e1e8ed;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  transition: width 0.6s ease;
  border-radius: 4px;
}

@media (max-width: 1024px) {
  .breakdown-section {
    grid-template-columns: 1fr;
  }
}
EOF

echo "Frontend files created successfully!"
