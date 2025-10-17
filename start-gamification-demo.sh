#!/bin/bash

# LearnPath.AI Gamification Demo Startup Script
# This script starts both the backend and frontend for the gamification demo

echo "🎮 Starting LearnPath.AI Gamification Demo..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env exists in backend
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}⚠️  Warning: backend/.env not found${NC}"
    echo "Creating backend/.env with default settings..."
    cat > backend/.env << EOF
PORT=3001
# Add your Gemini API key here for AI challenge generation
# GEMINI_API_KEY=your_key_here
EOF
    echo -e "${GREEN}✓${NC} Created backend/.env (add GEMINI_API_KEY for AI features)"
    echo ""
fi

# Check if node_modules exist
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}📦 Installing frontend dependencies...${NC}"
    npm install
fi

if [ ! -d "backend/node_modules" ]; then
    echo -e "${BLUE}📦 Installing backend dependencies...${NC}"
    cd backend && npm install && cd ..
fi

# Kill any existing processes on ports 3001 and 5173
echo -e "${BLUE}🧹 Cleaning up existing processes...${NC}"
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true

# Start backend in background
echo -e "${BLUE}🚀 Starting backend on http://localhost:3001...${NC}"
cd backend
npm start > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait for backend to be ready
echo -e "${YELLOW}⏳ Waiting for backend to start...${NC}"
sleep 3

# Check if backend is running
if curl -s http://localhost:3001/ > /dev/null; then
    echo -e "${GREEN}✓${NC} Backend is running!"
else
    echo -e "${YELLOW}⚠️  Backend might not be ready yet (this is normal)${NC}"
fi

# Start frontend in background
echo -e "${BLUE}🚀 Starting frontend on http://localhost:5173...${NC}"
npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!

# Wait for frontend to be ready
echo -e "${YELLOW}⏳ Waiting for frontend to start...${NC}"
sleep 5

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✓ Gamification Demo is ready!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}🌐 URLs:${NC}"
echo -e "   Frontend:       ${GREEN}http://localhost:5173${NC}"
echo -e "   Gamification:   ${GREEN}http://localhost:5173/gamification-demo${NC}"
echo -e "   Backend API:    ${GREEN}http://localhost:3001${NC}"
echo ""
echo -e "${BLUE}📋 Quick Actions:${NC}"
echo "   • View XP & Levels"
echo "   • Try AI Challenges"
echo "   • Unlock Badges"
echo "   • Check Leaderboard"
echo ""
echo -e "${YELLOW}🎯 Demo Tips:${NC}"
echo "   • Click 'Demo: Earn +25 XP' to see animations"
echo "   • Try completing an AI challenge"
echo "   • Check the badges page for achievements"
echo "   • View the leaderboard for rankings"
echo ""
echo -e "${BLUE}📝 Logs:${NC}"
echo "   Backend:  tail -f backend.log"
echo "   Frontend: tail -f frontend.log"
echo ""
echo -e "${YELLOW}⚠️  Note:${NC} AI challenges require a GEMINI_API_KEY in backend/.env"
echo "   Without it, the system will use fallback challenge templates"
echo ""
echo -e "${BLUE}🛑 To stop:${NC}"
echo "   Press Ctrl+C or run: kill $BACKEND_PID $FRONTEND_PID"
echo ""

# Open browser (macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo -e "${BLUE}🌐 Opening browser...${NC}"
    sleep 2
    open http://localhost:5173/gamification-demo
fi

# Keep script running and show logs
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📊 Live Logs (Ctrl+C to stop):${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Shutting down...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}✓ Demo stopped${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Show combined logs
tail -f frontend.log backend.log 2>/dev/null &
wait

