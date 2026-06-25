import { createClient } from "@supabase/supabase-js";
import type {
  GrowthAnalysisJobDashboardRow,
  GrowthDashboardSummary,
  GrowthLeadDashboardRow,
  GrowthOutreachStatus,
  GrowthSearchRunDashboardRow,
} from "@/types/growth";

export function getSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  }

  if (!serviceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function getGrowthLeadsDashboard(): Promise<
  GrowthLeadDashboardRow[]
> {
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
    .from("growth_leads_dashboard")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("Failed to load growth leads dashboard:", error);
    throw new Error(error.message);
  }

  return (data ?? []) as GrowthLeadDashboardRow[];
}

export async function getGrowthSearchRunsDashboard(): Promise<
  GrowthSearchRunDashboardRow[]
> {
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
    .from("growth_search_runs")
    .select(
      `
      id,
      campaign_id,
      keyword,
      location,
      category_filter,
      search_provider,
      search_query,
      max_results,
      status,
      started_at,
      completed_at,
      total_found,
      total_saved,
      total_duplicates,
      total_errors,
      error_message,
      raw_response,
      created_at,
      updated_at
      `
    )
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("Failed to load growth search runs:", error);
    throw new Error(error.message);
  }

  return (data ?? []) as GrowthSearchRunDashboardRow[];
}

export function calculateGrowthDashboardSummary(
  rows: GrowthLeadDashboardRow[]
): GrowthDashboardSummary {
  return {
    total: rows.length,
    gradeA: rows.filter((row) => row.fit_grade === "A").length,
    gradeB: rows.filter((row) => row.fit_grade === "B").length,
    gradeC: rows.filter((row) => row.fit_grade === "C").length,
    gradeD: rows.filter((row) => row.fit_grade === "D").length,

    notContacted: rows.filter(
      (row) => row.outreach_status === "not_contacted"
    ).length,

    messageDrafted: rows.filter((row) =>
      ["message_drafted", "email_drafted", "linkedin_drafted"].includes(
        row.outreach_status
      )
    ).length,

    contacted: rows.filter((row) =>
      [
        "contacted_via_email",
        "contacted_via_linkedin",
        "contacted_via_contact_form",
      ].includes(row.outreach_status)
    ).length,

    replied: rows.filter((row) => row.outreach_status === "replied").length,

    demoRequested: rows.filter(
      (row) => row.outreach_status === "demo_requested"
    ).length,

    followUpNeeded: rows.filter(
      (row) => row.outreach_status === "follow_up_needed"
    ).length,

    doNotContact: rows.filter(
      (row) => row.outreach_status === "do_not_contact"
    ).length,
  };
}

export async function updateGrowthLeadStatus(params: {
  leadId: string;
  status: GrowthOutreachStatus;
}) {
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
    .from("growth_leads")
    .update({
      outreach_status: params.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.leadId)
    .select()
    .single();

  if (error) {
    console.error("Failed to update growth lead status:", error);
    throw new Error(error.message);
  }

  return data;
}

export async function getGrowthAnalysisJobsDashboard(): Promise<
  GrowthAnalysisJobDashboardRow[]
> {
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
    .from("growth_analysis_jobs")
    .select(
      `
      id,
      lead_id,
      campaign_id,
      search_run_id,
      job_type,
      status,
      priority,
      attempt_count,
      max_attempts,
      locked_at,
      started_at,
      completed_at,
      error_message,
      result,
      created_at,
      updated_at
      `
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Failed to load growth analysis jobs:", error.message);
    return [];
  }

  return (data ?? []) as GrowthAnalysisJobDashboardRow[];
}