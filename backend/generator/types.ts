// backend/generator/types.ts
// Type definitions for the Personalized Learning Pathway Generator

export type UUID = string;

/**
 * LearnerProfile - represents a learner's characteristics and goals
 */
export interface LearnerProfile {
  userId: UUID;
  topic: string;            // e.g. "Python recursion"
  goalConcepts: string[];   // concept IDs or keywords the user wants to master
  priorMastery: Record<string, number>;  // conceptId → mastery score (0 to 1)
  learningStyle?: 'reading' | 'video' | 'mixed' | 'handsOn';
  timeBudgetHours?: number;
}

/**
 * ConceptNode - represents a learning concept in the knowledge graph
 */
export interface ConceptNode {
  id: string;
  title: string;            // e.g. "Recursion Basics"
  prerequisites: string[];   // concept IDs
  description?: string;
  metadata?: Record<string, any>;  // extra info (subject, tags, etc.)
}

/**
 * Resource - represents a learning resource (video, quiz, reading, etc.)
 */
export interface Resource {
  id: string;
  conceptId: string;
  type: 'video' | 'quiz' | 'reading' | 'interactive';
  title: string;
  text?: string;
  transcript?: string;
  url?: string;
  embedding?: number[];     // optional embedding vector for semantic similarity
  difficulty?: number;      // 0.0 to 1.0
  durationMinutes?: number;
  engagementScore?: number; // quality/engagement metric
  modality?: string;        // "visual", "text", "interactive", etc.
}

/**
 * PathStep - a single step in the learning path
 */
export interface PathStep {
  node: ConceptNode;
  resource: Resource;
  estimatedTime?: number;   // minutes
  reasoning?: string;       // explanation for this step
}

/**
 * LearningPath - complete personalized learning path
 */
export interface LearningPath {
  userId: UUID;
  steps: PathStep[];
  createdAt: Date;
  explanation?: string;     // overall explanation/rationale
  metadata?: {
    totalEstimatedHours?: number;
    difficultyLevel?: string;
    completionRate?: number;
  };
}

/**
 * SimilarityEdge - represents similarity between concepts
 */
export interface SimilarityEdge {
  from: string;
  to: string;
  weight: number;  // 0.0 to 1.0
}

/**
 * KnowledgeGraphData - structure for loading graph data
 */
export interface KnowledgeGraphData {
  nodes: ConceptNode[];
  similarityEdges: SimilarityEdge[];
}

/**
 * MasteryMap - maps concept IDs to mastery scores
 */
export type MasteryMap = Record<string, number>;

/**
 * NodeScore - internal structure for path planning
 */
export interface NodeScore {
  nodeId: string;
  score: number;
  mastery: number;
  reason: string;
}

