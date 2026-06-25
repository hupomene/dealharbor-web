import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/growth/growth-db";

type QueueRequestBody = {
  leadIds?: string[];
};

export async function GET() {
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    jobs: data ?? [],
  });
}

export async function POST(request: Request) {
  const supabase = getSupabaseAdminClient();

  let body: QueueRequestBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const leadIds = Array.isArray(body.leadIds)
    ? body.leadIds.filter((leadId) => typeof leadId === "string" && leadId)
    : [];

  if (leadIds.length === 0) {
    return NextResponse.json(
      { error: "No lead ids provided" },
      { status: 400 }
    );
  }

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const leadId of leadIds) {
    const { data: existingJobs, error: existingError } = await supabase
      .from("growth_analysis_jobs")
      .select("id")
      .eq("lead_id", leadId)
      .in("status", ["queued", "running"])
      .limit(1);

    if (existingError) {
      errors += 1;
      continue;
    }

    if (existingJobs && existingJobs.length > 0) {
      skipped += 1;
      continue;
    }

    const { data: lead, error: leadError } = await supabase
      .from("growth_leads")
      .select("id, campaign_id, search_run_id, fit_grade, priority")
      .eq("id", leadId)
      .single();

    if (leadError || !lead) {
      errors += 1;
      continue;
    }

    const priority =
      lead.fit_grade === "A"
        ? 10
        : lead.fit_grade === "B"
          ? 20
          : lead.fit_grade === "C"
            ? 50
            : 100;

    const { error: insertError } = await supabase
      .from("growth_analysis_jobs")
      .insert({
        lead_id: lead.id,
        campaign_id: lead.campaign_id,
        search_run_id: lead.search_run_id,
        job_type: "analyze_lead",
        status: "queued",
        priority,
        max_attempts: 2,
      });

    if (insertError) {
      errors += 1;
      continue;
    }

    created += 1;
  }

  const { data: jobs } = await supabase
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

  return NextResponse.json({
    success: true,
    created,
    skipped,
    errors,
    jobs: jobs ?? [],
  });
}