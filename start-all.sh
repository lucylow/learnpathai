#!/bin/bash

# LearnPath AI - Start All Services
# This script starts the AI service, backend, and frontend in separate terminal tabs/windows

echo "🚀 Starting LearnPath AI Services..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running on macOS (for terminal splitting)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "${BLUE}Starting services in separate Terminal tabs...${NC}"
    
    # Start AI Service
    osascript -e 'tell application "Terminal" to do script "cd '"$(pwd)"'/ai-service && echo \"🤖 Starting AI Service...\" && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt && python kt_service.py"'
    
    # Wait a bit for AI service to start
    sleep 3
    
    # Start Backend
    osascript -e 'tell application "Terminal" to do script "cd '"$(pwd)"'/backend && echo \"⚙️  Starting Backend API...\" && npm install && npm run dev"'
    
    # Wait a bit for backend to start
    sleep 3
    
    # Start Frontend
    osascript -e 'tell application "Terminal" to do script "cd '"$(pwd)"' && echo \"🎨 Starting Frontend...\" && npm install && npm run dev"'
    
    echo "${GREEN}✅ All services are starting!${NC}"
    echo ""
    echo "${YELLOW}Services will be available at:${NC}"
    echo "  • AI Service (FastAPI):  http://localhost:8001"
    echo "  • Backend API:           http://localhost:3001"
    echo "  • Frontend:              http://localhost:5173"
    echo ""
    echo "${YELLOW}API Documentation:${NC}"
    echo "  • FastAPI Docs:          http://localhost:8001/docs"
    echo ""
else
    echo "${YELLOW}Manual setup required (not macOS)${NC}"
    echo ""
    echo "Please open 3 terminal windows and run:"
    echo ""
    echo "${BLUE}Terminal 1 - AI Service:${NC}"
    echo "  cd ai-service"
    echo "  python -m venv venv"
    echo "  source venv/bin/activate"
    echo "  pip install -r requirements.txt"
    echo "  python kt_service.py"
    echo ""
    echo "${BLUE}Terminal 2 - Backend:${NC}"
    echo "  cd backend"
    echo "  npm install"
    echo "  npm run dev"
    echo ""
    echo "${BLUE}Terminal 3 - Frontend:${NC}"
    echo "  npm install"
    echo "  npm run dev"
    echo ""
fi

