// backend/generator/explain.ts
// Explanation and provenance module - provides human-readable reasoning

import { LearnerProfile, NodeScore, ConceptNode, Resource } from './types';

/**
 * Generate overall explanation for why the learning path was generated this way
 * @param profile - Learner profile
 * @param orderedNodeIds - Ordered list of concept IDs in the path
 * @param nodeScores - Map of node scores
 * @returns Human-readable explanation string
 */
export function explainDecision(
  profile: LearnerProfile,
  orderedNodeIds: string[],
  nodeScores: Map<string, NodeScore>
): string {
  const explanations: string[] = [];

  // 1. Goal explanation
  if (profile.goalConcepts.length > 0) {
    explanations.push(
      `This learning path is designed to help you master: ${profile.goalConcepts.join(', ')}.`
    );
  }

  // 2. Path length and time
  if (profile.timeBudgetHours) {
    explanations.push(
      `Based on your ${profile.timeBudgetHours}-hour time budget, we've prioritized the most important concepts.`
    );
  }

  // 3. Highlight top priority concepts
  const sortedByNeed = Array.from(nodeScores.entries())
    .sort((a, b) => b[1].score - a[1].score)
    .slice(0, 3);

  if (sortedByNeed.length > 0) {
    const topConcepts = sortedByNeed.map(([nodeId, score]) => {
      const masteryPct = Math.round(score.mastery * 100);
      return `"${nodeId}" (current mastery: ${masteryPct}%)`;
    });

    explanations.push(
      `We prioritized these concepts where you need the most improvement: ${topConcepts.join(', ')}.`
    );
  }

  // 4. Learning style
  if (profile.learningStyle) {
    const styleDesc = {
      video: 'video-based learning',
      reading: 'text and reading materials',
      handsOn: 'interactive exercises and hands-on practice',
      mixed: 'a variety of learning formats',
    };
    explanations.push(
      `Resources are selected to match your preference for ${styleDesc[profile.learningStyle]}.`
    );
  }

  // 5. Prerequisites
  explanations.push(
    `Concepts are ordered to ensure you master prerequisites before advancing to dependent topics.`
  );

  return explanations.join(' ');
}

/**
 * Generate explanation for a single path step
 * @param node - Concept node
 * @param score - Node score with reasoning
 * @param resource - Selected resource
 * @returns Explanation for this step
 */
export function explainPathStep(
  node: ConceptNode,
  score: NodeScore,
  resource: Resource
): string {
  const parts: string[] = [];

  // Why this concept
  const masteryPct = Math.round(score.mastery * 100);
  
  if (score.mastery < 0.3) {
    parts.push(`You're just starting with "${node.title}" (${masteryPct}% mastery)`);
  } else if (score.mastery < 0.6) {
    parts.push(`You have some experience with "${node.title}" (${masteryPct}% mastery), but there's room to improve`);
  } else if (score.mastery < 0.9) {
    parts.push(`You're getting close to mastering "${node.title}" (${masteryPct}% mastery)`);
  } else {
    parts.push(`You've nearly mastered "${node.title}" (${masteryPct}% mastery)`);
  }

  // Why this resource
  const resourceType = resource.type;
  const resourceTypeDesc = {
    video: 'video lesson',
    reading: 'reading material',
    quiz: 'practice quiz',
    interactive: 'interactive exercise',
  };

  parts.push(
    `We recommend this ${resourceTypeDesc[resourceType] || 'resource'}: "${resource.title}"`
  );

  // Difficulty match
  if (resource.difficulty !== undefined) {
    if (resource.difficulty < 0.4) {
      parts.push('(beginner-friendly)');
    } else if (resource.difficulty < 0.7) {
      parts.push('(intermediate level)');
    } else {
      parts.push('(advanced)');
    }
  }

  return parts.join('. ') + '.';
}

/**
 * Explain why a concept is locked (prerequisites not met)
 * @param conceptId - Concept ID
 * @param unmetPrereqs - List of unmet prerequisite IDs
 * @param mastery - Current mastery map
 * @returns Explanation string
 */
export function explainLockedConcept(
  conceptId: string,
  unmetPrereqs: string[],
  mastery: Record<string, number>
): string {
  if (unmetPrereqs.length === 0) {
    return `"${conceptId}" is now available to learn.`;
  }

  const prereqDetails = unmetPrereqs.map((prereqId) => {
    const m = mastery[prereqId] ?? 0;
    return `"${prereqId}" (${Math.round(m * 100)}% mastery)`;
  });

  if (unmetPrereqs.length === 1) {
    return `To unlock "${conceptId}", you need to master: ${prereqDetails[0]}.`;
  } else {
    return `To unlock "${conceptId}", you need to master these prerequisites: ${prereqDetails.join(', ')}.`;
  }
}

/**
 * Generate a recommendation explanation for next steps
 * @param recommendations - Array of recommended concept IDs
 * @param mastery - Current mastery map
 * @returns Explanation string
 */
export function explainRecommendations(
  recommendations: string[],
  mastery: Record<string, number>
): string {
  if (recommendations.length === 0) {
    return 'Great work! You've completed all available concepts in this path.';
  }

  if (recommendations.length === 1) {
    const conceptId = recommendations[0];
    const m = mastery[conceptId] ?? 0;
    return `Next, we recommend focusing on "${conceptId}" (current mastery: ${Math.round(m * 100)}%).`;
  }

  const conceptList = recommendations
    .slice(0, 3)
    .map((id) => {
      const m = mastery[id] ?? 0;
      return `"${id}" (${Math.round(m * 100)}%)`;
    })
    .join(', ');

  return `You have ${recommendations.length} concepts ready to learn. We recommend starting with: ${conceptList}.`;
}

/**
 * Generate progress summary explanation
 * @param mastery - Current mastery map
 * @param totalConcepts - Total number of concepts in path
 * @param threshold - Mastery threshold for completion
 * @returns Progress summary
 */
export function explainProgress(
  mastery: Record<string, number>,
  totalConcepts: number,
  threshold: number = 0.7
): string {
  const masteryValues = Object.values(mastery);
  const completedCount = masteryValues.filter((m) => m >= threshold).length;
  const avgMastery = masteryValues.length > 0
    ? masteryValues.reduce((sum, m) => sum + m, 0) / masteryValues.length
    : 0;

  const completionPct = Math.round((completedCount / Math.max(1, totalConcepts)) * 100);
  const avgMasteryPct = Math.round(avgMastery * 100);

  const parts: string[] = [];

  parts.push(
    `You've completed ${completedCount} of ${totalConcepts} concepts (${completionPct}%).`
  );
  parts.push(`Your average mastery across all concepts is ${avgMasteryPct}%.`);

  if (completionPct === 100) {
    parts.push('Congratulations on completing your learning path!');
  } else if (completionPct >= 75) {
    parts.push("You're in the home stretch! Keep up the great work.");
  } else if (completionPct >= 50) {
    parts.push("You're making solid progress. You're over halfway there!");
  } else if (completionPct >= 25) {
    parts.push("Good start! You're building a strong foundation.");
  } else {
    parts.push("You're just getting started. Stay consistent and you'll make great progress!");
  }

  return parts.join(' ');
}

/**
 * Explain adaptive rerouting
 * @param oldPath - Previous path
 * @param newPath - New adapted path
 * @param reason - Reason for rerouting
 * @returns Explanation string
 */
export function explainRerouting(
  oldPath: any,
  newPath: any,
  reason: string = 'updated mastery levels'
): string {
  return `Based on ${reason}, we've adapted your learning path to better match your current knowledge and goals. The path now emphasizes areas where you need the most support.`;
}

/**
 * Generate motivational message based on progress
 * @param mastery - Current mastery levels
 * @param recentImprovement - Recent improvement amount
 * @returns Motivational message
 */
export function generateMotivationalMessage(
  mastery: Record<string, number>,
  recentImprovement: number = 0
): string {
  const avgMastery = Object.values(mastery).reduce((sum, m) => sum + m, 0) / Object.values(mastery).length;

  if (recentImprovement > 0.2) {
    return '🎉 Amazing progress! You improved significantly in your recent practice.';
  } else if (recentImprovement > 0.1) {
    return '🌟 Great work! You're steadily improving your mastery.';
  } else if (avgMastery > 0.8) {
    return '🏆 Outstanding! You're mastering these concepts at an impressive rate.';
  } else if (avgMastery > 0.6) {
    return '💪 You're doing well! Keep practicing to reach mastery.';
  } else if (avgMastery > 0.4) {
    return '📈 Solid progress! You're building strong foundations.';
  } else {
    return '🚀 Every expert was once a beginner. Keep learning!';
  }
}

