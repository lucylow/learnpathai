import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layout } from "@/components/Layout";
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
    <Layout>

      <div className="border-b border-border bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-4xl">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2 sm:mb-3">Adaptive Learning Path</h1>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground">Your personalized learning journey, powered by AI</p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-4xl">
        <Card className="mb-4 sm:mb-6 border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <CardTitle className="text-base sm:text-lg">Interactive Demo</CardTitle>
            </div>
            <CardDescription className="text-sm">Simulate quiz attempts to see how the learning path adapts in real-time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row flex-wrap gap-2">
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
              <div className="mt-3 text-xs sm:text-sm text-muted-foreground">
                Recent attempts: {attempts.map(a => a.concept).join(", ")}
              </div>
            )}
          </CardContent>
        </Card>

        {data && (
          <Card className="mb-4 sm:mb-6">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Overall Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-primary">
                    {Math.round(data.mastery * 100)}%
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Average Mastery</div>
                </div>
                <Badge variant="secondary" className="text-sm sm:text-base lg:text-lg px-3 sm:px-4 py-1.5 sm:py-2">
                  {data.path.length} Concepts
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-8 sm:py-12">
            <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary" />
          </div>
        )}

        {data && (
          <div className="space-y-3 sm:space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold">Your Learning Path</h2>
            {data.path.map((step, index) => (
              <Card key={step.concept}>
                <CardHeader>
                  <div className="flex items-start gap-2 sm:gap-3">
                    <Badge variant="outline" className="text-xs sm:text-sm">{index + 1}</Badge>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base sm:text-lg">{step.concept}</CardTitle>
                      <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-muted-foreground">
                        Mastery: {Math.round(step.mastery * 100)}%
                      </div>
                      {step.reasoning && (
                        <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-muted-foreground">{step.reasoning}</p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {step.resources.map((resource) => (
                      <div key={resource.id} className="p-2 sm:p-3 border rounded-lg">
                        <div className="font-medium text-sm sm:text-base">{resource.title}</div>
                        <div className="text-xs sm:text-sm text-muted-foreground">
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
    </Layout>
  );
}
