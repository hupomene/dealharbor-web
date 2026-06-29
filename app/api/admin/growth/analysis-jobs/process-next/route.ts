import { NextResponse } from "next/server";
import {
  resetStaleAnalysisJobs,
  runNextAnalysisJob,
} from "@/lib/growth/analysis-job-runner";
import { requireGrowthAdmin } from "@/lib/growth/growth-auth";

export async function POST(request: Request) {
  const auth = await requireGrowthAdmin(request);

  if (!auth.ok) {
    return auth.response;
  }

  try {
    const origin = new URL(request.url).origin;

    await resetStaleAnalysisJobs();

    const result = await runNextAnalysisJob({
      origin,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to process analysis job";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}