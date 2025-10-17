import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface LeaderboardUser {
  userId: string;
  xp: number;
  level: number;
  badges: number;
  streak: number;
}

interface LeaderboardProps {
  userId: string;
  cohort?: string;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ userId, cohort }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState<'xp' | 'streak'>('xp');

  useEffect(() => {
    fetchLeaderboard();
  }, [type, cohort]);

  const fetchLeaderboard = async () => {
    try {
      const params = new URLSearchParams({ 
        limit: '10',
        ...(cohort && { cohort })
      });
      
      const response = await fetch(`http://localhost:3001/api/gamify/leaderboard?${params}`);
      const data = await response.json();
      
      if (data.leaderboard) {
        setLeaderboard(data.leaderboard);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-400 to-yellow-600 text-white';
    if (rank === 2) return 'from-gray-400 to-gray-600 text-white';
    if (rank === 3) return 'from-orange-400 to-orange-600 text-white';
    return 'bg-white text-gray-900';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };

  const getDisplayValue = (user: LeaderboardUser, type: string) => {
    switch (type) {
      case 'xp': return `${user.xp} XP`;
      case 'streak': return `${user.streak} days`;
      default: return `${user.xp} XP`;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 rounded-3xl shadow-2xl border-8 border-purple-400 p-8 relative overflow-hidden">
      {/* Fun background elements */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.sin(i) * 20, 0],
              rotate: [0, 360]
            }}
            transition={{
              duration: 3 + i * 0.3,
              repeat: Infinity,
              delay: i * 0.1
            }}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              fontSize: `${Math.random() * 25 + 15}px`
            }}
          >
            {['🏆', '⭐', '🎯', '🔥', '💪'][Math.floor(Math.random() * 5)]}
          </motion.div>
        ))}
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 relative z-10">
        <motion.h2 
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 2, -2, 0]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 mb-4 md:mb-0"
        >
          🏆 Champion Leaderboard! 🏆
        </motion.h2>
        
        {/* Type Selector - More Fun! */}
        <div className="flex gap-3 bg-white rounded-2xl p-2 shadow-lg border-4 border-purple-300">
          {[
            { id: 'xp' as const, label: 'XP', icon: '⭐' },
            { id: 'streak' as const, label: 'Streak', icon: '🔥' }
          ].map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setType(tab.id)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-base font-black transition-all ${
                type === tab.id
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-purple-100'
              }`}
            >
              <motion.span
                animate={type === tab.id ? { rotate: [0, 360] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {tab.icon}
              </motion.span>
              {tab.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Leaderboard List - Super Fun! */}
      <div className="space-y-4 relative z-10">
        {leaderboard.map((user, index) => {
          const rank = index + 1;
          const isCurrentUser = user.userId === userId;
          
          return (
            <motion.div
              key={user.userId}
              initial={{ opacity: 0, x: -50, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ 
                delay: index * 0.1,
                type: "spring",
                stiffness: 200,
                damping: 20
              }}
              whileHover={{ 
                scale: 1.03,
                rotate: rank <= 3 ? [0, -1, 1, 0] : 0
              }}
              className={`flex items-center gap-4 p-5 rounded-2xl border-4 relative overflow-hidden ${
                isCurrentUser 
                  ? 'border-blue-500 bg-blue-100 shadow-xl' 
                  : 'border-white'
              } ${
                rank <= 3 ? `bg-gradient-to-r ${getRankColor(rank)} shadow-2xl` : 'bg-white'
              }`}
            >
              {/* Sparkle effect for top 3 */}
              {rank <= 3 && (
                <motion.div
                  animate={{
                    backgroundPosition: ['0% 0%', '100% 100%']
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"
                  style={{ backgroundSize: '200% 200%' }}
                />
              )}
              
              {/* Rank - Super Big! */}
              <motion.div 
                animate={rank <= 3 ? {
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                } : {}}
                transition={{ duration: 2, repeat: Infinity }}
                className={`w-14 h-14 rounded-full flex items-center justify-center font-black text-2xl shadow-lg ${
                  rank <= 3 ? 'bg-white text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-purple-100 text-purple-600'
                }`}
              >
                {getRankIcon(rank)}
              </motion.div>

              {/* User Info - Fun Style! */}
              <div className="flex-1 min-w-0 relative z-10">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className={`font-black text-lg truncate ${
                    rank <= 3 ? 'text-white' : 'text-gray-900'
                  }`}>
                    {isCurrentUser && '⭐ '}
                    Super Learner #{user.userId.slice(-4)}
                    {isCurrentUser && ' (That\'s You!)'}
                  </h3>
                  <motion.span 
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className={`text-sm px-3 py-1 rounded-full font-black ${
                      rank <= 3 
                        ? 'bg-white text-purple-600'
                        : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                    } shadow-md`}
                  >
                    🚀 Level {user.level}
                  </motion.span>
                </div>
                <div className={`text-base font-bold ${
                  rank <= 3 ? 'text-white' : 'text-gray-700'
                }`}>
                  {getDisplayValue(user, type)}
                  {type === 'xp' && ` • ${user.badges} badges collected!`}
                </div>
              </div>

              {/* Additional Stats - Big and Fun! */}
              <div className={`text-right text-base font-black ${
                rank <= 3 ? 'text-white' : 'text-gray-700'
              } relative z-10`}>
                <motion.div 
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  🔥 {user.streak} days
                </motion.div>
                <div className="mt-1">🏆 {user.badges} badges</div>
              </div>
              
              {/* Crown for #1! */}
              {rank === 1 && (
                <motion.div
                  animate={{
                    y: [-5, 5, -5],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-4xl z-20"
                >
                  👑
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {leaderboard.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">🏆</div>
          <p>No leaderboard data yet</p>
          <p className="text-sm">Complete some activities to appear here!</p>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-xs text-gray-600 text-center">
          🔒 Leaderboard shows anonymized IDs for privacy. Your data is secure.
        </p>
      </div>

      {/* Refresh Button */}
      <button
        onClick={fetchLeaderboard}
        className="mt-4 w-full py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
      >
        🔄 Refresh Leaderboard
      </button>
    </div>
  );
};

export default Leaderboard;

