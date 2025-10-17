/**
 * Lovable Backend Function: Update Learning Path
 * Updates path based on new user attempts and recalculates mastery
 */

import { Context, Event } from '@lovable/functions';

interface UpdatePathParams {
  pathId: string;
  newAttempts: Array<{
    question_id?: string;
    concept: string;
    correct: boolean;
    timestamp?: string;
  }>;
}

export default async function updatePath(event: Event, context: Context) {
  try {
    const params = event.data as UpdatePathParams;
    
    if (!params.pathId || !params.newAttempts) {
      return {
        success: false,
        error: 'Missing required parameters: pathId, newAttempts',
      };
    }

    // Get existing path
    const path = await context.db.learning_paths.get(params.pathId);
    if (!path) {
      return {
        success: false,
        error: 'Path not found',
      };
    }

    // Call AI service to recalculate mastery
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    const response = await fetch(`${aiServiceUrl}/api/v1/update-path`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.AI_SERVICE_API_KEY}`,
      },
      body: JSON.stringify({
        path_id: params.pathId,
        current_nodes: path.nodes,
        new_attempts: params.newAttempts,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI Service error: ${response.statusText}`);
    }

    const updatedData = await response.json();

    // Update path in database
    const updatedPath = await context.db.learning_paths.update(params.pathId, {
      nodes: updatedData.nodes,
      overall_mastery: updatedData.overall_mastery,
      updated_at: new Date().toISOString(),
    });

    // Save progress records
    for (const attempt of params.newAttempts) {
      await context.db.user_progress.create({
        user_id: path.user_id,
        path_id: params.pathId,
        concept_id: attempt.concept,
        attempts: [attempt],
        mastery_level: updatedData.nodes.find(n => n.concept_id === attempt.concept)?.current_mastery || 0,
        time_spent_minutes: 0,
        last_activity: new Date().toISOString(),
      });
    }

    // Track analytics
    await context.db.analytics_events.create({
      user_id: path.user_id,
      event_type: 'path_updated',
      event_data: {
        path_id: params.pathId,
        attempts_count: params.newAttempts.length,
        new_mastery: updatedData.overall_mastery,
      },
    });

    return {
      success: true,
      updatedPath,
      message: 'Path updated successfully',
    };
  } catch (error) {
    console.error('Error updating path:', error);
    return {
      success: false,
      error: error.message || 'Failed to update path',
    };
  }
}


