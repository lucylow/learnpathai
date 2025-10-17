/**
 * Lovable Cloud SDK Client
 * Centralized client for authentication, database, storage, and functions
 */

import { createClient } from '@lovable/sdk';

// Initialize Lovable client with project configuration
export const lovable = createClient({
  projectId: import.meta.env.VITE_LOVABLE_PROJECT_ID,
  apiKey: import.meta.env.VITE_LOVABLE_API_KEY,
});

// Type-safe database collections
export interface LearningPath {
  id: string;
  user_id: string;
  subject: string;
  title: string;
  nodes: PathNode[];
  overall_mastery: number;
  learning_style: 'visual' | 'auditory' | 'kinesthetic' | 'reading_writing';
  learning_goal: string;
  estimated_hours: number;
  created_at: string;
  updated_at: string;
}

export interface PathNode {
  concept_id: string;
  concept_name: string;
  current_mastery: number;
  target_mastery: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'locked';
  prerequisites: string[];
  recommended_resources: Resource[];
}

export interface Resource {
  id: string;
  title: string;
  type: 'video' | 'article' | 'lab' | 'project' | 'quiz' | 'interactive';
  url: string;
  duration_minutes: number;
  difficulty: number;
  learning_style_match: string[];
}

export interface UserProgress {
  id: string;
  user_id: string;
  path_id: string;
  concept_id: string;
  attempts: Attempt[];
  mastery_level: number;
  time_spent_minutes: number;
  last_activity: string;
}

export interface Attempt {
  question_id: string;
  concept: string;
  correct: boolean;
  timestamp: string;
  confidence?: number;
}

export interface AnalyticsEvent {
  id: string;
  user_id: string;
  event_type: string;
  event_data: Record<string, any>;
  timestamp: string;
}

// Database API wrappers with type safety
export const db = {
  // Learning Paths
  learningPaths: {
    list: (filter?: Partial<LearningPath>) =>
      lovable.db.learning_paths.list({ filter }),
    get: (id: string) => lovable.db.learning_paths.get(id),
    create: (data: Omit<LearningPath, 'id' | 'created_at' | 'updated_at'>) =>
      lovable.db.learning_paths.create(data),
    update: (id: string, data: Partial<LearningPath>) =>
      lovable.db.learning_paths.update(id, data),
    delete: (id: string) => lovable.db.learning_paths.delete(id),
  },

  // User Progress
  progress: {
    list: (filter?: Partial<UserProgress>) =>
      lovable.db.user_progress.list({ filter }),
    get: (id: string) => lovable.db.user_progress.get(id),
    create: (data: Omit<UserProgress, 'id'>) =>
      lovable.db.user_progress.create(data),
    update: (id: string, data: Partial<UserProgress>) =>
      lovable.db.user_progress.update(id, data),
  },

  // Analytics Events
  analytics: {
    track: (event: Omit<AnalyticsEvent, 'id' | 'timestamp'>) =>
      lovable.db.analytics_events.create({
        ...event,
        timestamp: new Date().toISOString(),
      }),
    list: (filter?: Partial<AnalyticsEvent>) =>
      lovable.db.analytics_events.list({ filter }),
  },
};

// Authentication helpers
export const auth = {
  getUser: () => lovable.auth.getUser(),
  signOut: () => lovable.auth.signOut(),
  onAuthStateChange: (callback: (user: any) => void) =>
    lovable.auth.onAuthStateChange(callback),
};

// Storage helpers
export const storage = {
  upload: (
    bucket: string,
    file: File,
    options?: { onProgress?: (progress: { percent: number }) => void }
  ) => lovable.storage.upload(bucket, file, options),
  
  getPublicUrl: (bucket: string, path: string) =>
    lovable.storage.getPublicUrl(bucket, path),
  
  download: (bucket: string, path: string) =>
    lovable.storage.download(bucket, path),
  
  delete: (bucket: string, path: string) =>
    lovable.storage.delete(bucket, path),
};

// Backend Functions
export const functions = {
  generatePath: (params: {
    userId: string;
    subject: string;
    userAttempts: Attempt[];
    learningStyle: string;
    learningGoal: string;
  }) => lovable.functions.invoke('generate-path', params),

  updatePath: (params: {
    pathId: string;
    newAttempts: Attempt[];
  }) => lovable.functions.invoke('update-path', params),

  reroutePath: (params: {
    userId: string;
    pathId: string;
    failedNode: string;
  }) => lovable.functions.invoke('reroute-path', params),

  predictNextConcept: (params: {
    userId: string;
    pathId: string;
    history: Attempt[];
  }) => lovable.functions.invoke('predict-next-concept', params),

  generateExplanation: (params: {
    concept: string;
    userLevel: string;
    learningStyle: string;
  }) => lovable.functions.invoke('generate-explanation', params),
};

export default lovable;


