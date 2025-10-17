// backend/services/assemblyService.js
const axios = require("axios");
const pino = require("pino");
const logger = pino();

const ASSEMBLY_API = "https://api.assemblyai.com/v2";
const MAX_POLL_ATTEMPTS = 120; // 2 minutes with 1-second intervals
const POLL_INTERVAL = 1000; // 1 second

/**
 * transcribeFromUrl - Start a transcription job at AssemblyAI
 * Polls until complete and returns transcript with timestamps
 * 
 * @param {string} publicUrl - Public URL to audio/video file
 * @param {Object} options - Transcription options
 * @param {boolean} options.speaker_labels - Enable speaker diarization
 * @param {boolean} options.auto_chapters - Auto-generate chapters
 * @param {boolean} options.summarization - Generate summary
 * @param {boolean} options.sentiment_analysis - Analyze sentiment
 * @returns {Promise<{text: string, segments: Array, summary?: string, chapters?: Array}>}
 */
async function transcribeFromUrl(publicUrl, options = {}) {
  const {
    speaker_labels = false,
    auto_chapters = false,
    summarization = false,
    sentiment_analysis = false,
  } = options;

  try {
    const headers = {
      authorization: process.env.ASSEMBLYAI_API_KEY,
      "content-type": "application/json",
    };

    // Start transcription
    logger.info(`Starting AssemblyAI transcription for: ${publicUrl}`);
    const createResp = await axios.post(
      `${ASSEMBLY_API}/transcript`,
      {
        audio_url: publicUrl,
        speaker_labels,
        auto_chapters,
        summarization,
        sentiment_analysis,
      },
      { headers }
    );

    const transcriptId = createResp.data.id;
    logger.info(`Transcription job created: ${transcriptId}`);

    // Poll for completion
    let attempts = 0;
    while (attempts < MAX_POLL_ATTEMPTS) {
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));

      const statusResp = await axios.get(
        `${ASSEMBLY_API}/transcript/${transcriptId}`,
        { headers }
      );

      const status = statusResp.data.status;
      logger.info(`Transcription status: ${status} (attempt ${attempts + 1})`);

      if (status === "completed") {
        const data = statusResp.data;
        
        // Extract relevant fields
        return {
          text: data.text,
          segments: data.words || data.utterances || null,
          utterances: data.utterances || null, // Speaker-labeled segments
          summary: data.summary || null,
          chapters: data.chapters || null,
          confidence: data.confidence,
          audio_duration: data.audio_duration,
          raw: data, // Full response for advanced use
        };
      }

      if (status === "error") {
        logger.error("AssemblyAI transcription failed:", statusResp.data);
        throw new Error(
          `Transcription failed: ${statusResp.data.error || "Unknown error"}`
        );
      }

      attempts++;
    }

    // Timeout after max attempts
    throw new Error(
      `Transcription timed out after ${MAX_POLL_ATTEMPTS} attempts. Try using a webhook for long files.`
    );
  } catch (error) {
    logger.error("AssemblyAI service error:", error);
    throw new Error(`AssemblyAI error: ${error.message}`);
  }
}

/**
 * getTranscriptById - Fetch an existing transcript by ID
 * Useful for checking status of long-running jobs
 * 
 * @param {string} transcriptId - AssemblyAI transcript ID
 * @returns {Promise<Object>} - Transcript data
 */
async function getTranscriptById(transcriptId) {
  try {
    const headers = {
      authorization: process.env.ASSEMBLYAI_API_KEY,
    };

    const response = await axios.get(
      `${ASSEMBLY_API}/transcript/${transcriptId}`,
      { headers }
    );

    return response.data;
  } catch (error) {
    logger.error("AssemblyAI getTranscriptById error:", error);
    throw new Error(`AssemblyAI error: ${error.message}`);
  }
}

/**
 * extractKeyMoments - Extract key moments with timestamps from transcript
 * Useful for creating video snippets or chapter markers
 * 
 * @param {Object} transcript - Transcript data from AssemblyAI
 * @returns {Array<{timestamp: number, text: string, speaker?: string}>}
 */
function extractKeyMoments(transcript) {
  const keyMoments = [];

  // Use chapters if available
  if (transcript.chapters && transcript.chapters.length > 0) {
    transcript.chapters.forEach((chapter) => {
      keyMoments.push({
        timestamp: chapter.start,
        text: chapter.headline || chapter.summary,
        type: "chapter",
      });
    });
  }

  // Use utterances for speaker-labeled key moments
  if (transcript.utterances && transcript.utterances.length > 0) {
    // Sample every 10th utterance as key moment
    transcript.utterances.forEach((utterance, idx) => {
      if (idx % 10 === 0) {
        keyMoments.push({
          timestamp: utterance.start,
          text: utterance.text.slice(0, 100) + "...",
          speaker: utterance.speaker,
          type: "utterance",
        });
      }
    });
  }

  return keyMoments;
}

module.exports = { 
  transcribeFromUrl, 
  getTranscriptById,
  extractKeyMoments 
};

