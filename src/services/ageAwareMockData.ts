// Age-aware mock data for LearnPath AI
import type { AgeGroupId, AgeAwareResource, PathConcept, LearningPath } from '@/types/ageGroups';

export interface AgeAwareCourse {
  id: string;
  title: string;
  description: string;
  ageGroups: AgeGroupId[];
  difficulty: number; // 1-10
  progress: number;
  totalLessons: number;
  completedLessons: number;
  estimatedTime: string;
  category: string;
  instructor: string;
  rating: number;
  enrolled: number;
  interactionTypes: string[];
  lastAccessed?: string;
}

// Age-appropriate courses for different learning levels
export const ageAwareCourses: AgeAwareCourse[] = [
  // Kindergarten courses
  {
    id: 'kg-colors-shapes',
    title: 'Colors and Shapes Fun',
    description: 'Learn about colors and shapes through interactive games',
    ageGroups: ['kindergarten'],
    difficulty: 1,
    progress: 0,
    totalLessons: 10,
    completedLessons: 0,
    estimatedTime: '2 weeks',
    category: 'Basic Concepts',
    instructor: 'Ms. Rainbow',
    rating: 4.9,
    enrolled: 5420,
    interactionTypes: ['touch', 'drag-drop', 'voice'],
  },
  {
    id: 'kg-numbers-counting',
    title: 'Numbers and Counting',
    description: 'Count from 1 to 20 with fun animations',
    ageGroups: ['kindergarten'],
    difficulty: 1,
    progress: 0,
    totalLessons: 15,
    completedLessons: 0,
    estimatedTime: '3 weeks',
    category: 'Math Basics',
    instructor: 'Mr. Numbers',
    rating: 4.8,
    enrolled: 6200,
    interactionTypes: ['touch', 'voice'],
  },

  // Primary school courses
  {
    id: 'pri-python-basics',
    title: 'Python for Kids',
    description: 'Learn programming basics with fun projects',
    ageGroups: ['primary'],
    difficulty: 3,
    progress: 45,
    totalLessons: 30,
    completedLessons: 14,
    estimatedTime: '6 weeks',
    category: 'Programming',
    instructor: 'Dr. Code',
    rating: 4.7,
    enrolled: 8500,
    interactionTypes: ['text', 'quiz', 'code'],
    lastAccessed: '2 hours ago',
  },
  {
    id: 'pri-reading-adventure',
    title: 'Reading Adventure',
    description: 'Build reading skills with exciting stories',
    ageGroups: ['primary'],
    difficulty: 2,
    progress: 65,
    totalLessons: 25,
    completedLessons: 16,
    estimatedTime: '5 weeks',
    category: 'Language Arts',
    instructor: 'Ms. Books',
    rating: 4.9,
    enrolled: 12000,
    interactionTypes: ['text', 'voice', 'quiz'],
    lastAccessed: '1 day ago',
  },
  {
    id: 'pri-math-explorer',
    title: 'Math Explorer',
    description: 'Explore addition, subtraction, and multiplication',
    ageGroups: ['primary'],
    difficulty: 3,
    progress: 55,
    totalLessons: 28,
    completedLessons: 15,
    estimatedTime: '6 weeks',
    category: 'Mathematics',
    instructor: 'Prof. Numbers',
    rating: 4.8,
    enrolled: 9500,
    interactionTypes: ['text', 'quiz', 'touch'],
    lastAccessed: '3 hours ago',
  },

  // Middle school courses
  {
    id: 'ms-web-development',
    title: 'Web Development Basics',
    description: 'Build your first website with HTML, CSS, and JavaScript',
    ageGroups: ['middle-school', 'high-school'],
    difficulty: 5,
    progress: 42,
    totalLessons: 45,
    completedLessons: 19,
    estimatedTime: '8 weeks',
    category: 'Web Development',
    instructor: 'Alex Chen',
    rating: 4.9,
    enrolled: 8920,
    interactionTypes: ['text', 'code', 'quiz'],
    lastAccessed: '1 day ago',
  },
  {
    id: 'ms-algebra',
    title: 'Algebra Fundamentals',
    description: 'Master algebraic equations and problem solving',
    ageGroups: ['middle-school'],
    difficulty: 6,
    progress: 30,
    totalLessons: 35,
    completedLessons: 11,
    estimatedTime: '7 weeks',
    category: 'Mathematics',
    instructor: 'Dr. Equation',
    rating: 4.7,
    enrolled: 7800,
    interactionTypes: ['text', 'quiz'],
  },
  {
    id: 'ms-science-inquiry',
    title: 'Science Inquiry Methods',
    description: 'Learn the scientific method through experiments',
    ageGroups: ['middle-school'],
    difficulty: 5,
    progress: 25,
    totalLessons: 30,
    completedLessons: 8,
    estimatedTime: '6 weeks',
    category: 'Science',
    instructor: 'Prof. Lab',
    rating: 4.8,
    enrolled: 6500,
    interactionTypes: ['text', 'research', 'quiz'],
  },

  // High school courses
  {
    id: 'hs-python-advanced',
    title: 'Advanced Python Programming',
    description: 'Master Python with OOP, data structures, and algorithms',
    ageGroups: ['high-school', 'university'],
    difficulty: 7,
    progress: 65,
    totalLessons: 48,
    completedLessons: 31,
    estimatedTime: '10 weeks',
    category: 'Programming',
    instructor: 'Dr. Sarah Johnson',
    rating: 4.8,
    enrolled: 12450,
    interactionTypes: ['text', 'code', 'quiz'],
    lastAccessed: '2 hours ago',
  },
  {
    id: 'hs-calculus',
    title: 'Calculus AB',
    description: 'Differential and integral calculus for AP exam',
    ageGroups: ['high-school'],
    difficulty: 8,
    progress: 40,
    totalLessons: 55,
    completedLessons: 22,
    estimatedTime: '12 weeks',
    category: 'Mathematics',
    instructor: 'Prof. Derivative',
    rating: 4.9,
    enrolled: 5600,
    interactionTypes: ['text', 'quiz', 'research'],
  },
  {
    id: 'hs-physics',
    title: 'Physics: Mechanics',
    description: 'Classical mechanics and Newton\'s laws',
    ageGroups: ['high-school', 'university'],
    difficulty: 8,
    progress: 35,
    totalLessons: 50,
    completedLessons: 18,
    estimatedTime: '11 weeks',
    category: 'Science',
    instructor: 'Dr. Motion',
    rating: 4.7,
    enrolled: 6200,
    interactionTypes: ['text', 'quiz', 'research'],
  },

  // University courses
  {
    id: 'uni-machine-learning',
    title: 'Machine Learning',
    description: 'Introduction to ML algorithms, neural networks, and applications',
    ageGroups: ['university'],
    difficulty: 9,
    progress: 28,
    totalLessons: 64,
    completedLessons: 18,
    estimatedTime: '14 weeks',
    category: 'Artificial Intelligence',
    instructor: 'Prof. Michael Lee',
    rating: 4.7,
    enrolled: 6780,
    interactionTypes: ['text', 'code', 'research'],
    lastAccessed: '3 days ago',
  },
  {
    id: 'uni-data-structures',
    title: 'Advanced Data Structures & Algorithms',
    description: 'Essential DSA for technical interviews and efficient programming',
    ageGroups: ['university'],
    difficulty: 8,
    progress: 15,
    totalLessons: 42,
    completedLessons: 6,
    estimatedTime: '10 weeks',
    category: 'Computer Science',
    instructor: 'Jordan Martinez',
    rating: 4.9,
    enrolled: 15230,
    interactionTypes: ['text', 'code', 'quiz'],
    lastAccessed: '5 days ago',
  },
  {
    id: 'uni-quantum-computing',
    title: 'Introduction to Quantum Computing',
    description: 'Quantum mechanics principles for computing',
    ageGroups: ['university'],
    difficulty: 10,
    progress: 10,
    totalLessons: 36,
    completedLessons: 4,
    estimatedTime: '12 weeks',
    category: 'Advanced Computing',
    instructor: 'Dr. Quantum',
    rating: 4.8,
    enrolled: 3400,
    interactionTypes: ['text', 'code', 'research'],
  },
];

// Learning paths for different age groups
export const ageLearningPaths: Record<AgeGroupId, PathConcept[]> = {
  kindergarten: [
    {
      concept: 'Colors',
      mastery: 0.85,
      status: 'completed',
      resources: [],
      estimatedTime: 15,
    },
    {
      concept: 'Shapes',
      mastery: 0.75,
      status: 'in-progress',
      resources: [],
      estimatedTime: 20,
    },
    {
      concept: 'Numbers 1-10',
      mastery: 0.45,
      status: 'in-progress',
      resources: [],
      estimatedTime: 25,
    },
    {
      concept: 'Letters A-Z',
      mastery: 0.10,
      status: 'locked',
      resources: [],
      estimatedTime: 30,
    },
  ],
  primary: [
    {
      concept: 'Basic Addition',
      mastery: 0.90,
      status: 'completed',
      resources: [],
      estimatedTime: 30,
    },
    {
      concept: 'Basic Subtraction',
      mastery: 0.85,
      status: 'completed',
      resources: [],
      estimatedTime: 30,
    },
    {
      concept: 'Multiplication Tables',
      mastery: 0.65,
      status: 'in-progress',
      resources: [],
      estimatedTime: 45,
    },
    {
      concept: 'Reading Comprehension',
      mastery: 0.55,
      status: 'in-progress',
      resources: [],
      estimatedTime: 40,
    },
    {
      concept: 'Basic Programming Logic',
      mastery: 0.30,
      status: 'locked',
      resources: [],
      estimatedTime: 50,
    },
  ],
  'middle-school': [
    {
      concept: 'Algebraic Equations',
      mastery: 0.70,
      status: 'in-progress',
      resources: [],
      estimatedTime: 60,
    },
    {
      concept: 'Scientific Method',
      mastery: 0.65,
      status: 'in-progress',
      resources: [],
      estimatedTime: 45,
    },
    {
      concept: 'HTML & CSS',
      mastery: 0.50,
      status: 'in-progress',
      resources: [],
      estimatedTime: 75,
    },
    {
      concept: 'JavaScript Basics',
      mastery: 0.25,
      status: 'locked',
      resources: [],
      estimatedTime: 90,
    },
  ],
  'high-school': [
    {
      concept: 'Calculus Fundamentals',
      mastery: 0.75,
      status: 'in-progress',
      resources: [],
      estimatedTime: 120,
    },
    {
      concept: 'Object-Oriented Programming',
      mastery: 0.68,
      status: 'in-progress',
      resources: [],
      estimatedTime: 90,
    },
    {
      concept: 'Physics: Mechanics',
      mastery: 0.55,
      status: 'in-progress',
      resources: [],
      estimatedTime: 100,
    },
    {
      concept: 'Data Structures',
      mastery: 0.30,
      status: 'locked',
      resources: [],
      estimatedTime: 150,
    },
  ],
  university: [
    {
      concept: 'Machine Learning Algorithms',
      mastery: 0.60,
      status: 'in-progress',
      resources: [],
      estimatedTime: 180,
    },
    {
      concept: 'Neural Networks',
      mastery: 0.45,
      status: 'in-progress',
      resources: [],
      estimatedTime: 200,
    },
    {
      concept: 'Advanced Algorithms',
      mastery: 0.35,
      status: 'in-progress',
      resources: [],
      estimatedTime: 160,
    },
    {
      concept: 'Research Methodology',
      mastery: 0.20,
      status: 'locked',
      resources: [],
      estimatedTime: 240,
    },
  ],
};

// Helper function to get courses by age group
export function getCoursesByAgeGroup(ageGroupId: AgeGroupId): AgeAwareCourse[] {
  return ageAwareCourses.filter(course => course.ageGroups.includes(ageGroupId));
}

// Helper function to get active courses by age group
export function getActiveCoursesByAgeGroup(ageGroupId: AgeGroupId): AgeAwareCourse[] {
  return ageAwareCourses.filter(
    course => course.ageGroups.includes(ageGroupId) && course.progress > 0 && course.progress < 100
  );
}

// Helper function to get learning path by age group
export function getLearningPathByAgeGroup(ageGroupId: AgeGroupId): PathConcept[] {
  return ageLearningPaths[ageGroupId] || [];
}

