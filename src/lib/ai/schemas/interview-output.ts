import { z } from "zod";

export const InterviewPhase = z.enum([
  "warmup",
  "tools",
  "workflows",
  "pain_points",
  "info_flows",
  "ai_comfort",
  "wrapup",
]);
export type InterviewPhase = z.infer<typeof InterviewPhase>;

export const AiComfort = z.enum(["none", "beginner", "intermediate", "advanced"]);
export type AiComfort = z.infer<typeof AiComfort>;

export const WorkflowMention = z.object({
  title: z.string(),
  frequency: z.string().nullable().optional(),
  timeSpent: z.string().nullable().optional(),
});

export const HandoffMention = z.object({
  direction: z.enum(["from", "to"]),
  department: z.string(),
  what: z.string(),
  method: z.string().nullable().optional(),
});

export const ExtractedSoFar = z.object({
  name: z.string().nullable().optional(),
  role: z.string().nullable().optional(),
  department: z.string().nullable().optional(),
  tools: z.array(z.string()).default([]),
  workflows: z.array(WorkflowMention).default([]),
  painPoints: z.array(z.string()).default([]),
  handoffs: z.array(HandoffMention).default([]),
  aiComfort: AiComfort.nullable().optional(),
});
export type ExtractedSoFar = z.infer<typeof ExtractedSoFar>;

/**
 * The structured JSON output from the interview agent on each turn.
 * Claude returns this; we parse + validate with Zod.
 * Uses .nullable() throughout because Claude often sends null instead of omitting fields.
 */
export const InterviewTurnOutput = z.object({
  /** The message text displayed to the user */
  message: z.string(),
  /** Current interview phase */
  phase: InterviewPhase,
  /** Cumulative extraction — everything gathered so far */
  extractedSoFar: ExtractedSoFar,
  /** Optional quick-select pills for the UI (tool names, departments, etc.) */
  suggestedPills: z.array(z.string()).nullable().optional(),
  /** Optional multiple-choice options */
  suggestedOptions: z
    .array(z.object({ label: z.string(), value: z.string() }))
    .nullable()
    .optional(),
  /** Whether the agent wants to probe deeper on this topic */
  shouldProbe: z.boolean(),
  /** Why the agent wants to probe (internal reasoning) */
  probeReason: z.string().nullable().optional(),
  /** True when the interview has gathered enough data to complete */
  interviewComplete: z.boolean(),
});
export type InterviewTurnOutput = z.infer<typeof InterviewTurnOutput>;
