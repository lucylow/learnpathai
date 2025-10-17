const express = require('express');
const router = express.Router();
const gamificationService = require('../services/gamificationService');

// User progress storage (replace with DB in production)
const userProgress = new Map();

// XP requirements for each level (exponential growth)
const levelRequirements = [
  0, 100, 250, 500, 850, 1300, 1850, 2500, 3250, 4100,
  5050, 6100, 7250, 8500, 9850, 11300, 12850, 14500, 16250, 18100,
  20050, 22100, 24250, 26500, 28850, 31300, 33850, 36500, 39250, 42100
];

// Award XP to a user
router.post('/award-xp', (req, res) => {
  try {
    const { userId, xp, source, metadata } = req.body;
    
    if (!userId || !xp) {
      return res.status(400).json({ error: 'userId and xp are required' });
    }

    if (!userProgress.has(userId)) {
      userProgress.set(userId, {
        xp: 0,
        level: 1,
        streak: 0,
        badges: [],
        lastActive: new Date(),
        history: []
      });
    }

    const progress = userProgress.get(userId);
    const oldXP = progress.xp;
    const oldLevel = progress.level;
    
    progress.xp += xp;
    progress.lastActive = new Date();
    progress.history.push({
      timestamp: new Date(),
      xp,
      source,
      metadata
    });
    
    // Check for level up
    const newLevel = calculateLevel(progress.xp);
    const leveledUp = newLevel > progress.level;
    
    if (leveledUp) {
      progress.level = newLevel;
      progress.streak += 1;
    }

    userProgress.set(userId, progress);

    const response = {
      success: true,
      oldXP,
      newXP: progress.xp,
      xpGained: xp,
      oldLevel,
      newLevel: progress.level,
      leveledUp,
      streak: progress.streak
    };

    if (leveledUp) {
      response.levelUpData = {
        level: newLevel,
        rewards: calculateLevelRewards(newLevel),
        nextLevelXP: levelRequirements[newLevel] || levelRequirements[levelRequirements.length - 1]
      };
    }

    res.json(response);
  } catch (error) {
    console.error('Error awarding XP:', error);
    res.status(500).json({ error: 'Failed to award XP' });
  }
});

// Get user progress
router.get('/progress/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userProgress.has(userId)) {
      // Initialize new user
      userProgress.set(userId, {
        xp: 0,
        level: 1,
        streak: 0,
        badges: [],
        lastActive: new Date(),
        history: []
      });
    }

    const progress = userProgress.get(userId);
    const nextLevelXP = levelRequirements[progress.level] || levelRequirements[levelRequirements.length - 1];
    const currentLevelXP = levelRequirements[progress.level - 1] || 0;
    const progressToNextLevel = progress.xp - currentLevelXP;
    const xpForNextLevel = nextLevelXP - currentLevelXP;

    res.json({
      userId,
      xp: progress.xp,
      level: progress.level,
      streak: progress.streak,
      badges: progress.badges || [],
      nextLevelXP,
      progressToNextLevel: Math.max(0, progressToNextLevel),
      xpForNextLevel,
      progressPercentage: Math.min(100, Math.round((progressToNextLevel / xpForNextLevel) * 100)),
      lastActive: progress.lastActive,
      totalBadges: (progress.badges || []).length,
      recentHistory: (progress.history || []).slice(-5).reverse()
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

// Award a badge
router.post('/award-badge', (req, res) => {
  try {
    const { userId, badgeId, badgeName, description, rarity = 'common' } = req.body;
    
    if (!userId || !badgeId || !badgeName) {
      return res.status(400).json({ error: 'userId, badgeId, and badgeName are required' });
    }

    if (!userProgress.has(userId)) {
      userProgress.set(userId, { 
        xp: 0, 
        level: 1, 
        streak: 0,
        badges: [],
        lastActive: new Date(),
        history: []
      });
    }

    const progress = userProgress.get(userId);
    if (!progress.badges) progress.badges = [];
    
    // Check if badge already earned
    if (progress.badges.some(b => b.id === badgeId)) {
      return res.json({ 
        success: false, 
        message: 'Badge already earned' 
      });
    }

    const badge = {
      id: badgeId,
      name: badgeName,
      description: description || '',
      earnedAt: new Date(),
      rarity: rarity
    };

    progress.badges.push(badge);
    userProgress.set(userId, progress);

    // Award bonus XP for badge
    const bonusXP = calculateBadgeXP(rarity);
    if (bonusXP > 0) {
      progress.xp += bonusXP;
      userProgress.set(userId, progress);
    }

    res.json({ 
      success: true, 
      badge,
      bonusXP
    });
  } catch (error) {
    console.error('Error awarding badge:', error);
    res.status(500).json({ error: 'Failed to award badge' });
  }
});

// Get all badges for a user
router.get('/badges/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const progress = userProgress.get(userId) || { badges: [] };
    
    res.json({
      userId,
      badges: progress.badges || [],
      totalBadges: (progress.badges || []).length,
      badgesByRarity: groupBadgesByRarity(progress.badges || [])
    });
  } catch (error) {
    console.error('Error fetching badges:', error);
    res.status(500).json({ error: 'Failed to fetch badges' });
  }
});

// Get leaderboard
router.get('/leaderboard', (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const leaderboard = Array.from(userProgress.entries())
      .map(([userId, progress]) => ({
        userId,
        xp: progress.xp,
        level: progress.level,
        badges: (progress.badges || []).length,
        streak: progress.streak
      }))
      .sort((a, b) => b.xp - a.xp)
      .slice(0, parseInt(limit));

    res.json({ leaderboard });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Helper functions
function calculateLevel(xp) {
  for (let level = levelRequirements.length - 1; level >= 0; level--) {
    if (xp >= levelRequirements[level]) {
      return level + 1;
    }
  }
  return 1;
}

function calculateLevelRewards(level) {
  const rewards = {
    xp: level * 50,
    badges: [],
    title: null
  };

  if (level % 5 === 0) {
    rewards.badges.push(`Level ${level} Achiever`);
  }
  
  if (level === 10) {
    rewards.badges.push('Decade Master');
    rewards.title = 'Dedicated Learner';
  }
  
  if (level === 20) {
    rewards.badges.push('Score Champion');
    rewards.title = 'Expert Student';
  }

  return rewards;
}

function calculateBadgeXP(rarity) {
  const xpMap = {
    'common': 10,
    'rare': 25,
    'epic': 50,
    'legendary': 100
  };
  return xpMap[rarity] || 10;
}

function groupBadgesByRarity(badges) {
  return badges.reduce((acc, badge) => {
    const rarity = badge.rarity || 'common';
    if (!acc[rarity]) acc[rarity] = [];
    acc[rarity].push(badge);
    return acc;
  }, {});
}

// Generate AI-powered challenge
router.post('/generate-challenge', async (req, res) => {
  try {
    const { userId, concept, difficulty = 'beginner' } = req.body;
    
    if (!concept) {
      return res.status(400).json({ error: 'concept is required' });
    }

    // Get user context if userId is provided
    let userContext = {};
    if (userId && userProgress.has(userId)) {
      const progress = userProgress.get(userId);
      userContext = {
        knowledgeLevel: progress.level / 30, // Normalize to 0-1
        learningStyle: 'visual',
        preferredLanguages: 'Python, JavaScript'
      };
    }

    const challenge = await gamificationService.generateAdaptiveChallenge(
      concept, 
      difficulty,
      userContext
    );

    res.json({
      success: true,
      challenge
    });
  } catch (error) {
    console.error('Error generating challenge:', error);
    res.status(500).json({ 
      error: 'Failed to generate challenge',
      message: error.message 
    });
  }
});

// Generate personalized quest
router.post('/generate-quest', async (req, res) => {
  try {
    const { userId, concept } = req.body;
    
    if (!userId || !concept) {
      return res.status(400).json({ error: 'userId and concept are required' });
    }

    const progress = userProgress.get(userId) || { level: 1, xp: 0 };
    const userKnowledge = 0.5; // Could be fetched from KT service

    const quest = await gamificationService.generatePersonalizedQuest(
      concept,
      progress.level,
      userKnowledge
    );

    res.json({
      success: true,
      quest
    });
  } catch (error) {
    console.error('Error generating quest:', error);
    res.status(500).json({ 
      error: 'Failed to generate quest',
      message: error.message 
    });
  }
});

// Complete quest
router.post('/quests/complete', async (req, res) => {
  try {
    const { userId, questId, performance = {} } = req.body;
    
    if (!userId || !questId) {
      return res.status(400).json({ error: 'userId and questId are required' });
    }

    if (!userProgress.has(userId)) {
      return res.status(404).json({ error: 'User not found' });
    }

    const progress = userProgress.get(userId);
    
    // Award XP for quest completion
    const xpResult = await gamificationService.awardXP(
      progress,
      'quest_completed',
      performance,
      { questId }
    );

    progress.xp += xpResult.xp;
    progress.level = xpResult.newLevel;
    
    // Track completed quest
    if (!progress.completedQuests) progress.completedQuests = [];
    progress.completedQuests.push({
      questId,
      completedAt: new Date(),
      xpEarned: xpResult.xp,
      coinsEarned: xpResult.coins
    });

    userProgress.set(userId, progress);

    res.json({
      success: true,
      completed: true,
      rewards: {
        xp: xpResult.xp,
        coins: xpResult.coins,
        levelUp: xpResult.levelUp,
        newLevel: xpResult.newLevel,
        bonuses: xpResult.bonuses
      }
    });
  } catch (error) {
    console.error('Error completing quest:', error);
    res.status(500).json({ error: 'Failed to complete quest' });
  }
});

// Get all available badges
router.get('/badges/available', (req, res) => {
  try {
    const badges = gamificationService.getAllBadges();
    res.json({
      success: true,
      badges
    });
  } catch (error) {
    console.error('Error fetching available badges:', error);
    res.status(500).json({ error: 'Failed to fetch badges' });
  }
});

// Check badge eligibility
router.post('/badges/check-eligibility', async (req, res) => {
  try {
    const { userId, stats = {} } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const progress = userProgress.get(userId) || { badges: [], xp: 0, level: 1 };
    
    const eligibleBadges = await gamificationService.checkBadgeEligibility(
      progress,
      stats
    );

    res.json({
      success: true,
      eligibleBadges,
      count: eligibleBadges.length
    });
  } catch (error) {
    console.error('Error checking badge eligibility:', error);
    res.status(500).json({ error: 'Failed to check eligibility' });
  }
});

// Enhanced award XP with bonuses
router.post('/award-xp-enhanced', async (req, res) => {
  try {
    const { userId, activity, performance = {}, context = {} } = req.body;
    
    if (!userId || !activity) {
      return res.status(400).json({ error: 'userId and activity are required' });
    }

    if (!userProgress.has(userId)) {
      userProgress.set(userId, {
        xp: 0,
        level: 1,
        streak: 0,
        badges: [],
        lastActive: new Date(),
        history: []
      });
    }

    const progress = userProgress.get(userId);
    
    // Calculate XP with bonuses
    const result = await gamificationService.awardXP(
      progress,
      activity,
      performance,
      { ...context, activity }
    );

    // Update user progress
    progress.xp += result.xp;
    progress.level = result.newLevel;
    progress.lastActive = new Date();
    
    // Track in history
    progress.history.push({
      timestamp: new Date(),
      xp: result.xp,
      activity,
      bonuses: result.bonuses
    });

    userProgress.set(userId, progress);

    // Check for new badges
    const eligibleBadges = await gamificationService.checkBadgeEligibility(progress, {
      challengesSolved: progress.history.filter(h => h.activity === 'challenge_completed').length,
      accountAgeDays: 0 // Would need to track account creation
    });

    res.json({
      success: true,
      xp: result.xp,
      totalXp: progress.xp,
      coins: result.coins,
      levelUp: result.levelUp,
      oldLevel: result.oldLevel,
      newLevel: result.newLevel,
      bonuses: result.bonuses,
      newBadges: eligibleBadges
    });
  } catch (error) {
    console.error('Error awarding XP:', error);
    res.status(500).json({ error: 'Failed to award XP' });
  }
});

// Get user stats for demo
router.get('/stats/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const progress = userProgress.get(userId) || { 
      xp: 0, 
      level: 1, 
      badges: [], 
      history: [],
      streak: 0 
    };

    const levelProgress = gamificationService.calculateLevelProgress(progress.xp);
    
    const stats = {
      userId,
      xp: progress.xp,
      level: progress.level,
      levelProgress,
      streak: progress.streak,
      badges: progress.badges || [],
      totalBadges: (progress.badges || []).length,
      activitiesCompleted: (progress.history || []).length,
      xpToday: (progress.history || [])
        .filter(h => {
          const today = new Date().toDateString();
          return new Date(h.timestamp).toDateString() === today;
        })
        .reduce((sum, h) => sum + h.xp, 0),
      recentActivities: (progress.history || []).slice(-5).reverse()
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;


