import { 
  Area, 
  AreaChart, 
  CartesianGrid, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis,
  Legend
} from 'recharts';
import type { LearningSession } from '@/services/mockData';

interface LearningTimelineProps {
  data: LearningSession[];
}

export function LearningTimeline({ data }: LearningTimelineProps) {
  const chartData = data.map(session => ({
    date: new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    duration: session.duration,
    score: session.score,
    concepts: session.concepts,
  }));

  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="colorDuration" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
          </linearGradient>
          <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis 
          dataKey="date" 
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          stroke="hsl(var(--border))"
        />
        <YAxis 
          yAxisId="left"
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          stroke="hsl(var(--border))"
          label={{ value: 'Duration (min)', angle: -90, position: 'insideLeft', style: { fill: 'hsl(var(--muted-foreground))' } }}
        />
        <YAxis 
          yAxisId="right"
          orientation="right"
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          stroke="hsl(var(--border))"
          label={{ value: 'Score (%)', angle: 90, position: 'insideRight', style: { fill: 'hsl(var(--muted-foreground))' } }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            padding: '8px 12px',
          }}
        />
        <Legend />
        <Area
          yAxisId="left"
          type="monotone"
          dataKey="duration"
          stroke="hsl(var(--primary))"
          fillOpacity={1}
          fill="url(#colorDuration)"
          name="Study Time (min)"
        />
        <Area
          yAxisId="right"
          type="monotone"
          dataKey="score"
          stroke="hsl(var(--accent))"
          fillOpacity={1}
          fill="url(#colorScore)"
          name="Score (%)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

