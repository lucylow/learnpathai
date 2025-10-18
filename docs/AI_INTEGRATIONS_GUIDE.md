# AI Integrations Guide

## Overview

LearnPathAI now includes a comprehensive suite of AI-powered features with **key-free mock APIs** that can be easily swapped with real AI services. This guide covers the implementation, architecture, and how to integrate these features.

## 🎯 Features Implemented

### 1. AI Explanations ("Why This?")
- **Purpose**: Generate personalized explanations for resource recommendations
- **Technology**: Mock API → Backend endpoint → Frontend component
- **Use Case**: When a learner asks "Why am I seeing this resource?"

**Implementation:**
```typescript
// Frontend usage
import { WhyCard } from '@/components/ai';

<WhyCard
  userId="user-123"
  nodeId="node-recursion"
  resourceId="resource-video-1"
  recentAttempts={[...]}
/>
```

### 2. Quiz Generator
- **Purpose**: Generate adaptive quizzes on any topic
- **Technology**: Mock API with quiz templates
- **Use Case**: Knowledge checks, remediation, practice

**Implementation:**
```typescript
import { QuizGenerator } from '@/components/ai';

<QuizGenerator
  defaultTopic="Recursion in Python"
  defaultDifficulty="medium"
  onComplete={(score) => console.log(score)}
/>
```

### 3. Text-to-Speech (TTS)
- **Purpose**: Convert text to speech for accessibility
- **Technology**: Mock TTS endpoint
- **Use Case**: Reading resources aloud, accessibility features

**Implementation:**
```typescript
import { TTSPlayer } from '@/components/ai';

<TTSPlayer
  text="Your content here..."
  voice="en-US"
  speed={1.0}
/>
```

### 4. Semantic Search
- **Purpose**: Find resources by meaning, not just keywords
- **Technology**: Mock embeddings + similarity search
- **Use Case**: Resource discovery, recommendations

**Implementation:**
```typescript
import { SemanticSearchWidget } from '@/components/ai';

<SemanticSearchWidget
  onResourceSelect={(resourceId) => navigate(`/resource/${resourceId}`)}
/>
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend (React)                    │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Components: WhyCard, QuizGenerator, TTSPlayer,   │  │
│  │  SemanticSearchWidget                             │  │
│  └───────────────┬───────────────────────────────────┘  │
│                  │                                       │
│  ┌───────────────▼───────────────────────────────────┐  │
│  │  Hooks: useExplanation, useQuizGenerator,         │  │
│  │  useSemanticSearch, useTextToSpeech               │  │
│  └───────────────┬───────────────────────────────────┘  │
│                  │                                       │
│  ┌───────────────▼───────────────────────────────────┐  │
│  │  Services: AIExternalService, SupabaseAIService   │  │
│  └───────────────┬───────────────────────────────────┘  │
└──────────────────┼───────────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
┌───────────────┐    ┌──────────────────┐
│   Backend     │    │    Supabase      │
│  Mock APIs    │    │  Edge Functions  │
│               │    │                  │
│ • /quiz/gen   │    │ • explain        │
│ • /explain    │    │ • generateQuiz   │
│ • /tts        │    │ • embedResource  │
│ • /semantic   │    │ • querySimilar   │
└───────────────┘    └──────────────────┘
```

## 📂 File Structure

```
learnpathai/
├── backend/
│   └── routes/
│       └── mock-external.js        # Mock AI APIs
│
├── supabase/
│   ├── functions/
│   │   ├── explain/
│   │   │   └── index.ts            # Explanation Edge Function
│   │   ├── generateQuiz/
│   │   │   └── index.ts            # Quiz generation Edge Function
│   │   ├── embedResource/
│   │   │   └── index.ts            # Embedding generation
│   │   └── querySimilar/
│   │       └── index.ts            # Semantic search
│   └── migrations/
│       └── 001_ai_features.sql     # Database schema
│
└── src/
    ├── services/
    │   ├── ai-external.service.ts  # Mock API client
    │   └── supabase-ai.service.ts  # Supabase Edge Function client
    │
    ├── hooks/
    │   ├── useExplanation.ts
    │   ├── useQuizGenerator.ts
    │   ├── useSemanticSearch.ts
    │   └── useTextToSpeech.ts
    │
    ├── components/
    │   └── ai/
    │       ├── WhyCard.tsx
    │       ├── QuizGenerator.tsx
    │       ├── TTSPlayer.tsx
    │       ├── SemanticSearchWidget.tsx
    │       └── index.ts
    │
    └── pages/
        └── AIFeaturesDemo.tsx      # Demo page
```

## 🚀 Getting Started

### 1. Backend Setup

Start the backend with mock APIs:

```bash
cd backend
npm install
npm start
# Backend runs on http://localhost:3000
```

### 2. Database Setup

Run the migration to create necessary tables:

```bash
# If using Supabase CLI
supabase migration up

# Or execute the SQL directly in Supabase dashboard
# File: supabase/migrations/001_ai_features.sql
```

### 3. Environment Variables

Add to your `.env` file:

```bash
# Backend
VITE_BACKEND_URL=http://localhost:3000

# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Deploy Edge Functions (Optional)

```bash
# Deploy all functions
supabase functions deploy explain
supabase functions deploy generateQuiz
supabase functions deploy embedResource
supabase functions deploy querySimilar
```

### 5. Test the Demo

Navigate to `/ai-features-demo` in your app to test all features.

## 🔌 API Endpoints

### Backend Mock APIs

#### POST `/api/mock-external/quiz/generate`
Generate quiz questions

**Request:**
```json
{
  "topic": "Recursion in Python",
  "difficulty": "medium",
  "num_questions": 3
}
```

**Response:**
```json
{
  "topic": "Recursion in Python",
  "difficulty": "medium",
  "questions": [
    {
      "qid": "q1",
      "question": "What is the base case?",
      "options": ["...", "..."],
      "correct": "...",
      "explanation": "..."
    }
  ]
}
```

#### POST `/api/mock-external/explain`
Generate explanation for recommendation

**Request:**
```json
{
  "user_id": "user-123",
  "node_id": "node-recursion",
  "resource_id": "resource-1",
  "recent_attempts": [...]
}
```

**Response:**
```json
{
  "explanation": "Because you scored 65%...",
  "evidence": "Attempt on node...",
  "next_step": "Review...",
  "confidence": 0.85
}
```

#### POST `/api/mock-external/tts/synthesize`
Text-to-speech synthesis

**Request:**
```json
{
  "text": "Hello world",
  "voice": "en-US",
  "speed": 1.0
}
```

**Response:**
```json
{
  "text": "Hello world",
  "audio_url": "https://...",
  "duration_ms": 1000
}
```

#### POST `/api/mock-external/semantic/search`
Semantic search for resources

**Request:**
```json
{
  "query": "recursion tutorial",
  "top_k": 5
}
```

**Response:**
```json
{
  "query": "recursion tutorial",
  "results": [
    {
      "resource_id": "r5",
      "title": "Understanding Recursion",
      "score": 0.92
    }
  ]
}
```

## 🔄 Replacing Mock APIs with Real Services

### Option 1: OpenAI Integration

```typescript
// services/openai-ai.service.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateQuiz(params) {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "You are a quiz generator..."
      },
      {
        role: "user",
        content: `Generate ${params.num_questions} questions about ${params.topic}`
      }
    ],
  });
  
  return JSON.parse(response.choices[0].message.content);
}
```

### Option 2: Hugging Face Models

```typescript
// services/huggingface-ai.service.ts
async function generateEmbedding(text: string) {
  const response = await fetch(
    "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2",
    {
      headers: { 
        Authorization: `Bearer ${process.env.HF_API_KEY}`,
        "Content-Type": "application/json"
      },
      method: "POST",
      body: JSON.stringify({ inputs: text }),
    }
  );
  return await response.json();
}
```

### Option 3: Self-Hosted Models

```python
# ai-service/embedding_service.py
from sentence_transformers import SentenceTransformer

model = SentenceTransformer('all-MiniLM-L6-v2')

def generate_embedding(text: str):
    return model.encode(text).tolist()
```

## 🎨 Customization

### Styling

All components use Tailwind CSS and shadcn/ui. Customize colors:

```tsx
// Change WhyCard colors
<Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
```

### Adding New Features

1. Create service method in `ai-external.service.ts`
2. Create React hook in `hooks/`
3. Create UI component in `components/ai/`
4. Add to demo page

## 📊 Analytics & Monitoring

Track AI feature usage:

```sql
-- Most popular quiz topics
SELECT concept, COUNT(*) as count
FROM quiz_generations
GROUP BY concept
ORDER BY count DESC
LIMIT 10;

-- Explanation confidence scores
SELECT AVG(confidence) as avg_confidence
FROM explanations
WHERE created_at > NOW() - INTERVAL '7 days';
```

## 🐛 Troubleshooting

### Issue: Backend not responding
**Solution:** Ensure backend is running on port 3000 and CORS is enabled

### Issue: Edge Functions failing
**Solution:** Check Supabase logs and ensure environment variables are set

### Issue: Components not rendering
**Solution:** Verify all dependencies are installed: `npm install`

## 📚 Resources

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [Hugging Face Inference API](https://huggingface.co/docs/api-inference)
- [shadcn/ui Components](https://ui.shadcn.com/)

## 🤝 Contributing

To add new AI features:

1. Add mock endpoint in `backend/routes/mock-external.js`
2. Create service method in `src/services/`
3. Create React hook in `src/hooks/`
4. Create UI component in `src/components/ai/`
5. Update demo page
6. Document in this guide

## 📝 License

MIT License - See LICENSE file for details

---

**Built for LearnPathAI** - Making AI-powered learning accessible without expensive API keys!


