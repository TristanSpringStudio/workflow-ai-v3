import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

/**
 * PATCH /api/company
 * Update the authenticated user's company fields (name, industry, size).
 * Returns the updated company.
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("users")
      .select("company_id")
      .eq("id", user.id)
      .single();

    if (!profile?.company_id) {
      return NextResponse.json({ error: "No company found" }, { status: 404 });
    }

    const body = await request.json();
    const updates: Record<string, string> = {};

    if (typeof body.name === "string") {
      const name = body.name.trim();
      if (!name) {
        return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
      }
      if (name.length > 120) {
        return NextResponse.json({ error: "Name too long" }, { status: 400 });
      }
      updates.name = name;
    }
    if (typeof body.industry === "string") {
      updates.industry = body.industry.trim().slice(0, 120);
    }
    if (typeof body.size === "string") {
      updates.size = body.size.trim().slice(0, 40);
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields provided" }, { status: 400 });
    }

    const { data, error } = await admin
      .from("companies")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", profile.company_id)
      .select()
      .single();

    if (error) {
      console.error("Update company error:", error);
      return NextResponse.json({ error: "Failed to update company" }, { status: 500 });
    }

    return NextResponse.json({
      company: {
        id: data.id,
        name: data.name,
        industry: data.industry || "",
        size: data.size || "",
        logoUrl: data.logo_url || undefined,
        createdAt: data.created_at,
      },
    });
  } catch (err) {
    console.error("PATCH /api/company error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
