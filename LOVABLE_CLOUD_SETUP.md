# Lovable Cloud Integration Guide for LearnPath AI

This guide provides step-by-step instructions for setting up and using Lovable Cloud with your LearnPath AI project.

## 🚀 Quick Start

### 1. Enable Lovable Cloud

1. Go to [Lovable Dashboard](https://lovable.dev/dashboard)
2. Select or create your LearnPath AI project
3. Navigate to **Settings** → **Lovable Cloud**
4. Click **Enable Lovable Cloud**
5. Copy your **Project ID** and **API Key**

### 2. Configure Environment Variables

Create a `.env` file in your project root:

```bash
# Copy the example file
cp .env.example .env
```

Edit `.env` and add your Lovable credentials:

```env
VITE_LOVABLE_PROJECT_ID=your_project_id_here
VITE_LOVABLE_API_KEY=your_api_key_here
```

### 3. Install Lovable SDK

```bash
npm install @lovable/sdk
# or
yarn add @lovable/sdk
```

### 4. Run Your Application

```bash
# Start the development server
npm run dev

# In a separate terminal, start the AI service
cd ai-service
python app.py
```

## 📦 What's Included

### ✅ Backend Functions (Serverless)

Located in `/lovable/functions/`:

- **`generate-path.ts`** - Generates personalized learning paths using AI
- **`update-path.ts`** - Updates paths based on new user attempts
- **`reroute-path.ts`** - Adaptive rerouting when users struggle
- **`predict-next-concept.ts`** - DKT-based next concept prediction
- **`generate-explanation.ts`** - RAG-powered concept explanations

### ✅ Frontend Services

Located in `/src/services/`:

- **`lovable-auth.service.ts`** - Authentication management
- **`lovable-path.service.ts`** - Learning path operations
- **`lovable-analytics.service.ts`** - Event tracking and analytics
- **`lovable-storage.service.ts`** - File upload/download

### ✅ React Components

Located in `/src/components/lovable/` and `/src/pages/`:

- **`LovableAuthProvider.tsx`** - Authentication context provider
- **`LovableLoginPage.tsx`** - Login UI with Lovable auth
- **`LovableDashboard.tsx`** - Main dashboard with user paths
- **`CreateLovablePath.tsx`** - Path creation form

### ✅ Custom Hooks

Located in `/src/hooks/`:

- **`useLovablePath.ts`** - React Query hook for path operations

## 🔧 Configuration

### Database Schema

Lovable Cloud auto-provisions these tables:

#### `learning_paths`
```typescript
{
  id: string;
  user_id: string;
  subject: string;
  title: string;
  nodes: PathNode[];
  overall_mastery: number;
  learning_style: string;
  learning_goal: string;
  estimated_hours: number;
  created_at: string;
  updated_at: string;
}
```

#### `user_progress`
```typescript
{
  id: string;
  user_id: string;
  path_id: string;
  concept_id: string;
  attempts: Attempt[];
  mastery_level: number;
  time_spent_minutes: number;
  last_activity: string;
}
```

#### `analytics_events`
```typescript
{
  id: string;
  user_id: string;
  event_type: string;
  event_data: Record<string, any>;
  timestamp: string;
}
```

### Storage Buckets

Lovable Cloud provides these storage buckets:

- **`user-uploads`** - User-generated content (notes, projects)
- **`learning-resources`** - Educational materials (videos, PDFs)
- **`avatars`** - User profile pictures
- **`certificates`** - Generated completion certificates

## 🔐 Authentication

### Built-in Auth UI

```tsx
import { lovable } from './lib/lovable';

<lovable.auth.SignIn
  onSuccess={() => navigate('/dashboard')}
  providers={['google', 'github', 'email']}
/>
```

### Using Auth Service

```typescript
import lovableAuthService from './services/lovable-auth.service';

// Get current user
const user = await lovableAuthService.getCurrentUser();

// Check authentication
if (lovableAuthService.isAuthenticated()) {
  // User is logged in
}

// Sign out
await lovableAuthService.signOut();
```

### Auth Context Hook

```tsx
import { useLovableAuth } from './components/lovable/LovableAuthProvider';

function MyComponent() {
  const { user, isAuthenticated, signOut } = useLovableAuth();
  
  return (
    <div>
      {isAuthenticated ? (
        <p>Welcome, {user.email}!</p>
      ) : (
        <p>Please log in</p>
      )}
    </div>
  );
}
```

## 📊 Learning Path Operations

### Create a Learning Path

```typescript
import lovablePathService from './services/lovable-path.service';

const path = await lovablePathService.generatePath({
  subject: 'programming',
  userAttempts: [],
  learningStyle: 'visual',
  learningGoal: 'Master Python basics',
});
```

### Update Path Progress

```typescript
const updatedPath = await lovablePathService.updatePathProgress(
  pathId,
  [
    { concept: 'variables', correct: true },
    { concept: 'loops', correct: false },
  ]
);
```

### Adaptive Rerouting

```typescript
const reroutedPath = await lovablePathService.reroutePath(
  pathId,
  'control_structures' // concept user struggled with
);
```

### React Query Hook

```tsx
import { useLovablePath } from './hooks/useLovablePath';

function PathViewer({ pathId }) {
  const { path, isLoading, updateProgress } = useLovablePath(pathId);
  
  const handleAttempt = async (attempts) => {
    await updateProgress.mutateAsync({ pathId, attempts });
  };
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>{path.title}</h1>
      <p>Mastery: {path.overall_mastery * 100}%</p>
    </div>
  );
}
```

## 📈 Analytics Tracking

### Track Events

```typescript
import lovableAnalyticsService from './services/lovable-analytics.service';

// Track node completion
await lovableAnalyticsService.trackNodeCompleted({
  pathId: 'path_123',
  conceptId: 'variables',
  timeSpent: 180,
  mastery: 0.85,
});

// Track quiz attempt
await lovableAnalyticsService.trackQuizAttempt({
  pathId: 'path_123',
  conceptId: 'loops',
  score: 8,
  totalQuestions: 10,
  correctAnswers: 8,
});

// Track resource access
await lovableAnalyticsService.trackResourceAccessed({
  resourceId: 'video_123',
  resourceType: 'video',
  conceptId: 'functions',
});
```

### Get Analytics Summary

```typescript
const analytics = await lovableAnalyticsService.getUserAnalytics();

console.log(analytics);
// {
//   totalEvents: 150,
//   completedNodes: 12,
//   quizAttempts: 25,
//   pathsCreated: 3,
//   pathsCompleted: 1,
//   adaptiveReroutes: 2
// }
```

## 📁 File Storage

### Upload Files

```typescript
import lovableStorageService from './services/lovable-storage.service';

// Upload user file
const url = await lovableStorageService.uploadUserFile(
  file,
  (progress) => {
    console.log(`Upload: ${progress.percent}%`);
  }
);

// Upload avatar
const avatarUrl = await lovableStorageService.uploadAvatar(avatarFile);

// Upload multiple files
const urls = await lovableStorageService.uploadMultipleFiles(
  [file1, file2, file3],
  (fileIndex, progress) => {
    console.log(`File ${fileIndex}: ${progress.percent}%`);
  }
);
```

### Download Files

```typescript
const blob = await lovableStorageService.downloadFile('user-uploads', 'path/to/file.pdf');

// Create download link
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'file.pdf';
a.click();
```

## 🔌 Backend Functions

Backend functions automatically connect to your AI service. Make sure your AI service is running:

```bash
cd ai-service
python app.py
```

### Environment Variables for Functions

Backend functions use these environment variables (set in Lovable dashboard):

- `AI_SERVICE_URL` - URL of your Python AI service
- `AI_SERVICE_API_KEY` - API key for authentication

## 🎨 UI Components

### Update Your Routes

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LovableAuthProvider } from './components/lovable/LovableAuthProvider';
import { LovableLoginPage } from './components/lovable/LovableLoginPage';
import { LovableDashboard } from './pages/LovableDashboard';
import { CreateLovablePath } from './pages/CreateLovablePath';

function App() {
  return (
    <BrowserRouter>
      <LovableAuthProvider>
        <Routes>
          <Route path="/login" element={<LovableLoginPage />} />
          <Route path="/dashboard" element={<LovableDashboard />} />
          <Route path="/create-path" element={<CreateLovablePath />} />
        </Routes>
      </LovableAuthProvider>
    </BrowserRouter>
  );
}
```

## 🚢 Deployment

### Deploy Backend Functions

Backend functions auto-deploy when you push to Lovable:

```bash
git add lovable/functions/
git commit -m "Add Lovable functions"
git push
```

### Deploy Frontend

Lovable Cloud handles frontend deployment automatically. Just push your code:

```bash
git push origin main
```

Your app will be available at: `https://your-project.lovable.app`

## 📚 Additional Resources

- [Lovable Cloud Docs](https://lovable.dev/docs/cloud)
- [Lovable Functions Reference](https://lovable.dev/docs/functions)
- [Authentication Guide](https://lovable.dev/docs/auth)
- [Database Guide](https://lovable.dev/docs/database)
- [Storage Guide](https://lovable.dev/docs/storage)

## 🐛 Troubleshooting

### Authentication Issues

If users can't log in:
1. Check that Lovable Cloud is enabled in dashboard
2. Verify environment variables are set correctly
3. Make sure `VITE_LOVABLE_PROJECT_ID` is correct

### Function Errors

If backend functions fail:
1. Check AI service is running at `AI_SERVICE_URL`
2. Verify `AI_SERVICE_API_KEY` is correct
3. Check Lovable function logs in dashboard

### Database Connection

If database operations fail:
1. Verify project has Lovable Cloud enabled
2. Check user is authenticated
3. Review database permissions in Lovable dashboard

## 💡 Tips

- Use the Lovable dashboard to monitor function invocations
- Set up analytics to track user behavior
- Enable storage for user-generated content
- Use the built-in auth UI for faster development
- Leverage serverless functions for AI-heavy operations

## 🎉 Next Steps

1. **Customize the UI** - Modify components to match your brand
2. **Add More Functions** - Create additional backend functions for custom logic
3. **Set Up Monitoring** - Use Lovable dashboard to track usage
4. **Deploy to Production** - Push your code and go live!

---

**Questions?** Check out the [Lovable Community](https://lovable.dev/community) or [Lovable Docs](https://lovable.dev/docs).


