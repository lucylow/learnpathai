import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, Flame } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface XPTrackerProps {
  currentXP: number;
  level: number;
  nextLevelXP: number;
  streak: number;
  showAnimation?: boolean;
}

export function XPTracker({ currentXP, level, nextLevelXP, streak, showAnimation = false }: XPTrackerProps) {
  const [showLevelUp, setShowLevelUp] = useState(false);
  const xpProgress = (currentXP / nextLevelXP) * 100;

  useEffect(() => {
    if (showAnimation) {
      setShowLevelUp(true);
      const timer = setTimeout(() => setShowLevelUp(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showAnimation]);

  return (
    <div className="relative">
      <Card className="overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {level}
                </div>
                <motion.div
                  className="absolute -top-1 -right-1"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="h-6 w-6 text-yellow-500" />
                </motion.div>
              </div>
              <div>
                <h3 className="font-bold text-lg">Level {level}</h3>
                <p className="text-sm text-muted-foreground">
                  {currentXP} / {nextLevelXP} XP
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <Badge variant="secondary" className="gap-2 px-3 py-1">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="font-bold">{streak}</span>
                <span className="text-xs">day streak</span>
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress to next level</span>
              <span className="font-medium">{Math.round(xpProgress)}%</span>
            </div>
            <div className="relative">
              <Progress 
                value={xpProgress} 
                className="h-3 bg-gradient-to-r from-primary/20 to-accent/20"
              />
              <motion.div
                className="absolute top-0 left-0 h-3 bg-gradient-to-r from-primary to-accent rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {nextLevelXP - currentXP} XP needed to level up
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Level Up Animation */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -50 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
          >
            <div className="bg-gradient-to-br from-primary to-accent text-white px-8 py-6 rounded-2xl shadow-2xl text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-2" />
              <h2 className="text-3xl font-bold">Level Up!</h2>
              <p className="text-lg">You've reached Level {level}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

