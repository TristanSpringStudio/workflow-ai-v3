// ─── Company ───
export interface Company {
  id: string;
  name: string;
  industry: string;
  size: string;
  createdAt: string;
}

// ─── Contributor (employee) ───
export interface Contributor {
  id: string;
  name: string;
  role: string;
  department: string;
  avatar?: string;
  aiComfort: "none" | "beginner" | "intermediate" | "advanced";
  interviewedAt?: string;
}

// ─── Task: the core unit of the intelligence layer ───
export interface Task {
  id: string;
  title: string;
  description: string;
  department: string;
  contributors: string[]; // contributor IDs
  frequency: string; // "daily", "weekly", "per-project", etc.
  timeSpent: string; // "2 hours", "30 minutes", etc.
  tools: string[];
  // How the task flows
  inputs: TaskIO[]; // what comes in, from where
  steps: TaskStep[];
  outputs: TaskIO[]; // what goes out, to where
  // Pain
  painPoints: string[];
  isBottleneck: boolean;
  // Recommendation (if one exists)
  recommendation?: TaskRecommendation;
  // Meta
  tags: string[];
  lastUpdated: string;
  addedBy: string; // contributor ID
}

export interface TaskIO {
  what: string;
  fromOrTo: string; // department, person, or tool
  method: string; // email, slack, manual, automated
}

export interface TaskStep {
  order: number;
  title: string;
  description: string;
  actor: "human" | "tool" | "ai";
  tool?: string;
}

// ─── Recommendation: the "after" for a task ───
export interface TaskRecommendation {
  summary: string;
  impact: {
    timeSaved: string;
    costSaved: string;
    qualityGain: string;
  };
  priority: "critical" | "high" | "medium" | "low";
  difficulty: "easy" | "moderate" | "complex";
  // The improved flow
  newSteps: TaskStep[];
  aiHandles: string[];
  humanDecides: string[];
  phase: 1 | 2 | 3;
}

// ─── Department (derived from tasks + contributors) ───
export interface Department {
  name: string;
  contributors: Contributor[];
  taskCount: number;
  bottleneckCount: number;
  aiReadiness: number; // 0-100
}

// ─── Roadmap Phase ───
export interface RoadmapPhase {
  phase: number;
  name: string;
  duration: string;
  description: string;
  taskIds: string[]; // tasks with recommendations in this phase
  milestones: string[];
}
