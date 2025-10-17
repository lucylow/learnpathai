// src/components/MasteryGauge.tsx
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MasteryGaugeProps {
  mastery: number; // 0-1
  concept: string;
  size?: number;
  previousMastery?: number;
  showTrend?: boolean;
  animated?: boolean;
}

export const MasteryGauge: React.FC<MasteryGaugeProps> = ({ 
  mastery, 
  concept,
  size = 140,
  previousMastery,
  showTrend = true,
  animated = true
}) => {
  const [displayMastery, setDisplayMastery] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => setDisplayMastery(mastery), 100);
      return () => clearTimeout(timer);
    } else {
      setDisplayMastery(mastery);
    }
  }, [mastery, animated]);

  const radius = (size - 24) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayMastery * circumference);

  const getColor = (): string => {
    if (mastery >= 0.7) return '#10b981'; // Green
    if (mastery >= 0.4) return '#f59e0b'; // Orange
    return '#ef4444'; // Red
  };

  const getGradientId = () => `gradient-${concept.replace(/\s+/g, '-')}`;

  const getTrend = () => {
    if (!previousMastery) return null;
    const diff = mastery - previousMastery;
    if (Math.abs(diff) < 0.01) return { icon: Minus, text: 'No change', color: 'text-gray-500' };
    if (diff > 0) return { icon: TrendingUp, text: `+${(diff * 100).toFixed(1)}%`, color: 'text-green-600' };
    return { icon: TrendingDown, text: `${(diff * 100).toFixed(1)}%`, color: 'text-red-600' };
  };

  const getStatusEmoji = () => {
    if (mastery >= 0.7) return '🎯';
    if (mastery >= 0.4) return '📚';
    return '🌱';
  };

  const trend = getTrend();

  return (
    <motion.div 
      className="flex flex-col items-center"
      whileHover={{ scale: 1.05 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div 
        className="relative cursor-pointer"
        style={{ width: size, height: size }}
      >
        {/* SVG Gauge */}
        <svg 
          width={size} 
          height={size} 
          className="transform -rotate-90"
        >
          <defs>
            <linearGradient id={getGradientId()} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={getColor()} stopOpacity="1" />
              <stop offset="100%" stopColor={getColor()} stopOpacity="0.6" />
            </linearGradient>
            <filter id="shadow">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3"/>
            </filter>
          </defs>
          
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="12"
          />
          
          {/* Progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={`url(#${getGradientId()})`}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ 
              duration: animated ? 1.5 : 0, 
              ease: "easeOut",
              delay: 0.1
            }}
            filter="url(#shadow)"
          />

          {/* Glow effect when hovered */}
          {isHovered && (
            <motion.circle
              cx={size / 2}
              cy={size / 2}
              r={radius + 5}
              fill="none"
              stroke={getColor()}
              strokeWidth="2"
              strokeOpacity="0.3"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span 
            className="text-3xl font-bold text-gray-900"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: animated ? 0.5 : 0 }}
          >
            {Math.round(displayMastery * 100)}
          </motion.span>
          <span className="text-xs text-gray-500 font-medium">%</span>
          <motion.span 
            className="text-2xl mt-1"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: animated ? 0.8 : 0 }}
          >
            {getStatusEmoji()}
          </motion.span>
        </div>

        {/* Animated pulse for low mastery */}
        {mastery < 0.4 && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ 
              border: '3px solid #ef4444',
              opacity: 0.3
            }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.1, 0.3]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
      </div>

      {/* Concept label */}
      <motion.p 
        className="mt-3 text-sm font-semibold text-gray-800 capitalize text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: animated ? 0.3 : 0 }}
      >
        {concept}
      </motion.p>

      {/* Trend indicator */}
      {showTrend && trend && (
        <motion.div 
          className={`flex items-center gap-1 mt-1 text-xs font-medium ${trend.color}`}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: animated ? 0.5 : 0 }}
        >
          <trend.icon className="w-3 h-3" />
          <span>{trend.text}</span>
        </motion.div>
      )}

      {/* Status message */}
      <motion.div
        className="mt-2 text-xs text-gray-600 text-center px-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: animated ? 0.7 : 0 }}
      >
        {mastery >= 0.7 && <span className="text-green-600 font-medium">Excellent! Keep it up! 🌟</span>}
        {mastery >= 0.4 && mastery < 0.7 && <span className="text-amber-600 font-medium">Good progress!</span>}
        {mastery < 0.4 && <span className="text-red-600 font-medium">Needs attention</span>}
      </motion.div>
    </motion.div>
  );
};

// Grid layout for multiple gauges
export const MasteryGaugeGrid: React.FC<{ 
  masteryData: Array<{ concept: string; mastery: number; previousMastery?: number }> 
}> = ({ masteryData }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
      {masteryData.map((data, idx) => (
        <motion.div
          key={data.concept}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
        >
          <MasteryGauge
            concept={data.concept}
            mastery={data.mastery}
            previousMastery={data.previousMastery}
            showTrend={true}
          />
        </motion.div>
      ))}
    </div>
  );
};

