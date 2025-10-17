# Personalized Learning Pathway Generator

A modular, TypeScript-based system for generating adaptive learning pathways with AI-powered recommendations.

## 🏗️ Architecture

```
generator/
├── types.ts              # Type definitions
├── knowledgeGraph.ts     # Knowledge graph management
├── embeddings.ts         # Semantic similarity utilities
├── planner.ts            # Path planning algorithm
├── recommender.ts        # Resource recommendation
├── explain.ts            # Explanation & reasoning
└── demo.ts              # Demo & test script
```

## 📦 Core Modules

### 1. **types.ts** - Type Definitions
Defines all data structures:
- `LearnerProfile` - User characteristics and goals
- `ConceptNode` - Learning concepts with prerequisites
- `Resource` - Learning materials (videos, quizzes, etc.)
- `PathStep` - Individual steps in learning path
- `LearningPath` - Complete pathway with explanation

### 2. **knowledgeGraph.ts** - Knowledge Graph
Manages concept relationships:
- Load concepts and prerequisite relationships
- Query similar concepts
- Find prerequisite chains
- Graph traversal utilities

### 3. **embeddings.ts** - Semantic Similarity
Utilities for vector embeddings:
- Cosine similarity computation
- Find most similar resources
- Embedding averaging and normalization

### 4. **planner.ts** - Path Planning
Core pathway generation algorithm:
- **Priority-aware topological sorting** (Kahn's algorithm)
- Respects prerequisites while maximizing learning urgency
- Adaptive sequencing based on mastery gaps
- Rerouting capabilities for adaptive learning

**Algorithm:**
1. Score concepts by mastery gap + goal relevance
2. Topologically sort with priority queue
3. Select resources for each concept
4. Generate explanations and time estimates

### 5. **recommender.ts** - Resource Recommendation
Selects best resources for each concept:
- Learning style matching (video, reading, hands-on)
- Difficulty alignment (zone of proximal development)
- Engagement score optimization
- Diversity across resource types

**Scoring factors:**
- Learning style preference: +3
- Difficulty match: +2
- Engagement score: +2
- Direct concept match: +1

### 6. **explain.ts** - Explanations
Human-readable reasoning:
- Overall path explanation
- Per-step reasoning
- Progress summaries
- Motivational messages
- Locked concept explanations

## 🚀 Quick Start

### Installation

```bash
cd backend
npm install
```

### Run Demo

```bash
npm run dev
node -r ts-node/register generator/demo.ts
```

### API Endpoints

The generator is exposed via REST API at `/api/learning-path`:

#### Generate Path
```bash
POST /api/learning-path/generate
Content-Type: application/json

{
  "userId": "user123",
  "topic": "Python Programming",
  "goalConcepts": ["recursion_basics", "algorithms"],
  "priorMastery": {
    "for_loops": 0.9,
    "functions": 0.5
  },
  "learningStyle": "video",
  "timeBudgetHours": 10
}
```

#### Replan Path
```bash
POST /api/learning-path/replan
Content-Type: application/json

{
  "userId": "user123",
  "goalConcepts": ["algorithms"],
  "priorMastery": {
    "recursion_basics": 0.8
  }
}
```

#### Get Next Recommendations
```bash
POST /api/learning-path/next-recommendations
Content-Type: application/json

{
  "path": { /* previous path */ },
  "currentMastery": {
    "recursion_basics": 0.85
  }
}
```

#### Get Concept Details
```bash
GET /api/learning-path/concept/recursion_basics
```

#### Get Progress Summary
```bash
POST /api/learning-path/progress
Content-Type: application/json

{
  "mastery": {
    "for_loops": 0.95,
    "functions": 0.8,
    "recursion_basics": 0.6
  },
  "totalConcepts": 7
}
```

#### System Status
```bash
GET /api/learning-path/status
```

## 🎯 Usage Example

```typescript
import { generatePath } from './generator/planner';
import { initializeGraph } from './generator/knowledgeGraph';
import { LearnerProfile, ConceptNode, Resource } from './generator/types';

// Initialize knowledge graph
await initializeGraph(nodes, similarityEdges);

// Define learner profile
const profile: LearnerProfile = {
  userId: 'user123',
  topic: 'Python Programming',
  goalConcepts: ['recursion_basics'],
  priorMastery: {
    'for_loops': 0.9,
    'functions': 0.5,
  },
  learningStyle: 'video',
  timeBudgetHours: 5,
};

// Generate personalized path
const path = await generatePath(profile, nodes, resources);

console.log(path.explanation);
path.steps.forEach((step, i) => {
  console.log(`${i + 1}. ${step.node.title} - ${step.resource.title}`);
});
```

## 🧪 Testing

```bash
# Run demo with sample data
node -r ts-node/register generator/demo.ts

# Run backend server with generator
npm run dev
```

## 🔧 Configuration

### Knowledge Graph Format

`backend/data/knowledge_graph.json`:
```json
{
  "concept_id": {
    "title": "Concept Name",
    "description": "Concept description",
    "prereqs": ["prerequisite_concept"],
    "resources": ["resource_ids"]
  }
}
```

### Resources Format

`backend/data/resources.json`:
```json
[
  {
    "id": "r1",
    "conceptId": "concept_id",
    "type": "video",
    "title": "Resource Title",
    "url": "https://...",
    "difficulty": 0.5,
    "durationMinutes": 30,
    "engagementScore": 0.9,
    "modality": "visual"
  }
]
```

## 🎨 Features

### ✅ Implemented
- ✅ Priority-aware topological sorting
- ✅ Prerequisite enforcement
- ✅ Learning style matching
- ✅ Difficulty-based resource selection
- ✅ Per-step explanations
- ✅ Progress tracking
- ✅ Adaptive rerouting
- ✅ Motivational messaging
- ✅ REST API endpoints

### 🚧 Future Enhancements
- [ ] Real embedding service integration (OpenAI, Cohere)
- [ ] Deep Knowledge Tracing (DKT) integration
- [ ] Multi-objective optimization
- [ ] A/B testing framework
- [ ] Learning analytics dashboard
- [ ] Collaborative filtering
- [ ] Spaced repetition scheduling
- [ ] Real-time mastery updates via websockets

## 📊 Algorithm Details

### Topological Sort with Priority

The planner uses a modified Kahn's algorithm that respects both:
1. **Prerequisites**: Concepts are only available after prerequisites are met
2. **Priority**: Among available concepts, choose highest urgency first

**Urgency Score:**
```
score = (1 - mastery) + similarity_to_goals + is_direct_goal
```

This ensures:
- Low mastery concepts are prioritized
- Relevant concepts (similar to goals) are favored
- Direct goal concepts get highest priority
- Prerequisites are never skipped

### Resource Recommendation

Multi-factor scoring:
```
score = style_match + difficulty_match + engagement + concept_match
```

Where:
- `style_match`: 0-3 based on learner's preferred modality
- `difficulty_match`: 0-2 based on zone of proximal development
- `engagement`: 0-2 from historical data
- `concept_match`: +1 if resource directly for this concept

## 📈 Performance

- **Generation time**: < 100ms for graphs up to 100 nodes
- **Memory**: O(N + E) where N = nodes, E = edges
- **Complexity**: O(N log N + E) for topological sort with priority

## 🤝 Integration

### With Python AI Service

The generator complements the existing Python AI service:
- Python handles DKT model training and predictions
- TypeScript handles path generation and API
- Both share mastery data via REST API

### With Frontend

Frontend calls:
```typescript
const response = await fetch('/api/learning-path/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(profile),
});
const { path } = await response.json();
```

## 📝 License

MIT

## 👥 Authors

LearnPathAI Team

---

**Need help?** Check the demo script in `demo.ts` or create an issue.

