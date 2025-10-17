/**
 * GroupMasteryChart Component
 * 
 * Visualizes group mastery levels with:
 * - Aggregate statistics (mean, min, max)
 * - Individual member progress
 * - Concept-level breakdown
 */

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Trophy, TrendingUp } from 'lucide-react';

interface GroupMastery {
  individual: Record<string, Record<string, number>>;
  aggregate: Record<string, {
    mean: number;
    min: number;
    max: number;
    variance: number;
  }>;
  updatedAt: Date | string;
}

interface GroupMasteryChartProps {
  mastery: GroupMastery;
  compact?: boolean;
}

const GroupMasteryChart: React.FC<GroupMasteryChartProps> = ({ mastery, compact = false }) => {
  if (!mastery?.aggregate) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground text-center">No mastery data available yet</p>
        </CardContent>
      </Card>
    );
  }

  // Prepare chart data
  const chartData = Object.entries(mastery.aggregate).map(([concept, scores]) => ({
    concept: concept.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    average: Math.round(scores.mean * 100),
    minimum: Math.round(scores.min * 100),
    maximum: Math.round(scores.max * 100),
    variance: scores.variance
  }));

  // Calculate overall group performance
  const overallAverage = chartData.length > 0
    ? Math.round(chartData.reduce((sum, d) => sum + d.average, 0) / chartData.length)
    : 0;

  if (compact) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Overall Progress</span>
          <Badge variant={overallAverage >= 70 ? 'default' : 'secondary'}>
            {overallAverage}%
          </Badge>
        </div>
        <Progress value={overallAverage} className="h-2" />
        
        <div className="space-y-2">
          {chartData.slice(0, 3).map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{item.concept}</span>
                <span className="font-medium">{item.average}%</span>
              </div>
              <Progress value={item.average} className="h-1.5" />
            </div>
          ))}
        </div>

        {chartData.length > 3 && (
          <p className="text-xs text-muted-foreground text-center">
            +{chartData.length - 3} more concepts
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            Group Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{overallAverage}%</p>
              <p className="text-xs text-muted-foreground">Average Mastery</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{chartData.length}</p>
              <p className="text-xs text-muted-foreground">Concepts Tracked</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {Object.keys(mastery.individual || {}).length}
              </p>
              <p className="text-xs text-muted-foreground">Team Members</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Concept-Level Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Mastery by Concept
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="concept" 
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
                tick={{ fontSize: 12 }}
              />
              <YAxis domain={[0, 100]} />
              <Tooltip 
                formatter={(value: number) => `${value}%`}
                labelStyle={{ fontWeight: 'bold' }}
              />
              <Legend />
              <Bar dataKey="average" fill="#8b5cf6" name="Average Mastery" radius={[8, 8, 0, 0]} />
              <Bar dataKey="minimum" fill="#10b981" name="Minimum" radius={[8, 8, 0, 0]} />
              <Bar dataKey="maximum" fill="#f59e0b" name="Maximum" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Individual Member Breakdown */}
      {mastery.individual && Object.keys(mastery.individual).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Individual Mastery</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(mastery.individual).map(([userId, userMastery]) => {
                const concepts = Object.entries(userMastery).slice(0, 5);
                const avgMastery = concepts.length > 0
                  ? Math.round(concepts.reduce((sum, [_, score]) => sum + score, 0) / concepts.length * 100)
                  : 0;

                return (
                  <div key={userId} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">User {userId.slice(-8)}</span>
                      <Badge variant="outline">{avgMastery}%</Badge>
                    </div>
                    <div className="space-y-1.5">
                      {concepts.map(([concept, score]) => (
                        <div key={concept} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground capitalize">
                              {concept.replace(/_/g, ' ')}
                            </span>
                            <span className="font-medium">{Math.round(score * 100)}%</span>
                          </div>
                          <Progress value={score * 100} className="h-1.5" />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Variance Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Concept Variance Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            Higher variance indicates more diverse skill levels for that concept
          </p>
          <div className="space-y-2">
            {chartData
              .sort((a, b) => b.variance - a.variance)
              .slice(0, 5)
              .map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-sm">{item.concept}</span>
                  <div className="flex items-center gap-2">
                    <Progress value={item.variance * 1000} className="w-20 h-2" />
                    <span className="text-xs text-muted-foreground w-12 text-right">
                      {item.variance.toFixed(3)}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GroupMasteryChart;

