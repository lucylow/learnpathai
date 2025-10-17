// src/pages/LearningPathViewer.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import sendXAPIEvent from "../lib/xapi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { CheckCircle2, BookOpen, ExternalLink, Loader2 } from "lucide-react";

type PathStep = {
  concept: string;
  mastery: number;
  recommended: boolean;
  resourceIds: string[];
};

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

export default function LearningPathViewer(){
  const [path, setPath] = useState<PathStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId] = useState("demo_user_1");
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchPath(){
      setLoading(true);
      try{
        const resp = await axios.post(`${BACKEND_URL}/api/paths/generate`, {
          userId,
          targets: ["project"], // demo target
          recentAttempts: [
            { concept: "variables", correct: true },
            { concept: "loops", correct: false },
            { concept: "loops", correct: true }
          ]
        });
        setPath(resp.data.path || []);
      }catch(e){
        console.error("Failed to fetch path:", e);
      }finally{
        setLoading(false);
      }
    }
    fetchPath();
  }, [userId]);

  async function completeStep(idx: number){
    const step = path[idx];
    
    // mark as complete in UI
    setCompletedSteps(prev => new Set(prev).add(step.concept));

    // send progress to backend
    try{
      await axios.post(`${BACKEND_URL}/api/progress`, {
        userId,
        concept: step.concept,
        status: "completed",
        timestamp: new Date().toISOString()
      });
      
      // emit xAPI-like event to events collector
      sendXAPIEvent({
        actor: { id: `user:${userId}` },
        verb: { id: "http://adlnet.gov/expapi/verbs/completed", display: { "en-US": "completed" }},
        object: { id: `concept:${step.concept}`, definition: { name: { "en-US": step.concept }}},
        result: { success: true },
        timestamp: new Date().toISOString()
      });
    }catch(e){
      console.error("progress save failed", e);
    }
  }

  if(loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if(path.length === 0) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>No Recommendations Found</CardTitle>
            <CardDescription>
              You've mastered all the concepts! Great job! 🎉
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const completedCount = completedSteps.size;
  const totalCount = path.length;
  const progressPercent = (completedCount / totalCount) * 100;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Your Learning Path</h1>
        <p className="text-gray-600 mb-4">
          Personalized recommendations based on your mastery levels
        </p>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Progress</CardTitle>
            <CardDescription>
              {completedCount} of {totalCount} concepts completed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={progressPercent} className="h-2" />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {path.map((step, idx) => {
          const isCompleted = completedSteps.has(step.concept);
          
          return (
            <Card key={step.concept} className={isCompleted ? "opacity-60 border-green-200" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        Step {idx + 1}
                      </Badge>
                      {isCompleted && (
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl capitalize">{step.concept}</CardTitle>
                    <CardDescription className="mt-2">
                      Current mastery: <span className="font-semibold">{(step.mastery * 100).toFixed(0)}%</span>
                    </CardDescription>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    {!isCompleted && (
                      <Button
                        onClick={() => completeStep(idx)}
                        variant="default"
                        size="sm"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Mark Complete
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <BookOpen className="h-4 w-4" />
                    <span className="font-semibold">Resources:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {step.resourceIds.map((resId) => (
                      <a
                        key={resId}
                        href={`#/resource/${resId}`}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-md text-sm hover:bg-blue-100 transition-colors"
                      >
                        {resId}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

