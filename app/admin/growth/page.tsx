import Link from "next/link";
import GrowthDashboardClient from "@/components/admin/growth/GrowthDashboardClient";
import {
  calculateGrowthDashboardSummary,
  getGrowthAnalysisJobsDashboard,
  getGrowthLeadsDashboard,
  getGrowthSearchRunsDashboard,
} from "@/lib/growth/growth-db";;

export const dynamic = "force-dynamic";

export default async function GrowthAdminPage() {
  const rows = await getGrowthLeadsDashboard();
  const searchRuns = await getGrowthSearchRunsDashboard();
  const analysisJobs = await getGrowthAnalysisJobsDashboard();
  const summary = calculateGrowthDashboardSummary(rows);

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-blue-700">
              PactAnchor Admin
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
              Growth Agent
            </h1>

            <p className="mt-2 max-w-3xl text-sm text-slate-600">
              Prospecting and outreach CRM for business brokers, M&A advisors,
              attorneys, CPAs, SBA lenders, escrow providers, and business
              associations.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/admin"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Admin Home
            </Link>
          </div>
        </div>

        <GrowthDashboardClient
          initialRows={rows}
          initialSearchRuns={searchRuns}
          summary={summary}
        />
      </div>
    </main>
  );
}