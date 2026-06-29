"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import GrowthDashboardClient from "@/components/admin/growth/GrowthDashboardClient";
import type {
  GrowthAnalysisJobDashboardRow,
  GrowthDashboardSummary,
  GrowthLeadDashboardRow,
  GrowthSearchRunDashboardRow,
} from "@/types/growth";

type GrowthDashboardPayload = {
  rows: GrowthLeadDashboardRow[];
  summary: GrowthDashboardSummary;
  searchRuns: GrowthSearchRunDashboardRow[];
  analysisJobs: GrowthAnalysisJobDashboardRow[];
};

function getBrowserSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_KEY;

  if (!supabaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  }

  if (!supabaseAnonKey) {
    throw new Error(
      "Missing browser Supabase key. Add NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

async function getGrowthAdminAuthHeaders(): Promise<Record<string, string>> {
  const supabase = getBrowserSupabaseClient();

  const { data } = await supabase.auth.getSession();

  let token = data.session?.access_token;

  if (!token) {
    const refreshed = await supabase.auth.refreshSession();
    token = refreshed.data.session?.access_token;
  }

  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

async function loadGrowthDashboard() {
  const authHeaders = await getGrowthAdminAuthHeaders();

  const response = await fetch("/api/admin/growth/dashboard", {
    method: "GET",
    credentials: "include",
    headers: authHeaders,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error ?? "Failed to load Growth dashboard.");
  }

  return {
    rows: result.rows ?? [],
    summary: result.summary,
    searchRuns: result.searchRuns ?? [],
    analysisJobs: result.analysisJobs ?? [],
  } as GrowthDashboardPayload;
}

export default function GrowthDashboardPageLoader() {
  const [payload, setPayload] = useState<GrowthDashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function refreshDashboard() {
    setLoading(true);
    setErrorMessage(null);

    try {
      const result = await loadGrowthDashboard();
      setPayload(result);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to load Growth dashboard.";

      setErrorMessage(message);
      setPayload(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refreshDashboard();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-8">
        <div className="mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-medium text-slate-700">
            Loading Growth Admin...
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Verifying your admin session and loading dashboard data.
          </p>
        </div>
      </main>
    );
  }

  if (errorMessage || !payload) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-white p-8 shadow-sm">
          <p className="text-base font-semibold text-red-700">
            Growth Admin access failed
          </p>

          <p className="mt-3 text-sm text-slate-700">
            {errorMessage ??
              "Unable to load Growth Admin. Please log in again."}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href="/login"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Go to Login
            </a>

            <button
              type="button"
              onClick={refreshDashboard}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Retry
            </button>
          </div>

          <div className="mt-5 rounded-lg bg-slate-50 px-4 py-3 text-xs text-slate-600">
            Make sure your logged-in Supabase user ID exists in{" "}
            <code className="font-mono">growth_admin_users</code>.
          </div>
        </div>
      </main>
    );
  }

  return (
    <GrowthDashboardClient
      initialRows={payload.rows}
      initialSearchRuns={payload.searchRuns}
      initialAnalysisJobs={payload.analysisJobs}
      summary={payload.summary}
    />
  );
}