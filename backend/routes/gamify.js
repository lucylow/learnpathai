const express = require('express');
const router = express.Router();

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

module.exports = router;


