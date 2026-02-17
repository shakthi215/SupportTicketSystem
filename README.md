# Support Ticket System

AI-powered support ticket management.

![App Screenshot](outputimages/Screenshot%202026-02-17%20123558.png)

## Features

- Create tickets with required validation (`title`, `description`, `category`, `priority`)
- LLM-assisted classification (`/api/tickets/classify/`) using OpenAI
- Editable AI suggestions before submit (category + priority override)
- Ticket list with combined filters (`category`, `priority`, `status`, `search`)
- Status update flow via `PATCH /api/tickets/<id>/`
- Live stats dashboard with DB-level aggregation:
  - `total_tickets`
  - `open_tickets`
  - `avg_tickets_per_day`
  - `priority_breakdown`
  - `category_breakdown`
- Fully containerized stack (PostgreSQL + Django + React)

## Tech Stack

- Backend: Django, Django REST Framework, PostgreSQL
- Frontend: React
- LLM: OpenAI API
- Infra: Docker Compose

## OpenAI Integration

- API key is loaded from environment variable `LLM_API_KEY`
- Provider is configurable with `LLM_PROVIDER` (default: `openai`)
- Model is configurable with `OPENAI_MODEL` (default: `gpt-4o-mini`)
- Prompt used for classification is in:
  - `backend/tickets/llm_service.py`
- Graceful fallback behavior:
  - If LLM fails/unavailable/invalid JSON, defaults are returned:
    - `suggested_category: general`
    - `suggested_priority: medium`

## Project Structure

```text
support-ticket-system/
  backend/
    config/
    tickets/
  frontend/
    src/
  docker-compose.yml
  .env.example
```

## Setup

1. Create `.env` in project root:

```env
LLM_API_KEY=your-openai-api-key
LLM_PROVIDER=openai
OPENAI_MODEL=gpt-4o-mini
```

2. Build and run:

```bash
docker compose up --build
```

3. Open:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000/api/`
- Django Admin: `http://localhost:8000/admin/`

Admin credentials (auto-created on backend startup):
- Username: `admin`
- Password: `admin123`

## API Endpoints

- `POST /api/tickets/` Create ticket
- `GET /api/tickets/` List tickets (newest first) with optional query params:
  - `category`
  - `priority`
  - `status`
  - `search`
- `PATCH /api/tickets/<id>/` Update status/category/priority
- `GET /api/tickets/stats/` Aggregated dashboard metrics
- `POST /api/tickets/classify/` LLM suggestion endpoint

## Notes for Evaluation

- Ticket constraints are enforced at model/database layer (choices + check constraints)
- Stats endpoint uses ORM aggregation (not Python loops)
- Classify endpoint is resilient to provider/network/JSON failures
- Frontend updates list and stats without full page reload after submit/update
