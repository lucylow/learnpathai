#!/bin/bash

# Start Judge Demo Script
# Launches all necessary services for the hackathon demo

echo "🚀 Starting LearnPath.AI Judge Demo..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if in correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "${BLUE}📦 Installing dependencies...${NC}"
npm install

echo ""
echo "${GREEN}✅ Starting Frontend (http://localhost:5173/judge-demo)${NC}"
echo "${BLUE}   → Open browser to: http://localhost:5173/judge-demo${NC}"
echo ""

# Start frontend in development mode
npm run dev &
FRONTEND_PID=$!

# Wait a bit for frontend to start
sleep 3

echo ""
echo "${GREEN}✅ Frontend started!${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🎯 DEMO READY: http://localhost:5173/judge-demo"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Demo Features:"
echo "  1️⃣  Animated Path Recalculation"
echo "  2️⃣  Explainable Recommendations"
echo "  3️⃣  Live Evidence Panel"
echo "  4️⃣  Outcome-Aware Ranking"
echo ""
echo "📖 See JUDGE_DEMO_GUIDE.md for demo script"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for user to stop
wait $FRONTEND_PID


