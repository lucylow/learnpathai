import client from "./client";

export type Attempt = { concept: string; correct: boolean };
export type PathStep = { 
  concept: string; 
  mastery: number; 
  resources: Resource[];
  reasoning?: string;
};
export type Resource = {
  id: string;
  title: string;
  type: string;
  duration: number;
};

export async function generatePath(userId: string, opts: { targets?: string[]; attempts?: Attempt[] }) {
  if (import.meta.env.VITE_USE_MOCK_API === "true") {
    const { generatePath } = await import("../services/mockApi");
    return generatePath({ targets: opts.targets, attempts: opts.attempts });
  }
  const resp = await client.post("/api/paths/generate", { 
    userId, 
    targets: opts.targets, 
    recentAttempts: opts.attempts 
  });
  return resp.data;
}
