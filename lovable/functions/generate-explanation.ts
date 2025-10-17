/**
 * Lovable Backend Function: Generate AI Explanation
 * Generates personalized explanations using RAG and GPT
 */

import { Context, Event } from '@lovable/functions';

interface GenerateExplanationParams {
  concept: string;
  userLevel: string;
  learningStyle: string;
  context?: string;
}

export default async function generateExplanation(event: Event, context: Context) {
  try {
    const params = event.data as GenerateExplanationParams;
    
    if (!params.concept) {
      return {
        success: false,
        error: 'Missing required parameter: concept',
      };
    }

    // Call AI service RAG explainer endpoint
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    const response = await fetch(`${aiServiceUrl}/api/v1/generate-explanation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.AI_SERVICE_API_KEY}`,
      },
      body: JSON.stringify({
        concept: params.concept,
        user_level: params.userLevel || 'intermediate',
        learning_style: params.learningStyle || 'visual',
        context: params.context || '',
      }),
    });

    if (!response.ok) {
      throw new Error(`AI Service error: ${response.statusText}`);
    }

    const explanation = await response.json();

    return {
      success: true,
      explanation: explanation.explanation,
      examples: explanation.examples || [],
      visualizations: explanation.visualizations || [],
      nextSteps: explanation.next_steps || [],
    };
  } catch (error) {
    console.error('Error generating explanation:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate explanation',
    };
  }
}


