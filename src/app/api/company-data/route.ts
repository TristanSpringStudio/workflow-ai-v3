import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import {
  getCompany,
  getContributors,
  getWorkflows,
  getInterviews,
  getRoadmap,
  getAssessment,
} from "@/lib/supabase/queries";

/**
 * GET /api/company-data
 * Returns all data for the authenticated user's company.
 * Falls back to mock data if not authenticated or no real data exists.
 */
export async function GET() {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let companyId: string | null = null;

    if (user) {
      // Use admin client to bypass RLS for the user profile lookup
      const admin = createAdminClient();
      const { data: profile } = await admin
        .from("users")
        .select("company_id")
        .eq("id", user.id)
        .single();

      companyId = profile?.company_id || null;
    }

    const [company, contributors, workflows, interviews, roadmap, assessment] =
      await Promise.all([
        getCompany(companyId || undefined),
        getContributors(companyId || undefined),
        getWorkflows(companyId || undefined),
        getInterviews(companyId || undefined),
        getRoadmap(companyId || undefined),
        getAssessment(companyId || undefined),
      ]);

    return NextResponse.json({
      company,
      contributors,
      workflows,
      interviews,
      roadmap,
      assessment,
      companyId,
      isRealData: !!companyId,
    });
  } catch (error) {
    console.error("Company data error:", error);
    // Return mock data on any error
    const {
      company,
      contributors,
      tasks: workflows,
      interviews,
      roadmap,
    } = await import("@/lib/mock-data");

    return NextResponse.json({
      company,
      contributors,
      workflows,
      interviews,
      roadmap,
      assessment: null,
      companyId: null,
      isRealData: false,
    });
  }
}
