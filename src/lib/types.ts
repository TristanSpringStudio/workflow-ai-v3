// ─── Company ───
export interface Company {
  id: string;
  name: string;
  industry: string;
  size: string;
  logoUrl?: string;
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

// ─── Task (Workflow): the core unit of the intelligence layer ───
export interface Task {
  id: string;
  title: string;
  description: string;
  department: string;
  contributors: string[]; // contributor IDs
  frequency: string;
  timeSpent: string;
  tools: string[];
  inputs: TaskIO[];
  steps: TaskStep[];
  outputs: TaskIO[];
  painPoints: string[];
  isBottleneck: boolean;
  recommendation?: TaskRecommendation;
  // Knowledge / provenance
  knowledge: KnowledgeCitation[];
  tags: string[];
  lastUpdated: string;
  addedBy: string;
}

export interface TaskIO {
  what: string;
  fromOrTo: string;
  method: string;
}

export interface TaskStep {
  order: number;
  title: string;
  description: string;
  actor: "human" | "tool" | "ai";
  tool?: string;
  toolIcon?: string; // tool name for logo
  // Touchpoints: people involved in this step
  touchpoints?: string[]; // contributor IDs
  // Shared step: other task IDs that share this same step
  sharedWith?: { taskId: string; taskTitle: string }[];
  // AI readiness
  aiReady?: boolean;
  aiReadyNote?: string;
}

// ─── Implementation Guide ───
export interface ImplementationStep {
  title: string;
  description: string;
  owner?: string; // contributor ID or role
  timeEstimate?: string;
  tools?: string[];
}

export interface ImplementationGuide {
  prerequisites: string[];
  steps: ImplementationStep[];
  successCriteria: string[];
  rollbackPlan: string;
  estimatedTime: string;
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
  newSteps: TaskStep[];
  aiHandles: string[];
  humanDecides: string[];
  phase: 1 | 2 | 3 | 4;
  implementation?: ImplementationGuide;
}

// ─── Knowledge citation ───
export interface KnowledgeCitation {
  contributorId: string;
  quote: string;
  interviewDate: string;
}

// ─── Assessment report ───
export interface Assessment {
  overallScore: number; // 0-100
  summary: string;
  strengths: string[];
  improvements: string[];
  quickWins: string[];
  estimatedImpact: {
    timeSaved: string;
    costSaved: string;
  };
}

// ─── Department (derived) ───
export interface Department {
  name: string;
  contributors: Contributor[];
  taskCount: number;
  bottleneckCount: number;
  aiReadiness: number;
}

// ─── Roadmap Phase ───
export interface RoadmapPhase {
  phase: number;
  name: string;
  duration: string;
  description: string;
  taskIds: string[];
  milestones: string[];
}
