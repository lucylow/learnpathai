/**
 * AI External Service
 * Handles communication with mock external AI APIs
 * Provides quiz generation, explanations, TTS, and semantic search
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export interface QuizQuestion {
  qid: string;
  question: string;
  options: string[];
  correct: string;
  explanation: string;
}

export interface QuizResponse {
  topic: string;
  difficulty: string;
  questions: QuizQuestion[];
  generated_at: string;
}

export interface ExplanationResponse {
  explanation: string;
  evidence: string;
  next_step: string;
  confidence: number;
  generated_at: string;
}

export interface SemanticSearchResult {
  resource_id: string;
  title: string;
  score: number;
}

export interface SemanticSearchResponse {
  query: string;
  top_k: number;
  results: SemanticSearchResult[];
}

export interface TTSResponse {
  text: string;
  voice: string;
  speed: number;
  audio_url: string;
  duration_ms: number;
  format: string;
}

export interface TatoebaExample {
  sentence: string;
  translation: string;
  audio_url: string;
}

export interface TatoebaResponse {
  word: string;
  lang_from: string;
  lang_to: string;
  examples: TatoebaExample[];
}

export interface EmbeddingResponse {
  text: string;
  model: string;
  embedding: number[];
  dimensions: number;
}

class AIExternalService {
  private static instance: AIExternalService;

  private constructor() {}

  static getInstance(): AIExternalService {
    if (!AIExternalService.instance) {
      AIExternalService.instance = new AIExternalService();
    }
    return AIExternalService.instance;
  }

  /**
   * Generate quiz questions for a topic
   */
  async generateQuiz(params: {
    topic: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    num_questions?: number;
  }): Promise<QuizResponse> {
    const response = await fetch(`${BACKEND_URL}/api/mock-external/quiz/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`Quiz generation failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get explanation for why a resource is recommended
   */
  async getExplanation(params: {
    user_id: string;
    node_id: string;
    resource_id: string;
    recent_attempts?: Array<{
      node_id: string;
      score_pct: number;
      hints_used: number;
    }>;
  }): Promise<ExplanationResponse> {
    const response = await fetch(`${BACKEND_URL}/api/mock-external/explain`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`Explanation generation failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Semantic search for similar resources
   */
  async searchSimilar(params: {
    query: string;
    top_k?: number;
  }): Promise<SemanticSearchResponse> {
    const response = await fetch(`${BACKEND_URL}/api/mock-external/semantic/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`Semantic search failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Text-to-speech synthesis
   */
  async synthesizeSpeech(params: {
    text: string;
    voice?: string;
    speed?: number;
  }): Promise<TTSResponse> {
    const response = await fetch(`${BACKEND_URL}/api/mock-external/tts/synthesize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`TTS synthesis failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get example sentences from Tatoeba
   */
  async getExampleSentences(params: {
    word: string;
    lang_from?: string;
    lang_to?: string;
  }): Promise<TatoebaResponse> {
    const queryParams = new URLSearchParams(params as Record<string, string>);
    const response = await fetch(
      `${BACKEND_URL}/api/mock-external/tatoeba?${queryParams}`
    );

    if (!response.ok) {
      throw new Error(`Tatoeba query failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Generate embeddings for text
   */
  async generateEmbedding(params: {
    text: string;
    model?: string;
  }): Promise<EmbeddingResponse> {
    const response = await fetch(`${BACKEND_URL}/api/mock-external/embeddings/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`Embedding generation failed: ${response.statusText}`);
    }

    return response.json();
  }
}

export default AIExternalService.getInstance();


