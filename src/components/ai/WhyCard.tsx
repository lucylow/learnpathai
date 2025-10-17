/**
 * WhyCard Component
 * Shows AI-generated explanation for why a resource is recommended
 */

import React from 'react';
import { Lightbulb, AlertCircle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { useExplanation } from '../../hooks/useExplanation';

interface WhyCardProps {
  userId: string;
  nodeId: string;
  resourceId: string;
  recentAttempts?: Array<{
    node_id: string;
    score_pct: number;
    hints_used: number;
  }>;
  onClose?: () => void;
}

export const WhyCard: React.FC<WhyCardProps> = ({
  userId,
  nodeId,
  resourceId,
  recentAttempts = [],
  onClose,
}) => {
  const { explanation, loading, error, fetchExplanation } = useExplanation();

  const handleFetchExplanation = () => {
    fetchExplanation({
      user_id: userId,
      node_id: nodeId,
      resource_id: resourceId,
      recent_attempts: recentAttempts,
    });
  };

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-lg">Why This Resource?</CardTitle>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          )}
        </div>
        <CardDescription>
          AI-powered explanation of why this resource is recommended for you
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {!explanation && !loading && (
          <Button
            onClick={handleFetchExplanation}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            <Lightbulb className="mr-2 h-4 w-4" />
            Generate Explanation
          </Button>
        )}

        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <span className="ml-3 text-gray-600">Thinking...</span>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {explanation && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-purple-600 mt-1" />
                <div className="flex-1">
                  <p className="text-gray-800 leading-relaxed">
                    {explanation.explanation}
                  </p>
                </div>
              </div>
            </div>

            {explanation.evidence && (
              <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
                <p className="text-sm font-medium text-indigo-900 mb-1">
                  Evidence
                </p>
                <p className="text-sm text-indigo-700">
                  "{explanation.evidence}"
                </p>
              </div>
            )}

            {explanation.next_step && (
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <p className="text-sm font-medium text-green-900 mb-1">
                  Next Step
                </p>
                <p className="text-sm text-green-700">
                  {explanation.next_step}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                Confidence: {Math.round(explanation.confidence * 100)}%
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleFetchExplanation}
              >
                Regenerate
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WhyCard;


