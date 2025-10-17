/**
 * Judge Demo Page
 * 
 * Comprehensive demo showcasing all wow factor features for hackathon judges
 * Features:
 * 1. Animated path recalculation (Google Maps style)
 * 2. Explainable "Why This?" recommendations
 * 3. Live evidence panel
 * 4. Resource ranking visualization
 * 5. AI-generated assessments
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Navigation,
  Sparkles,
  TrendingUp,
  Shield,
  Zap,
  Play,
  RotateCw,
  ChevronRight,
  Award
} from 'lucide-react';
import { PathRecalculationAnimation, PathNode, PathRecalculationData } from '@/components/explainability/PathRecalculationAnimation';
import { WhyThisCard, WhyThisExplanation } from '@/components/explainability/WhyThisCard';
import { EvidencePanel, EvidenceData } from '@/components/explainability/EvidencePanel';
import { cn } from '@/lib/utils';

export default function JudgeDemo() {
  const [activeFeature, setActiveFeature] = useState<'path' | 'recommendations' | 'evidence' | 'ranking'>('path');
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [showEvidence, setShowEvidence] = useState(false);
  const [pathRecalculation, setPathRecalculation] = useState<PathRecalculationData | undefined>();
  const [demoStep, setDemoStep] = useState(0);

  // Demo data
  const initialPath: PathNode[] = [
    { id: 'n1', concept: 'Variables & Data Types', type: 'completed', estimatedTime: '15 min' },
    { id: 'n2', concept: 'Control Flow Basics', type: 'completed', estimatedTime: '20 min' },
    { id: 'n3', concept: 'For Loops', type: 'current', estimatedTime: '25 min' },
    { id: 'n4', concept: 'Functions', type: 'upcoming', estimatedTime: '30 min' },
    { id: 'n5', concept: 'Lists & Dictionaries', type: 'upcoming', estimatedTime: '35 min' },
  ];

  const [currentPath, setCurrentPath] = useState<PathNode[]>(initialPath);

  // Simulated explanation data
  const demoExplanation: WhyThisExplanation = {
    reason: "This video uses visual animations to explain loop iteration, matching your strong preference for visual learning (85% success rate).",
    evidence: "Based on your last 3 quiz attempts on loops (45% success rate) and high engagement with previous visual content.",
    evidence_details: {
      transcript_excerpt: "Watch how the loop counter increments with each iteration...",
      mastery_level: 0.45,
      attempt_count: 3,
      recent_performance: "2/5 correct on loop questions"
    },
    next_step: "Watch the 8-minute visualization, then complete the interactive coding exercise to apply what you learned.",
    confidence: 0.87,
    citations: [
      {
        type: "Learning Style",
        title: "Visual Learning Preference",
        count: 12,
        reason: "85% success rate with video content vs 45% with text"
      },
      {
        type: "Performance Data",
        title: "Recent Quiz Attempts",
        count: 3,
        reason: "Struggled with loop syntax in last 3 attempts"
      },
      {
        type: "Content Analysis",
        title: "Video Transcript",
        reason: "Content matches knowledge gap in loop iteration"
      }
    ],
    timestamp: new Date().toISOString(),
    decision_id: `dec_${Date.now()}`
  };

  // Simulated evidence data
  const demoEvidenceData: EvidenceData = {
    decision_id: `dec_${Date.now()}`,
    decision_type: "Resource Recommendation",
    timestamp: new Date().toISOString(),
    provenance_chain: [
      {
        step: 1,
        stage: "User Performance Analysis",
        description: "Analyzed recent quiz attempts and identified knowledge gaps",
        evidence_types: ["quiz_results", "response_times", "mastery_estimates"],
        model: "Beta Knowledge Tracing v1.2",
        confidence: 0.92
      },
      {
        step: 2,
        stage: "Learning Style Detection",
        description: "Analyzed engagement patterns to determine learning preferences",
        evidence_types: ["video_completion", "reading_engagement", "interaction_patterns"],
        model: "Learning Style Classifier",
        confidence: 0.88
      },
      {
        step: 3,
        stage: "Resource Ranking",
        description: "Ranked candidate resources by historical success rates and style match",
        evidence_types: ["outcome_data", "peer_success", "content_analysis"],
        model: "Outcome-Aware Ranker v2.1",
        confidence: 0.85
      },
      {
        step: 4,
        stage: "Explanation Generation",
        description: "Generated human-readable explanation with citations",
        evidence_types: ["decision_reasoning", "evidence_synthesis"],
        model: "RAG Explainer",
        confidence: 0.87
      }
    ],
    evidence: {
      events: [
        {
          timestamp: new Date(Date.now() - 300000).toISOString(),
          action: "quiz_attempted",
          object: "loops_quiz_01",
          result: { success: false, score: 0.4, time_spent: 180 }
        },
        {
          timestamp: new Date(Date.now() - 600000).toISOString(),
          action: "video_completed",
          object: "variables_intro_video",
          result: { success: true, completion: 0.95, engagement: 0.92 }
        },
        {
          timestamp: new Date(Date.now() - 900000).toISOString(),
          action: "quiz_attempted",
          object: "control_flow_quiz",
          result: { success: true, score: 0.85, time_spent: 120 }
        }
      ],
      resources: [
        { id: "vid_001", title: "Python Loops Visualization", type: "video" },
        { id: "quiz_001", title: "For Loops Practice Quiz", type: "quiz" },
        { id: "article_001", title: "Loop Fundamentals", type: "article" }
      ],
      timestamps: {
        first_event: new Date(Date.now() - 900000).toISOString(),
        last_event: new Date(Date.now() - 300000).toISOString(),
        event_count: 3
      }
    },
    confidence_metrics: {
      overall_confidence: 0.87,
      evidence_quality: 0.89,
      data_freshness: 0.95
    },
    citations: [
      {
        type: "Quiz Result",
        id: "quiz_001",
        title: "loops_quiz_01",
        usage: "Identified knowledge gap in loop iteration"
      },
      {
        type: "Engagement Data",
        id: "engagement_001",
        title: "Video completion metrics",
        usage: "Detected visual learning preference"
      },
      {
        type: "Success Rate",
        id: "outcome_001",
        title: "Historical success data",
        usage: "85% success rate for visual learners with this content"
      }
    ]
  };

  // Simulate path recalculation
  const simulateRecalculation = () => {
    setIsRecalculating(true);
    setDemoStep(1);

    setTimeout(() => {
      const newPath: PathNode[] = [
        { id: 'n1', concept: 'Variables & Data Types', type: 'completed', estimatedTime: '15 min' },
        { id: 'n2', concept: 'Control Flow Basics', type: 'completed', estimatedTime: '20 min' },
        { id: 'n_remedial', concept: 'Loop Fundamentals Review', type: 'remediation', estimatedTime: '10 min' },
        { id: 'n3', concept: 'For Loops', type: 'current', estimatedTime: '25 min' },
        { id: 'n4', concept: 'Functions', type: 'upcoming', estimatedTime: '30 min' },
        { id: 'n5', concept: 'Lists & Dictionaries', type: 'upcoming', estimatedTime: '35 min' },
      ];

      const recalcData: PathRecalculationData = {
        trigger: {
          type: 'quiz_failed',
          concept: 'For Loops',
          result: false
        },
        old_path: initialPath,
        new_path: newPath,
        reason: "Added targeted practice for loop fundamentals after detecting struggle",
        impact: {
          nodes_added: 1,
          nodes_removed: 0,
          time_delta: '+10 min'
        }
      };

      setPathRecalculation(recalcData);
      setCurrentPath(newPath);
      setIsRecalculating(false);
      setDemoStep(2);
    }, 2500);
  };

  const resetDemo = () => {
    setCurrentPath(initialPath);
    setPathRecalculation(undefined);
    setIsRecalculating(false);
    setDemoStep(0);
  };

  const features = [
    {
      id: 'path',
      title: 'Animated Path Recalculation',
      icon: Navigation,
      description: 'Google Maps-style route recalculation',
      color: 'blue'
    },
    {
      id: 'recommendations',
      title: 'Explainable Recommendations',
      icon: Sparkles,
      description: 'AI reasoning with evidence citations',
      color: 'purple'
    },
    {
      id: 'evidence',
      title: 'Live Evidence Panel',
      icon: Shield,
      description: 'Complete decision traceability',
      color: 'green'
    },
    {
      id: 'ranking',
      title: 'Outcome-Aware Ranking',
      icon: TrendingUp,
      description: 'Success-based resource prioritization',
      color: 'orange'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Award className="h-12 w-12" />
              <h1 className="text-5xl font-bold">LearnPath.AI</h1>
            </div>
            <p className="text-xl opacity-90 mb-6">
              Making AI Education Explainable, Transparent & Trustworthy
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Badge variant="secondary" className="px-4 py-2 text-base">
                <Zap className="h-4 w-4 mr-2" />
                Real-Time Adaptation
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-base">
                <Shield className="h-4 w-4 mr-2" />
                Full Transparency
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-base">
                <TrendingUp className="h-4 w-4 mr-2" />
                Outcome-Driven
              </Badge>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Feature Navigation */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            const isActive = activeFeature === feature.id;
            
            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card
                  className={cn(
                    "cursor-pointer transition-all duration-300 hover:shadow-lg",
                    isActive && "ring-2 ring-blue-500 shadow-lg scale-105"
                  )}
                  onClick={() => setActiveFeature(feature.id as any)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "p-3 rounded-lg",
                        feature.color === 'blue' && "bg-blue-100",
                        feature.color === 'purple' && "bg-purple-100",
                        feature.color === 'green' && "bg-green-100",
                        feature.color === 'orange' && "bg-orange-100"
                      )}>
                        <Icon className={cn(
                          "h-6 w-6",
                          feature.color === 'blue' && "text-blue-600",
                          feature.color === 'purple' && "text-purple-600",
                          feature.color === 'green' && "text-green-600",
                          feature.color === 'orange' && "text-orange-600"
                        )} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm mb-1">{feature.title}</h3>
                        <p className="text-xs text-gray-600">{feature.description}</p>
                      </div>
                      {isActive && (
                        <ChevronRight className="h-5 w-5 text-blue-600 animate-pulse" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Demo Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFeature}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Feature 1: Animated Path Recalculation */}
            {activeFeature === 'path' && (
              <div className="space-y-6">
                <Card className="border-2 border-blue-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Navigation className="h-6 w-6 text-blue-600" />
                      Live Path Adaptation
                    </CardTitle>
                    <CardDescription>
                      Watch the system recalculate learning paths in real-time, just like Google Maps rerouting when you miss a turn
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-3">
                      <Button
                        onClick={simulateRecalculation}
                        disabled={isRecalculating}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        {isRecalculating ? (
                          <>
                            <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                            Recalculating...
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Simulate Quiz Failure
                          </>
                        )}
                      </Button>
                      {demoStep > 0 && (
                        <Button onClick={resetDemo} variant="outline">
                          Reset Demo
                        </Button>
                      )}
                    </div>

                    <PathRecalculationAnimation
                      isRecalculating={isRecalculating}
                      recalculationData={pathRecalculation}
                      currentPath={currentPath}
                      className="border-blue-200"
                    />
                  </CardContent>
                </Card>

                {/* Demo Script */}
                <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-600" />
                      Demo Script for Judges
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p className="font-medium">
                      "Meet Alex, a student learning Python. Watch what happens when they struggle with a concept..."
                    </p>
                    <p className="text-gray-700">
                      <strong>Step 1:</strong> Click "Simulate Quiz Failure" to trigger adaptation
                    </p>
                    <p className="text-gray-700">
                      <strong>Step 2:</strong> Watch the system recalculate the path in real-time
                    </p>
                    <p className="text-gray-700">
                      <strong>Step 3:</strong> Notice how targeted remediation is automatically inserted
                    </p>
                    <p className="italic text-purple-700 mt-4">
                      "LearnPath AI just recalculated Alex's route and added a 10-minute loop fundamentals review—personalized support exactly when needed!"
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Feature 2: Explainable Recommendations */}
            {activeFeature === 'recommendations' && (
              <div className="space-y-6">
                <Card className="border-2 border-purple-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-6 w-6 text-purple-600" />
                      Explainable AI Recommendations
                    </CardTitle>
                    <CardDescription>
                      Every recommendation comes with clear reasoning, evidence, and citations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <WhyThisCard
                      resourceTitle="Python Loops Visualization"
                      concept="For Loops"
                      explanation={demoExplanation}
                    />
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-600" />
                      Demo Script for Judges
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p className="font-medium">
                      "No black box here! Every recommendation is fully explainable..."
                    </p>
                    <p className="text-gray-700">
                      <strong>Point out:</strong> AI-generated reasoning based on learning style (85% visual success)
                    </p>
                    <p className="text-gray-700">
                      <strong>Point out:</strong> Evidence from recent performance (45% loop quiz success)
                    </p>
                    <p className="text-gray-700">
                      <strong>Point out:</strong> Citations showing data provenance
                    </p>
                    <p className="italic text-purple-700 mt-4">
                      "Students and teachers can see exactly WHY each resource was chosen—building trust through transparency!"
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Feature 3: Live Evidence Panel */}
            {activeFeature === 'evidence' && (
              <div className="space-y-6">
                <Card className="border-2 border-green-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-6 w-6 text-green-600" />
                      Complete Decision Traceability
                    </CardTitle>
                    <CardDescription>
                      Full audit trail of every AI decision—for accountability and trust
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <EvidencePanel
                      decisionId={demoEvidenceData.decision_id}
                      evidenceData={demoEvidenceData}
                    />
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-green-600" />
                      Demo Script for Judges
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p className="font-medium">
                      "For complete transparency, we expose the entire decision pipeline..."
                    </p>
                    <p className="text-gray-700">
                      <strong>Tab 1 - Provenance:</strong> Show the 4-step decision pipeline
                    </p>
                    <p className="text-gray-700">
                      <strong>Tab 2 - Events:</strong> Show raw learning event data
                    </p>
                    <p className="text-gray-700">
                      <strong>Tab 3 - Resources:</strong> Show which resources were considered
                    </p>
                    <p className="text-gray-700">
                      <strong>Tab 4 - Citations:</strong> Show data sources with IDs
                    </p>
                    <p className="italic text-green-700 mt-4">
                      "Teachers can audit any decision. Parents can understand why content was chosen. This is accountable AI!"
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Feature 4: Outcome-Aware Ranking */}
            {activeFeature === 'ranking' && (
              <div className="space-y-6">
                <Card className="border-2 border-orange-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-6 w-6 text-orange-600" />
                      Outcome-Driven Resource Ranking
                    </CardTitle>
                    <CardDescription>
                      Resources ranked by real success rates, not just popularity
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        {
                          title: "Python Loops Visualization",
                          type: "video",
                          successRate: 0.87,
                          styleMatch: 0.92,
                          engagement: 0.88,
                          rank: 1
                        },
                        {
                          title: "Interactive Loop Practice",
                          type: "interactive",
                          successRate: 0.82,
                          styleMatch: 0.75,
                          engagement: 0.91,
                          rank: 2
                        },
                        {
                          title: "Loop Fundamentals Article",
                          type: "article",
                          successRate: 0.68,
                          styleMatch: 0.45,
                          engagement: 0.62,
                          rank: 3
                        }
                      ].map((resource) => (
                        <motion.div
                          key={resource.title}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: resource.rank * 0.15 }}
                          className="p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-orange-300 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge className="bg-orange-500"># {resource.rank}</Badge>
                                <h3 className="font-semibold">{resource.title}</h3>
                              </div>
                              <Badge variant="outline">{resource.type}</Badge>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-3 text-sm">
                            <div>
                              <div className="text-gray-600 text-xs mb-1">Success Rate</div>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-green-600 h-2 rounded-full transition-all"
                                    style={{ width: `${resource.successRate * 100}%` }}
                                  />
                                </div>
                                <span className="font-semibold text-green-600">
                                  {(resource.successRate * 100).toFixed(0)}%
                                </span>
                              </div>
                            </div>
                            
                            <div>
                              <div className="text-gray-600 text-xs mb-1">Style Match</div>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full transition-all"
                                    style={{ width: `${resource.styleMatch * 100}%` }}
                                  />
                                </div>
                                <span className="font-semibold text-blue-600">
                                  {(resource.styleMatch * 100).toFixed(0)}%
                                </span>
                              </div>
                            </div>
                            
                            <div>
                              <div className="text-gray-600 text-xs mb-1">Engagement</div>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-purple-600 h-2 rounded-full transition-all"
                                    style={{ width: `${resource.engagement * 100}%` }}
                                  />
                                </div>
                                <span className="font-semibold text-purple-600">
                                  {(resource.engagement * 100).toFixed(0)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-orange-600" />
                      Demo Script for Judges
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p className="font-medium">
                      "We don't just recommend popular content—we recommend what WORKS..."
                    </p>
                    <p className="text-gray-700">
                      <strong>Point out:</strong> Success rate shows real student outcomes (87% pass after this video)
                    </p>
                    <p className="text-gray-700">
                      <strong>Point out:</strong> Style match shows personalization (92% match for visual learners)
                    </p>
                    <p className="text-gray-700">
                      <strong>Point out:</strong> Engagement shows student satisfaction
                    </p>
                    <p className="italic text-orange-700 mt-4">
                      "Every resource is ranked by OUTCOMES—what actually helps students succeed, not just what's trendy!"
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer CTA */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-8 px-6 mt-12">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Making AI Education Accountable
          </h2>
          <p className="text-lg opacity-90 mb-6">
            Transparent · Explainable · Trustworthy · Effective
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-purple-600 hover:bg-gray-100"
            >
              <Play className="h-5 w-5 mr-2" />
              Start Full Demo
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10"
            >
              <Shield className="h-5 w-5 mr-2" />
              View Documentation
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}


