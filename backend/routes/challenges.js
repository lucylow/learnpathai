const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// In-memory store for challenges (replace with DB in production)
const challengeTemplates = {
  'for-loops': [
    {
      type: 'multiple_choice',
      question: 'Which for loop correctly iterates through an array in JavaScript?',
      options: [
        'for (let i = 0; i < array.length; i++)',
        'for (let i = 1; i <= array.length; i++)',
        'for (let i in array)',
        'for (let i = 0; i <= array.length; i++)'
      ],
      correct: 0,
      explanation: 'The first option correctly starts at 0 and stops before reaching array.length',
      difficulty: 'beginner',
      timeEstimate: 60
    },
    {
      type: 'code_fill',
      question: 'Complete the for loop to print numbers 0 to 4:\n\nfor (let i = 0; ________; i++) {\n  console.log(i);\n}',
      correctAnswer: 'i < 5',
      explanation: 'The loop should continue while i is less than 5',
      difficulty: 'beginner',
      timeEstimate: 90
    },
    {
      type: 'multiple_choice',
      question: 'What will this loop print?\n\nfor (let i = 0; i < 3; i++) {\n  console.log(i * 2);\n}',
      options: ['0 1 2', '0 2 4', '2 4 6', '1 2 3'],
      correct: 1,
      explanation: 'The loop multiplies each value by 2, so it prints 0, 2, 4',
      difficulty: 'beginner',
      timeEstimate: 75
    }
  ],
  'functions': [
    {
      type: 'multiple_choice',
      question: 'What is the purpose of the return statement in a function?',
      options: [
        'To output a value from the function',
        'To stop the function execution',
        'To declare variables',
        'Both A and B'
      ],
      correct: 3,
      explanation: 'Return both outputs a value and stops function execution',
      difficulty: 'beginner',
      timeEstimate: 60
    },
    {
      type: 'code_fill',
      question: 'Complete the function to return the sum of two numbers:\n\nfunction add(a, b) {\n  ________ a + b;\n}',
      correctAnswer: 'return',
      explanation: 'Use the return keyword to send back the result',
      difficulty: 'beginner',
      timeEstimate: 60
    },
    {
      type: 'multiple_choice',
      question: 'What happens if a function has no return statement?',
      options: [
        'It throws an error',
        'It returns undefined',
        'It returns null',
        'It returns 0'
      ],
      correct: 1,
      explanation: 'Functions without explicit return statement return undefined',
      difficulty: 'beginner',
      timeEstimate: 60
    }
  ],
  'variables': [
    {
      type: 'multiple_choice',
      question: 'Which keyword creates a variable that cannot be reassigned?',
      options: ['var', 'let', 'const', 'static'],
      correct: 2,
      explanation: 'const creates a constant variable that cannot be reassigned',
      difficulty: 'beginner',
      timeEstimate: 45
    },
    {
      type: 'multiple_choice',
      question: 'What is the scope of a let variable?',
      options: ['Global', 'Function', 'Block', 'Module'],
      correct: 2,
      explanation: 'let variables are block-scoped',
      difficulty: 'beginner',
      timeEstimate: 60
    },
    {
      type: 'code_fill',
      question: 'Declare a constant variable called PI with value 3.14:\n\n________ PI = 3.14;',
      correctAnswer: 'const',
      explanation: 'Use const to declare a constant',
      difficulty: 'beginner',
      timeEstimate: 45
    }
  ],
  'arrays': [
    {
      type: 'multiple_choice',
      question: 'How do you access the first element of an array?',
      options: ['array[1]', 'array[0]', 'array.first()', 'array.get(0)'],
      correct: 1,
      explanation: 'Arrays are zero-indexed, so the first element is at index 0',
      difficulty: 'beginner',
      timeEstimate: 45
    },
    {
      type: 'multiple_choice',
      question: 'Which method adds an element to the end of an array?',
      options: ['append()', 'add()', 'push()', 'insert()'],
      correct: 2,
      explanation: 'push() adds elements to the end of an array',
      difficulty: 'beginner',
      timeEstimate: 60
    },
    {
      type: 'code_fill',
      question: 'Get the length of an array:\n\nconst numbers = [1, 2, 3, 4];\nconst size = numbers.________;',
      correctAnswer: 'length',
      explanation: 'Use the length property to get array size',
      difficulty: 'beginner',
      timeEstimate: 45
    }
  ]
};

// Store user challenge attempts
const userAttempts = new Map();

// Generate micro-challenges for a concept
router.post('/generate', (req, res) => {
  try {
    const { concept, level = 'beginner', count = 3 } = req.body;
    
    const normalizedConcept = concept.toLowerCase().replace(/\s+/g, '-');
    
    if (!challengeTemplates[normalizedConcept]) {
      return res.status(404).json({ 
        error: `No challenges found for concept: ${concept}`,
        availableConcepts: Object.keys(challengeTemplates)
      });
    }

    // Filter by difficulty level and get random subset
    const availableChallenges = challengeTemplates[normalizedConcept]
      .filter(challenge => challenge.difficulty === level);
    
    if (availableChallenges.length === 0) {
      return res.status(404).json({
        error: `No ${level} challenges found for ${concept}`
      });
    }

    const selectedChallenges = availableChallenges
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.min(count, availableChallenges.length))
      .map(challenge => ({
        id: uuidv4(),
        ...challenge
      }));

    res.json({
      concept,
      level,
      challenges: selectedChallenges,
      totalTime: selectedChallenges.reduce((sum, c) => sum + c.timeEstimate, 0)
    });
  } catch (error) {
    console.error('Error generating challenges:', error);
    res.status(500).json({ error: 'Failed to generate challenges' });
  }
});

// Submit challenge answers
router.post('/submit', (req, res) => {
  try {
    const { challenges, answers, timeSpent } = req.body;
    const userId = req.user?.id || 'demo-user';
    
    // Validate answers
    let correct = 0;
    let total = answers.length;
    let detailedResults = [];

    answers.forEach((answer) => {
      const challenge = challenges.find(c => c.id === answer.challengeId);
      if (!challenge) {
        detailedResults.push({
          challengeId: answer.challengeId,
          correct: false,
          error: 'Challenge not found'
        });
        return;
      }

      let isCorrect = false;
      
      if (challenge.type === 'multiple_choice') {
        isCorrect = answer.answer === challenge.options[challenge.correct];
      } else if (challenge.type === 'code_fill') {
        isCorrect = answer.answer.trim().toLowerCase() === challenge.correctAnswer.toLowerCase();
      }

      if (isCorrect) correct++;
      
      detailedResults.push({
        challengeId: answer.challengeId,
        correct: isCorrect,
        userAnswer: answer.answer,
        correctAnswer: challenge.type === 'multiple_choice' 
          ? challenge.options[challenge.correct]
          : challenge.correctAnswer,
        explanation: challenge.explanation
      });
    });

    const score = total > 0 ? Math.round((correct / total) * 100) : 0;
    const xpEarned = calculateXPEarned(score, timeSpent, total, correct, answers.length);
    const passed = score >= 70;

    // Store attempt
    if (!userAttempts.has(userId)) {
      userAttempts.set(userId, []);
    }
    userAttempts.get(userId).push({
      timestamp: new Date(),
      score,
      correct,
      total,
      timeSpent,
      xpEarned
    });

    // Determine badges earned
    const badges = determineBadges(userId, score, timeSpent, correct, total);

    res.json({
      score,
      correct,
      total,
      xpEarned,
      detailedResults,
      passed,
      badges,
      timeSpent,
      feedback: generateFeedback(score, timeSpent, total)
    });
  } catch (error) {
    console.error('Error submitting challenges:', error);
    res.status(500).json({ error: 'Failed to submit challenges' });
  }
});

// Get available concepts
router.get('/concepts', (req, res) => {
  const concepts = Object.keys(challengeTemplates).map(key => ({
    id: key,
    name: key.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' '),
    challengeCount: challengeTemplates[key].length
  }));

  res.json({ concepts });
});

// Get user statistics
router.get('/stats/:userId', (req, res) => {
  const { userId } = req.params;
  const attempts = userAttempts.get(userId) || [];

  if (attempts.length === 0) {
    return res.json({
      totalAttempts: 0,
      averageScore: 0,
      totalXP: 0,
      totalTimeSpent: 0
    });
  }

  const stats = {
    totalAttempts: attempts.length,
    averageScore: Math.round(
      attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length
    ),
    totalXP: attempts.reduce((sum, a) => sum + a.xpEarned, 0),
    totalTimeSpent: attempts.reduce((sum, a) => sum + a.timeSpent, 0),
    bestScore: Math.max(...attempts.map(a => a.score)),
    recentAttempts: attempts.slice(-5).reverse()
  };

  res.json(stats);
});

function calculateXPEarned(score, timeSpent, totalChallenges, correct, total) {
  const baseXP = 50;
  const scoreMultiplier = score / 100;
  
  // Speed bonus (if completed in less than estimated time)
  const estimatedTime = totalChallenges * 60; // 60s per challenge
  const timeBonus = timeSpent < estimatedTime ? 20 : 0;
  
  // Perfect score bonus
  const perfectBonus = score === 100 ? 30 : 0;
  
  // Accuracy bonus
  const accuracyBonus = correct === total ? 15 : 0;

  return Math.round(baseXP * scoreMultiplier + timeBonus + perfectBonus + accuracyBonus);
}

function determineBadges(userId, score, timeSpent, correct, total) {
  const badges = [];

  if (score === 100) {
    badges.push({
      id: 'perfect_score',
      name: 'Perfect Score',
      description: 'Answered all questions correctly!',
      rarity: 'legendary'
    });
  }

  if (timeSpent < total * 45) { // Less than 45s per question
    badges.push({
      id: 'speed_demon',
      name: 'Speed Demon',
      description: 'Lightning-fast completion!',
      rarity: 'rare'
    });
  }

  const attempts = userAttempts.get(userId) || [];
  if (attempts.length === 1) {
    badges.push({
      id: 'first_challenge',
      name: 'First Steps',
      description: 'Completed your first challenge!',
      rarity: 'common'
    });
  }

  if (attempts.length >= 10) {
    badges.push({
      id: 'dedicated_learner',
      name: 'Dedicated Learner',
      description: 'Completed 10 challenges!',
      rarity: 'epic'
    });
  }

  return badges;
}

function generateFeedback(score, timeSpent, total) {
  if (score === 100) {
    return "🎉 Perfect score! You're mastering this concept!";
  } else if (score >= 80) {
    return "🌟 Great job! You're doing really well!";
  } else if (score >= 60) {
    return "👍 Good effort! Review the explanations to improve.";
  } else {
    return "💪 Keep practicing! Check the explanations and try again.";
  }
}

module.exports = router;


