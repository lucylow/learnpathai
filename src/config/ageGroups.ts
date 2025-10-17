// Age group configuration for LearnPath AI
import type { AgeGroup } from '@/types/ageGroups';

export const ageGroups: AgeGroup[] = [
  {
    id: 'kindergarten',
    label: 'Kindergarten',
    minAge: 3,
    maxAge: 5,
    description: 'Early childhood learning with play-based activities',
    developmentalDomains: {
      cognitive: true,
      social: true,
      emotional: true,
      physical: true,
      language: true,
      health: true,
    },
    uiPreferences: {
      maxChoicesPerScreen: 3,
      touchTargetSize: 'large',
      colorPalette: 'vibrant',
      feedbackType: 'immediate',
      interactionStyle: 'playful',
      fontSize: 'extra-large',
      animationSpeed: 'slow',
    },
    contentRestrictions: {
      maxVideoDuration: 5,
      maxTextComplexity: 1,
      allowedInteractionTypes: ['touch', 'drag-drop', 'voice'],
      requiredSupervision: true,
      maxDailyLearningTime: 30,
      breakFrequency: 15,
    },
    learningObjectives: [
      'Develop basic literacy and numeracy',
      'Build social and emotional skills',
      'Foster curiosity and wonder',
      'Improve fine motor skills',
      'Encourage creative expression',
    ],
    icon: '🎨',
    color: '#FF6B9D',
  },
  {
    id: 'primary',
    label: 'Primary School',
    minAge: 6,
    maxAge: 10,
    description: 'Foundation building in core subjects',
    developmentalDomains: {
      cognitive: true,
      social: true,
      emotional: true,
      physical: true,
      language: true,
      health: true,
    },
    uiPreferences: {
      maxChoicesPerScreen: 4,
      touchTargetSize: 'large',
      colorPalette: 'vibrant',
      feedbackType: 'immediate',
      interactionStyle: 'structured',
      fontSize: 'large',
      animationSpeed: 'medium',
    },
    contentRestrictions: {
      maxVideoDuration: 10,
      maxTextComplexity: 3,
      allowedInteractionTypes: ['touch', 'drag-drop', 'text', 'quiz'],
      requiredSupervision: true,
      maxDailyLearningTime: 60,
      breakFrequency: 20,
    },
    learningObjectives: [
      'Master fundamental reading and writing',
      'Develop mathematical reasoning',
      'Learn scientific inquiry methods',
      'Build collaborative skills',
      'Enhance problem-solving abilities',
    ],
    icon: '📚',
    color: '#4CAF50',
  },
  {
    id: 'middle-school',
    label: 'Middle School',
    minAge: 11,
    maxAge: 13,
    description: 'Subject specialization and critical thinking',
    developmentalDomains: {
      cognitive: true,
      social: true,
      emotional: true,
      physical: false,
      language: true,
      health: true,
    },
    uiPreferences: {
      maxChoicesPerScreen: 6,
      touchTargetSize: 'medium',
      colorPalette: 'balanced',
      feedbackType: 'delayed',
      interactionStyle: 'structured',
      fontSize: 'medium',
      animationSpeed: 'fast',
    },
    contentRestrictions: {
      maxVideoDuration: 15,
      maxTextComplexity: 6,
      allowedInteractionTypes: ['text', 'quiz', 'code', 'research', 'touch'],
      requiredSupervision: false,
      maxDailyLearningTime: 90,
      breakFrequency: 30,
    },
    learningObjectives: [
      'Develop critical thinking skills',
      'Explore subject specialization',
      'Practice collaborative learning',
      'Build self-expression abilities',
      'Understand abstract concepts',
    ],
    icon: '🎓',
    color: '#2196F3',
  },
  {
    id: 'high-school',
    label: 'High School',
    minAge: 14,
    maxAge: 17,
    description: 'Advanced learning and career preparation',
    developmentalDomains: {
      cognitive: true,
      social: true,
      emotional: true,
      physical: false,
      language: true,
      health: false,
    },
    uiPreferences: {
      maxChoicesPerScreen: 8,
      touchTargetSize: 'medium',
      colorPalette: 'balanced',
      feedbackType: 'reflective',
      interactionStyle: 'autonomous',
      fontSize: 'medium',
      animationSpeed: 'fast',
    },
    contentRestrictions: {
      maxVideoDuration: 25,
      maxTextComplexity: 8,
      allowedInteractionTypes: ['text', 'quiz', 'code', 'research'],
      requiredSupervision: false,
      maxDailyLearningTime: 120,
      breakFrequency: 45,
    },
    learningObjectives: [
      'Master abstract reasoning',
      'Prepare for career paths',
      'Develop research skills',
      'Build project management abilities',
      'Achieve subject mastery',
    ],
    icon: '🚀',
    color: '#9C27B0',
  },
  {
    id: 'university',
    label: 'University',
    minAge: 18,
    maxAge: 30,
    description: 'Professional mastery and research',
    developmentalDomains: {
      cognitive: true,
      social: false,
      emotional: false,
      physical: false,
      language: true,
      health: false,
    },
    uiPreferences: {
      maxChoicesPerScreen: 12,
      touchTargetSize: 'small',
      colorPalette: 'professional',
      feedbackType: 'reflective',
      interactionStyle: 'autonomous',
      fontSize: 'small',
      animationSpeed: 'fast',
    },
    contentRestrictions: {
      maxVideoDuration: 60,
      maxTextComplexity: 10,
      allowedInteractionTypes: ['text', 'quiz', 'code', 'research'],
      requiredSupervision: false,
      maxDailyLearningTime: 240,
      breakFrequency: 60,
    },
    learningObjectives: [
      'Achieve professional expertise',
      'Conduct independent research',
      'Master complex systems',
      'Develop career specialization',
      'Contribute to field knowledge',
    ],
    icon: '🎯',
    color: '#FF9800',
  },
];

// Helper function to get age group by age
export function getAgeGroupByAge(age: number): AgeGroup {
  const group = ageGroups.find(ag => age >= ag.minAge && age <= ag.maxAge);
  
  // Default to university if age is above maximum
  if (!group) {
    return age > 30 ? ageGroups[4] : ageGroups[0];
  }
  
  return group;
}

// Helper function to get age group by ID
export function getAgeGroupById(id: string): AgeGroup | undefined {
  return ageGroups.find(ag => ag.id === id);
}

// Determine age group with maturity adjustment
export function determineAgeGroup(
  userAge: number, 
  maturityLevel?: number
): AgeGroup {
  let ageGroup = getAgeGroupByAge(userAge);
  
  // Maturity-based adjustment for advanced or delayed learners
  if (maturityLevel) {
    const currentIndex = ageGroups.findIndex(ag => ag.id === ageGroup.id);
    
    // Advanced learner - move up one level
    if (maturityLevel > 0.7 && currentIndex < ageGroups.length - 1) {
      ageGroup = ageGroups[currentIndex + 1];
    } 
    // Needs more support - move down one level
    else if (maturityLevel < 0.3 && currentIndex > 0) {
      ageGroup = ageGroups[currentIndex - 1];
    }
  }
  
  return ageGroup;
}

