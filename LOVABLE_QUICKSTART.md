# 🚀 Lovable Cloud - 5-Minute Quickstart

Get your LearnPath AI running with Lovable Cloud in 5 minutes!

## Step 1: Enable Lovable Cloud (2 minutes)

1. Go to **[lovable.dev/dashboard](https://lovable.dev/dashboard)**
2. Click **"Enable Lovable Cloud"** for your project
3. Copy your **Project ID** and **API Key**

## Step 2: Configure Environment (1 minute)

Create `.env` file:

```bash
VITE_LOVABLE_PROJECT_ID=paste_your_project_id
VITE_LOVABLE_API_KEY=paste_your_api_key
VITE_AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_URL=http://localhost:8000
```

## Step 3: Install SDK (1 minute)

```bash
npm install @lovable/sdk
```

## Step 4: Start Your App (1 minute)

```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: AI Service
cd ai-service
python app.py
```

## Step 5: Test It! (30 seconds)

1. Open http://localhost:5173/login
2. Sign in with Google/GitHub/Email
3. Click "Create New Path"
4. Watch AI generate your personalized learning path!

---

## 🎯 What Just Happened?

You now have:
- ✅ **Authentication** - User login with Google/GitHub
- ✅ **Database** - Learning paths and progress saved automatically
- ✅ **AI Functions** - Path generation, adaptive rerouting, DKT predictions
- ✅ **Analytics** - Event tracking for all user actions
- ✅ **Storage** - Upload files, certificates, avatars

All running serverless on Lovable Cloud!

---

## 📱 Test These Features

### Create a Learning Path
```
/dashboard → "+ Create New Path" → Fill form → Generate
```

### View Analytics
```
/dashboard → See stats: paths, nodes, quizzes, reroutes
```

### Adaptive Learning
```
Open a path → Fail a quiz → Watch AI add remediation nodes
```

---

## 🔥 Key URLs

- **Login**: `/login`
- **Dashboard**: `/dashboard`
- **Create Path**: `/create-path`
- **Lovable Dashboard**: [lovable.dev/dashboard](https://lovable.dev/dashboard)

---

## 💡 Quick Tips

1. **View backend function logs** in Lovable dashboard
2. **Monitor database** in Lovable dashboard
3. **Track analytics events** in real-time
4. **All data persists** across sessions

---

## 📚 Next Steps

- Read **LOVABLE_CLOUD_SETUP.md** for detailed docs
- Check **LOVABLE_INTEGRATION_SUMMARY.md** for architecture
- Customize UI in `src/pages/LovableDashboard.tsx`
- Add more backend functions in `lovable/functions/`

---

## 🆘 Troubleshooting

**Can't log in?**
→ Check `VITE_LOVABLE_PROJECT_ID` in `.env`

**Functions failing?**
→ Make sure AI service is running: `cd ai-service && python app.py`

**Database errors?**
→ Verify Lovable Cloud is enabled in dashboard

---

**You're all set! Happy coding! 🎉**

Need help? Check [lovable.dev/docs](https://lovable.dev/docs) or [lovable.dev/community](https://lovable.dev/community)


