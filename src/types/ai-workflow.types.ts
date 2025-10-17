/**
 * Core AI Workflow Type Definitions
 * Production-ready types for LearnPath AI
 */

export interface LearningEvent {
  id: string;
  userId: string;
  conceptId: string;
  correct: boolean;
  timeSpent: number;
  confidence: number;
  resourceId?: string;
  attemptNumber: number;
  timestamp: Date;
  metadata: Record<string, any>;
}

export interface AdaptiveResponse {
  success: boolean;
  path: ConceptNode[];
  mastery: number;
  confidence: number;
  processingTime: number;
  requestId?: string;
  interventions?: Intervention[];
}

export interface ConceptNode {
  id: string;
  name: string;
  difficulty: number;
  mastery: number;
  importance: number;
  category: string;
  embedding?: number[];
}

export interface PrerequisiteEdge {
  source: string;
  target: string;
  strength: number;
  semanticSimilarity: number;
  temporalCorrelation: number;
}

export interface UserKnowledgeState {
  userId: string;
  conceptMastery: Map<string, number>;
  overallMastery: number;
  theta: number; // IRT ability parameter
  lastUpdated: Date;
  conceptCount: number;
  learningVelocity: number;
  lastActivity: Date;
}

export interface MasteryUpdate {
  conceptId: string;
  priorMastery: number;
  posteriorMastery: number;
  confidence: number;
  ability: number;
  standardError: number;
}

export interface Attempt {
  correct: boolean;
  timeSpent: number;
  conceptId: string;
  questionId?: number;
  timestamp: Date;
}

export interface ConceptParameters {
  beta: number; // IRT difficulty parameter
  slip: number; // BKT slip probability
  guess: number; // BKT guess probability
  learn: number; // BKT learning rate
  transit: number; // BKT transit probability
}

export interface AbilityUpdate {
  theta: number;
  se: number; // Standard error
}

export interface LearningResource {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'article' | 'quiz' | 'interactive';
  conceptId: string;
  difficulty: number;
  embedding?: number[];
  engagementScore: number;
  completionRate: number;
  avgTimeMinutes: number;
  // Bandit statistics
  successes: number;
  failures: number;
  pulls: number;
}

export interface SelectionContext {
  userMastery: number;
  explorationRate: number;
  learningStyle?: 'visual' | 'reading' | 'interactive' | 'hands-on';
  availableTime?: number;
}

export interface BanditArm {
  resourceId: string;
  successes: number;
  failures: number;
  pulls: number;
  alpha: number; // Beta distribution parameter
  beta: number; // Beta distribution parameter
}

export interface ResourcePerformance {
  resourceId: string;
  conceptId: string;
  userId: string;
  masteryGain: number;
  engagementScore: number;
  completionTime: number;
  timestamp: Date;
}

export interface ContentAnalysis {
  resourceId: string;
  concepts: Concept[];
  difficulty: number;
  cognitiveLoad: 'low' | 'medium' | 'high';
  readability: number;
  engagementPotential: number;
  metadata: Record<string, any>;
}

export interface Concept {
  text: string;
  frequency: number;
  relevance: number;
  type?: 'declarative' | 'procedural' | 'action';
  embeddings?: number[];
}

export interface LearningTrajectory {
  userId: string;
  conceptId: string;
  predictedMastery: number;
  confidence: number;
  estimatedTime: number;
  riskFactors: RiskFactor[];
  recommendations: Intervention[];
}

export interface RiskFactor {
  type: 'slow_progress' | 'inconsistent_engagement' | 'low_persistence' | 'knowledge_gap';
  severity: 'low' | 'medium' | 'high';
  message: string;
}

export interface Intervention {
  type: 'remediation' | 'motivational' | 'acceleration' | 'support';
  priority: 'low' | 'medium' | 'high';
  action: string;
  message?: string;
  resources?: LearningResource[];
}

export interface PredictiveFeatures {
  // Learner characteristics
  priorMastery: number;
  learningVelocity: number;
  consistency: number;
  engagementLevel: number;
  
  // Concept characteristics
  conceptDifficulty: number;
  prerequisiteStrength: number;
  
  // Temporal features
  timeOfDay: number;
  dayOfWeek: number;
  learningStamina: number;
  
  // Behavioral patterns
  errorPatterns: ErrorPattern[];
  helpSeekingBehavior: number;
  persistence: number;
}

export interface ErrorPattern {
  type: string;
  frequency: number;
  conceptIds: string[];
}

export interface PredictionResult {
  mastery: number;
  confidence: number;
  timeToMastery: number;
}

export interface LearningHistory {
  userId: string;
  conceptId: string;
  timestamp: Date;
  mastery: number;
  correct: boolean;
  timeSpent: number;
}

export interface TelemetryEvent {
  eventType: string;
  userId: string;
  timestamp: Date;
  processingTime: number;
  success: boolean;
  data: Record<string, any>;
}

export interface CacheEntry<T> {
  data: T;
  cachedAt: Date;
  expiresAt: Date;
}

