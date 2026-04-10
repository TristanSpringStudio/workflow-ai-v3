import { NextRequest, NextResponse } from "next/server";
import {
  processInterviewTurn,
  getOpeningMessage,
  type ChatMessage,
} from "@/lib/ai/pipeline/interview-agent";
import { getDistinctDepartments } from "@/lib/supabase/queries";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      messages,
      companyName = "your company",
      userName,
      companyId,
    }: {
      messages: ChatMessage[];
      companyName?: string;
      userName?: string;
      companyId?: string;
    } = body;

    // Fetch the company's existing departments so the AI can offer them
    // as quick-select chips. Empty list is fine — the AI will just ask
    // open-endedly for the first interviewee in a fresh org.
    const existingDepartments = companyId
      ? await getDistinctDepartments(companyId)
      : [];

    // If no messages, return the opening message
    if (!messages || messages.length === 0) {
      const opening = getOpeningMessage(companyName, userName);
      return NextResponse.json(opening);
    }

    // Process the conversation turn
    const result = await processInterviewTurn(
      messages,
      companyName,
      existingDepartments,
      userName
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Interview chat error:", error);
    return NextResponse.json(
      { error: "Failed to process interview turn" },
      { status: 500 }
    );
  }
}
