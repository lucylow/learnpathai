// backend/services/elevenService.js
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const pino = require("pino");
const logger = pino();

const ELEVENLABS_API = "https://api.elevenlabs.io/v1";

/**
 * generateTTS - Generate speech audio using ElevenLabs
 * Saves audio to public/tts/ directory and returns public URL
 * 
 * @param {Object} params
 * @param {string} params.text - Text to convert to speech
 * @param {string} params.voiceId - ElevenLabs voice ID (optional, uses env default)
 * @param {string} params.outFilename - Output filename (optional, auto-generated)
 * @param {Object} params.voiceSettings - Voice settings (stability, similarity_boost)
 * @returns {Promise<string>} - Public URL to the generated audio file
 */
async function generateTTS({ text, voiceId = null, outFilename = null, voiceSettings = null }) {
  try {
    const apiKey = process.env.ELEVEN_API_KEY;
    const voice = voiceId || process.env.ELEVEN_VOICE_ID || "EXAVITQu4vr4xnSDxMaL"; // Sarah voice
    
    if (!apiKey) {
      throw new Error("ELEVEN_API_KEY not configured");
    }

    // Default voice settings for natural-sounding speech
    const settings = voiceSettings || {
      stability: 0.5,
      similarity_boost: 0.75,
    };

    logger.info(`Generating TTS for text (${text.length} chars) with voice ${voice}`);

    const response = await axios.post(
      `${ELEVENLABS_API}/text-to-speech/${voice}`,
      {
        text,
        model_id: "eleven_monolingual_v1",
        voice_settings: settings,
      },
      {
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
        },
        responseType: "arraybuffer",
      }
    );

    // Save audio to public/tts directory
    const outDir = path.join(process.cwd(), "public", "tts");
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    const filename = outFilename || `tts-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.mp3`;
    const fullPath = path.join(outDir, filename);
    
    fs.writeFileSync(fullPath, Buffer.from(response.data));
    logger.info(`TTS audio saved to ${fullPath}`);

    // Return public URL (assuming Express serves /public as static)
    return `/tts/${filename}`;
  } catch (error) {
    logger.error("ElevenLabs TTS error:", error.response?.data || error.message);
    throw new Error(`ElevenLabs error: ${error.message}`);
  }
}

/**
 * getVoices - Fetch available voices from ElevenLabs
 * Useful for letting users choose voices
 * 
 * @returns {Promise<Array<{voice_id: string, name: string, preview_url: string}>>}
 */
async function getVoices() {
  try {
    const apiKey = process.env.ELEVEN_API_KEY;
    
    if (!apiKey) {
      throw new Error("ELEVEN_API_KEY not configured");
    }

    const response = await axios.get(`${ELEVENLABS_API}/voices`, {
      headers: {
        "xi-api-key": apiKey,
      },
    });

    return response.data.voices.map((voice) => ({
      voice_id: voice.voice_id,
      name: voice.name,
      preview_url: voice.preview_url,
      category: voice.category,
    }));
  } catch (error) {
    logger.error("ElevenLabs getVoices error:", error);
    throw new Error(`ElevenLabs error: ${error.message}`);
  }
}

/**
 * getTTSBase64 - Generate TTS and return as base64 (for embedding in frontend)
 * 
 * @param {Object} params - Same as generateTTS
 * @returns {Promise<string>} - Base64-encoded audio
 */
async function getTTSBase64({ text, voiceId = null, voiceSettings = null }) {
  try {
    const apiKey = process.env.ELEVEN_API_KEY;
    const voice = voiceId || process.env.ELEVEN_VOICE_ID || "EXAVITQu4vr4xnSDxMaL";
    
    const settings = voiceSettings || {
      stability: 0.5,
      similarity_boost: 0.75,
    };

    const response = await axios.post(
      `${ELEVENLABS_API}/text-to-speech/${voice}`,
      {
        text,
        model_id: "eleven_monolingual_v1",
        voice_settings: settings,
      },
      {
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
        },
        responseType: "arraybuffer",
      }
    );

    const base64 = Buffer.from(response.data).toString("base64");
    return base64;
  } catch (error) {
    logger.error("ElevenLabs getTTSBase64 error:", error);
    throw new Error(`ElevenLabs error: ${error.message}`);
  }
}

module.exports = { 
  generateTTS, 
  getVoices,
  getTTSBase64 
};

