// src/components/AchievementPanel.tsx
import { motion } from 'framer-motion';
import { Trophy, Flame, Star, Target, Award, Zap, BookOpen, TrendingUp } from 'lucide-react';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: 'trophy' | 'flame' | 'star' | 'target' | 'award' | 'zap' | 'book' | 'trend';
  unlocked: boolean;
  unlockedAt?: Date;
  progress?: number; // 0-100
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  xp?: number;
}

const iconMap = {
  trophy: Trophy,
  flame: Flame,
  star: Star,
  target: Target,
  award: Award,
  zap: Zap,
  book: BookOpen,
  trend: TrendingUp,
};

const rarityColors = {
  common: {
    bg: 'from-gray-50 to-gray-100',
    border: 'border-gray-300',
    icon: 'bg-gray-400'
  },
  rare: {
    bg: 'from-blue-50 to-blue-100',
    border: 'border-blue-400',
    icon: 'bg-blue-500'
  },
  epic: {
    bg: 'from-purple-50 to-purple-100',
    border: 'border-purple-400',
    icon: 'bg-purple-500'
  },
  legendary: {
    bg: 'from-amber-50 to-amber-100',
    border: 'border-amber-400',
    icon: 'bg-amber-500'
  }
};

export const AchievementPanel: React.FC<{ achievements: Achievement[] }> = ({ 
  achievements 
}) => {
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalXP = achievements.filter(a => a.unlocked).reduce((sum, a) => sum + (a.xp || 0), 0);

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <Card className="p-6 bg-gradient-to-r from-blue-600 to-emerald-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Your Achievements</h2>
            <p className="text-blue-100">
              {unlockedCount} of {achievements.length} unlocked
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">{totalXP}</div>
            <p className="text-sm text-blue-100">Total XP</p>
          </div>
        </div>
        <Progress 
          value={(unlockedCount / achievements.length) * 100} 
          className="mt-4 h-2"
        />
      </Card>

      {/* Achievement Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((achievement, idx) => {
          const Icon = iconMap[achievement.icon];
          const rarity = achievement.rarity || 'common';
          const colors = rarityColors[rarity];

          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ scale: achievement.unlocked ? 1.03 : 1 }}
            >
              <Card className={`relative p-5 border-2 ${
                achievement.unlocked 
                  ? `bg-gradient-to-br ${colors.bg} ${colors.border} shadow-lg` 
                  : 'bg-gray-50 border-gray-200 opacity-70'
              }`}>
                {/* Rarity Badge */}
                {achievement.unlocked && rarity !== 'common' && (
                  <div className="absolute top-2 right-2">
                    <Badge variant={rarity === 'legendary' ? 'default' : 'secondary'} className="text-xs">
                      {rarity.toUpperCase()}
                    </Badge>
                  </div>
                )}

                <div className="flex flex-col items-center text-center">
                  {/* Icon */}
                  <motion.div 
                    className={`w-20 h-20 rounded-full flex items-center justify-center mb-3 shadow-lg ${
                      achievement.unlocked ? colors.icon : 'bg-gray-300'
                    }`}
                    animate={achievement.unlocked ? {
                      rotate: [0, -10, 10, -10, 10, 0],
                    } : {}}
                    transition={{ duration: 0.6 }}
                  >
                    <Icon className="w-10 h-10 text-white" />
                  </motion.div>

                  {/* Title & Description */}
                  <h4 className="font-bold text-base mb-1">{achievement.title}</h4>
                  <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                    {achievement.description}
                  </p>

                  {/* Progress Bar for Locked Achievements */}
                  {!achievement.unlocked && achievement.progress !== undefined && (
                    <div className="w-full mt-2">
                      <Progress value={achievement.progress} className="h-2 mb-2" />
                      <span className="text-xs text-gray-600 font-medium">
                        {achievement.progress}% Complete
                      </span>
                    </div>
                  )}

                  {/* Unlocked Info */}
                  {achievement.unlocked && (
                    <div className="flex flex-col items-center gap-2 mt-2">
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="flex items-center gap-2 text-sm font-semibold"
                      >
                        <Star className="w-4 h-4 text-amber-500 fill-current" />
                        <span>+{achievement.xp || 0} XP</span>
                      </motion.div>
                      {achievement.unlockedAt && (
                        <span className="text-xs text-gray-500">
                          Unlocked {achievement.unlockedAt.toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Sparkle Animation for Unlocked */}
                  {achievement.unlocked && (
                    <>
                      <motion.div
                        className="absolute -top-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 15 }}
                      >
                        <Star className="w-5 h-5 text-white fill-current" />
                      </motion.div>

                      {/* Animated particles */}
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-1 h-1 bg-amber-400 rounded-full"
                          initial={{ 
                            x: 0, 
                            y: 0, 
                            opacity: 1,
                            scale: 0 
                          }}
                          animate={{
                            x: [0, (i - 1) * 30],
                            y: [0, -40],
                            opacity: [1, 0],
                            scale: [0, 1, 0]
                          }}
                          transition={{
                            duration: 1,
                            delay: i * 0.1,
                            repeat: Infinity,
                            repeatDelay: 2
                          }}
                          style={{ top: '50%', left: '50%' }}
                        />
                      ))}
                    </>
                  )}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// Achievement notification toast
export const AchievementUnlockNotification: React.FC<{ achievement: Achievement; onClose: () => void }> = ({ 
  achievement, 
  onClose 
}) => {
  const Icon = iconMap[achievement.icon];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className="fixed bottom-6 left-6 z-50"
    >
      <Card className="p-6 bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-400 shadow-2xl w-80">
        <div className="flex items-center gap-4">
          <motion.div
            className="w-16 h-16 rounded-full bg-amber-500 flex items-center justify-center shadow-lg"
            animate={{
              rotate: [0, -10, 10, -10, 10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 0.6 }}
          >
            <Icon className="w-8 h-8 text-white" />
          </motion.div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-900 mb-1">
              🎉 Achievement Unlocked!
            </p>
            <h4 className="font-bold text-lg text-gray-900">{achievement.title}</h4>
            <p className="text-sm text-gray-700 mt-1">+{achievement.xp || 0} XP</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            ×
          </button>
        </div>
      </Card>
    </motion.div>
  );
};

// Sample achievements for demo
export const sampleAchievements: Achievement[] = [
  {
    id: '1',
    title: 'First Steps',
    description: 'Complete your first lesson',
    icon: 'book',
    unlocked: true,
    unlockedAt: new Date('2024-01-15'),
    rarity: 'common',
    xp: 10
  },
  {
    id: '2',
    title: 'Hot Streak',
    description: 'Learn for 7 days in a row',
    icon: 'flame',
    unlocked: true,
    unlockedAt: new Date('2024-01-20'),
    rarity: 'rare',
    xp: 50
  },
  {
    id: '3',
    title: 'Loop Master',
    description: 'Achieve 90%+ mastery in loops',
    icon: 'trophy',
    unlocked: false,
    progress: 75,
    rarity: 'epic',
    xp: 100
  },
  {
    id: '4',
    title: 'Speed Learner',
    description: 'Complete 10 lessons in one day',
    icon: 'zap',
    unlocked: false,
    progress: 40,
    rarity: 'rare',
    xp: 75
  },
  {
    id: '5',
    title: 'Perfect Score',
    description: 'Get 100% on any quiz',
    icon: 'star',
    unlocked: true,
    unlockedAt: new Date('2024-01-18'),
    rarity: 'epic',
    xp: 100
  },
  {
    id: '6',
    title: 'Knowledge Guru',
    description: 'Master all core concepts',
    icon: 'award',
    unlocked: false,
    progress: 30,
    rarity: 'legendary',
    xp: 500
  }
];

