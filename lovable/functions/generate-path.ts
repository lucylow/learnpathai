/**
 * Lovable Backend Function: Generate Learning Path
 * Calls the Python AI service to generate a personalized learning path
 */

import { Context, Event } from '@lovable/functions';

interface GeneratePathParams {
  userId: string;
  subject: string;
  userAttempts: Array<{
    concept: string;
    correct: boolean;
  }>;
  learningStyle: string;
  learningGoal: string;
}

export default async function generatePath(event: Event, context: Context) {
  try {
    const params = event.data as GeneratePathParams;
    
    // Validate input
    if (!params.userId || !params.subject) {
      return {
        success: false,
        error: 'Missing required parameters: userId, subject',
      };
    }

    // Call Python AI service endpoint
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    const response = await fetch(`${aiServiceUrl}/api/v1/generate-path`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.AI_SERVICE_API_KEY}`,
      },
      body: JSON.stringify({
        subject: params.subject,
        user_attempts: params.userAttempts,
        learning_style: params.learningStyle,
        learning_goal: params.learningGoal,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI Service error: ${response.statusText}`);
    }

    const pathData = await response.json();

    // Save path to database
    const savedPath = await context.db.learning_paths.create({
      user_id: params.userId,
      subject: params.subject,
      title: pathData.title || `Learning Path: ${params.subject}`,
      nodes: pathData.nodes,
      overall_mastery: pathData.overall_mastery || 0,
      learning_style: params.learningStyle,
      learning_goal: params.learningGoal,
      estimated_hours: pathData.estimated_hours || 0,
    });

    // Track analytics event
    await context.db.analytics_events.create({
      user_id: params.userId,
      event_type: 'path_generated',
      event_data: {
        path_id: savedPath.id,
        subject: params.subject,
        learning_style: params.learningStyle,
      },
    });

    return {
      success: true,
      path: savedPath,
      message: 'Learning path generated successfully',
    };
  } catch (error) {
    console.error('Error generating path:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate learning path',
    };
  }
}


