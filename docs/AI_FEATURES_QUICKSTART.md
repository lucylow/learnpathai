# AI Features Quick Start Guide

## 🚀 5-Minute Setup

Get all AI features running in 5 minutes!

### Step 1: Start Backend (1 min)

```bash
cd backend
npm install  # If not already done
npm start
```

Backend will run on `http://localhost:3000` with all mock AI APIs.

### Step 2: Start Frontend (1 min)

```bash
cd ..  # Back to project root
npm install  # If not already done
npm run dev
```

Frontend will run on `http://localhost:5173` (or your configured port).

### Step 3: View Demo (30 seconds)

Open your browser and navigate to:

```
http://localhost:5173/ai-features-demo
```

Or add a link in your navigation:

```tsx
<Link to="/ai-features-demo">AI Features</Link>
```

### Step 4: Test Features (2-3 minutes)

Try each feature in the demo page:

1. **Explanations Tab**
   - Click "Generate Explanation"
   - See AI-powered reasoning for recommendations

2. **Quiz Generator Tab**
   - Enter a topic (e.g., "Recursion in Python")
   - Select difficulty
   - Generate and take the quiz

3. **Text-to-Speech Tab**
   - Audio player with sample text
   - Try play/pause controls
   - (Note: Uses mock audio URLs)

4. **Semantic Search Tab**
   - Search for "recursion tutorial" or "loops python"
   - See similarity-scored results

## 📦 What You Get

- ✅ Mock AI APIs (no keys needed!)
- ✅ 4 Supabase Edge Functions
- ✅ 4 React components
- ✅ 4 Custom hooks
- ✅ 2 Service layers
- ✅ Database migrations
- ✅ Full demo page

## 🔧 Add to Your App

### Import and Use Components

```tsx
// In any component
import { WhyCard, QuizGenerator, TTSPlayer, SemanticSearchWidget } from '@/components/ai';

// Use in your JSX
function MyLearningPage() {
  return (
    <div>
      <QuizGenerator 
        defaultTopic="JavaScript Basics"
        defaultDifficulty="easy"
      />
      
      <WhyCard
        userId={currentUser.id}
        nodeId="current-node"
        resourceId="recommended-resource"
      />
    </div>
  );
}
```

### Use Hooks Directly

```tsx
import { useQuizGenerator, useExplanation } from '@/hooks';

function CustomComponent() {
  const { generateQuiz, questions, loading } = useQuizGenerator();
  const { fetchExplanation, explanation } = useExplanation();
  
  // Your custom logic here
}
```

## 🎯 Common Use Cases

### 1. Add "Why This?" to Resource Cards

```tsx
<ResourceCard>
  <h3>{resource.title}</h3>
  <button onClick={() => setShowWhy(true)}>
    Why this?
  </button>
  
  {showWhy && (
    <WhyCard
      userId={user.id}
      nodeId={currentNode.id}
      resourceId={resource.id}
      recentAttempts={userAttempts}
    />
  )}
</ResourceCard>
```

### 2. Generate Remediation Quizzes

```tsx
if (userScore < 70) {
  return (
    <QuizGenerator
      defaultTopic={failedNode.concept}
      defaultDifficulty="easy"
      onComplete={(score) => {
        if (score >= 80) unlockNextNode();
      }}
    />
  );
}
```

### 3. Make Content Accessible

```tsx
<div>
  <p>{content}</p>
  <TTSPlayer text={content} />
</div>
```

### 4. Smart Resource Discovery

```tsx
<SemanticSearchWidget
  onResourceSelect={(id) => {
    navigate(`/resource/${id}`);
  }}
/>
```

## 🔄 Replace with Real APIs

When ready, update the service layer:

```typescript
// src/services/ai-external.service.ts

// Before (mock):
const BACKEND_URL = 'http://localhost:3000';

// After (real API):
import OpenAI from 'openai';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async generateQuiz(params) {
  // Use real OpenAI API
  const response = await openai.chat.completions.create({...});
  return response;
}
```

## 📊 Monitor Usage

Check analytics in Supabase:

```sql
-- Quiz generations
SELECT COUNT(*) FROM quiz_generations WHERE created_at > NOW() - INTERVAL '1 day';

-- Explanation requests
SELECT COUNT(*) FROM explanations WHERE created_at > NOW() - INTERVAL '1 day';
```

## 🐛 Troubleshooting

**Issue:** Backend endpoints not found
```bash
# Solution: Ensure backend is running
cd backend && npm start
```

**Issue:** Components not importing
```bash
# Solution: Check imports use correct paths
import { WhyCard } from '@/components/ai';
// Or
import { WhyCard } from '../components/ai';
```

**Issue:** Supabase Edge Functions failing
```bash
# Solution: Deploy functions
supabase functions deploy explain
supabase functions deploy generateQuiz
supabase functions deploy embedResource
supabase functions deploy querySimilar
```

## 📱 Mobile Support

All components are responsive and work on mobile:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <QuizGenerator />
  <SemanticSearchWidget />
</div>
```

## 🎨 Theming

Customize colors by editing component classes:

```tsx
// WhyCard - Purple theme
className="border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50"

// QuizGenerator - Indigo theme
className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50"

// TTSPlayer - Blue theme
className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50"
```

## 🚢 Deployment

### Vercel / Netlify (Frontend)
```bash
npm run build
# Deploy dist/ folder
```

### Supabase (Edge Functions)
```bash
supabase functions deploy --project-ref your-project-ref
```

### Node Backend (Backend)
```bash
# Deploy to Heroku, Railway, Render, etc.
cd backend
npm start
```

## 🎉 You're Done!

You now have a fully functional AI-powered learning platform with:
- ✅ Smart explanations
- ✅ Adaptive quizzes
- ✅ Accessibility features
- ✅ Semantic search

**No API keys required for demos!** 🎊

Need help? Check the full guide: `AI_INTEGRATIONS_GUIDE.md`


