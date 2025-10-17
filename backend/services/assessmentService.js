/**
 * AI-Generated Assessment Service
 * 
 * Generates unique, integrity-aware assessments for each student
 * Features:
 * - Parameterized questions (unique per student)
 * - Anti-cheating measures
 * - Adaptive difficulty
 * - Automatic grading
 */

const crypto = require('crypto');

class AssessmentService {
  constructor() {
    this.questionTemplates = new Map();
    this.generatedAssessments = new Map();
    this.initializeTemplates();
  }

  initializeTemplates() {
    // Question templates for different concepts
    this.questionTemplates.set('for-loops:beginner', [
      {
        id: 'loops_basic_01',
        type: 'multiple_choice',
        question: "What will be the output of this code?\n\n```python\nfor i in range({start}, {end}):\n    print(i)\n```",
        parameters: {
          start: { type: 'range', range: { min: 0, max: 5 }, step: 1 },
          end: { type: 'range', range: { min: 3, max: 8 }, step: 1 }
        },
        answerGenerator: (params) => {
          const output = [];
          for (let i = params.start; i < params.end; i++) {
            output.push(i);
          }
          return output.join(', ');
        },
        distractorGenerator: (params, correctAnswer) => [
          `${params.start}, ${params.start + 1}, ..., ${params.end}`,
          `${params.start + 1}, ${params.start + 2}, ..., ${params.end - 1}`,
          'Error: range() is missing an argument'
        ]
      },
      {
        id: 'loops_basic_02',
        type: 'multiple_choice',
        question: "How many times will this loop execute?\n\n```python\nfor x in range({count}):\n    print('Hello')\n```",
        parameters: {
          count: { type: 'range', range: { min: 3, max: 10 }, step: 1 }
        },
        answerGenerator: (params) => `${params.count} times`,
        distractorGenerator: (params) => [
          `${params.count - 1} times`,
          `${params.count + 1} times`,
          'Infinite loop'
        ]
      },
      {
        id: 'loops_basic_03',
        type: 'code_completion',
        question: "Complete the code to print numbers from {start} to {end}:\n\n```python\nfor i in ___:\n    print(i)\n```",
        parameters: {
          start: { type: 'range', range: { min: 1, max: 5 }, step: 1 },
          end: { type: 'range', range: { min: 6, max: 12 }, step: 1 }
        },
        answerGenerator: (params) => `range(${params.start}, ${params.end + 1})`,
        distractorGenerator: (params) => [
          `range(${params.start}, ${params.end})`,
          `range(${params.end})`,
          `[${params.start}, ${params.end}]`
        ]
      }
    ]);

    this.questionTemplates.set('functions:beginner', [
      {
        id: 'func_basic_01',
        type: 'multiple_choice',
        question: "What does this function return?\n\n```python\ndef add_numbers(a, b):\n    return a + b\n\nresult = add_numbers({num1}, {num2})\n```",
        parameters: {
          num1: { type: 'range', range: { min: 1, max: 20 }, step: 1 },
          num2: { type: 'range', range: { min: 1, max: 20 }, step: 1 }
        },
        answerGenerator: (params) => `${params.num1 + params.num2}`,
        distractorGenerator: (params) => [
          `${params.num1 * params.num2}`,
          `${params.num1 - params.num2}`,
          `${params.num1}`
        ]
      }
    ]);
  }

  /**
   * Generate unique assessment for a student
   */
  async generateAssessment(concept, difficulty, studentId, questionCount = 5) {
    const templateKey = `${concept}:${difficulty}`;
    const templates = this.questionTemplates.get(templateKey);

    if (!templates) {
      throw new Error(`No templates found for ${templateKey}`);
    }

    const questions = [];
    const usedTemplates = new Set();

    // Generate unique questions
    for (let i = 0; i < questionCount; i++) {
      // Select a random template (without replacement if possible)
      let template;
      let templateIndex;
      
      if (usedTemplates.size < templates.length) {
        do {
          templateIndex = this.generateSeed(studentId, i) % templates.length;
          template = templates[templateIndex];
        } while (usedTemplates.has(templateIndex) && usedTemplates.size < templates.length);
        usedTemplates.add(templateIndex);
      } else {
        // Reuse templates if we've used them all
        templateIndex = i % templates.length;
        template = templates[templateIndex];
      }

      const question = await this.generateQuestion(template, studentId, i);
      questions.push(question);
    }

    // Create assessment with integrity measures
    const assessment = {
      id: this.generateAssessmentId(studentId),
      studentId,
      concept,
      difficulty,
      questions: this.shuffleQuestions(questions, studentId),
      integrity: {
        token: this.generateAssessmentToken(studentId),
        timestamp: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour
        shuffleSeed: this.generateShuffleSeed(studentId)
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        questionCount,
        estimatedTime: questionCount * 2 // 2 min per question
      }
    };

    // Store assessment
    this.generatedAssessments.set(assessment.id, assessment);

    return assessment;
  }

  /**
   * Generate a single parameterized question
   */
  async generateQuestion(template, studentId, questionIndex) {
    // Generate parameters
    const parameters = this.generateParameters(template.parameters, studentId, questionIndex);
    
    // Fill template with parameters
    const questionText = this.fillTemplate(template.question, parameters);
    
    // Generate correct answer
    const correctAnswer = template.answerGenerator(parameters);
    
    // Generate distractors
    const distractors = template.distractorGenerator(parameters, correctAnswer);
    
    // Create options (shuffled)
    const allOptions = [correctAnswer, ...distractors];
    const shuffledOptions = this.shuffleArray(allOptions, studentId + questionIndex);
    
    // Find correct answer index after shuffling
    const correctIndex = shuffledOptions.indexOf(correctAnswer);

    return {
      id: `q_${studentId}_${questionIndex}_${Date.now()}`,
      templateId: template.id,
      type: template.type,
      question: questionText,
      options: shuffledOptions,
      correctAnswerIndex: correctIndex,
      correctAnswer, // Store for grading (don't send to client)
      parameters, // Store for verification
      integrity: {
        paramHash: this.hashParameters(parameters),
        studentSpecific: true
      }
    };
  }

  /**
   * Generate parameters for a question template
   */
  generateParameters(parameterSpec, studentId, questionIndex) {
    const parameters = {};
    const seed = this.generateSeed(studentId, questionIndex);
    
    for (const [paramName, spec] of Object.entries(parameterSpec)) {
      switch (spec.type) {
        case 'range':
          const range = spec.range.max - spec.range.min;
          const step = spec.step || 1;
          const steps = Math.floor(range / step);
          const stepIndex = seed % steps;
          parameters[paramName] = spec.range.min + (stepIndex * step);
          break;
          
        case 'list':
          const index = seed % spec.values.length;
          parameters[paramName] = spec.values[index];
          break;
          
        case 'calculated':
          parameters[paramName] = this.calculateParameter(spec.formula, parameters);
          break;
          
        default:
          parameters[paramName] = spec.default || 0;
      }
    }
    
    return parameters;
  }

  /**
   * Fill template with parameters
   */
  fillTemplate(template, parameters) {
    let filled = template;
    for (const [key, value] of Object.entries(parameters)) {
      filled = filled.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    }
    return filled;
  }

  /**
   * Generate deterministic seed for student + question
   */
  generateSeed(studentId, questionIndex) {
    const hourBlock = Math.floor(Date.now() / (1000 * 60 * 60)); // Changes every hour
    const str = `${studentId}_${questionIndex}_${hourBlock}`;
    
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  /**
   * Shuffle array with deterministic seed
   */
  shuffleArray(array, seed) {
    const shuffled = [...array];
    const seedValue = typeof seed === 'string' ? this.stringToSeed(seed) : seed;
    
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.abs((seedValue * (i + 1)) % (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled;
  }

  /**
   * Shuffle questions for each student
   */
  shuffleQuestions(questions, studentId) {
    return this.shuffleArray(questions, studentId);
  }

  /**
   * Generate assessment ID
   */
  generateAssessmentId(studentId) {
    return `assess_${studentId}_${Date.now()}`;
  }

  /**
   * Generate assessment token for integrity
   */
  generateAssessmentToken(studentId) {
    return crypto
      .createHash('sha256')
      .update(`${studentId}_${Date.now()}_${Math.random()}`)
      .digest('hex')
      .substring(0, 16);
  }

  /**
   * Generate shuffle seed
   */
  generateShuffleSeed(studentId) {
    return this.generateSeed(studentId, 0);
  }

  /**
   * Hash parameters for verification
   */
  hashParameters(parameters) {
    return crypto
      .createHash('sha256')
      .update(JSON.stringify(parameters))
      .digest('hex')
      .substring(0, 16);
  }

  /**
   * String to seed conversion
   */
  stringToSeed(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  /**
   * Grade an assessment
   */
  async gradeAssessment(assessmentId, studentAnswers) {
    const assessment = this.generatedAssessments.get(assessmentId);
    
    if (!assessment) {
      throw new Error('Assessment not found');
    }

    // Verify integrity
    const integrityCheck = this.verifyIntegrity(assessment);
    if (!integrityCheck.valid) {
      throw new Error(`Integrity check failed: ${integrityCheck.reason}`);
    }

    let correctCount = 0;
    const results = [];

    for (let i = 0; i < assessment.questions.length; i++) {
      const question = assessment.questions[i];
      const studentAnswer = studentAnswers[i];
      const isCorrect = studentAnswer === question.correctAnswerIndex;
      
      if (isCorrect) correctCount++;

      results.push({
        questionId: question.id,
        isCorrect,
        studentAnswer,
        correctAnswer: question.correctAnswerIndex,
        feedback: this.generateFeedback(question, isCorrect)
      });
    }

    const score = correctCount / assessment.questions.length;

    return {
      assessmentId,
      score,
      correctCount,
      totalQuestions: assessment.questions.length,
      results,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Verify assessment integrity
   */
  verifyIntegrity(assessment) {
    // Check expiration
    if (new Date(assessment.integrity.expiresAt) < new Date()) {
      return { valid: false, reason: 'Assessment expired' };
    }

    // Verify token (simplified - use proper JWT in production)
    if (!assessment.integrity.token) {
      return { valid: false, reason: 'Invalid token' };
    }

    return { valid: true };
  }

  /**
   * Generate feedback for a question
   */
  generateFeedback(question, isCorrect) {
    if (isCorrect) {
      return 'Correct! Well done.';
    } else {
      return `Incorrect. The correct answer was: ${question.correctAnswer}`;
    }
  }
}

module.exports = new AssessmentService();


