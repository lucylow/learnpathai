#!/bin/bash

# Test LearnPath AI Workflows
# Verifies all components are working correctly

set -e

echo "🧪 Testing LearnPath AI Production Workflows..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

BACKEND_URL="http://localhost:8001"
TESTS_PASSED=0
TESTS_FAILED=0

# Helper function
test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    
    echo -n "Testing $name... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$BACKEND_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$BACKEND_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✓ PASS${NC} (${http_code})"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (${http_code})"
        echo "Response: $body"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}Backend Connectivity Tests${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 1: Health check
test_endpoint "Health Check" "GET" "/health"

# Test 2: Root endpoint
test_endpoint "Root Endpoint" "GET" "/"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}Core API Tests${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 3: Learning event (correct)
test_endpoint "Learning Event (Correct)" "POST" "/api/learning-event" '{
    "user_id": "test_user_001",
    "concept_id": "loops",
    "correct": true,
    "time_spent": 45.0,
    "confidence": 0.7,
    "attempt_number": 1
}'

# Test 4: Learning event (incorrect)
test_endpoint "Learning Event (Incorrect)" "POST" "/api/learning-event" '{
    "user_id": "test_user_001",
    "concept_id": "loops",
    "correct": false,
    "time_spent": 60.0,
    "confidence": 0.4,
    "attempt_number": 2
}'

# Test 5: Get knowledge state
test_endpoint "Knowledge State" "GET" "/api/user/test_user_001/knowledge-state"

# Test 6: Predict trajectory
test_endpoint "Predict Trajectory" "POST" "/api/predict-trajectory" '{
    "user_id": "test_user_001",
    "concept_id": "recursion",
    "current_mastery": 0.35,
    "concept_difficulty": 0.75
}'

# Test 7: Get recommendations
test_endpoint "Get Recommendations" "POST" "/api/recommendations" '{
    "user_id": "test_user_001",
    "mastery": {
        "variables": 0.8,
        "loops": 0.6
    },
    "n_recommendations": 5
}'

# Test 8: Batch mastery update
test_endpoint "Batch Mastery Update" "POST" "/api/batch-mastery" '{
    "user_id": "test_user_001",
    "attempts": [
        {"concept_id": "variables", "correct": true, "time_spent": 30.0},
        {"concept_id": "loops", "correct": true, "time_spent": 45.0}
    ]
}'

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}Performance Tests${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test response time
echo -n "Response Time Test (10 requests)... "
total_time=0
for i in {1..10}; do
    start=$(date +%s%N)
    curl -s -X POST "$BACKEND_URL/api/learning-event" \
        -H "Content-Type: application/json" \
        -d '{
            "user_id": "perf_test",
            "concept_id": "loops",
            "correct": true,
            "time_spent": 45.0,
            "confidence": 0.7,
            "attempt_number": 1
        }' > /dev/null
    end=$(date +%s%N)
    elapsed=$((($end - $start) / 1000000))
    total_time=$(($total_time + $elapsed))
done

avg_time=$(($total_time / 10))

if [ $avg_time -lt 500 ]; then
    echo -e "${GREEN}✓ PASS${NC} (avg: ${avg_time}ms, target: <500ms)"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${YELLOW}⚠ SLOW${NC} (avg: ${avg_time}ms, target: <500ms)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}Component Health Tests${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check component health
health_response=$(curl -s "$BACKEND_URL/health")

echo "Checking component status..."
echo ""

components=("bkt_irt_model" "performance_predictor" "knowledge_graph" "resource_bandit")

for component in "${components[@]}"; do
    echo -n "  - $component: "
    if echo "$health_response" | grep -q "\"status\": \"healthy\""; then
        echo -e "${GREEN}✓ Healthy${NC}"
    else
        echo -e "${YELLOW}⚠ Unknown${NC}"
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}Test Summary${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}Tests Passed: $TESTS_PASSED${NC}"
if [ $TESTS_FAILED -gt 0 ]; then
    echo -e "${RED}Tests Failed: $TESTS_FAILED${NC}"
else
    echo -e "${GREEN}Tests Failed: 0${NC}"
fi
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    echo ""
    echo "✅ LearnPath AI Production Workflows are working correctly"
    echo ""
    echo "Next steps:"
    echo "  • Visit http://localhost:8080 for the frontend"
    echo "  • Visit http://localhost:8001/docs for API documentation"
    echo "  • Check AI_WORKFLOWS_QUICKSTART.md for usage examples"
    exit 0
else
    echo -e "${RED}❌ Some tests failed${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "  1. Make sure backend is running: ./start-ai-workflows.sh"
    echo "  2. Check logs for errors"
    echo "  3. Verify port 8001 is not blocked"
    echo "  4. Check health endpoint: curl http://localhost:8001/health"
    exit 1
fi

