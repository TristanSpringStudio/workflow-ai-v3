import Anthropic from "@anthropic-ai/sdk";
import { loadPrompt } from "./prompt-loader";
import {
  ExtractionOutput,
  DeduplicationOutput,
  type ExtractionOutput as ExtractionOutputType,
  type DeduplicationOutput as DeduplicationOutputType,
} from "../schemas/extraction-output";

const anthropic = new Anthropic();

interface TranscriptMessage {
  role: "assistant" | "user";
  content: string;
}

/**
 * Extract structured workflows from a single interview transcript.
 */
export async function extractFromTranscript(
  transcript: TranscriptMessage[],
  contributorId: string,
  interviewDate: string
): Promise<ExtractionOutputType> {
  const systemPrompt = await loadPrompt("extraction-system.md", {
    contributor_id: contributorId,
    interview_date: interviewDate,
  });

  // Format transcript as readable text
  const transcriptText = transcript
    .map((m) => `${m.role === "assistant" ? "Interviewer" : "Employee"}: ${m.content}`)
    .join("\n\n");

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: `Here is the interview transcript:\n\n${transcriptText}`,
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  const jsonStr = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const raw = JSON.parse(jsonStr);
  return ExtractionOutput.parse(raw);
}

/**
 * Deduplicate workflows across multiple interview extractions.
 * Merges identical workflows, creates sharedWith references for shared steps.
 */
export async function deduplicateWorkflows(
  extractions: ExtractionOutputType[],
  existingWorkflows?: DeduplicationOutputType
): Promise<DeduplicationOutputType> {
  const systemPrompt = await loadPrompt("extraction-dedup.md", {
    company_name: "the company",
    today: new Date().toISOString().split("T")[0],
  });

  // Build the input: all extracted workflows grouped by contributor
  const input = {
    newExtractions: extractions,
    existingWorkflows: existingWorkflows?.workflows || [],
  };

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 8192,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: `Here are the extracted workflows to deduplicate and merge:\n\n${JSON.stringify(input, null, 2)}`,
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  const jsonStr = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const raw = JSON.parse(jsonStr);
  return DeduplicationOutput.parse(raw);
}

/**
 * Run the full extraction pipeline:
 * 1. Extract workflows from each transcript
 * 2. Deduplicate across all transcripts
 */
export async function runExtractionPipeline(
  transcripts: {
    transcript: TranscriptMessage[];
    contributorId: string;
    interviewDate: string;
  }[]
): Promise<DeduplicationOutputType> {
  // Step 1: Extract from each transcript in parallel
  const extractions = await Promise.all(
    transcripts.map((t) =>
      extractFromTranscript(t.transcript, t.contributorId, t.interviewDate)
    )
  );

  // Step 2: Deduplicate
  const deduplicated = await deduplicateWorkflows(extractions);

  return deduplicated;
}
