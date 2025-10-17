// backend/generator/planner.ts
// Core path planning logic using priority-aware topological sorting

import {
  LearnerProfile,
  LearningPath,
  PathStep,
  ConceptNode,
  Resource,
  NodeScore,
} from './types';
import { getNode, getSimilarNeighbors } from './knowledgeGraph';
import { recommendResourceForNode } from './recommender';
import { explainDecision, explainPathStep } from './explain';

/**
 * Generate a personalized learning path for a learner
 * @param profile - Learner profile with goals and prior mastery
 * @param allNodes - All available concept nodes
 * @param allResources - All available learning resources
 * @returns Complete learning path
 */
export async function generatePath(
  profile: LearnerProfile,
  allNodes: ConceptNode[],
  allResources: Resource[]
): Promise<LearningPath> {
  // 1. Filter reachable nodes: only those connected to goalConcepts
  const goalSet = new Set(profile.goalConcepts);
  
  // For now, include all nodes; you may filter via graph traversal for efficiency
  const relevantNodes = allNodes;

  // 2. Score nodes by (lack of mastery + relevance to goals)
  const nodeScores: Map<string, NodeScore> = new Map();
  
  for (const node of relevantNodes) {
    const mastery = profile.priorMastery[node.id] ?? 0.0;
    
    // Base score: higher score = more urgent (inverse of mastery)
    const baseScore = 1 - mastery;

    // Add similarity bonus from goal concepts
    let simBonus = 0;
    for (const goal of profile.goalConcepts) {
      const neighbors = getSimilarNeighbors(goal);
      for (const nb of neighbors) {
        if (nb.node.id === node.id) {
          simBonus += nb.weight * 0.5;
        }
      }
    }

    // Check if node is directly a goal
    const isDirectGoal = goalSet.has(node.id);
    const goalBonus = isDirectGoal ? 1.0 : 0.0;

    const totalScore = baseScore + simBonus + goalBonus;
    
    nodeScores.set(node.id, {
      nodeId: node.id,
      score: totalScore,
      mastery,
      reason: `Mastery: ${(mastery * 100).toFixed(0)}%, Relevance: ${simBonus.toFixed(2)}`,
    });
  }

  // 3. Topological sort with priority (Kahn's algorithm with priority queue)
  const ordered = topologicalSortWithPriority(relevantNodes, nodeScores);

  // 4. Map ordered nodes into PathSteps (node + resource)
  const steps: PathStep[] = [];
  
  for (const nodeId of ordered) {
    const node = getNode(nodeId);
    if (!node) continue;

    const resource = recommendResourceForNode(node, allResources, profile);
    
    // Estimate time for this step
    const masteryGap = Math.max(0, 0.7 - (profile.priorMastery[node.id] ?? 0));
    const baseTime = resource.durationMinutes ?? 30;
    const estimatedTime = Math.round(baseTime * (1 + masteryGap * 2));

    // Generate reasoning for this step
    const reasoning = explainPathStep(node, nodeScores.get(nodeId)!, resource);

    steps.push({
      node,
      resource,
      estimatedTime,
      reasoning,
    });
  }

  // 5. Build overall explanation
  const explanation = explainDecision(profile, ordered, nodeScores);

  // 6. Calculate metadata
  const totalEstimatedHours = steps.reduce((sum, step) => sum + (step.estimatedTime ?? 0), 0) / 60;
  const avgMastery = steps.length > 0
    ? steps.reduce((sum, step) => sum + (profile.priorMastery[step.node.id] ?? 0), 0) / steps.length
    : 0;

  const path: LearningPath = {
    userId: profile.userId,
    steps,
    createdAt: new Date(),
    explanation,
    metadata: {
      totalEstimatedHours: Math.round(totalEstimatedHours * 10) / 10,
      difficultyLevel: avgMastery < 0.3 ? 'beginner' : avgMastery < 0.6 ? 'intermediate' : 'advanced',
      completionRate: avgMastery,
    },
  };

  return path;
}

/**
 * Topological sort with priority-based ordering
 * Uses Kahn's algorithm with a priority queue (implemented as sorted array)
 * @param nodes - Array of concept nodes
 * @param nodeScores - Map of node scores
 * @returns Ordered array of node IDs
 */
function topologicalSortWithPriority(
  nodes: ConceptNode[],
  nodeScores: Map<string, NodeScore>
): string[] {
  // Build in-degrees and dependents
  const indegree: Record<string, number> = {};
  const dependents: Record<string, string[]> = {};

  for (const node of nodes) {
    indegree[node.id] = node.prerequisites.length;
    
    for (const prereqId of node.prerequisites) {
      if (!dependents[prereqId]) {
        dependents[prereqId] = [];
      }
      dependents[prereqId].push(node.id);
    }
  }

  // Initialize available nodes (those with no prerequisites)
  const available: string[] = [];
  for (const node of nodes) {
    if (indegree[node.id] === 0) {
      available.push(node.id);
    }
  }

  // Sort available by score (descending - highest priority first)
  available.sort(
    (a, b) => (nodeScores.get(b)?.score ?? 0) - (nodeScores.get(a)?.score ?? 0)
  );

  const ordered: string[] = [];

  while (available.length > 0) {
    // Pick highest priority node
    const nextId = available.shift()!;
    ordered.push(nextId);

    // Update dependents
    const deps = dependents[nextId] || [];
    for (const depId of deps) {
      indegree[depId]--;
      if (indegree[depId] === 0) {
        available.push(depId);
      }
    }

    // Re-sort available list by priority
    available.sort(
      (a, b) => (nodeScores.get(b)?.score ?? 0) - (nodeScores.get(a)?.score ?? 0)
    );
  }

  return ordered;
}

/**
 * Validate if all prerequisites are met for a concept
 * @param conceptId - Concept ID to check
 * @param mastery - Current mastery map
 * @param threshold - Mastery threshold (default 0.7)
 * @returns true if all prerequisites are met
 */
export function arePrerequisitesMet(
  conceptId: string,
  mastery: Record<string, number>,
  threshold: number = 0.7
): boolean {
  const node = getNode(conceptId);
  if (!node) return false;

  for (const prereqId of node.prerequisites) {
    const prereqMastery = mastery[prereqId] ?? 0.0;
    if (prereqMastery < threshold) {
      return false;
    }
  }

  return true;
}

/**
 * Get next recommended concept(s) from a learning path
 * @param path - Learning path
 * @param currentMastery - Current mastery levels
 * @param threshold - Mastery threshold
 * @returns Array of recommended concept IDs
 */
export function getNextRecommendations(
  path: LearningPath,
  currentMastery: Record<string, number>,
  threshold: number = 0.7
): string[] {
  const recommendations: string[] = [];

  for (const step of path.steps) {
    const conceptId = step.node.id;
    const mastery = currentMastery[conceptId] ?? 0.0;

    // Skip if already mastered
    if (mastery >= threshold) continue;

    // Check if prerequisites are met
    if (arePrerequisitesMet(conceptId, currentMastery, threshold)) {
      recommendations.push(conceptId);
      
      // Return first 3 available
      if (recommendations.length >= 3) break;
    }
  }

  return recommendations;
}

/**
 * Re-plan path based on updated mastery (adaptive rerouting)
 * @param profile - Updated learner profile
 * @param allNodes - All concept nodes
 * @param allResources - All resources
 * @returns Updated learning path
 */
export async function replanPath(
  profile: LearnerProfile,
  allNodes: ConceptNode[],
  allResources: Resource[]
): Promise<LearningPath> {
  // Simply regenerate path with updated mastery
  // In a more sophisticated version, you might keep some path state
  return generatePath(profile, allNodes, allResources);
}

