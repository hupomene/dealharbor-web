import { getSupabaseAdminClient } from "@/lib/growth/growth-db";

type AnalysisJobRow = {
  id: string;
  lead_id: string;
  attempt_count: number;
  max_attempts: number;
};

export type RunNextAnalysisJobResult =
  | {
      success: true;
      noJob: true;
      message: string;
    }
  | {
      success: true;
      noJob: false;
      jobId: string;
      leadId: string;
      status: "completed";
      result: Record<string, unknown>;
    }
  | {
      success: false;
      noJob: false;
      jobId: string;
      leadId: string;
      status: "queued" | "failed";
      retryScheduled: boolean;
      error: string;
    };

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function resetStaleAnalysisJobs(staleMinutes = 15) {
  const supabase = getSupabaseAdminClient();

  const cutoff = new Date(
    Date.now() - staleMinutes * 60 * 1000
  ).toISOString();

  const { error } = await supabase
    .from("growth_analysis_jobs")
    .update({
      status: "queued",
      locked_at: null,
      error_message:
        "Job was reset because it stayed running longer than the stale threshold.",
      updated_at: new Date().toISOString(),
    })
    .eq("status", "running")
    .lt("locked_at", cutoff);

  if (error) {
    console.error("Failed to reset stale analysis jobs:", error.message);
  }
}

export async function runNextAnalysisJob(params: {
  origin: string;
}): Promise<RunNextAnalysisJobResult> {
  const supabase = getSupabaseAdminClient();

  const { data: job, error: jobError } = await supabase
    .from("growth_analysis_jobs")
    .select("id, lead_id, attempt_count, max_attempts")
    .eq("status", "queued")
    .order("priority", { ascending: true })
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (jobError) {
    throw new Error(jobError.message);
  }

  if (!job) {
    return {
      success: true,
      noJob: true,
      message: "No queued analysis jobs.",
    };
  }

  const currentJob = job as AnalysisJobRow;
  const nextAttemptCount = currentJob.attempt_count + 1;
  const now = new Date().toISOString();

  const { data: lockedJob, error: lockError } = await supabase
    .from("growth_analysis_jobs")
    .update({
      status: "running",
      attempt_count: nextAttemptCount,
      locked_at: now,
      started_at: now,
      error_message: null,
      updated_at: now,
    })
    .eq("id", currentJob.id)
    .eq("status", "queued")
    .select("id, lead_id, attempt_count, max_attempts")
    .maybeSingle();

  if (lockError) {
    throw new Error(lockError.message);
  }

  if (!lockedJob) {
    return {
      success: true,
      noJob: true,
      message: "Queued job was already locked by another processor.",
    };
  }

  try {
    const analyzeResponse = await fetch(
      `${params.origin}/api/admin/growth/leads/${currentJob.lead_id}/analyze`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const analyzeResult = await analyzeResponse.json().catch(() => ({}));

    if (!analyzeResponse.ok) {
      throw new Error(
        analyzeResult.error ??
          `Analyze API failed with status ${analyzeResponse.status}`
      );
    }

    await supabase
      .from("growth_analysis_jobs")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        result: analyzeResult,
        error_message: null,
        locked_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", currentJob.id);

    return {
      success: true,
      noJob: false,
      jobId: currentJob.id,
      leadId: currentJob.lead_id,
      status: "completed",
      result: analyzeResult,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Analysis job failed";

    const shouldRetry = nextAttemptCount < currentJob.max_attempts;

    await supabase
      .from("growth_analysis_jobs")
      .update({
        status: shouldRetry ? "queued" : "failed",
        completed_at: shouldRetry ? null : new Date().toISOString(),
        error_message: message,
        locked_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", currentJob.id);

    return {
      success: false,
      noJob: false,
      jobId: currentJob.id,
      leadId: currentJob.lead_id,
      status: shouldRetry ? "queued" : "failed",
      retryScheduled: shouldRetry,
      error: message,
    };
  }
}