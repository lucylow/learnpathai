// backend/generator/recommender.ts
// Resource recommendation logic - selects best resources for each concept

import { Resource, ConceptNode, LearnerProfile } from './types';
import { getSimilarNeighbors } from './knowledgeGraph';
import { cosineSimilarity } from './embeddings';

/**
 * Recommend the best resource for a concept node based on learner profile
 * @param node - Concept node
 * @param allResources - All available resources
 * @param profile - Learner profile
 * @returns Best recommended resource
 */
export function recommendResourceForNode(
  node: ConceptNode,
  allResources: Resource[],
  profile: LearnerProfile
): Resource {
  // Find resources for this concept
  const candidates = allResources.filter((r) => r.conceptId === node.id);

  if (candidates.length === 0) {
    // Return a placeholder resource if none found
    return createPlaceholderResource(node);
  }

  // If only one candidate, return it
  if (candidates.length === 1) {
    return candidates[0];
  }

  // Get similar neighbors' resources as additional candidates
  const neighbors = getSimilarNeighbors(node.id);
  const neighborResources: Resource[] = [];
  
  for (const nb of neighbors.slice(0, 3)) {
    const extras = allResources.filter((r) => r.conceptId === nb.node.id);
    neighborResources.push(...extras);
  }

  const pool = [...candidates, ...neighborResources];

  // Score each resource
  let best: Resource = pool[0];
  let bestScore = -Infinity;

  const userMastery = profile.priorMastery[node.id] ?? 0.0;

  for (const resource of pool) {
    let score = 0;

    // 1. Learning style match bonus
    score += scoreLearningStyleMatch(resource, profile.learningStyle);

    // 2. Difficulty match (resources should match user's current level)
    score += scoreDifficultyMatch(resource, userMastery);

    // 3. Engagement score (quality metric)
    score += (resource.engagementScore ?? 0.5) * 2;

    // 4. Embedding similarity (if available)
    // This is a placeholder - in production, compare resource embedding
    // with user's goal embeddings or recent successful resources
    if (resource.embedding && resource.embedding.length > 0) {
      // For now, just add a small bonus if embedding exists
      score += 0.5;
    }

    // 5. Prefer direct concept matches over neighbor resources
    if (resource.conceptId === node.id) {
      score += 1.0;
    }

    if (score > bestScore) {
      bestScore = score;
      best = resource;
    }
  }

  return best;
}

/**
 * Score how well a resource matches the learner's learning style
 * @param resource - Resource to score
 * @param learningStyle - User's preferred learning style
 * @returns Style match score (0-3)
 */
function scoreLearningStyleMatch(
  resource: Resource,
  learningStyle: string | undefined
): number {
  if (!learningStyle) return 0;

  const styleMap: Record<string, string[]> = {
    video: ['video'],
    reading: ['reading', 'text'],
    handsOn: ['interactive', 'quiz'],
    mixed: ['video', 'reading', 'interactive'],
  };

  const preferredTypes = styleMap[learningStyle] || [];
  
  if (preferredTypes.includes(resource.type)) {
    return 3.0;
  }

  // Check modality match
  if (resource.modality && preferredTypes.includes(resource.modality)) {
    return 2.0;
  }

  return 0;
}

/**
 * Score how well resource difficulty matches user's mastery level
 * @param resource - Resource to score
 * @param userMastery - User's current mastery (0-1)
 * @returns Difficulty match score (0-2)
 */
function scoreDifficultyMatch(resource: Resource, userMastery: number): number {
  const difficulty = resource.difficulty ?? 0.5;

  // Ideal difficulty is slightly above user's mastery (zone of proximal development)
  const idealDifficulty = Math.min(1.0, userMastery + 0.2);
  const difficultyGap = Math.abs(difficulty - idealDifficulty);

  // Score inversely proportional to gap
  const score = Math.max(0, 2.0 - difficultyGap * 4);
  return score;
}

/**
 * Create a placeholder resource when none is available
 * @param node - Concept node
 * @returns Placeholder resource
 */
function createPlaceholderResource(node: ConceptNode): Resource {
  return {
    id: `placeholder-${node.id}`,
    conceptId: node.id,
    type: 'reading',
    title: `Learn ${node.title}`,
    url: '#',
    difficulty: 0.5,
    durationMinutes: 30,
    engagementScore: 0.5,
    modality: 'text',
  };
}

/**
 * Recommend multiple resources for a concept (diversity)
 * @param node - Concept node
 * @param allResources - All available resources
 * @param profile - Learner profile
 * @param count - Number of resources to recommend
 * @returns Array of recommended resources
 */
export function recommendMultipleResources(
  node: ConceptNode,
  allResources: Resource[],
  profile: LearnerProfile,
  count: number = 3
): Resource[] {
  const candidates = allResources.filter((r) => r.conceptId === node.id);

  if (candidates.length === 0) {
    return [createPlaceholderResource(node)];
  }

  if (candidates.length <= count) {
    return candidates;
  }

  // Score all candidates
  const scored = candidates.map((resource) => {
    const userMastery = profile.priorMastery[node.id] ?? 0.0;
    let score = 0;
    score += scoreLearningStyleMatch(resource, profile.learningStyle);
    score += scoreDifficultyMatch(resource, userMastery);
    score += (resource.engagementScore ?? 0.5) * 2;
    return { resource, score };
  });

  // Sort by score and diversify by type
  scored.sort((a, b) => b.score - a.score);

  const selected: Resource[] = [];
  const usedTypes = new Set<string>();

  // First pass: pick diverse types
  for (const item of scored) {
    if (selected.length >= count) break;
    if (!usedTypes.has(item.resource.type)) {
      selected.push(item.resource);
      usedTypes.add(item.resource.type);
    }
  }

  // Second pass: fill remaining slots with highest scores
  for (const item of scored) {
    if (selected.length >= count) break;
    if (!selected.includes(item.resource)) {
      selected.push(item.resource);
    }
  }

  return selected.slice(0, count);
}

/**
 * Recommend resources across multiple concepts in a path
 * @param conceptIds - Array of concept IDs
 * @param allResources - All available resources
 * @param profile - Learner profile
 * @returns Map of concept ID to recommended resource
 */
export function recommendResourcesForPath(
  conceptIds: string[],
  allResources: Resource[],
  profile: LearnerProfile,
  nodes: Map<string, ConceptNode>
): Record<string, Resource> {
  const recommendations: Record<string, Resource> = {};

  for (const conceptId of conceptIds) {
    const node = nodes.get(conceptId);
    if (!node) continue;

    recommendations[conceptId] = recommendResourceForNode(node, allResources, profile);
  }

  return recommendations;
}

