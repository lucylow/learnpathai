#!/bin/bash

# LearnPath AI - Start Production AI Workflows
# This script starts all AI workflow components

set -e

echo "🚀 Starting LearnPath AI Production Workflows..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+."
    exit 1
fi

# Check if Node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+."
    exit 1
fi

echo -e "${BLUE}📦 Installing Python dependencies...${NC}"
cd ai-service
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "✅ Created Python virtual environment"
fi

source venv/bin/activate
pip install -q fastapi uvicorn pydantic numpy scipy networkx

echo -e "${GREEN}✅ Python dependencies installed${NC}"
echo ""

echo -e "${BLUE}🐍 Starting FastAPI Backend (Port 8001)...${NC}"
python production_api.py &
BACKEND_PID=$!
echo -e "${GREEN}✅ Backend started (PID: $BACKEND_PID)${NC}"
echo ""

# Wait for backend to be ready
echo -e "${YELLOW}⏳ Waiting for backend to be ready...${NC}"
sleep 3

# Check backend health
if curl -s http://localhost:8001/health > /dev/null; then
    echo -e "${GREEN}✅ Backend is healthy${NC}"
else
    echo -e "${YELLOW}⚠️  Backend health check failed, but continuing...${NC}"
fi

echo ""
echo -e "${BLUE}🎨 Starting Frontend (Port 8080)...${NC}"
cd ..
if [ ! -d "node_modules" ]; then
    echo "Installing Node dependencies..."
    npm install
fi

npm run dev &
FRONTEND_PID=$!
echo -e "${GREEN}✅ Frontend started (PID: $FRONTEND_PID)${NC}"
echo ""

# Create PID file for cleanup
echo "$BACKEND_PID,$FRONTEND_PID" > .ai-workflows.pid

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 LearnPath AI Production Workflows Started!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Services:"
echo "  • Frontend:     http://localhost:8080"
echo "  • Backend API:  http://localhost:8001"
echo "  • API Docs:     http://localhost:8001/docs"
echo "  • Health Check: http://localhost:8001/health"
echo ""
echo "🧠 AI Components:"
echo "  ✓ BKT-IRT Hybrid Model"
echo "  ✓ Performance Predictor"
echo "  ✓ Knowledge Graph"
echo "  ✓ Multi-Armed Bandit"
echo "  ✓ Content Analyzer"
echo "  ✓ Adaptation Engine"
echo ""
echo "📚 Documentation:"
echo "  • See AI_WORKFLOWS_PRODUCTION.md for details"
echo ""
echo "⏱️  Target Response Time: <500ms"
echo ""
echo "To stop services: ./stop-ai-workflows.sh"
echo "Or press Ctrl+C"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Wait for Ctrl+C
trap 'echo ""; echo "🛑 Shutting down..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; rm -f .ai-workflows.pid; echo "✅ Services stopped"; exit 0' INT

# Keep script running
wait

