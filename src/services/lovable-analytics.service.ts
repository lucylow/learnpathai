/**
 * Lovable Cloud Analytics Service
 * Tracks user behavior, learning events, and engagement metrics
 */

import { db } from '../lib/lovable';
import LovableAuthService from './lovable-auth.service';

export interface TrackEventParams {
  eventType: string;
  eventData?: Record<string, any>;
}

export class LovableAnalyticsService {
  private static instance: LovableAnalyticsService;

  private constructor() {}

  static getInstance(): LovableAnalyticsService {
    if (!LovableAnalyticsService.instance) {
      LovableAnalyticsService.instance = new LovableAnalyticsService();
    }
    return LovableAnalyticsService.instance;
  }

  /**
   * Track a learning event
   */
  async track(params: TrackEventParams): Promise<void> {
    const user = await LovableAuthService.getCurrentUser();
    if (!user) {
      console.warn('Analytics: User not authenticated, skipping event');
      return;
    }

    try {
      await db.analytics.track({
        user_id: user.id,
        event_type: params.eventType,
        event_data: params.eventData || {},
      });
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }

  /**
   * Track node completion
   */
  async trackNodeCompleted(params: {
    pathId: string;
    conceptId: string;
    timeSpent: number;
    mastery: number;
  }): Promise<void> {
    await this.track({
      eventType: 'node_completed',
      eventData: params,
    });
  }

  /**
   * Track quiz attempt
   */
  async trackQuizAttempt(params: {
    pathId: string;
    conceptId: string;
    score: number;
    totalQuestions: number;
    correctAnswers: number;
  }): Promise<void> {
    await this.track({
      eventType: 'quiz_attempt',
      eventData: params,
    });
  }

  /**
   * Track resource access
   */
  async trackResourceAccessed(params: {
    resourceId: string;
    resourceType: string;
    conceptId: string;
  }): Promise<void> {
    await this.track({
      eventType: 'resource_accessed',
      eventData: params,
    });
  }

  /**
   * Track path creation
   */
  async trackPathCreated(params: {
    pathId: string;
    subject: string;
    learningStyle: string;
  }): Promise<void> {
    await this.track({
      eventType: 'path_created',
      eventData: params,
    });
  }

  /**
   * Track path completion
   */
  async trackPathCompleted(params: {
    pathId: string;
    totalTime: number;
    finalMastery: number;
  }): Promise<void> {
    await this.track({
      eventType: 'path_completed',
      eventData: params,
    });
  }

  /**
   * Track adaptive reroute
   */
  async trackAdaptiveReroute(params: {
    pathId: string;
    failedNode: string;
    newPath: string[];
  }): Promise<void> {
    await this.track({
      eventType: 'adaptive_reroute',
      eventData: params,
    });
  }

  /**
   * Track time spent on concept
   */
  async trackTimeSpent(params: {
    conceptId: string;
    seconds: number;
  }): Promise<void> {
    await this.track({
      eventType: 'time_spent',
      eventData: params,
    });
  }

  /**
   * Get user analytics summary
   */
  async getUserAnalytics(startDate?: Date, endDate?: Date): Promise<any> {
    const user = await LovableAuthService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const events = await db.analytics.list({ user_id: user.id });
    
    // Process events into summary
    const summary = {
      totalEvents: events.data.length,
      completedNodes: events.data.filter(e => e.event_type === 'node_completed').length,
      quizAttempts: events.data.filter(e => e.event_type === 'quiz_attempt').length,
      pathsCreated: events.data.filter(e => e.event_type === 'path_created').length,
      pathsCompleted: events.data.filter(e => e.event_type === 'path_completed').length,
      adaptiveReroutes: events.data.filter(e => e.event_type === 'adaptive_reroute').length,
    };

    return summary;
  }
}

export default LovableAnalyticsService.getInstance();


