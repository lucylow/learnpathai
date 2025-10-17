/**
 * Lovable Cloud Learning Path Service
 * Handles learning path generation, updates, and progress tracking
 */

import { db, functions, type LearningPath, type Attempt } from '../lib/lovable';
import LovableAuthService from './lovable-auth.service';

export class LovablePathService {
  private static instance: LovablePathService;

  private constructor() {}

  static getInstance(): LovablePathService {
    if (!LovablePathService.instance) {
      LovablePathService.instance = new LovablePathService();
    }
    return LovablePathService.instance;
  }

  /**
   * Generate a new personalized learning path
   */
  async generatePath(params: {
    subject: string;
    userAttempts: Attempt[];
    learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading_writing';
    learningGoal: string;
  }): Promise<LearningPath> {
    const user = await LovableAuthService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Call backend function to generate path using AI service
    const result = await functions.generatePath({
      userId: user.id,
      ...params,
    });

    return result.data.path;
  }

  /**
   * Get all learning paths for current user
   */
  async getUserPaths(): Promise<LearningPath[]> {
    const user = await LovableAuthService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const paths = await db.learningPaths.list({ user_id: user.id });
    return paths.data;
  }

  /**
   * Get specific learning path by ID
   */
  async getPath(pathId: string): Promise<LearningPath> {
    const path = await db.learningPaths.get(pathId);
    return path.data;
  }

  /**
   * Update path with new attempts and recalculate mastery
   */
  async updatePathProgress(
    pathId: string,
    newAttempts: Attempt[]
  ): Promise<LearningPath> {
    const result = await functions.updatePath({
      pathId,
      newAttempts,
    });

    return result.data.updatedPath;
  }

  /**
   * Adaptive rerouting when user struggles with a concept
   */
  async reroutePath(
    pathId: string,
    failedNode: string
  ): Promise<LearningPath> {
    const user = await LovableAuthService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const result = await functions.reroutePath({
      userId: user.id,
      pathId,
      failedNode,
    });

    return result.data.reroutedPath;
  }

  /**
   * Get next recommended concept based on current progress
   */
  async getNextRecommendation(
    pathId: string,
    history: Attempt[]
  ): Promise<any> {
    const user = await LovableAuthService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const result = await functions.predictNextConcept({
      userId: user.id,
      pathId,
      history,
    });

    return result.data.nextConcept;
  }

  /**
   * Delete a learning path
   */
  async deletePath(pathId: string): Promise<void> {
    await db.learningPaths.delete(pathId);
  }

  /**
   * Clone an existing path
   */
  async clonePath(pathId: string, newTitle?: string): Promise<LearningPath> {
    const user = await LovableAuthService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const originalPath = await this.getPath(pathId);
    
    const newPath = await db.learningPaths.create({
      ...originalPath,
      user_id: user.id,
      title: newTitle || `${originalPath.title} (Copy)`,
      overall_mastery: 0, // Reset mastery for cloned path
    });

    return newPath.data;
  }
}

export default LovablePathService.getInstance();


