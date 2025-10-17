// Age-based learning type definitions for LearnPath AI

export type AgeGroupId = 'kindergarten' | 'primary' | 'middle-school' | 'high-school' | 'university';

export type InteractionStyle = 'playful' | 'structured' | 'autonomous';
export type FeedbackType = 'immediate' | 'delayed' | 'reflective';
export type ColorPalette = 'vibrant' | 'balanced' | 'professional';
export type TouchTargetSize = 'small' | 'medium' | 'large';
export type InteractionType = 'touch' | 'drag-drop' | 'voice' | 'text' | 'code' | 'quiz' | 'research';

export interface DevelopmentalDomain {
  cognitive: boolean;
  social: boolean;
  emotional: boolean;
  physical: boolean;
  language: boolean;
  health: boolean;
}

export interface UIPreferences {
  maxChoicesPerScreen: number;
  touchTargetSize: TouchTargetSize;
  colorPalette: ColorPalette;
  feedbackType: FeedbackType;
  interactionStyle: InteractionStyle;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  animationSpeed: 'fast' | 'medium' | 'slow';
}

export interface ContentRestrictions {
  maxVideoDuration: number; // minutes
  maxTextComplexity: number; // 1-10 reading level
  allowedInteractionTypes: InteractionType[];
  requiredSupervision: boolean;
  maxDailyLearningTime: number; // minutes
  breakFrequency: number; // minutes between required breaks
}

export interface AgeGroup {
  id: AgeGroupId;
  label: string;
  minAge: number;
  maxAge: number;
  description: string;
  developmentalDomains: DevelopmentalDomain;
  uiPreferences: UIPreferences;
  contentRestrictions: ContentRestrictions;
  learningObjectives: string[];
  icon: string;
  color: string;
}

export interface AgeAwareResource {
  id: string;
  title: string;
  description: string;
  ageGroups: AgeGroupId[];
  difficulty: number; // 1-10 scale
  estimatedDuration: number; // minutes
  interactionTypes: InteractionType[];
  developmentalDomains: string[];
  prerequisites: string[];
  learningObjectives: string[];
}

export interface UserProfile {
  userId: string;
  name: string;
  age: number;
  ageGroupId: AgeGroupId;
  gradeLevel?: string;
  maturityLevel?: number; // 0-1 scale for adjusting content
  learningPreferences?: {
    visualLearner: boolean;
    auditoryLearner: boolean;
    kinestheticLearner: boolean;
  };
  specialNeeds?: string[];
}

export interface LearningPath {
  id: string;
  userId: string;
  ageGroupId: AgeGroupId;
  title: string;
  description: string;
  concepts: PathConcept[];
  estimatedCompletion: string;
  progress: number;
  createdAt: Date;
}

export interface PathConcept {
  concept: string;
  mastery: number;
  status: 'locked' | 'in-progress' | 'completed';
  resources: AgeAwareResource[];
  reasoning?: string;
  estimatedTime?: number;
}

