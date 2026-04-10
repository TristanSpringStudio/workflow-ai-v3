import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import type { UserProfile } from "@/lib/types";

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
]);

/**
 * POST /api/profile/avatar
 * Upload the authenticated user's avatar. Multipart form-data with `file` field.
 * Stores at `user-avatars/{user_id}/avatar-{timestamp}.{ext}` and updates
 * users.avatar_url to the public URL.
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

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "File too large (max 2 MB)" }, { status: 400 });
    }
    if (!ALLOWED_MIME.has(file.type)) {
      return NextResponse.json(
        { error: "Unsupported file type. Use PNG, JPEG, WebP, or SVG." },
        { status: 400 }
      );
    }

    const ext =
      file.type === "image/png" ? "png" :
      file.type === "image/jpeg" ? "jpg" :
      file.type === "image/webp" ? "webp" :
      "svg";

    // Timestamp forces cache-busting so the avatar updates everywhere.
    const path = `${user.id}/avatar-${Date.now()}.${ext}`;

    const admin = createAdminClient();
    const arrayBuffer = await file.arrayBuffer();

    const { error: uploadError } = await admin.storage
      .from("user-avatars")
      .upload(path, arrayBuffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Avatar upload error:", uploadError);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    const { data: publicUrlData } = admin.storage
      .from("user-avatars")
      .getPublicUrl(path);

    const avatarUrl = publicUrlData.publicUrl;

    const { data: updated, error: updateError } = await admin
      .from("users")
      .update({ avatar_url: avatarUrl })
      .eq("id", user.id)
      .select("id, email, full_name, job_title, avatar_url, role")
      .single();

    if (updateError || !updated) {
      console.error("User update error:", updateError);
      return NextResponse.json({ error: "Failed to save avatar URL" }, { status: 500 });
    }

    const profile: UserProfile = {
      id: updated.id,
      email: updated.email || "",
      fullName: updated.full_name || "",
      jobTitle: updated.job_title || "",
      avatarUrl: updated.avatar_url || undefined,
      role: updated.role || "admin",
    };

    return NextResponse.json({ user: profile });
  } catch (err) {
    console.error("POST /api/profile/avatar error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/profile/avatar
 * Clear the user's avatar (revert to initials) and best-effort delete files
 * from storage.
 */
export async function DELETE() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = createAdminClient();

    // Best-effort cleanup of the user's folder. Orphaned files are harmless.
    try {
      const { data: files } = await admin.storage
        .from("user-avatars")
        .list(user.id);
      if (files && files.length > 0) {
        const paths = files.map((f) => `${user.id}/${f.name}`);
        await admin.storage.from("user-avatars").remove(paths);
      }
    } catch (e) {
      console.error("Avatar cleanup error (non-fatal):", e);
    }

    const { data: updated, error } = await admin
      .from("users")
      .update({ avatar_url: null })
      .eq("id", user.id)
      .select("id, email, full_name, job_title, avatar_url, role")
      .single();

    if (error || !updated) {
      return NextResponse.json({ error: "Failed to clear avatar" }, { status: 500 });
    }

    const profile: UserProfile = {
      id: updated.id,
      email: updated.email || "",
      fullName: updated.full_name || "",
      jobTitle: updated.job_title || "",
      avatarUrl: undefined,
      role: updated.role || "admin",
    };

    return NextResponse.json({ user: profile });
  } catch (err) {
    console.error("DELETE /api/profile/avatar error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
