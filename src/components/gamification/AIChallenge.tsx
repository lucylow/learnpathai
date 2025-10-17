import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Challenge {
  id: string;
  title: string;
  description: string;
  starterCode: string;
  solution: string;
  hints: string[];
  xpReward: number;
  timeEstimate: number;
  concept: string;
  difficulty: string;
}

interface AIChallengeProps {
  userId: string;
  concept?: string;
  onComplete?: (result: { success: boolean; xp: number; timeSpent: number }) => void;
}

const AIChallenge: React.FC<AIChallengeProps> = ({ 
  userId, 
  concept = 'python_loops',
  onComplete 
}) => {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [userCode, setUserCode] = useState('');
  const [currentHint, setCurrentHint] = useState(0);
  const [showHints, setShowHints] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    generateChallenge();
  }, [concept]);

  const generateChallenge = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('http://localhost:3001/api/gamify/generate-challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          concept,
          difficulty: 'beginner'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setChallenge(data.challenge);
        setUserCode(data.challenge.starterCode);
        setTimeLeft(data.challenge.timeEstimate);
        setCurrentHint(0);
        setIsCompleted(false);
        setShowHints(false);
      }
    } catch (error) {
      console.error('Failed to generate challenge:', error);
      setMessage('Failed to generate challenge. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (timeLeft > 0 && !isCompleted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isCompleted && challenge) {
      handleTimeUp();
    }
  }, [timeLeft, isCompleted, challenge]);

  const handleSubmit = async () => {
    if (!challenge) return;

    // Simple validation for demo - check if code has been modified
    const isModified = userCode !== challenge.starterCode;
    const hasLoopKeyword = userCode.toLowerCase().includes('for') || 
                          userCode.toLowerCase().includes('while') ||
                          userCode.toLowerCase().includes('range');
    
    const isCorrect = isModified && hasLoopKeyword;
    
    if (isCorrect) {
      setIsCompleted(true);
      setMessage('🎉 Perfect! Challenge completed!');
      
      // Award XP
      try {
        await fetch('http://localhost:3001/api/gamify/award-xp-enhanced', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            activity: 'challenge_completed',
            performance: { 
              accuracy: 1.0, 
              responseTime: challenge.timeEstimate - timeLeft,
              expectedTime: challenge.timeEstimate
            },
            context: { 
              challengeId: challenge.id, 
              firstAttempt: currentHint === 0 
            }
          })
        });
      } catch (error) {
        console.error('Failed to award XP:', error);
      }
      
      onComplete?.({
        success: true,
        xp: challenge.xpReward,
        timeSpent: challenge.timeEstimate - timeLeft
      });
    } else {
      setMessage('Not quite right! Try using a loop structure. Need a hint?');
    }
  };

  const handleTimeUp = () => {
    setIsCompleted(true);
    setMessage("Time's up! But you can still practice with this challenge.");
    onComplete?.({
      success: false,
      xp: 0,
      timeSpent: challenge?.timeEstimate || 0
    });
  };

  const useHint = () => {
    if (challenge && currentHint < challenge.hints.length) {
      setCurrentHint(currentHint + 1);
      setShowHints(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Generating AI challenge...</p>
        <p className="text-sm text-gray-500 mt-2">
          Our AI is creating a personalized coding challenge just for you!
        </p>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
        <p className="text-gray-600 mb-4">Failed to load challenge</p>
        <button
          onClick={generateChallenge}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border p-6"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-xl font-bold text-gray-900">{challenge.title}</h2>
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
              {challenge.difficulty}
            </span>
            <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
              {challenge.generatedBy === 'ai' ? '🤖 AI Generated' : '📝 Template'}
            </span>
          </div>
          <p className="text-gray-600 text-sm">{challenge.description}</p>
        </div>
        
        {/* Timer */}
        <div className={`ml-4 text-lg font-bold px-3 py-1 rounded ${
          timeLeft < 60 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
        }`}>
          ⏱️ {formatTime(timeLeft)}
        </div>
      </div>

      {/* XP Reward */}
      <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border border-yellow-200 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-yellow-800">Challenge Reward</span>
          <div className="flex items-center gap-2">
            <span className="bg-blue-500 text-white px-2 py-1 rounded text-sm">
              +{challenge.xpReward} XP
            </span>
            <span className="bg-yellow-500 text-white px-2 py-1 rounded text-sm">
              +5 🪙
            </span>
          </div>
        </div>
      </div>

      {/* Code Editor */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Solution:
        </label>
        <textarea
          value={userCode}
          onChange={(e) => setUserCode(e.target.value)}
          className="w-full h-40 font-mono text-sm border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
          placeholder="Write your code here..."
          disabled={isCompleted}
        />
      </div>

      {/* Message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-4 p-3 rounded-lg ${
            message.includes('🎉') 
              ? 'bg-green-50 border border-green-200 text-green-700'
              : message.includes("Time's up") 
              ? 'bg-orange-50 border border-orange-200 text-orange-700'
              : 'bg-blue-50 border border-blue-200 text-blue-700'
          }`}
        >
          {message}
        </motion.div>
      )}

      {/* Hints Section */}
      <div className="mb-4">
        <button
          onClick={() => setShowHints(!showHints)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          💡 Hints ({currentHint}/{challenge.hints.length}) {showHints ? '▲' : '▼'}
        </button>
        
        <AnimatePresence>
          {showHints && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-2 space-y-2 overflow-hidden"
            >
              {challenge.hints.slice(0, currentHint).map((hint, index) => (
                <motion.div
                  key={index}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800"
                >
                  <strong>Hint {index + 1}:</strong> {hint}
                </motion.div>
              ))}
              
              {currentHint < challenge.hints.length && !isCompleted && (
                <button
                  onClick={useHint}
                  className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                >
                  🔓 Reveal Next Hint ({challenge.hints.length - currentHint} remaining)
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleSubmit}
          disabled={isCompleted}
          className="flex-1 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 transition-colors font-semibold"
        >
          {isCompleted ? '✓ Completed!' : '🚀 Submit Solution'}
        </button>
        
        <button
          onClick={generateChallenge}
          className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          title="Generate new challenge"
        >
          🔄
        </button>
      </div>

      {/* Completion Message */}
      <AnimatePresence>
        {isCompleted && message.includes('🎉') && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-center"
          >
            <div className="text-2xl mb-2">🎉 Challenge Complete!</div>
            <p className="text-green-700">
              You earned <strong>{challenge.xpReward} XP</strong> and <strong>5 coins</strong>!
            </p>
            <p className="text-sm text-green-600 mt-2">
              Time taken: {formatTime(challenge.timeEstimate - timeLeft)}
              {currentHint === 0 && ' • First try bonus applied! 🎯'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AIChallenge;

