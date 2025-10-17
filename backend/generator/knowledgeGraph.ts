// backend/generator/knowledgeGraph.ts
// Knowledge Graph module - manages concept relationships and similarities

import { ConceptNode, SimilarityEdge } from './types';

/** In-memory cache for concept nodes */
let conceptNodes: Record<string, ConceptNode> = {};

/** In-memory cache for similarity edges */
let similarityEdges: Record<string, Array<{ to: string; weight: number }>> = {};

/**
 * Initialize the knowledge graph with nodes and similarity edges
 * @param nodes - Array of concept nodes
 * @param simEdges - Array of similarity edges
 */
export async function initializeGraph(
  nodes: ConceptNode[],
  simEdges: SimilarityEdge[]
): Promise<void> {
  // Clear existing data
  conceptNodes = {};
  similarityEdges = {};

  // Load nodes
  for (const node of nodes) {
    conceptNodes[node.id] = node;
  }

  // Load similarity edges
  for (const edge of simEdges) {
    if (!similarityEdges[edge.from]) {
      similarityEdges[edge.from] = [];
    }
    similarityEdges[edge.from].push({ to: edge.to, weight: edge.weight });
  }

  console.log(`Knowledge graph initialized: ${nodes.length} nodes, ${simEdges.length} edges`);
}

/**
 * Get a concept node by ID
 * @param id - Concept ID
 * @returns The concept node or null if not found
 */
export function getNode(id: string): ConceptNode | null {
  return conceptNodes[id] ?? null;
}

/**
 * Get all concept nodes
 * @returns Record of all concept nodes
 */
export function getAllNodes(): Record<string, ConceptNode> {
  return { ...conceptNodes };
}

/**
 * Get similar neighbors for a concept, sorted by weight
 * @param id - Concept ID
 * @returns Array of similar concepts with weights
 */
export function getSimilarNeighbors(
  id: string
): Array<{ node: ConceptNode; weight: number }> {
  const edges = similarityEdges[id] || [];
  return edges
    .map((e) => ({ node: conceptNodes[e.to], weight: e.weight }))
    .filter((x) => x.node !== undefined)
    .sort((a, b) => b.weight - a.weight);
}

/**
 * Get all prerequisite nodes for a concept (recursive)
 * @param id - Concept ID
 * @returns Array of prerequisite concept IDs
 */
export function getPrerequisites(id: string): string[] {
  const node = getNode(id);
  if (!node) return [];

  const prereqs = new Set<string>();
  const visited = new Set<string>();

  function traverse(nodeId: string) {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);

    const current = getNode(nodeId);
    if (!current) return;

    for (const prereqId of current.prerequisites) {
      prereqs.add(prereqId);
      traverse(prereqId);
    }
  }

  traverse(id);
  return Array.from(prereqs);
}

/**
 * Get all dependent nodes (concepts that depend on this one)
 * @param id - Concept ID
 * @returns Array of dependent concept IDs
 */
export function getDependents(id: string): string[] {
  const dependents: string[] = [];

  for (const [nodeId, node] of Object.entries(conceptNodes)) {
    if (node.prerequisites.includes(id)) {
      dependents.push(nodeId);
    }
  }

  return dependents;
}

/**
 * Check if the graph is loaded
 * @returns true if nodes exist
 */
export function isGraphLoaded(): boolean {
  return Object.keys(conceptNodes).length > 0;
}

/**
 * Get graph statistics
 * @returns Object with graph stats
 */
export function getGraphStats() {
  return {
    nodeCount: Object.keys(conceptNodes).length,
    edgeCount: Object.values(similarityEdges).reduce((sum, edges) => sum + edges.length, 0),
    avgPrerequisites:
      Object.values(conceptNodes).reduce((sum, n) => sum + n.prerequisites.length, 0) /
      Math.max(1, Object.keys(conceptNodes).length),
  };
}

/**
 * Find concepts related to a goal (by similarity or prerequisites)
 * @param goalConcepts - Array of goal concept IDs
 * @returns Array of related concept IDs
 */
export function findRelatedConcepts(goalConcepts: string[]): string[] {
  const related = new Set<string>();

  for (const goalId of goalConcepts) {
    // Add the goal itself
    related.add(goalId);

    // Add prerequisites
    const prereqs = getPrerequisites(goalId);
    prereqs.forEach((p) => related.add(p));

    // Add similar concepts
    const similar = getSimilarNeighbors(goalId);
    similar.slice(0, 5).forEach((s) => related.add(s.node.id));
  }

  return Array.from(related);
}

