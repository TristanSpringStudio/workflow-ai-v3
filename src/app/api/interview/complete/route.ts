import { NextRequest, NextResponse } from "next/server";
import { completeInterview } from "@/lib/supabase/interviews";
import { extractFromTranscript } from "@/lib/ai/pipeline/extraction-pipeline";
import { runAnalysisPipeline } from "@/lib/ai/pipeline/analysis-pipeline";
import { createAdminClient } from "@/lib/supabase/server";
import { getDistinctDepartments } from "@/lib/supabase/queries";
import { normalizeDepartment } from "@/lib/normalize-department";
import type { CanonicalWorkflow } from "@/lib/ai/schemas/extraction-output";

/**
 * POST /api/interview/complete
 * Mark interview as completed, create contributor, trigger extraction.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tokenId, companyId, transcript, extractedData } = body;

    if (!tokenId || !companyId || !transcript) {
      return NextResponse.json(
        { error: "tokenId, companyId, and transcript required" },
        { status: 400 }
      );
    }

    const result = await completeInterview({
      tokenId,
      companyId,
      transcript,
      extractedData,
    });

    // Return immediately — run extraction in the background
    const response = NextResponse.json({
      success: true,
      contributorId: result.contributorId,
    });

    // Fire-and-forget: run extraction pipeline
    // This runs after the response is sent so the user isn't waiting
    if (result.contributorId) {
      runExtractionInBackground(
        transcript,
        result.contributorId,
        companyId
      ).catch((err) => console.error("Background extraction failed:", err));
    }

    return response;
  } catch (error) {
    console.error("Interview complete error:", error);
    return NextResponse.json({ error: "Failed to complete interview" }, { status: 500 });
  }
}

/**
 * Run extraction pipeline and save results to the database.
 * This runs asynchronously after the interview is completed.
 */
async function runExtractionInBackground(
  transcript: { role: string; content: string }[],
  contributorId: string,
  companyId: string
) {
  try {
    const today = new Date().toISOString().split("T")[0];

    // 1. Extract workflows from transcript
    const extraction = await extractFromTranscript(
      transcript as { role: "assistant" | "user"; content: string }[],
      contributorId,
      today
    );

    if (!extraction.extractedWorkflows || extraction.extractedWorkflows.length === 0) {
      console.log("No workflows extracted from transcript");
      return;
    }

    const supabase = createAdminClient();

    // Snapshot the company's existing departments BEFORE inserting new
    // workflows so we can normalize each workflow's department against the
    // current canonical set. This catches cases where the AI extraction
    // produces a slightly different spelling than what's already on file.
    const existingDepts = await getDistinctDepartments(companyId);

    // 2. Save each extracted workflow to the database
    let nextId = 1;
    // Get the current max short_id for this company
    const { data: existingWorkflows } = await supabase
      .from("workflows")
      .select("short_id")
      .eq("company_id", companyId);

    if (existingWorkflows && existingWorkflows.length > 0) {
      const maxId = existingWorkflows
        .map((w) => parseInt(w.short_id?.replace("t", "") || "0"))
        .reduce((max, n) => Math.max(max, n), 0);
      nextId = maxId + 1;
    }

    for (const wf of extraction.extractedWorkflows) {
      const shortId = `t${nextId++}`;
      const normalizedDept = normalizeDepartment(wf.department, existingDepts);

      // Insert workflow
      const { data: workflow, error: wfError } = await supabase
        .from("workflows")
        .insert({
          company_id: companyId,
          short_id: shortId,
          title: wf.title,
          description: wf.description,
          department: normalizedDept,
          frequency: wf.frequency,
          time_spent: wf.timeSpent,
          tools: wf.tools,
          inputs: wf.inputs,
          steps: wf.steps,
          outputs: wf.outputs,
          pain_points: wf.painPoints,
          is_bottleneck: wf.isBottleneck,
          tags: [],
          knowledge: wf.citations.map((c) => ({
            contributorId,
            quote: c.quote,
            interviewDate: c.interviewDate,
          })),
          added_by: contributorId,
        })
        .select("id")
        .single();

      if (wfError) {
        console.error("Failed to save workflow:", wfError);
        continue;
      }

      // Link contributor to workflow
      if (workflow) {
        // Link contributor — ignore duplicate errors
        const { error: linkError } = await supabase
          .from("workflow_contributors")
          .insert({
            workflow_id: workflow.id,
            contributor_id: contributorId,
          });
        if (linkError && !linkError.message.includes("duplicate")) {
          console.error("Failed to link contributor:", linkError);
        }
      }
    }

    // Update interview with workflows_extracted count
    const { data: interview } = await supabase
      .from("interviews")
      .select("id")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (interview) {
      await supabase
        .from("interviews")
        .update({ workflows_extracted: extraction.extractedWorkflows.length })
        .eq("id", interview.id);
    }

    console.log(
      `Extraction complete: ${extraction.extractedWorkflows.length} workflows saved for company ${companyId}`
    );

    // Now re-run the company-wide analysis over the full workflow set.
    // Failures here must not break extraction.
    await runAnalysisInBackground(companyId).catch((err) =>
      console.error("Background analysis failed:", err)
    );
  } catch (error) {
    console.error("Extraction pipeline error:", error);
  }
}

/**
 * Re-run the company-wide analysis pipeline over ALL workflows for a company,
 * then persist the new assessment, recommendations, and roadmap.
 *
 * Called after each interview completes so the dashboard reflects the latest
 * intelligence without manual intervention.
 */
async function runAnalysisInBackground(companyId: string) {
  const supabase = createAdminClient();

  // 1. Fetch company name
  const { data: company } = await supabase
    .from("companies")
    .select("name")
    .eq("id", companyId)
    .single();
  const companyName = company?.name || "the company";

  // 2. Fetch all workflows for the company (with their contributors)
  const { data: workflowRows } = await supabase
    .from("workflows")
    .select(`
      id,
      short_id,
      title,
      description,
      department,
      frequency,
      time_spent,
      tools,
      inputs,
      steps,
      outputs,
      pain_points,
      is_bottleneck,
      tags,
      knowledge,
      added_by,
      updated_at,
      workflow_contributors ( contributor_id )
    `)
    .eq("company_id", companyId);

  if (!workflowRows || workflowRows.length === 0) {
    console.log("No workflows to analyze for company", companyId);
    return;
  }

  // 3. Fetch all contributors for the company
  const { data: contribRows } = await supabase
    .from("contributors")
    .select("id, name, role, department")
    .eq("company_id", companyId);
  const contributors = (contribRows || []).map((c) => ({
    id: c.id,
    name: c.name,
    role: c.role || "",
    department: c.department || "",
  }));

  // 4. Build CanonicalWorkflow[] using short_id as the id (analysis pipeline
  //    references workflows by short_id in its output)
  const canonical: CanonicalWorkflow[] = workflowRows.map((w) => ({
    id: w.short_id || w.id,
    title: w.title,
    description: w.description || "",
    department: w.department || "",
    contributors: (w.workflow_contributors || []).map(
      (wc: { contributor_id: string }) => wc.contributor_id
    ),
    frequency: w.frequency || "",
    timeSpent: w.time_spent || "",
    tools: w.tools || [],
    inputs: w.inputs || [],
    steps: w.steps || [],
    outputs: w.outputs || [],
    painPoints: w.pain_points || [],
    isBottleneck: w.is_bottleneck || false,
    tags: w.tags || [],
    lastUpdated: w.updated_at || "",
    addedBy: w.added_by || "",
    knowledge: w.knowledge || [],
  }));

  // Map short_id → uuid so we can resolve LLM-returned task references
  const shortIdToUuid = new Map<string, string>();
  for (const w of workflowRows) {
    if (w.short_id) shortIdToUuid.set(w.short_id, w.id);
  }

  // 5. Run analysis
  console.log(`Running analysis for ${canonical.length} workflows (company ${companyId})`);
  const analysis = await runAnalysisPipeline(canonical, companyName, contributors);

  // 6. Insert new assessment row (insert-only — getAssessment reads most recent)
  const { data: assessmentRow, error: assessErr } = await supabase
    .from("assessments")
    .insert({
      company_id: companyId,
      overall_score: analysis.assessment.overallScore,
      summary: analysis.assessment.summary,
      strengths: analysis.assessment.strengths,
      improvements: analysis.assessment.improvements,
      quick_wins: analysis.assessment.quickWins,
      estimated_impact: analysis.assessment.estimatedImpact,
    })
    .select("id")
    .single();

  if (assessErr || !assessmentRow) {
    console.error("Failed to insert assessment:", assessErr);
    return;
  }

  // 7. Upsert recommendations (one per workflow_id; unique constraint on workflow_id)
  for (const rec of analysis.recommendations) {
    const workflowUuid = shortIdToUuid.get(rec.taskId);
    if (!workflowUuid) {
      console.warn(`Recommendation references unknown workflow ${rec.taskId}, skipping`);
      continue;
    }
    const { error: recErr } = await supabase
      .from("recommendations")
      .upsert(
        {
          workflow_id: workflowUuid,
          company_id: companyId,
          summary: rec.summary,
          impact: rec.impact,
          priority: rec.priority,
          difficulty: rec.difficulty,
          new_steps: rec.newSteps,
          ai_handles: rec.aiHandles,
          human_decides: rec.humanDecides,
          phase: rec.phase,
          implementation: rec.implementation || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "workflow_id" }
      );
    if (recErr) console.error("Failed to upsert recommendation:", recErr);
  }

  // 8. Replace roadmap_phases for this company (delete-then-insert)
  await supabase.from("roadmap_phases").delete().eq("company_id", companyId);
  if (analysis.roadmap.length > 0) {
    const phaseRows = analysis.roadmap.map((p) => ({
      company_id: companyId,
      assessment_id: assessmentRow.id,
      phase: p.phase,
      name: p.name,
      duration: p.duration,
      description: p.description,
      workflow_ids: p.taskIds
        .map((tid) => shortIdToUuid.get(tid))
        .filter((u): u is string => !!u),
      milestones: p.milestones,
    }));
    const { error: phaseErr } = await supabase
      .from("roadmap_phases")
      .insert(phaseRows);
    if (phaseErr) console.error("Failed to insert roadmap phases:", phaseErr);
  }

  console.log(
    `Analysis complete for company ${companyId}: assessment ${assessmentRow.id}, ${analysis.recommendations.length} recs, ${analysis.roadmap.length} phases`
  );
}
