import { NextRequest, NextResponse } from "next/server";
import {
  processInterviewTurn,
  getOpeningMessage,
  type ChatMessage,
} from "@/lib/ai/pipeline/interview-agent";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      messages,
      companyName = "your company",
      userName,
    }: { messages: ChatMessage[]; companyName?: string; userName?: string } = body;

    // If no messages, return the opening message
    if (!messages || messages.length === 0) {
      const opening = getOpeningMessage(companyName, userName);
      return NextResponse.json(opening);
    }

    // Process the conversation turn
    const result = await processInterviewTurn(messages, companyName);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Interview chat error:", error);
    return NextResponse.json(
      { error: "Failed to process interview turn" },
      { status: 500 }
    );
  }
}
