import { z } from 'zod';

// Zod schemas for runtime validation
export const AttemptSchema = z.object({
  concept: z.string().min(1, 'Concept is required'),
  correct: z.boolean(),
  timeSpent: z.number().optional(),
  confidence: z.number().min(0).max(5).optional(),
  timestamp: z.date().optional(),
});

export const ResourceSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  type: z.enum(['video', 'article', 'interactive']),
  duration: z.number().positive(),
});

export const PathStepSchema = z.object({
  concept: z.string().min(1),
  mastery: z.number().min(0).max(1),
  resources: z.array(ResourceSchema),
  reasoning: z.string().optional(),
});

export const PathResponseSchema = z.object({
  mastery: z.number().min(0).max(1),
  path: z.array(PathStepSchema),
  userId: z.string().min(1),
});

export const PathRequestSchema = z.object({
  userId: z.string().optional(),
  targets: z.array(z.string()).optional(),
  attempts: z.array(AttemptSchema).optional(),
});

// TypeScript types inferred from Zod schemas
export type Attempt = z.infer<typeof AttemptSchema>;
export type Resource = z.infer<typeof ResourceSchema>;
export type PathStep = z.infer<typeof PathStepSchema>;
export type PathResponse = z.infer<typeof PathResponseSchema>;
export type PathRequest = z.infer<typeof PathRequestSchema>;
