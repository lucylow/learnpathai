import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Layout } from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, 
  TrendingUp, 
  Zap, 
  Target, 
  BookOpen, 
  CheckCircle2,
  Circle,
  AlertCircle,
  Sparkles,
  BarChart3
} from "lucide-react";
import { mockConceptMastery, mockLearningHistory } from "@/services/mockData";
import { KnowledgeRadar } from "@/components/charts/KnowledgeRadar";
import { LearningTimeline } from "@/components/charts/LearningTimeline";
import { ConceptGraph } from "@/components/charts/ConceptGraph";
import { motion, AnimatePresence } from "framer-motion";

interface ConceptNode {
  id: string;
  name: string;
  mastery: number;
  status: 'locked' | 'available' | 'in-progress' | 'mastered';
  prerequisites: string[];
}

const mockKnowledgeGraph: ConceptNode[] = [
  { id: '1', name: 'Variables', mastery: 0.92, status: 'mastered', prerequisites: [] },
  { id: '2', name: 'Data Types', mastery: 0.88, status: 'mastered', prerequisites: ['1'] },
  { id: '3', name: 'Operators', mastery: 0.85, status: 'mastered', prerequisites: ['1'] },
  { id: '4', name: 'Conditionals', mastery: 0.78, status: 'in-progress', prerequisites: ['2', '3'] },
  { id: '5', name: 'Loops', mastery: 0.72, status: 'in-progress', prerequisites: ['4'] },
  { id: '6', name: 'Functions', mastery: 0.65, status: 'in-progress', prerequisites: ['5'] },
  { id: '7', name: 'Arrays', mastery: 0.54, status: 'available', prerequisites: ['5', '6'] },
  { id: '8', name: 'Objects', mastery: 0.42, status: 'available', prerequisites: ['7'] },
  { id: '9', name: 'Classes', mastery: 0.30, status: 'locked', prerequisites: ['6', '8'] },
  { id: '10', name: 'Async/Await', mastery: 0.15, status: 'locked', prerequisites: ['6', '9'] },
];

export default function LearningPathViewer() {
  const [selectedConcept, setSelectedConcept] = useState<ConceptNode | null>(null);
  const [liveUpdate, setLiveUpdate] = useState(false);

  // Simulate real-time updates
  useEffect(() => {
    if (liveUpdate) {
      const interval = setInterval(() => {
        // Simulate mastery increase
        console.log('🔄 Live update: Mastery recalculated');
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [liveUpdate]);

  const getStatusColor = (status: ConceptNode['status']) => {
    switch (status) {
      case 'mastered': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'available': return 'bg-yellow-500';
      case 'locked': return 'bg-gray-400';
    }
  };

  const getStatusIcon = (status: ConceptNode['status']) => {
    switch (status) {
      case 'mastered': return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'in-progress': return <Circle className="h-5 w-5 text-blue-600 animate-pulse" />;
      case 'available': return <Target className="h-5 w-5 text-yellow-600" />;
      case 'locked': return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const overallMastery = mockKnowledgeGraph.reduce((sum, node) => sum + node.mastery, 0) / mockKnowledgeGraph.length;

  return (
    <Layout>
      <div className="container mx-auto px-6 py-12 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Live Knowledge Tracking
              </h1>
              <p className="text-xl text-muted-foreground">
                Real-time Bayesian Knowledge Tracing visualization
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-lg px-4 py-2">
                <Brain className="h-5 w-5 mr-2" />
                {Math.round(overallMastery * 100)}% Overall Mastery
              </Badge>
              <Button
                variant={liveUpdate ? "default" : "outline"}
                onClick={() => setLiveUpdate(!liveUpdate)}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {liveUpdate ? 'Live Updates On' : 'Enable Live Updates'}
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="graph" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="graph">
              <BarChart3 className="h-4 w-4 mr-2" />
              Knowledge Graph
            </TabsTrigger>
            <TabsTrigger value="radar">
              <Target className="h-4 w-4 mr-2" />
              Mastery Radar
            </TabsTrigger>
            <TabsTrigger value="timeline">
              <TrendingUp className="h-4 w-4 mr-2" />
              Learning Timeline
            </TabsTrigger>
            <TabsTrigger value="path">
              <BookOpen className="h-4 w-4 mr-2" />
              Recommended Path
            </TabsTrigger>
          </TabsList>

          {/* Knowledge Graph View */}
          <TabsContent value="graph" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Concept Dependency Graph</CardTitle>
                <CardDescription>
                  Interactive visualization of your learning journey with prerequisite relationships
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ConceptGraph nodes={mockKnowledgeGraph} onNodeClick={setSelectedConcept} />
              </CardContent>
            </Card>

            {selectedConcept && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="border-primary/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(selectedConcept.status)}
                        <CardTitle>{selectedConcept.name}</CardTitle>
                      </div>
                      <Badge variant="secondary">
                        {Math.round(selectedConcept.mastery * 100)}% Mastery
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Progress to Mastery</span>
                        <span className="font-medium">{Math.round(selectedConcept.mastery * 100)}%</span>
                      </div>
                      <Progress value={selectedConcept.mastery * 100} className="h-3" />
                    </div>
                    
                    {selectedConcept.prerequisites.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2 text-sm">Prerequisites:</h4>
                        <div className="flex gap-2">
                          {selectedConcept.prerequisites.map((prereqId) => {
                            const prereq = mockKnowledgeGraph.find(n => n.id === prereqId);
                            return prereq ? (
                              <Badge key={prereqId} variant="outline">
                                {prereq.name}
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-4">
                      <Button size="sm" disabled={selectedConcept.status === 'locked'}>
                        <BookOpen className="h-4 w-4 mr-2" />
                        Start Learning
                      </Button>
                      <Button size="sm" variant="outline" disabled={selectedConcept.status === 'locked'}>
                        <Zap className="h-4 w-4 mr-2" />
                        Practice Quiz
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </TabsContent>

          {/* Mastery Radar */}
          <TabsContent value="radar" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Multi-Dimensional Mastery Analysis</CardTitle>
                <CardDescription>
                  Radar chart showing your mastery across different concept domains
                </CardDescription>
              </CardHeader>
              <CardContent>
                <KnowledgeRadar data={mockConceptMastery} />
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Strengths</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockConceptMastery
                      .filter(c => c.mastery >= 0.75)
                      .map(concept => (
                        <div key={concept.concept} className="flex items-center justify-between">
                          <span className="font-medium">{concept.concept}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="default" className="bg-green-500">
                              {Math.round(concept.mastery * 100)}%
                            </Badge>
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Areas for Improvement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockConceptMastery
                      .filter(c => c.mastery < 0.75)
                      .map(concept => (
                        <div key={concept.concept} className="flex items-center justify-between">
                          <span className="font-medium">{concept.concept}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                              {Math.round(concept.mastery * 100)}%
                            </Badge>
                            <Target className="h-4 w-4 text-yellow-600" />
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Learning Timeline */}
          <TabsContent value="timeline" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Learning Progress Over Time</CardTitle>
                <CardDescription>
                  Track your daily learning activity and performance trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LearningTimeline data={mockLearningHistory} />
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Total Study Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">
                    {mockLearningHistory.reduce((sum, s) => sum + s.duration, 0)} min
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">
                    {Math.round(mockLearningHistory.reduce((sum, s) => sum + s.score, 0) / mockLearningHistory.length)}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Across all assessments</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Concepts Covered</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">
                    {mockLearningHistory.reduce((sum, s) => sum + s.concepts, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Total concepts practiced</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Recommended Path */}
          <TabsContent value="path" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI-Generated Learning Sequence</CardTitle>
                <CardDescription>
                  Optimized path based on your current mastery and learning velocity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockKnowledgeGraph
                    .filter(node => node.status !== 'locked')
                    .sort((a, b) => {
                      // Priority: in-progress > available > mastered
                      const statusPriority = { 'in-progress': 0, 'available': 1, 'mastered': 2 };
                      return (statusPriority[a.status as keyof typeof statusPriority] || 3) - 
                             (statusPriority[b.status as keyof typeof statusPriority] || 3);
                    })
                    .map((node, index) => (
                      <motion.div
                        key={node.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className={node.status === 'in-progress' ? 'border-primary' : ''}>
                          <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-full ${getStatusColor(node.status)} flex items-center justify-center text-white font-bold`}>
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold">{node.name}</h3>
                                  {getStatusIcon(node.status)}
                                  <Badge variant="outline" className="ml-auto">
                                    {Math.round(node.mastery * 100)}% mastery
                                  </Badge>
                                </div>
                                <Progress value={node.mastery * 100} className="h-2 mb-2" />
                                <p className="text-sm text-muted-foreground">
                                  {node.status === 'mastered' 
                                    ? '✓ Concept mastered - Consider reviewing periodically'
                                    : node.status === 'in-progress'
                                    ? '🎯 Currently learning - Focus here for best results'
                                    : '🚀 Ready to learn - All prerequisites met'}
                                </p>
                              </div>
                              <Button 
                                variant={node.status === 'in-progress' ? 'default' : 'outline'}
                                size="sm"
                              >
                                {node.status === 'mastered' ? 'Review' : 'Continue'}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
