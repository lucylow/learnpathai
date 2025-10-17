/**
 * Explainability Demo Page
 * 
 * Showcase page for all explainability features
 * Perfect for hackathon judges to see the AI in action
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  WhyThisCard,
  EvidencePanel,
  PathRecalculationAnimation,
  KTModelToggle,
  type WhyThisExplanation,
  type EvidenceData,
  type PathNode,
  type PathRecalculationData,
  type EnsembleData
} from '@/components/explainability';
import {
  Sparkles,
  Play,
  RotateCw,
  Download,
  Award
} from 'lucide-react';

const ExplainabilityDemo: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState<'why' | 'evidence' | 'path' | 'ensemble'>('why');
  
  // Why This Card Demo State
  const [whyThisExplanation, setWhyThisExplanation] = useState<WhyThisExplanation | undefined>();
  const [whyThisLoading, setWhyThisLoading] = useState(false);

  // Evidence Panel Demo State
  const [evidenceData, setEvidenceData] = useState<EvidenceData | undefined>();
  const [evidenceLoading, setEvidenceLoading] = useState(false);

  // Path Recalculation Demo State
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [recalculationData, setRecalculationData] = useState<PathRecalculationData | undefined>();
  const [currentPath, setCurrentPath] = useState<PathNode[]>([
    { id: '1', concept: 'Variables & Data Types', type: 'completed', estimatedTime: '15 min' },
    { id: '2', concept: 'Basic Operators', type: 'completed', estimatedTime: '20 min' },
    { id: '3', concept: 'For Loops', type: 'current', estimatedTime: '25 min' },
    { id: '4', concept: 'While Loops', type: 'upcoming', estimatedTime: '20 min' },
    { id: '5', concept: 'Functions', type: 'upcoming', estimatedTime: '30 min' }
  ]);

  // Ensemble Model Demo State
  const [ensembleData, setEnsembleData] = useState<EnsembleData | undefined>();
  const [ensembleLoading, setEnsembleLoading] = useState(false);

  // Demo Actions

  const handleExplainWhy = () => {
    setWhyThisLoading(true);
    
    setTimeout(() => {
      setWhyThisExplanation({
        reason: "You're building foundational knowledge of 'For Loops'. This resource introduces core concepts clearly with practical examples.",
        evidence: "Based on 3 recent attempts, with 2 incorrect responses",
        evidence_details: {
          transcript_excerpt: "In Python, a for loop iterates over a sequence like a list, tuple, or string. The syntax is: for item in sequence: ...",
          mastery_level: 0.35,
          attempt_count: 3,
          recent_performance: "1/3 correct (33%)"
        },
        next_step: "Watch this 8-minute tutorial carefully and take notes on key concepts in 'For Loops'.",
        confidence: 0.87,
        citations: [
          {
            type: "resource",
            title: "Python Loops Tutorial",
            reason: "Primary recommended resource"
          },
          {
            type: "evidence",
            title: "Recent quiz attempts",
            count: 3,
            reason: "Performance data"
          }
        ],
        timestamp: new Date().toISOString(),
        decision_id: "rec_py_loops_001"
      });
      setWhyThisLoading(false);
    }, 1000);
  };

  const handleLoadEvidence = () => {
    setEvidenceLoading(true);
    
    setTimeout(() => {
      setEvidenceData({
        decision_id: "rec_py_loops_001",
        decision_type: "recommendation",
        timestamp: new Date().toISOString(),
        provenance_chain: [
          {
            step: 1,
            stage: "Data Collection",
            description: "Collected 3 pieces of evidence",
            evidence_types: ["quiz_result", "xapi_event", "resource_interaction"]
          },
          {
            step: 2,
            stage: "Input Preparation",
            description: "Prepared inputs for model inference",
            input_keys: ["concept", "mastery_level", "recent_attempts"]
          },
          {
            step: 3,
            stage: "Model Inference",
            description: "Executed ResourceRanker-v1 model",
            model: "ResourceRanker-v1",
            confidence: 0.87
          },
          {
            step: 4,
            stage: "Decision Output",
            description: "Generated recommendation decision",
            output_keys: ["recommended_resource", "explanation", "next_step"]
          }
        ],
        evidence: {
          events: [
            {
              timestamp: new Date(Date.now() - 300000).toISOString(),
              action: "attempted",
              object: "quiz:loops_basics",
              result: { success: false, score: 0.33 }
            },
            {
              timestamp: new Date(Date.now() - 200000).toISOString(),
              action: "viewed",
              object: "resource:py_loops_intro",
              result: { duration: 120 }
            },
            {
              timestamp: new Date(Date.now() - 100000).toISOString(),
              action: "attempted",
              object: "quiz:loops_practice",
              result: { success: false, score: 0.4 }
            }
          ],
          resources: [
            {
              id: "res_py_loops_001",
              title: "Python Loops Tutorial",
              type: "video"
            }
          ],
          timestamps: {
            first_event: new Date(Date.now() - 300000).toISOString(),
            last_event: new Date(Date.now() - 100000).toISOString(),
            event_count: 3
          }
        },
        confidence_metrics: {
          overall_confidence: 0.87,
          evidence_quality: 0.75,
          data_freshness: 0.92
        },
        citations: [
          {
            type: "resource",
            id: "res_py_loops_001",
            title: "Python Loops Tutorial",
            usage: "Content source"
          },
          {
            type: "data",
            id: "learner_events",
            title: "3 learner interactions",
            usage: "Behavioral evidence"
          }
        ]
      });
      setEvidenceLoading(false);
    }, 1200);
  };

  const handleSimulatePathRecalculation = () => {
    setIsRecalculating(true);
    
    setTimeout(() => {
      const newPath: PathNode[] = [
        { id: '1', concept: 'Variables & Data Types', type: 'completed', estimatedTime: '15 min' },
        { id: '2', concept: 'Basic Operators', type: 'completed', estimatedTime: '20 min' },
        { id: '3', concept: 'For Loops', type: 'current', estimatedTime: '25 min' },
        // Added remediation
        { id: '3a', concept: 'Loop Basics Refresher', type: 'remediation', estimatedTime: '10 min' },
        { id: '3b', concept: 'Loop Practice Problems', type: 'remediation', estimatedTime: '15 min' },
        { id: '4', concept: 'While Loops', type: 'upcoming', estimatedTime: '20 min' },
        { id: '5', concept: 'Functions', type: 'upcoming', estimatedTime: '30 min' }
      ];

      setRecalculationData({
        trigger: {
          type: 'quiz_failed',
          concept: 'For Loops',
          result: false
        },
        old_path: currentPath,
        new_path: newPath,
        reason: "Detected gap in 'For Loops' understanding. Inserting targeted remediation.",
        impact: {
          nodes_added: 2,
          nodes_removed: 0,
          time_delta: '+25 minutes'
        }
      });

      setCurrentPath(newPath);
      setIsRecalculating(false);
    }, 2000);
  };

  const handleLoadEnsemble = () => {
    setEnsembleLoading(true);
    
    setTimeout(() => {
      setEnsembleData({
        beta_prediction: {
          "Variables": 0.85,
          "For Loops": 0.35,
          "While Loops": 0.28,
          "Functions": 0.15,
          "Lists": 0.42
        },
        dkt_prediction: {
          "Variables": 0.88,
          "For Loops": 0.42,
          "While Loops": 0.35,
          "Functions": 0.22,
          "Lists": 0.48
        },
        blended_prediction: {
          "Variables": 0.87,
          "For Loops": 0.39,
          "While Loops": 0.32,
          "Functions": 0.19,
          "Lists": 0.46
        },
        models_used: {
          beta: true,
          dkt: true
        },
        weights: {
          beta: 0.4,
          dkt: 0.6
        }
      });
      setEnsembleLoading(false);
    }, 1000);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-blue-600" />
              Explainability Demo
            </h1>
            <p className="text-lg text-gray-600">
              Judge-impressing AI transparency features for LearnPath AI
            </p>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2">
            <Award className="h-5 w-5 mr-2" />
            Hackathon Ready
          </Badge>
        </div>

        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
          <CardContent className="pt-6">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">4</div>
                <div className="text-sm text-gray-600">Features</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">100%</div>
                <div className="text-sm text-gray-600">Explainable</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">Demo Ready</div>
                <div className="text-sm text-gray-600">Status</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">High Impact</div>
                <div className="text-sm text-gray-600">Judge Score</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Demo Tabs */}
      <Tabs value={activeDemo} onValueChange={(val) => setActiveDemo(val as any)}>
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="why">
            Why This?
          </TabsTrigger>
          <TabsTrigger value="evidence">
            Evidence Panel
          </TabsTrigger>
          <TabsTrigger value="path">
            Path Recalculation
          </TabsTrigger>
          <TabsTrigger value="ensemble">
            Model Ensemble
          </TabsTrigger>
        </TabsList>

        {/* Why This Card Demo */}
        <TabsContent value="why">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Feature: "Why This?" Card</CardTitle>
                  <CardDescription>
                    Explainable recommendation with evidence and citations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-sm">
                    <strong>Demo Script:</strong> "Click 'Explain' to see why the AI recommended 
                    this resource. Notice the reasoning, evidence from quiz attempts, and specific 
                    next steps—all traceable back to source data."
                  </div>
                  <Button 
                    onClick={handleExplainWhy} 
                    disabled={whyThisLoading}
                    className="w-full"
                    size="lg"
                  >
                    <Play className="h-5 w-5 mr-2" />
                    {whyThisLoading ? 'Generating...' : 'Run Demo'}
                  </Button>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p><strong>Wow Factor:</strong> Judges see explainability in action</p>
                    <p><strong>Technical:</strong> Template-based + optional LLM</p>
                    <p><strong>Measure:</strong> Explanation generation latency, trust score</p>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div>
              <WhyThisCard
                resourceTitle="Python Loops Tutorial"
                concept="For Loops"
                explanation={whyThisExplanation}
                isLoading={whyThisLoading}
                onRequestExplanation={handleExplainWhy}
              />
            </div>
          </div>
        </TabsContent>

        {/* Evidence Panel Demo */}
        <TabsContent value="evidence">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Feature: Evidence Panel</CardTitle>
                  <CardDescription>
                    Complete provenance chain for audit & transparency
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 text-sm">
                    <strong>Demo Script:</strong> "Here's the complete audit trail. Judges can 
                    see every piece of evidence: xAPI events, resource interactions, model outputs, 
                    and confidence metrics. Full traceability."
                  </div>
                  <Button 
                    onClick={handleLoadEvidence} 
                    disabled={evidenceLoading}
                    className="w-full"
                    size="lg"
                  >
                    <Play className="h-5 w-5 mr-2" />
                    {evidenceLoading ? 'Loading...' : 'Run Demo'}
                  </Button>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p><strong>Wow Factor:</strong> Auditors love this—complete transparency</p>
                    <p><strong>Technical:</strong> Evidence tracker + provenance chain</p>
                    <p><strong>Measure:</strong> Evidence quality score, completeness %</p>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div>
              <EvidencePanel
                decisionId="rec_py_loops_001"
                evidenceData={evidenceData}
                isLoading={evidenceLoading}
                onRequestEvidence={handleLoadEvidence}
                onExportReport={() => alert('Exporting audit report...')}
              />
            </div>
          </div>
        </TabsContent>

        {/* Path Recalculation Demo */}
        <TabsContent value="path">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Feature: Animated Path Recalculation</CardTitle>
                  <CardDescription>
                    Google Maps-style "recalculating route" animation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200 text-sm">
                    <strong>Demo Script:</strong> "Watch what happens when a student struggles. 
                    The system instantly recalculates the learning path, inserting remediation 
                    steps—just like your GPS rerouting around traffic."
                  </div>
                  <Button 
                    onClick={handleSimulatePathRecalculation} 
                    disabled={isRecalculating}
                    className="w-full"
                    size="lg"
                  >
                    <RotateCw className="h-5 w-5 mr-2" />
                    {isRecalculating ? 'Recalculating...' : 'Simulate Failure'}
                  </Button>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p><strong>Wow Factor:</strong> Instant visual understanding of adaptivity</p>
                    <p><strong>Technical:</strong> Framer Motion + path algorithm</p>
                    <p><strong>Measure:</strong> Reroute count, time-to-mastery delta</p>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div>
              <PathRecalculationAnimation
                isRecalculating={isRecalculating}
                recalculationData={recalculationData}
                currentPath={currentPath}
                onSimulateRecalculation={handleSimulatePathRecalculation}
              />
            </div>
          </div>
        </TabsContent>

        {/* Model Ensemble Demo */}
        <TabsContent value="ensemble">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Feature: Knowledge Tracing Ensemble</CardTitle>
                  <CardDescription>
                    Toggle between Beta, DKT, and blended predictions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200 text-sm">
                    <strong>Demo Script:</strong> "Toggle between models. Beta is explainable 
                    but simple. DKT is accurate but complex. The ensemble balances both—
                    transparency AND performance."
                  </div>
                  <Button 
                    onClick={handleLoadEnsemble} 
                    disabled={ensembleLoading}
                    className="w-full"
                    size="lg"
                  >
                    <Play className="h-5 w-5 mr-2" />
                    {ensembleLoading ? 'Loading...' : 'Run Demo'}
                  </Button>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p><strong>Wow Factor:</strong> Shows technical depth + transparency</p>
                    <p><strong>Technical:</strong> Beta-Bernoulli + DKT + weighted blend</p>
                    <p><strong>Measure:</strong> AUC comparison, explanation coverage</p>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div>
              <KTModelToggle
                ensembleData={ensembleData}
                isLoading={ensembleLoading}
                onRequestPrediction={handleLoadEnsemble}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer with Presentation Tips */}
      <Card className="mt-8 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="h-5 w-5" />
            Presentation Tips for Judges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Demo Flow (3 minutes):</h4>
              <ol className="list-decimal list-inside space-y-1 text-gray-700">
                <li>Start with "Why This?" – show explainability</li>
                <li>Open Evidence Panel – prove traceability</li>
                <li>Trigger path recalculation – visual wow moment</li>
                <li>Toggle models – show technical depth</li>
              </ol>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Key Talking Points:</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>"Every decision is explainable and auditable"</li>
                <li>"Teachers can see exactly why the AI recommends X"</li>
                <li>"Real-time adaptation like Google Maps"</li>
                <li>"Best of both worlds: transparency + accuracy"</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExplainabilityDemo;

