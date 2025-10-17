/**
 * Supabase Edge Function: Embed Resource
 * Generates embeddings for resources to enable semantic search
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmbedRequest {
  resourceId: string
  text: string
  model?: string
}

// Mock embedding generator - in production, use real model
function generateMockEmbedding(text: string, dimensions = 384): number[] {
  // Create deterministic embeddings based on text content
  const embedding: number[] = []
  
  for (let i = 0; i < dimensions; i++) {
    const seed = text.charCodeAt(i % text.length) + i
    embedding.push(Math.sin(seed) * 0.5)
  }
  
  // Normalize the vector
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0))
  return embedding.map(val => val / magnitude)
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { resourceId, text, model = 'gte-small' }: EmbedRequest = await req.json()

    if (!resourceId || !text) {
      return new Response(
        JSON.stringify({ error: 'resourceId and text are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate embedding
    // TODO: Replace with real AI model inference when available
    const embedding = generateMockEmbedding(text)

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Store embedding in database
    const { data, error } = await supabase
      .from('embeddings')
      .upsert({
        resource_id: resourceId,
        embedding: JSON.stringify(embedding), // Store as JSON for now
        model,
        dimensions: embedding.length,
        created_at: new Date().toISOString()
      }, {
        onConflict: 'resource_id'
      })

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({
        success: true,
        resource_id: resourceId,
        dimensions: embedding.length,
        model,
        generated_at: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error('embedResource error:', err)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})


