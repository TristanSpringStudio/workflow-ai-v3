// ─── Company ───
export interface Company {
  id: string;
  name: string;
  industry: string;
  size: string; // "1-10", "11-50", "51-200", "201-500", "500+"
  createdAt: string;
}

// ─── Employee Interview ───
export interface EmployeeInterview {
  id: string;
  name: string;
  role: string;
  department: string;
  tools: string[];
  dailyTasks: string[];
  painPoints: string[];
  timeWasters: string[]; // specific tasks that take too long
  informationSources: string[]; // where they get info from (other teams, tools, etc.)
  handoffs: Handoff[]; // what they pass to other teams
  decisions: string[]; // key decisions they make
  aiComfort: "none" | "beginner" | "intermediate" | "advanced";
  transcript: string; // raw conversation
  completedAt: string;
}

export interface Handoff {
  to: string; // department or person
  what: string; // what gets passed
  how: string; // current method (email, slack, meeting, etc.)
  frequency: string; // daily, weekly, per-project
}

// ─── Department Aggregate ───
export interface DepartmentProfile {
  name: string;
  employees: EmployeeInterview[];
  tools: string[]; // aggregated unique tools
  topPainPoints: string[];
  topTimeWasters: string[];
  handoffsIn: Handoff[]; // what comes in from other depts
  handoffsOut: Handoff[]; // what goes out to other depts
  aiReadiness: number; // 0-100
}

// ─── Workflow Recommendation ───
export interface WorkflowRecommendation {
  id: string;
  title: string;
  department: string;
  description: string;
  trigger: string;
  steps: { title: string; body: string }[];
  decisionPoints: { question: string; aiHandles: string; humanDecides: string }[];
  output: string;
  aiRole: string[];
  humanRole: string[];
  tools: string[];
  impact: {
    timeSaved: string;
    costSaved: string;
    qualityImprovement: string;
  };
  difficulty: "easy" | "moderate" | "complex";
  priority: "critical" | "high" | "medium" | "low";
  phase: 1 | 2 | 3; // implementation phase
  crossDepartment: boolean;
  connectedDepartments: string[];
}

// ─── Information Flow ───
export interface InformationFlow {
  from: string; // department
  to: string; // department
  type: string; // what flows (data, decisions, requests, deliverables)
  frequency: string;
  method: string; // how it flows (slack, email, meeting, tool)
  bottleneck: boolean;
  aiOpportunity: string | null; // how AI could improve this flow
}

// ─── Company Intelligence ───
export interface CompanyIntelligence {
  company: Company;
  departments: DepartmentProfile[];
  interviews: EmployeeInterview[];
  recommendations: WorkflowRecommendation[];
  informationFlows: InformationFlow[];
  readinessScore: number; // 0-100
  estimatedSavings: {
    hoursPerWeek: number;
    annualCost: number;
  };
  roadmap: RoadmapPhase[];
}

export interface RoadmapPhase {
  phase: number;
  name: string;
  duration: string;
  description: string;
  recommendations: string[]; // recommendation IDs
  milestones: string[];
}
