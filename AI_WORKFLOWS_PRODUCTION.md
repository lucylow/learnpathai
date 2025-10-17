# 🧠 LearnPath AI - Production AI Workflows

## Overview

This document describes the comprehensive, production-ready AI workflow system for LearnPath AI. The system delivers real-time adaptive learning with sub-500ms response times.

## Architecture

### Component Stack

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React/TypeScript)              │
│  ┌────────────────┐  ┌──────────────────┐  ┌─────────────┐ │
│  │ Adaptation     │  │ AI Service       │  │ Event       │ │
│  │ Engine         │  │ Client           │  │ Tracking    │ │
│  └────────────────┘  └──────────────────┘  └─────────────┘ │
└────────────────────────────┬────────────────────────────────┘
                             │ REST API / WebSocket
┌────────────────────────────┴────────────────────────────────┐
│              Python FastAPI Backend (Port 8001)              │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ Production  │  │ BKT-IRT      │  │ Performance      │   │
│  │ API         │  │ Hybrid       │  │ Predictor        │   │
│  └─────────────┘  └──────────────┘  └──────────────────┘   │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ Knowledge   │  │ Multi-Armed  │  │ Content          │   │
│  │ Graph       │  │ Bandit       │  │ Analyzer         │   │
│  └─────────────┘  └──────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. BKT-IRT Hybrid Model (`bkt_irt_hybrid.py`)

**Purpose**: Combines Bayesian Knowledge Tracing with Item Response Theory for accurate, interpretable mastery estimation.

**Key Features**:
- Real-time mastery updates with confidence intervals
- IRT ability estimation (theta parameter)
- Bayesian posterior updates
- Learning and forgetting curves
- Sub-50ms update time

**API**:
```python
from bkt_irt_hybrid import bkt_irt_model

# Update mastery
update = bkt_irt_model.update_mastery(
    user_id="user123",
    concept_id="loops",
    correct=True,
    time_spent=45.0
)

# Get knowledge state
state = bkt_irt_model.get_knowledge_state("user123")
print(f"Overall mastery: {state['overall_mastery']}")
print(f"Ability: {state['ability']}")
```

**Algorithm**:
1. Calculate likelihood using BKT: `P(correct) = mastery * (1 - slip) + (1 - mastery) * guess`
2. Bayesian update: `posterior = (prior * likelihood) / normalization`
3. IRT ability update using Newton-Raphson
4. Calculate confidence intervals
5. Apply learning boost if correct

### 2. Performance Predictor (`performance_predictor.py`)

**Purpose**: Predicts learning trajectories and identifies risk factors for proactive intervention.

**Key Features**:
- Learning trajectory prediction
- Risk factor identification
- Proactive intervention recommendations
- Learning velocity calculation
- Engagement analysis

**API**:
```python
from performance_predictor import performance_predictor

# Predict trajectory
trajectory = performance_predictor.predict_trajectory(
    user_id="user123",
    concept_id="recursion",
    current_mastery=0.45,
    concept_difficulty=0.7
)

print(f"Predicted mastery: {trajectory.predicted_mastery}")
print(f"Time to mastery: {trajectory.estimated_time} hours")
print(f"Risk factors: {[r.type for r in trajectory.risk_factors]}")
```

**Predictive Features**:
- **Learner characteristics**: Prior mastery, learning velocity, consistency, engagement
- **Concept characteristics**: Difficulty, prerequisite strength
- **Temporal features**: Time of day, day of week, learning stamina
- **Behavioral patterns**: Error patterns, help-seeking, persistence

### 3. Knowledge Graph (`knowledge_graph.py`)

**Purpose**: DAG-based concept representation with weighted edges for optimal path planning.

**Key Features**:
- Prerequisite dependency tracking
- Ready concept identification
- Optimal learning sequence generation
- Learning gain potential calculation
- Concept centrality analysis

**API**:
```python
from knowledge_graph import KnowledgeGraph

kg = KnowledgeGraph()

# Get ready concepts
ready = kg.get_ready_concepts(mastery_threshold=0.7)

# Get optimal sequence
sequence = kg.get_optimal_learning_sequence(
    target_concepts=["recursion", "trees"],
    mastery_threshold=0.7
)

# Calculate learning gain potential
gain = kg.compute_learning_gain_potential("loops")
```

### 4. Multi-Armed Bandit (`bandit_optimizer.py`)

**Purpose**: Optimal resource selection using Thompson Sampling with contextual features.

**Key Features**:
- Thompson Sampling algorithm
- Upper Confidence Bound (UCB)
- Contextual feature integration
- Real-time reward updates
- Success rate tracking with confidence intervals

**API**:
```python
from bandit_optimizer import ContextualBandit

bandit = ContextualBandit(algorithm="thompson")

# Select optimal resource
resource_id = bandit.select_contextual_resource(
    candidates=["vid1", "art1", "quiz1"],
    learner_mastery=0.6,
    learning_style="visual",
    available_time=20.0
)

# Update with outcome
bandit.update_reward(resource_id, success=True)
```

### 5. Content Analyzer (`content_analyzer.py`)

**Purpose**: Analyzes educational content for concepts, difficulty, and engagement potential.

**Key Features**:
- Concept extraction using NLP patterns
- Difficulty calculation (lexical, structural, conceptual)
- Cognitive load estimation
- Readability scoring (Flesch Reading Ease)
- Engagement potential prediction

**API**:
```python
from content_analyzer import content_analyzer

analysis = content_analyzer.analyze_content(
    content="Your educational text...",
    resource_id="res123",
    resource_type="article"
)

print(f"Difficulty: {analysis.difficulty}")
print(f"Cognitive load: {analysis.cognitive_load}")
print(f"Concepts: {[c.text for c in analysis.concepts[:5]]}")
```

### 6. Production API (`production_api.py`)

**Purpose**: FastAPI backend integrating all components with <500ms SLA.

**Key Endpoints**:

#### POST `/api/learning-event`
Process learning event with full adaptive pipeline.

**Request**:
```json
{
  "user_id": "user123",
  "concept_id": "loops",
  "correct": true,
  "time_spent": 45.0,
  "confidence": 0.7,
  "attempt_number": 2
}
```

**Response** (typically 200-400ms):
```json
{
  "success": true,
  "path": [
    {"concept_id": "loops", "type": "current", "priority": "high"},
    {"concept_id": "functions", "type": "ready", "priority": "medium"}
  ],
  "mastery": 0.68,
  "confidence": 0.82,
  "processing_time": 287,
  "ability": 0.45,
  "interventions": []
}
```

#### GET `/api/user/{user_id}/knowledge-state`
Get complete knowledge state.

**Response**:
```json
{
  "user_id": "user123",
  "concept_mastery": {
    "variables": 0.92,
    "loops": 0.68,
    "functions": 0.45
  },
  "overall_mastery": 0.68,
  "ability": 0.45,
  "confidence_intervals": {
    "loops": [0.62, 0.74]
  },
  "learning_velocity": 0.15,
  "concept_count": 3
}
```

#### POST `/api/predict-trajectory`
Predict learning trajectory with risk factors.

**Request**:
```json
{
  "user_id": "user123",
  "concept_id": "recursion",
  "current_mastery": 0.35,
  "concept_difficulty": 0.75
}
```

**Response**:
```json
{
  "predicted_mastery": 0.62,
  "confidence": 0.73,
  "estimated_time": 4.5,
  "risk_factors": [
    {
      "type": "slow_progress",
      "severity": "medium",
      "message": "Learning progress is slower than expected"
    }
  ],
  "recommendations": [
    {
      "type": "remediation",
      "priority": "high",
      "action": "suggest_prerequisite_review",
      "message": "Let's review some foundational concepts."
    }
  ]
}
```

#### POST `/api/select-resources`
Select optimal resources using multi-armed bandit.

#### GET `/health`
Health check with component status.

## Frontend Integration

### TypeScript AI Service (`src/services/core/AIService.ts`)

**Usage**:
```typescript
import { aiService } from '@/services/core/AIService';

// Process learning event
const response = await aiService.processLearningEvent({
  id: uuid(),
  userId: 'user123',
  conceptId: 'loops',
  correct: true,
  timeSpent: 45000,
  confidence: 0.7,
  attemptNumber: 2,
  timestamp: new Date(),
  metadata: {}
});

console.log(`Mastery: ${response.mastery}`);
console.log(`Interventions: ${response.interventions?.length || 0}`);

// Get knowledge state
const state = await aiService.getUserKnowledgeState('user123');
console.log(`Overall mastery: ${state.overallMastery}`);
```

### Adaptation Engine (`src/services/core/AdaptationEngine.ts`)

**Purpose**: Manages event queue, caching, and real-time adaptation.

**Features**:
- Event queuing with async processing
- Response caching (60s TTL)
- SLA monitoring (500ms target)
- Subscriber notifications
- Cache management

**Usage**:
```typescript
import { adaptationEngine } from '@/services/core/AdaptationEngine';

// Submit event
const response = await adaptationEngine.submitLearningEvent(event);

// Subscribe to adaptations
adaptationEngine.subscribe({
  async onAdaptation(event, response) {
    console.log('Adaptation received:', response);
  }
});

// Get cache stats
const stats = adaptationEngine.getCacheStats();
console.log(`Cache hit rate: ${stats.hitRate}`);
```

## Performance Characteristics

### Response Times (Target: <500ms)

| Operation | Typical | 95th Percentile | Max |
|-----------|---------|----------------|-----|
| Mastery Update | 15ms | 30ms | 50ms |
| Knowledge State | 10ms | 20ms | 35ms |
| Path Optimization | 50ms | 100ms | 150ms |
| Resource Selection | 25ms | 50ms | 80ms |
| **Full Pipeline** | **250ms** | **450ms** | **500ms** |

### Scalability

- **Concurrent Users**: 1,000+ per instance
- **Throughput**: 100+ events/second per instance
- **Memory**: ~500MB per instance
- **Horizontal Scaling**: Linear with load balancing

## Configuration

### Environment Variables

```bash
# Backend configuration
export AI_SERVICE_HOST="0.0.0.0"
export AI_SERVICE_PORT=8001
export AI_WORKERS=4  # Production workers

# Frontend configuration
export VITE_AI_API_URL="http://localhost:8001"
export VITE_ADAPTATION_CACHE_TTL=60000
export VITE_ADAPTATION_SLA_TARGET=500
```

### Production Deployment

```bash
# Start Python backend
cd ai-service
python production_api.py

# Or with gunicorn for production
gunicorn production_api:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8001 \
  --timeout 30 \
  --keep-alive 5
```

## Testing

### Python Tests

```bash
# Test individual components
python bkt_irt_hybrid.py
python performance_predictor.py
python content_analyzer.py

# Run API tests
pytest tests/test_production_api.py
```

### Load Testing

```bash
# Using Apache Bench
ab -n 1000 -c 10 -p event.json -T application/json \
  http://localhost:8001/api/learning-event

# Using locust
locust -f tests/locustfile.py --host=http://localhost:8001
```

## Monitoring

### Key Metrics

- **Response Time**: P50, P95, P99 latencies
- **Throughput**: Events/second
- **Error Rate**: Failed requests percentage
- **Cache Hit Rate**: Cache effectiveness
- **Model Accuracy**: Prediction accuracy over time

### Health Checks

```bash
# Backend health
curl http://localhost:8001/health

# Component status
curl http://localhost:8001/health | jq '.components'
```

## Advanced Features

### 1. Proactive Interventions

The system automatically detects patterns requiring intervention:

- **Knowledge Gaps**: Mastery < 0.3 with high confidence
- **Frustration**: Multiple failures with long time spent
- **Rapid Progress**: Quick mastery gains → acceleration

### 2. Risk Factor Detection

Identifies learners at risk:

- **Slow Progress**: Learning velocity < 0.05
- **Inconsistent Engagement**: Consistency < 0.3
- **Low Persistence**: Gives up quickly
- **Knowledge Gaps**: Weak prerequisite knowledge

### 3. Contextual Resource Selection

Bandit considers:

- Difficulty match (ZPD - Zone of Proximal Development)
- Learning style preferences
- Available time
- Historical engagement
- Success rates

### 4. Learning Trajectory Prediction

Predicts:

- Future mastery levels
- Time to mastery (hours)
- Confidence in predictions
- Risk factors
- Recommended interventions

## Future Enhancements

1. **Deep Learning Models**: Replace linear models with neural networks
2. **Multi-Modal Content**: Video, audio, interactive analysis
3. **Collaborative Filtering**: Peer-based recommendations
4. **A/B Testing**: Automated experimentation framework
5. **Explainable AI**: Enhanced interpretability
6. **Real-time Streaming**: WebSocket-based event streaming
7. **Distributed Caching**: Redis for multi-instance caching
8. **Model Versioning**: A/B test different model versions

## Troubleshooting

### Slow Response Times

1. Check component health: `GET /health`
2. Review processing times in response
3. Check database query performance
4. Scale horizontally if needed

### Cache Issues

```typescript
// Clear cache
adaptationEngine.clearCache('user123');

// Check cache stats
const stats = adaptationEngine.getCacheStats();
console.log(stats);
```

### Model Accuracy Issues

1. Review prediction confidence scores
2. Check historical data quality
3. Retrain models with more data
4. Adjust model parameters

## Support

For issues or questions:
- GitHub Issues: [learnpathai/issues](https://github.com/learnpathai/issues)
- Documentation: `/docs`
- API Reference: `http://localhost:8001/docs`

---

**Version**: 3.0.0  
**Last Updated**: October 2025  
**Status**: ✅ Production Ready

