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
          const earned = earnedData.badges?.find((b: any) => b.id === badge.id || b.badgeId === badge.id);
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
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Badge Collection</h2>
        <div className="text-sm text-gray-600">
          {badges.filter(b => b.earned).length} / {badges.length} earned
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {badges.map((badge) => (
          <motion.div
            key={badge.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
              badge.earned 
                ? `bg-gradient-to-br ${getRarityColor(badge.rarity)} text-white shadow-lg` 
                : 'bg-gray-50 text-gray-400 border-gray-300'
            }`}
            onClick={() => setSelectedBadge(badge)}
          >
            {/* Badge Icon */}
            <div className="text-3xl mb-2 text-center">
              {badge.icon || '🏆'}
            </div>
            
            {/* Badge Name */}
            <h3 className="font-semibold text-center text-sm mb-1">
              {badge.name}
            </h3>
            
            {/* Rarity indicator */}
            <div className="text-xs text-center opacity-75 capitalize">
              {badge.rarity}
            </div>
            
            {/* Progress for unearned badges */}
            {!badge.earned && badge.progress !== undefined && (
              <div className="mt-2">
                <div className="w-full bg-gray-300 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${badge.progress * 100}%` }}
                  />
                </div>
                <p className="text-xs text-center mt-1">
                  {Math.round(badge.progress * 100)}%
                </p>
              </div>
            )}
            
            {/* Earned indicator */}
            {badge.earned && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-xs">✓</span>
              </div>
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

      {/* Badge Detail Modal */}
      <AnimatePresence>
        {selectedBadge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedBadge(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className={`bg-white rounded-xl p-6 max-w-sm w-full ${
                selectedBadge.earned ? `border-4 ${getRarityBorder(selectedBadge.rarity)}` : ''
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="text-5xl mb-4">{selectedBadge.icon || '🏆'}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {selectedBadge.name}
                </h3>
                <p className="text-gray-600 mb-4">
                  {selectedBadge.description}
                </p>
                
                <div className="flex justify-between text-sm text-gray-500 mb-4">
                  <span className="capitalize">Rarity: {selectedBadge.rarity}</span>
                  {selectedBadge.earned && selectedBadge.earnedAt && (
                    <span>
                      Earned: {new Date(selectedBadge.earnedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                
                {!selectedBadge.earned && selectedBadge.progress !== undefined && (
                  <div className="mb-4">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${selectedBadge.progress * 100}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Progress: {Math.round(selectedBadge.progress * 100)}%
                    </p>
                  </div>
                )}
                
                <button
                  onClick={() => setSelectedBadge(null)}
                  className={`w-full py-2 rounded-lg transition-colors ${
                    selectedBadge.earned
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {selectedBadge.earned ? '🎉 Awesome!' : 'Keep Going!'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BadgeCollection;

