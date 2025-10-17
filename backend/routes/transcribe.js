// backend/routes/transcribe.js
// AssemblyAI transcription routes
const express = require("express");
const router = express.Router();
const {
  transcribeFromUrl,
  getTranscriptById,
  extractKeyMoments,
} = require("../services/assemblyService");
const pino = require("pino");
const logger = pino();

/**
 * POST /api/transcribe
 * Start transcription of audio/video from public URL
 * 
 * Body: { 
 *   url: "https://...",
 *   speaker_labels?: boolean,
 *   auto_chapters?: boolean,
 *   summarization?: boolean
 * }
 * Returns: { ok: true, transcript: "...", segments: [...], summary?: "..." }
 */
router.post("/", async (req, res) => {
  try {
    const { url, speaker_labels, auto_chapters, summarization, sentiment_analysis } = req.body;

    if (!url) {
      return res.status(400).json({
        ok: false,
        error: "url is required",
      });
    }

    logger.info(`Starting transcription for: ${url}`);

    const result = await transcribeFromUrl(url, {
      speaker_labels,
      auto_chapters,
      summarization,
      sentiment_analysis,
    });

    // Extract key moments for video navigation
    const keyMoments = extractKeyMoments(result);

    res.json({
      ok: true,
      transcript: result.text,
      segments: result.segments,
      utterances: result.utterances,
      summary: result.summary,
      chapters: result.chapters,
      confidence: result.confidence,
      audio_duration: result.audio_duration,
      keyMoments,
    });
  } catch (error) {
    logger.error("Transcribe error:", error);
    res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/transcribe/:id
 * Get status of an existing transcription job
 * 
 * Returns: { ok: true, status: "...", data: {...} }
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const data = await getTranscriptById(id);

    res.json({
      ok: true,
      status: data.status,
      data,
    });
  } catch (error) {
    logger.error("Get transcript error:", error);
    res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
});

module.exports = router;

