// backend/routes/tts.js
// ElevenLabs Text-to-Speech routes
const express = require("express");
const router = express.Router();
const {
  generateTTS,
  getVoices,
  getTTSBase64,
} = require("../services/elevenService");
const pino = require("pino");
const logger = pino();

/**
 * POST /api/tts
 * Generate speech audio from text
 * 
 * Body: { 
 *   text: "...",
 *   voiceId?: "...",
 *   returnBase64?: boolean
 * }
 * Returns: { ok: true, url: "/tts/..." } or { ok: true, audioBase64: "..." }
 */
router.post("/", async (req, res) => {
  try {
    const { text, voiceId, outFilename, returnBase64 = false } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        ok: false,
        error: "text is required and cannot be empty",
      });
    }

    // Limit text length to prevent abuse
    if (text.length > 5000) {
      return res.status(400).json({
        ok: false,
        error: "text too long (max 5000 characters)",
      });
    }

    if (returnBase64) {
      // Return base64-encoded audio (for embedding in frontend)
      const audioBase64 = await getTTSBase64({ text, voiceId });
      
      logger.info(`Generated TTS (base64) for ${text.length} chars`);
      
      res.json({
        ok: true,
        audioBase64,
        contentType: "audio/mpeg",
        dataUrl: `data:audio/mpeg;base64,${audioBase64}`,
      });
    } else {
      // Save to public/tts and return URL
      const url = await generateTTS({ text, voiceId, outFilename });
      
      logger.info(`Generated TTS audio: ${url}`);
      
      res.json({
        ok: true,
        url,
      });
    }
  } catch (error) {
    logger.error("TTS error:", error);
    res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/tts/voices
 * Get available ElevenLabs voices
 * 
 * Returns: { ok: true, voices: [{voice_id, name, preview_url}] }
 */
router.get("/voices", async (req, res) => {
  try {
    const voices = await getVoices();

    res.json({
      ok: true,
      voices,
    });
  } catch (error) {
    logger.error("Get voices error:", error);
    res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
});

module.exports = router;

