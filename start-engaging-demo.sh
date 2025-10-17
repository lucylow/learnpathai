#!/bin/bash

# 🎮 Start Engaging Education Demo
# This script starts both backend and frontend for the engaging education features

echo "🚀 Starting Engaging Education Demo..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if node_modules exist
if [ ! -d "node_modules" ]; then
    echo "${YELLOW}⚠️  Installing frontend dependencies...${NC}"
    npm install
fi

if [ ! -d "backend/node_modules" ]; then
    echo "${YELLOW}⚠️  Installing backend dependencies...${NC}"
    cd backend && npm install && cd ..
fi

echo ""
echo "${GREEN}✅ Dependencies ready!${NC}"
echo ""
echo "${BLUE}Starting services...${NC}"
echo ""
echo "📍 Backend will run on:  http://localhost:5000"
echo "📍 Frontend will run on: http://localhost:5173"
echo ""
echo "🎮 Demo page: http://localhost:5173/engaging-demo"
echo ""
echo "${YELLOW}Press Ctrl+C to stop both services${NC}"
echo ""
echo "────────────────────────────────────────"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo ""
    echo "🛑 Stopping services..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    echo "✅ Cleanup complete"
    exit 0
}

# Trap Ctrl+C and call cleanup
trap cleanup INT TERM

# Start backend in background
cd backend
npm start &
BACKEND_PID=$!
cd ..

# Wait a bit for backend to start
sleep 3

# Start frontend in background
npm run dev &
FRONTEND_PID=$!

# Wait for both processes
wait


