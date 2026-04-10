import { createAdminClient } from "./server";
import { normalizeDepartment } from "@/lib/normalize-department";
import { getDistinctDepartments } from "@/lib/supabase/queries";

/**
 * Look up an interview token and return associated data.
 * Used when someone opens /interview/[token].
 * Uses admin client since contributors aren't authenticated.
 */
export async function lookupToken(token: string) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("interview_tokens")
    .select(`
      id,
      token,
      status,
      company_id,
      contributor_id,
      companies ( id, name, logo_url ),
      contributors ( id, name, email, role, department )
    `)
    .eq("token", token)
    .single();

  if (error || !data) return null;
  return data;
}

/**
 * Create or update an interview record as the conversation progresses.
 */
export async function upsertInterview(params: {
  tokenId: string;
  companyId: string;
  contributorId?: string;
  transcript: { role: string; content: string }[];
  extractedData?: Record<string, unknown>;
  status?: "in_progress" | "completed";
}) {
  const supabase = createAdminClient();

  // Check if interview already exists for this token
  const { data: existing } = await supabase
    .from("interviews")
    .select("id")
    .eq("token_id", params.tokenId)
    .single();

  if (existing) {
    // Update existing
    const updateData: Record<string, unknown> = {
      transcript: params.transcript,
    };
    if (params.extractedData) updateData.extracted_data = params.extractedData;
    if (params.contributorId) updateData.contributor_id = params.contributorId;
    if (params.status) {
      updateData.status = params.status;
      if (params.status === "completed") updateData.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("interviews")
      .update(updateData)
      .eq("id", existing.id)
      .select()
      .single();

    return { data, error };
  } else {
    // Create new
    const { data, error } = await supabase
      .from("interviews")
      .insert({
        token_id: params.tokenId,
        company_id: params.companyId,
        contributor_id: params.contributorId || null,
        transcript: params.transcript,
        extracted_data: params.extractedData || null,
        status: params.status || "in_progress",
      })
      .select()
      .single();

    // Also update the token status
    await supabase
      .from("interview_tokens")
      .update({
        status: "in_progress",
        started_at: new Date().toISOString(),
      })
      .eq("id", params.tokenId);

    return { data, error };
  }
}

/**
 * Complete an interview: update status, create/update contributor, mark token done.
 */
export async function completeInterview(params: {
  tokenId: string;
  companyId: string;
  transcript: { role: string; content: string }[];
  extractedData: {
    name?: string | null;
    role?: string | null;
    department?: string | null;
    tools: string[];
    workflows: { title: string; frequency?: string | null; timeSpent?: string | null }[];
    painPoints: string[];
    handoffs: { direction: string; department: string; what: string }[];
    aiComfort?: string | null;
  };
}) {
  const supabase = createAdminClient();

  // Normalize the department against the company's existing departments so
  // "marketing" / "Marketing" / "MARKETING" all collapse to one canonical name.
  const existingDepts = await getDistinctDepartments(params.companyId);
  const normalizedDepartment = normalizeDepartment(
    params.extractedData.department,
    existingDepts
  );

  // 1. Create or update the contributor
  let contributorId: string | null = null;

  // Check if there's already a contributor linked via the token
  const { data: tokenData } = await supabase
    .from("interview_tokens")
    .select("contributor_id")
    .eq("id", params.tokenId)
    .single();

  if (tokenData?.contributor_id) {
    // Update existing contributor with interview data
    contributorId = tokenData.contributor_id;
    await supabase
      .from("contributors")
      .update({
        name: params.extractedData.name || undefined,
        role: params.extractedData.role || undefined,
        department: normalizedDepartment || undefined,
        ai_comfort: params.extractedData.aiComfort || undefined,
        interviewed_at: new Date().toISOString(),
      })
      .eq("id", contributorId);
  } else if (params.extractedData.name) {
    // Create a new contributor
    const { data: newContrib } = await supabase
      .from("contributors")
      .insert({
        company_id: params.companyId,
        name: params.extractedData.name,
        role: params.extractedData.role || null,
        department: normalizedDepartment || null,
        ai_comfort: params.extractedData.aiComfort || null,
        interviewed_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    contributorId = newContrib?.id || null;

    // Link contributor to token
    if (contributorId) {
      await supabase
        .from("interview_tokens")
        .update({ contributor_id: contributorId })
        .eq("id", params.tokenId);
    }
  }

  // 2. Update the interview record
  await upsertInterview({
    tokenId: params.tokenId,
    companyId: params.companyId,
    contributorId: contributorId || undefined,
    transcript: params.transcript,
    extractedData: params.extractedData as Record<string, unknown>,
    status: "completed",
  });

  // 3. Mark token as completed
  await supabase
    .from("interview_tokens")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("id", params.tokenId);

  return { contributorId };
}
