import { useQuery } from "@tanstack/react-query";
import { generatePath } from "../services/mockApi";
import type { Attempt, PathResponse } from "../types/path";

export function usePath(userId: string, opts: { attempts?: Attempt[]; targets?: string[] }) {
  return useQuery<PathResponse>({
    queryKey: ["path", userId, opts.targets?.join(","), JSON.stringify(opts.attempts || [])],
    queryFn: () => generatePath({ 
      attempts: opts.attempts || [], 
      targets: opts.targets || [] 
    }),
    staleTime: 1000 * 10,
    refetchOnWindowFocus: false,
  });
}
