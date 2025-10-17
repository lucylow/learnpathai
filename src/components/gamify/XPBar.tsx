import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Flame, Star, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import './gamify.css';

interface XPProgress {
  userId: string;
  xp: number;
  level: number;
  progressToNextLevel: number;
  xpForNextLevel: number;
  progressPercentage: number;
  streak: number;
  totalBadges: number;
  nextLevelXP: number;
}

interface LevelUpData {
  level: number;
  rewards: {
    xp: number;
    badges: string[];
    title?: string;
  };
}

interface XPBarProps {
  userId: string;
  compact?: boolean;
  showBadges?: boolean;
  onLevelUp?: (data: LevelUpData) => void;
}

const XPBar: React.FC<XPBarProps> = ({ 
  userId, 
  compact = false,
  showBadges = true,
  onLevelUp
}) => {
  const [progress, setProgress] = useState<XPProgress | null>(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpData, setLevelUpData] = useState<LevelUpData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
    // Set up periodic refresh every 10 seconds
    const interval = setInterval(fetchProgress, 10000);
    return () => clearInterval(interval);
  }, [userId]);

  const fetchProgress = async () => {
    try {
      const response = await fetch(`/api/gamify/progress/${userId}`);
      const data = await response.json();
      
      // Check for level up
      if (progress && data.level > progress.level) {
        handleLevelUp(data);
      }
      
      setProgress(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch progress:', error);
      setLoading(false);
    }
  };

  const handleLevelUp = (newProgress: XPProgress) => {
    const levelData: LevelUpData = {
      level: newProgress.level,
      rewards: {
        xp: newProgress.level * 50,
        badges: [],
        title: newProgress.level === 10 ? 'Dedicated Learner' : undefined
      }
    };

    setLevelUpData(levelData);
    setShowLevelUp(true);
    triggerConfetti();
    
    // Show level up modal for 4 seconds
    setTimeout(() => {
      setShowLevelUp(false);
      setLevelUpData(null);
    }, 4000);

    if (onLevelUp) {
      onLevelUp(levelData);
    }
  };

  const triggerConfetti = () => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 }
    };

    function fire(particleRatio: number, opts: any) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });

    fire(0.2, {
      spread: 60,
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  };

  if (loading) {
    return (
      <Card className={compact ? 'w-full' : 'w-full max-w-md'}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!progress) {
    return (
      <Card className={compact ? 'w-full' : 'w-full max-w-md'}>
        <CardContent className="p-6">
          <p className="text-gray-500 text-center">No progress data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Level Up Modal */}
      {showLevelUp && levelUpData && (
        <div className="level-up-overlay">
          <div className="level-up-modal">
            <div className="level-up-content">
              <div className="level-up-icon">
                <Trophy className="h-16 w-16 text-yellow-500" />
              </div>
              <h2 className="text-3xl font-bold text-purple-900 mb-2">
                🎉 Level Up! 🎉
              </h2>
              <div className="text-6xl font-bold text-purple-600 mb-4">
                Level {levelUpData.level}
              </div>
              {levelUpData.rewards.title && (
                <div className="text-xl text-purple-700 mb-4">
                  New Title: {levelUpData.rewards.title}
                </div>
              )}
              <div className="level-rewards">
                <Sparkles className="h-5 w-5" />
                <span>+{levelUpData.rewards.xp} Bonus XP</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* XP Bar Display */}
      <Card className={`xp-bar-card ${compact ? 'compact' : ''}`}>
        <CardContent className={compact ? 'p-4' : 'p-6'}>
          <div className="space-y-4">
            {/* Header with Level and Stats */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="level-badge">
                  <Star className="h-4 w-4" />
                  <span className="font-bold">Lvl {progress.level}</span>
                </div>
                {!compact && (
                  <span className="text-sm text-gray-600">
                    {progress.xp.toLocaleString()} XP
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {progress.streak > 0 && (
                  <Badge variant="secondary" className="streak-badge">
                    <Flame className="h-3 w-3 mr-1" />
                    {progress.streak} day streak
                  </Badge>
                )}
                {showBadges && progress.totalBadges > 0 && (
                  <Badge variant="secondary" className="badge-count">
                    <Trophy className="h-3 w-3 mr-1" />
                    {progress.totalBadges}
                  </Badge>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>{progress.progressToNextLevel} XP</span>
                <span>{progress.xpForNextLevel} XP</span>
              </div>
              
              <div className="relative">
                <Progress 
                  value={progress.progressPercentage} 
                  className="h-3 xp-progress-bar"
                />
                <div className="progress-shimmer"></div>
              </div>

              {!compact && (
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Current Level</span>
                  <span className="font-medium">
                    {progress.progressPercentage}% to Level {progress.level + 1}
                  </span>
                </div>
              )}
            </div>

            {/* Stats Summary (non-compact) */}
            {!compact && (
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-100">
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">
                    {progress.level}
                  </div>
                  <div className="text-xs text-gray-500">Level</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {progress.totalBadges}
                  </div>
                  <div className="text-xs text-gray-500">Badges</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600">
                    {progress.streak}
                  </div>
                  <div className="text-xs text-gray-500">Day Streak</div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default XPBar;


