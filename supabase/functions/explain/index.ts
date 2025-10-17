/**
 * Supabase Edge Function: Explain
 * Generates explanations for why a resource is recommended to a user
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ExplainRequest {
  userId: string
  nodeId: string
  resourceId: string
  evidenceSnippet?: string
  recentAttempts?: Array<{
    node_id: string
    score_pct: number
    hints_used: number
  }>
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId, nodeId, resourceId, evidenceSnippet = '', recentAttempts = [] }: ExplainRequest = await req.json()

    if (!userId || !nodeId || !resourceId) {
      return new Response(
        JSON.stringify({ error: 'userId, nodeId, and resourceId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch resource details
    const { data: resource } = await supabase
      .from('resources')
      .select('title, type, difficulty')
      .eq('id', resourceId)
      .single()

    // Fetch node details
    const { data: node } = await supabase
      .from('nodes')
      .select('title, concept')
      .eq('id', nodeId)
      .single()

    // Generate contextual explanation
    let explanation = ''
    const highlight = evidenceSnippet
    let confidence = 0.85

    if (recentAttempts.length > 0) {
      const lastAttempt = recentAttempts[recentAttempts.length - 1]
      const score = lastAttempt.score_pct || 0

      if (score < 70) {
        explanation = `Since you scored ${score}% on "${node?.title || nodeId}", this "${resource?.title || 'resource'}" provides foundational support to strengthen your understanding before advancing.`
        confidence = 0.90
      } else {
        explanation = `Great progress on "${node?.title || nodeId}" (${score}%)! This ${resource?.type || 'resource'} builds on that foundation and introduces more advanced concepts.`
        confidence = 0.88
      }
    } else {
      explanation = `This ${resource?.type || 'resource'} is recommended as an optimal starting point for "${node?.title || nodeId}" based on your learning profile and goals.`
      confidence = 0.75
    }

    // Add difficulty context
    if (resource?.difficulty) {
      explanation += ` The difficulty level (${resource.difficulty}) matches your current progress.`
    }

    // Store explanation in database for analytics
    await supabase.from('explanations').insert({
      user_id: userId,
      node_id: nodeId,
      resource_id: resourceId,
      explanation,
      confidence,
      created_at: new Date().toISOString()
    })

    return new Response(
      JSON.stringify({
        explanation,
        highlight,
        confidence,
        resource_title: resource?.title,
        node_title: node?.title,
        generated_at: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error('explain function error:', err)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})


