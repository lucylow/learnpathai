/**
 * Real-Time Adaptation Engine
 * Manages learning event queue and triggers adaptive responses
 */

import { LearningEvent, AdaptiveResponse } from '../../types/ai-workflow.types';
import { aiService } from './AIService';

class AsyncQueue<T> {
  private queue: T[] = [];
  private processing = false;
  private handlers: ((item: T) => Promise<void>)[] = [];

  async enqueue(item: T): Promise<any> {
    return new Promise((resolve, reject) => {
      this.queue.push(item);
      this.handlers.push(async (processedItem) => {
        if (processedItem === item) {
          try {
            const result = await this.processItem(item);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        }
      });
      this.processQueue();
    });
  }

  private async processItem(item: T): Promise<any> {
    // Process through AI service
    return await aiService.processLearningEvent(item as any);
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const item = this.queue.shift();
      if (item) {
        // Notify all handlers
        for (const handler of this.handlers) {
          await handler(item).catch(console.error);
        }
      }
    }

    this.processing = false;
    this.handlers = [];
  }

  [Symbol.asyncIterator]() {
    return this;
  }

  async next(): Promise<IteratorResult<T>> {
    if (this.queue.length === 0) {
      return { done: true, value: undefined };
    }
    const value = this.queue.shift();
    return { done: false, value: value! };
  }
}

export class AdaptationEngine {
  private eventQueue: AsyncQueue<LearningEvent>;
  private adaptationCache: Map<string, CachedResponse> = new Map();
  private subscribers: AdaptationSubscriber[] = [];
  private readonly CACHE_TTL = 60000; // 1 minute
  private readonly SLA_TARGET = 500; // 500ms target

  constructor() {
    this.eventQueue = new AsyncQueue<LearningEvent>();
    this.startEventProcessor();
  }

  /**
   * Submit learning event for processing
   * Returns cached response if available and valid
   */
  async submitLearningEvent(event: LearningEvent): Promise<AdaptiveResponse> {
    const startTime = Date.now();

    // Check cache for recent adaptations
    const cacheKey = this.generateCacheKey(event.userId, event.conceptId);
    const cached = this.adaptationCache.get(cacheKey);

    if (cached && this.isCacheValid(cached)) {
      console.log(`📦 Cache hit for ${cacheKey}`);
      return {
        ...cached.response,
        processingTime: Date.now() - startTime
      };
    }

    // Process through queue
    try {
      const response = await this.eventQueue.enqueue(event);
      
      // Cache the response
      this.adaptationCache.set(cacheKey, {
        response,
        cachedAt: new Date(),
        expiresAt: new Date(Date.now() + this.CACHE_TTL)
      });

      // Check SLA
      const processingTime = Date.now() - startTime;
      if (processingTime > this.SLA_TARGET) {
        console.warn(`⚠️ SLA miss: ${processingTime}ms (target: ${this.SLA_TARGET}ms)`);
      }

      return response;
    } catch (error) {
      console.error('Failed to process learning event:', error);
      throw error;
    }
  }

  /**
   * Subscribe to adaptation events
   */
  subscribe(subscriber: AdaptationSubscriber): void {
    this.subscribers.push(subscriber);
  }

  /**
   * Start background event processor
   */
  private startEventProcessor(): void {
    // Background processor runs continuously
    this.processEventsLoop();
  }

  private async processEventsLoop(): Promise<void> {
    // This runs in the background
    console.log('🔄 Adaptation engine processor started');
  }

  /**
   * Notify all subscribers of adaptation
   */
  private async notifySubscribers(
    event: LearningEvent,
    response: AdaptiveResponse
  ): Promise<void> {
    const notifications = this.subscribers.map(subscriber => {
      try {
        return subscriber.onAdaptation(event, response);
      } catch (error) {
        console.error('Subscriber notification error:', error);
        return Promise.resolve();
      }
    });

    await Promise.allSettled(notifications);
  }

  /**
   * Trigger proactive interventions based on patterns
   */
  private async triggerProactiveInterventions(
    event: LearningEvent,
    response: AdaptiveResponse
  ): Promise<void> {
    // Detect patterns requiring intervention
    
    // Significant knowledge gap
    if (response.mastery < 0.3 && response.confidence > 0.8) {
      await this.triggerRemediation(event.userId, event.conceptId);
    }

    // Frustration pattern
    if (this.detectFrustrationPattern(event, response)) {
      await this.triggerMotivationalSupport(event.userId);
    }

    // Rapid progress
    if (this.detectRapidProgress(event, response)) {
      await this.triggerAcceleration(event.userId, event.conceptId);
    }
  }

  private detectFrustrationPattern(
    event: LearningEvent,
    response: AdaptiveResponse
  ): boolean {
    return (
      event.attemptNumber > 3 &&
      response.mastery < 0.4 &&
      event.timeSpent > 30000
    );
  }

  private detectRapidProgress(
    event: LearningEvent,
    response: AdaptiveResponse
  ): boolean {
    return (
      event.correct &&
      response.mastery > 0.8 &&
      event.attemptNumber <= 2
    );
  }

  private async triggerRemediation(
    userId: string,
    conceptId: string
  ): Promise<void> {
    console.log(`🔧 Triggering remediation for user ${userId}, concept ${conceptId}`);
    // Notify subscribers or send to backend
    await this.notifySubscribers(
      { userId, conceptId } as any,
      {
        interventions: [{
          type: 'remediation',
          priority: 'high',
          action: 'suggest_prerequisite_review',
          message: 'Let\'s review some foundational concepts.'
        }]
      } as any
    );
  }

  private async triggerMotivationalSupport(userId: string): Promise<void> {
    console.log(`💪 Triggering motivational support for user ${userId}`);
    // Send encouragement
  }

  private async triggerAcceleration(
    userId: string,
    conceptId: string
  ): Promise<void> {
    console.log(`🚀 Triggering acceleration for user ${userId}, concept ${conceptId}`);
    // Suggest advanced content
  }

  private generateCacheKey(userId: string, conceptId: string): string {
    return `${userId}:${conceptId}`;
  }

  private isCacheValid(cached: CachedResponse): boolean {
    return cached.expiresAt > new Date();
  }

  /**
   * Clear cache for user or concept
   */
  clearCache(userId?: string, conceptId?: string): void {
    if (userId && conceptId) {
      const key = this.generateCacheKey(userId, conceptId);
      this.adaptationCache.delete(key);
    } else if (userId) {
      // Clear all cache entries for user
      for (const key of this.adaptationCache.keys()) {
        if (key.startsWith(`${userId}:`)) {
          this.adaptationCache.delete(key);
        }
      }
    } else {
      // Clear all cache
      this.adaptationCache.clear();
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): CacheStats {
    let validCount = 0;
    let expiredCount = 0;

    for (const cached of this.adaptationCache.values()) {
      if (this.isCacheValid(cached)) {
        validCount++;
      } else {
        expiredCount++;
      }
    }

    return {
      totalEntries: this.adaptationCache.size,
      validEntries: validCount,
      expiredEntries: expiredCount,
      hitRate: 0 // Would track in production
    };
  }
}

// Types
interface CachedResponse {
  response: AdaptiveResponse;
  cachedAt: Date;
  expiresAt: Date;
}

interface AdaptationSubscriber {
  onAdaptation(event: LearningEvent, response: AdaptiveResponse): Promise<void>;
}

interface CacheStats {
  totalEntries: number;
  validEntries: number;
  expiredEntries: number;
  hitRate: number;
}

// Singleton instance
export const adaptationEngine = new AdaptationEngine();

