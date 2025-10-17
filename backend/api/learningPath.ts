// backend/api/learningPath.ts
// API endpoint for the advanced pathway generator

import { Request, Response, Router } from 'express';
import { generatePath, replanPath, getNextRecommendations, arePrerequisitesMet } from '../generator/planner';
import { initializeGraph, getNode, getAllNodes, isGraphLoaded, getGraphStats } from '../generator/knowledgeGraph';
import {
  LearnerProfile,
  ConceptNode,
  Resource,
  SimilarityEdge,
  LearningPath,
} from '../generator/types';
import {
  explainRecommendations,
  explainProgress,
  explainLockedConcept,
  generateMotivationalMessage,
} from '../generator/explain';
import fs from 'fs';
import path from 'path';

const router = Router();

// Load knowledge graph and resources on startup
let allNodes: ConceptNode[] = [];
let allResources: Resource[] = [];
let graphInitialized = false;

/**
 * Initialize knowledge graph from JSON files
 */
async function initializeKnowledgeGraph() {
  try {
    // Load concept nodes from knowledge graph
    const kgPath = path.join(__dirname, '..', 'data', 'knowledge_graph.json');
    const kgData = JSON.parse(fs.readFileSync(kgPath, 'utf8'));

    // Convert to ConceptNode format
    allNodes = Object.entries(kgData as Record<string, import('../generator/types').RawConceptData>).map(([id, data]) => ({
      id,
      title: data.title || id,
      prerequisites: data.prereqs || data.prerequisites || [],
      description: data.description || '',
      metadata: data,
    }));

    // Load resources
    const resourcesPath = path.join(__dirname, '..', 'data', 'resources.json');
    if (fs.existsSync(resourcesPath)) {
      const resourcesData = JSON.parse(fs.readFileSync(resourcesPath, 'utf8'));
      allResources = resourcesData;
    } else {
      console.warn('Resources file not found. Using empty resources.');
      allResources = [];
    }

    // Create similarity edges (for now, just from prerequisites)
    const similarityEdges: SimilarityEdge[] = [];
    for (const node of allNodes) {
      for (const prereq of node.prerequisites) {
        similarityEdges.push({
          from: prereq,
          to: node.id,
          weight: 0.7,
        });
      }
    }

    // Initialize the knowledge graph
    await initializeGraph(allNodes, similarityEdges);
    graphInitialized = true;

    console.log(`✅ Knowledge graph initialized: ${allNodes.length} nodes, ${allResources.length} resources`);
  } catch (error) {
    console.error('❌ Failed to initialize knowledge graph:', error);
    graphInitialized = false;
  }
}

// Initialize on module load
initializeKnowledgeGraph();

/**
 * POST /api/learning-path/generate
 * Generate a personalized learning path
 */
router.post('/generate', async (req: Request, res: Response) => {
  try {
    if (!graphInitialized) {
      await initializeKnowledgeGraph();
      if (!graphInitialized) {
        return res.status(503).json({
          success: false,
          error: 'Knowledge graph not initialized',
        });
      }
    }

    const {
      userId,
      topic,
      goalConcepts,
      priorMastery,
      learningStyle,
      timeBudgetHours,
    } = req.body;

    // Validate required fields
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required',
      });
    }

    // Create learner profile
    const profile: LearnerProfile = {
      userId,
      topic: topic || 'General Learning',
      goalConcepts: goalConcepts || [],
      priorMastery: priorMastery || {},
      learningStyle: learningStyle || 'mixed',
      timeBudgetHours: timeBudgetHours || undefined,
    };

    // If no goal concepts specified, use all available nodes
    if (profile.goalConcepts.length === 0) {
      profile.goalConcepts = allNodes.slice(0, 5).map((n) => n.id);
    }

    // Generate path
    const startTime = Date.now();
    const path = await generatePath(profile, allNodes, allResources);
    const generationTime = Date.now() - startTime;

    res.json({
      success: true,
      path,
      generationTimeMs: generationTime,
      graphStats: getGraphStats(),
    });
  } catch (error: unknown) {
    console.error('Error generating learning path:', error);
    res.status(500).json({
      success: false,
      error: 'Path generation failed',
      detail: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/learning-path/replan
 * Replan an existing learning path with updated mastery
 */
router.post('/replan', async (req: Request, res: Response) => {
  try {
    if (!graphInitialized) {
      return res.status(503).json({
        success: false,
        error: 'Knowledge graph not initialized',
      });
    }

    const { userId, topic, goalConcepts, priorMastery, learningStyle } = req.body;

    const profile: LearnerProfile = {
      userId,
      topic,
      goalConcepts,
      priorMastery,
      learningStyle,
    };

    const path = await replanPath(profile, allNodes, allResources);

    res.json({
      success: true,
      path,
      message: 'Path replanned based on updated mastery',
    });
  } catch (error: unknown) {
    console.error('Error replanning path:', error);
    res.status(500).json({
      success: false,
      error: 'Path replanning failed',
      detail: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/learning-path/next-recommendations
 * Get next recommended concepts based on current mastery
 */
router.post('/next-recommendations', async (req: Request, res: Response) => {
  try {
    const { path, currentMastery } = req.body;

    if (!path || !currentMastery) {
      return res.status(400).json({
        success: false,
        error: 'path and currentMastery are required',
      });
    }

    const recommendations = getNextRecommendations(path, currentMastery);
    const explanation = explainRecommendations(recommendations, currentMastery);
    const motivationalMessage = generateMotivationalMessage(currentMastery);

    res.json({
      success: true,
      recommendations,
      explanation,
      motivationalMessage,
    });
  } catch (error: unknown) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get recommendations',
      detail: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/learning-path/concept/:conceptId
 * Get details about a specific concept
 */
router.get('/concept/:conceptId', (req: Request, res: Response) => {
  try {
    const { conceptId } = req.params;
    const node = getNode(conceptId);

    if (!node) {
      return res.status(404).json({
        success: false,
        error: 'Concept not found',
      });
    }

    const resources = allResources.filter((r) => r.conceptId === conceptId);

    res.json({
      success: true,
      concept: node,
      resources,
    });
  } catch (error: unknown) {
    console.error('Error getting concept:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get concept',
      detail: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/learning-path/progress
 * Get progress summary
 */
router.post('/progress', (req: Request, res: Response) => {
  try {
    const { mastery, totalConcepts } = req.body;

    if (!mastery) {
      return res.status(400).json({
        success: false,
        error: 'mastery is required',
      });
    }

    const progressSummary = explainProgress(mastery, totalConcepts || Object.keys(mastery).length);
    const motivationalMessage = generateMotivationalMessage(mastery);

    res.json({
      success: true,
      progressSummary,
      motivationalMessage,
    });
  } catch (error: unknown) {
    console.error('Error getting progress:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get progress',
      detail: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/learning-path/status
 * Get system status
 */
router.get('/status', (req: Request, res: Response) => {
  res.json({
    success: true,
    status: 'operational',
    graphInitialized,
    graphStats: graphInitialized ? getGraphStats() : null,
    resourceCount: allResources.length,
  });
});

/**
 * POST /api/learning-path/reload-graph
 * Reload knowledge graph (admin endpoint)
 */
router.post('/reload-graph', async (req: Request, res: Response) => {
  try {
    await initializeKnowledgeGraph();
    res.json({
      success: true,
      message: 'Knowledge graph reloaded',
      graphStats: getGraphStats(),
    });
  } catch (error: unknown) {
    console.error('Error reloading graph:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reload graph',
      detail: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;

