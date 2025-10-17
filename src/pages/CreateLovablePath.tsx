/**
 * Create Learning Path Page with Lovable Integration
 * Form to generate a new AI-powered learning path
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLovableAuth } from '../components/lovable/LovableAuthProvider';
import lovablePathService from '../services/lovable-path.service';
import lovableAnalyticsService from '../services/lovable-analytics.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

export const CreateLovablePath: React.FC = () => {
  const { user } = useLovableAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    subject: '',
    learningGoal: '',
    learningStyle: 'visual' as 'visual' | 'auditory' | 'kinesthetic' | 'reading_writing',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Generate path using Lovable Cloud
      const path = await lovablePathService.generatePath({
        subject: formData.subject,
        userAttempts: [], // No prior attempts for new path
        learningStyle: formData.learningStyle,
        learningGoal: formData.learningGoal,
      });

      // Track analytics
      await lovableAnalyticsService.trackPathCreated({
        pathId: path.id,
        subject: formData.subject,
        learningStyle: formData.learningStyle,
      });

      // Navigate to the new path
      navigate(`/path/${path.id}`);
    } catch (err: any) {
      console.error('Error creating path:', err);
      setError(err.message || 'Failed to create learning path');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-4">
          ← Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create Your Learning Path</CardTitle>
            <CardDescription>
              Let our AI generate a personalized STEM learning pathway tailored to your goals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Subject */}
              <div>
                <Label htmlFor="subject">Subject *</Label>
                <Select
                  value={formData.subject}
                  onValueChange={(value) => setFormData({ ...formData, subject: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="programming">Programming</SelectItem>
                    <SelectItem value="math">Mathematics</SelectItem>
                    <SelectItem value="physics">Physics</SelectItem>
                    <SelectItem value="chemistry">Chemistry</SelectItem>
                    <SelectItem value="data_science">Data Science</SelectItem>
                    <SelectItem value="web_development">Web Development</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Learning Goal */}
              <div>
                <Label htmlFor="learningGoal">Learning Goal *</Label>
                <Textarea
                  id="learningGoal"
                  placeholder="e.g., Master Python basics for data analysis, Prepare for AP Calculus"
                  value={formData.learningGoal}
                  onChange={(e) => setFormData({ ...formData, learningGoal: e.target.value })}
                  rows={3}
                  required
                />
              </div>

              {/* Learning Style */}
              <div>
                <Label htmlFor="learningStyle">Preferred Learning Style *</Label>
                <Select
                  value={formData.learningStyle}
                  onValueChange={(value: any) => setFormData({ ...formData, learningStyle: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visual">Visual (diagrams, videos)</SelectItem>
                    <SelectItem value="auditory">Auditory (podcasts, lectures)</SelectItem>
                    <SelectItem value="kinesthetic">Kinesthetic (labs, projects)</SelectItem>
                    <SelectItem value="reading_writing">Reading/Writing (articles, notes)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || !formData.subject || !formData.learningGoal}
              >
                {loading ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Generating Your Path...
                  </>
                ) : (
                  'Generate Learning Path with AI'
                )}
              </Button>

              <div className="text-xs text-gray-600 text-center">
                Our AI will analyze your goals and create a personalized learning path using
                Deep Knowledge Tracing and adaptive algorithms.
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};


