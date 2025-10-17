import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';

interface UserProfile {
  xp: number;
  level: number;
  levelProgress: {
    progress: number;
    xpToNext: number;
    currentLevelXp: number;
  };
  coins?: number;
  streak?: number;
  badges?: Array<{ badgeId: string; earnedAt: string }>;
}

interface XPProgressBarProps {
  userId: string;
  compact?: boolean;
  onLevelUp?: (level: number) => void;
}

const XPProgressBar: React.FC<XPProgressBarProps> = ({ 
  userId, 
  compact = false,
  onLevelUp 
}) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [recentXP, setRecentXP] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/gamify/stats/${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setProfile(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const simulateXPGain = async () => {
    // Demo function to show XP gain animation
    setRecentXP(25);
    
    try {
      const response = await fetch('http://localhost:3001/api/gamify/award-xp-enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          activity: 'challenge_completed',
          performance: { accuracy: 0.95 },
          context: { firstAttempt: true }
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Refresh profile
        await fetchUserProfile();
        
        if (data.levelUp) {
          setShowConfetti(true);
          onLevelUp?.(data.newLevel);
        }
      }
    } catch (error) {
      console.error('Failed to award XP:', error);
    }
    
    setTimeout(() => setRecentXP(0), 2000);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-2 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4">
        <p className="text-gray-500">No profile data available</p>
      </div>
    );
  }

  const { level, xp, levelProgress, coins = 0, streak = 0, badges = [] } = profile;

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${
      compact ? 'p-3' : 'p-4'
    } relative overflow-hidden`}>
      
      {/* Confetti for level ups */}
      <AnimatePresence>
        {showConfetti && (
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
            recycle={false}
            numberOfPieces={200}
            onConfettiComplete={() => setShowConfetti(false)}
          />
        )}
      </AnimatePresence>

      {/* Recent XP Gain Animation */}
      <AnimatePresence>
        {recentXP > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: -20 }}
            exit={{ opacity: 0 }}
            className="absolute top-2 right-4 bg-green-500 text-white px-2 py-1 rounded-full text-sm font-bold z-10"
          >
            +{recentXP} XP
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className={`font-bold text-gray-900 ${compact ? 'text-sm' : 'text-lg'}`}>
            Level {level}
          </h3>
          <p className={`text-gray-600 ${compact ? 'text-xs' : 'text-sm'}`}>
            {xp} XP • {levelProgress.xpToNext} to next level
          </p>
        </div>
        
        <div className="text-right">
          <div className={`font-bold text-blue-600 ${compact ? 'text-sm' : 'text-lg'}`}>
            {coins} 🪙
          </div>
          <p className={`text-gray-500 ${compact ? 'text-xs' : 'text-sm'}`}>
            {streak} day streak
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-3 mb-2 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${levelProgress.progress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full relative"
        >
          {/* Shimmer effect */}
          <motion.div
            animate={{ x: ['0%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
          />
        </motion.div>
      </div>

      <div className="flex justify-between text-xs text-gray-500">
        <span>Level {level}</span>
        <span>{levelProgress.progress}%</span>
        <span>Level {level + 1}</span>
      </div>

      {/* Badges Preview */}
      {!compact && badges.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Recent Badges</h4>
          <div className="flex gap-2">
            {badges.slice(0, 3).map((badge, index) => (
              <motion.div
                key={badge.badgeId}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 text-sm font-bold"
                title={badge.badgeId}
              >
                {badge.badgeId[0].toUpperCase()}
              </motion.div>
            ))}
            {badges.length > 3 && (
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 text-xs">
                +{badges.length - 3}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Demo Button */}
      <button
        onClick={simulateXPGain}
        className="mt-3 w-full text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors"
      >
        🎮 Demo: Earn +25 XP
      </button>
    </div>
  );
};

export default XPProgressBar;

