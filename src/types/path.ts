export interface Attempt {
  concept: string;
  correct: boolean;
}

export interface Resource {
  id: string;
  title: string;
  type: string;
  duration: number;
}

export interface PathStep {
  concept: string;
  mastery: number;
  resources: Resource[];
  reasoning?: string;
}

export interface PathResponse {
  mastery: number;
  path: PathStep[];
  userId: string;
}
