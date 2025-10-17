import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePath } from '../usePath';
import * as mockApi from '../../services/mockApi';
import type { PathResponse } from '../../types/path';

// Mock the mockApi module
vi.mock('../../services/mockApi', () => ({
  generatePath: vi.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('usePath hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches learning path successfully', async () => {
    const mockPath: PathResponse = {
      mastery: 0.75,
      path: [
        {
          concept: 'Loops',
          mastery: 0.42,
          resources: [
            { id: 'l1', title: 'Loops Tutorial', type: 'video', duration: 10 },
          ],
          reasoning: 'Practice needed',
        },
      ],
      userId: 'user-1',
      metadata: {
        generationTime: 100,
        algorithmVersion: '1.0',
        confidenceScore: 0.9,
      },
    };

    vi.mocked(mockApi.generatePath).mockResolvedValueOnce(mockPath);

    const { result } = renderHook(() => usePath('user-1'), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockPath);
    expect(result.current.data?.path[0].concept).toBe('Loops');
  });

  it('handles API error correctly', async () => {
    const errorMessage = 'Failed to generate path';
    vi.mocked(mockApi.generatePath).mockRejectedValueOnce(
      new Error(errorMessage)
    );

    const { result } = renderHook(() => usePath('user-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.error?.message).toBe(errorMessage);
  });

  it('uses cached data when available', async () => {
    const mockPath: PathResponse = {
      mastery: 0.8,
      path: [],
      userId: 'user-1',
      metadata: {
        generationTime: 100,
        algorithmVersion: '1.0',
        confidenceScore: 0.9,
      },
    };

    vi.mocked(mockApi.generatePath).mockResolvedValue(mockPath);

    const { result, rerender } = renderHook(() => usePath('user-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Should use cached data on rerender
    rerender();

    // generatePath should only be called once (cached on second call)
    expect(mockApi.generatePath).toHaveBeenCalledTimes(1);
  });

  it('can be disabled with enabled option', () => {
    const { result } = renderHook(
      () => usePath('user-1', { enabled: false }),
      {
        wrapper: createWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(mockApi.generatePath).not.toHaveBeenCalled();
  });

  it('passes attempts and targets to API', async () => {
    const mockPath: PathResponse = {
      mastery: 0.6,
      path: [],
      userId: 'user-1',
      metadata: {
        generationTime: 100,
        algorithmVersion: '1.0',
        confidenceScore: 0.9,
      },
    };

    vi.mocked(mockApi.generatePath).mockResolvedValue(mockPath);

    const attempts = [{ concept: 'Loops', correct: false, timestamp: '2025-01-01' }];
    const targets = ['functions', 'arrays'];

    renderHook(() => usePath('user-1', { attempts, targets }), {
      wrapper: createWrapper(),
    });

    await waitFor(() =>
      expect(mockApi.generatePath).toHaveBeenCalledWith({
        attempts,
        targets,
      })
    );
  });
});

