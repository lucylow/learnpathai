#!/bin/bash
# Setup AI Features - One-command setup

echo "🚀 Setting up AI Features for LearnPathAI..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the LearnPathAI root directory"
    exit 1
fi

echo "${BLUE}Step 1/4:${NC} Installing dependencies..."
npm install
echo "${GREEN}✓${NC} Dependencies installed"
echo ""

echo "${BLUE}Step 2/4:${NC} Setting up backend..."
cd backend
npm install
cd ..
echo "${GREEN}✓${NC} Backend dependencies installed"
echo ""

echo "${BLUE}Step 3/4:${NC} Checking environment variables..."
if [ ! -f ".env" ]; then
    echo "${YELLOW}⚠${NC}  No .env file found. Creating template..."
    cat > .env << 'EOF'
# Backend
VITE_BACKEND_URL=http://localhost:3000

# Supabase (add your values)
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Optional: Real AI Services (for production)
# OPENAI_API_KEY=your_openai_key_here
# HF_API_KEY=your_huggingface_key_here
EOF
    echo "${YELLOW}⚠${NC}  Created .env template. Please update with your Supabase credentials."
else
    echo "${GREEN}✓${NC} .env file exists"
fi
echo ""

echo "${BLUE}Step 4/4:${NC} Making scripts executable..."
chmod +x test-ai-features.sh
chmod +x setup-ai-features.sh
echo "${GREEN}✓${NC} Scripts are executable"
echo ""

echo "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "${GREEN}✨ Setup Complete!${NC}"
echo "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📚 Next Steps:"
echo ""
echo "1. ${BLUE}Start the backend:${NC}"
echo "   cd backend && npm start"
echo ""
echo "2. ${BLUE}Start the frontend (in a new terminal):${NC}"
echo "   npm run dev"
echo ""
echo "3. ${BLUE}View the demo:${NC}"
echo "   Open http://localhost:5173/ai-features-demo"
echo ""
echo "4. ${BLUE}Test the APIs:${NC}"
echo "   ./test-ai-features.sh"
echo ""
echo "📖 Documentation:"
echo "   • AI_FEATURES_QUICKSTART.md - Quick start guide"
echo "   • AI_INTEGRATIONS_GUIDE.md - Complete documentation"
echo "   • AI_IMPLEMENTATION_SUMMARY.md - What was built"
echo ""
echo "${GREEN}🎉 Happy coding!${NC}"


