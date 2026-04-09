import { z } from "zod";
import { CanonicalStep, TaskIOSchema } from "./extraction-output";

export const Impact = z.object({
  timeSaved: z.string(),
  costSaved: z.string(),
  qualityGain: z.string(),
});

export const ImplementationStep = z.object({
  title: z.string(),
  description: z.string(),
  owner: z.string().optional(),
  tools: z.array(z.string()).optional(),
  timeEstimate: z.string().optional(),
});

export const ImplementationGuide = z.object({
  prerequisites: z.array(z.string()),
  steps: z.array(ImplementationStep),
  successCriteria: z.array(z.string()),
  rollbackPlan: z.string(),
  estimatedTime: z.string(),
});

/**
 * AI recommendation for a single workflow.
 */
export const TaskRecommendationOutput = z.object({
  taskId: z.string(),
  summary: z.string(),
  impact: Impact,
  priority: z.enum(["critical", "high", "medium", "low"]),
  difficulty: z.enum(["easy", "moderate", "complex"]),
  newSteps: z.array(CanonicalStep),
  aiHandles: z.array(z.string()),
  humanDecides: z.array(z.string()),
  phase: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  implementation: ImplementationGuide.optional(),
});
export type TaskRecommendationOutput = z.infer<typeof TaskRecommendationOutput>;

/**
 * Company-wide assessment.
 */
export const AssessmentOutput = z.object({
  overallScore: z.number().min(0).max(100),
  summary: z.string(),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
  quickWins: z.array(z.string()),
  estimatedImpact: z.string(),
});
export type AssessmentOutput = z.infer<typeof AssessmentOutput>;

/**
 * Roadmap phase output.
 */
export const RoadmapPhaseOutput = z.object({
  phase: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  name: z.string(),
  duration: z.string(),
  description: z.string(),
  taskIds: z.array(z.string()),
  milestones: z.array(z.string()),
});

/**
 * Full analysis output for all workflows.
 */
export const AnalysisOutput = z.object({
  recommendations: z.array(TaskRecommendationOutput),
  assessment: AssessmentOutput,
  roadmap: z.array(RoadmapPhaseOutput),
});
export type AnalysisOutput = z.infer<typeof AnalysisOutput>;
