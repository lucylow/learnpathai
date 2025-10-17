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
    <div className={`bg-gradient-to-br from-purple-100 via-pink-100 to-yellow-100 rounded-2xl shadow-lg border-4 border-purple-300 ${
      compact ? 'p-3' : 'p-5'
    } relative overflow-hidden`}>
      
      {/* Fun background stars */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              scale: [1, 1.5, 1],
              rotate: [0, 180, 360]
            }}
            transition={{ 
              duration: 3 + i,
              repeat: Infinity,
              delay: i * 0.2
            }}
            className="absolute text-yellow-400"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              fontSize: `${Math.random() * 20 + 10}px`
            }}
          >
            ⭐
          </motion.div>
        ))}
      </div>
      
      {/* Confetti for level ups */}
      <AnimatePresence>
        {showConfetti && (
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
            recycle={false}
            numberOfPieces={500}
            colors={['#FF6B9D', '#FEC163', '#C3B1E1', '#00D9FF', '#7FFF00']}
            onConfettiComplete={() => setShowConfetti(false)}
          />
        )}
      </AnimatePresence>

      {/* Recent XP Gain Animation - More Fun! */}
      <AnimatePresence>
        {recentXP > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 0, scale: 0.5 }}
            animate={{ 
              opacity: 1, 
              y: -40,
              scale: [0.5, 1.5, 1],
              rotate: [0, 10, -10, 0]
            }}
            exit={{ opacity: 0, scale: 2 }}
            className="absolute top-2 right-4 bg-gradient-to-r from-green-400 to-emerald-500 text-white px-4 py-2 rounded-full text-lg font-black z-10 shadow-lg"
          >
            🎉 +{recentXP} XP! 🎉
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-3 relative z-10">
        <div>
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block"
          >
            <h3 className={`font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent ${compact ? 'text-lg' : 'text-2xl'}`}>
              🚀 Level {level}
            </h3>
          </motion.div>
          <p className={`font-bold text-purple-700 ${compact ? 'text-xs' : 'text-base'}`}>
            ⚡ {xp} XP • {levelProgress.xpToNext} more to level up!
          </p>
        </div>
        
        <div className="text-right">
          <motion.div 
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
            className={`font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 ${compact ? 'text-lg' : 'text-2xl'}`}
          >
            {coins} 🪙
          </motion.div>
          <motion.p 
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className={`font-bold text-orange-600 ${compact ? 'text-xs' : 'text-sm'}`}
          >
            🔥 {streak} day streak!
          </motion.p>
        </div>
      </div>

      {/* Progress Bar - Rainbow Fun! */}
      <div className="w-full bg-white rounded-full h-6 mb-2 overflow-hidden shadow-inner border-4 border-purple-200 relative z-10">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${levelProgress.progress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-pink-500 via-purple-500 via-blue-500 to-green-500 rounded-full relative"
          style={{
            backgroundSize: '200% 100%'
          }}
        >
          {/* Sparkle effect */}
          <motion.div
            animate={{ 
              x: ['0%', '100%'],
              backgroundPosition: ['0% 0%', '100% 0%']
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-60"
          />
          
          {/* Bouncing stars on progress */}
          {levelProgress.progress > 10 && (
            <motion.div
              animate={{ y: [-2, 2, -2] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-yellow-300 text-sm"
            >
              ⭐
            </motion.div>
          )}
        </motion.div>
      </div>

      <div className="flex justify-between text-sm font-bold relative z-10">
        <span className="text-purple-600">🎯 Level {level}</span>
        <motion.span 
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="text-pink-600"
        >
          {levelProgress.progress}% 🎨
        </motion.span>
        <span className="text-blue-600">Level {level + 1} 🎊</span>
      </div>

      {/* Badges Preview - Sticker Style! */}
      {!compact && badges.length > 0 && (
        <div className="mt-3 pt-3 border-t-4 border-dashed border-purple-300 relative z-10">
          <h4 className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 mb-2">
            ✨ My Awesome Badges! ✨
          </h4>
          <div className="flex gap-2">
            {badges.slice(0, 3).map((badge, index) => (
              <motion.div
                key={badge.badgeId}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ 
                  scale: 1,
                  rotate: 0
                }}
                whileHover={{ 
                  scale: 1.2,
                  rotate: [0, -10, 10, 0],
                  transition: { duration: 0.3 }
                }}
                transition={{ 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 260,
                  damping: 20
                }}
                className="w-10 h-10 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-lg border-3 border-yellow-200 cursor-pointer"
                title={badge.badgeId}
              >
                🏆
              </motion.div>
            ))}
            {badges.length > 3 && (
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-10 h-10 bg-gradient-to-br from-purple-300 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg"
              >
                +{badges.length - 3} 🎉
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* Demo Button - Super Fun! */}
      <motion.button
        onClick={simulateXPGain}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="mt-3 w-full text-base font-black bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 text-white px-4 py-3 rounded-2xl hover:from-green-500 hover:via-blue-600 hover:to-purple-700 transition-all shadow-lg relative z-10 border-4 border-white"
      >
        <motion.span
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="inline-block mr-2"
        >
          🎮
        </motion.span>
        Tap for +25 XP Magic!
        <motion.span
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="inline-block ml-2"
        >
          ✨
        </motion.span>
      </motion.button>
    </div>
  );
};

export default XPProgressBar;

