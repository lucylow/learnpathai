/**
 * Lovable Backend Function: Adaptive Path Rerouting
 * Dynamically adjusts learning path when user struggles with a concept
 */

import { Context, Event } from '@lovable/functions';

interface ReroutePathParams {
  userId: string;
  pathId: string;
  failedNode: string;
}

export default async function reroutePath(event: Event, context: Context) {
  try {
    const params = event.data as ReroutePathParams;
    
    if (!params.pathId || !params.failedNode) {
      return {
        success: false,
        error: 'Missing required parameters: pathId, failedNode',
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

    // Call AI service for adaptive rerouting
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    const response = await fetch(`${aiServiceUrl}/api/v1/reroute-path`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.AI_SERVICE_API_KEY}`,
      },
      body: JSON.stringify({
        path_id: params.pathId,
        current_nodes: path.nodes,
        failed_node: params.failedNode,
        subject: path.subject,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI Service error: ${response.statusText}`);
    }

    const reroutedData = await response.json();

    // Update path with rerouted nodes
    const updatedPath = await context.db.learning_paths.update(params.pathId, {
      nodes: reroutedData.nodes,
      updated_at: new Date().toISOString(),
    });

    // Track adaptive reroute event
    await context.db.analytics_events.create({
      user_id: params.userId,
      event_type: 'adaptive_reroute',
      event_data: {
        path_id: params.pathId,
        failed_node: params.failedNode,
        remediation_nodes: reroutedData.added_nodes || [],
      },
    });

    return {
      success: true,
      reroutedPath: updatedPath,
      message: 'Path rerouted with remediation content',
      addedNodes: reroutedData.added_nodes || [],
    };
  } catch (error) {
    console.error('Error rerouting path:', error);
    return {
      success: false,
      error: error.message || 'Failed to reroute path',
    };
  }
}


