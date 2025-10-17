/**
 * AI-Generated Assessment API Routes
 */

const express = require('express');
const router = express.Router();
const assessmentService = require('../services/assessmentService');

/**
 * POST /api/assessments/generate
 * Generate a unique assessment for a student
 */
router.post('/generate', async (req, res) => {
  try {
    const { concept, difficulty, studentId, questionCount } = req.body;

    if (!concept || !difficulty || !studentId) {
      return res.status(400).json({
        error: 'Invalid request: concept, difficulty, and studentId are required'
      });
    }

    const assessment = await assessmentService.generateAssessment(
      concept,
      difficulty,
      studentId,
      questionCount || 5
    );

    // Remove correct answers before sending to client
    const clientAssessment = {
      ...assessment,
      questions: assessment.questions.map(q => {
        const { correctAnswer, correctAnswerIndex, ...clientQuestion } = q;
        return clientQuestion;
      })
    };

    res.json({
      success: true,
      assessment: clientAssessment
    });
  } catch (error) {
    console.error('Error generating assessment:', error);
    res.status(500).json({
      error: 'Failed to generate assessment',
      message: error.message
    });
  }
});

/**
 * POST /api/assessments/grade
 * Grade a completed assessment
 */
router.post('/grade', async (req, res) => {
  try {
    const { assessmentId, studentAnswers } = req.body;

    if (!assessmentId || !studentAnswers || !Array.isArray(studentAnswers)) {
      return res.status(400).json({
        error: 'Invalid request: assessmentId and studentAnswers array are required'
      });
    }

    const results = await assessmentService.gradeAssessment(assessmentId, studentAnswers);

    res.json({
      success: true,
      results
    });
  } catch (error) {
    console.error('Error grading assessment:', error);
    res.status(500).json({
      error: 'Failed to grade assessment',
      message: error.message
    });
  }
});

/**
 * GET /api/assessments/demo
 * Get a demo assessment
 */
router.get('/demo', async (req, res) => {
  try {
    const demoAssessment = await assessmentService.generateAssessment(
      'for-loops',
      'beginner',
      'demo_student_' + Date.now(),
      3 // Just 3 questions for demo
    );

    // Remove correct answers for demo
    const clientAssessment = {
      ...demoAssessment,
      questions: demoAssessment.questions.map(q => {
        const { correctAnswer, correctAnswerIndex, ...clientQuestion } = q;
        return clientQuestion;
      })
    };

    res.json({
      success: true,
      assessment: clientAssessment
    });
  } catch (error) {
    console.error('Error generating demo assessment:', error);
    res.status(500).json({
      error: 'Failed to generate demo assessment',
      message: error.message
    });
  }
});

module.exports = router;


