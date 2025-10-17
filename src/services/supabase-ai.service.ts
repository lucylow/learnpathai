/**
 * Supabase AI Service
 * Handles communication with Supabase Edge Functions for AI features
 */

import { functions } from '../lib/lovable';

export interface EdgeExplanationParams {
  userId: string;
  nodeId: string;
  resourceId: string;
  evidenceSnippet?: string;
  recentAttempts?: Array<{
    node_id: string;
    score_pct: number;
    hints_used: number;
  }>;
}

export interface EdgeExplanationResponse {
  explanation: string;
  highlight: string;
  confidence: number;
  resource_title?: string;
  node_title?: string;
  generated_at: string;
}

export interface EdgeQuizParams {
  concept: string;
  excerpt?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  numQuestions?: number;
  userId?: string;
}

export interface EdgeQuizQuestion {
  qid: string;
  question: string;
  options: string[];
  correct: string;
  explanation: string;
}

export interface EdgeQuizResponse {
  concept: string;
  difficulty: string;
  quiz: EdgeQuizQuestion[];
  generated_at: string;
}

export interface EdgeEmbedParams {
  resourceId: string;
  text: string;
  model?: string;
}

export interface EdgeEmbedResponse {
  success: boolean;
  resource_id: string;
  dimensions: number;
  model: string;
  generated_at: string;
}

export interface EdgeQueryParams {
  queryText: string;
  k?: number;
  similarityThreshold?: number;
}

export interface EdgeQueryResult {
  resource_id: string;
  score: number;
  id?: string;
  title?: string;
  type?: string;
  difficulty?: string;
  url?: string;
}

export interface EdgeQueryResponse {
  query: string;
  results: EdgeQueryResult[];
  count: number;
  generated_at: string;
}

class SupabaseAIService {
  private static instance: SupabaseAIService;
  private supabaseUrl: string;
  private supabaseAnonKey: string;

  private constructor() {
    this.supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    this.supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  }

  static getInstance(): SupabaseAIService {
    if (!SupabaseAIService.instance) {
      SupabaseAIService.instance = new SupabaseAIService();
    }
    return SupabaseAIService.instance;
  }

  /**
   * Call Supabase Edge Function
   */
  private async callEdgeFunction<T>(
    functionName: string,
    params: any
  ): Promise<T> {
    const response = await fetch(
      `${this.supabaseUrl}/functions/v1/${functionName}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.supabaseAnonKey}`,
        },
        body: JSON.stringify(params),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Edge function ${functionName} failed`);
    }

    return response.json();
  }

  /**
   * Generate explanation using Edge Function
   */
  async getExplanation(
    params: EdgeExplanationParams
  ): Promise<EdgeExplanationResponse> {
    return this.callEdgeFunction<EdgeExplanationResponse>('explain', params);
  }

  /**
   * Generate quiz using Edge Function
   */
  async generateQuiz(params: EdgeQuizParams): Promise<EdgeQuizResponse> {
    return this.callEdgeFunction<EdgeQuizResponse>('generateQuiz', params);
  }

  /**
   * Generate embeddings for a resource using Edge Function
   */
  async embedResource(params: EdgeEmbedParams): Promise<EdgeEmbedResponse> {
    return this.callEdgeFunction<EdgeEmbedResponse>('embedResource', params);
  }

  /**
   * Query similar resources using Edge Function
   */
  async querySimilar(params: EdgeQueryParams): Promise<EdgeQueryResponse> {
    return this.callEdgeFunction<EdgeQueryResponse>('querySimilar', params);
  }
}

export default SupabaseAIService.getInstance();


