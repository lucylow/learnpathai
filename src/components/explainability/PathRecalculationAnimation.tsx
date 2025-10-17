/**
 * PathRecalculationAnimation Component
 * 
 * Google Maps-style animated path recalculation
 * Shows visual "recalculating route" when learner performance changes
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Navigation, 
  MapPin, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowRight,
  RotateCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export interface PathNode {
  id: string;
  concept: string;
  type: 'completed' | 'current' | 'upcoming' | 'remediation';
  estimatedTime?: string;
}

export interface PathRecalculationData {
  trigger: {
    type: 'quiz_failed' | 'quiz_passed' | 'time_elapsed';
    concept: string;
    result?: boolean;
  };
  old_path: PathNode[];
  new_path: PathNode[];
  reason: string;
  impact: {
    nodes_added: number;
    nodes_removed: number;
    time_delta: string;
  };
}

interface PathRecalculationAnimationProps {
  isRecalculating: boolean;
  recalculationData?: PathRecalculationData;
  currentPath: PathNode[];
  onSimulateRecalculation?: () => void;
  className?: string;
}

export const PathRecalculationAnimation: React.FC<PathRecalculationAnimationProps> = ({
  isRecalculating,
  recalculationData,
  currentPath,
  onSimulateRecalculation,
  className
}) => {
  const [showRecalculating, setShowRecalculating] = useState(false);
  const [showNewPath, setShowNewPath] = useState(false);

  useEffect(() => {
    if (isRecalculating) {
      setShowRecalculating(true);
      setShowNewPath(false);
      
      // Simulate recalculation time
      const timer = setTimeout(() => {
        setShowRecalculating(false);
        setShowNewPath(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isRecalculating]);

  const getNodeIcon = (type: PathNode['type']) => {
    switch (type) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'current':
        return <MapPin className="h-4 w-4 text-blue-600" />;
      case 'remediation':
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-gray-400" />;
    }
  };

  const getNodeColor = (type: PathNode['type']) => {
    switch (type) {
      case 'completed':
        return 'bg-green-100 border-green-300';
      case 'current':
        return 'bg-blue-100 border-blue-300';
      case 'remediation':
        return 'bg-orange-100 border-orange-300';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  };

  const displayPath = showNewPath && recalculationData ? recalculationData.new_path : currentPath;

  return (
    <Card className={cn('border-2', className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <Navigation className={cn(
                "h-5 w-5",
                isRecalculating ? "text-blue-600 animate-spin" : "text-gray-700"
              )} />
              Learning Path
            </CardTitle>
            <CardDescription className="mt-1">
              {isRecalculating ? 'Recalculating optimal route...' : 'Your personalized learning journey'}
            </CardDescription>
          </div>
          {onSimulateRecalculation && !isRecalculating && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSimulateRecalculation}
              className="ml-2"
            >
              <RotateCw className="h-4 w-4 mr-2" />
              Simulate
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {/* Recalculating Overlay */}
        <AnimatePresence>
          {showRecalculating && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="mb-4 p-4 bg-blue-50 border-2 border-blue-300 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Navigation className="h-8 w-8 text-blue-600 animate-spin" />
                  <div className="absolute inset-0 bg-blue-400 blur-lg opacity-50 animate-pulse" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-blue-900">
                    Recalculating your route...
                  </div>
                  <div className="text-sm text-blue-700 mt-1">
                    {recalculationData?.reason || 'Analyzing your progress and adjusting path'}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trigger Information */}
        {recalculationData && showNewPath && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-yellow-50 border border-yellow-300 rounded-lg"
          >
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="font-medium text-sm text-yellow-900">
                  Path Updated
                </div>
                <div className="text-sm text-yellow-800 mt-1">
                  {recalculationData.trigger.type === 'quiz_failed' && (
                    <>Missed concept: <strong>{recalculationData.trigger.concept}</strong></>
                  )}
                  {recalculationData.trigger.type === 'quiz_passed' && (
                    <>Mastered: <strong>{recalculationData.trigger.concept}</strong></>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {recalculationData.impact.nodes_added > 0 && (
                    <Badge variant="outline" className="bg-white text-xs">
                      +{recalculationData.impact.nodes_added} steps added
                    </Badge>
                  )}
                  {recalculationData.impact.nodes_removed > 0 && (
                    <Badge variant="outline" className="bg-white text-xs">
                      -{recalculationData.impact.nodes_removed} steps removed
                    </Badge>
                  )}
                  <Badge variant="outline" className="bg-white text-xs">
                    {recalculationData.impact.time_delta}
                  </Badge>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Path Visualization */}
        <div className="relative">
          {displayPath.map((node, idx) => (
            <motion.div
              key={`${node.id}-${idx}`}
              initial={showNewPath ? { opacity: 0, x: -20 } : false}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="relative"
            >
              {/* Connector Line */}
              {idx < displayPath.length - 1 && (
                <div className="absolute left-6 top-10 bottom-0 w-0.5 bg-gray-300 z-0" />
              )}

              {/* Node */}
              <div className="relative flex items-center gap-3 mb-3 z-10">
                {/* Icon Circle */}
                <div className={cn(
                  'flex items-center justify-center w-12 h-12 rounded-full border-2',
                  getNodeColor(node.type)
                )}>
                  {getNodeIcon(node.type)}
                </div>

                {/* Content */}
                <div className={cn(
                  'flex-1 p-3 rounded-lg border-2',
                  getNodeColor(node.type)
                )}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-sm text-gray-900">
                        {node.concept}
                      </div>
                      {node.estimatedTime && (
                        <div className="text-xs text-gray-600 mt-1">
                          {node.estimatedTime}
                        </div>
                      )}
                    </div>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        'ml-2 text-xs',
                        node.type === 'remediation' && 'bg-orange-200 border-orange-400'
                      )}
                    >
                      {node.type === 'remediation' ? 'Extra Practice' : node.type}
                    </Badge>
                  </div>
                </div>

                {/* Arrow for current to next */}
                {node.type === 'current' && idx < displayPath.length - 1 && (
                  <ArrowRight className="h-5 w-5 text-blue-600 animate-pulse" />
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Path Stats */}
        <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-green-50 rounded">
            <div className="text-xs text-gray-600">Completed</div>
            <div className="text-lg font-bold text-green-600">
              {displayPath.filter(n => n.type === 'completed').length}
            </div>
          </div>
          <div className="p-2 bg-blue-50 rounded">
            <div className="text-xs text-gray-600">Current</div>
            <div className="text-lg font-bold text-blue-600">
              {displayPath.filter(n => n.type === 'current').length}
            </div>
          </div>
          <div className="p-2 bg-gray-50 rounded">
            <div className="text-xs text-gray-600">Remaining</div>
            <div className="text-lg font-bold text-gray-600">
              {displayPath.filter(n => n.type === 'upcoming').length}
            </div>
          </div>
        </div>

        {/* Demo narration hint */}
        {showNewPath && recalculationData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800"
          >
            <strong>Demo Script:</strong> "Alex just missed question 3 on '{recalculationData.trigger.concept}'. 
            LearnPath AI recalculated the route and inserted {recalculationData.impact.nodes_added} targeted 
            remediation step{recalculationData.impact.nodes_added > 1 ? 's' : ''} to ensure mastery."
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

export default PathRecalculationAnimation;

