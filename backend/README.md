# LearnPath AI - Backend API

## Overview

Node.js/Express backend that orchestrates path generation by combining knowledge graph traversal with mastery estimates from the AI service.

## Architecture

```
Client Request → Express API → Knowledge Graph + KT Service → Path Response
```

## API Endpoints

### POST `/api/paths/generate`

Generates a personalized learning path based on user mastery and target concepts.

**Request:**
```json
{
  "userId": "user_123",
  "targets": ["project"],
  "recentAttempts": [
    {"concept": "variables", "correct": true},
    {"concept": "loops", "correct": false}
  ],
  "priorMastery": {
    "functions": 0.3
  }
}
```

**Response:**
```json
{
  "userId": "user_123",
  "path": [
    {
      "concept": "loops",
      "mastery": 0.33,
      "recommended": true,
      "resourceIds": ["res_loops_1", "res_loops_2"]
    },
    {
      "concept": "functions",
      "mastery": 0.3,
      "recommended": true,
      "resourceIds": ["res_funcs_1"]
    }
  ],
  "mastery": {
    "variables": 0.67,
    "loops": 0.33,
    "functions": 0.3
  },
  "generatedAt": "2025-10-17T12:34:56.789Z"
}
```

### POST `/api/events`

Accepts xAPI-style learning events for analytics.

**Request:**
```json
{
  "actor": {"id": "user:demo_user_1"},
  "verb": {
    "id": "http://adlnet.gov/expapi/verbs/completed",
    "display": {"en-US": "completed"}
  },
  "object": {
    "id": "concept:loops",
    "definition": {"name": {"en-US": "loops"}}
  },
  "result": {"success": true},
  "timestamp": "2025-10-17T12:34:56.789Z"
}
```

### POST `/api/progress`

Tracks user progress on specific concepts.

**Request:**
```json
{
  "userId": "demo_user_1",
  "concept": "loops",
  "status": "completed",
  "timestamp": "2025-10-17T12:34:56.789Z"
}
```

## Knowledge Graph Structure

The knowledge graph (`data/knowledge_graph.json`) defines concept dependencies:

```json
{
  "concept_name": {
    "prereqs": ["prerequisite_concept"],
    "resources": ["resource_id_1", "resource_id_2"]
  }
}
```

### Path Generation Algorithm

1. **Fetch Mastery**: Call KT service with recent attempts
2. **Load Graph**: Read knowledge graph from disk
3. **DFS Traversal**: Topologically sort concepts by prerequisites
4. **Filter**: Include only concepts with mastery < threshold (default: 0.75)
5. **Return**: Ordered path with resources

## Configuration

Environment variables (`.env`):
- `PORT`: Server port (default: 3001)
- `KT_SERVICE_URL`: Knowledge tracking service endpoint
- `MASTERY_THRESHOLD`: Minimum mastery to skip concept (0-1)

## Testing

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run in watch mode
npm run test:watch
```

## Development

```bash
# Install dependencies
npm install

# Run in development mode (auto-reload)
npm run dev

# Run in production mode
npm start
```

## Data Storage

For hackathon/demo purposes, events and progress are logged to files:
- `data/events.log`: xAPI events (one JSON per line)
- `data/progress.log`: Progress updates (one JSON per line)

For production, replace with:
- MongoDB/PostgreSQL for persistent storage
- Redis for caching
- Learning Record Store (LRS) for xAPI compliance

## Dependencies

- `express`: Web framework
- `axios`: HTTP client for KT service
- `body-parser`: JSON parsing
- `cors`: Cross-origin resource sharing

## Performance

- **Latency**: 50-100ms per path generation
- **Throughput**: 100+ requests/sec
- **Caching**: Future optimization with Redis

## Roadmap

- [ ] Add authentication/authorization
- [ ] Database integration (MongoDB)
- [ ] Redis caching layer
- [ ] Rate limiting
- [ ] Request validation with Joi/Zod
- [ ] OpenAPI documentation
- [ ] Docker containerization

