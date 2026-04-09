import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * POST /api/auth/signup
 * Create user, company, and profile in one transaction.
 * Uses admin client to bypass RLS.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, fullName, companyName, industry, companySize } = body;

    if (!email || !password || !fullName || !companyName) {
      return NextResponse.json(
        { error: "Email, password, full name, and company name are required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // 1. Create auth user (admin client auto-confirms the email)
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Skip email confirmation for now
        user_metadata: { full_name: fullName },
      });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }
    if (!authData.user) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
    }

    // 2. Create company
    const { data: companyData, error: companyError } = await supabase
      .from("companies")
      .insert({ name: companyName, industry: industry || null, size: companySize || null })
      .select()
      .single();

    if (companyError) {
      // Cleanup: delete the auth user if company creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ error: companyError.message }, { status: 500 });
    }

    // 3. Create user profile
    const { error: profileError } = await supabase
      .from("users")
      .insert({
        id: authData.user.id,
        company_id: companyData.id,
        email,
        full_name: fullName,
        role: "admin",
      });

    if (profileError) {
      // Cleanup
      await supabase.auth.admin.deleteUser(authData.user.id);
      await supabase.from("companies").delete().eq("id", companyData.id);
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      userId: authData.user.id,
      companyId: companyData.id,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}
