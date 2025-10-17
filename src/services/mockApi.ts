import type { PathStep, Attempt, PathResponse, PathRequest } from "../types/path";
import { PathRequestSchema, PathResponseSchema } from "../types/path";

export async function generatePath(opts: PathRequest): Promise<PathResponse> {
  // Validate input at runtime
  const validatedRequest = PathRequestSchema.parse(opts);
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));

  const hasFailedLoops = validatedRequest.attempts?.some(a => a.concept === "loops" && !a.correct);
  const hasFailedFunctions = validatedRequest.attempts?.some(a => a.concept === "functions" && !a.correct);

  const path: PathStep[] = [
    {
      concept: "Variables",
      mastery: 0.85,
      reasoning: "Strong foundation - you've mastered basic variable concepts",
      resources: [
        { id: "v1", title: "Variables Deep Dive", type: "video", duration: 8 },
        { id: "v2", title: "Variable Scope Practice", type: "interactive", duration: 12 }
      ]
    },
    {
      concept: "Loops",
      mastery: hasFailedLoops ? 0.42 : 0.68,
      reasoning: hasFailedLoops 
        ? "Recent quiz showed gaps (2/5 correct) - reinforcement needed" 
        : "Good progress, practice recommended",
      resources: [
        { id: "l1", title: "For Loop Fundamentals", type: "video", duration: 10 },
        { id: "l2", title: "While Loop Patterns", type: "article", duration: 6 },
        { id: "l3", title: "Loop Practice Problems", type: "interactive", duration: 15 }
      ]
    },
    {
      concept: "Functions",
      mastery: hasFailedFunctions ? 0.35 : 0.52,
      reasoning: hasFailedFunctions
        ? "Low mastery (35%) + prerequisite for advanced topics"
        : "Building up - loops are a prerequisite",
      resources: [
        { id: "f1", title: "Function Basics", type: "video", duration: 12 },
        { id: "f2", title: "Parameters & Return Values", type: "interactive", duration: 18 },
        { id: "f3", title: "Function Best Practices", type: "article", duration: 7 }
      ]
    },
    {
      concept: "Arrays",
      mastery: 0.28,
      reasoning: "Next logical step after functions - arrays use loops and functions",
      resources: [
        { id: "a1", title: "Array Fundamentals", type: "video", duration: 14 },
        { id: "a2", title: "Array Methods", type: "interactive", duration: 20 }
      ]
    }
  ];

  const response: PathResponse = {
    mastery: 0.56,
    path,
    userId: "demo-user"
  };

  // Validate output before returning
  return PathResponseSchema.parse(response);
}
