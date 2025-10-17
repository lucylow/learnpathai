/**
 * useExplanation Hook
 * React hook for fetching AI-generated explanations
 */

import { useState, useCallback } from 'react';
import AIExternalService from '../services/ai-external.service';
import type { ExplanationResponse } from '../services/ai-external.service';

interface UseExplanationParams {
  user_id: string;
  node_id: string;
  resource_id: string;
  recent_attempts?: Array<{
    node_id: string;
    score_pct: number;
    hints_used: number;
  }>;
}

interface UseExplanationReturn {
  explanation: ExplanationResponse | null;
  loading: boolean;
  error: string | null;
  fetchExplanation: (params: UseExplanationParams) => Promise<void>;
  reset: () => void;
}

export function useExplanation(): UseExplanationReturn {
  const [explanation, setExplanation] = useState<ExplanationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExplanation = useCallback(async (params: UseExplanationParams) => {
    setLoading(true);
    setError(null);

    try {
      const result = await AIExternalService.getExplanation(params);
      setExplanation(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch explanation';
      setError(errorMessage);
      console.error('Explanation error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setExplanation(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    explanation,
    loading,
    error,
    fetchExplanation,
    reset,
  };
}

export default useExplanation;


