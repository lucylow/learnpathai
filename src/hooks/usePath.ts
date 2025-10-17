import { useQuery, useQueryClient } from "@tanstack/react-query";
import { generatePath, PathStep, Attempt } from "../api/paths";

export function usePath(userId: string, opts: { attempts?: Attempt[]; targets?: string[] }) {
  const qc = useQueryClient();
  
  return useQuery({
    queryKey: ["path", userId, opts.targets?.join(","), JSON.stringify(opts.attempts || [])],
    queryFn: async () => {
      const res = await generatePath(userId, { 
        attempts: opts.attempts || [], 
        targets: opts.targets || [] 
      });
      return res;
    },
    staleTime: 1000 * 10,
    refetchOnWindowFocus: false,
  });
}
