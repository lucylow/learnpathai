/**
 * React Hook for AI Content Generation
 * Provides easy access to multi-provider content generation with caching
 */

import { useState, useCallback } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';

export interface GenerationOptions {
  text?: string;
  topic?: string;
  count?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  preferredProviders?: string[];
}

export interface GenerationResult<T> {
  success: boolean;
  data?: T;
  provider: string;
  cached: boolean;
  cost: number;
  remaining_budget: number;
  error?: string;
}

export interface QuizQuestion {
  question: string;
  type: string;
  options?: string[];
  correctAnswer: string | number;
  explanation?: string;
  difficulty?: string;
}

export const useAIContentGeneration = () => {
  const supabase = useSupabaseClient();
  const user = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<GenerationResult<unknown> | null>(null);

  /**
   * Generic content generation function
   */
  const generateContent = useCallback(
    async <T = unknown>(
      type: 'quiz_questions' | 'explanation' | 'flashcards' | 'summary',
      options: GenerationOptions
    ): Promise<GenerationResult<T>> => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: supabaseError } = await supabase.functions.invoke(
          'generate-learning-content',
          {
            body: {
              content_type: type,
              ...options,
              user_id: user?.id,
            },
          }
        );

        if (supabaseError) {
          throw new Error(supabaseError.message);
        }

        if (!data.success) {
          throw new Error(data.error || 'Content generation failed');
        }

        const result = data as GenerationResult<T>;
        setLastResult(result);
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [supabase, user]
  );

  /**
   * Generate quiz questions for a topic
   */
  const generateQuizForTopic = useCallback(
    async (
      topic: string,
      options?: {
        count?: number;
        difficulty?: 'easy' | 'medium' | 'hard';
        preferredProviders?: string[];
      }
    ): Promise<GenerationResult<{ questions: QuizQuestion[] }>> => {
      return generateContent<{ questions: QuizQuestion[] }>('quiz_questions', {
        topic,
        count: options?.count || 5,
        difficulty: options?.difficulty || 'medium',
        preferredProviders: options?.preferredProviders || ['openai', 'questgen'],
      });
    },
    [generateContent]
  );

  /**
   * Generate quiz questions from text content
   */
  const generateQuizFromText = useCallback(
    async (
      text: string,
      options?: {
        count?: number;
        difficulty?: 'easy' | 'medium' | 'hard';
      }
    ): Promise<GenerationResult<{ questions: QuizQuestion[] }>> => {
      return generateContent<{ questions: QuizQuestion[] }>('quiz_questions', {
        text,
        count: options?.count || 5,
        difficulty: options?.difficulty || 'medium',
        preferredProviders: ['questgen', 'openai'],
      });
    },
    [generateContent]
  );

  /**
   * Generate an explanation for a concept
   */
  const generateExplanation = useCallback(
    async (
      concept: string,
      level: 'easy' | 'medium' | 'hard' = 'medium'
    ): Promise<GenerationResult<{ content: string }>> => {
      return generateContent<{ content: string }>('explanation', {
        topic: concept,
        difficulty: level,
        preferredProviders: ['openai'],
      });
    },
    [generateContent]
  );

  /**
   * Generate flashcards from text
   */
  const generateFlashcards = useCallback(
    async (
      text: string,
      count: number = 10
    ): Promise<GenerationResult<{ flashcards: unknown[] }>> => {
      return generateContent<{ flashcards: unknown[] }>('flashcards', {
        text,
        count,
        preferredProviders: ['quizgecko', 'openai'],
      });
    },
    [generateContent]
  );

  /**
   * Generate a summary of text content
   */
  const generateSummary = useCallback(
    async (text: string): Promise<GenerationResult<{ summary: string }>> => {
      return generateContent<{ summary: string }>('summary', {
        text,
        preferredProviders: ['openai'],
      });
    },
    [generateContent]
  );

  /**
   * Get usage statistics
   */
  const getUsageStats = useCallback(async () => {
    try {
      const { data, error: statsError } = await supabase
        .from('content_generation_logs')
        .select('*')
        .eq('user_id', user?.id)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (statsError) throw statsError;

      const totalGenerated = data?.length || 0;
      const cacheHits = data?.filter((log) => log.cached).length || 0;
      const totalCost = data?.reduce((sum, log) => sum + (log.cost || 0), 0) || 0;

      return {
        totalGenerated,
        cacheHits,
        cacheHitRate: totalGenerated > 0 ? (cacheHits / totalGenerated) * 100 : 0,
        totalCost,
        byProvider: data?.reduce(
          (acc, log) => {
            if (!acc[log.provider]) {
              acc[log.provider] = { count: 0, cost: 0 };
            }
            acc[log.provider].count++;
            acc[log.provider].cost += log.cost || 0;
            return acc;
          },
          {} as Record<string, { count: number; cost: number }>
        ),
      };
    } catch (err) {
      console.error('Failed to get usage stats:', err);
      return null;
    }
  }, [supabase, user]);

  return {
    // Main generation functions
    generateContent,
    generateQuizForTopic,
    generateQuizFromText,
    generateExplanation,
    generateFlashcards,
    generateSummary,

    // Usage and statistics
    getUsageStats,

    // State
    loading,
    error,
    lastResult,
    clearError: () => setError(null),
  };
};

