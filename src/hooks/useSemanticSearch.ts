/**
 * useSemanticSearch Hook
 * React hook for semantic search of resources
 */

import { useState, useCallback } from 'react';
import AIExternalService from '../services/ai-external.service';
import type { SemanticSearchResponse, SemanticSearchResult } from '../services/ai-external.service';

interface UseSemanticSearchParams {
  query: string;
  top_k?: number;
}

interface UseSemanticSearchReturn {
  results: SemanticSearchResult[];
  loading: boolean;
  error: string | null;
  search: (params: UseSemanticSearchParams) => Promise<void>;
  reset: () => void;
}

export function useSemanticSearch(): UseSemanticSearchReturn {
  const [results, setResults] = useState<SemanticSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (params: UseSemanticSearchParams) => {
    setLoading(true);
    setError(null);

    try {
      const response = await AIExternalService.searchSimilar(params);
      setResults(response.results);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed';
      setError(errorMessage);
      console.error('Semantic search error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResults([]);
    setError(null);
    setLoading(false);
  }, []);

  return {
    results,
    loading,
    error,
    search,
    reset,
  };
}

export default useSemanticSearch;


