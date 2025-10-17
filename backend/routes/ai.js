// backend/routes/ai.js
// OpenAI-powered AI features: explanations, quiz generation, personalized paths
const express = require("express");
const router = express.Router();
const {
  generateExplanation,
  generateQuiz,
  generateEmbeddings,
  generatePersonalizedPath,
} = require("../services/openaiService");
const pino = require("pino");
const logger = pino();

/**
 * POST /api/ai/explain
 * Generate an explanation of why a resource is recommended
 * 
 * Body: { masteryMap: {...}, resourceTitle: "...", resourceSnippet: "..." }
 * Returns: { ok: true, explanation: {reason, evidence, next_step} }
 */
router.post("/explain", async (req, res) => {
  try {
    const { masteryMap, resourceTitle, resourceSnippet } = req.body;

    if (!masteryMap || !resourceTitle || !resourceSnippet) {
      return res.status(400).json({
        ok: false,
        error: "masteryMap, resourceTitle, and resourceSnippet are required",
      });
    }

    const explanation = await generateExplanation({
      masteryMap,
      resourceTitle,
      resourceSnippet,
    });

    logger.info(`Generated explanation for resource: ${resourceTitle}`);

    res.json({
      ok: true,
      explanation,
    });
  } catch (error) {
    logger.error("AI explain error:", error);
    res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/ai/quiz
 * Generate quiz questions for a concept
 * 
 * Body: { concept: "...", difficulty: "beginner|intermediate|advanced" }
 * Returns: { ok: true, quiz: [{id, question, options, correctIndex, explanation}] }
 */
router.post("/quiz", async (req, res) => {
  try {
    const { concept, difficulty = "beginner" } = req.body;

    if (!concept) {
      return res.status(400).json({
        ok: false,
        error: "concept is required",
      });
    }

    const quiz = await generateQuiz({ concept, difficulty });

    logger.info(`Generated quiz for concept: ${concept} (${difficulty})`);

    res.json({
      ok: true,
      quiz,
      concept,
      difficulty,
    });
  } catch (error) {
    logger.error("AI quiz error:", error);
    res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/ai/embeddings
 * Generate embeddings for text (for semantic search/RAG)
 * 
 * Body: { text: "..." }
 * Returns: { ok: true, embeddings: [0.123, ...] }
 */
router.post("/embeddings", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        ok: false,
        error: "text is required",
      });
    }

    const embeddings = await generateEmbeddings(text);

    logger.info(`Generated embeddings for text (${text.length} chars)`);

    res.json({
      ok: true,
      embeddings,
      dimensions: embeddings.length,
    });
  } catch (error) {
    logger.error("AI embeddings error:", error);
    res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/ai/personalized-path
 * Generate a personalized learning path using GPT
 * 
 * Body: { goal: "...", masteryMap: {...}, availableResources: [...] }
 * Returns: { ok: true, path: [{resource_id, title, reason, estimated_time}] }
 */
router.post("/personalized-path", async (req, res) => {
  try {
    const { goal, masteryMap, availableResources } = req.body;

    if (!goal || !masteryMap || !availableResources) {
      return res.status(400).json({
        ok: false,
        error: "goal, masteryMap, and availableResources are required",
      });
    }

    const path = await generatePersonalizedPath({
      goal,
      masteryMap,
      availableResources,
    });

    logger.info(`Generated personalized path for goal: ${goal}`);

    res.json({
      ok: true,
      path,
      goal,
    });
  } catch (error) {
    logger.error("AI personalized-path error:", error);
    res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
});

module.exports = router;

