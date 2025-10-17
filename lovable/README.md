# Lovable Backend Functions

This directory contains serverless backend functions that run on Lovable Cloud.

## Functions Overview

### `generate-path.ts`
**Purpose:** Generates a personalized learning path using AI

**Triggered by:** User requesting a new learning path

**Parameters:**
- `userId` - ID of the user
- `subject` - Learning subject (e.g., "programming", "math")
- `userAttempts` - Array of previous attempts
- `learningStyle` - Preferred learning style
- `learningGoal` - User's learning objective

**Returns:** Generated learning path with nodes, resources, and mastery targets

**Example:**
```typescript
const result = await lovable.functions.invoke('generate-path', {
  userId: 'user_123',
  subject: 'programming',
  userAttempts: [],
  learningStyle: 'visual',
  learningGoal: 'Master Python basics'
});
```

---

### `update-path.ts`
**Purpose:** Updates a learning path based on new user attempts

**Triggered by:** User completing quizzes or exercises

**Parameters:**
- `pathId` - ID of the learning path
- `newAttempts` - Array of new attempt records

**Returns:** Updated path with recalculated mastery levels

**Example:**
```typescript
const result = await lovable.functions.invoke('update-path', {
  pathId: 'path_123',
  newAttempts: [
    { concept: 'variables', correct: true },
    { concept: 'loops', correct: false }
  ]
});
```

---

### `reroute-path.ts`
**Purpose:** Adaptive rerouting when user struggles with a concept

**Triggered by:** User failing multiple attempts on a concept

**Parameters:**
- `userId` - ID of the user
- `pathId` - ID of the learning path
- `failedNode` - Concept the user struggled with

**Returns:** Rerouted path with remediation content

**Example:**
```typescript
const result = await lovable.functions.invoke('reroute-path', {
  userId: 'user_123',
  pathId: 'path_123',
  failedNode: 'control_structures'
});
```

---

### `predict-next-concept.ts`
**Purpose:** Predicts the optimal next concept using DKT model

**Triggered by:** User requesting next recommendation

**Parameters:**
- `userId` - ID of the user
- `pathId` - ID of the learning path
- `history` - Array of attempt history

**Returns:** Next recommended concept with confidence score

**Example:**
```typescript
const result = await lovable.functions.invoke('predict-next-concept', {
  userId: 'user_123',
  pathId: 'path_123',
  history: [
    { concept: 'variables', correct: true },
    { concept: 'loops', correct: true }
  ]
});
```

---

### `generate-explanation.ts`
**Purpose:** Generates AI-powered explanations for concepts

**Triggered by:** User clicking "Explain this concept"

**Parameters:**
- `concept` - Concept to explain
- `userLevel` - User's proficiency level
- `learningStyle` - Preferred learning style
- `context` - Optional context

**Returns:** Personalized explanation with examples and visuals

**Example:**
```typescript
const result = await lovable.functions.invoke('generate-explanation', {
  concept: 'recursion',
  userLevel: 'intermediate',
  learningStyle: 'visual'
});
```

---

## Environment Variables

Functions require these environment variables (set in Lovable dashboard):

```env
AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_API_KEY=your_api_key_here
```

## Testing Functions Locally

Use the Lovable CLI to test functions:

```bash
# Install Lovable CLI
npm install -g @lovable/cli

# Test a function
lovable functions invoke generate-path --data '{"userId":"test","subject":"programming",...}'

# View logs
lovable functions logs generate-path
```

## Deployment

Functions auto-deploy when you push to your repository:

```bash
git add lovable/functions/
git commit -m "Update functions"
git push
```

Monitor deployments in the Lovable dashboard.

## Error Handling

All functions include error handling and return:

```typescript
{
  success: boolean;
  data?: any;
  error?: string;
}
```

## Performance

- Functions are serverless and scale automatically
- Cold start: ~200ms
- Warm execution: ~50ms
- Database queries: ~20ms

## Monitoring

View function metrics in Lovable dashboard:
- Invocation count
- Error rate
- Average duration
- Success rate

## Best Practices

1. **Keep functions small** - Each function should do one thing well
2. **Use TypeScript** - Strong typing prevents errors
3. **Handle errors gracefully** - Always return meaningful error messages
4. **Log important events** - Use `console.log` for debugging
5. **Test thoroughly** - Use the Lovable CLI to test before deploying


