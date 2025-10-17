/**
 * OpenAI Education API Integration
 * Flexible AI for explanations, quiz generation, tutoring
 * API Docs: https://platform.openai.com/docs
 */

import { APIManager } from '../api-manager';
import type { QuizQuestion, StudyMaterial, APIResponse } from '../types';

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string | null;
    };
  }>;
  usage?: {
    total_tokens: number;
    prompt_tokens: number;
    completion_tokens: number;
  };
}

export class OpenAIEducationAPI {
  private baseUrl = 'https://api.openai.com/v1';

  constructor(
    private apiManager: APIManager,
    private apiKey: string
  ) {}

  /**
   * Generate an educational explanation for a concept
   */
  async generateExplanation(
    concept: string,
    targetLevel: 'beginner' | 'intermediate' | 'advanced' = 'intermediate',
    context?: string
  ): Promise<APIResponse<StudyMaterial>> {
    const cacheKey = `openai_explanation_${concept}_${targetLevel}_${context || ''}`;

    const prompt = this.buildExplanationPrompt(concept, targetLevel, context);

    const response = await this.apiManager.makeRequest<OpenAIResponse>(
      'openai',
      `${this.baseUrl}/chat/completions`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content:
                'You are an expert educational tutor. Provide clear, accurate, and engaging explanations tailored to the student\'s level.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      },
      cacheKey,
      60 * 24 // Cache for 24 hours
    );

    if (response.success && response.data) {
      const explanation = response.data.choices[0]?.message?.content;

      if (!explanation) {
        return {
          ...response,
          success: false,
          error: 'No explanation generated',
        };
      }

      const studyMaterial: StudyMaterial = {
        id: `openai_${Date.now()}`,
        title: `Explanation: ${concept}`,
        content: explanation,
        type: 'explanation',
        source: 'openai',
        targetLevel,
        estimatedReadingTime: Math.ceil(explanation.split(' ').length / 200), // ~200 words/min
      };

      return {
        ...response,
        data: studyMaterial,
      };
    }

    return response as APIResponse<StudyMaterial>;
  }

  /**
   * Generate quiz questions using OpenAI
   */
  async generateQuizQuestions(
    topic: string,
    count: number = 5,
    difficulty: QuizQuestion['difficulty'] = 'medium'
  ): Promise<APIResponse<QuizQuestion[]>> {
    const cacheKey = `openai_quiz_${topic}_${count}_${difficulty}`;

    const prompt = this.buildQuizPrompt(topic, count, difficulty);

    const response = await this.apiManager.makeRequest<OpenAIResponse>(
      'openai',
      `${this.baseUrl}/chat/completions`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content:
                'You are an expert quiz creator. Generate high-quality educational questions in JSON format.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          response_format: { type: 'json_object' },
          max_tokens: 1000,
          temperature: 0.7,
        }),
      },
      cacheKey,
      60 * 24
    );

    if (response.success && response.data) {
      const content = response.data.choices[0]?.message?.content;

      if (!content) {
        return {
          ...response,
          success: false,
          error: 'No quiz questions generated',
        };
      }

      try {
        const quizData = JSON.parse(content);
        const questions: QuizQuestion[] = quizData.questions.map(
          (q: {
            question: string;
            type: string;
            options: string[];
            correctAnswer: string | number;
            explanation: string;
            difficulty: string;
          }, index: number) => ({
            id: `openai_quiz_${Date.now()}_${index}`,
            question: q.question,
            type: this.normalizeQuestionType(q.type),
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            difficulty: this.normalizeDifficulty(q.difficulty),
            tags: [topic],
            source: 'openai',
          })
        );

        return {
          ...response,
          data: questions,
        };
      } catch (parseError) {
        return {
          ...response,
          success: false,
          error: 'Failed to parse quiz JSON',
        };
      }
    }

    return {
      ...response,
      data: [],
    };
  }

  /**
   * Generate a conversational tutoring response
   */
  async generateTutoringResponse(
    userQuestion: string,
    context: {
      topic?: string;
      previousMessages?: OpenAIMessage[];
      studentLevel?: string;
    }
  ): Promise<APIResponse<string>> {
    const messages: OpenAIMessage[] = [
      {
        role: 'system',
        content: `You are a patient and knowledgeable tutor helping a ${context.studentLevel || 'student'} learn about ${context.topic || 'various topics'}. Provide clear, encouraging explanations.`,
      },
      ...(context.previousMessages || []),
      {
        role: 'user',
        content: userQuestion,
      },
    ];

    const response = await this.apiManager.makeRequest<OpenAIResponse>(
      'openai',
      `${this.baseUrl}/chat/completions`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages,
          max_tokens: 300,
          temperature: 0.8,
        }),
      }
      // Don't cache conversational responses
    );

    if (response.success && response.data) {
      const reply = response.data.choices[0]?.message?.content || '';
      return {
        ...response,
        data: reply,
      };
    }

    return {
      ...response,
      success: false,
      error: response.error || 'Failed to generate response',
      data: '',
    };
  }

  /**
   * Build prompt for explanation generation
   */
  private buildExplanationPrompt(
    concept: string,
    level: string,
    context?: string
  ): string {
    return `
Please explain the following concept for a ${level} level learner:

Concept: ${concept}
${context ? `Context: ${context}` : ''}

Requirements:
- Use clear, simple language appropriate for ${level} level
- Include 1-2 concrete examples
- Highlight key takeaways
- Keep explanation under 300 words
- Use engaging, educational tone
    `.trim();
  }

  /**
   * Build prompt for quiz generation
   */
  private buildQuizPrompt(topic: string, count: number, difficulty: string): string {
    return `
Generate ${count} ${difficulty}-difficulty quiz questions about ${topic}.

Return a JSON object with this structure:
{
  "questions": [
    {
      "question": "question text",
      "type": "mcq|true_false|fill_blank|short_answer",
      "options": ["option1", "option2", ...], 
      "correctAnswer": "correct answer or index",
      "explanation": "brief explanation of correct answer",
      "difficulty": "${difficulty}"
    }
  ]
}

Requirements:
- Questions should test genuine understanding
- Include variety of question types
- Make explanations educational
- Ensure accuracy and educational value
    `.trim();
  }

  /**
   * Normalize question type strings
   */
  private normalizeQuestionType(type: string): QuizQuestion['type'] {
    const normalized = type.toLowerCase().replace(/[_\s-]/g, '_');

    if (normalized.includes('mcq') || normalized.includes('multiple')) return 'mcq';
    if (normalized.includes('true') || normalized.includes('false')) return 'true_false';
    if (normalized.includes('fill') || normalized.includes('blank')) return 'fill_blank';
    if (normalized.includes('short')) return 'short_answer';

    return 'mcq';
  }

  /**
   * Normalize difficulty strings
   */
  private normalizeDifficulty(difficulty: string): QuizQuestion['difficulty'] {
    const normalized = difficulty.toLowerCase();

    if (normalized.includes('easy')) return 'easy';
    if (normalized.includes('hard') || normalized.includes('difficult')) return 'hard';
    return 'medium';
  }

  /**
   * Estimate cost for a request
   */
  private estimateCost(tokens: number): number {
    // GPT-3.5 Turbo pricing: ~$0.0015 per 1K tokens (average of input/output)
    return (tokens / 1000) * 0.0015;
  }
}

