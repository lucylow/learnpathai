import React, { useState, useEffect } from 'react';
import XPProgressBar from '../components/gamification/XPProgressBar';
import BadgeCollection from '../components/gamification/BadgeCollection';
import AIChallenge from '../components/gamification/AIChallenge';
import Leaderboard from '../components/gamification/Leaderboard';
import { motion } from 'framer-motion';

const GamificationDemo = () => {
  const [currentView, setCurrentView] = useState('overview');
  const [demoUserId, setDemoUserId] = useState('demo_user_123');
  const [todayStats, setTodayStats] = useState({
    xpEarned: 0,
    challengesCompleted: 0,
    learningTime: 0
  });

  useEffect(() => {
    // Initialize demo user if needed
    initializeDemoUser();
  }, []);

  const initializeDemoUser = async () => {
    try {
      // Award some initial XP to make the demo more interesting
      await fetch('http://localhost:3001/api/gamify/award-xp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: demoUserId,
          xp: 150,
          source: 'demo_initialization',
          metadata: { initialized: true }
        })
      });

      // Fetch current stats
      const statsResponse = await fetch(`http://localhost:3001/api/gamify/stats/${demoUserId}`);
      const statsData = await statsResponse.json();
      
      if (statsData.success) {
        setTodayStats({
          xpEarned: statsData.stats.xpToday || 0,
          challengesCompleted: statsData.stats.activitiesCompleted || 0,
          learningTime: 0
        });
      }
    } catch (error) {
      console.error('Failed to initialize demo user:', error);
    }
  };

  const handleChallengeComplete = (result: { success: boolean; xp: number; timeSpent: number }) => {
    if (result.success) {
      setTodayStats(prev => ({
        ...prev,
        xpEarned: prev.xpEarned + result.xp,
        challengesCompleted: prev.challengesCompleted + 1,
        learningTime: prev.learningTime + Math.round(result.timeSpent / 60)
      }));
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊', description: 'See your progress' },
    { id: 'challenges', label: 'AI Challenges', icon: '⚡', description: 'Test your skills' },
    { id: 'badges', label: 'Badges', icon: '🏆', description: 'Your achievements' },
    { id: 'leaderboard', label: 'Leaderboard', icon: '📈', description: 'Compete with peers' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            🎮 LearnPath.AI Gamification
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Making learning fun, engaging, and rewarding with AI-powered challenges
          </p>
          <p className="text-sm text-gray-500">
            Demo User ID: {demoUserId}
          </p>
          
          {/* Quick Stats Banner */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto"
          >
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="text-3xl font-bold text-blue-600">{todayStats.xpEarned}</div>
              <div className="text-sm text-gray-600">XP Earned Today</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="text-3xl font-bold text-green-600">{todayStats.challengesCompleted}</div>
              <div className="text-sm text-gray-600">Challenges Completed</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="text-3xl font-bold text-purple-600">{todayStats.learningTime}</div>
              <div className="text-sm text-gray-600">Learning Minutes</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap gap-3 justify-center mb-8"
        >
          {tabs.map((tab, index) => (
            <motion.button
              key={tab.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              onClick={() => setCurrentView(tab.id)}
              className={`group flex flex-col items-center gap-1 px-6 py-3 rounded-lg transition-all ${
                currentView === tab.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">{tab.icon}</span>
                <span className="font-semibold">{tab.label}</span>
              </div>
              <span className={`text-xs ${
                currentView === tab.id ? 'text-white opacity-90' : 'text-gray-500'
              }`}>
                {tab.description}
              </span>
            </motion.button>
          ))}
        </motion.div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Always Visible */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-1 space-y-4"
          >
            <XPProgressBar 
              userId={demoUserId} 
              onLevelUp={(level) => {
                console.log('Level up to', level);
                // Could show a modal or celebration here
              }}
            />
            
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setCurrentView('challenges')}
                  className="w-full text-left px-3 py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors text-sm"
                >
                  ⚡ Start New Challenge
                </button>
                <button
                  onClick={() => setCurrentView('badges')}
                  className="w-full text-left px-3 py-2 rounded-lg bg-yellow-50 text-yellow-700 hover:bg-yellow-100 transition-colors text-sm"
                >
                  🏆 View Achievements
                </button>
                <button
                  onClick={() => setCurrentView('leaderboard')}
                  className="w-full text-left px-3 py-2 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors text-sm"
                >
                  📈 Check Rankings
                </button>
              </div>
            </div>

            {/* Learning Streak */}
            <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-lg shadow-sm p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">🔥 Learning Streak</h3>
                <div className="text-2xl font-bold">7</div>
              </div>
              <p className="text-sm text-white text-opacity-90">
                Keep it up! Learn every day to build your streak.
              </p>
              <div className="mt-3 flex gap-1">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="flex-1 h-2 bg-white rounded-full opacity-80" />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Main Content - Changes Based on View */}
          <motion.div 
            key={currentView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:col-span-2"
          >
            {currentView === 'overview' && (
              <div className="space-y-6">
                {/* Welcome Card */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white shadow-lg">
                  <h2 className="text-3xl font-bold mb-3">Welcome to Gamified Learning! 🚀</h2>
                  <p className="text-blue-100 mb-4">
                    Earn XP, unlock badges, and climb the leaderboard as you master new concepts. 
                    Our AI creates personalized challenges just for you!
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white bg-opacity-20 rounded-lg p-3">
                      <div className="text-2xl mb-1">🎯</div>
                      <div className="font-semibold">Adaptive Challenges</div>
                      <div className="text-sm text-blue-100">AI-generated for your level</div>
                    </div>
                    <div className="bg-white bg-opacity-20 rounded-lg p-3">
                      <div className="text-2xl mb-1">🏆</div>
                      <div className="font-semibold">Achievement System</div>
                      <div className="text-sm text-blue-100">Unlock badges & rewards</div>
                    </div>
                  </div>
                </div>
                
                {/* Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg shadow-sm border p-5">
                    <div className="text-3xl mb-3">🏆</div>
                    <h3 className="font-semibold text-gray-900 mb-2 text-lg">Badge Collection</h3>
                    <p className="text-gray-600 text-sm mb-3">
                      Unlock 12+ badges by demonstrating mastery and maintaining streaks. 
                      Each badge represents a real achievement!
                    </p>
                    <button
                      onClick={() => setCurrentView('badges')}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View Badges →
                    </button>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-sm border p-5">
                    <div className="text-3xl mb-3">⚡</div>
                    <h3 className="font-semibold text-gray-900 mb-2 text-lg">AI-Powered Challenges</h3>
                    <p className="text-gray-600 text-sm mb-3">
                      AI-generated challenges adapt to your skill level and learning style. 
                      Get instant feedback and hints!
                    </p>
                    <button
                      onClick={() => setCurrentView('challenges')}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Try Challenge →
                    </button>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border p-5">
                    <div className="text-3xl mb-3">📈</div>
                    <h3 className="font-semibold text-gray-900 mb-2 text-lg">Leaderboards</h3>
                    <p className="text-gray-600 text-sm mb-3">
                      Compete with your cohort in a privacy-preserving leaderboard. 
                      See where you rank!
                    </p>
                    <button
                      onClick={() => setCurrentView('leaderboard')}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View Rankings →
                    </button>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border p-5">
                    <div className="text-3xl mb-3">💡</div>
                    <h3 className="font-semibold text-gray-900 mb-2 text-lg">Smart Hints</h3>
                    <p className="text-gray-600 text-sm mb-3">
                      Stuck on a problem? Get progressive AI-powered hints that guide 
                      you without giving away the answer.
                    </p>
                    <button
                      onClick={() => setCurrentView('challenges')}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      See Example →
                    </button>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-lg shadow-sm border p-5">
                  <h3 className="font-semibold text-gray-900 mb-4">🕐 Recent Activity</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
                          ✓
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Challenge Completed</div>
                          <div className="text-sm text-gray-600">Loop Master Quest</div>
                        </div>
                      </div>
                      <div className="text-green-600 font-semibold">+25 XP</div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white">
                          🏆
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Badge Earned</div>
                          <div className="text-sm text-gray-600">Early Explorer</div>
                        </div>
                      </div>
                      <div className="text-yellow-600 font-semibold">+10 XP</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentView === 'challenges' && (
              <AIChallenge 
                userId={demoUserId}
                concept="python_loops"
                onComplete={handleChallengeComplete}
              />
            )}

            {currentView === 'badges' && (
              <BadgeCollection userId={demoUserId} />
            )}

            {currentView === 'leaderboard' && (
              <Leaderboard userId={demoUserId} cohort="demo_cohort" />
            )}
          </motion.div>
        </div>

        {/* Demo Instructions Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6"
        >
          <h3 className="font-semibold text-yellow-800 mb-3 flex items-center gap-2">
            <span>💡</span> Demo Instructions
          </h3>
          <ul className="text-yellow-700 text-sm space-y-2">
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Click through different tabs to explore all gamification features</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Try the AI Challenge to see personalized content generation in action</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Use the "Demo: Earn +25 XP" button to simulate progress and see animations</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Check the leaderboard to see competitive ranking features</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>View badges to understand the achievement system</span>
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

export default GamificationDemo;

