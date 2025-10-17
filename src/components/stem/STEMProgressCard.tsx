/**
 * STEMProgressCard Component
 * 
 * Compact visualization of STEM learning progress
 * Perfect for dashboard widgets and overview pages
 */

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Target,
  Award
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface STEMProgressData {
  subject: string;
  overall_mastery: number;
  completed_concepts: number;
  total_concepts: number;
  estimated_hours_remaining: number;
  current_streak: number;
  last_updated: string;
}

interface STEMProgressCardProps {
  data: STEMProgressData;
  className?: string;
  onClick?: () => void;
}

const getSubjectColor = (subject: string): string => {
  const colors: Record<string, string> = {
    programming: 'from-blue-500 to-cyan-500',
    math: 'from-purple-500 to-pink-500',
    physics: 'from-green-500 to-emerald-500',
    chemistry: 'from-orange-500 to-red-500',
    biology: 'from-teal-500 to-green-500',
  };
  return colors[subject.toLowerCase()] || 'from-gray-500 to-slate-500';
};

const getSubjectIcon = (subject: string): string => {
  const icons: Record<string, string> = {
    programming: '💻',
    math: '📐',
    physics: '⚛️',
    chemistry: '🧪',
    biology: '🧬',
  };
  return icons[subject.toLowerCase()] || '📚';
};

export const STEMProgressCard: React.FC<STEMProgressCardProps> = ({
  data,
  className,
  onClick
}) => {
  const masteryPercentage = Math.round(data.overall_mastery * 100);
  const completionRate = Math.round((data.completed_concepts / data.total_concepts) * 100);

  return (
    <Card 
      className={cn(
        "cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden",
        className
      )}
      onClick={onClick}
    >
      {/* Gradient Header */}
      <div className={cn(
        "h-2 bg-gradient-to-r",
        getSubjectColor(data.subject)
      )} />

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getSubjectIcon(data.subject)}</span>
            <div>
              <CardTitle className="text-lg">
                {data.subject.charAt(0).toUpperCase() + data.subject.slice(1)}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Last updated {new Date(data.last_updated).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary">
              {masteryPercentage}%
            </div>
            <p className="text-xs text-muted-foreground">Mastery</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Mastery Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium flex items-center gap-1">
              <Brain className="h-4 w-4 text-primary" />
              Overall Progress
            </span>
            <Badge variant={masteryPercentage >= 80 ? 'default' : 'secondary'}>
              {masteryPercentage >= 80 ? 'Advanced' : masteryPercentage >= 50 ? 'Intermediate' : 'Beginner'}
            </Badge>
          </div>
          <Progress value={masteryPercentage} className="h-2" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-xs text-muted-foreground">Completed</span>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {data.completed_concepts}/{data.total_concepts}
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-xs text-muted-foreground">Est. Time</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {data.estimated_hours_remaining}h
            </p>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-orange-500" />
            <span className="text-sm">
              <span className="font-semibold">{completionRate}%</span>
              <span className="text-muted-foreground"> complete</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-yellow-500" />
            <span className="text-sm">
              <span className="font-semibold">{data.current_streak}</span>
              <span className="text-muted-foreground"> day streak</span>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default STEMProgressCard;


