import { NextRequest, NextResponse } from "next/server";
import { lookupToken } from "@/lib/supabase/interviews";

/**
 * GET /api/interview/token?token=xxx
 * Look up an interview token to get company + contributor info.
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 400 });
  }

  const data = await lookupToken(token);
  if (!data) {
    return NextResponse.json({ error: "Invalid token" }, { status: 404 });
  }

  return NextResponse.json(data);
}
