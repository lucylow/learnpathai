# LearnPath AI — Backend

A production-ready backend service for adaptive learning path generation with knowledge tracing integration.

## Features

- 🎯 **Adaptive Path Generation**: Dynamically generates personalized learning paths based on student mastery
- 🧠 **Knowledge Tracing Integration**: Resilient client with retry logic for KT microservice
- 📊 **Event Logging**: xAPI-style event collection for learning analytics
- 📧 **Contact Management**: Form submission handling with optional email notifications
- 🗄️ **Lightweight Database**: JSON-based persistence with lowdb (no external DB required)
- 🔒 **Security**: Helmet.js, CORS, and Joi validation
- 🐳 **Docker Support**: Complete container orchestration
- ✅ **Testing**: Jest + Supertest integration tests

## Project Structure

```
backend/
├── index.js                    # Express app entry point
├── config.js                   # Configuration management
├── db.js                       # lowdb database wrapper
├── data/
│   ├── knowledge_graph.json    # Learning concept prerequisites
│   ├── resources.json          # Learning resources catalog
│   └── db.json                 # Runtime database (auto-created)
├── middleware/
│   └── validate.js             # Joi validation middleware
├── routes/
│   ├── paths.js               # Path generation endpoints
│   ├── events.js              # Event logging endpoints
│   ├── contact.js             # Contact form endpoints
│   └── status.js              # Health check endpoints
├── services/
│   ├── ktClient.js            # KT microservice client
│   └── resourceService.js     # Resource & path logic
└── tests/
    └── paths.test.js          # Integration tests
```

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Start the server
npm start
```

The backend will run at **http://localhost:5000**

### Development Mode

```bash
npm run dev
```

Uses nodemon for automatic reloading on file changes.

## API Endpoints

### Path Generation

**POST** `/api/paths/generate`

Generate a personalized learning path based on student mastery and target concepts.

**Request Body:**
```json
{
  "userId": "student123",
  "targets": ["project"],
  "recentAttempts": [
    { "concept": "variables", "correct": true },
    { "concept": "loops", "correct": false }
  ],
  "priorMastery": {
    "variables": 0.9,
    "loops": 0.4
  }
}
```

**Response:**
```json
{
  "userId": "student123",
  "path": [
    {
      "concept": "loops",
      "mastery": 0.45,
      "resources": ["res_loops_1"]
    },
    {
      "concept": "functions",
      "mastery": 0.0,
      "resources": ["res_funcs_1"]
    }
  ],
  "mastery": {
    "variables": 0.92,
    "loops": 0.45,
    "functions": 0.0
  },
  "generatedAt": "2025-10-17T12:34:56.789Z"
}
```

### Event Logging

**POST** `/api/events`

Log learning events (xAPI-style).

**Request Body:**
```json
{
  "actor": { "id": "student123" },
  "verb": { "id": "completed" },
  "object": { "id": "resource_loops_1" },
  "result": { "score": 0.85 },
  "timestamp": "2025-10-17T12:34:56.789Z"
}
```

### Contact Form

**POST** `/api/contact`

Submit contact form messages.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "I love this platform!"
}
```

### Health Checks

**GET** `/api/status/health` - Basic health check

**GET** `/api/status/ready` - Readiness check (includes KT service status)

## Configuration

Edit `.env` to configure:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 5000 | Server port |
| `KT_SERVICE_URL` | http://kt-service:8001/predict_mastery | KT microservice endpoint |
| `MASTERY_THRESHOLD` | 0.75 | Threshold for concept mastery |
| `DB_FILE` | ./data/db.json | Database file path |
| `ENABLE_EMAIL` | false | Enable email notifications |
| `SMTP_URL` | - | SMTP connection string |

## Docker Deployment

### Using Docker Compose (Recommended)

Runs both backend and KT microservice:

```bash
docker-compose up
```

Services:
- Backend: http://localhost:5000
- KT Service: http://localhost:8001

### Docker Only

```bash
# Build image
docker build -t learnpathai-backend .

# Run container
docker run -p 5000:5000 \
  -e KT_SERVICE_URL=http://kt-service:8001/predict_mastery \
  learnpathai-backend
```

## Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch
```

### Example Test Request

```bash
curl -X POST http://localhost:5000/api/paths/generate \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "demo",
    "recentAttempts": [
      {"concept": "variables", "correct": true},
      {"concept": "loops", "correct": false}
    ],
    "targets": ["project"]
  }'
```

## Knowledge Graph

The `data/knowledge_graph.json` file defines learning concepts and their prerequisites:

```json
{
  "variables": { 
    "prereqs": [], 
    "resources": ["res_vars_1"] 
  },
  "loops": { 
    "prereqs": ["variables"], 
    "resources": ["res_loops_1"] 
  },
  "functions": { 
    "prereqs": ["variables", "loops"], 
    "resources": ["res_funcs_1"] 
  }
}
```

## Architecture

### Path Generation Flow

1. **Receive Request** → Validate with Joi schema
2. **Call KT Service** → Get updated mastery probabilities (with retry)
3. **Build Path** → DFS traversal respecting prerequisites
4. **Filter Concepts** → Only include concepts below mastery threshold
5. **Cache Result** → Store in lowdb for audit/analytics
6. **Return Response** → Send path + mastery to client

### Resilience Features

- **Retry Logic**: Exponential backoff for KT service failures
- **Graceful Degradation**: Falls back to prior mastery if KT unavailable
- **Input Validation**: Joi schemas prevent malformed requests
- **Error Logging**: Pino logger for observability

## Production Considerations

For production deployment:

1. **Replace lowdb** with MongoDB/PostgreSQL
2. **Add Authentication** (JWT, OAuth)
3. **Implement Rate Limiting** (express-rate-limit)
4. **Use HTTPS** with proper certificates
5. **Set up Monitoring** (Prometheus, Grafana)
6. **Configure CORS** for specific origins
7. **Use Secrets Manager** for sensitive env vars
8. **Implement Caching** (Redis) for KT responses

## Development Notes

- The database (`data/db.json`) is auto-created on first run
- Seed data is provided for demo purposes
- KT service client has 3 retry attempts with exponential backoff
- All endpoints return JSON with proper HTTP status codes
- Security headers applied via Helmet.js

## License

MIT

## Support

For issues or questions, please open an issue on GitHub or contact the team.

