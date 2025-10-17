# 🎮 LearnPath.AI Gamification System

A comprehensive gamification and engagement system that makes learning fun, motivating, and rewarding through AI-powered challenges, badges, leaderboards, and more.

## 🌟 Features

### 1. **XP & Leveling System**
- Earn XP for completing learning activities
- Level up with exponential progression (200 XP per level)
- Visual progress bars with animations
- Bonus XP for performance, streaks, and achievements

### 2. **AI-Powered Challenges**
- Dynamically generated coding challenges using Google Gemini AI
- Personalized to user's skill level and learning style
- Progressive hint system (3 levels)
- Real-time timer and instant feedback
- Fallback templates when AI is unavailable

### 3. **Badge Collection**
- 12+ badges with rarity system (Common, Uncommon, Rare, Epic, Legendary)
- Achievement tracking (loops mastery, streaks, early explorer, etc.)
- Visual collection with progress indicators
- Automatic badge unlocking based on criteria

### 4. **Leaderboards**
- Privacy-preserving competitive rankings
- Multiple leaderboard types (XP, Efficiency, Streaks)
- Real-time updates
- Cohort-based filtering
- Visual rank indicators (🥇🥈🥉)

### 5. **Streak Tracking**
- Daily learning streaks
- Streak bonuses for XP
- Visual streak calendar
- Habit-building nudges

## 🚀 Quick Start

### Backend Setup

1. **Install dependencies:**
```bash
cd backend
npm install
```

2. **Set up environment variables:**
Create a `.env` file in the `backend` directory:
```env
PORT=3001
GEMINI_API_KEY=your_gemini_api_key_here
# OR
GOOGLE_API_KEY=your_google_api_key_here
```

3. **Start the backend:**
```bash
npm start
# OR for development
npm run dev
```

The backend will run on `http://localhost:3001`

### Frontend Setup

1. **Install dependencies:**
```bash
cd ../
npm install
```

Required packages:
- `framer-motion` - For animations
- `react-confetti` - For celebration effects
- `@google/generative-ai` - For AI challenge generation

2. **Start the frontend:**
```bash
npm run dev
```

3. **Access the gamification demo:**
Open your browser and navigate to:
```
http://localhost:5173/gamification-demo
```

## 📡 API Endpoints

### XP & Progress

#### Award XP
```http
POST /api/gamify/award-xp
Content-Type: application/json

{
  "userId": "user123",
  "xp": 25,
  "source": "challenge_completed",
  "metadata": {}
}
```

#### Award XP with Bonuses
```http
POST /api/gamify/award-xp-enhanced
Content-Type: application/json

{
  "userId": "user123",
  "activity": "challenge_completed",
  "performance": {
    "accuracy": 0.95,
    "responseTime": 120,
    "expectedTime": 180
  },
  "context": {
    "challengeId": "challenge_123",
    "firstAttempt": true
  }
}
```

#### Get User Progress
```http
GET /api/gamify/progress/:userId
```

#### Get User Stats
```http
GET /api/gamify/stats/:userId
```

### Challenges

#### Generate AI Challenge
```http
POST /api/gamify/generate-challenge
Content-Type: application/json

{
  "userId": "user123",
  "concept": "python_loops",
  "difficulty": "beginner"
}
```

### Quests

#### Generate Personalized Quest
```http
POST /api/gamify/generate-quest
Content-Type: application/json

{
  "userId": "user123",
  "concept": "arrays"
}
```

#### Complete Quest
```http
POST /api/gamify/quests/complete
Content-Type: application/json

{
  "userId": "user123",
  "questId": "quest_123",
  "performance": {
    "accuracy": 1.0
  }
}
```

### Badges

#### Get Available Badges
```http
GET /api/gamify/badges/available
```

#### Get User Badges
```http
GET /api/gamify/badges/:userId
```

#### Award Badge
```http
POST /api/gamify/award-badge
Content-Type: application/json

{
  "userId": "user123",
  "badgeId": "loops_master",
  "badgeName": "Loop Master",
  "description": "Mastered loop concepts",
  "rarity": "uncommon"
}
```

#### Check Badge Eligibility
```http
POST /api/gamify/badges/check-eligibility
Content-Type: application/json

{
  "userId": "user123",
  "stats": {
    "loopsKnowledge": 0.85,
    "loopsExercises": 6,
    "perfectQuizzes": 3
  }
}
```

### Leaderboard

#### Get Leaderboard
```http
GET /api/gamify/leaderboard?limit=20&cohort=demo_cohort
```

## 🎨 Frontend Components

### XPProgressBar
Displays user's XP, level, and progress to next level with animations.

```tsx
import XPProgressBar from '@/components/gamification/XPProgressBar';

<XPProgressBar 
  userId="user123"
  compact={false}
  onLevelUp={(level) => console.log('Level up!', level)}
/>
```

### BadgeCollection
Shows all available badges with earned/unearned states.

```tsx
import BadgeCollection from '@/components/gamification/BadgeCollection';

<BadgeCollection userId="user123" />
```

### AIChallenge
AI-generated coding challenge with hints and timer.

```tsx
import AIChallenge from '@/components/gamification/AIChallenge';

<AIChallenge 
  userId="user123"
  concept="python_loops"
  onComplete={(result) => console.log('Challenge result:', result)}
/>
```

### Leaderboard
Competitive rankings with privacy features.

```tsx
import Leaderboard from '@/components/gamification/Leaderboard';

<Leaderboard 
  userId="user123"
  cohort="demo_cohort"
/>
```

## 🎯 Integration Examples

### Award XP on Learning Activity

```typescript
// When user completes a learning step
const awardXPForStep = async (userId: string, stepId: string) => {
  const response = await fetch('http://localhost:3001/api/gamify/award-xp-enhanced', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      activity: 'step_completed',
      performance: {
        accuracy: 1.0
      },
      context: {
        stepId,
        firstAttempt: true
      }
    })
  });

  const data = await response.json();
  
  if (data.success && data.levelUp) {
    // Show level up celebration!
    showLevelUpModal(data.newLevel);
  }
};
```

### Check for New Badges

```typescript
// After significant learning activity
const checkBadges = async (userId: string) => {
  const response = await fetch('http://localhost:3001/api/gamify/badges/check-eligibility', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      stats: {
        loopsKnowledge: 0.85,
        loopsExercises: 6,
        perfectQuizzes: 3,
        challengesSolved: 15,
        accountAgeDays: 3
      }
    })
  });

  const data = await response.json();
  
  if (data.eligibleBadges.length > 0) {
    // Award badges
    for (const badge of data.eligibleBadges) {
      await awardBadge(userId, badge);
    }
  }
};
```

## 🎭 Demo Script for Judges

### 90-Second Walkthrough

1. **Landing (10s)**
   - "Welcome to LearnPath.AI's Gamification System"
   - Show the overview page with XP bar and quick stats

2. **AI Challenges (30s)**
   - Navigate to "AI Challenges"
   - Click "Generate New Challenge"
   - Show the AI-generated challenge
   - Demonstrate hints system
   - Submit a solution
   - Show XP reward animation

3. **Badge System (20s)**
   - Navigate to "Badges"
   - Show earned vs. unearned badges
   - Click on a badge to see details
   - Show progress indicators

4. **Leaderboard (15s)**
   - Navigate to "Leaderboard"
   - Show competitive rankings
   - Switch between XP and Streak views
   - Highlight privacy features

5. **Level Up Demo (15s)**
   - Click "Demo: Earn +25 XP" button
   - Show XP animation and progress bar update
   - Demonstrate potential level-up with confetti

### Key Talking Points

- ✅ **AI-Powered**: Challenges adapt to user skill level
- ✅ **Engaging**: XP, badges, and streaks motivate continuous learning
- ✅ **Privacy-First**: Leaderboards use anonymized IDs
- ✅ **Performance-Based**: Bonuses for accuracy, speed, and streaks
- ✅ **Comprehensive**: Multiple engagement mechanics working together

## 🔧 Configuration

### XP Values (in `gamificationService.js`)

```javascript
const xpValues = {
  'micro_quiz_completed': 10,
  'video_watched': 5,
  'interactive_completed': 15,
  'project_submitted': 30,
  'quest_completed': 50,
  'daily_streak': 25,
  'peer_help': 20,
  'challenge_completed': 25,
  'milestone_completed': 40,
  'step_completed': 8
};
```

### Badge Criteria

Add new badges in `gamificationService.js`:

```javascript
this.BADGE_CRITERIA.set('new_badge', {
  name: "Badge Name",
  description: "Badge description",
  icon: "🎯",
  criteria: {
    // Your criteria here
    minProficiency: 0.8,
    minExercises: 5
  },
  rarity: 'uncommon'
});
```

## 📊 Metrics & Analytics

Track these metrics for evaluation:

- **Engagement**: Daily active users, session length
- **Retention**: 7-day retention, streak length
- **Learning**: Pre→post quiz improvement, time-to-mastery
- **Motivation**: XP earned progression, quest completion rate
- **Fairness**: Success rate across cohorts

## 🛡️ Anti-Cheat Features

- Unique challenge parameterization per user
- Time-based pattern analytics
- Rate limiting on XP awards
- Server-side validation

## 🔒 Privacy & Security

- Anonymized leaderboard display
- Opt-out options for competitive features
- No sensitive data in URLs
- GDPR-compliant data handling

## 🚀 Production Deployment

### Environment Variables

```env
# Backend
PORT=3001
GEMINI_API_KEY=your_production_key
NODE_ENV=production

# Frontend
VITE_API_URL=https://api.yourapp.com
```

### Database Migration

Replace in-memory Maps with proper database:
- MongoDB for document storage
- PostgreSQL for relational data
- Redis for leaderboard caching

## 📚 Additional Resources

- [Gamification Best Practices](./docs/gamification-best-practices.md)
- [Badge Design Guide](./docs/badge-design.md)
- [AI Challenge Templates](./docs/challenge-templates.md)

## 🤝 Contributing

To add new gamification features:

1. Add backend logic to `services/gamificationService.js`
2. Create API endpoints in `routes/gamify.js`
3. Build React components in `components/gamification/`
4. Update this documentation

## 📝 License

MIT License - See LICENSE file for details

---

Built with ❤️ for LearnPath.AI
Making education engaging, one XP at a time! 🎮✨

