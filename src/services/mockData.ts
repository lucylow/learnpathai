// Mock data service for enhanced Dashboard and features

export const mockUserStats = {
  activeCourses: 3,
  completedCourses: 2,
  learningStreak: 12,
  averageProgress: 67,
  averageScore: 85,
  totalStudyTime: 24,
  totalXP: 2450,
  level: 7,
  nextLevelXP: 3000,
};

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  progress: number;
  completedLessons: number;
  totalLessons: number;
  estimatedTime: string;
  instructor: string;
  rating: number;
  thumbnail?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  earnedDate: Date;
  xpReward: number;
}

export interface Activity {
  id: string;
  type: 'lesson' | 'quiz' | 'project' | 'discussion';
  title: string;
  course: string;
  duration: number;
  score?: number;
  timestamp: Date;
}

const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Python Programming',
    description: 'Master Python from basics to advanced concepts',
    category: 'Programming',
    difficulty: 'Intermediate',
    progress: 65,
    completedLessons: 13,
    totalLessons: 20,
    estimatedTime: '6h remaining',
    instructor: 'Dr. Sarah Chen',
    rating: 4.8,
  },
  {
    id: '2',
    title: 'Web Development',
    description: 'Build modern web applications with React',
    category: 'Web Development',
    difficulty: 'Intermediate',
    progress: 42,
    completedLessons: 8,
    totalLessons: 19,
    estimatedTime: '12h remaining',
    instructor: 'Alex Rodriguez',
    rating: 4.9,
  },
  {
    id: '3',
    title: 'Machine Learning Basics',
    description: 'Introduction to ML algorithms and applications',
    category: 'Data Science',
    difficulty: 'Advanced',
    progress: 28,
    completedLessons: 7,
    totalLessons: 25,
    estimatedTime: '18h remaining',
    instructor: 'Prof. James Liu',
    rating: 4.7,
  },
];

const mockAchievements: Achievement[] = [
  {
    id: '1',
    title: 'Fast Learner',
    description: 'Completed 5 lessons in one day',
    icon: '⚡',
    rarity: 'Rare',
    earnedDate: new Date('2025-10-15'),
    xpReward: 100,
  },
  {
    id: '2',
    title: 'Perfect Score',
    description: 'Achieved 100% on 3 consecutive quizzes',
    icon: '🎯',
    rarity: 'Epic',
    earnedDate: new Date('2025-10-14'),
    xpReward: 200,
  },
  {
    id: '3',
    title: 'Week Warrior',
    description: 'Maintained a 7-day learning streak',
    icon: '🔥',
    rarity: 'Rare',
    earnedDate: new Date('2025-10-12'),
    xpReward: 150,
  },
  {
    id: '4',
    title: 'Code Master',
    description: 'Completed 10 coding challenges',
    icon: '💻',
    rarity: 'Common',
    earnedDate: new Date('2025-10-10'),
    xpReward: 50,
  },
];

export const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'quiz',
    title: 'Functions & Parameters Quiz',
    course: 'Python Programming',
    duration: 15,
    score: 92,
    timestamp: new Date('2025-10-17T10:30:00'),
  },
  {
    id: '2',
    type: 'lesson',
    title: 'Advanced Array Methods',
    course: 'Web Development',
    duration: 25,
    timestamp: new Date('2025-10-17T09:00:00'),
  },
  {
    id: '3',
    type: 'project',
    title: 'Build a Todo App',
    course: 'Web Development',
    duration: 45,
    score: 88,
    timestamp: new Date('2025-10-16T14:20:00'),
  },
  {
    id: '4',
    type: 'quiz',
    title: 'ML Fundamentals Assessment',
    course: 'Machine Learning Basics',
    duration: 20,
    score: 78,
    timestamp: new Date('2025-10-16T11:00:00'),
  },
  {
    id: '5',
    type: 'discussion',
    title: 'Best Practices Discussion',
    course: 'Python Programming',
    duration: 10,
    timestamp: new Date('2025-10-15T16:45:00'),
  },
];

export const getActiveCourses = (): Course[] => {
  return mockCourses;
};

export const getRecentAchievements = (limit?: number): Achievement[] => {
  const sorted = [...mockAchievements].sort(
    (a, b) => b.earnedDate.getTime() - a.earnedDate.getTime()
  );
  return limit ? sorted.slice(0, limit) : sorted;
};

export const getRecentActivities = (limit?: number): Activity[] => {
  const sorted = [...mockActivities].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );
  return limit ? sorted.slice(0, limit) : sorted;
};

// Gamification data
export interface UserProgress {
  currentXP: number;
  level: number;
  nextLevelXP: number;
  streak: number;
  badges: string[];
}

export const mockUserProgress: UserProgress = {
  currentXP: mockUserStats.totalXP,
  level: mockUserStats.level,
  nextLevelXP: mockUserStats.nextLevelXP,
  streak: mockUserStats.learningStreak,
  badges: ['🏆', '⭐', '💡', '🎓', '🚀'],
};

// Analytics data for visualization
export interface ConceptMastery {
  concept: string;
  mastery: number;
  attempts: number;
  lastPracticed: Date;
}

export const mockConceptMastery: ConceptMastery[] = [
  { concept: 'Variables', mastery: 0.92, attempts: 15, lastPracticed: new Date('2025-10-17') },
  { concept: 'Loops', mastery: 0.78, attempts: 12, lastPracticed: new Date('2025-10-16') },
  { concept: 'Functions', mastery: 0.65, attempts: 10, lastPracticed: new Date('2025-10-15') },
  { concept: 'Arrays', mastery: 0.54, attempts: 8, lastPracticed: new Date('2025-10-14') },
  { concept: 'Objects', mastery: 0.42, attempts: 6, lastPracticed: new Date('2025-10-13') },
  { concept: 'Classes', mastery: 0.30, attempts: 4, lastPracticed: new Date('2025-10-12') },
];

export interface LearningSession {
  date: string;
  duration: number; // minutes
  concepts: number;
  score: number;
}

export const mockLearningHistory: LearningSession[] = [
  { date: '2025-10-11', duration: 45, concepts: 3, score: 85 },
  { date: '2025-10-12', duration: 60, concepts: 4, score: 88 },
  { date: '2025-10-13', duration: 30, concepts: 2, score: 92 },
  { date: '2025-10-14', duration: 75, concepts: 5, score: 86 },
  { date: '2025-10-15', duration: 50, concepts: 3, score: 90 },
  { date: '2025-10-16', duration: 55, concepts: 4, score: 87 },
  { date: '2025-10-17', duration: 40, concepts: 3, score: 91 },
];
