import { NextResponse } from "next/server";
import {
  resetStaleAnalysisJobs,
  runNextAnalysisJob,
  sleep,
} from "@/lib/growth/analysis-job-runner";
import { getSupabaseAdminClient } from "@/lib/growth/growth-db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function getRecentJobs() {
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
    console.error("Failed to reload analysis jobs:", error.message);
    return [];
  }

  return data ?? [];
}

function isAuthorizedCronRequest(request: Request) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return false;
  }

  const authHeader = request.headers.get("authorization");

  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json(
      {
        error: "Unauthorized cron request",
      },
      { status: 401 }
    );
  }

  try {
    const origin = new URL(request.url).origin;

    await resetStaleAnalysisJobs();

    let processed = 0;
    let completed = 0;
    let failed = 0;
    let requeued = 0;

    const limit = 5;
    const results: unknown[] = [];

    for (let index = 0; index < limit; index += 1) {
      const result = await runNextAnalysisJob({
        origin,
      });

      if (result.noJob) {
        break;
      }

      processed += 1;
      results.push(result);

      if (result.success && result.status === "completed") {
        completed += 1;
      }

      if (!result.success && result.status === "failed") {
        failed += 1;
      }

      if (!result.success && result.status === "queued") {
        requeued += 1;
      }

      if (index < limit - 1) {
        await sleep(700);
      }
    }

    const jobs = await getRecentJobs();

    return NextResponse.json({
      success: true,
      source: "growth_analysis_cron",
      processed,
      completed,
      failed,
      requeued,
      limit,
      results,
      jobs,
      ranAt: new Date().toISOString(),
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to run growth analysis cron";

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}