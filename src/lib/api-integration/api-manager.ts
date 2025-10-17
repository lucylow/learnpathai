/**
 * Core API Integration Manager
 * Handles rate limiting, caching, cost tracking, and provider fallback
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { APIResponse, RateLimitInfo, CacheEntry } from './types';

export class APIManager {
  private supabase: SupabaseClient;
  private cache = new Map<string, CacheEntry<unknown>>();
  private rateLimits = new Map<string, RateLimitInfo>();
  private monthlyCost = 0;
  private readonly MAX_MONTHLY_COST = 100; // $100 monthly budget
  private readonly MAX_CACHE_SIZE = 1000; // Maximum number of cached items

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.initializeRateLimiting();
    this.loadMonthlyCost();
  }

  /**
   * Initialize rate limiting for all providers
   */
  private initializeRateLimiting() {
    const providers = [
      { name: 'questgen', limit: 100, window: 60000 },
      { name: 'quizgecko', limit: 200, window: 60000 },
      { name: 'openai', limit: 1000, window: 60000 },
      { name: 'quillionz', limit: 50, window: 60000 },
      { name: 'opexams', limit: 100, window: 60000 },
    ];

    providers.forEach((provider) => {
      this.rateLimits.set(provider.name, {
        requests: [],
        limit: provider.limit,
        window: provider.window,
      });
    });
  }

  /**
   * Load current month's cost from database
   */
  private async loadMonthlyCost() {
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data, error } = await this.supabase
        .from('api_usage_logs')
        .select('cost')
        .gte('created_at', startOfMonth.toISOString());

      if (!error && data) {
        this.monthlyCost = data.reduce((sum, log) => sum + (log.cost || 0), 0);
      }
    } catch (error) {
      console.error('Failed to load monthly cost:', error);
    }
  }

  /**
   * Check if provider is within rate limits
   */
  private checkRateLimit(provider: string): boolean {
    const limit = this.rateLimits.get(provider);
    if (!limit) return true;

    const now = Date.now();
    limit.requests = limit.requests.filter((time) => now - time < limit.window);

    if (limit.requests.length >= limit.limit) {
      console.warn(`Rate limit exceeded for ${provider}`);
      return false;
    }

    limit.requests.push(now);
    return true;
  }

  /**
   * Check memory cache first, then database cache
   */
  private async checkCache<T>(key: string): Promise<T | null> {
    // Memory cache first (fastest)
    const memoryCache = this.cache.get(key) as CacheEntry<T> | undefined;
    if (memoryCache && new Date(memoryCache.expiresAt) > new Date()) {
      memoryCache.accessCount++;
      return memoryCache.data;
    }

    // Database cache second
    try {
      const { data, error } = await this.supabase
        .from('api_cache')
        .select('data, expires_at, access_count')
        .eq('cache_key', key)
        .single();

      if (!error && data && new Date(data.expires_at) > new Date()) {
        // Update access count
        await this.supabase
          .from('api_cache')
          .update({ access_count: (data.access_count || 0) + 1 })
          .eq('cache_key', key);

        // Store in memory cache
        const cacheEntry: CacheEntry<T> = {
          data: data.data,
          expiresAt: new Date(data.expires_at),
          createdAt: new Date(),
          accessCount: data.access_count + 1,
        };
        this.cache.set(key, cacheEntry);

        return data.data as T;
      }
    } catch (error) {
      console.error('Cache lookup failed:', error);
    }

    return null;
  }

  /**
   * Store data in both memory and database cache
   */
  private async setCache(key: string, data: unknown, ttlMinutes: number = 60) {
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

    // Memory cache
    const cacheEntry: CacheEntry<unknown> = {
      data,
      expiresAt,
      createdAt: new Date(),
      accessCount: 0,
    };
    this.cache.set(key, cacheEntry);

    // Enforce cache size limit (LRU eviction)
    if (this.cache.size > this.MAX_CACHE_SIZE) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    // Database cache (with conflict resolution)
    try {
      await this.supabase.from('api_cache').upsert(
        {
          cache_key: key,
          data,
          expires_at: expiresAt.toISOString(),
          access_count: 0,
        },
        {
          onConflict: 'cache_key',
        }
      );
    } catch (error) {
      console.error('Failed to set cache:', error);
    }
  }

  /**
   * Log API call for analytics and cost tracking
   */
  private async logAPICall(provider: string, cost: number, success: boolean, metadata?: Record<string, unknown>) {
    this.monthlyCost += cost;

    try {
      await this.supabase.from('api_usage_logs').insert({
        provider,
        cost,
        success,
        monthly_cost: this.monthlyCost,
        metadata,
      });
    } catch (error) {
      console.error('Failed to log API call:', error);
    }
  }

  /**
   * Make an API request with caching, rate limiting, and error handling
   */
  async makeRequest<T>(
    provider: string,
    endpoint: string,
    options: RequestInit,
    cacheKey?: string,
    cacheTTL: number = 60
  ): Promise<APIResponse<T>> {
    const startTime = Date.now();

    // Check rate limits
    if (!this.checkRateLimit(provider)) {
      return {
        success: false,
        error: `Rate limit exceeded for ${provider}`,
        provider,
        cached: false,
        cost: 0,
        timestamp: Date.now(),
      };
    }

    // Check budget
    if (this.monthlyCost >= this.MAX_MONTHLY_COST) {
      return {
        success: false,
        error: 'Monthly API budget exceeded',
        provider,
        cached: false,
        cost: 0,
        timestamp: Date.now(),
      };
    }

    // Check cache first
    if (cacheKey) {
      const cached = await this.checkCache<T>(cacheKey);
      if (cached) {
        return {
          success: true,
          data: cached,
          provider,
          cached: true,
          cost: 0,
          timestamp: Date.now(),
          metadata: {
            cacheHit: true,
            generationTime: 0,
          },
        };
      }
    }

    try {
      const response = await fetch(endpoint, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const cost = this.calculateCost(provider, data);
      const generationTime = Date.now() - startTime;

      // Cache successful responses
      if (cacheKey) {
        await this.setCache(cacheKey, data, cacheTTL);
      }

      // Log the call
      await this.logAPICall(provider, cost, true, {
        endpoint,
        generationTime,
      });

      return {
        success: true,
        data: data as T,
        provider,
        cached: false,
        cost,
        timestamp: Date.now(),
        metadata: {
          generationTime,
          cacheHit: false,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await this.logAPICall(provider, 0, false, {
        error: errorMessage,
        endpoint,
      });

      return {
        success: false,
        error: errorMessage,
        provider,
        cached: false,
        cost: 0,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Calculate cost based on provider and response
   */
  private calculateCost(provider: string, data: unknown): number {
    const costMap: Record<string, number> = {
      questgen: 0.02, // $0.02 per request
      quizgecko: 0.03,
      openai: 0.0015, // per 1K tokens approx
      quillionz: 0.01,
      opexams: 0.015,
    };

    let baseCost = costMap[provider] || 0.01;

    // For OpenAI, calculate based on tokens if available
    if (provider === 'openai' && data && typeof data === 'object' && 'usage' in data) {
      const usage = (data as { usage?: { total_tokens?: number } }).usage;
      if (usage?.total_tokens) {
        baseCost = (usage.total_tokens / 1000) * 0.0015;
      }
    }

    return baseCost;
  }

  /**
   * Get current monthly cost
   */
  getMonthlyCost(): number {
    return this.monthlyCost;
  }

  /**
   * Get remaining budget
   */
  getRemainingBudget(): number {
    return Math.max(0, this.MAX_MONTHLY_COST - this.monthlyCost);
  }

  /**
   * Get usage statistics for a provider
   */
  async getProviderStats(provider: string, days: number = 30): Promise<{
    totalRequests: number;
    successRate: number;
    totalCost: number;
    averageResponseTime: number;
  }> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await this.supabase
        .from('api_usage_logs')
        .select('*')
        .eq('provider', provider)
        .gte('created_at', startDate.toISOString());

      if (error || !data) {
        return {
          totalRequests: 0,
          successRate: 0,
          totalCost: 0,
          averageResponseTime: 0,
        };
      }

      const totalRequests = data.length;
      const successfulRequests = data.filter((log) => log.success).length;
      const totalCost = data.reduce((sum, log) => sum + (log.cost || 0), 0);
      const responseTimes = data
        .map((log) => log.metadata?.generationTime)
        .filter((time): time is number => typeof time === 'number');
      const averageResponseTime =
        responseTimes.length > 0
          ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
          : 0;

      return {
        totalRequests,
        successRate: totalRequests > 0 ? successfulRequests / totalRequests : 0,
        totalCost,
        averageResponseTime,
      };
    } catch (error) {
      console.error('Failed to get provider stats:', error);
      return {
        totalRequests: 0,
        successRate: 0,
        totalCost: 0,
        averageResponseTime: 0,
      };
    }
  }

  /**
   * Clear expired cache entries
   */
  async clearExpiredCache() {
    const now = new Date();

    // Clear memory cache
    for (const [key, entry] of this.cache.entries()) {
      if (new Date(entry.expiresAt) <= now) {
        this.cache.delete(key);
      }
    }

    // Clear database cache
    try {
      await this.supabase.from('api_cache').delete().lt('expires_at', now.toISOString());
    } catch (error) {
      console.error('Failed to clear expired cache:', error);
    }
  }
}

