#!/bin/bash

# =====================================================
# AI API Integration Setup Script
# Sets up database, deploys functions, and configures API keys
# =====================================================

set -e

echo "🤖 LearnPathAI - AI API Integration Setup"
echo "=========================================="
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "   npm install -g supabase"
    exit 1
fi

echo "✅ Supabase CLI found"
echo ""

# Step 1: Database Migration
echo "📊 Step 1: Running database migrations..."
if [ -f "supabase/migrations/20250117_api_integration_tables.sql" ]; then
    supabase db push
    echo "✅ Database tables created successfully"
else
    echo "⚠️  Migration file not found. Please ensure you're in the project root."
fi
echo ""

# Step 2: Deploy Edge Function
echo "🚀 Step 2: Deploying Edge Function..."
if [ -d "supabase/functions/generate-learning-content" ]; then
    supabase functions deploy generate-learning-content
    echo "✅ Edge function deployed successfully"
else
    echo "⚠️  Edge function directory not found"
fi
echo ""

# Step 3: Set API Keys
echo "🔑 Step 3: Configure API Keys"
echo "----------------------------------------"
echo "Please provide your API keys (press Enter to skip):"
echo ""

# OpenAI
read -p "OpenAI API Key (sk-...): " OPENAI_KEY
if [ ! -z "$OPENAI_KEY" ]; then
    supabase secrets set OPENAI_API_KEY="$OPENAI_KEY"
    echo "✅ OpenAI key configured"
fi

# QuestGen
read -p "QuestGen API Key: " QUESTGEN_KEY
if [ ! -z "$QUESTGEN_KEY" ]; then
    supabase secrets set QUESTGEN_API_KEY="$QUESTGEN_KEY"
    echo "✅ QuestGen key configured"
fi

# QuizGecko
read -p "QuizGecko API Key: " QUIZGECKO_KEY
if [ ! -z "$QUIZGECKO_KEY" ]; then
    supabase secrets set QUIZGECKO_API_KEY="$QUIZGECKO_KEY"
    echo "✅ QuizGecko key configured"
fi

# Quillionz
read -p "Quillionz API Key (optional): " QUILLIONZ_KEY
if [ ! -z "$QUILLIONZ_KEY" ]; then
    supabase secrets set QUILLIONZ_API_KEY="$QUILLIONZ_KEY"
    echo "✅ Quillionz key configured"
fi

# OPEXAMS
read -p "OPEXAMS API Key (optional): " OPEXAMS_KEY
if [ ! -z "$OPEXAMS_KEY" ]; then
    supabase secrets set OPEXAMS_API_KEY="$OPEXAMS_KEY"
    echo "✅ OPEXAMS key configured"
fi

echo ""
echo "=========================================="
echo "✨ Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Test the integration:"
echo "   npm run test-ai-integration"
echo ""
echo "2. View the full guide:"
echo "   cat AI_API_INTEGRATION_GUIDE.md"
echo ""
echo "3. Check your Supabase dashboard:"
echo "   supabase functions list"
echo ""
echo "4. Monitor usage:"
echo "   SELECT * FROM api_usage_logs ORDER BY created_at DESC LIMIT 10;"
echo ""
echo "Happy generating! 🎉"

