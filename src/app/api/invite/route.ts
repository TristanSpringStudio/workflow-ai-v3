import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import crypto from "crypto";

/**
 * POST /api/invite
 * Create a contributor and generate an interview token.
 * Requires authenticated admin user.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's company
    const { data: profile } = await supabase
      .from("users")
      .select("company_id")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    const body = await request.json();
    const { name, email, role, department } = body as {
      name?: string;
      email?: string;
      role?: string;
      department?: string;
    };

    const admin = createAdminClient();

    // 1. Create contributor (if name/email provided)
    let contributorId: string | null = null;
    if (name || email) {
      const { data: contributor, error: contribError } = await admin
        .from("contributors")
        .insert({
          company_id: profile.company_id,
          name: name || "Unnamed",
          email: email || null,
          role: role || null,
          department: department || null,
        })
        .select("id")
        .single();

      if (contribError) throw contribError;
      contributorId = contributor.id;
    }

    // 2. Generate a unique token
    const token = crypto.randomBytes(12).toString("hex"); // 24 char hex string

    // 3. Create interview token
    const { data: tokenData, error: tokenError } = await admin
      .from("interview_tokens")
      .insert({
        token,
        company_id: profile.company_id,
        contributor_id: contributorId,
        invited_by: user.id,
      })
      .select()
      .single();

    if (tokenError) throw tokenError;

    // Build the interview URL
    const baseUrl = request.nextUrl.origin;
    const interviewUrl = `${baseUrl}/interview/${token}`;

    return NextResponse.json({
      token,
      interviewUrl,
      contributorId,
      tokenId: tokenData.id,
    });
  } catch (error) {
    console.error("Invite error:", error);
    return NextResponse.json({ error: "Failed to create invite" }, { status: 500 });
  }
}

/**
 * GET /api/invite
 * List all interview tokens for the authenticated user's company.
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("users")
      .select("company_id")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    const admin = createAdminClient();
    const { data: tokens, error } = await admin
      .from("interview_tokens")
      .select(`
        id,
        token,
        status,
        invited_at,
        completed_at,
        contributors ( id, name, email, role, department, ai_comfort, interviewed_at )
      `)
      .eq("company_id", profile.company_id)
      .order("invited_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(tokens || []);
  } catch (error) {
    console.error("List invites error:", error);
    return NextResponse.json({ error: "Failed to list invites" }, { status: 500 });
  }
}
