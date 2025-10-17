/**
 * QuestGen API Integration
 * Generates quiz questions (MCQ, True/False, Fill-in-blank) from text
 * API Docs: https://questgen.ai/
 */

import { APIManager } from '../api-manager';
import type { QuizQuestion, APIResponse } from '../types';

interface QuestGenResponse {
  questions: Array<{
    question: string;
    type: string;
    options?: string[];
    answer: string;
    explanation?: string;
    tags?: string[];
  }>;
}

export class QuestGenAPI {
  private baseUrl = 'https://api.questgen.ai';

  constructor(
    private apiManager: APIManager,
    private apiKey: string
  ) {}

  /**
   * Generate quiz questions from text
   * @param text - Input text (max 6000 words)
   * @param count - Number of questions to generate (default: 5)
   * @param types - Question types: MCQ, True/False, Fill-in-blank
   */
  async generateQuestions(
    text: string,
    count: number = 5,
    types: string[] = ['MCQ']
  ): Promise<APIResponse<QuizQuestion[]>> {
    // Truncate text to respect API limits
    const truncatedText = text.substring(0, 6000);

    const cacheKey = `questgen_${Buffer.from(truncatedText).toString('base64').substring(0, 50)}_${count}_${types.join(',')}`;

    const response = await this.apiManager.makeRequest<QuestGenResponse>(
      'questgen',
      `${this.baseUrl}/getQuestions`,
      {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
        },
        body: JSON.stringify({
          text: truncatedText,
          type: types.join(','),
          count,
        }),
      },
      cacheKey,
      60 * 24 // Cache for 24 hours
    );

    // Transform QuestGen response to our format
    if (response.success && response.data?.questions) {
      const transformedQuestions: QuizQuestion[] = response.data.questions.map(
        (q, index) => ({
          id: `questgen_${Date.now()}_${index}`,
          question: q.question,
          type: this.mapQuestionType(q.type),
          options: q.options,
          correctAnswer: q.answer,
          explanation: q.explanation,
          difficulty: this.estimateDifficulty(q),
          tags: q.tags || [],
          source: 'questgen',
        })
      );

      return {
        ...response,
        data: transformedQuestions,
      };
    }

    return {
      ...response,
      data: [],
    };
  }

  /**
   * Map QuestGen question types to our standard types
   */
  private mapQuestionType(questgenType: string): QuizQuestion['type'] {
    const typeMap: Record<string, QuizQuestion['type']> = {
      MCQ: 'mcq',
      'True/False': 'true_false',
      'True or False': 'true_false',
      'Fill-in-the-blank': 'fill_blank',
      'Fill in the blank': 'fill_blank',
      'Short Answer': 'short_answer',
    };

    return typeMap[questgenType] || 'mcq';
  }

  /**
   * Estimate difficulty based on question characteristics
   */
  private estimateDifficulty(question: {
    question: string;
    options?: string[];
  }): QuizQuestion['difficulty'] {
    const questionLength = question.question.length;
    const optionsCount = question.options?.length || 0;

    // More complex questions tend to be harder
    if (questionLength > 150 || optionsCount > 4) return 'hard';
    if (questionLength > 80 || optionsCount > 3) return 'medium';
    return 'easy';
  }
}

