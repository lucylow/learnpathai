import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Coffee, 
  Play, 
  Pause, 
  RotateCcw, 
  Clock,
  CheckCircle2 
} from 'lucide-react';
import { engagementService } from '@/services/engagementService';
import { track } from '@/utils/telemetry';

interface BreakTimerProps {
  sessionId: string;
  userId: string;
  onBreakComplete?: () => void;
}

export function BreakTimer({ sessionId, userId, onBreakComplete }: BreakTimerProps) {
  const [breakType, setBreakType] = useState<'micro' | 'short' | 'extended'>('short');
  const [duration, setDuration] = useState(5); // minutes
  const [timeRemaining, setTimeRemaining] = useState(duration * 60); // seconds
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activities, setActivities] = useState<string[]>([]);
  const [completedActivities, setCompletedActivities] = useState<Set<number>>(new Set());

  useEffect(() => {
    const recommendation = engagementService.getBreakRecommendation(sessionId, userId);
    setBreakType(recommendation.type);
    setDuration(recommendation.duration);
    setTimeRemaining(recommendation.duration * 60);
    setActivities(recommendation.activities);
  }, [sessionId, userId]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && !isPaused && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(time => {
          if (time <= 1) {
            handleBreakComplete();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isPaused, timeRemaining]);

  const handleStart = () => {
    setIsActive(true);
    setIsPaused(false);
    track('break_started', {
      sessionId,
      userId,
      breakType,
      duration,
      timestamp: new Date().toISOString(),
    });
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
    track('break_paused', {
      sessionId,
      userId,
      isPaused: !isPaused,
      timeRemaining,
    });
  };

  const handleReset = () => {
    setIsActive(false);
    setIsPaused(false);
    setTimeRemaining(duration * 60);
    setCompletedActivities(new Set());
    track('break_reset', { sessionId, userId });
  };

  const handleBreakComplete = () => {
    setIsActive(false);
    track('break_completed', {
      sessionId,
      userId,
      breakType,
      duration,
      activitiesCompleted: completedActivities.size,
      timestamp: new Date().toISOString(),
    });
    
    if (onBreakComplete) {
      onBreakComplete();
    }
  };

  const toggleActivity = (index: number) => {
    const newCompleted = new Set(completedActivities);
    if (newCompleted.has(index)) {
      newCompleted.delete(index);
    } else {
      newCompleted.add(index);
    }
    setCompletedActivities(newCompleted);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((duration * 60 - timeRemaining) / (duration * 60)) * 100;

  const getBreakTypeColor = () => {
    switch (breakType) {
      case 'micro':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'short':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'extended':
        return 'bg-purple-100 text-purple-800 border-purple-200';
    }
  };

  const getBreakTypeLabel = () => {
    switch (breakType) {
      case 'micro':
        return 'Micro Break';
      case 'short':
        return 'Short Break';
      case 'extended':
        return 'Extended Break';
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coffee className="h-5 w-5 text-primary" />
            <CardTitle>Break Time</CardTitle>
          </div>
          <Badge className={getBreakTypeColor()}>
            {getBreakTypeLabel()}
          </Badge>
        </div>
        <CardDescription>
          Take a {duration}-minute break to recharge and maintain focus
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Timer Display */}
        <div className="text-center space-y-3">
          <div className="text-6xl font-bold text-primary">
            {formatTime(timeRemaining)}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Timer Controls */}
        <div className="flex gap-2 justify-center">
          {!isActive ? (
            <Button onClick={handleStart} size="lg" className="flex-1">
              <Play className="h-4 w-4 mr-2" />
              Start Break
            </Button>
          ) : (
            <>
              <Button 
                onClick={handlePause} 
                size="lg" 
                variant="outline"
                className="flex-1"
              >
                {isPaused ? (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </>
                )}
              </Button>
              <Button 
                onClick={handleReset} 
                size="lg" 
                variant="outline"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        {/* Suggested Activities */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Suggested Activities
          </h4>
          <div className="space-y-2">
            {activities.map((activity, index) => (
              <label
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={completedActivities.has(index)}
                  onChange={() => toggleActivity(index)}
                  className="mt-1"
                />
                <span className={`text-sm flex-1 ${completedActivities.has(index) ? 'line-through text-muted-foreground' : ''}`}>
                  {activity}
                </span>
                {completedActivities.has(index) && (
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Progress Summary */}
        {isActive && (
          <div className="text-center text-sm text-muted-foreground">
            {completedActivities.size} of {activities.length} activities completed
          </div>
        )}
      </CardContent>
    </Card>
  );
}

