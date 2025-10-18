// ElevenLabs Text-to-Speech Edge Function
// Generates high-quality speech audio from text
// Usage: POST with { "text": "...", "voice_id": "...", "model_id": "eleven_monolingual_v1" }

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

interface RequestBody {
  text: string;
  voice_id?: string; // Default: "EXAVITQu4vr4xnSDxMaL" (Sarah)
  model_id?: string; // Default: "eleven_monolingual_v1"
  voice_settings?: {
    stability?: number;
    similarity_boost?: number;
  };
  return_url?: boolean; // If true, return audio URL; if false, return base64
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get API key from Supabase Secrets
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    if (!ELEVENLABS_API_KEY) {
      throw new Error("ELEVENLABS_API_KEY not configured in Supabase Secrets");
    }

    const body: RequestBody = await req.json();
    const {
      text,
      voice_id = "EXAVITQu4vr4xnSDxMaL", // Sarah (default voice)
      model_id = "eleven_monolingual_v1",
      voice_settings = { stability: 0.5, similarity_boost: 0.75 },
      return_url = false,
    } = body;

    // Validate input
    if (!text || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "text is required and cannot be empty" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Call ElevenLabs TTS API
    const elevenLabsResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model_id,
          voice_settings,
        }),
      }
    );

    if (!elevenLabsResponse.ok) {
      const errorText = await elevenLabsResponse.text();
      console.error("ElevenLabs API error:", errorText);
      return new Response(
        JSON.stringify({
          error: "ElevenLabs API request failed",
          details: errorText,
        }),
        {
          status: elevenLabsResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get audio data as ArrayBuffer
    const audioBuffer = await elevenLabsResponse.arrayBuffer();
    const audioBase64 = btoa(
      String.fromCharCode(...new Uint8Array(audioBuffer))
    );

    // Option 1: Return base64-encoded audio (embed in frontend)
    if (!return_url) {
      return new Response(
        JSON.stringify({
          success: true,
          audio_base64: audioBase64,
          content_type: "audio/mpeg",
          usage_note: "Use data:audio/mpeg;base64,{audio_base64} in <audio> src",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Option 2: Return audio file directly (for download or streaming)
    return new Response(audioBuffer, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "audio/mpeg",
        "Content-Disposition": `attachment; filename="tts_${Date.now()}.mp3"`,
      },
    });
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

