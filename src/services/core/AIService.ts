/**
 * Core AI Service Architecture
 * Orchestrates all AI components for adaptive learning
 */

import {
  LearningEvent,
  AdaptiveResponse,
  UserKnowledgeState,
  LearningResource,
  SelectionContext,
  LearningTrajectory
} from '../../types/ai-workflow.types';

export class AIService {
  private telemetryBuffer: any[] = [];
  private processingQueue: LearningEvent[] = [];
  private cacheMap: Map<string, any> = new Map();

  constructor() {
    this.initializeServices();
  }

  private async initializeServices(): Promise<void> {
    console.log('🚀 Initializing AI Service components...');
    // Services are initialized via dependency injection
  }

  /**
   * Main entry point for processing learning events
   * Target: <500ms response time
   */
  async processLearningEvent(event: LearningEvent): Promise<AdaptiveResponse> {
    const startTime = Date.now();
    
    try {
      // 1. Update knowledge state via Python backend
      const knowledgeState = await this.updateKnowledgeState(event);
      
      // 2. Generate recommendations based on current state
      const recommendations = await this.generateRecommendations(knowledgeState);
      
      // 3. Optimize learning path
      const optimizedPath = await this.optimizeLearningPath(
        knowledgeState,
        recommendations
      );
      
      // 4. Check for proactive interventions
      const interventions = await this.checkInterventions(event, knowledgeState);
      
      // 5. Log telemetry (non-blocking)
      this.logTelemetryAsync({
        ...event,
        processingTime: Date.now() - startTime,
        recommendations: recommendations.length,
        interventions: interventions.length
      });

      return {
        success: true,
        path: optimizedPath,
        mastery: knowledgeState.overallMastery,
        confidence: this.calculateConfidence(knowledgeState),
        processingTime: Date.now() - startTime,
        requestId: event.id,
        interventions
      };
    } catch (error) {
      console.error('Error processing learning event:', error);
      
      // Log error telemetry
      this.logTelemetryAsync({
        ...event,
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime: Date.now() - startTime
      });
      
      throw error;
    }
  }

  /**
   * Update knowledge state using BKT + IRT hybrid model
   */
  private async updateKnowledgeState(
    event: LearningEvent
  ): Promise<UserKnowledgeState> {
    try {
      const response = await fetch('http://localhost:8001/api/learning-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: event.userId,
          concept_id: event.conceptId,
          correct: event.correct,
          time_spent: event.timeSpent,
          confidence: event.confidence,
          resource_id: event.resourceId,
          attempt_number: event.attemptNumber,
          metadata: event.metadata
        })
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Convert to UserKnowledgeState
      return {
        userId: event.userId,
        conceptMastery: new Map(Object.entries(data.concept_mastery || {})),
        overallMastery: data.mastery || 0,
        theta: data.ability || 0,
        lastUpdated: new Date(),
        conceptCount: Object.keys(data.concept_mastery || {}).length,
        learningVelocity: data.learning_velocity || 0,
        lastActivity: new Date()
      };
    } catch (error) {
      console.error('Failed to update knowledge state:', error);
      
      // Fallback: return cached state or initial state
      return this.getInitialKnowledgeState(event.userId);
    }
  }

  /**
   * Generate personalized recommendations
   */
  private async generateRecommendations(
    state: UserKnowledgeState
  ): Promise<LearningResource[]> {
    try {
      const response = await fetch('http://localhost:8001/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: state.userId,
          mastery: Object.fromEntries(state.conceptMastery),
          n_recommendations: 5
        })
      });

      if (!response.ok) {
        throw new Error(`Recommendations error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.recommendations || [];
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
      return [];
    }
  }

  /**
   * Optimize learning path using knowledge graph
   */
  private async optimizeLearningPath(
    state: UserKnowledgeState,
    recommendations: LearningResource[]
  ): Promise<any[]> {
    try {
      const response = await fetch('http://localhost:8001/api/optimal-path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: state.userId,
          mastery: Object.fromEntries(state.conceptMastery),
          ready_concepts: recommendations.map(r => r.conceptId)
        })
      });

      if (!response.ok) {
        throw new Error(`Path optimization error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.path || [];
    } catch (error) {
      console.error('Failed to optimize path:', error);
      return [];
    }
  }

  /**
   * Check for proactive interventions
   */
  private async checkInterventions(
    event: LearningEvent,
    state: UserKnowledgeState
  ): Promise<any[]> {
    const interventions: any[] = [];

    // Check for significant knowledge gap
    if (state.overallMastery < 0.3) {
      interventions.push({
        type: 'remediation',
        priority: 'high',
        action: 'suggest_prerequisite_review',
        message: 'Let\'s review some foundational concepts to build a stronger base.'
      });
    }

    // Check for frustration pattern
    if (this.detectFrustrationPattern(event, state)) {
      interventions.push({
        type: 'motivational',
        priority: 'medium',
        action: 'provide_encouragement',
        message: 'You\'re making great progress! Let\'s try a different approach.'
      });
    }

    // Check for rapid progress
    if (this.detectRapidProgress(event, state)) {
      interventions.push({
        type: 'acceleration',
        priority: 'medium',
        action: 'increase_difficulty',
        message: 'You\'re doing excellent! Ready for a bigger challenge?'
      });
    }

    return interventions;
  }

  private detectFrustrationPattern(
    event: LearningEvent,
    state: UserKnowledgeState
  ): boolean {
    return (
      event.attemptNumber > 3 &&
      state.overallMastery < 0.4 &&
      event.timeSpent > 30000 // 30 seconds
    );
  }

  private detectRapidProgress(
    event: LearningEvent,
    state: UserKnowledgeState
  ): boolean {
    return (
      event.correct &&
      state.overallMastery > 0.8 &&
      state.learningVelocity > 0.1
    );
  }

  private calculateConfidence(state: UserKnowledgeState): number {
    // Confidence based on number of data points and consistency
    const minDataPoints = 5;
    const dataPoints = state.conceptCount;
    
    if (dataPoints < minDataPoints) {
      return 0.3 + (dataPoints / minDataPoints) * 0.4;
    }
    
    return Math.min(0.95, 0.7 + state.conceptCount * 0.01);
  }

  private getInitialKnowledgeState(userId: string): UserKnowledgeState {
    return {
      userId,
      conceptMastery: new Map(),
      overallMastery: 0.3,
      theta: 0,
      lastUpdated: new Date(),
      conceptCount: 0,
      learningVelocity: 0,
      lastActivity: new Date()
    };
  }

  private logTelemetryAsync(event: any): void {
    // Buffer telemetry for batch processing
    this.telemetryBuffer.push({
      ...event,
      timestamp: new Date()
    });

    // Flush buffer if it gets large
    if (this.telemetryBuffer.length >= 100) {
      this.flushTelemetry();
    }
  }

  private async flushTelemetry(): Promise<void> {
    if (this.telemetryBuffer.length === 0) return;

    const events = [...this.telemetryBuffer];
    this.telemetryBuffer = [];

    try {
      await fetch('http://localhost:8001/api/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events })
      });
    } catch (error) {
      console.error('Failed to flush telemetry:', error);
    }
  }

  /**
   * Get current user knowledge state
   */
  async getUserKnowledgeState(userId: string): Promise<UserKnowledgeState> {
    try {
      const response = await fetch(
        `http://localhost:8001/api/user/${userId}/knowledge-state`
      );

      if (!response.ok) {
        throw new Error(`Failed to get knowledge state: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        userId,
        conceptMastery: new Map(Object.entries(data.concept_mastery || {})),
        overallMastery: data.overall_mastery || 0,
        theta: data.ability || 0,
        lastUpdated: new Date(data.last_updated || Date.now()),
        conceptCount: Object.keys(data.concept_mastery || {}).length,
        learningVelocity: data.learning_velocity || 0,
        lastActivity: new Date(data.last_activity || Date.now())
      };
    } catch (error) {
      console.error('Failed to get user knowledge state:', error);
      return this.getInitialKnowledgeState(userId);
    }
  }

  /**
   * Predict learning trajectory
   */
  async predictTrajectory(
    userId: string,
    conceptId: string
  ): Promise<LearningTrajectory | null> {
    try {
      const response = await fetch('http://localhost:8001/api/predict-trajectory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, concept_id: conceptId })
      });

      if (!response.ok) {
        throw new Error(`Prediction error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to predict trajectory:', error);
      return null;
    }
  }
}

// Singleton instance
export const aiService = new AIService();

