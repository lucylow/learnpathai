# 🤖 AI API Integration Suite for LearnPathAI

A comprehensive, production-ready system for integrating multiple education AI APIs with intelligent fallback, caching, cost control, and analytics.

## 📋 Table of Contents

- [Overview](#overview)
- [Supported APIs](#supported-apis)
- [Features](#features)
- [Setup](#setup)
- [Usage](#usage)
- [Architecture](#architecture)
- [Cost Management](#cost-management)
- [Troubleshooting](#troubleshooting)

---

## 🌟 Overview

This integration suite provides:

- **Multi-provider support**: OpenAI, QuestGen, QuizGecko, Quillionz, OPEXAMS
- **Intelligent fallback**: Automatically tries alternative providers if one fails
- **Aggressive caching**: Reduces costs by 70-90% for repeat requests
- **Cost tracking**: Real-time monitoring and monthly budget enforcement
- **Rate limiting**: Prevents API quota violations
- **Usage analytics**: Detailed statistics on provider performance

---

## 🔌 Supported APIs

### 1. **OpenAI** (Primary)
- **Use case**: Explanations, quiz generation, conversational tutoring
- **Strengths**: Extremely flexible, high quality, versatile
- **Cost**: ~$0.0015 per 1K tokens
- **Rate limit**: 1000 requests/minute

### 2. **QuestGen**
- **Use case**: Automated quiz generation from text
- **Strengths**: Specialized for educational content, good variety
- **Cost**: ~$0.02 per request
- **Rate limit**: 100 requests/minute
- **Max input**: 6,000 words

### 3. **QuizGecko**
- **Use case**: Quiz, flashcard, study resource generation
- **Strengths**: Multiple input types (text, PDF, URL), rich UI
- **Cost**: ~$0.03 per request
- **Rate limit**: 200 requests/minute

### 4. **Quillionz**
- **Use case**: Question + summary generation
- **Strengths**: Combined summaries and questions
- **Cost**: ~$0.01 per request
- **Rate limit**: 50 requests/minute

### 5. **OPEXAMS**
- **Use case**: Quick 5-10 question generation
- **Strengths**: Straightforward, fixed output
- **Cost**: ~$0.015 per request
- **Rate limit**: 100 requests/minute

---

## ✨ Features

### 🎯 Core Features

1. **Intelligent Provider Selection**
   - Automatic fallback to alternative providers
   - Priority-based provider ordering
   - Provider-specific error handling

2. **Advanced Caching System**
   - Two-tier caching (memory + database)
   - Configurable TTL (Time To Live)
   - LRU (Least Recently Used) eviction
   - Cache hit analytics

3. **Cost Management**
   - Monthly budget limits ($100 default)
   - Real-time cost tracking
   - Per-provider cost allocation
   - Automatic budget enforcement

4. **Rate Limiting**
   - Per-provider rate limits
   - Sliding window implementation
   - Automatic retry with backoff

5. **Analytics & Monitoring**
   - Usage statistics by provider
   - Success rates and error tracking
   - Response time monitoring
   - Cache hit rate analysis

---

## 🚀 Setup

### 1. Environment Variables

Create a `.env` file or add to Supabase Edge Function secrets:

```bash
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# API Keys
OPENAI_API_KEY=sk-...
QUESTGEN_API_KEY=your_questgen_key
QUIZGECKO_API_KEY=your_quizgecko_key
QUILLIONZ_API_KEY=your_quillionz_key
OPEXAMS_API_KEY=your_opexams_key
```

### 2. Database Setup

Run the migration:

```bash
cd supabase
supabase db push
```

Or manually execute:
```bash
psql -U postgres -d your_database -f migrations/20250117_api_integration_tables.sql
```

### 3. Deploy Supabase Function

```bash
supabase functions deploy generate-learning-content

# Set secrets
supabase secrets set OPENAI_API_KEY=sk-...
supabase secrets set QUESTGEN_API_KEY=your_key
# ... repeat for other providers
```

### 4. Install Frontend Dependencies

```bash
npm install @supabase/supabase-js @supabase/auth-helpers-react
```

---

## 💻 Usage

### Frontend Integration

#### Basic Quiz Generation

```typescript
import { useAIContentGeneration } from '@/hooks/useAIContentGeneration';

function MyComponent() {
  const { generateQuizForTopic, loading, error } = useAIContentGeneration();

  const handleGenerateQuiz = async () => {
    try {
      const result = await generateQuizForTopic('Python loops', {
        count: 5,
        difficulty: 'medium'
      });

      console.log('Quiz questions:', result.data.questions);
      console.log('Provider used:', result.provider);
      console.log('Cost:', result.cost);
      console.log('Cached:', result.cached);
    } catch (err) {
      console.error('Generation failed:', err);
    }
  };

  return (
    <button onClick={handleGenerateQuiz} disabled={loading}>
      {loading ? 'Generating...' : 'Generate Quiz'}
    </button>
  );
}
```

#### Generate Explanation

```typescript
const { generateExplanation } = useAIContentGeneration();

const result = await generateExplanation('Recursion', 'beginner');
console.log(result.data.content);
```

#### Generate from Text

```typescript
const { generateQuizFromText } = useAIContentGeneration();

const lectureNotes = `
  Machine learning is a subset of artificial intelligence...
`;

const result = await generateQuizFromText(lectureNotes, {
  count: 10,
  difficulty: 'hard'
});
```

#### Get Usage Statistics

```typescript
const { getUsageStats } = useAIContentGeneration();

const stats = await getUsageStats();
console.log('Total generated:', stats.totalGenerated);
console.log('Cache hit rate:', stats.cacheHitRate, '%');
console.log('Total cost:', stats.totalCost);
```

### Backend Integration

#### Direct API Manager Usage

```typescript
import { APIManager } from '@/lib/api-integration/api-manager';
import { QuestGenAPI } from '@/lib/api-integration/providers/questgen';

const apiManager = new APIManager(supabaseUrl, supabaseKey);
const questgen = new QuestGenAPI(apiManager, questgenApiKey);

const result = await questgen.generateQuestions(
  'Your text content here',
  5,
  ['MCQ', 'True/False']
);
```

---

## 🏗️ Architecture

### System Flow

```
Frontend Request
      ↓
useAIContentGeneration Hook
      ↓
Supabase Edge Function
      ↓
Check Cache (Memory → Database)
      ↓
  [Cache Hit?] → Yes → Return Cached
      ↓ No
Check Budget & Rate Limits
      ↓
Try Provider 1 (OpenAI)
      ↓
  [Success?] → Yes → Cache & Return
      ↓ No
Try Provider 2 (QuestGen)
      ↓
  [Success?] → Yes → Cache & Return
      ↓ No
Try Provider 3 (QuizGecko)
      ↓
Return Result or Error
```

### Caching Strategy

1. **Level 1 - Memory Cache**
   - In-memory Map (Edge Function runtime)
   - Fastest access (~1ms)
   - LRU eviction after 1000 items

2. **Level 2 - Database Cache**
   - Supabase PostgreSQL
   - Persistent across requests
   - Access time ~10-50ms
   - Automatic expiration cleanup

### Database Schema

```sql
api_cache
├── id (UUID)
├── cache_key (TEXT, indexed)
├── data (JSONB)
├── expires_at (TIMESTAMPTZ, indexed)
├── access_count (INTEGER)
└── created_at (TIMESTAMPTZ)

api_usage_logs
├── id (UUID)
├── provider (TEXT, indexed)
├── cost (DECIMAL)
├── success (BOOLEAN)
├── monthly_cost (DECIMAL)
├── metadata (JSONB)
└── created_at (TIMESTAMPTZ, indexed)

content_generation_logs
├── id (UUID)
├── user_id (UUID, FK)
├── content_type (TEXT)
├── provider (TEXT)
├── cost (DECIMAL)
├── cached (BOOLEAN)
├── generation_time_ms (INTEGER)
└── created_at (TIMESTAMPTZ)
```

---

## 💰 Cost Management

### Default Budget: $100/month

The system enforces a monthly budget to prevent unexpected costs:

```typescript
const MAX_MONTHLY_COST = 100; // $100 USD
```

### Cost Per Provider (Estimates)

| Provider | Cost per Request | Best For |
|----------|------------------|----------|
| OpenAI | $0.0015/1K tokens | Flexible, high quality |
| QuestGen | $0.02/request | Specialized quizzes |
| QuizGecko | $0.03/request | Rich study materials |
| Quillionz | $0.01/request | Summaries + questions |
| OPEXAMS | $0.015/request | Quick questions |

### Cost Optimization Tips

1. **Leverage Caching**
   - Default 24-hour cache reduces repeat costs to $0
   - Cache hit rate of 70%+ saves significant money

2. **Choose Right Provider**
   - Use QuestGen for text-based quizzes (cheaper)
   - Use OpenAI for flexible, high-quality content
   - Use QuizGecko for flashcards

3. **Batch Requests**
   - Generate 10 questions at once vs 10 separate calls
   - Reduces overhead and per-request costs

4. **Monitor Usage**
   ```typescript
   const stats = await apiManager.getProviderStats('openai', 30);
   console.log('Monthly cost:', stats.totalCost);
   ```

### Budget Alerts

Set up alerts in Supabase:

```sql
-- Alert when 80% of budget is used
CREATE OR REPLACE FUNCTION check_budget_threshold()
RETURNS void AS $$
DECLARE
  current_cost DECIMAL;
BEGIN
  current_cost := get_monthly_cost();
  
  IF current_cost > 80 THEN
    -- Send notification (integrate with your notification system)
    RAISE NOTICE 'Budget threshold exceeded: $ %', current_cost;
  END IF;
END;
$$ LANGUAGE plpgsql;
```

---

## 🔍 Monitoring & Analytics

### Provider Statistics

```typescript
const stats = await supabase.rpc('get_provider_stats', {
  provider_name: 'openai',
  days_back: 30
});

console.log(stats);
// {
//   total_requests: 1250,
//   successful_requests: 1180,
//   success_rate: 94.4,
//   total_cost: 45.60,
//   average_response_time: 1200,
//   cache_hit_rate: 72.3
// }
```

### Daily Usage View

```sql
SELECT * FROM daily_api_usage
WHERE date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY date DESC;
```

### Content Generation Stats

```sql
SELECT * FROM content_generation_stats;
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. "Rate limit exceeded"
**Solution**: Wait for the rate limit window to reset (typically 1 minute) or increase rate limits in `api-manager.ts`

```typescript
{ name: 'openai', limit: 2000, window: 60000 }, // Increase limit
```

#### 2. "Monthly API budget exceeded"
**Solution**: 
- Clear cache and increase budget in `api-manager.ts`
- Check usage: `SELECT get_monthly_cost();`
- Reset monthly cost (first of month)

#### 3. "All providers failed"
**Solution**:
- Check API keys are set correctly
- Verify provider endpoints are accessible
- Check Supabase function logs: `supabase functions logs generate-learning-content`

#### 4. Cache not working
**Solution**:
- Verify cache table exists: `SELECT * FROM api_cache LIMIT 1;`
- Check cache expiration: Clear expired with `SELECT cleanup_expired_cache();`

### Debug Mode

Enable verbose logging in Edge Function:

```typescript
// In generate-learning-content/index.ts
const DEBUG = true;

if (DEBUG) {
  console.log('Request:', { content_type, topic, count });
  console.log('Cache key:', cacheKey);
  console.log('Provider order:', preferred_providers);
}
```

### Performance Optimization

1. **Slow response times**
   - Check database indexes are created
   - Review cache hit rate (should be >60%)
   - Consider using closer Supabase region

2. **High costs**
   - Increase cache TTL (24h → 48h)
   - Prefer cheaper providers (QuestGen over OpenAI for quizzes)
   - Batch requests when possible

---

## 📊 Example: Complete Integration

```typescript
// components/AIQuizGenerator.tsx
import React, { useState } from 'react';
import { useAIContentGeneration } from '@/hooks/useAIContentGeneration';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export const AIQuizGenerator = ({ topic }: { topic: string }) => {
  const { generateQuizForTopic, loading, error, lastResult } = useAIContentGeneration();
  const [questions, setQuestions] = useState([]);

  const handleGenerate = async () => {
    const result = await generateQuizForTopic(topic, {
      count: 5,
      difficulty: 'medium',
      preferredProviders: ['openai', 'questgen']
    });

    if (result.success) {
      setQuestions(result.data.questions);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold mb-4">AI Quiz Generator</h3>
      
      <Button onClick={handleGenerate} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Quiz'}
      </Button>

      {lastResult && (
        <div className="mt-4 text-sm text-gray-600">
          <div>Provider: {lastResult.provider}</div>
          <div>Cost: ${lastResult.cost.toFixed(4)}</div>
          <div>Cached: {lastResult.cached ? 'Yes' : 'No'}</div>
        </div>
      )}

      {error && (
        <div className="mt-4 text-red-600">Error: {error}</div>
      )}

      <div className="mt-6 space-y-4">
        {questions.map((q, index) => (
          <div key={index} className="border p-4 rounded">
            <p className="font-semibold">{q.question}</p>
            {q.options && (
              <ul className="mt-2 space-y-1">
                {q.options.map((opt, i) => (
                  <li key={i}>{opt}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};
```

---

## 🎯 Next Steps

1. **Get API Keys**
   - Sign up for OpenAI: https://platform.openai.com/
   - Sign up for QuestGen: https://questgen.ai/
   - Sign up for QuizGecko: https://quizgecko.com/

2. **Deploy**
   ```bash
   supabase functions deploy generate-learning-content
   ```

3. **Test**
   ```typescript
   const result = await generateQuizForTopic('Test Topic');
   console.log('Success:', result.success);
   ```

4. **Monitor**
   - Check Supabase dashboard for usage
   - Review `api_usage_logs` table
   - Set up budget alerts

---

## 📝 License

MIT License - Feel free to use in your projects!

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

## 📧 Support

For issues, please check:
1. This guide's troubleshooting section
2. Supabase function logs
3. Provider API documentation

