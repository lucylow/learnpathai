/**
 * Custom React Hook for Lovable Learning Paths
 * Provides easy access to path operations with React Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import lovablePathService from '../services/lovable-path.service';
import { Attempt } from '../lib/lovable';

export const useLovablePath = (pathId?: string) => {
  const queryClient = useQueryClient();

  // Get single path
  const {
    data: path,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['path', pathId],
    queryFn: () => lovablePathService.getPath(pathId!),
    enabled: !!pathId,
  });

  // Get all user paths
  const {
    data: userPaths,
    isLoading: isLoadingPaths,
    error: pathsError,
  } = useQuery({
    queryKey: ['userPaths'],
    queryFn: () => lovablePathService.getUserPaths(),
  });

  // Update path progress
  const updateProgress = useMutation({
    mutationFn: ({ pathId, attempts }: { pathId: string; attempts: Attempt[] }) =>
      lovablePathService.updatePathProgress(pathId, attempts),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['path', pathId] });
      queryClient.invalidateQueries({ queryKey: ['userPaths'] });
    },
  });

  // Reroute path
  const reroutePath = useMutation({
    mutationFn: ({ pathId, failedNode }: { pathId: string; failedNode: string }) =>
      lovablePathService.reroutePath(pathId, failedNode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['path', pathId] });
    },
  });

  // Get next recommendation
  const getNextRecommendation = useMutation({
    mutationFn: ({ pathId, history }: { pathId: string; history: Attempt[] }) =>
      lovablePathService.getNextRecommendation(pathId, history),
  });

  // Delete path
  const deletePath = useMutation({
    mutationFn: (pathId: string) => lovablePathService.deletePath(pathId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPaths'] });
    },
  });

  return {
    path,
    userPaths,
    isLoading,
    isLoadingPaths,
    error,
    pathsError,
    refetch,
    updateProgress,
    reroutePath,
    getNextRecommendation,
    deletePath,
  };
};


