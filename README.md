# Support Ticket System - AI-Powered Tech Support Platform

A full-stack support ticket management system with intelligent LLM-powered classification built using Django, React, and Anthropic's Claude AI.

## 🌟 Features

### Core Functionality
- **Smart Ticket Creation**: Submit tickets with automatic AI-powered categorization and prioritization
- **Real-time Classification**: Claude AI analyzes ticket descriptions and suggests appropriate category and priority
- **Advanced Filtering**: Filter tickets by category, priority, status, and search across title/description
- **Status Management**: Update ticket status through intuitive UI (Open → In Progress → Resolved → Closed)
- **Comprehensive Statistics**: Real-time dashboard showing ticket metrics, breakdowns, and trends

### Technical Highlights
- **LLM Integration**: Anthropic Claude Sonnet 4 for intelligent ticket classification
- **Database-Level Aggregation**: Efficient statistics using Django ORM (not Python loops)
- **RESTful API**: Clean, well-documented API endpoints with proper status codes
- **Containerized Deployment**: Complete Docker setup with automatic migrations
- **Modern React UI**: Responsive, intuitive interface with real-time updates

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose installed
- Anthropic API key (optional but recommended for full functionality)

### Installation

1. **Navigate to project directory**
```bash
cd support-ticket-system
```

2. **Set your API key** (Optional but recommended)

Create a `.env` file in the root directory:
```bash
echo "LLM_API_KEY=your_anthropic_api_key_here" > .env
```

Or export it:
```bash
export LLM_API_KEY=your_anthropic_api_key_here
```

3. **Build and run the application**
```bash
docker-compose up --build
```

That's it! The application will:
- Build all containers
- Create and migrate the database
- Start all services automatically

### Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api
- **Admin Panel**: http://localhost:8000/admin (admin/admin123)

## 🤖 LLM Integration - Why Anthropic Claude?

I chose **Anthropic Claude Sonnet 4** for several key reasons:

1. **Superior Reasoning**: Excellent at understanding context and nuance in support requests
2. **Reliability**: Consistent structured output for classification tasks
3. **Safety**: Built-in safety features reduce risk of inappropriate suggestions
4. **Speed**: Fast response times crucial for real-time UI updates
5. **Cost-Effective**: Efficient token usage for classification tasks

### Prompt Design Philosophy

The classification prompt is carefully engineered to:
- Provide clear category and priority definitions with examples
- Request structured JSON output for easy parsing
- Include few-shot learning examples
- Handle edge cases gracefully

### Graceful Degradation

The system handles LLM failures gracefully:
- Falls back to sensible defaults (category: general, priority: medium)
- Ticket submission always succeeds even if classification fails
- Users can always override AI suggestions
- Errors are logged but don't impact user experience

## 📚 API Endpoints

### Tickets

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/tickets/` | Create a new ticket |
| GET | `/api/tickets/` | List all tickets (with filters) |
| PATCH | `/api/tickets/<id>/` | Update a ticket |
| GET | `/api/tickets/stats/` | Get aggregated statistics |
| POST | `/api/tickets/classify/` | Classify ticket description |

### Example Usage

```bash
# Create a ticket
curl -X POST http://localhost:8000/api/tickets/ \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Cannot access dashboard",
    "description": "Getting 404 error when clicking dashboard link",
    "category": "technical",
    "priority": "medium"
  }'

# Classify description
curl -X POST http://localhost:8000/api/tickets/classify/ \
  -H "Content-Type: application/json" \
  -d '{"description": "Need help resetting my password"}'
```

## 🏗️ Technical Architecture

### Backend (Django + DRF)
- Django 5.0.1 with Django REST Framework
- PostgreSQL 15 with optimized indexes
- Anthropic Claude API for classification
- Gunicorn WSGI server

### Frontend (React)
- React 18 with Hooks
- Custom hooks for data fetching
- Axios API client
- Modern CSS with gradients

### Infrastructure
- Docker + Docker Compose
- PostgreSQL with persistent volumes
- Automatic migrations on startup

## 🎯 Key Design Decisions

1. **Debounced Classification**: Reduce API calls while maintaining responsiveness
2. **Database Indexes**: Optimize common query patterns
3. **Component Separation**: Clear separation of concerns in React
4. **Graceful Degradation**: System works without LLM
5. **Real-time Updates**: No page reloads required

## 🧪 Testing the Application

1. **Create a ticket**: "My credit card was charged twice this month"
   - Expected: category=billing, priority=high

2. **Create a ticket**: "The website keeps showing 500 errors"
   - Expected: category=technical, priority=high

3. **Use filters** to find tickets by category/priority/status

4. **Update status** to see real-time stats update

## 🛠️ Troubleshooting

### LLM Not Working
- Check API key: `docker-compose exec backend env | grep LLM_API_KEY`
- Ticket creation still works without LLM (uses defaults)

### Port Already in Use
Modify ports in `docker-compose.yml` if 3000 or 8000 are in use

### View Logs
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

## 📦 Project Structure

```
support-ticket-system/
├── backend/           # Django backend
│   ├── config/        # Settings
│   ├── tickets/       # Main app
│   └── Dockerfile
├── frontend/          # React frontend
│   ├── src/
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## 🚀 Production Considerations

For production:
1. Change `DJANGO_SECRET_KEY` and set `DEBUG=False`
2. Add HTTPS/SSL certificates
3. Configure Redis for caching
4. Set up monitoring (Sentry, etc.)
5. Add rate limiting for LLM API

---

**Built with ❤️ using Django, React, PostgreSQL, and Anthropic Claude**
