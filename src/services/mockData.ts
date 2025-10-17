// Comprehensive mock data for LearnPath AI

export interface Course {
  id: string;
  title: string;
  description: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  estimatedTime: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  instructor: string;
  rating: number;
  enrolled: number;
  lastAccessed?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedDate: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
}

export interface LearningActivity {
  id: string;
  type: 'lesson' | 'quiz' | 'project' | 'discussion';
  title: string;
  course: string;
  timestamp: string;
  duration: number; // minutes
  score?: number;
}

export interface Recommendation {
  id: string;
  type: 'course' | 'article' | 'video' | 'practice';
  title: string;
  description: string;
  reason: string;
  estimatedTime: string;
  difficulty: string;
  thumbnail?: string;
}

export interface UserStats {
  activeCourses: number;
  completedCourses: number;
  learningStreak: number;
  totalStudyTime: number; // hours
  averageProgress: number; // percentage
  quizzesTaken: number;
  averageScore: number;
  skillsLearned: number;
}

export interface SkillProgress {
  skill: string;
  level: number;
  maxLevel: number;
  progress: number; // percentage to next level
  category: string;
}

// Mock Courses
export const mockCourses: Course[] = [
  {
    id: 'course-1',
    title: 'Python Programming Fundamentals',
    description: 'Master Python from basics to advanced concepts including OOP, data structures, and more',
    progress: 65,
    totalLessons: 48,
    completedLessons: 31,
    estimatedTime: '6 weeks',
    difficulty: 'Beginner',
    category: 'Programming',
    instructor: 'Dr. Sarah Johnson',
    rating: 4.8,
    enrolled: 12450,
    lastAccessed: '2 hours ago'
  },
  {
    id: 'course-2',
    title: 'Modern Web Development with React',
    description: 'Build modern web applications with React, TypeScript, and best practices',
    progress: 42,
    totalLessons: 56,
    completedLessons: 24,
    estimatedTime: '8 weeks',
    difficulty: 'Intermediate',
    category: 'Web Development',
    instructor: 'Alex Chen',
    rating: 4.9,
    enrolled: 8920,
    lastAccessed: '1 day ago'
  },
  {
    id: 'course-3',
    title: 'Machine Learning Basics',
    description: 'Introduction to ML algorithms, neural networks, and practical applications',
    progress: 28,
    totalLessons: 64,
    completedLessons: 18,
    estimatedTime: '10 weeks',
    difficulty: 'Advanced',
    category: 'Artificial Intelligence',
    instructor: 'Prof. Michael Lee',
    rating: 4.7,
    enrolled: 6780,
    lastAccessed: '3 days ago'
  },
  {
    id: 'course-4',
    title: 'Data Structures & Algorithms',
    description: 'Essential DSA concepts for technical interviews and efficient programming',
    progress: 15,
    totalLessons: 42,
    completedLessons: 6,
    estimatedTime: '7 weeks',
    difficulty: 'Intermediate',
    category: 'Computer Science',
    instructor: 'Jordan Martinez',
    rating: 4.9,
    enrolled: 15230,
    lastAccessed: '5 days ago'
  },
  {
    id: 'course-5',
    title: 'Full-Stack JavaScript Development',
    description: 'Complete guide to building full-stack applications with Node.js and React',
    progress: 0,
    totalLessons: 72,
    completedLessons: 0,
    estimatedTime: '12 weeks',
    difficulty: 'Advanced',
    category: 'Web Development',
    instructor: 'Emma Wilson',
    rating: 4.8,
    enrolled: 9450,
  }
];

// Mock Achievements
export const mockAchievements: Achievement[] = [
  {
    id: 'ach-1',
    title: 'First Steps',
    description: 'Completed your first lesson',
    icon: '🎯',
    earnedDate: '2025-01-15',
    rarity: 'Common'
  },
  {
    id: 'ach-2',
    title: 'Week Warrior',
    description: 'Maintained a 7-day learning streak',
    icon: '🔥',
    earnedDate: '2025-02-10',
    rarity: 'Rare'
  },
  {
    id: 'ach-3',
    title: 'Perfect Score',
    description: 'Achieved 100% on a quiz',
    icon: '⭐',
    earnedDate: '2025-03-05',
    rarity: 'Epic'
  },
  {
    id: 'ach-4',
    title: 'Course Completer',
    description: 'Finished your first complete course',
    icon: '🏆',
    earnedDate: '2025-03-20',
    rarity: 'Epic'
  },
  {
    id: 'ach-5',
    title: 'Speed Learner',
    description: 'Completed 10 lessons in one day',
    icon: '⚡',
    earnedDate: '2025-04-12',
    rarity: 'Rare'
  }
];

// Mock Learning Activities
export const mockActivities: LearningActivity[] = [
  {
    id: 'act-1',
    type: 'lesson',
    title: 'Python Functions and Scope',
    course: 'Python Programming Fundamentals',
    timestamp: '2025-10-17T14:30:00Z',
    duration: 25
  },
  {
    id: 'act-2',
    type: 'quiz',
    title: 'React Hooks Quiz',
    course: 'Modern Web Development with React',
    timestamp: '2025-10-16T10:15:00Z',
    duration: 15,
    score: 92
  },
  {
    id: 'act-3',
    type: 'project',
    title: 'Build a Todo App',
    course: 'Modern Web Development with React',
    timestamp: '2025-10-15T16:45:00Z',
    duration: 120
  },
  {
    id: 'act-4',
    type: 'lesson',
    title: 'Introduction to Neural Networks',
    course: 'Machine Learning Basics',
    timestamp: '2025-10-14T11:20:00Z',
    duration: 35
  },
  {
    id: 'act-5',
    type: 'quiz',
    title: 'Python Basics Assessment',
    course: 'Python Programming Fundamentals',
    timestamp: '2025-10-13T09:30:00Z',
    duration: 20,
    score: 88
  }
];

// Mock Recommendations
export const mockRecommendations: Recommendation[] = [
  {
    id: 'rec-1',
    type: 'course',
    title: 'Advanced Python Patterns',
    description: 'Take your Python skills to the next level with design patterns and best practices',
    reason: 'Based on your progress in Python Programming',
    estimatedTime: '4 weeks',
    difficulty: 'Advanced'
  },
  {
    id: 'rec-2',
    type: 'practice',
    title: 'React Component Challenges',
    description: '50 hands-on exercises to master React components',
    reason: 'Strengthen your React fundamentals',
    estimatedTime: '2 weeks',
    difficulty: 'Intermediate'
  },
  {
    id: 'rec-3',
    type: 'video',
    title: 'Machine Learning in Production',
    description: 'Learn how to deploy ML models in real-world applications',
    reason: 'Next step in your ML journey',
    estimatedTime: '3 hours',
    difficulty: 'Advanced'
  },
  {
    id: 'rec-4',
    type: 'article',
    title: 'Understanding Big O Notation',
    description: 'Deep dive into algorithm complexity analysis',
    reason: 'Essential for Data Structures & Algorithms',
    estimatedTime: '30 minutes',
    difficulty: 'Intermediate'
  }
];

// Mock User Stats
export const mockUserStats: UserStats = {
  activeCourses: 3,
  completedCourses: 2,
  learningStreak: 12,
  totalStudyTime: 24,
  averageProgress: 67,
  quizzesTaken: 18,
  averageScore: 87,
  skillsLearned: 15
};

// Mock Skill Progress
export const mockSkills: SkillProgress[] = [
  {
    skill: 'Python',
    level: 3,
    maxLevel: 5,
    progress: 65,
    category: 'Programming Languages'
  },
  {
    skill: 'React',
    level: 2,
    maxLevel: 5,
    progress: 42,
    category: 'Frontend Frameworks'
  },
  {
    skill: 'Machine Learning',
    level: 1,
    maxLevel: 5,
    progress: 28,
    category: 'Artificial Intelligence'
  },
  {
    skill: 'Algorithms',
    level: 1,
    maxLevel: 5,
    progress: 15,
    category: 'Computer Science'
  },
  {
    skill: 'TypeScript',
    level: 2,
    maxLevel: 5,
    progress: 55,
    category: 'Programming Languages'
  },
  {
    skill: 'Node.js',
    level: 2,
    maxLevel: 5,
    progress: 38,
    category: 'Backend Development'
  }
];

// Mock Learning Path Data
export const mockLearningPaths = {
  python: {
    pathId: 'path-python',
    title: 'Python Mastery Path',
    description: 'Complete journey from beginner to advanced Python developer',
    totalConcepts: 12,
    completedConcepts: 7,
    estimatedCompletion: '3 months',
    concepts: [
      { name: 'Variables & Data Types', status: 'completed', mastery: 95 },
      { name: 'Control Flow', status: 'completed', mastery: 90 },
      { name: 'Functions', status: 'completed', mastery: 85 },
      { name: 'Data Structures', status: 'in-progress', mastery: 65 },
      { name: 'OOP Basics', status: 'in-progress', mastery: 45 },
      { name: 'File Handling', status: 'locked', mastery: 0 },
      { name: 'Error Handling', status: 'locked', mastery: 0 },
      { name: 'Modules & Packages', status: 'locked', mastery: 0 },
    ]
  },
  webdev: {
    pathId: 'path-webdev',
    title: 'Full-Stack Web Developer Path',
    description: 'Comprehensive path to becoming a full-stack web developer',
    totalConcepts: 18,
    completedConcepts: 8,
    estimatedCompletion: '6 months',
    concepts: [
      { name: 'HTML Fundamentals', status: 'completed', mastery: 100 },
      { name: 'CSS & Styling', status: 'completed', mastery: 92 },
      { name: 'JavaScript Basics', status: 'completed', mastery: 88 },
      { name: 'React Components', status: 'in-progress', mastery: 42 },
      { name: 'State Management', status: 'in-progress', mastery: 30 },
      { name: 'Backend APIs', status: 'locked', mastery: 0 },
      { name: 'Database Design', status: 'locked', mastery: 0 },
      { name: 'Deployment', status: 'locked', mastery: 0 },
    ]
  }
};

// Mock Quiz Questions
export const mockQuizQuestions = [
  {
    id: 'q1',
    concept: 'Python Functions',
    question: 'What is the correct way to define a function in Python?',
    options: [
      'function myFunc():',
      'def myFunc():',
      'func myFunc():',
      'define myFunc():'
    ],
    correctAnswer: 1,
    difficulty: 'easy'
  },
  {
    id: 'q2',
    concept: 'React Hooks',
    question: 'Which hook is used to manage component state in React?',
    options: [
      'useEffect',
      'useState',
      'useContext',
      'useReducer'
    ],
    correctAnswer: 1,
    difficulty: 'medium'
  },
  {
    id: 'q3',
    concept: 'Data Structures',
    question: 'What is the time complexity of accessing an element in an array by index?',
    options: [
      'O(n)',
      'O(log n)',
      'O(1)',
      'O(n²)'
    ],
    correctAnswer: 2,
    difficulty: 'medium'
  }
];

// Helper function to get active courses
export const getActiveCourses = () => {
  return mockCourses.filter(course => course.progress > 0 && course.progress < 100);
};

// Helper function to get completed courses
export const getCompletedCourses = () => {
  return mockCourses.filter(course => course.progress === 100);
};

// Helper function to get recommended next courses
export const getRecommendedCourses = () => {
  return mockCourses.filter(course => course.progress === 0).slice(0, 3);
};

// Helper function to calculate study time this week
export const getWeeklyStudyTime = () => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  return mockActivities
    .filter(activity => new Date(activity.timestamp) >= oneWeekAgo)
    .reduce((total, activity) => total + activity.duration, 0);
};

// Helper function to get recent achievements
export const getRecentAchievements = (count: number = 3) => {
  return mockAchievements
    .sort((a, b) => new Date(b.earnedDate).getTime() - new Date(a.earnedDate).getTime())
    .slice(0, count);
};

