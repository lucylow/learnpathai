// backend/generator/demo.ts
// Demo script to test the Personalized Learning Pathway Generator

import { generatePath } from './planner';
import { initializeGraph } from './knowledgeGraph';
import { LearnerProfile, ConceptNode, Resource, SimilarityEdge } from './types';

/**
 * Sample concept nodes for demonstration
 */
const sampleNodes: ConceptNode[] = [
  {
    id: 'for_loops',
    title: 'For Loops',
    description: 'Learn how to use for loops to iterate over sequences',
    prerequisites: [],
    metadata: { subject: 'programming', difficulty: 0.2 },
  },
  {
    id: 'while_loops',
    title: 'While Loops',
    description: 'Master while loops for conditional iteration',
    prerequisites: ['for_loops'],
    metadata: { subject: 'programming', difficulty: 0.3 },
  },
  {
    id: 'functions',
    title: 'Functions',
    description: 'Create reusable code with functions',
    prerequisites: ['while_loops'],
    metadata: { subject: 'programming', difficulty: 0.4 },
  },
  {
    id: 'recursion_basics',
    title: 'Recursion Basics',
    description: 'Understanding recursive function calls',
    prerequisites: ['functions'],
    metadata: { subject: 'programming', difficulty: 0.6 },
  },
  {
    id: 'recursive_patterns',
    title: 'Recursive Patterns',
    description: 'Advanced recursive algorithms and patterns',
    prerequisites: ['recursion_basics'],
    metadata: { subject: 'programming', difficulty: 0.8 },
  },
  {
    id: 'data_structures',
    title: 'Data Structures',
    description: 'Arrays, lists, and basic data structures',
    prerequisites: ['functions'],
    metadata: { subject: 'programming', difficulty: 0.5 },
  },
  {
    id: 'algorithms',
    title: 'Algorithms',
    description: 'Sorting, searching, and algorithm fundamentals',
    prerequisites: ['data_structures', 'recursion_basics'],
    metadata: { subject: 'programming', difficulty: 0.7 },
  },
];

/**
 * Sample resources for demonstration
 */
const sampleResources: Resource[] = [
  {
    id: 'r1',
    conceptId: 'for_loops',
    type: 'video',
    title: 'Python For Loops - Complete Tutorial',
    url: 'https://example.com/for-loops',
    difficulty: 0.2,
    durationMinutes: 15,
    engagementScore: 0.9,
    modality: 'visual',
  },
  {
    id: 'r2',
    conceptId: 'for_loops',
    type: 'reading',
    title: 'For Loops Guide',
    url: 'https://example.com/for-loops-guide',
    difficulty: 0.2,
    durationMinutes: 10,
    engagementScore: 0.8,
    modality: 'text',
  },
  {
    id: 'r3',
    conceptId: 'while_loops',
    type: 'video',
    title: 'While Loops Explained',
    url: 'https://example.com/while-loops',
    difficulty: 0.3,
    durationMinutes: 20,
    engagementScore: 0.85,
    modality: 'visual',
  },
  {
    id: 'r4',
    conceptId: 'functions',
    type: 'interactive',
    title: 'Interactive Function Builder',
    url: 'https://example.com/functions',
    difficulty: 0.4,
    durationMinutes: 30,
    engagementScore: 0.95,
    modality: 'interactive',
  },
  {
    id: 'r5',
    conceptId: 'recursion_basics',
    type: 'video',
    title: 'Introduction to Recursion',
    url: 'https://example.com/recursion-intro',
    difficulty: 0.6,
    durationMinutes: 25,
    engagementScore: 0.88,
    modality: 'visual',
  },
  {
    id: 'r6',
    conceptId: 'recursion_basics',
    type: 'quiz',
    title: 'Recursion Practice Quiz',
    url: 'https://example.com/recursion-quiz',
    difficulty: 0.6,
    durationMinutes: 15,
    engagementScore: 0.9,
    modality: 'interactive',
  },
  {
    id: 'r7',
    conceptId: 'recursive_patterns',
    type: 'reading',
    title: 'Advanced Recursive Algorithms',
    url: 'https://example.com/recursive-patterns',
    difficulty: 0.8,
    durationMinutes: 45,
    engagementScore: 0.85,
    modality: 'text',
  },
  {
    id: 'r8',
    conceptId: 'data_structures',
    type: 'video',
    title: 'Data Structures Fundamentals',
    url: 'https://example.com/data-structures',
    difficulty: 0.5,
    durationMinutes: 35,
    engagementScore: 0.92,
    modality: 'visual',
  },
  {
    id: 'r9',
    conceptId: 'algorithms',
    type: 'interactive',
    title: 'Algorithm Visualizer',
    url: 'https://example.com/algorithms',
    difficulty: 0.7,
    durationMinutes: 40,
    engagementScore: 0.94,
    modality: 'interactive',
  },
];

/**
 * Sample similarity edges
 */
const sampleEdges: SimilarityEdge[] = [
  { from: 'for_loops', to: 'while_loops', weight: 0.8 },
  { from: 'while_loops', to: 'functions', weight: 0.7 },
  { from: 'functions', to: 'recursion_basics', weight: 0.6 },
  { from: 'recursion_basics', to: 'recursive_patterns', weight: 0.9 },
  { from: 'functions', to: 'data_structures', weight: 0.5 },
  { from: 'data_structures', to: 'algorithms', weight: 0.7 },
  { from: 'recursion_basics', to: 'algorithms', weight: 0.6 },
];

/**
 * Sample learner profiles
 */
const sampleProfiles: LearnerProfile[] = [
  // Beginner learner
  {
    userId: 'user_beginner',
    topic: 'Python Programming',
    goalConcepts: ['recursion_basics', 'algorithms'],
    priorMastery: {
      for_loops: 0.9,
      while_loops: 0.7,
      functions: 0.5,
      recursion_basics: 0.2,
      recursive_patterns: 0.0,
      data_structures: 0.3,
      algorithms: 0.0,
    },
    learningStyle: 'video',
    timeBudgetHours: 10,
  },
  
  // Intermediate learner
  {
    userId: 'user_intermediate',
    topic: 'Advanced Python',
    goalConcepts: ['recursive_patterns', 'algorithms'],
    priorMastery: {
      for_loops: 0.95,
      while_loops: 0.9,
      functions: 0.85,
      recursion_basics: 0.7,
      recursive_patterns: 0.4,
      data_structures: 0.75,
      algorithms: 0.5,
    },
    learningStyle: 'mixed',
    timeBudgetHours: 5,
  },
  
  // Hands-on learner
  {
    userId: 'user_kinesthetic',
    topic: 'Interactive Python',
    goalConcepts: ['data_structures', 'algorithms'],
    priorMastery: {
      for_loops: 0.8,
      while_loops: 0.75,
      functions: 0.7,
      recursion_basics: 0.5,
      recursive_patterns: 0.2,
      data_structures: 0.6,
      algorithms: 0.3,
    },
    learningStyle: 'handsOn',
    timeBudgetHours: 8,
  },
];

/**
 * Run the demo
 */
async function runDemo() {
  console.log('🚀 Personalized Learning Pathway Generator - Demo\n');
  console.log('=' .repeat(60));

  // Initialize the knowledge graph
  console.log('\n📊 Initializing knowledge graph...');
  await initializeGraph(sampleNodes, sampleEdges);
  console.log('✅ Graph initialized with', sampleNodes.length, 'concepts\n');

  // Generate paths for each sample profile
  for (const profile of sampleProfiles) {
    console.log('=' .repeat(60));
    console.log(`\n👤 Generating path for: ${profile.userId}`);
    console.log(`   Topic: ${profile.topic}`);
    console.log(`   Goals: ${profile.goalConcepts.join(', ')}`);
    console.log(`   Style: ${profile.learningStyle}`);
    console.log(`   Time Budget: ${profile.timeBudgetHours} hours\n`);

    const startTime = Date.now();
    const path = await generatePath(profile, sampleNodes, sampleResources);
    const elapsedTime = Date.now() - startTime;

    console.log(`⏱️  Generation time: ${elapsedTime}ms\n`);
    console.log(`📝 Overall Explanation:\n   ${path.explanation}\n`);
    console.log(`📈 Metadata:`);
    console.log(`   - Total estimated time: ${path.metadata?.totalEstimatedHours}h`);
    console.log(`   - Difficulty level: ${path.metadata?.difficultyLevel}`);
    console.log(`   - Completion rate: ${Math.round((path.metadata?.completionRate ?? 0) * 100)}%\n`);

    console.log(`🎯 Learning Path (${path.steps.length} steps):\n`);
    path.steps.forEach((step, index) => {
      const mastery = Math.round((profile.priorMastery[step.node.id] ?? 0) * 100);
      console.log(`   ${index + 1}. ${step.node.title}`);
      console.log(`      Mastery: ${mastery}% | Resource: ${step.resource.title} (${step.resource.type})`);
      console.log(`      Estimated time: ${step.estimatedTime} min`);
      if (step.reasoning) {
        console.log(`      Why: ${step.reasoning.substring(0, 100)}...`);
      }
      console.log();
    });
  }

  console.log('=' .repeat(60));
  console.log('\n✨ Demo complete!\n');
}

// Run demo if executed directly
if (require.main === module) {
  runDemo().catch((error) => {
    console.error('❌ Demo failed:', error);
    process.exit(1);
  });
}

export { sampleNodes, sampleResources, sampleEdges, sampleProfiles, runDemo };

