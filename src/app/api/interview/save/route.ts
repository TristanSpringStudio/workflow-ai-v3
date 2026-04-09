import { NextRequest, NextResponse } from "next/server";
import { upsertInterview } from "@/lib/supabase/interviews";

/**
 * POST /api/interview/save
 * Auto-save interview transcript as conversation progresses.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tokenId, companyId, contributorId, transcript, extractedData } = body;

    if (!tokenId || !companyId) {
      return NextResponse.json({ error: "tokenId and companyId required" }, { status: 400 });
    }

    const { data, error } = await upsertInterview({
      tokenId,
      companyId,
      contributorId,
      transcript: transcript || [],
      extractedData,
    });

    if (error) throw error;
    return NextResponse.json({ success: true, id: data?.id });
  } catch (error) {
    console.error("Interview save error:", error);
    return NextResponse.json({ error: "Failed to save interview" }, { status: 500 });
  }
}
