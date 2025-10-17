import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Flame, Star, Sparkles, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Custom hook for celebration effects
export const useCelebration = () => {
  const triggerConfetti = () => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      colors: ['#2196f3', '#4caf50', '#ff5722', '#ff9800', '#9c27b0'],
    };

    function fire(particleRatio: number, opts: Record<string, unknown>) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
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
      scalar: 0.8,
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });

    // Vibrate on mobile
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
  };

  const triggerFireworks = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 0,
      colors: ['#2196f3', '#4caf50', '#ff5722', '#ff9800'],
    };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: NodeJS.Timeout = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      // Fireworks from different positions
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  };

  const triggerStars = () => {
    const defaults = {
      spread: 360,
      ticks: 50,
      gravity: 0,
      decay: 0.94,
      startVelocity: 30,
      shapes: ['star'],
      colors: ['#FFE400', '#FFBD00', '#E89400', '#FFCA6C', '#FDFFB8'],
    };

    function shoot() {
      confetti({
        ...defaults,
        particleCount: 40,
        scalar: 1.2,
        shapes: ['star'],
      });

      confetti({
        ...defaults,
        particleCount: 10,
        scalar: 0.75,
        shapes: ['circle'],
      });
    }

    setTimeout(shoot, 0);
    setTimeout(shoot, 100);
    setTimeout(shoot, 200);
  };

  return { triggerConfetti, triggerFireworks, triggerStars };
};

// Mastery Achievement Modal
interface MasteryAchievedModalProps {
  concept: string;
  mastery: number;
  onClose: () => void;
}

export const MasteryAchievedModal: React.FC<MasteryAchievedModalProps> = ({
  concept,
  mastery,
  onClose,
}) => {
  const { triggerConfetti } = useCelebration();

  useEffect(() => {
    triggerConfetti();
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl relative overflow-hidden"
          initial={{ scale: 0.5, rotate: -10, y: 100 }}
          animate={{ scale: 1, rotate: 0, y: 0 }}
          exit={{ scale: 0.5, rotate: 10, y: 100 }}
          transition={{ type: 'spring', bounce: 0.5, duration: 0.6 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-100 via-green-50 to-blue-100 opacity-50" />

          {/* Content */}
          <div className="relative z-10">
            <motion.div
              className="mb-6"
              animate={{
                rotate: [0, -10, 10, -10, 10, 0],
                scale: [1, 1.1, 1, 1.1, 1],
              }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="inline-block p-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-lg">
                <Trophy className="w-16 h-16 text-white" />
              </div>
            </motion.div>

            <motion.h2
              className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Concept Mastered! 🎉
            </motion.h2>

            <motion.p
              className="text-xl text-gray-700 dark:text-gray-300 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              You've mastered{' '}
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {concept}
              </span>
            </motion.p>

            <motion.div
              className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl p-6 mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-yellow-600" />
                <p className="text-lg font-semibold text-gray-800 dark:text-white">
                  Mastery Score: {Math.round(mastery * 100)}%
                </p>
                <Sparkles className="w-5 h-5 text-yellow-600" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Outstanding work! Keep this momentum going!
              </p>
            </motion.div>

            <Button
              onClick={onClose}
              size="lg"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Continue Learning
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Streak Milestone Notification
interface StreakMilestoneProps {
  days: number;
  onClose: () => void;
}

export const StreakMilestone: React.FC<StreakMilestoneProps> = ({ days, onClose }) => {
  const { triggerFireworks } = useCelebration();
  const milestones = [7, 14, 30, 50, 100, 365];

  useEffect(() => {
    if (milestones.includes(days)) {
      triggerFireworks();
    }
  }, [days]);

  if (!milestones.includes(days)) return null;

  return (
    <motion.div
      className="fixed top-20 right-4 bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-2xl shadow-2xl z-50 max-w-sm"
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: 'spring', bounce: 0.4 }}
    >
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-white/80 hover:text-white"
      >
        ✕
      </button>

      <div className="flex items-center gap-4">
        <motion.div
          animate={{
            rotate: [0, 15, -15, 15, -15, 0],
            scale: [1, 1.1, 1, 1.1, 1],
          }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <Flame className="w-12 h-12" />
        </motion.div>
        <div>
          <h3 className="text-2xl font-bold mb-1">{days} Day Streak! 🔥</h3>
          <p className="text-sm opacity-90">You're on fire! Keep it up!</p>
        </div>
      </div>
    </motion.div>
  );
};

// Badge Unlock Animation
interface BadgeUnlockProps {
  title: string;
  description: string;
  icon: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  onClose: () => void;
}

export const BadgeUnlock: React.FC<BadgeUnlockProps> = ({
  title,
  description,
  icon,
  rarity,
  onClose,
}) => {
  const { triggerStars } = useCelebration();

  useEffect(() => {
    if (rarity === 'Epic' || rarity === 'Legendary') {
      triggerStars();
    }
  }, [rarity]);

  const rarityColors = {
    Common: 'from-gray-400 to-gray-600',
    Rare: 'from-blue-400 to-blue-600',
    Epic: 'from-purple-400 to-purple-600',
    Legendary: 'from-yellow-400 to-orange-600',
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
        initial={{ scale: 0, rotate: 180 }}
        animate={{ scale: 1, rotate: 0 }}
        exit={{ scale: 0, rotate: -180 }}
        transition={{ type: 'spring', bounce: 0.6 }}
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          className={`inline-block p-8 bg-gradient-to-br ${rarityColors[rarity]} rounded-full shadow-lg mb-6`}
          animate={{
            boxShadow: [
              '0 0 20px rgba(255,215,0,0.5)',
              '0 0 60px rgba(255,215,0,0.8)',
              '0 0 20px rgba(255,215,0,0.5)',
            ],
          }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <span className="text-6xl">{icon}</span>
        </motion.div>

        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Badge Unlocked!
        </h2>
        <p className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-3">
          {title}
        </p>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{description}</p>

        <Badge variant={rarity} />

        <Button
          onClick={onClose}
          className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          size="lg"
        >
          Awesome!
        </Button>
      </motion.div>
    </motion.div>
  );
};

// Rarity badge component
const Badge: React.FC<{ variant: 'Common' | 'Rare' | 'Epic' | 'Legendary' }> = ({
  variant,
}) => {
  const colors = {
    Common: 'bg-gray-500',
    Rare: 'bg-blue-500',
    Epic: 'bg-purple-500',
    Legendary: 'bg-gradient-to-r from-yellow-500 to-orange-500',
  };

  return (
    <span
      className={`inline-block px-4 py-1 rounded-full text-white text-sm font-semibold ${colors[variant]}`}
    >
      {variant}
    </span>
  );
};

