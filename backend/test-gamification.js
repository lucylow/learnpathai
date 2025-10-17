// Quick test script for gamification endpoints
// Run with: node test-gamification.js

const BASE_URL = 'http://localhost:3001';

async function testEndpoint(name, method, endpoint, body = null) {
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();
    
    console.log(`✅ ${name}: ${response.ok ? 'PASS' : 'FAIL'}`);
    if (!response.ok) {
      console.log(`   Error: ${JSON.stringify(data)}`);
    }
    return response.ok;
  } catch (error) {
    console.log(`❌ ${name}: ERROR - ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('🎮 Testing Gamification API Endpoints\n');
  console.log('Make sure backend is running on http://localhost:3001\n');
  
  const testUserId = 'test_user_' + Date.now();
  let passCount = 0;
  let totalTests = 0;
  
  // Test 1: Award XP
  totalTests++;
  if (await testEndpoint(
    'Award XP',
    'POST',
    '/api/gamify/award-xp',
    { userId: testUserId, xp: 25, source: 'test' }
  )) passCount++;
  
  // Test 2: Get Progress
  totalTests++;
  if (await testEndpoint(
    'Get Progress',
    'GET',
    `/api/gamify/progress/${testUserId}`
  )) passCount++;
  
  // Test 3: Get Stats
  totalTests++;
  if (await testEndpoint(
    'Get Stats',
    'GET',
    `/api/gamify/stats/${testUserId}`
  )) passCount++;
  
  // Test 4: Award XP Enhanced
  totalTests++;
  if (await testEndpoint(
    'Award XP Enhanced',
    'POST',
    '/api/gamify/award-xp-enhanced',
    {
      userId: testUserId,
      activity: 'challenge_completed',
      performance: { accuracy: 0.95 },
      context: { firstAttempt: true }
    }
  )) passCount++;
  
  // Test 5: Generate Challenge
  totalTests++;
  if (await testEndpoint(
    'Generate Challenge',
    'POST',
    '/api/gamify/generate-challenge',
    { concept: 'python_loops', difficulty: 'beginner' }
  )) passCount++;
  
  // Test 6: Get Available Badges
  totalTests++;
  if (await testEndpoint(
    'Get Available Badges',
    'GET',
    '/api/gamify/badges/available'
  )) passCount++;
  
  // Test 7: Get User Badges
  totalTests++;
  if (await testEndpoint(
    'Get User Badges',
    'GET',
    `/api/gamify/badges/${testUserId}`
  )) passCount++;
  
  // Test 8: Get Leaderboard
  totalTests++;
  if (await testEndpoint(
    'Get Leaderboard',
    'GET',
    '/api/gamify/leaderboard?limit=5'
  )) passCount++;
  
  // Test 9: Check Badge Eligibility
  totalTests++;
  if (await testEndpoint(
    'Check Badge Eligibility',
    'POST',
    '/api/gamify/badges/check-eligibility',
    { userId: testUserId, stats: {} }
  )) passCount++;
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log(`📊 Test Results: ${passCount}/${totalTests} passed`);
  
  if (passCount === totalTests) {
    console.log('🎉 All tests passed! Gamification API is working correctly.');
  } else {
    console.log(`⚠️  ${totalTests - passCount} test(s) failed. Check the errors above.`);
  }
  
  console.log('='.repeat(50) + '\n');
}

// Check if backend is running first
fetch(`${BASE_URL}/`)
  .then(() => {
    console.log('✅ Backend is running\n');
    runTests();
  })
  .catch(() => {
    console.log('❌ Backend is not running!');
    console.log('Please start the backend with: cd backend && npm start\n');
    process.exit(1);
  });

