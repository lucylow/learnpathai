# LearnPath AI - Frontend/Backend Integration Guide

This guide shows how to connect the AI service with your existing React frontend and Node.js backend.

---

## 🏗️ Architecture Overview

```
┌─────────────────┐
│  React Frontend │
│   (Port 5173)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────────┐
│  Node.js Backend│─────▶│  AI Service      │
│   (Port 3000)   │      │  FastAPI (8001)  │
└─────────────────┘      └──────────────────┘
         │
         ▼
┌─────────────────┐
│   SQLite DB     │
└─────────────────┘
```

---

## 🔗 Step 1: Backend Integration

### Add AI Service Client to Node.js Backend

**File:** `backend/services/aiService.js`

```javascript
// backend/services/aiService.js
const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8001';

class AIService {
  /**
   * Predict student mastery using DKT or Beta model
   */
  async predictMastery(userId, recentAttempts, priorMastery = {}) {
    try {
      const response = await axios.post(`${AI_SERVICE_URL}/predict_mastery`, {
        user_id: userId,
        recent_attempts: recentAttempts,
        prior_mastery: priorMastery,
        use_dkt: true
      });
      return response.data;
    } catch (error) {
      console.error('AI Service: predictMastery error:', error.message);
      // Fallback to local Beta calculation
      return this.fallbackMastery(recentAttempts, priorMastery);
    }
  }

  /**
   * Get personalized resource recommendations
   */
  async recommendResources(userId, concept, mastery, preferredModality = 'video', count = 5) {
    try {
      const response = await axios.post(`${AI_SERVICE_URL}/recommend`, {
        user_id: userId,
        concept: concept,
        mastery: mastery,
        preferred_modality: preferredModality,
        n_recommendations: count,
        explain: true
      });
      return response.data;
    } catch (error) {
      console.error('AI Service: recommendResources error:', error.message);
      return { recommendations: [], explanations: [] };
    }
  }

  /**
   * Analyze content (text or video) for concepts and difficulty
   */
  async analyzeContent(text = null, videoPath = null) {
    try {
      const response = await axios.post(`${AI_SERVICE_URL}/analyze_content`, {
        text: text,
        video_path: videoPath
      });
      return response.data;
    } catch (error) {
      console.error('AI Service: analyzeContent error:', error.message);
      return { concepts: [], difficulty: { level: 'beginner' } };
    }
  }

  /**
   * Fallback mastery calculation (simple Beta)
   */
  fallbackMastery(attempts, prior = {}) {
    const stats = {};
    
    attempts.forEach(att => {
      if (!stats[att.concept]) {
        stats[att.concept] = { success: 0, trials: 0 };
      }
      stats[att.concept].success += att.correct ? 1 : 0;
      stats[att.concept].trials += 1;
    });

    const mastery = {};
    for (const [concept, vals] of Object.entries(stats)) {
      const s = vals.success;
      const n = vals.trials;
      mastery[concept] = (s + 1) / (n + 2); // Beta posterior mean
    }

    // Merge with prior
    Object.entries(prior).forEach(([concept, value]) => {
      if (!(concept in mastery)) {
        mastery[concept] = value;
      }
    });

    return { mastery, model_used: 'fallback-beta' };
  }
}

module.exports = new AIService();
```

---

### Update Backend Routes

**File:** `backend/routes/learning.js`

```javascript
// backend/routes/learning.js
const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');
const db = require('../db');

/**
 * POST /api/learning/mastery
 * Get student mastery predictions
 */
router.post('/mastery', async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Fetch recent attempts from database
    const attempts = db.prepare(`
      SELECT concept, correct, question_id, timestamp
      FROM attempts
      WHERE user_id = ?
      ORDER BY timestamp DESC
      LIMIT 50
    `).all(userId);

    // Get prior mastery from cache
    const priorMastery = db.prepare(`
      SELECT concept, mastery_score
      FROM mastery_cache
      WHERE user_id = ?
    `).all(userId);

    const prior = {};
    priorMastery.forEach(row => {
      prior[row.concept] = row.mastery_score;
    });

    // Call AI service
    const result = await aiService.predictMastery(userId, attempts, prior);

    // Update cache
    Object.entries(result.mastery).forEach(([concept, score]) => {
      db.prepare(`
        INSERT OR REPLACE INTO mastery_cache (user_id, concept, mastery_score, updated_at)
        VALUES (?, ?, ?, datetime('now'))
      `).run(userId, concept, score);
    });

    res.json(result);
  } catch (error) {
    console.error('Mastery prediction error:', error);
    res.status(500).json({ error: 'Failed to predict mastery' });
  }
});

/**
 * POST /api/learning/recommend
 * Get personalized resource recommendations
 */
router.post('/recommend', async (req, res) => {
  try {
    const { userId, concept, preferredModality } = req.body;

    // Get current mastery
    const mastery = {};
    const rows = db.prepare(`
      SELECT concept, mastery_score
      FROM mastery_cache
      WHERE user_id = ?
    `).all(userId);

    rows.forEach(row => {
      mastery[row.concept] = row.mastery_score;
    });

    // Call AI service
    const recommendations = await aiService.recommendResources(
      userId,
      concept,
      mastery,
      preferredModality,
      5
    );

    res.json(recommendations);
  } catch (error) {
    console.error('Recommendation error:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

module.exports = router;
```

---

### Update Backend Index

**File:** `backend/index.js`

```javascript
// backend/index.js
const express = require('express');
const cors = require('cors');
const learningRoutes = require('./routes/learning');

const app = express();

app.use(cors());
app.use(express.json());

// Existing routes...

// Add AI-powered learning routes
app.use('/api/learning', learningRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
```

---

## 🎨 Step 2: Frontend Integration

### Create AI Service Hook

**File:** `src/hooks/useAI.ts`

```typescript
// src/hooks/useAI.ts
import { useState, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface Attempt {
  concept: string;
  correct: boolean;
  question_id?: number;
}

interface Mastery {
  [concept: string]: number;
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
  modality: string;
  difficulty: string;
  score: number;
}

export const useAI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const predictMastery = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/api/learning/mastery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) throw new Error('Failed to predict mastery');
      
      const data = await response.json();
      return data.mastery as Mastery;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return {};
    } finally {
      setLoading(false);
    }
  }, []);

  const getRecommendations = useCallback(async (
    userId: string,
    concept: string,
    preferredModality: string = 'video'
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/learning/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, concept, preferredModality })
      });

      if (!response.ok) throw new Error('Failed to get recommendations');

      const data = await response.json();
      return {
        recommendations: data.recommendations as Recommendation[],
        explanations: data.explanations
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return { recommendations: [], explanations: [] };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    predictMastery,
    getRecommendations,
    loading,
    error
  };
};
```

---

### Update Dashboard to Show Mastery

**File:** `src/pages/Dashboard.tsx`

```typescript
// src/pages/Dashboard.tsx
import { useEffect, useState } from 'react';
import { useAI } from '../hooks/useAI';
import { Card } from '../components/ui/card';
import { Progress } from '../components/ui/progress';

export default function Dashboard() {
  const { predictMastery, loading } = useAI();
  const [mastery, setMastery] = useState<Record<string, number>>({});

  useEffect(() => {
    // Load mastery on mount
    const userId = 'current-user-id'; // Get from auth context
    predictMastery(userId).then(setMastery);
  }, [predictMastery]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Your Learning Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(mastery).map(([concept, score]) => (
          <Card key={concept} className="p-4">
            <h3 className="text-lg font-semibold capitalize mb-2">{concept}</h3>
            <Progress value={score * 100} className="mb-2" />
            <p className="text-sm text-gray-600">
              Mastery: {(score * 100).toFixed(0)}%
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {score < 0.3 ? '🌱 Building foundation' :
               score < 0.7 ? '📈 Making progress' :
               '⭐ Strong mastery'}
            </p>
          </Card>
        ))}
      </div>

      {loading && <p className="text-center mt-4">Loading mastery data...</p>}
    </div>
  );
}
```

---

### Update Learning Path Page

**File:** `src/pages/LearningPath.tsx`

```typescript
// src/pages/LearningPath.tsx
import { useEffect, useState } from 'react';
import { useAI } from '../hooks/useAI';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  modality: string;
  difficulty: string;
  score: number;
}

export default function LearningPath() {
  const { getRecommendations, loading } = useAI();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [explanations, setExplanations] = useState<any[]>([]);
  const [selectedConcept, setSelectedConcept] = useState('loops');

  useEffect(() => {
    loadRecommendations();
  }, [selectedConcept]);

  const loadRecommendations = async () => {
    const userId = 'current-user-id';
    const result = await getRecommendations(userId, selectedConcept, 'video');
    setRecommendations(result.recommendations);
    setExplanations(result.explanations || []);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Your Learning Path</h1>

      {/* Concept selector */}
      <div className="flex gap-2 mb-6">
        {['variables', 'loops', 'functions', 'arrays'].map(concept => (
          <Button
            key={concept}
            variant={selectedConcept === concept ? 'default' : 'outline'}
            onClick={() => setSelectedConcept(concept)}
          >
            {concept}
          </Button>
        ))}
      </div>

      {/* Recommendations */}
      <div className="grid gap-4">
        {recommendations.map((rec, idx) => (
          <Card key={rec.id} className="p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-semibold">{rec.title}</h3>
                  <Badge variant="secondary">{rec.modality}</Badge>
                  <Badge>{rec.difficulty}</Badge>
                </div>
                
                <p className="text-gray-600 mb-4">{rec.description}</p>

                {/* AI Explanation */}
                {explanations[idx] && (
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                    <p className="text-sm font-medium mb-1">
                      💡 Why this resource?
                    </p>
                    <p className="text-sm text-gray-700">
                      {explanations[idx].explanation}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      <strong>Next step:</strong> {explanations[idx].action}
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button>Start Learning</Button>
                  <Button variant="outline">Save for Later</Button>
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  {(rec.score * 100).toFixed(0)}%
                </div>
                <p className="text-xs text-gray-500">Match Score</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {loading && <p className="text-center mt-4">Loading recommendations...</p>}
    </div>
  );
}
```

---

## 🗄️ Step 3: Database Schema Updates

Add tables for caching AI predictions:

```sql
-- Add to your SQLite schema

CREATE TABLE IF NOT EXISTS mastery_cache (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  concept TEXT NOT NULL,
  mastery_score REAL NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(user_id, concept)
);

CREATE TABLE IF NOT EXISTS attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  concept TEXT NOT NULL,
  question_id INTEGER,
  correct INTEGER NOT NULL,
  timestamp TEXT NOT NULL
);

CREATE INDEX idx_attempts_user ON attempts(user_id, timestamp DESC);
CREATE INDEX idx_mastery_user ON mastery_cache(user_id);
```

---

## 🚀 Step 4: Deployment

### Development

```bash
# Terminal 1: Start AI service
cd ai-service
python app.py

# Terminal 2: Start backend
cd backend
npm run dev

# Terminal 3: Start frontend
npm run dev
```

### Production

**Option 1: Separate Services**
- Deploy AI service on AWS Lambda / Cloud Run
- Deploy backend on Heroku / Railway
- Deploy frontend on Vercel / Netlify

**Option 2: Docker Compose**

```yaml
# docker-compose.yml
version: '3.8'

services:
  ai-service:
    build: ./ai-service
    ports:
      - "8001:8001"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}

  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - AI_SERVICE_URL=http://ai-service:8001
    depends_on:
      - ai-service

  frontend:
    build: .
    ports:
      - "80:80"
    depends_on:
      - backend
```

Run: `docker-compose up`

---

## 🧪 Testing the Integration

### Test Script

```bash
# Test AI service
curl http://localhost:8001/

# Test backend integration
curl -X POST http://localhost:3000/api/learning/mastery \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-user-123"}'

# Test frontend
# Open http://localhost:5173 and navigate to Dashboard
```

---

## 📊 Monitoring

### Add Health Check Endpoint

```javascript
// backend/routes/health.js
router.get('/health', async (req, res) => {
  const health = {
    backend: 'ok',
    ai_service: 'checking',
    database: 'checking'
  };

  // Check AI service
  try {
    await axios.get(`${AI_SERVICE_URL}/`, { timeout: 2000 });
    health.ai_service = 'ok';
  } catch {
    health.ai_service = 'down';
  }

  // Check database
  try {
    db.prepare('SELECT 1').get();
    health.database = 'ok';
  } catch {
    health.database = 'down';
  }

  const allOk = Object.values(health).every(v => v === 'ok');
  res.status(allOk ? 200 : 503).json(health);
});
```

---

## 🎯 Next Steps

1. ✅ Install dependencies: `npm install axios` in backend
2. ✅ Add AI service client
3. ✅ Create learning routes
4. ✅ Update frontend with AI hooks
5. ✅ Test end-to-end
6. ✅ Deploy!

---

**Integration complete!** Your LearnPath AI now has production-grade AI capabilities. 🎉

