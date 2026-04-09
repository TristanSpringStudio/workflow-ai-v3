import { NextRequest, NextResponse } from "next/server";
import { completeInterview } from "@/lib/supabase/interviews";
import { extractFromTranscript } from "@/lib/ai/pipeline/extraction-pipeline";
import { createAdminClient } from "@/lib/supabase/server";

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

      // Insert workflow
      const { data: workflow, error: wfError } = await supabase
        .from("workflows")
        .insert({
          company_id: companyId,
          short_id: shortId,
          title: wf.title,
          description: wf.description,
          department: wf.department,
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
  } catch (error) {
    console.error("Extraction pipeline error:", error);
  }
}
