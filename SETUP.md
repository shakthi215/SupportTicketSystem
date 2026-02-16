# Quick Setup Guide

## 1. Set Your API Key

### Option A: Using .env file (Recommended)
```bash
echo "LLM_API_KEY=sk-ant-your-key-here" > .env
```

### Option B: Export environment variable
```bash
export LLM_API_KEY=sk-ant-your-key-here
```

## 2. Start the Application

```bash
docker-compose up --build
```

Wait for all services to start (usually 2-3 minutes on first run).

## 3. Access the Application

- Frontend: http://localhost:3000
- API: http://localhost:8000/api
- Admin: http://localhost:8000/admin (admin/admin123)

## 4. Test the LLM Classification

1. Go to http://localhost:3000
2. In the "Submit a New Ticket" form:
   - Enter a title
   - Enter a description like: "I can't log into my account, password reset isn't working"
   - Wait 1 second after typing
   - Watch the AI suggest category and priority!
3. You can override the suggestions before submitting
4. Submit the ticket

## 5. Explore Features

- **Create multiple tickets** with different descriptions
- **Use filters** to find specific tickets
- **Update status** by expanding a ticket
- **View statistics** in the right panel
- **Search** for tickets by keywords

## Troubleshooting

If LLM classification isn't working:
1. Check your API key is set correctly
2. View backend logs: `docker-compose logs backend`
3. The system will still work, just with default categorizations

If ports are in use:
- Change ports in docker-compose.yml
- Frontend: 3000 -> 3001
- Backend: 8000 -> 8001

## Stopping the Application

```bash
docker-compose down
```

To also remove volumes:
```bash
docker-compose down -v
```
