// AssemblyAI Transcription Edge Function
// Transcribes audio/video with optional speaker diarization and summarization
// Usage: POST with { "audio_url": "https://...", "speaker_labels": true, "summarization": true }

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

interface RequestBody {
  audio_url: string;
  speaker_labels?: boolean;
  summarization?: boolean;
  auto_highlights?: boolean;
  language_code?: string;
  webhook_url?: string; // Optional: for async long-form transcription
}

interface TranscriptResponse {
  id: string;
  status: "queued" | "processing" | "completed" | "error";
  text?: string;
  words?: Array<{ text: string; start: number; end: number; confidence: number }>;
  utterances?: Array<{ speaker: string; text: string; start: number; end: number }>;
  summary?: string;
  auto_highlights_result?: { results: Array<{ text: string; count: number }> };
  error?: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get API key from Supabase Secrets
    const ASSEMBLYAI_API_KEY = Deno.env.get("ASSEMBLYAI_API_KEY");
    if (!ASSEMBLYAI_API_KEY) {
      throw new Error("ASSEMBLYAI_API_KEY not configured in Supabase Secrets");
    }

    const body: RequestBody = await req.json();
    const {
      audio_url,
      speaker_labels = false,
      summarization = false,
      auto_highlights = false,
      language_code = "en",
      webhook_url,
    } = body;

    // Validate input
    if (!audio_url) {
      return new Response(
        JSON.stringify({ error: "audio_url is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Submit transcription job
    const submitResponse = await fetch("https://api.assemblyai.com/v2/transcript", {
      method: "POST",
      headers: {
        Authorization: ASSEMBLYAI_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        audio_url,
        speaker_labels,
        summarization,
        auto_highlights,
        language_code,
        webhook_url,
      }),
    });

    if (!submitResponse.ok) {
      const errorData = await submitResponse.json();
      console.error("AssemblyAI submit error:", errorData);
      return new Response(
        JSON.stringify({
          error: "AssemblyAI submission failed",
          details: errorData,
        }),
        {
          status: submitResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const submitData: TranscriptResponse = await submitResponse.json();
    const transcriptId = submitData.id;

    // Poll for completion (max 60 seconds for short audio; use webhook for long files)
    let attempts = 0;
    const maxAttempts = 60;
    let transcriptData: TranscriptResponse = submitData;

    while (
      transcriptData.status !== "completed" &&
      transcriptData.status !== "error" &&
      attempts < maxAttempts
    ) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      const pollResponse = await fetch(
        `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
        {
          headers: {
            Authorization: ASSEMBLYAI_API_KEY,
          },
        }
      );

      if (!pollResponse.ok) {
        console.error("AssemblyAI poll error:", await pollResponse.text());
        break;
      }

      transcriptData = await pollResponse.json();
      attempts++;
    }

    // Return transcript data
    if (transcriptData.status === "completed") {
      return new Response(
        JSON.stringify({
          success: true,
          transcript_id: transcriptId,
          text: transcriptData.text,
          words: transcriptData.words,
          utterances: transcriptData.utterances,
          summary: transcriptData.summary,
          auto_highlights: transcriptData.auto_highlights_result,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } else if (transcriptData.status === "error") {
      return new Response(
        JSON.stringify({
          error: "Transcription failed",
          details: transcriptData.error,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } else {
      // Still processing - return transcript ID for client to poll
      return new Response(
        JSON.stringify({
          success: true,
          status: "processing",
          transcript_id: transcriptId,
          message:
            "Transcription is still processing. Use transcript_id to check status.",
        }),
        {
          status: 202,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

