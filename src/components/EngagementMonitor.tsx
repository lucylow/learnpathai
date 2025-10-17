import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Activity, 
  AlertTriangle, 
  Coffee, 
  TrendingUp, 
  TrendingDown, 
  Minus 
} from 'lucide-react';
import { engagementService, type EngagementScore } from '@/services/engagementService';

interface EngagementMonitorProps {
  sessionId: string;
  userId: string;
  onBreakRequested?: () => void;
}

export function EngagementMonitor({ sessionId, userId, onBreakRequested }: EngagementMonitorProps) {
  const [score, setScore] = useState<EngagementScore | null>(null);
  const [shouldBreak, setShouldBreak] = useState(false);

  useEffect(() => {
    // Update engagement score every 30 seconds
    const updateScore = () => {
      const newScore = engagementService.calculateEngagementScore(sessionId, userId);
      setScore(newScore);
      setShouldBreak(engagementService.shouldTakeBreak(sessionId, userId));
    };

    updateScore();
    const interval = setInterval(updateScore, 30000);

    return () => clearInterval(interval);
  }, [sessionId, userId]);

  if (!score) return null;

  const getTrendIcon = () => {
    switch (score.trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getScoreColor = (value: number) => {
    if (value >= 0.7) return 'text-green-600';
    if (value >= 0.4) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (value: number) => {
    if (value >= 0.7) return 'default';
    if (value >= 0.4) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="space-y-4">
      {/* Overall Engagement Score */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Engagement Score</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={getScoreBadge(score.overall)}>
                {Math.round(score.overall * 100)}%
              </Badge>
              {getTrendIcon()}
            </div>
          </div>
          <CardDescription>Your learning engagement in this session</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Overall Progress */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Overall</span>
              <span className={getScoreColor(score.overall)}>
                {Math.round(score.overall * 100)}%
              </span>
            </div>
            <Progress value={score.overall * 100} className="h-2" />
          </div>

          {/* Component Scores */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-muted-foreground">Participation</span>
                <span className={getScoreColor(score.participation)}>
                  {Math.round(score.participation * 100)}%
                </span>
              </div>
              <Progress value={score.participation * 100} className="h-1" />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-muted-foreground">Accuracy</span>
                <span className={getScoreColor(score.accuracy)}>
                  {Math.round(score.accuracy * 100)}%
                </span>
              </div>
              <Progress value={score.accuracy * 100} className="h-1" />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-muted-foreground">Focus Time</span>
                <span className={getScoreColor(score.timeOnTask)}>
                  {Math.round(score.timeOnTask * 100)}%
                </span>
              </div>
              <Progress value={score.timeOnTask * 100} className="h-1" />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-muted-foreground">Consistency</span>
                <span className={getScoreColor(score.consistency)}>
                  {Math.round(score.consistency * 100)}%
                </span>
              </div>
              <Progress value={score.consistency * 100} className="h-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      {score.alerts.length > 0 && (
        <div className="space-y-2">
          {score.alerts.map((alert, index) => (
            <Alert 
              key={index}
              variant={alert.severity === 'critical' ? 'destructive' : 'default'}
            >
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>{alert.message}</AlertTitle>
              <AlertDescription className="text-sm">
                {alert.recommendation}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Break Suggestion */}
      {shouldBreak && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Coffee className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-lg text-orange-900">Time for a Break!</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-orange-800">
              You've been learning for a while. Taking a break will help maintain your focus and retention.
            </p>
            <Button 
              onClick={onBreakRequested}
              className="w-full"
              variant="outline"
            >
              <Coffee className="h-4 w-4 mr-2" />
              Take a Break
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

