import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import type { ConceptMastery } from '@/services/mockData';

interface KnowledgeRadarProps {
  data: ConceptMastery[];
}

export function KnowledgeRadar({ data }: KnowledgeRadarProps) {
  const chartData = data.map(item => ({
    concept: item.concept,
    mastery: Math.round(item.mastery * 100),
    fullMark: 100,
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <RadarChart data={chartData}>
        <PolarGrid stroke="hsl(var(--border))" />
        <PolarAngleAxis 
          dataKey="concept" 
          tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
        />
        <PolarRadiusAxis 
          angle={90} 
          domain={[0, 100]}
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
        />
        <Radar
          name="Mastery"
          dataKey="mastery"
          stroke="hsl(var(--primary))"
          fill="hsl(var(--primary))"
          fillOpacity={0.6}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            padding: '8px 12px',
          }}
          formatter={(value: number) => [`${value}%`, 'Mastery']}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

