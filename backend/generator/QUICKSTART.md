# Pathway Generator - Quick Start Guide

Get the **Personalized Learning Pathway Generator** up and running in 5 minutes!

## 🚀 Installation

```bash
cd /Users/llow/Desktop/learnpathai/backend
npm install
```

This will install the necessary TypeScript dependencies (`ts-node`, `typescript`, `@types/*`).

## 🎯 Run the Demo

The fastest way to see the generator in action:

```bash
# From the backend directory
node -r ts-node/register generator/demo.ts
```

You should see output like:

```
🚀 Personalized Learning Pathway Generator - Demo

============================================================

📊 Initializing knowledge graph...
✅ Graph initialized with 7 concepts

============================================================

👤 Generating path for: user_beginner
   Topic: Python Programming
   Goals: recursion_basics, algorithms
   Style: video
   Time Budget: 10 hours

⏱️  Generation time: 45ms

📝 Overall Explanation:
   This learning path is designed to help you master: recursion_basics, algorithms...

📈 Metadata:
   - Total estimated time: 4.2h
   - Difficulty level: intermediate
   - Completion rate: 43%

🎯 Learning Path (5 steps):

   1. Functions
      Mastery: 50% | Resource: Interactive Function Builder (interactive)
      Estimated time: 45 min
      ...
```

## 🌐 Start the Backend Server

To expose the generator via REST API:

```bash
# From the backend directory
npm run dev
```

The server will start on `http://localhost:4000` (or configured port).

You should see:

```
🚀 Backend listening on http://0.0.0.0:4000
✅ Advanced pathway generator enabled at /api/learning-path
```

## 📡 Test the API

### 1. Check System Status

```bash
curl http://localhost:4000/api/learning-path/status
```

Response:
```json
{
  "success": true,
  "status": "operational",
  "graphInitialized": true,
  "graphStats": {
    "nodeCount": 15,
    "edgeCount": 20,
    "avgPrerequisites": 1.3
  }
}
```

### 2. Generate a Learning Path

```bash
curl -X POST http://localhost:4000/api/learning-path/generate \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user",
    "topic": "Python Programming",
    "goalConcepts": ["recursion_basics"],
    "priorMastery": {
      "for_loops": 0.9,
      "functions": 0.5
    },
    "learningStyle": "video",
    "timeBudgetHours": 5
  }'
```

Response:
```json
{
  "success": true,
  "path": {
    "userId": "test_user",
    "steps": [
      {
        "node": {
          "id": "functions",
          "title": "Functions",
          "prerequisites": ["while_loops"]
        },
        "resource": {
          "id": "r4",
          "title": "Interactive Function Builder",
          "type": "interactive",
          "url": "https://..."
        },
        "estimatedTime": 45,
        "reasoning": "You have some experience with Functions..."
      },
      // ... more steps
    ],
    "explanation": "This learning path is designed to help you master: recursion_basics...",
    "metadata": {
      "totalEstimatedHours": 2.5,
      "difficultyLevel": "intermediate",
      "completionRate": 0.53
    }
  },
  "generationTimeMs": 42
}
```

### 3. Get Next Recommendations

After a student makes progress:

```bash
curl -X POST http://localhost:4000/api/learning-path/next-recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "path": { /* your path object */ },
    "currentMastery": {
      "functions": 0.85,
      "recursion_basics": 0.6
    }
  }'
```

## 🧩 Integration with Frontend

From your React frontend:

```typescript
// src/api/learningPath.ts
export async function generateLearningPath(profile: LearnerProfile) {
  const response = await fetch('/api/learning-path/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  });
  
  if (!response.ok) {
    throw new Error('Failed to generate path');
  }
  
  const data = await response.json();
  return data.path;
}

// Usage in component
const path = await generateLearningPath({
  userId: user.id,
  topic: 'Python',
  goalConcepts: ['recursion_basics'],
  priorMastery: userMastery,
  learningStyle: 'video',
  timeBudgetHours: 5,
});
```

## 📊 Customize Your Knowledge Graph

Edit `backend/data/knowledge_graph.json`:

```json
{
  "my_concept": {
    "title": "My Custom Concept",
    "description": "Learn about...",
    "prereqs": ["prerequisite_concept"],
    "resources": ["r1", "r2"]
  }
}
```

Edit `backend/data/resources.json`:

```json
[
  {
    "id": "r1",
    "conceptId": "my_concept",
    "type": "video",
    "title": "Introduction Video",
    "url": "https://...",
    "difficulty": 0.5,
    "durationMinutes": 20,
    "engagementScore": 0.9,
    "modality": "visual"
  }
]
```

Reload the graph:

```bash
curl -X POST http://localhost:4000/api/learning-path/reload-graph
```

## 🐛 Troubleshooting

### "ts-node not found"

```bash
cd backend
npm install ts-node typescript --save-dev
```

### "Knowledge graph not initialized"

Check that files exist:
- `backend/data/knowledge_graph.json`
- `backend/data/resources.json`

### "Module not found"

Make sure you're running from the `backend/` directory:

```bash
cd /Users/llow/Desktop/learnpathai/backend
node -r ts-node/register generator/demo.ts
```

## 📚 Next Steps

1. **Explore the code**: Check out `backend/generator/README.md` for detailed documentation
2. **Customize the algorithm**: Modify scoring in `planner.ts` or recommendation logic in `recommender.ts`
3. **Integrate with DKT**: Connect to the Python AI service for real-time mastery predictions
4. **Add embeddings**: Replace mock embeddings with real vectors from OpenAI/Cohere
5. **Build UI**: Create a frontend visualization for the learning paths

## 🆘 Need Help?

- Check the main README: `backend/generator/README.md`
- Review demo script: `backend/generator/demo.ts`
- Look at API endpoint: `backend/api/learningPath.ts`

Happy learning pathway generation! 🎓✨

