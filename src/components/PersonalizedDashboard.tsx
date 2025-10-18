// src/components/PersonalizedDashboard.tsx
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Clock, TrendingUp, Target, Award, Calendar, Zap, Brain, BookOpen } from 'lucide-react';
import { Card } from './ui/card';
import { motion } from 'framer-motion';
import React from 'react';

interface DashboardProps {
  userId?: string;
  timeRange?: 'week' | 'month' | 'all';
}

export const PersonalizedDashboard: React.FC<DashboardProps> = () => {
  // Mock data - replace with actual API calls
  const masteryOverTime = [
    { day: 'Mon', mastery: 45, timeSpent: 35 },
    { day: 'Tue', mastery: 52, timeSpent: 48 },
    { day: 'Wed', mastery: 58, timeSpent: 42 },
    { day: 'Thu', mastery: 63, timeSpent: 55 },
    { day: 'Fri', mastery: 71, timeSpent: 62 },
    { day: 'Sat', mastery: 75, timeSpent: 38 },
    { day: 'Sun', mastery: 78, timeSpent: 45 },
  ];

  const conceptProgress = [
    { concept: 'Loops', score: 85, target: 90 },
    { concept: 'Functions', score: 42, target: 70 },
    { concept: 'Arrays', score: 68, target: 80 },
    { concept: 'Objects', score: 30, target: 70 },
    { concept: 'Variables', score: 92, target: 90 },
  ];

  const learningStyle = [
    { modality: 'Video', engagement: 85 },
    { modality: 'Text', engagement: 65 },
    { modality: 'Interactive', engagement: 92 },
    { modality: 'Quiz', engagement: 78 },
  ];

  const skillRadar = [
    { skill: 'Problem Solving', value: 75 },
    { skill: 'Code Quality', value: 68 },
    { skill: 'Debugging', value: 82 },
    { skill: 'Algorithms', value: 55 },
    { skill: 'Best Practices', value: 70 },
  ];

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          icon={<Clock className="w-6 h-6" />}
          label="Time Today" 
          value="2h 15m" 
          color="blue" 
        />
        <StatsCard 
          icon={<TrendingUp className="w-6 h-6" />}
          label="Avg Mastery" 
          value="64%" 
          color="emerald" 
        />
        <StatsCard 
          icon={<Target className="w-6 h-6" />}
          label="Goals Met" 
          value="3/5" 
          color="amber" 
        />
        <StatsCard 
          icon={<Award className="w-6 h-6" />}
          label="Streak" 
          value="7 days" 
          color="purple" 
        />
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mastery Over Time */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Brain className="w-5 h-5 text-emerald-600" />
              Mastery Progress
            </h3>
            <span className="text-sm text-gray-600">Last 7 days</span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={masteryOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="day" 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="mastery" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Concept Scores */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              Concept Mastery
            </h3>
            <span className="text-sm text-gray-600">Current status</span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={conceptProgress}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="concept" 
                stroke="#6b7280"
                style={{ fontSize: '11px' }}
              />
              <YAxis 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Bar 
                dataKey="score" 
                fill="#2563eb" 
                radius={[8, 8, 0, 0]}
                maxBarSize={60}
              />
              <Bar 
                dataKey="target" 
                fill="#cbd5e1" 
                radius={[8, 8, 0, 0]}
                maxBarSize={60}
                opacity={0.3}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Learning Style Preferences */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-600" />
            Learning Preferences
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={learningStyle}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ modality, engagement }) => `${modality}: ${engagement}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="engagement"
              >
                {learningStyle.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 text-sm text-gray-600 text-center">
            <p className="font-medium">💡 You learn best with Interactive content!</p>
          </div>
        </Card>

        {/* Skill Radar */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-600" />
            Skill Analysis
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={skillRadar}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis 
                dataKey="skill" 
                style={{ fontSize: '11px', fill: '#6b7280' }}
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 100]} 
                style={{ fontSize: '10px' }}
              />
              <Radar 
                name="Your Skills" 
                dataKey="value" 
                stroke="#8b5cf6" 
                fill="#8b5cf6" 
                fillOpacity={0.6}
                strokeWidth={2}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Activity Timeline */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          Study Time This Week
        </h3>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={masteryOverTime} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="day" 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
              label={{ value: 'Minutes', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
              formatter={(value) => [`${value} minutes`, 'Study Time']}
            />
            <Bar 
              dataKey="timeSpent" 
              fill="#10b981" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900">5.5h</p>
            <p className="text-sm text-gray-600">Total Time</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">47m</p>
            <p className="text-sm text-gray-600">Avg/Day</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">62m</p>
            <p className="text-sm text-gray-600">Best Day</p>
          </div>
        </div>
      </Card>

      {/* Quick Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InsightCard
          emoji="🎯"
          title="Focus Area"
          description="Work on Functions to reach your 70% goal"
          color="blue"
        />
        <InsightCard
          emoji="⚡"
          title="Momentum"
          description="You're 12% faster than last week!"
          color="emerald"
        />
        <InsightCard
          emoji="🏆"
          title="Next Milestone"
          description="Complete 2 more concepts to unlock 'Knowledge Guru'"
          color="amber"
        />
      </div>
    </div>
  );
};

// Stats Card Component
const StatsCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  color: 'blue' | 'emerald' | 'amber' | 'purple';
}> = ({ icon, label, value, color }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    amber: 'bg-amber-100 text-amber-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card className="p-6 hover:shadow-lg transition-shadow">
        <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-3`}>
          {icon}
        </div>
        <p className="text-sm text-gray-600 mb-1">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </Card>
    </motion.div>
  );
};

// Insight Card Component
const InsightCard: React.FC<{
  emoji: string;
  title: string;
  description: string;
  color: 'blue' | 'emerald' | 'amber';
}> = ({ emoji, title, description, color }) => {
  const borderColors = {
    blue: 'border-blue-200 bg-blue-50',
    emerald: 'border-emerald-200 bg-emerald-50',
    amber: 'border-amber-200 bg-amber-50',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card className={`p-4 border-2 ${borderColors[color]}`}>
        <div className="text-3xl mb-2">{emoji}</div>
        <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
        <p className="text-sm text-gray-700">{description}</p>
      </Card>
    </motion.div>
  );
};

