import Anthropic from "@anthropic-ai/sdk";
import { loadPrompt, loadFramework } from "./prompt-loader";
import {
  AnalysisOutput,
  type AnalysisOutput as AnalysisOutputType,
} from "../schemas/recommendation-output";
import type { CanonicalWorkflow } from "../schemas/extraction-output";

const anthropic = new Anthropic();

/**
 * Run the full analysis pipeline on a set of canonical workflows.
 * Produces recommendations, assessment, and roadmap.
 */
export async function runAnalysisPipeline(
  workflows: CanonicalWorkflow[],
  companyName: string,
  contributors: { id: string; name: string; role: string; department: string }[]
): Promise<AnalysisOutputType> {
  // Load the framework and analysis prompt
  const framework = await loadFramework();
  const systemPrompt = await loadPrompt("analysis-system.md", {
    company_name: companyName,
    framework,
  });

  // Build the context
  const input = {
    workflows,
    contributors,
    companyName,
  };

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 8192,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: `Analyze these workflows and produce recommendations:\n\n${JSON.stringify(input, null, 2)}`,
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  const jsonStr = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const raw = JSON.parse(jsonStr);
  return AnalysisOutput.parse(raw);
}
