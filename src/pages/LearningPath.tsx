import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePath } from "@/hooks/usePath";
import { track } from "@/utils/telemetry";
import { Loader2, RefreshCw, Sparkles } from "lucide-react";
import type { Attempt } from "@/types/path";

export default function LearningPath() {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const { data, isLoading, refetch } = usePath("demo-user", { attempts });

  const simulateQuizFailure = (concept: string) => {
    const newAttempt: Attempt = { concept, correct: false };
    setAttempts(prev => [...prev, newAttempt]);
    track("quiz_attempt", { concept, correct: false });
    setTimeout(() => refetch(), 500);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-6 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            LearnPath AI
          </Link>
          <nav className="flex gap-6">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">Home</Link>
            <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
            <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">About</Link>
          </nav>
        </div>
      </header>

      <div className="border-b border-border bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="container mx-auto px-6 py-12 max-w-4xl">
          <h1 className="text-4xl font-bold text-foreground mb-3">Adaptive Learning Path</h1>
          <p className="text-xl text-muted-foreground">Your personalized learning journey, powered by AI</p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle>Interactive Demo</CardTitle>
            </div>
            <CardDescription>Simulate quiz attempts to see how the learning path adapts in real-time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => simulateQuizFailure("loops")} variant="outline" size="sm">
                Fail "Loops" Quiz
              </Button>
              <Button onClick={() => simulateQuizFailure("functions")} variant="outline" size="sm">
                Fail "Functions" Quiz
              </Button>
              <Button 
                onClick={() => {
                  setAttempts([]);
                  refetch();
                  track("path_reset", {});
                }}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset Path
              </Button>
            </div>
            {attempts.length > 0 && (
              <div className="mt-3 text-sm text-muted-foreground">
                Recent attempts: {attempts.map(a => a.concept).join(", ")}
              </div>
            )}
          </CardContent>
        </Card>

        {data && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Overall Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-primary">
                    {Math.round(data.mastery * 100)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Average Mastery</div>
                </div>
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {data.path.length} Concepts
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {data && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Your Learning Path</h2>
            {data.path.map((step, index) => (
              <Card key={step.concept}>
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <Badge variant="outline">{index + 1}</Badge>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{step.concept}</CardTitle>
                      <div className="mt-2 text-sm text-muted-foreground">
                        Mastery: {Math.round(step.mastery * 100)}%
                      </div>
                      {step.reasoning && (
                        <p className="mt-2 text-sm text-muted-foreground">{step.reasoning}</p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {step.resources.map((resource) => (
                      <div key={resource.id} className="p-3 border rounded-lg">
                        <div className="font-medium">{resource.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {resource.type} • {resource.duration} min
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
