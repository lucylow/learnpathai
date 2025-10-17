// backend/services/openaiService.js
const OpenAI = require("openai");
const pino = require("pino");
const logger = pino();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * generateExplanation - LLM call that returns a short explanation
 * of why a resource is recommended + supporting evidence + next action
 * 
 * @param {Object} params
 * @param {Object} params.masteryMap - Student's current mastery levels
 * @param {string} params.resourceTitle - Title of the recommended resource
 * @param {string} params.resourceSnippet - Short excerpt from the resource
 * @returns {Promise<{reason: string, evidence: string, next_step: string}>}
 */
async function generateExplanation({ masteryMap, resourceTitle, resourceSnippet }) {
  try {
    const prompt = `
You are LearnPath AI assistant. Given the student's mastery map and a candidate resource, 
produce a 1-sentence explanation of why the resource helps and a 1-line next action.

Student Mastery: ${JSON.stringify(masteryMap)}
Resource: ${resourceTitle}
Snippet: ${resourceSnippet}

Output as JSON:
{
  "reason": "<one sentence explaining why this resource matches student needs>",
  "evidence": "<short quoted excerpt from snippet that supports the recommendation>",
  "next_step": "<one-sentence action for the student>"
}
    `.trim();

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Cost-effective model; use gpt-4 for higher quality
      messages: [
        { role: "system", content: "You are concise and factual. Always respond with valid JSON." },
        { role: "user", content: prompt }
      ],
      max_tokens: 200,
      temperature: 0.2, // Low temperature for deterministic outputs
    });

    const text = response.choices[0].message.content.trim();
    
    // Parse JSON response
    try {
      return JSON.parse(text);
    } catch (parseError) {
      // Fallback: attempt to extract JSON substring
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        return JSON.parse(match[0]);
      }
      // Final fallback: return text as reason
      logger.warn("Failed to parse OpenAI response as JSON:", text);
      return { 
        reason: text.slice(0, 200), 
        evidence: "", 
        next_step: "Review the resource and practice the concepts." 
      };
    }
  } catch (error) {
    logger.error("OpenAI generateExplanation error:", error);
    throw new Error(`OpenAI API error: ${error.message}`);
  }
}

/**
 * generateQuiz - Generate multiple-choice questions for a concept
 * 
 * @param {Object} params
 * @param {string} params.concept - The concept/topic to generate questions for
 * @param {string} params.difficulty - Difficulty level (beginner, intermediate, advanced)
 * @returns {Promise<Array<{id: string, question: string, options: string[], correctIndex: number, explanation: string}>>}
 */
async function generateQuiz({ concept, difficulty = "beginner" }) {
  try {
    const prompt = `
Generate 3 multiple-choice questions for the concept "${concept}" at difficulty level "${difficulty}".

Return a JSON array where each question has:
- id: unique identifier
- question: the question text
- options: array of 4 possible answers
- correctIndex: index (0-3) of the correct answer
- explanation: brief explanation of why the answer is correct

Example format:
[
  {
    "id": "q1",
    "question": "What is photosynthesis?",
    "options": ["Process plants use to make food", "Animal respiration", "Cell division", "Water cycle"],
    "correctIndex": 0,
    "explanation": "Photosynthesis is the process by which plants convert light energy into chemical energy."
  }
]

Return ONLY the JSON array, no other text.
    `.trim();

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an expert educator. Return only valid JSON arrays." },
        { role: "user", content: prompt }
      ],
      max_tokens: 500,
      temperature: 0.7, // Higher temperature for variety in questions
    });

    const text = response.choices[0].message.content.trim();
    
    try {
      return JSON.parse(text);
    } catch (parseError) {
      // Try to extract JSON array
      const match = text.match(/\[([\s\S]*)\]/);
      if (match) {
        return JSON.parse(`[${match[1]}]`);
      }
      logger.warn("Failed to parse quiz response:", text);
      return [];
    }
  } catch (error) {
    logger.error("OpenAI generateQuiz error:", error);
    throw new Error(`OpenAI API error: ${error.message}`);
  }
}

/**
 * generateEmbeddings - Create vector embeddings for text (for RAG/semantic search)
 * 
 * @param {string} text - Text to embed
 * @returns {Promise<number[]>} - Embedding vector
 */
async function generateEmbeddings(text) {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small", // Cost-effective embedding model
      input: text,
    });
    
    return response.data[0].embedding;
  } catch (error) {
    logger.error("OpenAI embeddings error:", error);
    throw new Error(`OpenAI API error: ${error.message}`);
  }
}

/**
 * generatePersonalizedPath - Generate a learning path recommendation using GPT
 * 
 * @param {Object} params
 * @param {string} params.goal - Student's learning goal
 * @param {Object} params.masteryMap - Current mastery levels
 * @param {Array} params.availableResources - Available resources
 * @returns {Promise<Array>} - Recommended learning path
 */
async function generatePersonalizedPath({ goal, masteryMap, availableResources }) {
  try {
    const prompt = `
You are LearnPath AI. Create a personalized learning path for a student.

Goal: ${goal}
Current Mastery: ${JSON.stringify(masteryMap)}
Available Resources: ${JSON.stringify(availableResources.slice(0, 10))} (showing first 10)

Return a JSON array of recommended resources in order, with reasoning:
[
  {
    "resource_id": "...",
    "title": "...",
    "reason": "why this resource is next",
    "estimated_time": "e.g. 30 minutes"
  }
]
    `.trim();

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an expert learning path designer. Return only valid JSON." },
        { role: "user", content: prompt }
      ],
      max_tokens: 600,
      temperature: 0.5,
    });

    const text = response.choices[0].message.content.trim();
    const match = text.match(/\[([\s\S]*)\]/);
    if (match) {
      return JSON.parse(`[${match[1]}]`);
    }
    return JSON.parse(text);
  } catch (error) {
    logger.error("OpenAI generatePersonalizedPath error:", error);
    throw new Error(`OpenAI API error: ${error.message}`);
  }
}

module.exports = { 
  generateExplanation, 
  generateQuiz, 
  generateEmbeddings,
  generatePersonalizedPath 
};

