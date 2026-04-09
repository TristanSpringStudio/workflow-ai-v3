/**
 * Run the extraction pipeline on all seeded interviews.
 * Extracts structured workflows from each transcript via Claude Sonnet.
 *
 * Run with: npx tsx supabase/run-extraction.ts
 */

import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "fs";
import { join } from "path";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const anthropic = new Anthropic();

// Load the extraction prompt
const extractionPrompt = readFileSync(
  join(process.cwd(), "src/lib/ai/prompts/extraction-system.md"),
  "utf-8"
);

interface TranscriptMessage {
  role: "assistant" | "user";
  content: string;
}

async function extractFromTranscript(
  transcript: TranscriptMessage[],
  contributorId: string,
  interviewDate: string
) {
  const systemPrompt = extractionPrompt
    .replace(/\{\{contributor_id\}\}/g, contributorId)
    .replace(/\{\{interview_date\}\}/g, interviewDate);

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

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const jsonStr = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(jsonStr);
}

async function run() {
  console.log("🔬 Running extraction pipeline on all interviews...\n");

  // Get all interviews with transcripts
  const { data: interviews, error } = await supabase
    .from("interviews")
    .select(`
      id,
      transcript,
      contributor_id,
      company_id,
      completed_at,
      contributors ( id, name, department )
    `)
    .eq("status", "completed")
    .order("created_at");

  if (error) throw error;
  if (!interviews || interviews.length === 0) {
    console.log("No completed interviews found.");
    return;
  }

  console.log(`Found ${interviews.length} completed interviews.\n`);

  // Get existing max short_id
  const { data: existingWorkflows } = await supabase
    .from("workflows")
    .select("short_id")
    .eq("company_id", interviews[0].company_id);

  let nextId = 1;
  if (existingWorkflows && existingWorkflows.length > 0) {
    const maxId = existingWorkflows
      .map((w: { short_id: string }) => parseInt(w.short_id?.replace("t", "") || "0"))
      .reduce((max: number, n: number) => Math.max(max, n), 0);
    nextId = maxId + 1;
  }

  let totalWorkflows = 0;
  let failures = 0;

  for (const iv of interviews) {
    const name = (iv.contributors as any)?.name || "Unknown";
    const dept = (iv.contributors as any)?.department || "Unknown";
    process.stdout.write(`  📋 ${name} (${dept})... `);

    try {
      const date = iv.completed_at?.split("T")[0] || new Date().toISOString().split("T")[0];
      const extraction = await extractFromTranscript(
        iv.transcript as TranscriptMessage[],
        iv.contributor_id,
        date
      );

      const workflows = extraction.extractedWorkflows || [];
      console.log(`${workflows.length} workflows extracted`);

      // Save each workflow
      for (const wf of workflows) {
        const shortId = `t${nextId++}`;

        const { data: workflow, error: wfError } = await supabase
          .from("workflows")
          .insert({
            company_id: iv.company_id,
            short_id: shortId,
            title: wf.title,
            description: wf.description || "",
            department: wf.department || dept,
            frequency: wf.frequency || "",
            time_spent: wf.timeSpent || "",
            tools: wf.tools || [],
            inputs: wf.inputs || [],
            steps: wf.steps || [],
            outputs: wf.outputs || [],
            pain_points: wf.painPoints || [],
            is_bottleneck: wf.isBottleneck || false,
            tags: [],
            knowledge: (wf.citations || []).map((c: any) => ({
              contributorId: iv.contributor_id,
              quote: c.quote,
              interviewDate: c.interviewDate,
            })),
            added_by: iv.contributor_id,
          })
          .select("id")
          .single();

        if (wfError) {
          console.error(`     ⚠️ Failed to save workflow "${wf.title}":`, wfError.message);
          continue;
        }

        // Link contributor
        if (workflow) {
          await supabase.from("workflow_contributors").insert({
            workflow_id: workflow.id,
            contributor_id: iv.contributor_id,
          });
        }

        totalWorkflows++;
      }

      // Update interview record
      await supabase
        .from("interviews")
        .update({ workflows_extracted: workflows.length })
        .eq("id", iv.id);

    } catch (err: any) {
      console.log(`❌ FAILED: ${err.message}`);
      failures++;
    }
  }

  console.log(`\n🎉 Extraction complete!`);
  console.log(`   ${totalWorkflows} workflows saved`);
  console.log(`   ${failures} failures`);
  console.log(`   Next short_id: t${nextId}`);
}

run().catch(console.error);
