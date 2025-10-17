/**
 * STEMLearningPath Component
 * 
 * Displays a personalized STEM learning pathway with:
 * - Visual concept progression
 * - Mastery progress bars
 * - Resource recommendations
 * - Prerequisite dependencies
 */

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Video, 
  Code, 
  FlaskConical, 
  FileText, 
  Trophy,
  Lock,
  CheckCircle2,
  Clock,
  Target,
  Brain,
  TrendingUp,
  PlayCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Type definitions matching the backend
interface Resource {
  id: string;
  title: string;
  type: string;
  difficulty: number;
  duration_minutes: number;
  url: string;
  engagement_score: number;
  modality: string;
}

interface ConceptNode {
  concept_id: string;
  name: string;
  current_mastery: number;
  target_mastery: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'locked';
  prerequisites: string[];
  resources: Resource[];
  estimated_time_minutes: number;
}

interface LearningPath {
  path_id: string;
  user_id: string;
  subject: string;
  overall_mastery: number;
  concepts: ConceptNode[];
  metadata: {
    generation_time_ms: number;
    algorithm_version: string;
    learning_style: string;
    total_concepts: number;
    completed_concepts: number;
    estimated_total_hours: number;
  };
}

interface STEMLearningPathProps {
  userId: string;
  subject: string;
  userAttempts?: Array<{ concept: string; correct: boolean }>;
  onResourceClick?: (resource: Resource) => void;
}

// Resource type icon mapping
const getResourceIcon = (type: string) => {
  switch (type) {
    case 'video':
      return <Video className="h-4 w-4" />;
    case 'interactive':
      return <Code className="h-4 w-4" />;
    case 'lab':
      return <FlaskConical className="h-4 w-4" />;
    case 'text':
      return <FileText className="h-4 w-4" />;
    case 'quiz':
      return <Target className="h-4 w-4" />;
    case 'project':
      return <Trophy className="h-4 w-4" />;
    default:
      return <BookOpen className="h-4 w-4" />;
  }
};

// Status icon mapping
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case 'in_progress':
      return <PlayCircle className="h-5 w-5 text-blue-500" />;
    case 'locked':
      return <Lock className="h-5 w-5 text-gray-400" />;
    default:
      return <Target className="h-5 w-5 text-gray-300" />;
  }
};

// Difficulty badge color
const getDifficultyColor = (difficulty: number): string => {
  if (difficulty < 0.3) return 'bg-green-100 text-green-800';
  if (difficulty < 0.6) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
};

const getDifficultyLabel = (difficulty: number): string => {
  if (difficulty < 0.3) return 'Easy';
  if (difficulty < 0.6) return 'Medium';
  return 'Hard';
};

export const STEMLearningPath: React.FC<STEMLearningPathProps> = ({
  userId,
  subject,
  userAttempts = [],
  onResourceClick
}) => {
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedConcept, setSelectedConcept] = useState<ConceptNode | null>(null);

  useEffect(() => {
    fetchLearningPath();
  }, [userId, subject, userAttempts]);

  const fetchLearningPath = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8002/generate_path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          subject: subject,
          user_attempts: userAttempts,
          learning_style: 'visual'
        })
      });

      if (!response.ok) throw new Error('Failed to fetch learning path');

      const data: LearningPath = await response.json();
      setLearningPath(data);
      
      // Auto-select first in-progress or not-started concept
      const activeConcept = data.concepts.find(
        c => c.status === 'in_progress' || c.status === 'not_started'
      );
      setSelectedConcept(activeConcept || data.concepts[0]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-2">
            <Brain className="h-8 w-8 animate-pulse text-primary" />
            <p className="text-sm text-muted-foreground">
              Generating your personalized learning path...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !learningPath) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-500 mb-2">Error loading learning path</p>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button onClick={fetchLearningPath} className="mt-4">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Progress Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-6 w-6 text-primary" />
                {subject.charAt(0).toUpperCase() + subject.slice(1)} Learning Path
              </CardTitle>
              <CardDescription>
                Personalized for {userId} • {learningPath.metadata.learning_style} learner
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">
                {Math.round(learningPath.overall_mastery * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">
                Overall Mastery
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={learningPath.overall_mastery * 100} className="h-3" />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {learningPath.metadata.completed_concepts}
                </div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {learningPath.metadata.total_concepts - learningPath.metadata.completed_concepts}
                </div>
                <div className="text-xs text-muted-foreground">Remaining</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(learningPath.metadata.estimated_total_hours)}h
                </div>
                <div className="text-xs text-muted-foreground">Est. Time</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Learning Path Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Concept List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Learning Journey</CardTitle>
            <CardDescription>
              {learningPath.concepts.length} concepts to master
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
            {learningPath.concepts.map((concept, index) => (
              <button
                key={concept.concept_id}
                onClick={() => setSelectedConcept(concept)}
                className={cn(
                  "w-full text-left p-3 rounded-lg border transition-all",
                  selectedConcept?.concept_id === concept.concept_id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50",
                  concept.status === 'locked' && "opacity-50"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {getStatusIcon(concept.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-muted-foreground">
                        #{index + 1}
                      </span>
                      <span className="text-sm font-medium truncate">
                        {concept.name}
                      </span>
                    </div>
                    <Progress 
                      value={concept.current_mastery * 100} 
                      className="h-1.5 mb-1"
                    />
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {Math.round(concept.current_mastery * 100)}% mastered
                      </span>
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {concept.estimated_time_minutes}m
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Concept Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2 mb-2">
                  {selectedConcept && getStatusIcon(selectedConcept.status)}
                  {selectedConcept?.name || 'Select a concept'}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline">
                    {selectedConcept?.status.replace('_', ' ')}
                  </Badge>
                  {selectedConcept && selectedConcept.prerequisites.length > 0 && (
                    <span className="text-xs">
                      Prerequisites: {selectedConcept.prerequisites.join(', ')}
                    </span>
                  )}
                </CardDescription>
              </div>
              {selectedConcept && (
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {Math.round(selectedConcept.current_mastery * 100)}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Target: {Math.round(selectedConcept.target_mastery * 100)}%
                  </div>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {selectedConcept ? (
              <Tabs defaultValue="resources" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="resources">
                    Resources ({selectedConcept.resources.length})
                  </TabsTrigger>
                  <TabsTrigger value="progress">
                    Progress
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="resources" className="space-y-4 mt-4">
                  {selectedConcept.resources.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No resources available yet
                    </div>
                  ) : (
                    selectedConcept.resources.map((resource) => (
                      <Card key={resource.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className="p-3 rounded-lg bg-primary/10">
                              {getResourceIcon(resource.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium mb-1">{resource.title}</h4>
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <Badge variant="secondary" className={getDifficultyColor(resource.difficulty)}>
                                  {getDifficultyLabel(resource.difficulty)}
                                </Badge>
                                <Badge variant="outline">
                                  {resource.type}
                                </Badge>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {resource.duration_minutes} min
                                </span>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <TrendingUp className="h-3 w-3" />
                                  {Math.round(resource.engagement_score * 100)}% engagement
                                </span>
                              </div>
                              <Button 
                                size="sm" 
                                onClick={() => onResourceClick?.(resource)}
                                className="mt-2"
                              >
                                Start Learning
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="progress" className="space-y-4 mt-4">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Current Mastery</span>
                        <span className="text-sm text-muted-foreground">
                          {Math.round(selectedConcept.current_mastery * 100)}%
                        </span>
                      </div>
                      <Progress value={selectedConcept.current_mastery * 100} className="h-3" />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Target Mastery</span>
                        <span className="text-sm text-muted-foreground">
                          {Math.round(selectedConcept.target_mastery * 100)}%
                        </span>
                      </div>
                      <Progress value={selectedConcept.target_mastery * 100} className="h-3" />
                    </div>

                    <div className="pt-4 border-t">
                      <h4 className="font-medium mb-2">Estimated Time to Master</h4>
                      <p className="text-2xl font-bold text-primary">
                        {selectedConcept.estimated_time_minutes} minutes
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Based on your current progress and selected resources
                      </p>
                    </div>

                    {selectedConcept.prerequisites.length > 0 && (
                      <div className="pt-4 border-t">
                        <h4 className="font-medium mb-2">Prerequisites</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedConcept.prerequisites.map((prereq) => {
                            const prereqConcept = learningPath.concepts.find(
                              c => c.concept_id === prereq
                            );
                            return (
                              <Badge 
                                key={prereq} 
                                variant={prereqConcept?.status === 'completed' ? 'default' : 'outline'}
                              >
                                {prereqConcept?.name || prereq}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                Select a concept to view details and resources
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default STEMLearningPath;

