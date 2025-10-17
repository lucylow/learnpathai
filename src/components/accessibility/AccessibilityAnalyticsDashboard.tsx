/**
 * Accessibility Analytics Dashboard for Educators
 * AI-generated insights on accessibility engagement and barriers
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Ear,
  Hand,
  Brain,
  Download,
  RefreshCw
} from 'lucide-react';

interface AccessibilityMetrics {
  totalUsers: number;
  accessibilityFeatureUsage: {
    feature: string;
    users: number;
    percentage: number;
  }[];
  engagementGaps: {
    category: string;
    gapScore: number;
    affectedUsers: number;
    recommendations: string[];
  }[];
  contentAccessibility: {
    wcagCompliance: number;
    missingAltText: number;
    lowContrast: number;
    captionsAvailable: number;
  };
  learnerOutcomes: {
    withAccessibility: {
      completionRate: number;
      avgMastery: number;
      engagement: number;
    };
    withoutAccessibility: {
      completionRate: number;
      avgMastery: number;
      engagement: number;
    };
  };
}

export const AccessibilityAnalyticsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<AccessibilityMetrics>({
    totalUsers: 1247,
    accessibilityFeatureUsage: [
      { feature: 'Screen Reader', users: 156, percentage: 12.5 },
      { feature: 'High Contrast', users: 203, percentage: 16.3 },
      { feature: 'Text-to-Speech', users: 312, percentage: 25.0 },
      { feature: 'Captions', users: 189, percentage: 15.2 },
      { feature: 'Keyboard Nav', users: 445, percentage: 35.7 },
      { feature: 'Simplified Layout', users: 178, percentage: 14.3 },
    ],
    engagementGaps: [
      {
        category: 'Visual',
        gapScore: 7.2,
        affectedUsers: 89,
        recommendations: [
          'Add alt text to 23 images in Module 3',
          'Increase color contrast in diagrams',
          'Provide audio descriptions for videos'
        ]
      },
      {
        category: 'Auditory',
        gapScore: 5.8,
        affectedUsers: 67,
        recommendations: [
          'Add captions to 12 videos',
          'Provide transcripts for audio lessons',
          'Enable visual alerts for notifications'
        ]
      },
      {
        category: 'Motor',
        gapScore: 3.4,
        affectedUsers: 34,
        recommendations: [
          'Increase button sizes in quiz interface',
          'Add keyboard shortcuts to all actions',
          'Reduce time limits for timed activities'
        ]
      },
      {
        category: 'Cognitive',
        gapScore: 6.1,
        affectedUsers: 102,
        recommendations: [
          'Simplify language in advanced topics',
          'Add visual aids to complex concepts',
          'Provide step-by-step instructions'
        ]
      }
    ],
    contentAccessibility: {
      wcagCompliance: 87,
      missingAltText: 45,
      lowContrast: 23,
      captionsAvailable: 78
    },
    learnerOutcomes: {
      withAccessibility: {
        completionRate: 84,
        avgMastery: 0.78,
        engagement: 0.82
      },
      withoutAccessibility: {
        completionRate: 62,
        avgMastery: 0.65,
        engagement: 0.58
      }
    }
  });

  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'all'>('month');

  // Refresh metrics
  const refreshMetrics = () => {
    // In production: Fetch from API
    console.log('Refreshing metrics...');
  };

  // Export report
  const exportReport = () => {
    const report = JSON.stringify(metrics, null, 2);
    const blob = new Blob([report], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `accessibility-report-${new Date().toISOString()}.json`;
    a.click();
  };

  // Calculate impact
  const calculateImpact = () => {
    const with_a11y = metrics.learnerOutcomes.withAccessibility;
    const without_a11y = metrics.learnerOutcomes.withoutAccessibility;
    
    return {
      completionIncrease: ((with_a11y.completionRate - without_a11y.completionRate) / without_a11y.completionRate * 100).toFixed(1),
      masteryIncrease: ((with_a11y.avgMastery - without_a11y.avgMastery) / without_a11y.avgMastery * 100).toFixed(1),
      engagementIncrease: ((with_a11y.engagement - without_a11y.engagement) / without_a11y.engagement * 100).toFixed(1)
    };
  };

  const impact = calculateImpact();

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Accessibility Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Monitor accessibility engagement and identify improvement opportunities
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshMetrics}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={exportReport}>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">WCAG Compliance</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.contentAccessibility.wcagCompliance}%</div>
            <p className="text-xs text-muted-foreground">
              Level AA Standard
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impact on Completion</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+{impact.completionIncrease}%</div>
            <p className="text-xs text-muted-foreground">
              With accessibility features
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Gaps</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.engagementGaps.length}</div>
            <p className="text-xs text-muted-foreground">
              Areas needing attention
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="usage" className="w-full">
        <TabsList>
          <TabsTrigger value="usage">Feature Usage</TabsTrigger>
          <TabsTrigger value="gaps">Engagement Gaps</TabsTrigger>
          <TabsTrigger value="outcomes">Learning Outcomes</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        {/* Feature Usage */}
        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Accessibility Feature Usage</CardTitle>
              <CardDescription>
                Which accessibility features are most used by your learners
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={metrics.accessibilityFeatureUsage}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="feature" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="users" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Feature Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={metrics.accessibilityFeatureUsage}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="users"
                    >
                      {metrics.accessibilityFeatureUsage.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Keyboard Navigation Popular</p>
                    <p className="text-xs text-muted-foreground">
                      35.7% of users rely on keyboard-only navigation
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Text-to-Speech Adoption Growing</p>
                    <p className="text-xs text-muted-foreground">
                      25% usage, up 8% from last month
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Low Screen Reader Usage</p>
                    <p className="text-xs text-muted-foreground">
                      Only 12.5% - may indicate awareness issue
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Engagement Gaps */}
        <TabsContent value="gaps" className="space-y-4">
          {metrics.engagementGaps.map((gap, index) => {
            const icons = {
              Visual: Eye,
              Auditory: Ear,
              Motor: Hand,
              Cognitive: Brain
            };
            const Icon = icons[gap.category as keyof typeof icons];

            return (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle>{gap.category} Accessibility</CardTitle>
                        <CardDescription>
                          {gap.affectedUsers} users affected
                        </CardDescription>
                      </div>
                    </div>
                    <Badge 
                      variant={gap.gapScore > 6 ? 'destructive' : gap.gapScore > 4 ? 'default' : 'secondary'}
                    >
                      Gap Score: {gap.gapScore}/10
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <h4 className="font-semibold text-sm mb-2">AI Recommendations:</h4>
                  <ul className="space-y-2">
                    {gap.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* Learning Outcomes */}
        <TabsContent value="outcomes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Impact of Accessibility Features on Learning</CardTitle>
              <CardDescription>
                Comparing outcomes with and without accessibility support
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Completion Rate</h4>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">With Accessibility</span>
                      <span className="font-semibold text-green-600">
                        {metrics.learnerOutcomes.withAccessibility.completionRate}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Without</span>
                      <span className="font-semibold">
                        {metrics.learnerOutcomes.withoutAccessibility.completionRate}%
                      </span>
                    </div>
                    <div className="pt-2">
                      <Badge variant="default" className="text-xs">
                        +{impact.completionIncrease}% improvement
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Average Mastery</h4>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">With Accessibility</span>
                      <span className="font-semibold text-green-600">
                        {(metrics.learnerOutcomes.withAccessibility.avgMastery * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Without</span>
                      <span className="font-semibold">
                        {(metrics.learnerOutcomes.withoutAccessibility.avgMastery * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="pt-2">
                      <Badge variant="default" className="text-xs">
                        +{impact.masteryIncrease}% improvement
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Engagement Level</h4>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">With Accessibility</span>
                      <span className="font-semibold text-green-600">
                        {(metrics.learnerOutcomes.withAccessibility.engagement * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Without</span>
                      <span className="font-semibold">
                        {(metrics.learnerOutcomes.withoutAccessibility.engagement * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="pt-2">
                      <Badge variant="default" className="text-xs">
                        +{impact.engagementIncrease}% improvement
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <p className="text-sm font-semibold text-green-900 dark:text-green-100 mb-2">
                  💡 Key Insight
                </p>
                <p className="text-sm text-green-800 dark:text-green-200">
                  Learners using accessibility features show significantly better outcomes across all metrics.
                  Investing in accessibility directly improves learning success.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance */}
        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>WCAG 2.1 Compliance Status</CardTitle>
              <CardDescription>
                Automated audit results and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-semibold">Overall Compliance</h4>
                  <p className="text-sm text-muted-foreground">WCAG 2.1 Level AA</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-600">
                    {metrics.contentAccessibility.wcagCompliance}%
                  </div>
                  <Badge variant="default">Excellent</Badge>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm">Missing Alt Text</h4>
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  </div>
                  <p className="text-2xl font-bold">{metrics.contentAccessibility.missingAltText}</p>
                  <p className="text-xs text-muted-foreground mt-1">images need descriptions</p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm">Low Contrast</h4>
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  </div>
                  <p className="text-2xl font-bold">{metrics.contentAccessibility.lowContrast}</p>
                  <p className="text-xs text-muted-foreground mt-1">elements below 4.5:1 ratio</p>
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">Auto-Fix Available</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  AI can automatically generate alt text and adjust contrast for flagged elements
                </p>
                <Button size="sm">
                  Run Auto-Fix
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AccessibilityAnalyticsDashboard;

