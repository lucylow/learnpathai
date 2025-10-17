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
    if (rank === 1) return 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white border-yellow-400';
    if (rank === 2) return 'bg-gradient-to-br from-slate-300 to-slate-400 text-slate-900 border-slate-400';
    if (rank === 3) return 'bg-gradient-to-br from-orange-400 to-orange-500 text-white border-orange-400';
    return 'bg-muted text-muted-foreground border-border';
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
    <div 
      className="bg-gradient-to-br from-primary/5 via-accent/5 to-background rounded-xl shadow-lg border border-border p-6 relative overflow-hidden"
      role="region"
      aria-label="Leaderboard"
    >
      {/* Subtle background elements */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -20, 0],
            }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.3
            }}
            className="absolute text-2xl"
            style={{
              left: `${10 + (i * 12)}%`,
              top: `${20 + Math.sin(i) * 30}%`,
            }}
          >
            {['🏆', '⭐', '🎯'][i % 3]}
          </motion.div>
        ))}
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 relative z-10 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-1 flex items-center gap-2">
            <span className="text-3xl">🏆</span>
            Leaderboard
          </h2>
          <p className="text-sm text-muted-foreground">Top performers this week</p>
        </div>
        
        {/* Type Selector */}
        <div className="flex gap-2 bg-muted/50 rounded-lg p-1 border border-border">
          {[
            { id: 'xp' as const, label: 'XP', icon: '⭐' },
            { id: 'streak' as const, label: 'Streak', icon: '🔥' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setType(tab.id)}
              aria-pressed={type === tab.id}
              aria-label={`Sort by ${tab.label}`}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                type === tab.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background'
              }`}
            >
              <span className="text-base" aria-hidden="true">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="space-y-3 relative z-10" role="list" aria-label="Top learners">
        {leaderboard.map((user, index) => {
          const rank = index + 1;
          const isCurrentUser = user.userId === userId;
          
          return (
            <motion.div
              key={user.userId}
              role="listitem"
              aria-label={`Rank ${rank}: Learner ${user.userId.slice(-4)}, ${getDisplayValue(user, type)}, ${user.streak} day streak`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                delay: index * 0.05,
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
              className={`flex items-center gap-4 p-4 rounded-lg border relative overflow-hidden transition-all hover:shadow-md ${
                isCurrentUser 
                  ? 'border-primary bg-primary/5 shadow-sm' 
                  : 'border-border bg-background'
              } ${
                rank <= 3 ? `border-2 ${getRankColor(rank)}` : ''
              }`}
            >
              {/* Subtle gradient for top 3 */}
              {rank <= 3 && (
                <div
                  className="absolute inset-0 opacity-5 pointer-events-none"
                  style={{
                    background: rank === 1 ? 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)' :
                               rank === 2 ? 'linear-gradient(135deg, #c0c0c0 0%, #e5e5e5 100%)' :
                               'linear-gradient(135deg, #cd7f32 0%, #e5a372 100%)'
                  }}
                />
              )}
              
              {/* Rank Badge */}
              <div 
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl shrink-0 ${
                  rank <= 3 ? getRankColor(rank) + ' shadow-sm' : 'bg-muted text-muted-foreground'
                }`}
              >
                {getRankIcon(rank)}
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0 relative z-10">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className={`font-semibold text-base truncate ${
                    isCurrentUser ? 'text-primary' : 'text-foreground'
                  }`}>
                    {isCurrentUser && '⭐ '}
                    Learner #{user.userId.slice(-4)}
                    {isCurrentUser && ' (You)'}
                  </h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                      rank <= 3 
                      ? 'bg-primary/10 text-primary border-primary/20'
                      : 'bg-muted text-muted-foreground border-border'
                  }`}>
                    Level {user.level}
                  </span>
                </div>
                <div className="text-sm font-medium text-muted-foreground">
                  {getDisplayValue(user, type)}
                  {type === 'xp' && user.badges > 0 && ` • ${user.badges} badges`}
                </div>
              </div>

              {/* Additional Stats */}
              <div className="text-right text-sm font-medium text-muted-foreground shrink-0">
                <div className="flex items-center gap-1 justify-end">
                  <span>🔥</span>
                  <span>{user.streak} day{user.streak !== 1 ? 's' : ''}</span>
                </div>
                {user.badges > 0 && (
                  <div className="mt-0.5 flex items-center gap-1 justify-end">
                    <span>🏆</span>
                    <span>{user.badges}</span>
                  </div>
                )}
              </div>
              
              {/* Crown for #1 */}
              {rank === 1 && (
                <motion.div
                  animate={{
                    y: [-3, 3, -3],
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-3xl z-20"
                  style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
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
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 bg-muted/30 rounded-lg border-2 border-dashed border-border relative z-10"
        >
          <div className="text-5xl mb-4">🏆</div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            No rankings yet
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Complete challenges and earn XP to appear on the leaderboard!
          </p>
        </motion.div>
      )}

      {/* Privacy Notice */}
      <div className="mt-6 p-3 bg-muted/50 rounded-lg border border-border relative z-10">
        <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-2">
          <span>🔒</span>
          <span>Your privacy is protected. Only anonymized data is shown.</span>
        </p>
      </div>

      {/* Refresh Button */}
      <button
        onClick={fetchLeaderboard}
        aria-label="Refresh leaderboard rankings"
        className="mt-4 w-full py-3 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all shadow-sm relative z-10 flex items-center justify-center gap-2"
      >
        <span aria-hidden="true">🔄</span>
        <span>Refresh Rankings</span>
      </button>
    </div>
  );
};

export default Leaderboard;

