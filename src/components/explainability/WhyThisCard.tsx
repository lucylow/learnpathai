/**
 * WhyThisCard Component
 * 
 * Displays explainable "Why this?" card for resource recommendations
 * Shows reasoning, evidence, and next steps with citations
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  HelpCircle, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  FileText,
  ExternalLink 
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface WhyThisExplanation {
  reason: string;
  evidence: string;
  evidence_details?: {
    transcript_excerpt?: string;
    mastery_level: number;
    attempt_count: number;
    recent_performance: string;
  };
  next_step: string;
  confidence: number;
  citations: Array<{
    type: string;
    title: string;
    count?: number;
    reason: string;
  }>;
  timestamp: string;
  decision_id?: string;
}

interface WhyThisCardProps {
  resourceTitle: string;
  concept: string;
  explanation?: WhyThisExplanation;
  isLoading?: boolean;
  onRequestExplanation?: () => void;
  className?: string;
}

export const WhyThisCard: React.FC<WhyThisCardProps> = ({
  resourceTitle,
  concept,
  explanation,
  isLoading = false,
  onRequestExplanation,
  className
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50 border-green-200';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-orange-600 bg-orange-50 border-orange-200';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'High confidence';
    if (confidence >= 0.6) return 'Medium confidence';
    return 'Lower confidence';
  };

  if (!explanation) {
    return (
      <Card className={cn('border-2 border-dashed', className)}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Why was this recommended?
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onRequestExplanation}
              disabled={isLoading}
            >
              {isLoading ? 'Generating...' : 'Explain'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('border-2 border-blue-200 bg-blue-50/50', className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-blue-600" />
              Why this resource?
            </CardTitle>
            <CardDescription className="mt-1">
              {resourceTitle}
            </CardDescription>
          </div>
          <Badge 
            variant="outline" 
            className={cn(
              'ml-2',
              getConfidenceColor(explanation.confidence)
            )}
          >
            {getConfidenceLabel(explanation.confidence)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Main Reason */}
        <div className="p-3 bg-white rounded-lg border border-blue-200">
          <div className="flex items-start gap-2">
            <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-sm text-gray-700 mb-1">Reasoning</p>
              <p className="text-sm text-gray-900">{explanation.reason}</p>
            </div>
          </div>
        </div>

        {/* Evidence Summary */}
        <div className="p-3 bg-white rounded-lg border border-gray-200">
          <div className="flex items-start gap-2">
            <FileText className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-sm text-gray-700 mb-1">Evidence</p>
              <p className="text-sm text-gray-600">{explanation.evidence}</p>
              
              {explanation.evidence_details && (
                <div className="mt-2 text-xs text-gray-500 space-y-1">
                  <div>
                    Recent performance: {explanation.evidence_details.recent_performance}
                  </div>
                  <div>
                    Mastery level: {(explanation.evidence_details.mastery_level * 100).toFixed(0)}%
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Next Step */}
        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-sm text-gray-700 mb-1">Next Step</p>
              <p className="text-sm text-gray-900">{explanation.next_step}</p>
            </div>
          </div>
        </div>

        {/* Expandable Details */}
        {(explanation.citations?.length > 0 || explanation.evidence_details?.transcript_excerpt) && (
          <div className="pt-2 border-t border-gray-200">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Hide' : 'Show'} detailed evidence
              <ExternalLink className="ml-2 h-3 w-3" />
            </Button>

            {isExpanded && (
              <div className="mt-3 space-y-3">
                {/* Citations */}
                {explanation.citations?.length > 0 && (
                  <div className="text-xs">
                    <p className="font-medium text-gray-700 mb-2">Citations & Sources</p>
                    <div className="space-y-2">
                      {explanation.citations.map((citation, idx) => (
                        <div 
                          key={idx}
                          className="p-2 bg-gray-50 rounded border border-gray-200"
                        >
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {citation.type}
                            </Badge>
                            <span className="font-medium">{citation.title}</span>
                            {citation.count && (
                              <span className="text-gray-500">({citation.count})</span>
                            )}
                          </div>
                          <p className="text-gray-600 mt-1">{citation.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Transcript Excerpt */}
                {explanation.evidence_details?.transcript_excerpt && (
                  <div className="text-xs">
                    <p className="font-medium text-gray-700 mb-2">Resource Excerpt</p>
                    <div className="p-2 bg-gray-50 rounded border border-gray-200 italic">
                      "{explanation.evidence_details.transcript_excerpt}"
                    </div>
                  </div>
                )}

                {/* Decision ID for Audit */}
                {explanation.decision_id && (
                  <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
                    <p>
                      Decision ID: <code className="bg-gray-100 px-1 py-0.5 rounded">
                        {explanation.decision_id}
                      </code>
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Confidence Indicator */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-200">
          <span>Confidence: {(explanation.confidence * 100).toFixed(0)}%</span>
          <span>Generated at {new Date(explanation.timestamp).toLocaleTimeString()}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default WhyThisCard;

