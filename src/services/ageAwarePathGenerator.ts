// Age-aware learning path generator for LearnPath AI
import type { AgeGroup, AgeGroupId, PathConcept, LearningPath, AgeAwareResource } from '@/types/ageGroups';
import { getAgeGroupById, determineAgeGroup } from '@/config/ageGroups';
import { getCoursesByAgeGroup, getLearningPathByAgeGroup, type AgeAwareCourse } from './ageAwareMockData';
import { track } from '@/utils/telemetry';

export class AgeAwarePathGenerator {
  /**
   * Generate a personalized learning path based on user's age and learning goals
   */
  public generateLearningPath(
    userId: string,
    userAge: number,
    currentMastery: Map<string, number>,
    learningGoals: string[],
    maturityLevel?: number
  ): LearningPath {
    // Determine appropriate age group
    const ageGroup = determineAgeGroup(userAge, maturityLevel);
    
    track('path_generation_started', {
      userId,
      userAge,
      ageGroupId: ageGroup.id,
      maturityLevel,
      goalCount: learningGoals.length,
    });

    // Get age-appropriate concepts
    const concepts = this.filterConceptsByAgeGroup(ageGroup);
    
    // Apply mastery-based ordering
    const orderedConcepts = this.orderByMastery(concepts, currentMastery);
    
    // Apply age-specific pacing
    const pacedConcepts = this.applyDevelopmentalPacing(orderedConcepts, ageGroup);
    
    const path: LearningPath = {
      id: `path-${userId}-${Date.now()}`,
      userId,
      ageGroupId: ageGroup.id,
      title: `${ageGroup.label} Learning Journey`,
      description: `Personalized learning path tailored for ${ageGroup.label} level`,
      concepts: pacedConcepts,
      estimatedCompletion: this.calculateEstimatedCompletion(pacedConcepts),
      progress: this.calculateProgress(pacedConcepts),
      createdAt: new Date(),
    };

    track('path_generation_completed', {
      userId,
      ageGroupId: ageGroup.id,
      conceptCount: path.concepts.length,
      estimatedCompletion: path.estimatedCompletion,
    });

    return path;
  }

  /**
   * Filter concepts appropriate for the age group
   */
  private filterConceptsByAgeGroup(ageGroup: AgeGroup): PathConcept[] {
    // Get predefined path for this age group
    const baseConcepts = getLearningPathByAgeGroup(ageGroup.id);
    
    // Validate each concept meets age restrictions
    return baseConcepts.filter(concept => 
      this.validateConceptAppropriateness(concept, ageGroup)
    );
  }

  /**
   * Validate if a concept is appropriate for the age group
   */
  private validateConceptAppropriateness(
    concept: PathConcept,
    ageGroup: AgeGroup
  ): boolean {
    const restrictions = ageGroup.contentRestrictions;
    
    // Check estimated time constraints
    if (concept.estimatedTime && concept.estimatedTime > restrictions.maxVideoDuration) {
      // Break into smaller chunks for younger learners
      if (ageGroup.id === 'kindergarten' || ageGroup.id === 'primary') {
        return false;
      }
    }
    
    // Check difficulty level (mastery as proxy for difficulty)
    const difficultyThreshold = restrictions.maxTextComplexity / 10;
    if (concept.mastery > difficultyThreshold && concept.status === 'locked') {
      return true; // Allow challenging content if it's appropriately sequenced
    }
    
    return true;
  }

  /**
   * Order concepts based on current mastery levels
   */
  private orderByMastery(
    concepts: PathConcept[],
    currentMastery: Map<string, number>
  ): PathConcept[] {
    return concepts.sort((a, b) => {
      const masteryA = currentMastery.get(a.concept) ?? a.mastery;
      const masteryB = currentMastery.get(b.concept) ?? b.mastery;
      
      // Prioritize concepts with lower mastery
      return masteryA - masteryB;
    });
  }

  /**
   * Apply age-specific pacing and chunking
   */
  private applyDevelopmentalPacing(
    concepts: PathConcept[],
    ageGroup: AgeGroup
  ): PathConcept[] {
    const preferences = ageGroup.uiPreferences;
    const restrictions = ageGroup.contentRestrictions;
    
    return concepts.map(concept => {
      // Adjust estimated time based on age group
      const adjustedTime = this.adjustTimeForAgeGroup(
        concept.estimatedTime || 30,
        ageGroup
      );
      
      // Add appropriate reasoning for the learner's level
      const reasoning = this.generateAgeAppropriateReasoning(
        concept,
        ageGroup
      );
      
      return {
        ...concept,
        estimatedTime: adjustedTime,
        reasoning,
      };
    });
  }

  /**
   * Adjust learning time based on age group characteristics
   */
  private adjustTimeForAgeGroup(baseTime: number, ageGroup: AgeGroup): number {
    const multipliers: Record<AgeGroupId, number> = {
      'kindergarten': 0.5,  // Shorter attention span
      'primary': 0.75,      // Building stamina
      'middle-school': 1.0, // Standard pace
      'high-school': 1.25,  // More depth
      'university': 1.5,    // Comprehensive coverage
    };
    
    return Math.round(baseTime * multipliers[ageGroup.id]);
  }

  /**
   * Generate age-appropriate explanatory text
   */
  private generateAgeAppropriateReasoning(
    concept: PathConcept,
    ageGroup: AgeGroup
  ): string {
    const masteryPercent = Math.round(concept.mastery * 100);
    
    switch (ageGroup.id) {
      case 'kindergarten':
        return concept.status === 'completed'
          ? `🌟 Great job! You know ${concept.concept}!`
          : `Let's learn about ${concept.concept} together!`;
      
      case 'primary':
        return concept.status === 'in-progress'
          ? `You're doing well! Keep practicing ${concept.concept}.`
          : `Ready to learn ${concept.concept}? It's going to be fun!`;
      
      case 'middle-school':
        return concept.status === 'in-progress'
          ? `You're ${masteryPercent}% there on ${concept.concept}. Focus on practice problems.`
          : `${concept.concept} builds on what you already know. Let's explore it!`;
      
      case 'high-school':
        return concept.status === 'in-progress'
          ? `Current mastery: ${masteryPercent}%. Work on advanced applications of ${concept.concept}.`
          : `${concept.concept} is essential for your goals. Time to dive deep.`;
      
      case 'university':
        return concept.status === 'in-progress'
          ? `Mastery level: ${masteryPercent}%. Consider research papers and real-world projects on ${concept.concept}.`
          : `${concept.concept} requires rigorous study. Review prerequisites and set aside dedicated time.`;
      
      default:
        return `Continue learning ${concept.concept}`;
    }
  }

  /**
   * Calculate estimated completion time
   */
  private calculateEstimatedCompletion(concepts: PathConcept[]): string {
    const totalMinutes = concepts.reduce(
      (sum, concept) => sum + (concept.estimatedTime || 0),
      0
    );
    
    const hours = Math.floor(totalMinutes / 60);
    const days = Math.ceil(hours / 2); // Assume 2 hours per day
    const weeks = Math.ceil(days / 5); // Assume 5 days per week
    
    if (weeks > 4) {
      const months = Math.ceil(weeks / 4);
      return `${months} month${months > 1 ? 's' : ''}`;
    } else if (weeks > 1) {
      return `${weeks} week${weeks > 1 ? 's' : ''}`;
    } else {
      return `${days} day${days > 1 ? 's' : ''}`;
    }
  }

  /**
   * Calculate overall progress percentage
   */
  private calculateProgress(concepts: PathConcept[]): number {
    if (concepts.length === 0) return 0;
    
    const totalMastery = concepts.reduce((sum, concept) => sum + concept.mastery, 0);
    return Math.round((totalMastery / concepts.length) * 100);
  }

  /**
   * Get recommended courses for age group
   */
  public getRecommendedCourses(ageGroupId: AgeGroupId, limit: number = 5): AgeAwareCourse[] {
    const courses = getCoursesByAgeGroup(ageGroupId);
    
    // Sort by rating and enrolled count
    return courses
      .sort((a, b) => {
        const scoreA = a.rating * Math.log(a.enrolled);
        const scoreB = b.rating * Math.log(b.enrolled);
        return scoreB - scoreA;
      })
      .slice(0, limit);
  }

  /**
   * Validate user can access content for their age
   */
  public validateAgeAccess(
    userAge: number,
    contentAgeGroups: AgeGroupId[]
  ): boolean {
    const userAgeGroup = determineAgeGroup(userAge);
    return contentAgeGroups.includes(userAgeGroup.id);
  }
}

// Export singleton instance
export const ageAwarePathGenerator = new AgeAwarePathGenerator();

