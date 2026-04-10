import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import type { UserProfile } from "@/lib/types";

/**
 * PATCH /api/profile
 * Update the authenticated user's profile fields (fullName, jobTitle).
 * Email is read-only — it's the auth identity and must be changed through
 * Supabase Auth's email flow.
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

    const body = await request.json();
    const updates: Record<string, string | null> = {};

    if (typeof body.fullName === "string") {
      const name = body.fullName.trim();
      if (!name) {
        return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
      }
      if (name.length > 120) {
        return NextResponse.json({ error: "Name too long" }, { status: 400 });
      }
      updates.full_name = name;
    }

    if (typeof body.jobTitle === "string") {
      const jobTitle = body.jobTitle.trim().slice(0, 120);
      updates.job_title = jobTitle || null;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields provided" }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("users")
      .update(updates)
      .eq("id", user.id)
      .select("id, email, full_name, job_title, avatar_url, role")
      .single();

    if (error || !data) {
      console.error("Update profile error:", error);
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }

    const profile: UserProfile = {
      id: data.id,
      email: data.email || "",
      fullName: data.full_name || "",
      jobTitle: data.job_title || "",
      avatarUrl: data.avatar_url || undefined,
      role: data.role || "admin",
    };

    return NextResponse.json({ user: profile });
  } catch (err) {
    console.error("PATCH /api/profile error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
