#!/bin/bash

# Stop LearnPath AI Production Workflows

echo "🛑 Stopping LearnPath AI Production Workflows..."

if [ -f .ai-workflows.pid ]; then
    PIDS=$(cat .ai-workflows.pid)
    IFS=',' read -ra PID_ARRAY <<< "$PIDS"
    
    for PID in "${PID_ARRAY[@]}"; do
        if kill -0 $PID 2>/dev/null; then
            echo "Stopping process $PID..."
            kill $PID
        fi
    done
    
    rm .ai-workflows.pid
    echo "✅ Services stopped"
else
    echo "⚠️  No PID file found. Services may not be running."
    echo "Attempting to kill by port..."
    
    # Try to kill by port
    lsof -ti:8001 | xargs kill -9 2>/dev/null || true
    lsof -ti:8080 | xargs kill -9 2>/dev/null || true
    
    echo "✅ Cleanup complete"
fi

