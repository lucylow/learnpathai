/**
 * Resource Ranking Service
 * 
 * Outcome-aware resource ranking based on:
 * - Historical success rates
 * - Personal engagement metrics
 * - Learning style match
 * - Content quality and freshness
 */

class ResourceRankingService {
  constructor() {
    // In-memory storage for demo (use database in production)
    this.successRates = new Map();
    this.engagementMetrics = new Map();
    this.initializeDemoData();
  }

  initializeDemoData() {
    // Demo success rate data
    this.successRates.set('vid_001:for-loops', {
      resourceId: 'vid_001',
      concept: 'for-loops',
      successCount: 87,
      totalAttempts: 100,
      lastUpdated: new Date()
    });

    this.successRates.set('interactive_001:for-loops', {
      resourceId: 'interactive_001',
      concept: 'for-loops',
      successCount: 82,
      totalAttempts: 100,
      lastUpdated: new Date()
    });

    this.successRates.set('article_001:for-loops', {
      resourceId: 'article_001',
      concept: 'for-loops',
      successCount: 68,
      totalAttempts: 100,
      lastUpdated: new Date()
    });

    // Demo engagement data
    this.engagementMetrics.set('user_demo:vid_001', {
      userId: 'user_demo',
      resourceId: 'vid_001',
      completed: false,
      completionRate: 0.85,
      timeSpent: 420,
      expectedTime: 480,
      revisits: 1
    });
  }

  /**
   * Rank resources based on multiple criteria
   */
  async rankResources(candidateResources, userId, targetConcept, userProfile = null) {
    const rankedResources = await Promise.all(
      candidateResources.map(async (resource) => {
        const score = await this.calculateResourceScore(resource, userId, targetConcept, userProfile);
        return { 
          ...resource, 
          score,
          scoreBreakdown: score.breakdown 
        };
      })
    );

    // Sort by total score descending
    return rankedResources
      .sort((a, b) => b.score.total - a.score.total)
      .map((item, index) => ({
        ...item,
        rank: index + 1
      }));
  }

  /**
   * Calculate comprehensive resource score
   */
  async calculateResourceScore(resource, userId, targetConcept, userProfile) {
    const breakdown = {};
    
    // 1. Historical Success Rate (40% weight)
    const successRate = await this.getSuccessRate(resource.id, targetConcept);
    breakdown.successRate = successRate;
    
    // 2. Personal Engagement (25% weight)
    const engagementScore = await this.getPersonalEngagement(resource.id, userId);
    breakdown.engagement = engagementScore;
    
    // 3. Learning Style Match (20% weight)
    const styleMatch = await this.getLearningStyleMatch(resource, userProfile);
    breakdown.styleMatch = styleMatch;
    
    // 4. Content Quality (15% weight)
    const qualityScore = this.getQualityScore(resource);
    breakdown.quality = qualityScore;

    // Calculate weighted total
    const total = 
      (successRate * 0.4) +
      (engagementScore * 0.25) +
      (styleMatch * 0.2) +
      (qualityScore * 0.15);

    return {
      total: Math.min(1, total),
      breakdown
    };
  }

  /**
   * Get historical success rate for resource + concept
   */
  async getSuccessRate(resourceId, concept) {
    const key = `${resourceId}:${concept}`;
    const data = this.successRates.get(key);

    if (!data) {
      // Cold start: use default or global rate
      return 0.7; // Default assumption
    }

    // Use Wilson score confidence interval for statistical robustness
    return this.calculateWilsonScore(data.successCount, data.totalAttempts);
  }

  /**
   * Wilson score confidence interval (handles small sample sizes better)
   */
  calculateWilsonScore(successes, trials) {
    if (trials === 0) return 0.7;
    
    const z = 1.96; // 95% confidence
    const p = successes / trials;
    const denominator = 1 + z * z / trials;
    
    const numerator = p + z * z / (2 * trials) - z * Math.sqrt(
      (p * (1 - p) + z * z / (4 * trials)) / trials
    );
    
    return numerator / denominator;
  }

  /**
   * Get personal engagement score
   */
  async getPersonalEngagement(resourceId, userId) {
    const key = `${userId}:${resourceId}`;
    const data = this.engagementMetrics.get(key);

    if (!data) return 0.5; // Neutral for new resources

    // Combine completion rate, time ratio, and re-engagement
    const completionRate = data.completed ? 1 : data.completionRate;
    const timeRatio = Math.min(data.timeSpent / data.expectedTime, 1.5);
    const reEngagement = data.revisits > 0 ? 0.1 : 0;

    return Math.min(1, (completionRate * 0.6) + (timeRatio * 0.3) + reEngagement);
  }

  /**
   * Calculate learning style match
   */
  async getLearningStyleMatch(resource, userProfile) {
    if (!userProfile || !userProfile.learningStyle) {
      return 0.5; // Neutral if no profile
    }

    const userStyle = userProfile.learningStyle;
    const resourceStyle = this.analyzeResourceStyle(resource);

    // Calculate cosine similarity
    let dotProduct = 0;
    let userMagnitude = 0;
    let resourceMagnitude = 0;

    const styles = ['visual', 'auditory', 'reading', 'kinesthetic'];
    for (const style of styles) {
      const userWeight = userStyle[style] || 0;
      const resourceWeight = resourceStyle[style] || 0;
      dotProduct += userWeight * resourceWeight;
      userMagnitude += userWeight ** 2;
      resourceMagnitude += resourceWeight ** 2;
    }

    userMagnitude = Math.sqrt(userMagnitude);
    resourceMagnitude = Math.sqrt(resourceMagnitude);

    if (userMagnitude === 0 || resourceMagnitude === 0) return 0.5;

    return dotProduct / (userMagnitude * resourceMagnitude);
  }

  /**
   * Analyze resource content to determine style alignment
   */
  analyzeResourceStyle(resource) {
    const styleScores = {
      visual: 0,
      auditory: 0,
      reading: 0,
      kinesthetic: 0
    };

    // Assign scores based on resource type
    switch (resource.type) {
      case 'video':
        styleScores.visual = 0.8;
        styleScores.auditory = 0.7;
        break;
      case 'article':
      case 'documentation':
        styleScores.reading = 0.9;
        break;
      case 'interactive':
      case 'coding_exercise':
        styleScores.kinesthetic = 0.8;
        styleScores.visual = 0.6;
        break;
      case 'audio':
      case 'podcast':
        styleScores.auditory = 0.9;
        break;
      default:
        // Balanced for unknown types
        Object.keys(styleScores).forEach(key => {
          styleScores[key] = 0.5;
        });
    }

    // Additional content-based analysis if available
    if (resource.description) {
      const desc = resource.description.toLowerCase();
      if (desc.includes('visual') || desc.includes('diagram') || desc.includes('animation')) {
        styleScores.visual += 0.1;
      }
      if (desc.includes('practice') || desc.includes('hands-on') || desc.includes('interactive')) {
        styleScores.kinesthetic += 0.1;
      }
    }

    // Normalize to [0, 1]
    Object.keys(styleScores).forEach(key => {
      styleScores[key] = Math.min(1, styleScores[key]);
    });

    return styleScores;
  }

  /**
   * Calculate content quality score
   */
  getQualityScore(resource) {
    let score = 0.5; // Base score

    // Recency bonus (if available)
    if (resource.publishedDate) {
      const ageInDays = (Date.now() - new Date(resource.publishedDate).getTime()) / (1000 * 60 * 60 * 24);
      if (ageInDays < 180) score += 0.2;
      else if (ageInDays < 365) score += 0.1;
    }

    // Duration appropriateness
    if (resource.duration) {
      if (resource.duration >= 5 && resource.duration <= 15) score += 0.15;
      else if (resource.duration > 15 && resource.duration <= 30) score += 0.1;
    }

    // Source credibility
    if (resource.source) {
      const trustedSources = ['YouTube', 'Coursera', 'Khan Academy', 'MIT OCW'];
      if (trustedSources.includes(resource.source)) score += 0.15;
    }

    return Math.min(1, score);
  }

  /**
   * Update success rates when new outcome data comes in
   */
  async updateSuccessRate(resourceId, concept, success) {
    const key = `${resourceId}:${concept}`;
    const existing = this.successRates.get(key);
    
    if (existing) {
      existing.successCount += success ? 1 : 0;
      existing.totalAttempts += 1;
      existing.lastUpdated = new Date();
    } else {
      this.successRates.set(key, {
        resourceId,
        concept,
        successCount: success ? 1 : 0,
        totalAttempts: 1,
        lastUpdated: new Date()
      });
    }
  }

  /**
   * Update user engagement metrics
   */
  async updateEngagement(resourceId, userId, engagementData) {
    const key = `${userId}:${resourceId}`;
    const existing = this.engagementMetrics.get(key);

    if (existing) {
      Object.assign(existing, engagementData);
    } else {
      this.engagementMetrics.set(key, {
        userId,
        resourceId,
        ...engagementData
      });
    }
  }
}

module.exports = new ResourceRankingService();

