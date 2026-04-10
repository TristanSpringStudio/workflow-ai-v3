import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED_MIME = new Set(["image/png", "image/jpeg", "image/webp", "image/svg+xml"]);

/**
 * POST /api/company/logo
 * Upload a company logo. Multipart form-data with a `file` field.
 * Stores at `company-logos/{company_id}/logo-{timestamp}.{ext}` and updates
 * companies.logo_url to the public URL.
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

    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("users")
      .select("company_id")
      .eq("id", user.id)
      .single();

    if (!profile?.company_id) {
      return NextResponse.json({ error: "No company found" }, { status: 404 });
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

    // Pick extension from mime type (don't trust original filename)
    const ext =
      file.type === "image/png" ? "png" :
      file.type === "image/jpeg" ? "jpg" :
      file.type === "image/webp" ? "webp" :
      "svg";

    // Timestamp prevents browser cache from showing the old logo
    const path = `${profile.company_id}/logo-${Date.now()}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadError } = await admin.storage
      .from("company-logos")
      .upload(path, arrayBuffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Logo upload error:", uploadError);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    const { data: publicUrlData } = admin.storage
      .from("company-logos")
      .getPublicUrl(path);

    const logoUrl = publicUrlData.publicUrl;

    const { data: updated, error: updateError } = await admin
      .from("companies")
      .update({ logo_url: logoUrl, updated_at: new Date().toISOString() })
      .eq("id", profile.company_id)
      .select()
      .single();

    if (updateError) {
      console.error("Company update error:", updateError);
      return NextResponse.json({ error: "Failed to save logo URL" }, { status: 500 });
    }

    return NextResponse.json({
      company: {
        id: updated.id,
        name: updated.name,
        industry: updated.industry || "",
        size: updated.size || "",
        logoUrl: updated.logo_url || undefined,
        createdAt: updated.created_at,
      },
    });
  } catch (err) {
    console.error("POST /api/company/logo error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/company/logo
 * Clear the company logo (revert to initials).
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
    const { data: profile } = await admin
      .from("users")
      .select("company_id")
      .eq("id", user.id)
      .single();

    if (!profile?.company_id) {
      return NextResponse.json({ error: "No company found" }, { status: 404 });
    }

    // Best-effort: remove all files under the company's folder. If storage
    // list/remove fails we still clear the DB pointer — stale files in the
    // bucket are harmless since they're no longer referenced.
    try {
      const { data: files } = await admin.storage
        .from("company-logos")
        .list(profile.company_id);
      if (files && files.length > 0) {
        const paths = files.map((f) => `${profile.company_id}/${f.name}`);
        await admin.storage.from("company-logos").remove(paths);
      }
    } catch (e) {
      console.error("Logo cleanup error (non-fatal):", e);
    }

    const { data: updated, error } = await admin
      .from("companies")
      .update({ logo_url: null, updated_at: new Date().toISOString() })
      .eq("id", profile.company_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to clear logo" }, { status: 500 });
    }

    return NextResponse.json({
      company: {
        id: updated.id,
        name: updated.name,
        industry: updated.industry || "",
        size: updated.size || "",
        logoUrl: undefined,
        createdAt: updated.created_at,
      },
    });
  } catch (err) {
    console.error("DELETE /api/company/logo error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
