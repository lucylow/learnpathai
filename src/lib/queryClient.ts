import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { track } from '@/utils/telemetry';

// Create query client with optimized defaults for production
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache configuration
      staleTime: 5 * 60 * 1000,      // 5 minutes - consider data fresh
      gcTime: 10 * 60 * 1000,        // 10 minutes - keep in cache unused (formerly cacheTime)
      refetchOnWindowFocus: true,     // Refetch when user returns to tab
      refetchOnReconnect: true,       // Refetch when network reconnects
      refetchOnMount: false,          // Don't refetch if data is fresh
      
      // Retry configuration with exponential backoff
      retry: (failureCount, error: Error) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.message?.includes('HTTP 4')) {
          return false;
        }
        // Retry up to 3 times for network/server errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Performance
      networkMode: 'online' as const,
    },
    mutations: {
      // Mutation defaults
      retry: 1,
      networkMode: 'online' as const,
      onError: (error: Error) => {
        console.error('Mutation error:', error);
        track('mutation_error', {
          error: error.message || 'Unknown error',
          timestamp: new Date().toISOString()
        });
      }
    }
  },
  
  // Query cache events for monitoring
  queryCache: new QueryCache({
    onError: (error: Error, query) => {
      track('query_error', {
        queryKey: JSON.stringify(query.queryKey),
        error: error.message || 'Unknown error',
        timestamp: new Date().toISOString()
      });
      console.error('Query error:', {
        queryKey: query.queryKey,
        error: error.message
      });
    },
    onSuccess: (data, query) => {
      const isCached = query.state.dataUpdateCount > 0;
      if (isCached) {
        track('query_cache_hit', {
          queryKey: JSON.stringify(query.queryKey)
        });
      } else {
        track('query_success', {
          queryKey: JSON.stringify(query.queryKey)
        });
      }
    }
  }),
  
  // Mutation cache events
  mutationCache: new MutationCache({
    onError: (error: Error, variables, context, mutation) => {
      track('mutation_error', {
        mutationKey: mutation.options.mutationKey ? JSON.stringify(mutation.options.mutationKey) : 'unknown',
        error: error.message || 'Unknown error',
        timestamp: new Date().toISOString()
      });
    },
    onSuccess: (data, variables, context, mutation) => {
      track('mutation_success', {
        mutationKey: mutation.options.mutationKey ? JSON.stringify(mutation.options.mutationKey) : 'unknown',
        timestamp: new Date().toISOString()
      });
    }
  })
});

// Utility function to invalidate queries by pattern
export const invalidateQueriesByPattern = (pattern: string) => {
  queryClient.invalidateQueries({
    predicate: (query) => {
      const queryKey = JSON.stringify(query.queryKey);
      return queryKey.includes(pattern);
    }
  });
};

// Utility function to clear all cache
export const clearAllCache = () => {
  queryClient.clear();
  track('cache_cleared', {
    timestamp: new Date().toISOString()
  });
};

// Prefetch utility for optimistic navigation
export const prefetchPath = async (userId: string) => {
  await queryClient.prefetchQuery({
    queryKey: ['learning-path', userId],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/paths/${userId}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    }
  });
};

