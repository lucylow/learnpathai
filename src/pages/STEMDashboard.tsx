/**
 * STEM Dashboard Page
 * 
 * Main dashboard for viewing and managing personalized STEM learning paths
 */

import React, { useState } from 'react';
import { STEMLearningPath } from '@/components/stem/STEMLearningPath';
import { STEMProgressCard } from '@/components/stem/STEMProgressCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Code, 
  Calculator, 
  Atom, 
  Microscope,
  BookOpen,
  Trophy,
  Target
} from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  type: string;
  url: string;
}

const STEMDashboard: React.FC = () => {
  const [selectedSubject, setSelectedSubject] = useState<string>('programming');
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  // Demo data - in production, fetch from API
  const progressData = [
    {
      subject: 'programming',
      overall_mastery: 0.58,
      completed_concepts: 3,
      total_concepts: 6,
      estimated_hours_remaining: 12,
      current_streak: 5,
      last_updated: new Date().toISOString()
    },
    {
      subject: 'math',
      overall_mastery: 0.42,
      completed_concepts: 1,
      total_concepts: 3,
      estimated_hours_remaining: 8,
      current_streak: 3,
      last_updated: new Date().toISOString()
    },
    {
      subject: 'physics',
      overall_mastery: 0.35,
      completed_concepts: 1,
      total_concepts: 3,
      estimated_hours_remaining: 10,
      current_streak: 2,
      last_updated: new Date().toISOString()
    }
  ];

  const handleResourceClick = (resource: Resource) => {
    setSelectedResource(resource);
    // In production: navigate to resource or open in modal
    console.log('Opening resource:', resource);
    window.open(resource.url, '_blank');
  };

  const subjects = [
    { id: 'programming', label: 'Programming', icon: Code },
    { id: 'math', label: 'Mathematics', icon: Calculator },
    { id: 'physics', label: 'Physics', icon: Atom },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <Brain className="h-10 w-10 text-primary" />
            STEM Learning Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Your personalized pathway to mastering STEM subjects
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-primary">
            {Math.round(progressData.reduce((sum, p) => sum + p.overall_mastery, 0) / progressData.length * 100)}%
          </div>
          <p className="text-sm text-muted-foreground">Overall Progress</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Concepts</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-blue-500" />
              {progressData.reduce((sum, p) => sum + p.total_concepts, 0)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Completed</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Trophy className="h-6 w-6 text-green-500" />
              {progressData.reduce((sum, p) => sum + p.completed_concepts, 0)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Current Streak</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Target className="h-6 w-6 text-orange-500" />
              {Math.max(...progressData.map(p => p.current_streak))} days
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Subject Progress Cards */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Your Subjects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {progressData.map((data) => (
            <STEMProgressCard
              key={data.subject}
              data={data}
              onClick={() => setSelectedSubject(data.subject)}
            />
          ))}
        </div>
      </div>

      {/* Detailed Learning Path */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Detailed Learning Path</h2>
        <Tabs value={selectedSubject} onValueChange={setSelectedSubject}>
          <TabsList className="grid w-full max-w-md grid-cols-3">
            {subjects.map(subject => {
              const Icon = subject.icon;
              return (
                <TabsTrigger key={subject.id} value={subject.id}>
                  <Icon className="h-4 w-4 mr-2" />
                  {subject.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {subjects.map(subject => (
            <TabsContent key={subject.id} value={subject.id} className="mt-6">
              <STEMLearningPath
                userId="demo_user"
                subject={subject.id}
                userAttempts={[
                  { concept: 'variables', correct: true },
                  { concept: 'variables', correct: true },
                  { concept: 'control_structures', correct: false },
                ]}
                onResourceClick={handleResourceClick}
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Tips & Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>💡 Personalized Tips</CardTitle>
          <CardDescription>Based on your learning patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span>
                You're making great progress in <strong>Programming</strong>! 
                Consider tackling <strong>Functions</strong> next to maintain momentum.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span>
                Your <strong>visual learning style</strong> means you engage more with video and 
                interactive content. We've prioritized these resources in your path.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span>
                Try to maintain your <strong>5-day streak</strong> by spending just 30 minutes 
                daily on your learning goals.
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default STEMDashboard;


