/**
 * EvidencePanel Component
 * 
 * "Show Me The Evidence" panel for complete decision traceability
 * Displays provenance chain, evidence quality, and audit information
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  FileSearch, 
  Activity, 
  CheckCircle,
  AlertCircle,
  Download,
  ChevronRight,
  Clock,
  Database,
  Cpu,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface EvidenceData {
  decision_id: string;
  decision_type: string;
  timestamp: string;
  provenance_chain: Array<{
    step: number;
    stage: string;
    description: string;
    [key: string]: any;
  }>;
  evidence: {
    events: Array<{
      timestamp: string;
      action: string;
      object: string;
      result: any;
    }>;
    resources: Array<{
      id: string;
      title: string;
      type: string;
    }>;
    timestamps: {
      first_event: string;
      last_event: string;
      event_count: number;
    };
  };
  confidence_metrics: {
    overall_confidence: number;
    evidence_quality: number;
    data_freshness: number;
  };
  citations: Array<{
    type: string;
    id: string;
    title: string;
    usage: string;
  }>;
}

interface EvidencePanelProps {
  decisionId: string;
  evidenceData?: EvidenceData;
  isLoading?: boolean;
  onRequestEvidence?: () => void;
  onExportReport?: () => void;
  className?: string;
}

export const EvidencePanel: React.FC<EvidencePanelProps> = ({
  decisionId,
  evidenceData,
  isLoading = false,
  onRequestEvidence,
  onExportReport,
  className
}) => {
  const [activeTab, setActiveTab] = useState('provenance');

  if (!evidenceData && !isLoading) {
    return (
      <Card className={cn('border-2 border-dashed', className)}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSearch className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Show me the evidence
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onRequestEvidence}
            >
              Load Evidence
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Activity className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Loading evidence...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!evidenceData) return null;

  const getQualityColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-50';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-50';
    return 'text-orange-600 bg-orange-50';
  };

  return (
    <Card className={cn('border-2 border-purple-200', className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-600" />
              Decision Evidence Panel
            </CardTitle>
            <CardDescription className="mt-1 font-mono text-xs">
              {decisionId}
            </CardDescription>
          </div>
          {onExportReport && (
            <Button
              variant="outline"
              size="sm"
              onClick={onExportReport}
              className="ml-2"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
        </div>

        {/* Confidence Metrics Summary */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className={cn(
            'p-2 rounded-lg text-center',
            getQualityColor(evidenceData.confidence_metrics.overall_confidence)
          )}>
            <div className="text-xs font-medium">Overall</div>
            <div className="text-lg font-bold">
              {(evidenceData.confidence_metrics.overall_confidence * 100).toFixed(0)}%
            </div>
          </div>
          <div className={cn(
            'p-2 rounded-lg text-center',
            getQualityColor(evidenceData.confidence_metrics.evidence_quality)
          )}>
            <div className="text-xs font-medium">Quality</div>
            <div className="text-lg font-bold">
              {(evidenceData.confidence_metrics.evidence_quality * 100).toFixed(0)}%
            </div>
          </div>
          <div className={cn(
            'p-2 rounded-lg text-center',
            getQualityColor(evidenceData.confidence_metrics.data_freshness)
          )}>
            <div className="text-xs font-medium">Freshness</div>
            <div className="text-lg font-bold">
              {(evidenceData.confidence_metrics.data_freshness * 100).toFixed(0)}%
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="provenance" className="text-xs">
              <ChevronRight className="h-3 w-3 mr-1" />
              Provenance
            </TabsTrigger>
            <TabsTrigger value="events" className="text-xs">
              <Activity className="h-3 w-3 mr-1" />
              Events
            </TabsTrigger>
            <TabsTrigger value="resources" className="text-xs">
              <Database className="h-3 w-3 mr-1" />
              Resources
            </TabsTrigger>
            <TabsTrigger value="citations" className="text-xs">
              <FileSearch className="h-3 w-3 mr-1" />
              Citations
            </TabsTrigger>
          </TabsList>

          {/* Provenance Chain Tab */}
          <TabsContent value="provenance" className="space-y-2 mt-4">
            <div className="text-sm font-medium text-gray-700 mb-3">
              Decision Pipeline
            </div>
            {evidenceData.provenance_chain.map((step, idx) => (
              <div
                key={step.step}
                className="relative pl-8 pb-4 last:pb-0"
              >
                {/* Vertical line */}
                {idx < evidenceData.provenance_chain.length - 1 && (
                  <div className="absolute left-3 top-6 bottom-0 w-0.5 bg-gray-300" />
                )}
                
                {/* Step circle */}
                <div className="absolute left-0 top-1 flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">
                  {step.step}
                </div>

                {/* Step content */}
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="font-medium text-sm text-gray-900 mb-1">
                    {step.stage}
                  </div>
                  <div className="text-xs text-gray-600">
                    {step.description}
                  </div>
                  
                  {/* Additional step details */}
                  {step.evidence_types && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {step.evidence_types.map((type: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  {step.model && (
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                      <Cpu className="h-3 w-3" />
                      <span>{step.model}</span>
                      {step.confidence && (
                        <Badge variant="outline" className="ml-auto">
                          {(step.confidence * 100).toFixed(0)}% confidence
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-2 mt-4">
            <div className="text-sm font-medium text-gray-700 mb-3 flex items-center justify-between">
              <span>Learning Events ({evidenceData.evidence.events.length})</span>
              {evidenceData.evidence.timestamps && (
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {evidenceData.evidence.timestamps.event_count} total
                </Badge>
              )}
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {evidenceData.evidence.events.map((event, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-gray-50 rounded border border-gray-200 text-xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant="outline" className="text-xs">
                      {event.action}
                    </Badge>
                    <span className="text-gray-500">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-gray-700">
                    Object: <code className="bg-white px-1 py-0.5 rounded">{event.object}</code>
                  </div>
                  {event.result && Object.keys(event.result).length > 0 && (
                    <div className="text-gray-600 mt-1">
                      {event.result.success !== undefined && (
                        <span className="flex items-center gap-1">
                          {event.result.success ? (
                            <CheckCircle className="h-3 w-3 text-green-600" />
                          ) : (
                            <AlertCircle className="h-3 w-3 text-red-600" />
                          )}
                          {event.result.success ? 'Success' : 'Failed'}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-2 mt-4">
            <div className="text-sm font-medium text-gray-700 mb-3">
              Resources Used ({evidenceData.evidence.resources.length})
            </div>
            
            <div className="space-y-2">
              {evidenceData.evidence.resources.map((resource, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-gray-50 rounded border border-gray-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-sm text-gray-900">
                        {resource.title}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 font-mono">
                        ID: {resource.id}
                      </div>
                    </div>
                    <Badge variant="outline" className="ml-2">
                      {resource.type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Citations Tab */}
          <TabsContent value="citations" className="space-y-2 mt-4">
            <div className="text-sm font-medium text-gray-700 mb-3">
              Citations & Sources ({evidenceData.citations.length})
            </div>
            
            <div className="space-y-2">
              {evidenceData.citations.map((citation, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-blue-50 rounded border border-blue-200"
                >
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-0.5">
                      {citation.type}
                    </Badge>
                    <div className="flex-1">
                      <div className="font-medium text-sm text-gray-900">
                        {citation.title}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {citation.usage}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 font-mono">
                        {citation.id}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Timestamp Footer */}
        <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500 flex items-center justify-between">
          <span>Decision made at {new Date(evidenceData.timestamp).toLocaleString()}</span>
          <Badge variant="outline" className="text-xs">
            {evidenceData.decision_type}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default EvidencePanel;

