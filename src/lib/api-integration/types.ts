/**
 * Type definitions for AI API Integration Suite
 * Supports multiple education content generation providers
 */

export interface APIProvider {
  name: string;
  baseUrl: string;
  apiKey: string;
  rateLimit: number; // requests per minute
  costPerRequest: number;
  priority: number; // lower = higher priority (1 = highest)
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'mcq' | 'true_false' | 'fill_blank' | 'short_answer';
  options?: string[];
  correctAnswer: string | number;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  source: string; // Which API generated this
  metadata?: {
    estimatedTime?: number; // seconds to answer
    bloomLevel?: string;
    conceptId?: string;
  };
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  tags: string[];
  difficulty: number; // 1-3
  source: string;
  imageUrl?: string;
}

export interface StudyMaterial {
  id: string;
  title: string;
  content: string;
  type: 'summary' | 'explanation' | 'example' | 'analogy';
  source: string;
  conceptId?: string;
  targetLevel?: 'beginner' | 'intermediate' | 'advanced';
  estimatedReadingTime?: number; // minutes
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  provider: string;
  cached: boolean;
  cost: number;
  timestamp: number;
  metadata?: {
    tokensUsed?: number;
    generationTime?: number;
    cacheHit?: boolean;
  };
}

export interface RateLimitInfo {
  requests: number[];
  limit: number;
  window: number; // milliseconds
}

export interface APIUsageStats {
  provider: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalCost: number;
  averageResponseTime: number;
  cacheHitRate: number;
}

export interface CacheEntry<T> {
  data: T;
  expiresAt: Date;
  createdAt: Date;
  accessCount: number;
}

export interface GenerationRequest {
  type: 'quiz_questions' | 'explanation' | 'flashcards' | 'summary';
  text?: string;
  topic?: string;
  count?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  targetLevel?: 'beginner' | 'intermediate' | 'advanced';
  preferredProviders?: string[];
  userId?: string;
  conceptId?: string;
  context?: Record<string, unknown>;
}

