import { z } from "zod";

export const TaskIOSchema = z.object({
  what: z.string(),
  fromOrTo: z.string(),
  method: z.string(),
});

export const ExtractedStep = z.object({
  order: z.number(),
  title: z.string(),
  description: z.string(),
  actor: z.enum(["human", "tool", "ai"]),
  tool: z.string().optional(),
});

export const Citation = z.object({
  quote: z.string(),
  interviewDate: z.string(),
});

export const ExtractedWorkflow = z.object({
  title: z.string(),
  description: z.string(),
  frequency: z.string(),
  timeSpent: z.string(),
  department: z.string(),
  tools: z.array(z.string()),
  inputs: z.array(TaskIOSchema),
  steps: z.array(ExtractedStep),
  outputs: z.array(TaskIOSchema),
  painPoints: z.array(z.string()),
  isBottleneck: z.boolean(),
  citations: z.array(Citation),
});
export type ExtractedWorkflow = z.infer<typeof ExtractedWorkflow>;

/**
 * Output from Stage 2 extraction: one transcript → structured workflows.
 */
export const ExtractionOutput = z.object({
  contributorId: z.string(),
  extractedWorkflows: z.array(ExtractedWorkflow),
});
export type ExtractionOutput = z.infer<typeof ExtractionOutput>;

/**
 * Output from dedup: merged canonical workflow.
 */
export const SharedStepRef = z.object({
  taskId: z.string(),
  taskTitle: z.string(),
});

export const CanonicalStep = z.object({
  order: z.number(),
  title: z.string(),
  description: z.string(),
  actor: z.enum(["human", "tool", "ai"]),
  tool: z.string().optional(),
  toolIcon: z.string().optional(),
  touchpoints: z.array(z.string()).default([]),
  sharedWith: z.array(SharedStepRef).default([]),
  aiReady: z.boolean().optional(),
  aiReadyNote: z.string().optional(),
});

export const CanonicalWorkflow = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  department: z.string(),
  contributors: z.array(z.string()),
  frequency: z.string(),
  timeSpent: z.string(),
  tools: z.array(z.string()),
  inputs: z.array(TaskIOSchema),
  steps: z.array(CanonicalStep),
  outputs: z.array(TaskIOSchema),
  painPoints: z.array(z.string()),
  isBottleneck: z.boolean(),
  tags: z.array(z.string()).default([]),
  lastUpdated: z.string(),
  addedBy: z.string(),
  knowledge: z.array(
    z.object({
      contributorId: z.string(),
      quote: z.string(),
      interviewDate: z.string(),
    })
  ),
});
export type CanonicalWorkflow = z.infer<typeof CanonicalWorkflow>;

export const DeduplicationOutput = z.object({
  workflows: z.array(CanonicalWorkflow),
});
export type DeduplicationOutput = z.infer<typeof DeduplicationOutput>;
