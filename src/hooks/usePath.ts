import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { generatePath } from "../services/mockApi";
import type { Attempt, PathResponse } from "../types/path";
import { track } from "@/utils/telemetry";

interface UsePathOptions {
  attempts?: Attempt[];
  targets?: string[];
  enabled?: boolean;
  onSuccess?: (data: PathResponse) => void;
  onError?: (error: Error) => void;
}

export function usePath(userId: string, opts: UsePathOptions = {}) {
  const { attempts = [], targets = [], enabled = true, onSuccess, onError } = opts;

  return useQuery<PathResponse, Error>({
    queryKey: ["path", userId, targets.join(","), JSON.stringify(attempts)],
    
    queryFn: async () => {
      try {
        track('path_fetch_started', {
          userId,
          attemptCount: attempts.length,
          targetCount: targets.length,
          timestamp: new Date().toISOString()
        });

        const startTime = performance.now();
        
        // Call the API (currently using mock, but ready for real API)
        const data = await generatePath({ 
          attempts, 
          targets 
        });

        const duration = performance.now() - startTime;

        track('path_fetch_completed', {
          userId,
          duration,
          conceptCount: data.path?.length || 0,
          mastery: data.mastery,
          timestamp: new Date().toISOString()
        });

        return data;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        track('path_fetch_failed', {
          userId,
          error: errorMessage,
          timestamp: new Date().toISOString()
        });

        console.error('Failed to fetch learning path:', error);
        throw error;
      }
    },
    
    // Use global defaults from queryClient, but allow overrides
    staleTime: 5 * 60 * 1000,      // 5 minutes
    gcTime: 10 * 60 * 1000,         // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: false,    // Don't refetch on tab focus for paths
    refetchOnMount: false,          // Don't refetch if data is fresh
    
    // Retry configuration
    retry: (failureCount, error) => {
      // Log retry attempts
      track('path_fetch_retry', {
        userId,
        failureCount,
        error: error.message,
        timestamp: new Date().toISOString()
      });

      // Don't retry on validation errors (400-499)
      if (error.message.includes('HTTP 4')) {
        return false;
      }

      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    
    retryDelay: (attemptIndex) => {
      // Exponential backoff: 1s, 2s, 4s, max 30s
      const delay = Math.min(1000 * 2 ** attemptIndex, 30000);
      console.log(`Retrying in ${delay}ms (attempt ${attemptIndex + 1})`);
      return delay;
    },
    
    // Enable/disable query
    enabled,
    
    // Callbacks
    onSuccess: (data) => {
      track('path_loaded', {
        userId,
        conceptCount: data.path?.length || 0,
        avgMastery: data.mastery,
        timestamp: new Date().toISOString()
      });

      if (onSuccess) {
        onSuccess(data);
      }
    },
    
    onError: (error) => {
      track('path_error', {
        userId,
        error: error.message,
        timestamp: new Date().toISOString()
      });

      console.error('Path query error:', error);

      if (onError) {
        onError(error);
      }
    },
  });
}

// Hook for real-time path updates (when connected to backend)
export function usePathRealtime(userId: string, opts: UsePathOptions = {}) {
  const query = usePath(userId, opts);

  // In a real implementation, this would set up WebSocket connection
  // For now, we'll use polling as a fallback
  return {
    ...query,
    // Add real-time specific properties/methods here
    isConnected: true, // Would be actual WebSocket connection status
  };
}

// Utility hook for prefetching paths (optimistic navigation)
export function usePrefetchPath() {
  const { queryKey, queryFn } = usePath('prefetch', { enabled: false });

  return {
    prefetch: async (userId: string, opts: UsePathOptions = {}) => {
      track('path_prefetch', { userId });
      
      // This would prefetch the path for faster navigation
      // Implementation depends on whether using React Query's prefetch
      console.log('Prefetching path for', userId);
    }
  };
}
