/**
 * Resource Ranking API Routes
 */

const express = require('express');
const router = express.Router();
const resourceRankingService = require('../services/resourceRankingService');

/**
 * POST /api/ranking/rank-resources
 * Rank resources based on outcome data and user profile
 */
router.post('/rank-resources', async (req, res) => {
  try {
    const { resources, userId, concept, userProfile } = req.body;

    if (!resources || !Array.isArray(resources)) {
      return res.status(400).json({
        error: 'Invalid request: resources array is required'
      });
    }

    const rankedResources = await resourceRankingService.rankResources(
      resources,
      userId || 'demo_user',
      concept,
      userProfile
    );

    res.json({
      success: true,
      rankedResources,
      metadata: {
        totalResources: rankedResources.length,
        rankedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error ranking resources:', error);
    res.status(500).json({
      error: 'Failed to rank resources',
      message: error.message
    });
  }
});

/**
 * POST /api/ranking/update-outcome
 * Update success rate based on learning outcome
 */
router.post('/update-outcome', async (req, res) => {
  try {
    const { resourceId, concept, success, userId } = req.body;

    if (!resourceId || !concept || success === undefined) {
      return res.status(400).json({
        error: 'Invalid request: resourceId, concept, and success are required'
      });
    }

    await resourceRankingService.updateSuccessRate(resourceId, concept, success);

    res.json({
      success: true,
      message: 'Outcome recorded successfully'
    });
  } catch (error) {
    console.error('Error updating outcome:', error);
    res.status(500).json({
      error: 'Failed to update outcome',
      message: error.message
    });
  }
});

/**
 * POST /api/ranking/update-engagement
 * Update user engagement metrics
 */
router.post('/update-engagement', async (req, res) => {
  try {
    const { resourceId, userId, engagementData } = req.body;

    if (!resourceId || !userId || !engagementData) {
      return res.status(400).json({
        error: 'Invalid request: resourceId, userId, and engagementData are required'
      });
    }

    await resourceRankingService.updateEngagement(resourceId, userId, engagementData);

    res.json({
      success: true,
      message: 'Engagement data recorded successfully'
    });
  } catch (error) {
    console.error('Error updating engagement:', error);
    res.status(500).json({
      error: 'Failed to update engagement',
      message: error.message
    });
  }
});

/**
 * GET /api/ranking/demo-data
 * Get demo data for testing
 */
router.get('/demo-data', (req, res) => {
  const demoResources = [
    {
      id: 'vid_001',
      title: 'Python Loops Visualization',
      type: 'video',
      duration: 8,
      source: 'YouTube',
      description: 'Visual demonstration of how loops work with animations',
      publishedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days ago
    },
    {
      id: 'interactive_001',
      title: 'Interactive Loop Practice',
      type: 'interactive',
      duration: 15,
      source: 'Codecademy',
      description: 'Hands-on practice with for and while loops',
      publishedDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString() // 60 days ago
    },
    {
      id: 'article_001',
      title: 'Loop Fundamentals Article',
      type: 'article',
      duration: 12,
      source: 'Medium',
      description: 'Comprehensive guide to Python loops with examples',
      publishedDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString() // 90 days ago
    }
  ];

  const demoUserProfile = {
    learningStyle: {
      visual: 0.85,
      auditory: 0.3,
      reading: 0.45,
      kinesthetic: 0.6
    }
  };

  res.json({
    resources: demoResources,
    userProfile: demoUserProfile,
    concept: 'for-loops',
    userId: 'demo_user'
  });
});

module.exports = router;


