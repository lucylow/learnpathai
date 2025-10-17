# 📦 Lovable Cloud Installation Guide

Complete step-by-step installation and setup instructions for integrating Lovable Cloud with LearnPath AI.

---

## Prerequisites

- Node.js 18+ installed
- Python 3.9+ installed
- Git installed
- A Lovable account ([sign up at lovable.dev](https://lovable.dev))

---

## Installation Steps

### 1. Install Lovable SDK

Add the Lovable SDK to your project:

```bash
npm install @lovable/sdk
```

Or with Yarn:

```bash
yarn add @lovable/sdk
```

### 2. Set Up Lovable Cloud Project

1. Visit [lovable.dev/dashboard](https://lovable.dev/dashboard)
2. Create a new project or select "LearnPath AI"
3. Go to **Settings** → **Lovable Cloud**
4. Click **"Enable Lovable Cloud"**
5. You'll see:
   - **Project ID**: `proj_xxxxxxxxxxxxx`
   - **API Key**: `lovable_xxxxxxxxxxxxx`
6. Copy both values

### 3. Configure Environment Variables

Create a `.env` file in your project root:

```bash
# If you don't have a .env file yet
cp .env.lovable.example .env
```

Edit `.env` and add:

```env
# Lovable Cloud
VITE_LOVABLE_PROJECT_ID=proj_xxxxxxxxxxxxx
VITE_LOVABLE_API_KEY=lovable_xxxxxxxxxxxxx

# AI Service (your Python backend)
VITE_AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_API_KEY=your_secret_key_here

# Optional
VITE_ENABLE_LOVABLE_CLOUD=true
```

### 4. Update package.json

Merge the contents of `package.json.lovable-update` into your `package.json`:

```json
{
  "dependencies": {
    "@lovable/sdk": "^1.0.0"
  },
  "scripts": {
    "dev": "vite",
    "lovable:dev": "lovable dev",
    "lovable:deploy": "lovable deploy"
  }
}
```

Then run:

```bash
npm install
```

### 5. Configure Database (Automatic)

Lovable will auto-provision these tables when you first run the app:

- `learning_paths` - Stores user learning paths
- `user_progress` - Tracks progress and attempts
- `analytics_events` - Records all user events

No manual database setup needed! 🎉

### 6. Configure Storage Buckets (Automatic)

Lovable auto-creates these storage buckets:

- `user-uploads` - For user files
- `learning-resources` - For educational content
- `avatars` - For profile pictures
- `certificates` - For completion certificates

### 7. Deploy Backend Functions

The backend functions in `/lovable/functions/` will auto-deploy when you push to Git:

```bash
git add lovable/
git commit -m "Add Lovable backend functions"
git push
```

Or deploy manually:

```bash
npx lovable deploy functions
```

### 8. Update Your App Entry Point

Update `src/main.tsx` to include the Lovable Auth Provider:

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LovableAuthProvider } from './components/lovable/LovableAuthProvider';
import App from './App';
import './index.css';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <LovableAuthProvider>
          <App />
        </LovableAuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
```

### 9. Update App Routes

Update `src/App.tsx` to include Lovable routes:

```tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useLovableAuth } from './components/lovable/LovableAuthProvider';
import { LovableLoginPage } from './components/lovable/LovableLoginPage';
import { LovableDashboard } from './pages/LovableDashboard';
import { CreateLovablePath } from './pages/CreateLovablePath';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LovableLoginPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><LovableDashboard /></ProtectedRoute>} />
      <Route path="/create-path" element={<ProtectedRoute><CreateLovablePath /></ProtectedRoute>} />
      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useLovableAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  
  return children;
}

export default App;
```

---

## Starting the Application

### Development Mode

Start both the frontend and AI service:

```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: AI Service
cd ai-service
python app.py
```

Your app will be available at:
- Frontend: http://localhost:5173
- AI Service: http://localhost:8000

### Production Deployment

Deploy to Lovable Cloud:

```bash
git push origin main
```

Your app will automatically deploy to: `https://learnpathai.lovable.app`

---

## Verification Checklist

After installation, verify everything works:

### ✅ Authentication
1. Go to http://localhost:5173/login
2. Sign in with Google/GitHub/Email
3. Should redirect to `/dashboard`

### ✅ Database
1. Create a new learning path
2. Check Lovable dashboard → Database
3. Should see entry in `learning_paths` table

### ✅ Backend Functions
1. Create a learning path (triggers `generate-path`)
2. Check Lovable dashboard → Functions → Logs
3. Should see successful invocation

### ✅ Analytics
1. Complete some actions (create path, view nodes)
2. Check dashboard analytics summary
3. Should see event counts

### ✅ Storage
1. Upload a file (if you've added file upload UI)
2. Check Lovable dashboard → Storage
3. Should see file in appropriate bucket

---

## Troubleshooting

### Problem: "Project ID not found"

**Solution:**
- Check `.env` file has correct `VITE_LOVABLE_PROJECT_ID`
- Restart dev server: `npm run dev`
- Verify project exists in Lovable dashboard

### Problem: "Authentication failed"

**Solution:**
- Verify `VITE_LOVABLE_API_KEY` in `.env`
- Make sure Lovable Cloud is enabled in dashboard
- Check browser console for specific errors

### Problem: "Function execution failed"

**Solution:**
- Ensure AI service is running: `cd ai-service && python app.py`
- Check AI service URL: `AI_SERVICE_URL=http://localhost:8000`
- View function logs in Lovable dashboard

### Problem: "Database connection error"

**Solution:**
- Verify Lovable Cloud is enabled
- Check user is authenticated
- Review database permissions in dashboard

### Problem: "CORS errors"

**Solution:**
- Add your domain to `lovable.config.json` cors origins
- Redeploy: `git push`

---

## Environment Variables Reference

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `VITE_LOVABLE_PROJECT_ID` | Your Lovable project ID | ✅ Yes | `proj_abc123` |
| `VITE_LOVABLE_API_KEY` | Your Lovable API key | ✅ Yes | `lovable_xyz789` |
| `VITE_AI_SERVICE_URL` | URL of Python AI service | ✅ Yes | `http://localhost:8000` |
| `AI_SERVICE_URL` | AI service URL (for functions) | ✅ Yes | `http://localhost:8000` |
| `AI_SERVICE_API_KEY` | API key for AI service | ⚠️ Recommended | `secret_key_123` |
| `VITE_ENABLE_LOVABLE_CLOUD` | Enable Lovable features | ❌ Optional | `true` |

---

## File Structure Overview

```
learnpathai/
├── lovable/                          # Lovable backend
│   ├── functions/                    # Serverless functions
│   │   ├── generate-path.ts
│   │   ├── update-path.ts
│   │   ├── reroute-path.ts
│   │   ├── predict-next-concept.ts
│   │   └── generate-explanation.ts
│   ├── lovable.config.json           # Lovable configuration
│   └── README.md
├── src/
│   ├── lib/
│   │   └── lovable.ts                # SDK client
│   ├── services/                     # Service layer
│   │   ├── lovable-auth.service.ts
│   │   ├── lovable-path.service.ts
│   │   ├── lovable-analytics.service.ts
│   │   └── lovable-storage.service.ts
│   ├── components/lovable/           # Auth components
│   │   ├── LovableAuthProvider.tsx
│   │   └── LovableLoginPage.tsx
│   ├── pages/                        # Page components
│   │   ├── LovableDashboard.tsx
│   │   └── CreateLovablePath.tsx
│   └── hooks/
│       └── useLovablePath.ts         # Custom hook
├── .env                              # Environment variables
├── .env.lovable.example              # Example env file
└── package.json                      # Dependencies
```

---

## Next Steps

1. ✅ **Customize UI** - Modify components to match your brand
2. ✅ **Add Features** - Create more backend functions
3. ✅ **Monitor Usage** - Check Lovable dashboard regularly
4. ✅ **Deploy** - Push to production

---

## Additional Resources

- 📖 **Quick Start**: `LOVABLE_QUICKSTART.md`
- 📘 **Full Setup Guide**: `LOVABLE_CLOUD_SETUP.md`
- 📗 **Integration Summary**: `LOVABLE_INTEGRATION_SUMMARY.md`
- 📙 **Function Docs**: `lovable/README.md`
- 🌐 **Official Docs**: [lovable.dev/docs](https://lovable.dev/docs)
- 💬 **Community**: [lovable.dev/community](https://lovable.dev/community)

---

## Support

Need help?

1. Check the documentation files in this project
2. Visit [lovable.dev/docs](https://lovable.dev/docs)
3. Join the community at [lovable.dev/community](https://lovable.dev/community)
4. Email support: support@lovable.dev

---

**Congratulations!** 🎉 

You've successfully integrated Lovable Cloud with LearnPath AI!

Your app now has enterprise-grade backend infrastructure with zero configuration. Happy coding! 🚀


