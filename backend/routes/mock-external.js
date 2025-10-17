/**
 * Mock External APIs
 * Simulates external services like quiz generators, TTS, embeddings, etc.
 * Replace with real APIs when available
 */

const express = require('express');
const router = express.Router();

// Mock data storage
const mockEmbeddings = {
  'recursion tutorial': [
    { resource_id: 'r5', title: 'Understanding Recursion', score: 0.92 },
    { resource_id: 'r12', title: 'Recursive Functions in Python', score: 0.88 },
    { resource_id: 'r20', title: 'Base Cases and Recursion', score: 0.84 },
    { resource_id: 'r8', title: 'Recursion vs Iteration', score: 0.80 },
    { resource_id: 'r3', title: 'Advanced Recursion Patterns', score: 0.78 }
  ],
  'loops python': [
    { resource_id: 'r2', title: 'Python For Loops', score: 0.95 },
    { resource_id: 'r7', title: 'While Loops Explained', score: 0.89 },
    { resource_id: 'r15', title: 'Loop Control Statements', score: 0.85 }
  ]
};

const quizTemplates = {
  'recursion': [
    {
      qid: 'q1',
      question: 'What is the role of the base case in a recursion?',
      options: [
        'To stop the recursion',
        'To propagate arguments',
        'To call other functions',
        'To increase recursion depth'
      ],
      correct: 'To stop the recursion',
      explanation: 'The base case ensures that recursion terminates.'
    },
    {
      qid: 'q2',
      question: 'If a recursive function has no base case, what happens?',
      options: [
        'It will run exactly once',
        'It will never terminate',
        'It throws a syntax error',
        'It returns None'
      ],
      correct: 'It will never terminate',
      explanation: 'Without a base case the recursive calls continue infinitely.'
    }
  ],
  'loops': [
    {
      qid: 'q1',
      question: 'What does a for loop do in Python?',
      options: [
        'Iterates over a sequence',
        'Creates a function',
        'Defines a class',
        'Imports a module'
      ],
      correct: 'Iterates over a sequence',
      explanation: 'For loops iterate over sequences like lists, tuples, or strings.'
    }
  ]
};

/**
 * POST /api/mock-external/quiz/generate
 * Generate quiz questions for a topic
 */
router.post('/quiz/generate', (req, res) => {
  const { topic, difficulty = 'medium', num_questions = 3 } = req.body;

  if (!topic) {
    return res.status(400).json({ error: 'Topic is required' });
  }

  // Find relevant template based on topic keywords
  const topicLower = topic.toLowerCase();
  let questions = [];
  
  if (topicLower.includes('recursion')) {
    questions = quizTemplates['recursion'];
  } else if (topicLower.includes('loop')) {
    questions = quizTemplates['loops'];
  } else {
    // Generate generic questions
    questions = [
      {
        qid: 'q1',
        question: `What is the main concept behind ${topic}?`,
        options: [
          'It is a fundamental principle',
          'It is an advanced technique',
          'It is rarely used',
          'It is deprecated'
        ],
        correct: 'It is a fundamental principle',
        explanation: `${topic} is an important concept in computer science.`
      }
    ];
  }

  // Limit to requested number
  questions = questions.slice(0, num_questions);

  res.json({
    topic,
    difficulty,
    questions,
    generated_at: new Date().toISOString()
  });
});

/**
 * GET /api/mock-external/tatoeba
 * Get example sentences with translations
 */
router.get('/tatoeba', (req, res) => {
  const { word, lang_from = 'en', lang_to = 'fr' } = req.query;

  if (!word) {
    return res.status(400).json({ error: 'Word parameter is required' });
  }

  const examples = {
    'apple': [
      {
        sentence: 'I ate an apple yesterday.',
        translation: "J'ai mangé une pomme hier.",
        audio_url: `https://cdn.example.com/audio/${word}_en.mp3`
      },
      {
        sentence: 'The apple is red.',
        translation: 'La pomme est rouge.',
        audio_url: `https://cdn.example.com/audio/${word}2_en.mp3`
      }
    ],
    'book': [
      {
        sentence: 'I am reading a book.',
        translation: 'Je lis un livre.',
        audio_url: 'https://cdn.example.com/audio/book_en.mp3'
      }
    ]
  };

  const wordExamples = examples[word.toLowerCase()] || [
    {
      sentence: `This is an example sentence with the word "${word}".`,
      translation: `Ceci est un exemple de phrase avec le mot "${word}".`,
      audio_url: `https://cdn.example.com/audio/${word}_en.mp3`
    }
  ];

  res.json({
    word,
    lang_from,
    lang_to,
    examples: wordExamples
  });
});

/**
 * GET /api/mock-external/cv/transcript
 * Get audio transcript from Common Voice
 */
router.get('/cv/transcript', (req, res) => {
  const { clip_id } = req.query;

  if (!clip_id) {
    return res.status(400).json({ error: 'clip_id parameter is required' });
  }

  const mockTranscripts = {
    'cv123': {
      clip_id: 'cv123',
      language: 'en',
      transcript: 'She sells seashells by the seashore.',
      audio_url: 'https://cdn.example.org/cv/audio/cv123.mp3'
    },
    'cv456': {
      clip_id: 'cv456',
      language: 'en',
      transcript: 'How much wood would a woodchuck chuck?',
      audio_url: 'https://cdn.example.org/cv/audio/cv456.mp3'
    }
  };

  const transcript = mockTranscripts[clip_id] || {
    clip_id,
    language: 'en',
    transcript: 'Sample audio transcript.',
    audio_url: `https://cdn.example.org/cv/audio/${clip_id}.mp3`
  };

  res.json(transcript);
});

/**
 * POST /api/mock-external/tts/synthesize
 * Text-to-speech synthesis
 */
router.post('/tts/synthesize', (req, res) => {
  const { text, voice = 'en-US', speed = 1.0 } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  // Generate a mock audio URL (in real implementation, this would create actual audio)
  const audioId = Buffer.from(text).toString('base64').substring(0, 16);
  
  res.json({
    text,
    voice,
    speed,
    audio_url: `https://cdn.example.com/tts/${audioId}_${voice}.mp3`,
    duration_ms: text.length * 100, // Mock duration estimate
    format: 'mp3'
  });
});

/**
 * POST /api/mock-external/semantic/search
 * Semantic search using embeddings
 */
router.post('/semantic/search', (req, res) => {
  const { query, top_k = 5 } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  // Find best matching mock results
  const queryLower = query.toLowerCase();
  let results = [];

  for (const [key, value] of Object.entries(mockEmbeddings)) {
    if (queryLower.includes(key) || key.includes(queryLower)) {
      results = value;
      break;
    }
  }

  // If no match, return generic results
  if (results.length === 0) {
    results = [
      { resource_id: 'r1', title: 'Introduction to ' + query, score: 0.75 },
      { resource_id: 'r2', title: query + ' Basics', score: 0.70 },
      { resource_id: 'r3', title: 'Advanced ' + query, score: 0.65 }
    ];
  }

  res.json({
    query,
    top_k,
    results: results.slice(0, top_k)
  });
});

/**
 * POST /api/mock-external/explain
 * Generate explanations for why a resource is recommended
 */
router.post('/explain', (req, res) => {
  const { user_id, node_id, resource_id, recent_attempts = [] } = req.body;

  if (!user_id || !node_id || !resource_id) {
    return res.status(400).json({ 
      error: 'user_id, node_id, and resource_id are required' 
    });
  }

  // Generate contextual explanation based on attempts
  let explanation = '';
  let evidence = '';
  let next_step = '';

  if (recent_attempts.length > 0) {
    const lastAttempt = recent_attempts[recent_attempts.length - 1];
    const score = lastAttempt.score_pct || 0;
    const hints = lastAttempt.hints_used || 0;

    if (score < 70) {
      explanation = `Because you scored ${score}% on the prerequisite node ${lastAttempt.node_id}, this resource will help solidify that foundation before moving forward.`;
      evidence = `Attempt on node ${lastAttempt.node_id}: ${score}%, ${hints} hint(s) used`;
      next_step = 'Complete this resource and retry the previous concept for better mastery.';
    } else {
      explanation = `Great progress on node ${lastAttempt.node_id} (${score}%)! This resource builds on that foundation and introduces the next level of complexity.`;
      evidence = `Strong performance on node ${lastAttempt.node_id}: ${score}%`;
      next_step = 'Continue with this resource to advance your skills.';
    }
  } else {
    explanation = `This resource is recommended as a starting point for node ${node_id} based on your learning profile.`;
    evidence = 'Initial assessment';
    next_step = 'Begin with this resource to build a strong foundation.';
  }

  res.json({
    explanation,
    evidence,
    next_step,
    confidence: 0.85,
    generated_at: new Date().toISOString()
  });
});

/**
 * POST /api/mock-external/embeddings/generate
 * Generate embeddings for text
 */
router.post('/embeddings/generate', (req, res) => {
  const { text, model = 'gte-small' } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  // Generate mock embedding (in reality, this would use a real model)
  // Using a deterministic approach based on text content for consistency
  const mockEmbedding = Array.from({ length: 384 }, (_, i) => {
    const seed = text.charCodeAt(i % text.length) + i;
    return Math.sin(seed) * 0.5;
  });

  res.json({
    text,
    model,
    embedding: mockEmbedding,
    dimensions: mockEmbedding.length
  });
});

module.exports = router;


