

# 🧭 LearnPath AI

**AI-Powered Personalized Learning Pathway Generator**

LearnPath AI is an adaptive education platform that builds personalized learning journeys using Artificial Intelligence. It dynamically diagnoses knowledge gaps, curates multimodal learning resources, and adjusts in real time—helping learners reach mastery faster while empowering educators with actionable insights.

Built using **React**, **TypeScript**, **Vite**, **Tailwind CSS**, and **shadcn-ui**, this project demonstrates a polished, full-stack AI-driven learning experience deployed via **Lovable.dev**.

***

## 🚀 Features

- ✨ **AI-Adaptive Pathways** — Personalized sequences designed from knowledge graphs.  
- 🧠 **NLP-Powered Content Tagging** — Semantic analysis with spaCy and Whisper for difficulty ranking.  
- 🎯 **Micro-Assessment Engine** — Diagnoses learning gaps with continuous feedback loops.  
- 📊 **Educator Dashboard** — Real-time student analytics and adaptive insights.  
- 🌍 **Accessibility & Inclusivity** — Multi-modality content with low-bandwidth support and captions.  
- ⚙️ **Modern Stack** — Vite + React + TypeScript + Tailwind + shadcn-ui for maximum developer experience.  

***

## 🏗️ Architecture Overview

```
┌───────────────────────────────┐
│           Frontend            │
│  React + TypeScript + Vite    │
│  (UI Components via shadcn)   │
└──────────────┬────────────────┘
               │
┌──────────────▼────────────────┐
│            Backend             │
│   Node.js / Express API        │
│   Routes: /auth, /paths, /ai   │
└──────────────┬────────────────┘
               │
┌──────────────▼────────────────┐
│             AI Core            │
│  FastAPI + Python ML Modules   │
│  - NLP Engine (spaCy)          │
│  - Knowledge Graph Builder     │
│  - Recommendation Engine       │
└──────────────┬────────────────┘
               │
┌──────────────▼────────────────┐
│           Database             │
│ MongoDB for Users & Resources  │
└───────────────────────────────┘
```

***

## 🧩 Tech Stack

| Layer | Tools / Frameworks |
|-------|----------------------|
| Frontend | React 18, TypeScript, Vite, shadcn-ui, Tailwind CSS |
| Backend | Node.js, Express, FastAPI (Python microservice) |
| Database | MongoDB (Atlas or Local) |
| AI/ML | spaCy, scikit-learn, OpenAI Whisper |
| Deployment | Lovable.dev + Vercel / Render |
| Version Control | GitHub + GitHub Actions |

***

## ⚙️ Getting Started

### 🧰 Prerequisites
- Node.js 18+  
- npm or pnpm  
- Python 3.10+ (for AI microservices)  
- MongoDB instance (local or Atlas)

***

### 🪄 Installation

```bash
# Step 1: Clone the repository
git clone https://github.com/lucylow/learnpathai.git
cd learnpathai

# Step 2: Install dependencies
npm i

# Step 3: Run the development server
npm run dev
```

Visit your app at **[http://localhost:5173](http://localhost:5173)** 🎨

***

## 🧠 Project Structure

```
/src
 ├── components/      # UI Components (shadcn, custom)
 ├── pages/           # LandingPage, Dashboard, About
 ├── hooks/           # Custom React hooks
 ├── lib/             # Utility and helper functions
 ├── styles/          # Tailwind and theme configs
 └── main.tsx         # Entry point
/backend
 ├── api/             # Node/Express routes
 └── services/        # AI + data services
/ai-service
 ├── nlp_processor.py
 ├── recommendation_engine.py
 └── knowledge_graph.py
```

***

## 🌟 Development Roadmap

- [x] MVP with Adaptive Path Builder  
- [x] Landing Page + Multi-Page Navigation  
- [ ] Graph Visualization for Learning Pathways  
- [ ] AI Tutor Chat Interface  
- [ ] Gamification Dashboard & Leaderboards  
- [ ] API Marketplace Integration  

***

## 🧪 Testing

Use Jest + React Testing Library for component testing:

```bash
npm run test
```

For API and AI services testing, use **Supertest** and **Pytest** respectively.

***

## 🌐 Deployment

Lovable.dev deployment commands:

1. Open Lovable → Share → Publish.  
2. Add a custom domain under `Project > Settings > Domains`.  
3. Configure environment variables for AI endpoints or databases.

***

## 🧭 Contributing

Contributions are warmly welcome!  
To contribute:

1. Fork the repo  
2. Create your feature branch (`git checkout -b feature/new-feature`)  
3. Commit your changes (`git commit -m "Add feature"`)  
4. Push to your branch (`git push origin feature/new-feature`)  
5. Open a Pull Request

***

## 🪪 License

This project is licensed under the **MIT License**.

***

## 👩‍💻 Author

**Lucy Low**  
🔗 [GitHub Profile](https://github.com/lucylow)  
🌐 [Lovable Project](https://lovable.dev/projects/67555a14-df22-4a19-9542-240343a586ff)

***

## ❤️ Acknowledgments

- EduHacks AI Fest for inspiring the base application.  
- OpenAI & Google Gemini APIs for AI integrations.  
- The shadcn-ui community for elegant UI components.  
