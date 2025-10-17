// backend/services/gamificationService.js
const { GoogleGenerativeAI } = require('@google/generative-ai');

class GamificationService {
  constructor() {
    // Initialize Google Generative AI if API key is available
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    } else {
      console.warn('⚠️  No Gemini API key found. AI challenge generation will use fallback templates.');
    }
    
    this.XP_PER_LEVEL = 200;
    this.QUEST_TEMPLATES = new Map();
    this.BADGE_CRITERIA = new Map();
    this.initTemplates();
  }

  initTemplates() {
    // Quest templates for different concepts and difficulties
    this.QUEST_TEMPLATES.set('loops_beginner', {
      title: "Loop Master Quest",
      description: "Master the fundamentals of loops through interactive challenges",
      steps: [
        { type: 'watch', duration: 5, concept: 'loops' },
        { type: 'quiz', questions: 3, concept: 'loops', difficulty: 'beginner' },
        { type: 'practice', exercise: 'fill_blank', concept: 'loops' }
      ],
      xpReward: 50,
      coinsReward: 15,
      timeLimit: 900, // 15 minutes
      difficulty: 'beginner'
    });

    this.QUEST_TEMPLATES.set('arrays_intermediate', {
      title: "Array Warrior Quest",
      description: "Conquer array manipulation and data structures",
      steps: [
        { type: 'watch', duration: 7, concept: 'arrays' },
        { type: 'quiz', questions: 5, concept: 'arrays', difficulty: 'intermediate' },
        { type: 'practice', exercise: 'code_challenge', concept: 'arrays' }
      ],
      xpReward: 75,
      coinsReward: 25,
      timeLimit: 1200,
      difficulty: 'intermediate'
    });

    // Badge criteria
    this.BADGE_CRITERIA.set('loops_master', {
      name: "Loop Master",
      description: "Demonstrated mastery of loop concepts",
      icon: "🔄",
      criteria: {
        minProficiency: 0.8,
        minExercises: 5,
        perfectQuizzes: 2
      },
      rarity: 'uncommon'
    });

    this.BADGE_CRITERIA.set('streak_king', {
      name: "Streak King",
      description: "Maintained a 30-day learning streak",
      icon: "🔥",
      criteria: {
        minStreak: 30
      },
      rarity: 'rare'
    });

    this.BADGE_CRITERIA.set('early_explorer', {
      name: "Early Explorer",
      description: "Completed 10 activities in the first week",
      icon: "🧭",
      criteria: {
        activitiesCount: 10,
        withinDays: 7
      },
      rarity: 'common'
    });

    this.BADGE_CRITERIA.set('code_wizard', {
      name: "Code Wizard",
      description: "Solved 50+ coding challenges",
      icon: "⚡",
      criteria: {
        challengesSolved: 50
      },
      rarity: 'epic'
    });
  }

  // Calculate level from XP
  calculateLevel(xp) {
    return Math.floor(xp / this.XP_PER_LEVEL) + 1;
  }

  // Calculate progress to next level
  calculateLevelProgress(xp) {
    const currentLevel = this.calculateLevel(xp);
    const xpForCurrentLevel = (currentLevel - 1) * this.XP_PER_LEVEL;
    const xpInCurrentLevel = xp - xpForCurrentLevel;
    const progress = (xpInCurrentLevel / this.XP_PER_LEVEL) * 100;
    
    return {
      level: currentLevel,
      progress: Math.min(100, Math.round(progress)),
      xpToNext: this.XP_PER_LEVEL - xpInCurrentLevel,
      currentLevelXp: xpInCurrentLevel
    };
  }

  // Award XP with various bonuses
  async awardXP(userProgress, activity, performance, context = {}) {
    const baseXP = this.getBaseXP(activity);
    const bonuses = this.calculateBonuses(userProgress, performance, context);
    const totalXP = baseXP + bonuses.xpBonus;
    const totalCoins = bonuses.coinsBonus;

    // Check for level up
    const oldLevel = this.calculateLevel(userProgress.xp);
    const newLevel = this.calculateLevel(userProgress.xp + totalXP);

    return {
      xp: totalXP,
      coins: totalCoins,
      levelUp: newLevel > oldLevel,
      oldLevel,
      newLevel,
      bonuses: bonuses.breakdown
    };
  }

  getBaseXP(activity) {
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
    
    return xpValues[activity] || 5;
  }

  calculateBonuses(userProgress, performance, context) {
    let xpBonus = 0;
    let coinsBonus = 0;
    const breakdown = [];

    // Performance bonus
    if (performance.accuracy && performance.accuracy > 0.9) {
      const bonus = Math.floor(this.getBaseXP(context.activity || 'default') * 0.3);
      xpBonus += bonus;
      coinsBonus += 5;
      breakdown.push({ type: 'performance', amount: bonus, reason: 'High accuracy (90%+)' });
    }

    // Speed bonus (for quizzes)
    if (performance.responseTime && performance.expectedTime && 
        performance.responseTime < performance.expectedTime * 0.5) {
      const bonus = 5;
      xpBonus += bonus;
      breakdown.push({ type: 'speed', amount: bonus, reason: 'Lightning fast!' });
    }

    // Streak bonus
    if (userProgress.streak >= 7) {
      const bonus = 10;
      xpBonus += bonus;
      breakdown.push({ type: 'streak', amount: bonus, reason: `${userProgress.streak}-day streak!` });
    }

    // First attempt bonus
    if (context.firstAttempt) {
      const bonus = 8;
      xpBonus += bonus;
      breakdown.push({ type: 'first_attempt', amount: bonus, reason: 'First try success!' });
    }

    // Perfect score bonus
    if (performance.accuracy === 1.0) {
      const bonus = 10;
      xpBonus += bonus;
      coinsBonus += 3;
      breakdown.push({ type: 'perfect', amount: bonus, reason: 'Perfect score!' });
    }

    return { xpBonus, coinsBonus, breakdown };
  }

  // AI-generated adaptive challenges
  async generateAdaptiveChallenge(concept, difficulty, userContext = {}) {
    // If no AI available, use fallback
    if (!this.genAI) {
      return this.getFallbackChallenge(concept, difficulty);
    }

    const prompt = `Generate an engaging coding challenge for the concept "${concept}" at "${difficulty}" level.

Student Context:
- Knowledge level: ${userContext.knowledgeLevel || 0.5}
- Learning style: ${userContext.learningStyle || 'visual'}
- Preferred languages: ${userContext.preferredLanguages || 'Python, JavaScript'}

Requirements:
- Create a 2-5 minute challenge
- Include clear instructions and success criteria
- Make it interactive and engaging
- Provide 3 progressive hints (conceptual → specific → solution approach)
- Include starter code
- Make it parameterizable for uniqueness

Return ONLY valid JSON in this exact format:
{
  "title": "Challenge title",
  "description": "Clear, engaging instructions",
  "starterCode": "// TODO: Complete this function\\nfunction solve() {\\n  \\n}",
  "solution": "Complete solution code",
  "hints": ["Conceptual hint", "Specific hint", "Detailed approach"],
  "parameters": {"var1": ["val1", "val2"], "var2": ["valA", "valB"]},
  "xpReward": 25,
  "timeEstimate": 180
}`;

    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      
      // Clean up the response - remove markdown code blocks if present
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const challenge = JSON.parse(text);
      challenge.id = `ai_challenge_${Date.now()}`;
      challenge.concept = concept;
      challenge.difficulty = difficulty;
      challenge.generatedAt = new Date().toISOString();
      challenge.generatedBy = 'ai';
      
      return challenge;
    } catch (error) {
      console.error('AI challenge generation failed:', error.message);
      return this.getFallbackChallenge(concept, difficulty);
    }
  }

  // Fallback challenge templates when AI is not available
  getFallbackChallenge(concept, difficulty) {
    const challenges = {
      'python_loops': {
        beginner: {
          title: "Sum Numbers with Loops",
          description: "Write a function that uses a for loop to sum all numbers from 1 to n.",
          starterCode: "def sum_numbers(n):\n    # TODO: Use a for loop to sum numbers 1 to n\n    total = 0\n    # Your code here\n    return total",
          solution: "def sum_numbers(n):\n    total = 0\n    for i in range(1, n + 1):\n        total += i\n    return total",
          hints: [
            "Use the range() function to create a sequence of numbers",
            "Initialize a variable to keep track of the sum",
            "Loop through each number and add it to your sum variable"
          ],
          parameters: { n: [5, 10, 15, 20] },
          xpReward: 20,
          timeEstimate: 120
        },
        intermediate: {
          title: "FizzBuzz Challenge",
          description: "Print numbers 1 to n, but for multiples of 3 print 'Fizz', for multiples of 5 print 'Buzz', and for multiples of both print 'FizzBuzz'.",
          starterCode: "def fizzbuzz(n):\n    # TODO: Implement FizzBuzz\n    result = []\n    # Your code here\n    return result",
          solution: "def fizzbuzz(n):\n    result = []\n    for i in range(1, n + 1):\n        if i % 15 == 0:\n            result.append('FizzBuzz')\n        elif i % 3 == 0:\n            result.append('Fizz')\n        elif i % 5 == 0:\n            result.append('Buzz')\n        else:\n            result.append(str(i))\n    return result",
          hints: [
            "Check for divisibility using the modulo operator (%)",
            "Check for multiples of 15 first (both 3 and 5)",
            "Use elif statements to check conditions in order"
          ],
          parameters: { n: [15, 20, 30] },
          xpReward: 30,
          timeEstimate: 180
        }
      },
      'javascript_arrays': {
        beginner: {
          title: "Filter Even Numbers",
          description: "Create a function that filters an array to return only even numbers.",
          starterCode: "function filterEvens(numbers) {\n  // TODO: Return only even numbers\n  return [];\n}",
          solution: "function filterEvens(numbers) {\n  return numbers.filter(n => n % 2 === 0);\n}",
          hints: [
            "Use the array filter() method",
            "Check if a number is even using modulo operator (n % 2 === 0)",
            "The filter method takes a callback function that returns true/false"
          ],
          parameters: { 
            numbers: [[1,2,3,4,5,6], [10,15,20,25,30], [7,14,21,28,35]]
          },
          xpReward: 20,
          timeEstimate: 120
        }
      }
    };

    // Try to find matching challenge
    const conceptKey = concept.toLowerCase().replace(/\s+/g, '_');
    let challenge = challenges[conceptKey]?.[difficulty] || 
                   challenges['python_loops']?.[difficulty] ||
                   challenges['python_loops']?.['beginner'];

    return {
      id: `fallback_challenge_${Date.now()}`,
      concept,
      difficulty,
      generatedAt: new Date().toISOString(),
      generatedBy: 'template',
      ...challenge
    };
  }

  // Generate personalized quest
  async generatePersonalizedQuest(concept, userLevel, userKnowledge = 0.5) {
    const difficulty = userKnowledge < 0.4 ? 'beginner' :
                      userKnowledge < 0.7 ? 'intermediate' : 'advanced';
    
    const templateKey = `${concept}_${difficulty}`;
    const template = this.QUEST_TEMPLATES.get(templateKey) || 
                    this.QUEST_TEMPLATES.get('loops_beginner');
    
    const personalizedQuest = {
      ...template,
      id: `quest_${Date.now()}`,
      concept,
      difficulty,
      generatedAt: new Date().toISOString(),
      personalizedForLevel: userLevel
    };
    
    return personalizedQuest;
  }

  // Get all available badges
  getAllBadges() {
    const badges = [];
    for (const [badgeId, badgeInfo] of this.BADGE_CRITERIA) {
      badges.push({
        id: badgeId,
        ...badgeInfo
      });
    }
    return badges;
  }

  // Check if user qualifies for any new badges
  async checkBadgeEligibility(userProgress, userStats = {}) {
    const eligibleBadges = [];
    
    for (const [badgeId, badgeInfo] of this.BADGE_CRITERIA) {
      // Skip if already earned
      if (userProgress.badges && userProgress.badges.some(b => b.id === badgeId || b.badgeId === badgeId)) {
        continue;
      }

      const eligible = this.evaluateBadgeCriteria(badgeId, badgeInfo, userProgress, userStats);
      if (eligible) {
        eligibleBadges.push({
          id: badgeId,
          ...badgeInfo
        });
      }
    }
    
    return eligibleBadges;
  }

  evaluateBadgeCriteria(badgeId, badgeInfo, userProgress, userStats) {
    const criteria = badgeInfo.criteria;

    switch (badgeId) {
      case 'loops_master':
        return (userStats.loopsKnowledge || 0) >= 0.8 && 
               (userStats.loopsExercises || 0) >= 5 && 
               (userStats.perfectQuizzes || 0) >= 2;
               
      case 'streak_king':
        return (userProgress.streak || 0) >= (criteria.minStreak || 30);
        
      case 'early_explorer':
        const accountAge = userStats.accountAgeDays || 0;
        return accountAge <= (criteria.withinDays || 7) && 
               (userStats.activitiesCompleted || 0) >= (criteria.activitiesCount || 10);
               
      case 'code_wizard':
        return (userStats.challengesSolved || 0) >= (criteria.challengesSolved || 50);
    }
    
    return false;
  }
}

module.exports = new GamificationService();

