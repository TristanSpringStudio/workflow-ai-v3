/**
 * Run analysis pipeline on all deduplicated workflows.
 * Generates AI readiness scores, recommendations, and implementation guides.
 * Processes in batches to stay within token limits.
 *
 * Run with: npx tsx supabase/run-analysis.ts
 */

import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "fs";
import { join } from "path";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const anthropic = new Anthropic();

const analysisPrompt = readFileSync(
  join(process.cwd(), "src/lib/ai/prompts/analysis-system.md"),
  "utf-8"
);
const framework = readFileSync(
  join(process.cwd(), "src/lib/ai-transformation-framework.md"),
  "utf-8"
);

/**
 * Analyze a single workflow and produce a recommendation.
 */
async function analyzeWorkflow(
  workflow: any,
  contributors: any[]
): Promise<any> {
  const systemPrompt = analysisPrompt
    .replace(/\{\{company_name\}\}/g, "Zippy Zaps")
    .replace(/\{\{framework\}\}/g, framework);

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: `Analyze this single workflow and produce a recommendation. Output JSON with just the recommendation object (not the full analysis output — just one recommendation for this workflow).

Workflow:
${JSON.stringify(workflow, null, 2)}

Available contributors for implementation ownership:
${JSON.stringify(contributors.map((c: any) => ({ id: c.id, name: c.name, role: c.role, department: c.department })), null, 2)}

Output format:
{
  "summary": "...",
  "impact": { "timeSaved": "...", "costSaved": "...", "qualityGain": "..." },
  "priority": "critical|high|medium|low",
  "difficulty": "easy|moderate|complex",
  "aiHandles": ["..."],
  "humanDecides": ["..."],
  "phase": 1-4,
  "implementation": {
    "prerequisites": ["..."],
    "steps": [{ "title": "...", "description": "...", "owner": "contributor_id", "tools": ["..."], "timeEstimate": "..." }],
    "successCriteria": ["..."],
    "rollbackPlan": "...",
    "estimatedTime": "..."
  }
}`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const jsonStr = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(jsonStr);
}

/**
 * Generate the overall company assessment.
 */
async function generateAssessment(
  workflowSummaries: { title: string; department: string; priority: string; phase: number; timeSaved: string }[]
): Promise<any> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    system: `You produce a company-wide AI readiness assessment. Output JSON only.`,
    messages: [
      {
        role: "user",
        content: `Based on these workflow analyses for Zippy Zaps (B2B SaaS, 51-200 employees), produce an overall assessment.

Workflow recommendations:
${JSON.stringify(workflowSummaries, null, 2)}

Output:
{
  "overallScore": 0-100,
  "summary": "2-3 sentence assessment",
  "strengths": ["..."],
  "improvements": ["..."],
  "quickWins": ["things that can be done this week"],
  "estimatedImpact": "total annual savings estimate"
}`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const jsonStr = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(jsonStr);
}

async function run() {
  console.log("🧠 Running analysis pipeline...\n");

  // Get all workflows
  const { data: workflows, error } = await supabase
    .from("workflows")
    .select(`
      id, short_id, title, description, department, frequency, time_spent,
      tools, inputs, steps, outputs, pain_points, is_bottleneck, tags,
      knowledge, added_by, company_id,
      workflow_contributors ( contributor_id )
    `)
    .order("department");

  if (error) throw error;
  if (!workflows || workflows.length === 0) {
    console.log("No workflows found.");
    return;
  }

  const companyId = workflows[0].company_id;

  // Get all contributors for ownership assignment
  const { data: contributors } = await supabase
    .from("contributors")
    .select("id, name, role, department")
    .eq("company_id", companyId);

  console.log(`Found ${workflows.length} workflows, ${contributors?.length || 0} contributors.\n`);

  // Clear existing recommendations
  await supabase.from("recommendations").delete().eq("company_id", companyId);
  await supabase.from("assessments").delete().eq("company_id", companyId);
  await supabase.from("roadmap_phases").delete().eq("company_id", companyId);

  const recSummaries: any[] = [];
  let failures = 0;

  // Analyze each workflow
  for (const wf of workflows) {
    process.stdout.write(`  📊 ${wf.short_id}: ${wf.title.slice(0, 50)}... `);

    try {
      const rec = await analyzeWorkflow(wf, contributors || []);

      // Save recommendation
      const { error: recErr } = await supabase.from("recommendations").insert({
        workflow_id: wf.id,
        company_id: companyId,
        summary: rec.summary,
        impact: rec.impact,
        priority: rec.priority,
        difficulty: rec.difficulty,
        new_steps: [], // We'll skip new_steps generation for speed
        ai_handles: rec.aiHandles || [],
        human_decides: rec.humanDecides || [],
        phase: rec.phase,
        implementation: rec.implementation,
      });

      if (recErr) {
        console.log(`⚠️ save failed: ${recErr.message}`);
      } else {
        console.log(`✅ Phase ${rec.phase} | ${rec.priority} | ${rec.impact?.timeSaved || "?"}`);
      }

      recSummaries.push({
        title: wf.title,
        department: wf.department,
        priority: rec.priority,
        phase: rec.phase,
        timeSaved: rec.impact?.timeSaved || "unknown",
      });
    } catch (err: any) {
      console.log(`❌ ${err.message.slice(0, 80)}`);
      failures++;
    }
  }

  // Generate overall assessment
  console.log("\n  📋 Generating overall assessment...");
  try {
    const assessment = await generateAssessment(recSummaries);

    const { error: assessErr } = await supabase.from("assessments").insert({
      company_id: companyId,
      overall_score: assessment.overallScore,
      summary: assessment.summary,
      strengths: assessment.strengths || [],
      improvements: assessment.improvements || [],
      quick_wins: assessment.quickWins || [],
      estimated_impact: assessment.estimatedImpact || "",
    });

    if (assessErr) {
      console.log(`  ⚠️ Assessment save failed: ${assessErr.message}`);
    } else {
      console.log(`  ✅ Score: ${assessment.overallScore}/100`);
      console.log(`  💰 Estimated impact: ${assessment.estimatedImpact}`);
    }
  } catch (err: any) {
    console.log(`  ❌ Assessment failed: ${err.message}`);
  }

  // Generate roadmap phases
  console.log("\n  🗺️ Generating roadmap...");
  const phases = [1, 2, 3, 4];
  const phaseNames = ["AI as a Thought Partner", "AI as an Assistant", "AI as Teammates", "AI as the System"];
  const phaseDurations = ["This week", "This month", "This quarter", "Next quarter"];

  for (const phase of phases) {
    const phaseRecs = recSummaries.filter((r) => r.phase === phase);
    if (phaseRecs.length === 0) continue;

    // Get workflow IDs for this phase
    const phaseWorkflowIds = workflows
      .filter((w) => recSummaries.find((r) => r.title === w.title && r.phase === phase))
      .map((w) => w.id);

    await supabase.from("roadmap_phases").insert({
      company_id: companyId,
      phase,
      name: phaseNames[phase - 1],
      duration: phaseDurations[phase - 1],
      description: `${phaseRecs.length} workflows identified for Level ${phase} AI transformation.`,
      workflow_ids: phaseWorkflowIds,
      milestones: phaseRecs.slice(0, 3).map((r) => r.title),
    });

    console.log(`  ✅ Phase ${phase}: ${phaseRecs.length} workflows`);
  }

  console.log(`\n🎉 Analysis complete!`);
  console.log(`   ${recSummaries.length} recommendations generated`);
  console.log(`   ${failures} failures`);
}

run().catch(console.error);
