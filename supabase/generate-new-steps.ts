/**
 * Generate AI-enhanced workflow steps (newSteps) for all recommendations
 * that currently have empty newSteps arrays.
 *
 * Usage: npx tsx supabase/generate-new-steps.ts
 */

import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(__dirname, "../.env.local"), override: true });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

interface Step {
  order: number;
  title: string;
  description: string;
  actor: "human" | "tool" | "ai";
  tool?: string;
  toolIcon?: string;
}

const SYSTEM_PROMPT = `You are an AI transformation consultant. Given a workflow's current steps and the AI recommendation for how to improve it, generate the NEW version of the workflow steps that shows how the workflow would look AFTER AI is implemented.

Rules:
- Each step needs: order (number), title (string), description (string), actor ("human" | "tool" | "ai"), and optionally tool (string) and toolIcon (string for the tool name to show its favicon).
- Steps where AI takes over should have actor: "ai" and a description explaining what AI does.
- Steps that remain human should have actor: "human" with a "Human" label feel — like "Review and approve", "Make final decision", etc.
- Steps that are fully automated tool integrations should have actor: "tool".
- The new workflow should be FEWER steps or the SAME number as before, never more — AI should simplify, not add bureaucracy.
- Keep step titles short and action-oriented (2-4 words).
- Descriptions should be 1 sentence explaining what happens in this step.
- Include specific tool names when relevant (e.g., "HubSpot", "GitHub", "Claude", "Slack").
- toolIcon should be the tool name that can be used to fetch a favicon (e.g., "HubSpot", "Google Sheets", "GitHub").

Return ONLY a JSON array of step objects. No markdown, no explanation.`;

async function generateNewSteps(
  title: string,
  currentSteps: Step[],
  aiHandles: string[],
  humanDecides: string[],
  summary: string,
  tools: string[]
): Promise<Step[]> {
  const userPrompt = `Workflow: "${title}"

Current steps:
${JSON.stringify(currentSteps, null, 2)}

Tools used: ${tools.join(", ") || "None specified"}

AI Recommendation: ${summary}

What AI will handle:
${aiHandles.map((h) => `- ${h}`).join("\n")}

What humans still decide:
${humanDecides.map((h) => `- ${h}`).join("\n")}

Generate the new AI-enhanced workflow steps as a JSON array.`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  const text = (response.content[0] as { type: string; text: string }).text.trim();

  // Parse JSON — handle possible markdown wrapping
  const jsonStr = text.replace(/^```json\n?/, "").replace(/\n?```$/, "");
  return JSON.parse(jsonStr);
}

async function main() {
  // Fetch all workflows with their recommendations
  const { data: workflows, error } = await supabase
    .from("workflows")
    .select(`
      id, short_id, title, steps, tools,
      recommendations ( id, new_steps, ai_handles, human_decides, summary )
    `)
    .eq("company_id", "05973926-bf35-4673-81a6-4b8895bb677e")
    .order("short_id", { ascending: true });

  if (error) {
    console.error("Error fetching workflows:", error);
    process.exit(1);
  }

  // Filter to workflows with recommendations that have empty newSteps
  // Note: Supabase may return recommendations as object or array depending on relation
  const getRec = (w: any) => {
    const r = w.recommendations;
    if (!r) return null;
    if (Array.isArray(r)) return r[0] || null;
    return r; // single object
  };

  const toProcess = workflows.filter((w: any) => {
    const rec = getRec(w);
    if (!rec) return false;
    const ns = rec.new_steps;
    return !ns || !Array.isArray(ns) || ns.length === 0;
  });

  // Debug first workflow
  if (workflows.length > 0) {
    const w0 = workflows[0] as any;
    console.log("Sample workflow keys:", Object.keys(w0));
    console.log("recommendations type:", typeof w0.recommendations, Array.isArray(w0.recommendations));
    if (w0.recommendations) {
      const r = Array.isArray(w0.recommendations) ? w0.recommendations[0] : w0.recommendations;
      console.log("rec keys:", r ? Object.keys(r) : "no rec");
      console.log("new_steps:", JSON.stringify(r?.new_steps)?.slice(0, 100));
    }
  }
  console.log(`Found ${toProcess.length} workflows needing newSteps generation (of ${workflows.length} total).`);

  let success = 0;
  let failed = 0;

  for (const w of toProcess) {
    const rec = getRec(w);
    const shortId = (w as any).short_id || w.id;

    try {
      console.log(`[${shortId}] Generating newSteps for: ${w.title}`);

      const newSteps = await generateNewSteps(
        w.title,
        w.steps || [],
        rec.ai_handles || [],
        rec.human_decides || [],
        rec.summary || "",
        w.tools || []
      );

      // Validate
      if (!Array.isArray(newSteps) || newSteps.length === 0) {
        console.error(`[${shortId}] Invalid response — empty or not array`);
        failed++;
        continue;
      }

      // Update the recommendation
      const { error: updateError } = await supabase
        .from("recommendations")
        .update({ new_steps: newSteps })
        .eq("id", rec.id);

      if (updateError) {
        console.error(`[${shortId}] DB update error:`, updateError);
        failed++;
      } else {
        console.log(`[${shortId}] ✓ ${newSteps.length} steps generated`);
        success++;
      }

      // Small delay to avoid rate limiting
      await new Promise((r) => setTimeout(r, 500));
    } catch (err) {
      console.error(`[${shortId}] Error:`, err);
      failed++;
    }
  }

  console.log(`\nDone! ${success} succeeded, ${failed} failed.`);
}

main();
