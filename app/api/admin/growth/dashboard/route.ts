import { NextResponse } from "next/server";
import { requireGrowthAdmin } from "@/lib/growth/growth-auth";
import {
  calculateGrowthDashboardSummary,
  getGrowthAnalysisJobsDashboard,
  getGrowthLeadsDashboard,
  getGrowthSearchRunsDashboard,
} from "@/lib/growth/growth-db";

export async function GET(request: Request) {
  const auth = await requireGrowthAdmin(request);

  if (!auth.ok) {
    return auth.response;
  }

  try {
    const [rows, searchRuns, analysisJobs] = await Promise.all([
      getGrowthLeadsDashboard(),
      getGrowthSearchRunsDashboard(),
      getGrowthAnalysisJobsDashboard(),
    ]);

    const summary = calculateGrowthDashboardSummary(rows);

    return NextResponse.json({
      success: true,
      rows,
      summary,
      searchRuns,
      analysisJobs,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to load Growth dashboard.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}