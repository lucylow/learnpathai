/**
 * useQuizGenerator Hook
 * React hook for generating AI quizzes
 */

import { useState, useCallback } from 'react';
import AIExternalService from '../services/ai-external.service';
import type { QuizResponse, QuizQuestion } from '../services/ai-external.service';

interface UseQuizGeneratorParams {
  topic: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  num_questions?: number;
}

interface UseQuizGeneratorReturn {
  quiz: QuizResponse | null;
  questions: QuizQuestion[];
  loading: boolean;
  error: string | null;
  generateQuiz: (params: UseQuizGeneratorParams) => Promise<void>;
  reset: () => void;
}

export function useQuizGenerator(): UseQuizGeneratorReturn {
  const [quiz, setQuiz] = useState<QuizResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateQuiz = useCallback(async (params: UseQuizGeneratorParams) => {
    setLoading(true);
    setError(null);

    try {
      const result = await AIExternalService.generateQuiz(params);
      setQuiz(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate quiz';
      setError(errorMessage);
      console.error('Quiz generation error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setQuiz(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    quiz,
    questions: quiz?.questions || [],
    loading,
    error,
    generateQuiz,
    reset,
  };
}

export default useQuizGenerator;


