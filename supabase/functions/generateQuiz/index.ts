/**
 * Supabase Edge Function: Generate Quiz
 * Generates quiz questions for a concept or topic
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface QuizRequest {
  concept: string
  excerpt?: string
  difficulty?: 'easy' | 'medium' | 'hard'
  numQuestions?: number
  userId?: string
}

interface QuizQuestion {
  question: string
  options: string[]
  correct: string
  explanation: string
}

// Mock quiz templates - in production, replace with AI generation
const quizTemplates: Record<string, QuizQuestion[]> = {
  recursion: [
    {
      question: 'What is the role of the base case in recursion?',
      options: ['To stop the recursion', 'To propagate arguments', 'To call other functions', 'To increase recursion depth'],
      correct: 'To stop the recursion',
      explanation: 'The base case ensures that recursion terminates and prevents infinite loops.'
    },
    {
      question: 'If a recursive function has no base case, what happens?',
      options: ['It will run exactly once', 'It will never terminate', 'It throws a syntax error', 'It returns None'],
      correct: 'It will never terminate',
      explanation: 'Without a base case, the recursive calls continue infinitely, leading to a stack overflow.'
    },
    {
      question: 'Which of the following demonstrates mutual recursion?',
      options: ['Two or more functions calling each other', 'A function calling itself once', 'A loop calling a function', 'A function with multiple return statements'],
      correct: 'Two or more functions calling each other',
      explanation: 'Mutual recursion occurs when functions call each other in a circular pattern.'
    }
  ],
  loops: [
    {
      question: 'What does a for loop do in Python?',
      options: ['Iterates over a sequence', 'Creates a function', 'Defines a class', 'Imports a module'],
      correct: 'Iterates over a sequence',
      explanation: 'For loops iterate over sequences like lists, tuples, or strings.'
    },
    {
      question: 'Which keyword exits a loop immediately?',
      options: ['break', 'continue', 'pass', 'return'],
      correct: 'break',
      explanation: 'The break statement terminates the loop immediately and continues with the next statement.'
    }
  ],
  variables: [
    {
      question: 'What is a variable in programming?',
      options: ['A named storage location', 'A function', 'A loop', 'A class'],
      correct: 'A named storage location',
      explanation: 'A variable is a container that stores data values and can be referenced by name.'
    }
  ]
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { concept, excerpt = '', difficulty = 'medium', numQuestions = 2, userId }: QuizRequest = await req.json()

    if (!concept) {
      return new Response(
        JSON.stringify({ error: 'concept is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Find relevant questions based on concept
    const conceptLower = concept.toLowerCase()
    let questions: QuizQuestion[] = []

    for (const [key, value] of Object.entries(quizTemplates)) {
      if (conceptLower.includes(key)) {
        questions = value
        break
      }
    }

    // If no match, generate generic questions
    if (questions.length === 0) {
      questions = [
        {
          question: `What is the main principle behind ${concept}?`,
          options: [
            'It is a fundamental concept',
            'It is an advanced technique',
            'It is rarely used in practice',
            'It is deprecated'
          ],
          correct: 'It is a fundamental concept',
          explanation: `${concept} is an important concept in computer science and software development.`
        },
        {
          question: `When should you use ${concept}?`,
          options: [
            'When solving the specific problem it addresses',
            'In every program',
            'Only in advanced applications',
            'Never'
          ],
          correct: 'When solving the specific problem it addresses',
          explanation: `${concept} is best applied when it provides a clear solution to the problem at hand.`
        }
      ]
    }

    // Limit to requested number
    const selectedQuestions = questions.slice(0, numQuestions)

    // Add IDs to questions
    const quizQuestions = selectedQuestions.map((q, idx) => ({
      qid: `q${idx + 1}`,
      ...q
    }))

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Store quiz generation in database for analytics
    if (userId) {
      await supabase.from('quiz_generations').insert({
        user_id: userId,
        concept,
        difficulty,
        num_questions: numQuestions,
        created_at: new Date().toISOString()
      })
    }

    return new Response(
      JSON.stringify({
        concept,
        difficulty,
        quiz: quizQuestions,
        generated_at: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error('generateQuiz error:', err)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})


