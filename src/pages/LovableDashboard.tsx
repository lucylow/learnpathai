/**
 * Lovable-Integrated Dashboard
 * Main dashboard using Lovable Cloud services
 */

import React, { useEffect, useState } from 'react';
import { useLovableAuth } from '../components/lovable/LovableAuthProvider';
import lovablePathService from '../services/lovable-path.service';
import lovableAnalyticsService from '../services/lovable-analytics.service';
import { LearningPath } from '../lib/lovable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { BookOpen, TrendingUp, Clock, Award } from 'lucide-react';

export const LovableDashboard: React.FC = () => {
  const { user, signOut } = useLovableAuth();
  const navigate = useNavigate();
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load user's learning paths
      const userPaths = await lovablePathService.getUserPaths();
      setPaths(userPaths);

      // Load analytics summary
      const analyticsData = await lovableAnalyticsService.getUserAnalytics();
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePath = () => {
    navigate('/create-path');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">LearnPath AI Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome, {user?.name || user?.email}</span>
            <Button variant="outline" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Analytics Summary */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Active Paths
                </CardTitle>
                <BookOpen className="h-4 w-4 text-indigo-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.pathsCreated}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Completed Nodes
                </CardTitle>
                <Award className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.completedNodes}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Quiz Attempts
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.quizAttempts}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Adaptive Reroutes
                </CardTitle>
                <Clock className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.adaptiveReroutes}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Learning Paths */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Your Learning Paths</h2>
          <Button onClick={handleCreatePath}>
            + Create New Path
          </Button>
        </div>

        {paths.length === 0 ? (
          <Card className="p-12 text-center">
            <CardContent>
              <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No learning paths yet
              </h3>
              <p className="text-gray-600 mb-4">
                Create your first AI-powered learning path to get started
              </p>
              <Button onClick={handleCreatePath}>
                Create Your First Path
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paths.map((path) => (
              <Card key={path.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/path/${path.id}`)}>
                <CardHeader>
                  <CardTitle>{path.title}</CardTitle>
                  <CardDescription className="capitalize">
                    {path.subject} • {path.learning_style} learner
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Overall Mastery</span>
                      <span className="font-semibold">
                        {(path.overall_mastery * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all"
                        style={{ width: `${path.overall_mastery * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>{path.nodes.length} concepts</span>
                      <span>~{path.estimated_hours.toFixed(1)}h</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};


