import { NextRequest, NextResponse } from "next/server";
import { runAnalysisPipeline } from "@/lib/ai/pipeline/analysis-pipeline";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workflows, companyName, contributors } = body as {
      workflows: Parameters<typeof runAnalysisPipeline>[0];
      companyName: string;
      contributors: Parameters<typeof runAnalysisPipeline>[2];
    };

    if (!workflows || workflows.length === 0) {
      return NextResponse.json(
        { error: "No workflows provided" },
        { status: 400 }
      );
    }

    const result = await runAnalysisPipeline(
      workflows,
      companyName || "the company",
      contributors || []
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Analysis pipeline error:", error);
    return NextResponse.json(
      { error: "Failed to run analysis pipeline" },
      { status: 500 }
    );
  }
}
