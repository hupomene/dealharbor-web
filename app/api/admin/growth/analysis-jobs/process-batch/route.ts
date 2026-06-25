import { NextResponse } from "next/server";
import {
  resetStaleAnalysisJobs,
  runNextAnalysisJob,
  sleep,
} from "@/lib/growth/analysis-job-runner";
import { getSupabaseAdminClient } from "@/lib/growth/growth-db";

type ProcessBatchBody = {
  limit?: number;
};

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

export async function POST(request: Request) {
  try {
    let body: ProcessBatchBody = {};

    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const requestedLimit = Number(body.limit ?? 5);
    const limit = Math.max(
      1,
      Math.min(Number.isFinite(requestedLimit) ? requestedLimit : 5, 5)
    );

    const origin = new URL(request.url).origin;

    await resetStaleAnalysisJobs();

    let processed = 0;
    let completed = 0;
    let failed = 0;
    let requeued = 0;

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
      processed,
      completed,
      failed,
      requeued,
      limit,
      results,
      jobs,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to process analysis batch";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}