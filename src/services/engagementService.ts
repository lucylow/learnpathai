import { track } from '@/utils/telemetry';

export interface EngagementMetrics {
  sessionId: string;
  userId: string;
  startTime: Date;
  interactionCount: number;
  correctAnswers: number;
  totalQuestions: number;
  focusTime: number; // milliseconds
  totalTime: number; // milliseconds
  breaksTaken: number;
  lastInteraction: Date;
}

export interface EngagementScore {
  overall: number; // 0-1
  participation: number; // 0-1
  accuracy: number; // 0-1
  timeOnTask: number; // 0-1
  consistency: number; // 0-1
  trend: 'improving' | 'stable' | 'declining';
  alerts: EngagementAlert[];
}

export interface EngagementAlert {
  type: 'low_attention' | 'declining_accuracy' | 'extended_session' | 'break_needed';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  recommendation: string;
}

export class EngagementService {
  private readonly ATTENTION_THRESHOLD = 0.6;
  private readonly MAX_SESSION_LENGTH = 45 * 60 * 1000; // 45 minutes
  private readonly BREAK_INTERVAL = 25 * 60 * 1000; // 25 minutes (Pomodoro)
  
  private engagementHistory: Map<string, EngagementMetrics[]> = new Map();

  /**
   * Track user interaction during learning session
   */
  trackInteraction(
    sessionId: string,
    userId: string,
    interactionType: 'answer' | 'click' | 'video_watch' | 'quiz_submit',
    data?: Record<string, unknown>
  ): void {
    const metrics = this.getCurrentMetrics(sessionId, userId);
    
    metrics.interactionCount++;
    metrics.lastInteraction = new Date();
    
    if (interactionType === 'quiz_submit' && data) {
      metrics.totalQuestions++;
      if (data.correct) {
        metrics.correctAnswers++;
      }
    }
    
    // Calculate focus time (time since last interaction, capped at 5 minutes)
    const timeSinceLastInteraction = Date.now() - metrics.lastInteraction.getTime();
    const focusIncrement = Math.min(timeSinceLastInteraction, 5 * 60 * 1000);
    metrics.focusTime += focusIncrement;
    
    this.updateMetrics(sessionId, userId, metrics);
    
    track('engagement_interaction', {
      sessionId,
      userId,
      interactionType,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Calculate comprehensive engagement score
   */
  calculateEngagementScore(sessionId: string, userId: string): EngagementScore {
    const metrics = this.getCurrentMetrics(sessionId, userId);
    const history = this.getHistory(userId);
    
    // Calculate component scores
    const participationScore = this.calculateParticipationScore(metrics);
    const accuracyScore = metrics.totalQuestions > 0 
      ? metrics.correctAnswers / metrics.totalQuestions 
      : 0.5;
    const timeOnTaskScore = Math.min(metrics.focusTime / metrics.totalTime, 1);
    const consistencyScore = this.calculateConsistencyScore(history);
    
    // Overall weighted score
    const overallScore = (
      participationScore * 0.3 +
      accuracyScore * 0.3 +
      timeOnTaskScore * 0.25 +
      consistencyScore * 0.15
    );
    
    // Detect trends
    const trend = this.detectTrend(history);
    
    // Generate alerts
    const alerts = this.generateAlerts(metrics, overallScore);
    
    return {
      overall: overallScore,
      participation: participationScore,
      accuracy: accuracyScore,
      timeOnTask: timeOnTaskScore,
      consistency: consistencyScore,
      trend,
      alerts,
    };
  }

  /**
   * Check if user needs a break
   */
  shouldTakeBreak(sessionId: string, userId: string): boolean {
    const metrics = this.getCurrentMetrics(sessionId, userId);
    const sessionDuration = Date.now() - metrics.startTime.getTime();
    
    // Break needed if:
    // 1. Session longer than break interval without break
    // 2. Session approaching max length
    // 3. Engagement score dropping
    
    const timeSinceLastBreak = sessionDuration % this.BREAK_INTERVAL;
    const needsPomodoroBreak = timeSinceLastBreak > this.BREAK_INTERVAL * 0.9;
    
    const approachingMaxLength = sessionDuration > this.MAX_SESSION_LENGTH * 0.8;
    
    const engagementScore = this.calculateEngagementScore(sessionId, userId);
    const lowEngagement = engagementScore.overall < this.ATTENTION_THRESHOLD;
    
    return needsPomodoroBreak || approachingMaxLength || lowEngagement;
  }

  /**
   * Get break recommendation
   */
  getBreakRecommendation(sessionId: string, userId: string): {
    duration: number; // minutes
    type: 'micro' | 'short' | 'extended';
    activities: string[];
  } {
    const metrics = this.getCurrentMetrics(sessionId, userId);
    const sessionDuration = Date.now() - metrics.startTime.getTime();
    const engagementScore = this.calculateEngagementScore(sessionId, userId);
    
    // Micro break (2-3 minutes)
    if (sessionDuration < 30 * 60 * 1000 && engagementScore.overall > 0.6) {
      return {
        duration: 3,
        type: 'micro',
        activities: [
          'Stretch your arms and shoulders',
          'Look away from screen (20-20-20 rule)',
          'Take 5 deep breaths',
        ],
      };
    }
    
    // Short break (5-10 minutes)
    if (sessionDuration < 60 * 60 * 1000) {
      return {
        duration: 7,
        type: 'short',
        activities: [
          'Walk around for 5 minutes',
          'Get a healthy snack and water',
          'Do light stretching exercises',
          'Step outside for fresh air',
        ],
      };
    }
    
    // Extended break (15-20 minutes)
    return {
      duration: 15,
      type: 'extended',
      activities: [
        'Take a proper meal break',
        'Do a short exercise routine',
        'Call a friend or family member',
        'Practice mindfulness or meditation',
        'Resume tomorrow if feeling fatigued',
      ],
    };
  }

  private getCurrentMetrics(sessionId: string, userId: string): EngagementMetrics {
    const key = `${sessionId}-${userId}`;
    const history = this.engagementHistory.get(userId) || [];
    
    let current = history.find(m => m.sessionId === sessionId);
    
    if (!current) {
      current = {
        sessionId,
        userId,
        startTime: new Date(),
        interactionCount: 0,
        correctAnswers: 0,
        totalQuestions: 0,
        focusTime: 0,
        totalTime: 0,
        breaksTaken: 0,
        lastInteraction: new Date(),
      };
      history.push(current);
      this.engagementHistory.set(userId, history);
    }
    
    // Update total time
    current.totalTime = Date.now() - current.startTime.getTime();
    
    return current;
  }

  private updateMetrics(sessionId: string, userId: string, metrics: EngagementMetrics): void {
    const history = this.engagementHistory.get(userId) || [];
    const index = history.findIndex(m => m.sessionId === sessionId);
    
    if (index >= 0) {
      history[index] = metrics;
    } else {
      history.push(metrics);
    }
    
    this.engagementHistory.set(userId, history);
  }

  private getHistory(userId: string): EngagementMetrics[] {
    return this.engagementHistory.get(userId) || [];
  }

  private calculateParticipationScore(metrics: EngagementMetrics): number {
    // Expected interactions per minute
    const expectedRate = 2; // 2 interactions per minute
    const minutesInSession = metrics.totalTime / (60 * 1000);
    const expectedInteractions = minutesInSession * expectedRate;
    
    return Math.min(metrics.interactionCount / Math.max(expectedInteractions, 1), 1);
  }

  private calculateConsistencyScore(history: EngagementMetrics[]): number {
    if (history.length < 2) return 0.5;
    
    const recentSessions = history.slice(-5); // Last 5 sessions
    const accuracyRates = recentSessions.map(m => 
      m.totalQuestions > 0 ? m.correctAnswers / m.totalQuestions : 0
    );
    
    // Calculate variance
    const mean = accuracyRates.reduce((a, b) => a + b, 0) / accuracyRates.length;
    const variance = accuracyRates.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / accuracyRates.length;
    
    // Lower variance = higher consistency (inverse relationship)
    return 1 - Math.min(variance, 1);
  }

  private detectTrend(history: EngagementMetrics[]): 'improving' | 'stable' | 'declining' {
    if (history.length < 3) return 'stable';
    
    const recentSessions = history.slice(-5);
    const scores = recentSessions.map(m => 
      m.totalQuestions > 0 ? m.correctAnswers / m.totalQuestions : 0.5
    );
    
    // Simple linear regression
    const n = scores.length;
    const sumX = scores.reduce((sum, _, i) => sum + i, 0);
    const sumY = scores.reduce((sum, val) => sum + val, 0);
    const sumXY = scores.reduce((sum, val, i) => sum + i * val, 0);
    const sumX2 = scores.reduce((sum, _, i) => sum + i * i, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    
    if (slope > 0.05) return 'improving';
    if (slope < -0.05) return 'declining';
    return 'stable';
  }

  private generateAlerts(metrics: EngagementMetrics, overallScore: number): EngagementAlert[] {
    const alerts: EngagementAlert[] = [];
    
    // Low attention alert
    if (overallScore < 0.4) {
      alerts.push({
        type: 'low_attention',
        severity: 'critical',
        message: 'Your engagement level is low',
        recommendation: 'Take a break and return when you feel refreshed',
      });
    } else if (overallScore < 0.6) {
      alerts.push({
        type: 'low_attention',
        severity: 'warning',
        message: 'Your engagement is declining',
        recommendation: 'Consider taking a short break or switching topics',
      });
    }
    
    // Declining accuracy alert
    const accuracyRate = metrics.totalQuestions > 0 
      ? metrics.correctAnswers / metrics.totalQuestions 
      : 1;
    
    if (accuracyRate < 0.5 && metrics.totalQuestions >= 3) {
      alerts.push({
        type: 'declining_accuracy',
        severity: 'warning',
        message: 'You might benefit from reviewing earlier concepts',
        recommendation: 'Review prerequisite materials before continuing',
      });
    }
    
    // Extended session alert
    const sessionHours = metrics.totalTime / (60 * 60 * 1000);
    if (sessionHours > 2) {
      alerts.push({
        type: 'extended_session',
        severity: 'warning',
        message: 'You\'ve been studying for over 2 hours',
        recommendation: 'Take an extended break or resume tomorrow',
      });
    }
    
    // Break needed alert
    if (this.shouldTakeBreak(metrics.sessionId, metrics.userId)) {
      alerts.push({
        type: 'break_needed',
        severity: 'info',
        message: 'Time for a break!',
        recommendation: 'Step away for 5-10 minutes to maintain focus',
      });
    }
    
    return alerts;
  }
}

export const engagementService = new EngagementService();

