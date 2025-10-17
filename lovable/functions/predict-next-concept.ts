/**
 * Lovable Backend Function: Predict Next Concept
 * Uses DKT model to predict next optimal concept for the learner
 */

import { Context, Event } from '@lovable/functions';

interface PredictNextConceptParams {
  userId: string;
  pathId: string;
  history: Array<{
    question_id?: string;
    concept: string;
    correct: boolean;
  }>;
}

export default async function predictNextConcept(event: Event, context: Context) {
  try {
    const params = event.data as PredictNextConceptParams;
    
    if (!params.pathId || !params.history) {
      return {
        success: false,
        error: 'Missing required parameters: pathId, history',
      };
    }

    // Get learning path
    const path = await context.db.learning_paths.get(params.pathId);
    if (!path) {
      return {
        success: false,
        error: 'Path not found',
      };
    }

    // Call AI service DKT prediction endpoint
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    const response = await fetch(`${aiServiceUrl}/api/v1/predict-next`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.AI_SERVICE_API_KEY}`,
      },
      body: JSON.stringify({
        user_id: params.userId,
        path_nodes: path.nodes,
        attempt_history: params.history,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI Service error: ${response.statusText}`);
    }

    const prediction = await response.json();

    // Track prediction event
    await context.db.analytics_events.create({
      user_id: params.userId,
      event_type: 'next_concept_predicted',
      event_data: {
        path_id: params.pathId,
        predicted_concept: prediction.next_concept,
        confidence: prediction.confidence,
      },
    });

    return {
      success: true,
      nextConcept: prediction.next_concept,
      confidence: prediction.confidence,
      reasoning: prediction.reasoning,
      recommendedResources: prediction.resources || [],
    };
  } catch (error) {
    console.error('Error predicting next concept:', error);
    return {
      success: false,
      error: error.message || 'Failed to predict next concept',
    };
  }
}


