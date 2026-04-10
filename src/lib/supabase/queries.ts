import { createAdminClient } from "./server";
import {
  company as mockCompany,
  contributors as mockContributors,
  tasks as mockTasks,
  interviews as mockInterviews,
  roadmap as mockRoadmap,
  getDepartments as getMockDepartments,
  getStats as getMockStats,
} from "@/lib/mock-data";
import type { UserProfile } from "@/lib/types";

/**
 * Data access layer with Supabase-first, mock-data fallback.
 * When real data exists, it's returned. When empty, mock data fills the gap.
 */

/**
 * Fetch the authenticated user's profile row from the `users` table.
 * Returns null if not found. Uses the admin client so RLS doesn't block it
 * from server routes.
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (!userId) return null;
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("users")
      .select("id, email, full_name, job_title, avatar_url, role")
      .eq("id", userId)
      .single();
    if (!data) return null;
    return {
      id: data.id,
      email: data.email || "",
      fullName: data.full_name || "",
      jobTitle: data.job_title || "",
      avatarUrl: data.avatar_url || undefined,
      role: data.role || "admin",
    };
  } catch {
    return null;
  }
}

export async function getCompany(companyId?: string) {
  if (!companyId) return mockCompany;

  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("companies")
      .select("*")
      .eq("id", companyId)
      .single();

    if (!data) return mockCompany;
    return {
      id: data.id,
      name: data.name,
      industry: data.industry || "",
      size: data.size || "",
      logoUrl: data.logo_url || undefined,
      createdAt: data.created_at,
    };
  } catch {
    return mockCompany;
  }
}

export async function getContributors(companyId?: string) {
  if (!companyId) return mockContributors;

  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("contributors")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });

    if (data && data.length > 0) {
      // Map DB rows to the shape the UI expects
      return data.map((c) => ({
        id: c.id,
        name: c.name,
        role: c.role || "",
        department: c.department || "",
        avatar: "",
        aiComfort: (c.ai_comfort || "none") as "none" | "beginner" | "intermediate" | "advanced",
        interviewedAt: c.interviewed_at || undefined,
      }));
    }
    return mockContributors;
  } catch {
    return mockContributors;
  }
}

export async function getWorkflows(companyId?: string) {
  if (!companyId) return mockTasks;

  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("workflows")
      .select(`
        *,
        workflow_contributors ( contributor_id ),
        recommendations ( * )
      `)
      .eq("company_id", companyId)
      .order("updated_at", { ascending: false });

    if (data && data.length > 0) {
      return data.map((w) => ({
        id: w.short_id || w.id,
        dbId: w.id, // full UUID for roadmap matching
        title: w.title,
        description: w.description || "",
        department: w.department || "",
        contributors: (w.workflow_contributors || []).map((wc: { contributor_id: string }) => wc.contributor_id),
        frequency: w.frequency || "",
        timeSpent: w.time_spent || "",
        tools: w.tools || [],
        inputs: w.inputs || [],
        steps: w.steps || [],
        outputs: w.outputs || [],
        painPoints: w.pain_points || [],
        isBottleneck: w.is_bottleneck || false,
        tags: w.tags || [],
        lastUpdated: w.updated_at || w.created_at,
        addedBy: w.added_by || "",
        knowledge: w.knowledge || [],
        recommendation: (() => {
          // Supabase returns as object (1-to-1) or array (1-to-many)
          const rec = Array.isArray(w.recommendations)
            ? w.recommendations[0]
            : w.recommendations;
          if (!rec) return undefined;
          return {
            summary: rec.summary,
            impact: rec.impact,
            priority: rec.priority,
            difficulty: rec.difficulty,
            newSteps: rec.new_steps || [],
            aiHandles: rec.ai_handles || [],
            humanDecides: rec.human_decides || [],
            phase: rec.phase,
            implementation: rec.implementation,
          };
        })(),
      }));
    }
    return mockTasks;
  } catch {
    return mockTasks;
  }
}

export async function getInterviews(companyId?: string) {
  if (!companyId) return mockInterviews;

  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("interviews")
      .select(`
        *,
        contributors ( id, name, role, department, ai_comfort ),
        interview_tokens ( token )
      `)
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });

    if (data && data.length > 0) {
      return data.map((iv) => ({
        id: iv.id,
        contributorId: iv.contributor_id || "",
        status: iv.status as "completed" | "in-progress" | "invited",
        duration: iv.duration || "",
        completedAt: iv.completed_at || undefined,
        invitedAt: iv.created_at,
        workflowsExtracted: iv.workflows_extracted || 0,
        transcript: iv.transcript || [],
        person: iv.contributors
          ? {
              id: iv.contributors.id,
              name: iv.contributors.name,
              role: iv.contributors.role || "",
              department: iv.contributors.department || "",
              avatar: "",
              aiComfort: iv.contributors.ai_comfort || "none",
            }
          : undefined,
      }));
    }
    return mockInterviews;
  } catch {
    return mockInterviews;
  }
}

export async function getRoadmap(companyId?: string) {
  if (!companyId) return mockRoadmap;

  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("roadmap_phases")
      .select("*")
      .eq("company_id", companyId)
      .order("phase", { ascending: true });

    if (data && data.length > 0) {
      return data.map((r) => ({
        phase: r.phase as 1 | 2 | 3 | 4,
        name: r.name,
        duration: r.duration || "",
        description: r.description || "",
        taskIds: (r.workflow_ids || []).map(String),
        milestones: r.milestones || [],
      }));
    }
    return mockRoadmap;
  } catch {
    return mockRoadmap;
  }
}

export async function getAssessment(companyId?: string) {
  if (!companyId) return null;

  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("assessments")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    return data;
  } catch {
    return null;
  }
}

/**
 * Return the distinct set of department names for a company, drawn from
 * both the contributors and workflows tables. Used to power the dynamic
 * department picker shown to interviewees so misspellings and casing
 * mismatches don't fragment the org.
 *
 * Returns canonical casing (first non-empty value seen wins on conflict).
 */
export async function getDistinctDepartments(companyId: string): Promise<string[]> {
  if (!companyId) return [];
  try {
    const supabase = createAdminClient();
    const [contribs, workflows] = await Promise.all([
      supabase.from("contributors").select("department").eq("company_id", companyId),
      supabase.from("workflows").select("department").eq("company_id", companyId),
    ]);

    // Map of lowercased key → first canonical-cased value seen
    const seen = new Map<string, string>();
    const ingest = (rows: { department: string | null }[] | null) => {
      for (const row of rows || []) {
        const dept = (row.department || "").trim();
        if (!dept) continue;
        const key = dept.toLowerCase();
        if (!seen.has(key)) seen.set(key, dept);
      }
    };
    ingest(contribs.data);
    ingest(workflows.data);

    return Array.from(seen.values()).sort((a, b) => a.localeCompare(b));
  } catch {
    return [];
  }
}

/**
 * Get the authenticated user's company ID.
 * Returns null if not authenticated.
 */
export async function getUserCompanyId(): Promise<string | null> {
  try {
    const { createClient } = await import("./server");
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile } = await supabase
      .from("users")
      .select("company_id")
      .eq("id", user.id)
      .single();

    return profile?.company_id || null;
  } catch {
    return null;
  }
}

// Re-export mock helpers as fallbacks
export { getMockDepartments, getMockStats };
