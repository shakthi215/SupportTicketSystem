# AI-Powered Support Ticket System

A modern, full-stack support ticket management system with intelligent AI-powered categorization using Claude (Anthropic).

## 🎯 Overview

This project demonstrates a complete support ticket system where users can:
- Submit support tickets with automatic AI categorization
- Filter and search through tickets
- View real-time statistics and analytics
- Update ticket statuses
- Experience seamless AI integration for smart suggestions

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- An Anthropic API key (get one at https://console.anthropic.com/)

### Running the Application

1. **Clone or extract the project**

2. **Set your API key**
   ```bash
   export LLM_API_KEY="your-anthropic-api-key-here"
   ```

3. **Start the application**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Django Admin: http://localhost:8000/admin

The application will automatically:
- Create and configure the PostgreSQL database
- Run all Django migrations
- Start the backend and frontend servers

## 🤖 LLM Integration

### Why Claude (Anthropic)?

I chose **Claude Sonnet 4** for the following reasons:

1. **Superior Classification Accuracy**: Claude excels at understanding context and nuance in support requests, leading to more accurate categorization than alternatives.

2. **Speed & Cost Balance**: Sonnet 4 provides an optimal balance between response time and accuracy, making it perfect for real-time classification without sacrificing quality.

3. **Structured Output Reliability**: Claude consistently produces well-formatted JSON responses, reducing parsing errors and improving system reliability.

4. **Context Understanding**: Claude's strong reasoning capabilities allow it to detect urgency indicators (like "critical", "broken", "urgent") and categorize accordingly.

5. **Graceful Degradation**: The system includes intelligent fallback heuristics if the API is unavailable, ensuring continuous operation.

### How It Works

1. User types a ticket description
2. On blur/completion, the frontend calls `/api/tickets/classify/`
3. Backend sends the description to Claude with a carefully engineered prompt
4. Claude analyzes the text and returns a structured JSON response:
   ```json
   {
     "category": "technical",
     "priority": "high",
     "reasoning": "Bug report affecting core functionality"
   }
   ```
5. Frontend pre-fills the category and priority dropdowns
6. User can accept or override the suggestions before submitting

### Prompt Engineering

The classification prompt (found in `backend/tickets/llm_service.py`) was carefully designed to:
- Provide clear category and priority definitions with examples
- Request structured JSON output for reliable parsing
- Include urgency detection based on keywords
- Maintain consistency across different ticket types

### Error Handling

The system gracefully handles:
- Missing or invalid API keys → Falls back to heuristic classification
- API timeouts → Returns default suggestions
- Invalid responses → Uses pattern matching fallback
- Network errors → Allows manual category selection

## 🏗️ Architecture

### Backend (Django + PostgreSQL)

**Technology Stack:**
- Django 4.2 with Django REST Framework
- PostgreSQL 15 for robust data storage
- Database-level constraints for data integrity

**Key Design Decisions:**

1. **Database-Level Constraints**: All field validations are enforced at the database level using Django's CheckConstraint, ensuring data integrity even if accessed outside the application.

2. **Database-Level Aggregation**: The stats endpoint uses Django ORM's `aggregate()` and `annotate()` functions, performing calculations in the database rather than Python for optimal performance.

3. **RESTful API Design**: Clean, predictable endpoints following REST conventions with proper HTTP status codes.

4. **Modular Service Architecture**: LLM classification logic is separated into its own service module for maintainability and testing.

### Frontend (React)

**Technology Stack:**
- React 18 with functional components and hooks
- Axios for API communication
- Pure CSS for styling (no framework dependencies)

**Key Design Decisions:**

1. **Real-time Updates**: The stats dashboard auto-refreshes when new tickets are created, providing live feedback.

2. **Progressive Enhancement**: The form works perfectly without AI (manual selection) but is enhanced with AI suggestions when available.

3. **Responsive Design**: Mobile-first CSS ensures the application works seamlessly on all devices.

4. **User Feedback**: Loading states, error messages, and success indicators provide clear feedback at every step.

### Infrastructure (Docker)

**Components:**
- PostgreSQL container with health checks
- Django backend with automatic migrations
- React frontend with hot-reload development server

**Key Features:**
- Service dependencies ensure proper startup order
- Health checks prevent premature connections
- Volume persistence for database data
- Environment-based configuration

## 📊 Database Schema

```sql
CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(20) NOT NULL CHECK (category IN ('billing', 'technical', 'account', 'general')),
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_created_at ON tickets (created_at DESC);
CREATE INDEX idx_category_priority ON tickets (category, priority);
CREATE INDEX idx_status ON tickets (status);
```

## 🔌 API Endpoints

### Tickets

- `POST /api/tickets/` - Create a new ticket
  ```json
  {
    "title": "Cannot login to account",
    "description": "Getting error 500 when trying to login",
    "category": "account",
    "priority": "high"
  }
  ```

- `GET /api/tickets/` - List all tickets (supports filtering)
  - Query params: `?category=technical&priority=high&status=open&search=login`

- `PATCH /api/tickets/{id}/` - Update a ticket
  ```json
  {
    "status": "resolved"
  }
  ```

- `GET /api/tickets/stats/` - Get aggregated statistics

- `POST /api/tickets/classify/` - Classify a ticket description
  ```json
  {
    "description": "My payment was charged twice"
  }
  ```

## 🎨 Features

### Core Features
- ✅ Full CRUD operations for tickets
- ✅ AI-powered categorization and priority suggestion
- ✅ Advanced filtering (category, priority, status, search)
- ✅ Real-time statistics dashboard
- ✅ Responsive, mobile-friendly design
- ✅ Database-level data integrity
- ✅ Graceful error handling

### UX Enhancements
- Loading indicators during AI classification
- Auto-refresh of stats after ticket creation
- Expandable ticket descriptions
- Inline status updates
- Visual priority and status badges
- Relative timestamps ("2 hours ago")

## 🧪 Testing the Application

### Sample Tickets to Try

1. **Technical Issue (High Priority)**
   ```
   Title: Production API is returning 500 errors
   Description: Our production API started throwing 500 errors about 30 minutes ago. This is blocking all user transactions and we're losing revenue. Need immediate help!
   Expected: category=technical, priority=critical
   ```

2. **Billing Question (Low Priority)**
   ```
   Title: Question about invoice
   Description: I received my monthly invoice and have a question about one of the line items. Can someone explain what the "platform fee" covers?
   Expected: category=billing, priority=low
   ```

3. **Account Issue (Medium Priority)**
   ```
   Title: Cannot reset password
   Description: I've tried resetting my password three times but never receive the reset email. I've checked spam folder too.
   Expected: category=account, priority=medium
   ```

## 📝 Development Notes

### Code Quality
- Clean, readable code with meaningful variable names
- Comprehensive comments explaining complex logic
- Consistent code style throughout
- No debug prints or dead code

### Performance Optimizations
- Database indexes on frequently queried fields
- Database-level aggregations for statistics
- Efficient React component rendering
- Debounced API calls for classification

### Security Considerations
- Environment-based API key configuration
- CORS properly configured
- Input validation on both frontend and backend
- Database constraints prevent invalid data

## 🔧 Configuration

### Environment Variables

- `LLM_API_KEY` - Your Anthropic API key (required for AI features)
- `LLM_PROVIDER` - LLM provider to use (default: "anthropic")
- `DATABASE_URL` - PostgreSQL connection string (auto-configured)
- `DEBUG` - Django debug mode (default: True in development)

### Switching LLM Providers

The system supports both Anthropic and OpenAI. To use OpenAI instead:

```bash
export LLM_PROVIDER=openai
export LLM_API_KEY="your-openai-api-key"
```

Update the model in `backend/tickets/llm_service.py` if needed.

## 🚦 Future Enhancements

Potential improvements for a production system:
- User authentication and authorization
- Email notifications for ticket updates
- File attachment support
- Advanced analytics and reporting
- Ticket assignment to support agents
- SLA tracking and automated escalation
- WebSocket integration for real-time updates
- Full-text search with Elasticsearch

## 📄 License

This project was created as a technical assessment and is provided as-is for evaluation purposes.

## 👨‍💻 Author

Built with attention to detail and best practices to demonstrate full-stack development capabilities, modern DevOps practices, and AI integration expertise.

---

**Tech Stack Summary**: Django • Django REST Framework • PostgreSQL • React • Docker • Anthropic Claude AI
