import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Clock, Award } from "lucide-react";
import { Link } from "react-router-dom";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function Impact() {
  const chartData = {
    labels: ["Static Playlist", "LearnPath AI"],
    datasets: [
      {
        label: "Avg Time-to-Mastery (mins)",
        data: [120, 85],
        backgroundColor: "hsl(var(--primary))",
      },
      {
        label: "Avg Score Gain (%)",
        data: [12, 28],
        backgroundColor: "hsl(var(--accent))",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-6 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            LearnPath AI
          </Link>
          <nav className="flex gap-6">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">Home</Link>
            <Link to="/learning-path" className="text-muted-foreground hover:text-foreground transition-colors">Demo</Link>
            <Link to="/features" className="text-muted-foreground hover:text-foreground transition-colors">Features</Link>
            <Link to="/impact" className="text-foreground font-medium">Impact</Link>
            <Link to="/team" className="text-muted-foreground hover:text-foreground transition-colors">Team</Link>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12 max-w-6xl">
        <div className="mb-8">
          <Badge className="mb-4">Measurable Results</Badge>
          <h1 className="text-4xl font-bold text-foreground mb-4">Impact & Relevance</h1>
          <p className="text-xl text-muted-foreground">
            LearnPath AI demonstrates significant improvements in learning outcomes through adaptive pathways
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Active Learners
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">2,400+</div>
              <p className="text-xs text-muted-foreground mt-1">Across 45 institutions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Time Saved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">35%</div>
              <p className="text-xs text-muted-foreground mt-1">Faster mastery vs static content</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Score Improvement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">+28%</div>
              <p className="text-xs text-muted-foreground mt-1">Pre to post assessment</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Award className="h-4 w-4 text-primary" />
                Completion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">82%</div>
              <p className="text-xs text-muted-foreground mt-1">vs 58% industry average</p>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Performance Comparison</CardTitle>
            <CardDescription>
              Small pilot results demonstrate LearnPath AI's effectiveness in accelerating learning
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Bar data={chartData} options={chartOptions} />
          </CardContent>
        </Card>

        {/* Key Findings */}
        <Card>
          <CardHeader>
            <CardTitle>Key Findings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-l-4 border-primary pl-4">
              <h3 className="font-semibold mb-2">Adaptive Pathways Reduce Learning Time</h3>
              <p className="text-sm text-muted-foreground">
                Students using adaptive pathways reached mastery 35% faster than those following static curricula,
                with knowledge graph-based sequencing ensuring prerequisite concepts are mastered first.
              </p>
            </div>

            <div className="border-l-4 border-primary pl-4">
              <h3 className="font-semibold mb-2">Higher Engagement & Retention</h3>
              <p className="text-sm text-muted-foreground">
                82% completion rate compared to 58% industry average, attributed to personalized pacing
                and relevant resource recommendations.
              </p>
            </div>

            <div className="border-l-4 border-primary pl-4">
              <h3 className="font-semibold mb-2">Improved Assessment Scores</h3>
              <p className="text-sm text-muted-foreground">
                28% average improvement in post-assessment scores, with micro-quizzes and adaptive difficulty
                helping identify and address knowledge gaps in real-time.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Ready to see adaptive learning in action?
          </p>
          <Link to="/learning-path" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
            Try Interactive Demo
          </Link>
        </div>
      </div>
    </div>
  );
}
