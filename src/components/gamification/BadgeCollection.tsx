import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  earned?: boolean;
  earnedAt?: string;
  progress?: number;
}

interface BadgeCollectionProps {
  userId: string;
}

const BadgeCollection: React.FC<BadgeCollectionProps> = ({ userId }) => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBadges();
  }, [userId]);

  const fetchBadges = async () => {
    try {
      // Fetch available badges
      const availableResponse = await fetch('http://localhost:3001/api/gamify/badges/available');
      const availableData = await availableResponse.json();

      // Fetch user's earned badges
      const earnedResponse = await fetch(`http://localhost:3001/api/gamify/badges/${userId}`);
      const earnedData = await earnedResponse.json();

      if (availableData.success) {
        const allBadges = availableData.badges.map((badge: Badge) => {
          const earned = earnedData.badges?.find((b: {id?: string; badgeId?: string; earnedAt?: string}) => b.id === badge.id || b.badgeId === badge.id);
          return {
            ...badge,
            earned: !!earned,
            earnedAt: earned?.earnedAt,
            progress: earned ? 1.0 : Math.random() * 0.8 // Demo: random progress
          };
        });

        setBadges(allBadges);
      }
    } catch (error) {
      console.error('Failed to fetch badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: 'from-gray-400 to-gray-500',
      uncommon: 'from-green-400 to-blue-500',
      rare: 'from-purple-400 to-pink-500',
      epic: 'from-yellow-400 to-orange-500',
      legendary: 'from-red-400 to-purple-600'
    };
    return colors[rarity as keyof typeof colors] || colors.common;
  };

  const getRarityBorder = (rarity: string) => {
    const colors = {
      common: 'border-gray-400',
      uncommon: 'border-green-400',
      rare: 'border-purple-400',
      epic: 'border-yellow-400',
      legendary: 'border-red-400'
    };
    return colors[rarity as keyof typeof colors] || colors.common;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-yellow-50 via-pink-50 to-purple-50 rounded-3xl shadow-2xl border-8 border-yellow-300 p-8 relative overflow-hidden">
      {/* Fun background decorations */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 360],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.2
            }}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              fontSize: `${Math.random() * 30 + 20}px`
            }}
          >
            {['🌟', '⭐', '✨', '🎨', '🎯', '🏆'][Math.floor(Math.random() * 6)]}
          </motion.div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-6 relative z-10">
        <motion.h2 
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500"
        >
          🏆 My Super Badge Collection! 🏆
        </motion.h2>
        <motion.div 
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="text-lg font-black text-purple-600 bg-white px-4 py-2 rounded-full shadow-lg"
        >
          ✨ {badges.filter(b => b.earned).length} / {badges.length} collected!
        </motion.div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
        {badges.map((badge, index) => (
          <motion.div
            key={badge.id}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: index * 0.1
            }}
            whileHover={{ 
              scale: 1.1,
              rotate: [0, -5, 5, 0],
              transition: { duration: 0.3 }
            }}
            whileTap={{ scale: 0.9 }}
            className={`relative p-6 rounded-3xl border-4 cursor-pointer transition-all transform ${
              badge.earned 
                ? `bg-gradient-to-br ${getRarityColor(badge.rarity)} text-white shadow-2xl border-white` 
                : 'bg-white text-gray-400 border-dashed border-gray-400'
            }`}
            onClick={() => setSelectedBadge(badge)}
            style={{
              transform: badge.earned ? `rotate(${Math.random() * 10 - 5}deg)` : 'none'
            }}
          >
            {/* Badge Icon - Bigger and Bouncy! */}
            <motion.div 
              animate={badge.earned ? {
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              } : {}}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl mb-3 text-center"
            >
              {badge.icon || '🏆'}
            </motion.div>
            
            {/* Badge Name - Fun Font! */}
            <h3 className="font-black text-center text-base mb-2">
              {badge.name}
            </h3>
            
            {/* Rarity indicator - Sparkly! */}
            <div className="text-xs text-center opacity-90 capitalize font-bold">
              ✨ {badge.rarity} ✨
            </div>
            
            {/* Progress for unearned badges - Rainbow Progress! */}
            {!badge.earned && badge.progress !== undefined && (
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden border-2 border-gray-300">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${badge.progress * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-full relative"
                  >
                    <motion.div
                      animate={{ x: ['0%', '100%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-40"
                    />
                  </motion.div>
                </div>
                <p className="text-sm text-center mt-2 font-bold">
                  {Math.round(badge.progress * 100)}% there! 🎯
                </p>
              </div>
            )}
            
            {/* Earned indicator - Super Star! */}
            {badge.earned && (
              <motion.div 
                animate={{ 
                  scale: [1, 1.3, 1],
                  rotate: [0, 360]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity
                }}
                className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full flex items-center justify-center border-4 border-white shadow-xl"
              >
                <span className="text-2xl">⭐</span>
              </motion.div>
            )}
            
            {/* Shine effect for earned badges */}
            {badge.earned && (
              <motion.div
                animate={{ 
                  backgroundPosition: ['0% 0%', '100% 100%']
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  repeatType: 'reverse' 
                }}
                className="absolute inset-0 rounded-lg opacity-30"
                style={{
                  background: 'linear-gradient(45deg, transparent 30%, white 50%, transparent 70%)',
                  backgroundSize: '200% 200%'
                }}
              />
            )}
          </motion.div>
        ))}
      </div>

      {/* Badge Detail Modal - Super Fun! */}
      <AnimatePresence>
        {selectedBadge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedBadge(null)}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0, rotate: -180 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.5, opacity: 0, rotate: 180 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={`bg-gradient-to-br from-yellow-100 via-pink-100 to-purple-100 rounded-3xl p-8 max-w-md w-full border-8 ${
                selectedBadge.earned ? `${getRarityBorder(selectedBadge.rarity)} shadow-2xl` : 'border-gray-400 border-dashed'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center relative">
                {/* Floating stars around badge */}
                {selectedBadge.earned && (
                  <>
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{
                          y: [0, -20, 0],
                          rotate: [0, 360],
                          scale: [1, 1.5, 1]
                        }}
                        transition={{
                          duration: 2 + i * 0.3,
                          repeat: Infinity,
                          delay: i * 0.2
                        }}
                        className="absolute text-yellow-400 text-2xl"
                        style={{
                          left: `${10 + i * 15}%`,
                          top: `${i % 2 === 0 ? '10%' : '20%'}`
                        }}
                      >
                        ⭐
                      </motion.div>
                    ))}
                  </>
                )}
                
                <motion.div 
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-8xl mb-4"
                >
                  {selectedBadge.icon || '🏆'}
                </motion.div>
                
                <motion.h3 
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 mb-3"
                >
                  {selectedBadge.name}
                </motion.h3>
                
                <p className="text-gray-700 font-semibold mb-4 text-lg">
                  {selectedBadge.description}
                </p>
                
                <div className="flex justify-between text-base font-bold text-purple-700 mb-4 bg-white rounded-2xl p-3 shadow-inner">
                  <span className="capitalize">✨ {selectedBadge.rarity} ✨</span>
                  {selectedBadge.earned && selectedBadge.earnedAt && (
                    <span>
                      🎊 {new Date(selectedBadge.earnedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                
                {!selectedBadge.earned && selectedBadge.progress !== undefined && (
                  <div className="mb-4">
                    <div className="w-full bg-white rounded-full h-6 overflow-hidden border-4 border-purple-300 shadow-inner">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${selectedBadge.progress * 100}%` }}
                        className="h-full bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 relative"
                      >
                        <motion.div
                          animate={{ x: ['0%', '100%'] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-50"
                        />
                      </motion.div>
                    </div>
                    <p className="text-base font-black text-purple-600 mt-3">
                      🎯 {Math.round(selectedBadge.progress * 100)}% Complete!
                    </p>
                  </div>
                )}
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedBadge(null)}
                  className={`w-full py-4 rounded-2xl transition-all text-lg font-black shadow-lg border-4 border-white ${
                    selectedBadge.earned
                      ? 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white hover:from-yellow-500 hover:via-orange-600 hover:to-red-600'
                      : 'bg-gradient-to-r from-blue-400 to-purple-500 text-white hover:from-blue-500 hover:to-purple-600'
                  }`}
                >
                  {selectedBadge.earned ? '🎉 Super Awesome! 🎉' : '💪 Keep Going! You Got This! 💪'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BadgeCollection;

