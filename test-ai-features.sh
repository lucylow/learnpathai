#!/bin/bash
# Test AI Features Script
# Quickly test all mock AI API endpoints

echo "🧪 Testing LearnPathAI Mock AI APIs..."
echo ""

BACKEND_URL="http://localhost:3000"

echo "1️⃣  Testing Quiz Generator..."
curl -s -X POST "${BACKEND_URL}/api/mock-external/quiz/generate" \
  -H "Content-Type: application/json" \
  -d '{"topic":"Recursion","difficulty":"medium","num_questions":2}' | jq .
echo ""

echo "2️⃣  Testing Explanation Generator..."
curl -s -X POST "${BACKEND_URL}/api/mock-external/explain" \
  -H "Content-Type: application/json" \
  -d '{"user_id":"test-user","node_id":"node-1","resource_id":"resource-1","recent_attempts":[{"node_id":"node-0","score_pct":65,"hints_used":1}]}' | jq .
echo ""

echo "3️⃣  Testing Text-to-Speech..."
curl -s -X POST "${BACKEND_URL}/api/mock-external/tts/synthesize" \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello world","voice":"en-US","speed":1.0}' | jq .
echo ""

echo "4️⃣  Testing Semantic Search..."
curl -s -X POST "${BACKEND_URL}/api/mock-external/semantic/search" \
  -H "Content-Type: application/json" \
  -d '{"query":"recursion tutorial","top_k":3}' | jq .
echo ""

echo "5️⃣  Testing Tatoeba (Example Sentences)..."
curl -s "${BACKEND_URL}/api/mock-external/tatoeba?word=apple&lang_from=en&lang_to=fr" | jq .
echo ""

echo "6️⃣  Testing Embeddings Generator..."
curl -s -X POST "${BACKEND_URL}/api/mock-external/embeddings/generate" \
  -H "Content-Type: application/json" \
  -d '{"text":"test embedding","model":"gte-small"}' | jq . | head -20
echo "... (embedding truncated)"
echo ""

echo "✅ All tests complete!"
echo ""
echo "💡 Tip: Add this route to your app to see the demo UI:"
echo "   /ai-features-demo"


