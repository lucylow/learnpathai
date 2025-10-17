/**
 * Supabase Edge Function: Query Similar
 * Finds similar resources using semantic search on embeddings
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface QueryRequest {
  queryText: string
  k?: number
  similarityThreshold?: number
}

// Mock embedding generator (same as embedResource)
function generateMockEmbedding(text: string, dimensions = 384): number[] {
  const embedding: number[] = []
  
  for (let i = 0; i < dimensions; i++) {
    const seed = text.charCodeAt(i % text.length) + i
    embedding.push(Math.sin(seed) * 0.5)
  }
  
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0))
  return embedding.map(val => val / magnitude)
}

// Calculate cosine similarity between two vectors
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0
  
  let dotProduct = 0
  let magA = 0
  let magB = 0
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    magA += a[i] * a[i]
    magB += b[i] * b[i]
  }
  
  return dotProduct / (Math.sqrt(magA) * Math.sqrt(magB))
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { queryText, k = 5, similarityThreshold = 0.7 }: QueryRequest = await req.json()

    if (!queryText) {
      return new Response(
        JSON.stringify({ error: 'queryText is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate query embedding
    const queryEmbedding = generateMockEmbedding(queryText)

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch all embeddings (in production, use pgvector for efficient search)
    const { data: embeddings, error } = await supabase
      .from('embeddings')
      .select('resource_id, embedding')

    if (error) {
      throw error
    }

    // Calculate similarities
    const results = embeddings
      .map(item => {
        const embedding = JSON.parse(item.embedding)
        const similarity = cosineSimilarity(queryEmbedding, embedding)
        return {
          resource_id: item.resource_id,
          score: similarity
        }
      })
      .filter(item => item.score >= similarityThreshold)
      .sort((a, b) => b.score - a.score)
      .slice(0, k)

    // Fetch resource details
    const resourceIds = results.map(r => r.resource_id)
    const { data: resources } = await supabase
      .from('resources')
      .select('id, title, type, difficulty, url')
      .in('id', resourceIds)

    // Merge results with resource details
    const enrichedResults = results.map(result => {
      const resource = resources?.find(r => r.id === result.resource_id)
      return {
        ...result,
        ...resource
      }
    })

    return new Response(
      JSON.stringify({
        query: queryText,
        results: enrichedResults,
        count: enrichedResults.length,
        generated_at: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error('querySimilar error:', err)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})


