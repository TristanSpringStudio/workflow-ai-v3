import { NextRequest, NextResponse } from "next/server";
import { runExtractionPipeline } from "@/lib/ai/pipeline/extraction-pipeline";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transcripts } = body as {
      transcripts: {
        transcript: { role: "assistant" | "user"; content: string }[];
        contributorId: string;
        interviewDate: string;
      }[];
    };

    if (!transcripts || transcripts.length === 0) {
      return NextResponse.json(
        { error: "No transcripts provided" },
        { status: 400 }
      );
    }

    const result = await runExtractionPipeline(transcripts);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Extraction pipeline error:", error);
    return NextResponse.json(
      { error: "Failed to run extraction pipeline" },
      { status: 500 }
    );
  }
}
