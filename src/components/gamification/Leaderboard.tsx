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
    <div className="bg-white rounded-lg shadow-sm border p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">🏆 Leaderboard</h2>
        
        {/* Type Selector */}
        <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
          {[
            { id: 'xp' as const, label: 'XP', icon: '⭐' },
            { id: 'streak' as const, label: 'Streak', icon: '🔥' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setType(tab.id)}
              className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                type === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="space-y-3">
        {leaderboard.map((user, index) => {
          const rank = index + 1;
          const isCurrentUser = user.userId === userId;
          
          return (
            <motion.div
              key={user.userId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center gap-4 p-4 rounded-lg border-2 ${
                isCurrentUser 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200'
              } ${
                rank <= 3 ? `bg-gradient-to-r ${getRankColor(rank)}` : ''
              }`}
            >
              {/* Rank */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                rank <= 3 ? 'text-white text-lg' : 'bg-gray-100 text-gray-600'
              }`}>
                {getRankIcon(rank)}
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={`font-semibold truncate ${
                    rank <= 3 ? 'text-white' : 'text-gray-900'
                  }`}>
                    User {user.userId.slice(-4)}
                    {isCurrentUser && ' (You)'}
                  </h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    rank <= 3 
                      ? 'bg-white bg-opacity-30 text-white'
                      : 'bg-blue-500 text-white'
                  }`}>
                    Lvl {user.level}
                  </span>
                </div>
                <div className={`text-sm ${
                  rank <= 3 ? 'text-white text-opacity-90' : 'text-gray-600'
                }`}>
                  {getDisplayValue(user, type)}
                  {type === 'xp' && ` • ${user.badges} badges`}
                </div>
              </div>

              {/* Additional Stats */}
              <div className={`text-right text-sm ${
                rank <= 3 ? 'text-white text-opacity-90' : 'text-gray-500'
              }`}>
                <div>🔥 {user.streak} days</div>
                <div>🏆 {user.badges} badges</div>
              </div>
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

