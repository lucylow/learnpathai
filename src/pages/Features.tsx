import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layout } from "@/components/Layout";
import { Brain, GitBranch, Zap, BarChart3, FileText, Shield } from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    icon: GitBranch,
    title: "Adaptive Pathfinding",
    description: "Knowledge-graph sequencing that preserves pedagogical prerequisites and adapts to learner progress in real-time.",
    color: "text-blue-600",
    bgColor: "bg-blue-600/10",
  },
  {
    icon: Brain,
    title: "NLP Content Intelligence",
    description: "Automatically transcribe and tag educational resources by concept, difficulty level, and learning modality.",
    color: "text-purple-600",
    bgColor: "bg-purple-600/10",
  },
  {
    icon: Zap,
    title: "Micro-assessments",
    description: "Short, targeted quizzes after each learning step provide rapid feedback and inform path adaptation.",
    color: "text-orange-600",
    bgColor: "bg-orange-600/10",
  },
  {
    icon: BarChart3,
    title: "Mastery Tracking",
    description: "Bayesian knowledge tracing estimates concept mastery in real-time, adapting difficulty and sequencing dynamically.",
    color: "text-green-600",
    bgColor: "bg-green-600/10",
  },
  {
    icon: FileText,
    title: "Explainable Recommendations",
    description: "Clear reasoning for each resource recommendation, with teacher override capabilities for curriculum control.",
    color: "text-indigo-600",
    bgColor: "bg-indigo-600/10",
  },
  {
    icon: Shield,
    title: "Teacher Analytics",
    description: "Comprehensive dashboards with cohort analytics, individual progress tracking, and exportable reports.",
    color: "text-red-600",
    bgColor: "bg-red-600/10",
  },
];

export default function Features() {
  return (
    <Layout>
      <div className="container mx-auto px-6 py-12 max-w-6xl">
        <div className="mb-12 text-center">
          <Badge className="mb-4">Core Capabilities</Badge>
          <h1 className="text-4xl font-bold text-foreground mb-4">Powerful Features</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            AI-driven learning technology that adapts to each student's needs, pace, and learning style
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {features.map((feature) => (
            <Card key={feature.title} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${feature.bgColor}`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="mb-2">{feature.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {feature.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* How It Works Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
            <CardDescription>Three-step adaptive learning process</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Assess Current Knowledge</h3>
                  <p className="text-sm text-muted-foreground">
                    Initial diagnostic quiz identifies concept mastery levels and learning gaps using Bayesian knowledge tracing
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Generate Personalized Path</h3>
                  <p className="text-sm text-muted-foreground">
                    Knowledge graph algorithm sequences concepts respecting prerequisites, matched with appropriate resources
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Adapt in Real-Time</h3>
                  <p className="text-sm text-muted-foreground">
                    Micro-quizzes after each step update mastery estimates, triggering path adjustments and resource recommendations
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Experience adaptive learning firsthand
          </p>
          <Link to="/learning-path" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
            Try Interactive Demo
          </Link>
        </div>
      </div>
    </Layout>
  );
}
