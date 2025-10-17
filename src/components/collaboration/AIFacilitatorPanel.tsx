/**
 * AIFacilitatorPanel Component
 * 
 * Displays AI-powered facilitation and guidance including:
 * - Conversation summaries
 * - Recommended next steps
 * - Priority concepts
 * - Action items
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { 
  Bot, 
  Lightbulb, 
  Target, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface AIFacilitator {
  summary: string[];
  recommendedNextSteps: string[];
  priorityConcept: string;
  reasoning: string;
  actionItems: Array<{
    task: string;
    assignedTo: string | null;
    reason: string;
  }>;
}

interface AIFacilitatorPanelProps {
  facilitator: AIFacilitator | null;
  onRequestAction: (action: string) => void;
  isConnected: boolean;
}

const AIFacilitatorPanel: React.FC<AIFacilitatorPanelProps> = ({
  facilitator,
  onRequestAction,
  isConnected
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestAction = async (action: string) => {
    setIsLoading(true);
    onRequestAction(action);
    // Reset loading after a short delay
    setTimeout(() => setIsLoading(false), 2000);
  };

  if (!facilitator) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
                <Bot className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>AI Facilitator</CardTitle>
            </div>
            <CardDescription>
              Get AI-powered guidance and recommendations for your study session
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              The AI Facilitator can help you by:
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600" />
                <span>Summarizing group discussions and progress</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600" />
                <span>Identifying priority concepts to focus on</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600" />
                <span>Recommending next steps and action items</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600" />
                <span>Mediating group decisions and conflicts</span>
              </li>
            </ul>
            
            <div className="pt-4 space-y-2">
              <Button
                className="w-full gap-2"
                onClick={() => handleRequestAction('summarize')}
                disabled={!isConnected || isLoading}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Get AI Guidance
                  </>
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                {isConnected ? 'Ready to help!' : 'Connect to room first'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">AI Facilitator</h2>
              <p className="text-sm text-muted-foreground">
                Your intelligent learning companion
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleRequestAction('refresh')}
            disabled={!isConnected || isLoading}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>
        </div>

        {/* Summary */}
        <Card className="border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Session Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {facilitator.summary.map((point, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm">
                  <div className="mt-1 h-2 w-2 rounded-full bg-purple-600 flex-shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Priority Concept */}
        <Card className="border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5 text-orange-600" />
              Priority Focus Area
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-lg px-3 py-1 border-orange-600 text-orange-600">
                  {facilitator.priorityConcept}
                </Badge>
              </div>
              <div className="flex items-start gap-2 bg-background/50 p-3 rounded-lg">
                <AlertCircle className="h-4 w-4 mt-0.5 text-orange-600 flex-shrink-0" />
                <p className="text-sm">{facilitator.reasoning}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommended Next Steps */}
        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lightbulb className="h-5 w-5 text-blue-600" />
              Recommended Next Steps
            </CardTitle>
            <CardDescription>
              Follow these steps to maximize your learning
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {facilitator.recommendedNextSteps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-sm font-bold flex-shrink-0">
                    {idx + 1}
                  </div>
                  <p className="text-sm flex-1">{step}</p>
                  <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Items */}
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Action Items
            </CardTitle>
            <CardDescription>
              Tasks to complete for optimal progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {facilitator.actionItems.map((item, idx) => (
                <div key={idx} className="group">
                  <div className="flex items-start gap-3 p-4 rounded-lg border border-border hover:border-green-600 transition-colors">
                    <div className="flex-shrink-0 mt-1">
                      <div className="h-5 w-5 rounded border-2 border-green-600 group-hover:bg-green-600 transition-colors" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <p className="font-medium">{item.task}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        {item.assignedTo ? (
                          <Badge variant="secondary" className="text-xs">
                            👤 {item.assignedTo}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            🎯 Team Task
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">• {item.reason}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => handleRequestAction('progress_check')}
                disabled={!isConnected}
              >
                <Target className="h-4 w-4" />
                Progress Check
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => handleRequestAction('suggest_resources')}
                disabled={!isConnected}
              >
                <Lightbulb className="h-4 w-4" />
                Suggest Resources
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => handleRequestAction('resolve_confusion')}
                disabled={!isConnected}
              >
                <AlertCircle className="h-4 w-4" />
                Help with Confusion
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => handleRequestAction('next_challenge')}
                disabled={!isConnected}
              >
                <Sparkles className="h-4 w-4" />
                Next Challenge
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
};

export default AIFacilitatorPanel;

