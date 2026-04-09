/**
 * Run deduplication pipeline on all extracted workflows.
 * Uses a lightweight approach: sends titles/descriptions to Claude to identify dupes,
 * then merges programmatically.
 *
 * Run with: npx tsx supabase/run-dedup.ts
 */

import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const anthropic = new Anthropic();

/**
 * Ask Claude to identify duplicate workflows from a lightweight summary.
 * Returns merge groups: arrays of workflow IDs that should be merged.
 */
async function identifyDuplicates(
  summaries: { id: string; title: string; description: string; department: string; tools: string[]; frequency: string }[]
): Promise<{ mergeGroups: { ids: string[]; canonicalTitle: string; canonicalDescription: string }[] }> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: `You identify duplicate or near-duplicate workflows. Two workflows are duplicates if they describe the same repeatable process, even if described by different people or with slightly different words.

Output JSON only:
{
  "mergeGroups": [
    {
      "ids": ["id1", "id2"],
      "canonicalTitle": "Best title for the merged workflow",
      "canonicalDescription": "Combined 1-2 sentence description"
    }
  ]
}

Only include workflows that ARE duplicates. Workflows that are unique should NOT appear in any merge group. If no duplicates exist, return {"mergeGroups": []}.`,
    messages: [
      {
        role: "user",
        content: `Identify duplicates among these workflows:\n\n${JSON.stringify(summaries, null, 2)}`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const jsonStr = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(jsonStr);
}

async function run() {
  console.log("🔄 Running deduplication pipeline...\n");

  // Get all workflows (lightweight fields only for dedup)
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
  console.log(`Found ${workflows.length} workflows. Identifying duplicates...\n`);

  // Build lightweight summaries for Claude
  const summaries = workflows.map((w) => ({
    id: w.id,
    title: w.title,
    description: (w.description || "").slice(0, 200),
    department: w.department,
    tools: w.tools || [],
    frequency: w.frequency || "",
  }));

  // Batch by department for better accuracy
  const byDept: Record<string, typeof summaries> = {};
  for (const s of summaries) {
    const dept = s.department || "Other";
    if (!byDept[dept]) byDept[dept] = [];
    byDept[dept].push(s);
  }

  const allMergeGroups: { ids: string[]; canonicalTitle: string; canonicalDescription: string }[] = [];

  for (const [dept, deptSummaries] of Object.entries(byDept)) {
    if (deptSummaries.length <= 1) continue;
    process.stdout.write(`  📦 ${dept} (${deptSummaries.length})... `);
    try {
      const result = await identifyDuplicates(deptSummaries);
      const groups = result.mergeGroups || [];
      console.log(`${groups.length} merge groups found`);
      allMergeGroups.push(...groups);
    } catch (err: any) {
      console.log(`❌ FAILED: ${err.message}`);
    }
  }

  if (allMergeGroups.length === 0) {
    console.log("\nNo duplicates found. All workflows are unique.");
    return;
  }

  console.log(`\n  Found ${allMergeGroups.length} merge groups. Merging...\n`);

  // Build a lookup of all workflows by ID
  const wfById = new Map(workflows.map((w) => [w.id, w]));
  let mergedCount = 0;

  for (const group of allMergeGroups) {
    const wfs = group.ids.map((id) => wfById.get(id)).filter(Boolean);
    if (wfs.length < 2) continue;

    const primary = wfs[0]!;
    const others = wfs.slice(1);

    console.log(`  🔗 Merging: "${group.canonicalTitle}"`);
    for (const w of others) {
      console.log(`     ← "${w!.title}"`);
    }

    // Merge: update primary with combined data
    const allTools = [...new Set(wfs.flatMap((w) => w!.tools || []))];
    const allPainPoints = [...new Set(wfs.flatMap((w) => w!.pain_points || []))];
    const allKnowledge = wfs.flatMap((w) => w!.knowledge || []);
    const allContribs = [...new Set(wfs.flatMap((w) => (w!.workflow_contributors || []).map((wc: any) => wc.contributor_id)))];

    // Use the most detailed steps (longest array)
    const bestSteps = wfs.reduce((best, w) => {
      const steps = w!.steps || [];
      return steps.length > (best?.length || 0) ? steps : best;
    }, primary.steps || []);

    // Update the primary workflow
    await supabase
      .from("workflows")
      .update({
        title: group.canonicalTitle,
        description: group.canonicalDescription,
        tools: allTools,
        pain_points: allPainPoints,
        knowledge: allKnowledge,
        steps: bestSteps,
        inputs: [...(primary.inputs || []), ...others.flatMap((w) => w!.inputs || [])].slice(0, 10),
        outputs: [...(primary.outputs || []), ...others.flatMap((w) => w!.outputs || [])].slice(0, 10),
      })
      .eq("id", primary.id);

    // Link all contributors to primary
    for (const cId of allContribs) {
      if (cId) {
        const { error: linkErr } = await supabase.from("workflow_contributors").insert({
          workflow_id: primary.id,
          contributor_id: cId,
        });
        // Ignore duplicate errors
      }
    }

    // Delete the duplicate workflows
    for (const w of others) {
      await supabase.from("workflows").delete().eq("id", w!.id);
    }

    mergedCount += others.length;
  }

  // Reassign short_ids sequentially
  const { data: remaining } = await supabase
    .from("workflows")
    .select("id")
    .eq("company_id", companyId)
    .order("department");

  if (remaining) {
    for (let i = 0; i < remaining.length; i++) {
      await supabase
        .from("workflows")
        .update({ short_id: `t${i + 1}` })
        .eq("id", remaining[i].id);
    }
  }

  const finalCount = remaining?.length || 0;
  console.log(`\n🎉 Dedup complete!`);
  console.log(`   ${workflows.length} → ${finalCount} workflows (${mergedCount} merged)`);
}

run().catch(console.error);
