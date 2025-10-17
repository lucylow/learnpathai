#!/bin/bash
# Setup script for Personalized Learning Pathway Generator

echo "🚀 Setting up Personalized Learning Pathway Generator..."
echo ""

# Navigate to backend directory
cd "$(dirname "$0")"

echo "📦 Installing dependencies..."
npm install

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎯 Quick Start:"
echo ""
echo "1. Run the demo:"
echo "   node -r ts-node/register generator/demo.ts"
echo ""
echo "2. Start the backend server:"
echo "   npm run dev"
echo ""
echo "3. Test the API:"
echo "   curl http://localhost:4000/api/learning-path/status"
echo ""
echo "📚 Documentation:"
echo "   - Full docs: backend/generator/README.md"
echo "   - Quick start: backend/generator/QUICKSTART.md"
echo "   - Implementation summary: ../PATHWAY_GENERATOR_IMPLEMENTATION.md"
echo ""
echo "Happy learning! 🎓✨"

