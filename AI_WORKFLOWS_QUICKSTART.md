# 🚀 LearnPath AI Workflows - Quick Start Guide

## Installation (2 minutes)

### 1. Start the AI Workflows

```bash
# Make scripts executable (first time only)
chmod +x start-ai-workflows.sh stop-ai-workflows.sh

# Start all services
./start-ai-workflows.sh
```

This will:
- ✅ Install Python dependencies
- ✅ Start FastAPI backend on port 8001
- ✅ Start React frontend on port 8080
- ✅ Initialize all AI components

### 2. Verify Services

Open your browser:
- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:8001
- **API Docs**: http://localhost:8001/docs
- **Health Check**: http://localhost:8001/health

## Basic Usage

### From TypeScript/React

```typescript
import { aiService } from '@/services/core/AIService';
import { adaptationEngine } from '@/services/core/AdaptationEngine';

// Process a learning event
const response = await aiService.processLearningEvent({
  id: 'event123',
  userId: 'user456',
  conceptId: 'loops',
  correct: true,
  timeSpent: 45000, // milliseconds
  confidence: 0.7,
  attemptNumber: 2,
  timestamp: new Date(),
  metadata: {}
});

console.log(`Mastery: ${response.mastery}`);
console.log(`Processing time: ${response.processingTime}ms`);

// Get knowledge state
const state = await aiService.getUserKnowledgeState('user456');
console.log(`Overall mastery: ${state.overallMastery}`);
```

### From Python

```python
import requests

# Process learning event
response = requests.post('http://localhost:8001/api/learning-event', json={
    'user_id': 'user456',
    'concept_id': 'loops',
    'correct': True,
    'time_spent': 45.0,
    'confidence': 0.7,
    'attempt_number': 2
})

data = response.json()
print(f"Mastery: {data['mastery']}")
print(f"Processing time: {data['processing_time']}ms")
```

### Direct API Calls

```bash
# Health check
curl http://localhost:8001/health

# Process learning event
curl -X POST http://localhost:8001/api/learning-event \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "concept_id": "loops",
    "correct": true,
    "time_spent": 45.0,
    "confidence": 0.7,
    "attempt_number": 2
  }'

# Get knowledge state
curl http://localhost:8001/api/user/user123/knowledge-state

# Predict trajectory
curl -X POST http://localhost:8001/api/predict-trajectory \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "concept_id": "recursion",
    "current_mastery": 0.35,
    "concept_difficulty": 0.75
  }'
```

## Testing the Integration

### Run the Example Component

```bash
# The example is in examples/ai-workflow-integration-example.tsx
# Add to your routes and visit: http://localhost:8080/ai-workflow-example
```

### Manual Testing

1. **Test Mastery Update**:
   - Click "Correct Answer" button
   - Watch mastery increase
   - Note the processing time (should be <500ms)

2. **Test Trajectory Prediction**:
   - Click "Predict Learning Trajectory"
   - Review predicted mastery and time to mastery
   - Check risk factors

3. **Test Interventions**:
   - Click "Incorrect Answer" multiple times
   - Watch for intervention messages
   - Note the proactive recommendations

## Key Features

### 1. Real-Time Adaptation (<500ms)

Every learning event triggers:
- ✅ Mastery update using BKT-IRT hybrid
- ✅ Knowledge state refresh
- ✅ Optimal path generation
- ✅ Proactive intervention detection

### 2. Performance Prediction

Predicts:
- 📈 Future mastery levels
- ⏱️ Time to mastery
- ⚠️ Risk factors
- 💡 Intervention recommendations

### 3. Intelligent Resource Selection

Multi-armed bandit considers:
- 🎯 Difficulty match
- 🎨 Learning style preferences
- ⏰ Available time
- 📊 Historical engagement

### 4. Content Intelligence

Analyzes content for:
- 📚 Key concepts
- 📊 Difficulty level
- 🧠 Cognitive load
- ✨ Engagement potential

## Performance Targets

| Metric | Target | Typical |
|--------|--------|---------|
| Full Pipeline | <500ms | 250ms |
| Mastery Update | <50ms | 15ms |
| Path Optimization | <150ms | 50ms |
| Trajectory Prediction | <200ms | 80ms |

## Troubleshooting

### Backend Not Starting

```bash
# Check if port 8001 is already in use
lsof -ti:8001 | xargs kill -9

# Restart services
./stop-ai-workflows.sh
./start-ai-workflows.sh
```

### Slow Response Times

1. Check backend health:
```bash
curl http://localhost:8001/health
```

2. Review component status:
```bash
curl http://localhost:8001/health | jq '.components'
```

3. Check for errors in logs

### Cache Issues

Clear the adaptation cache from TypeScript:
```typescript
import { adaptationEngine } from '@/services/core/AdaptationEngine';

// Clear all cache
adaptationEngine.clearCache();

// Clear for specific user
adaptationEngine.clearCache('user123');

// Check cache stats
const stats = adaptationEngine.getCacheStats();
console.log(stats);
```

## Next Steps

1. ✅ **Read Full Documentation**: See `AI_WORKFLOWS_PRODUCTION.md`
2. ✅ **Explore API**: Visit http://localhost:8001/docs
3. ✅ **Customize Components**: Modify parameters in `production_api.py`
4. ✅ **Add Your Data**: Replace sample data with real concepts
5. ✅ **Monitor Performance**: Set up logging and metrics

## Stopping Services

```bash
# Stop all services
./stop-ai-workflows.sh

# Or press Ctrl+C in the terminal running start-ai-workflows.sh
```

## Architecture Overview

```
┌─────────────────────────────────────────┐
│     React Frontend (Port 8080)          │
│  ┌──────────────┐  ┌─────────────────┐ │
│  │ AI Service   │  │ Adaptation      │ │
│  │ Client       │  │ Engine          │ │
│  └──────────────┘  └─────────────────┘ │
└────────────────┬────────────────────────┘
                 │ HTTP/REST
┌────────────────┴────────────────────────┐
│   FastAPI Backend (Port 8001)           │
│  ┌──────────┐  ┌──────────┐  ┌───────┐ │
│  │ BKT-IRT  │  │ Predictor│  │  MAB  │ │
│  └──────────┘  └──────────┘  └───────┘ │
│  ┌──────────┐  ┌──────────┐            │
│  │ KG       │  │ Content  │            │
│  └──────────┘  └──────────┘            │
└─────────────────────────────────────────┘
```

## Support

- 📚 Documentation: `AI_WORKFLOWS_PRODUCTION.md`
- 🔧 API Reference: http://localhost:8001/docs
- 💬 Issues: Create GitHub issue
- 📧 Contact: [Your contact info]

---

**Quick Links**:
- [Full Documentation](./AI_WORKFLOWS_PRODUCTION.md)
- [API Docs](http://localhost:8001/docs)
- [Frontend](http://localhost:8080)
- [Health Check](http://localhost:8001/health)

**Status**: ✅ Production Ready | **Version**: 3.0.0 | **Updated**: October 2025

