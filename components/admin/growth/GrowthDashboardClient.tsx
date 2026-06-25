"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type {
  GrowthAnalysisJobDashboardRow,
  GrowthDashboardSummary,
  GrowthLeadDashboardRow,
  GrowthOutreachStatus,
  GrowthSearchRunDashboardRow,
} from "@/types/growth";

type Props = {
  initialRows: GrowthLeadDashboardRow[];
  initialSearchRuns?: GrowthSearchRunDashboardRow[];
  initialAnalysisJobs?: GrowthAnalysisJobDashboardRow[];
  summary: GrowthDashboardSummary;
};

const STATUS_OPTIONS: GrowthOutreachStatus[] = [
  "not_contacted",
  "message_drafted",
  "linkedin_drafted",
  "email_drafted",
  "contacted_via_linkedin",
  "contacted_via_email",
  "contacted_via_contact_form",
  "replied",
  "demo_requested",
  "not_interested",
  "follow_up_needed",
  "do_not_contact",
  "disqualified",
];

function formatLabel(value: string | null) {
  if (!value) return "Unknown";

  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getGradeClass(grade: string | null) {
  switch (grade) {
    case "A":
      return "bg-green-100 text-green-800 border-green-200";
    case "B":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "C":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "D":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

function getSearchRunStatusClass(status: string) {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800 border-green-200";
    case "running":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "queued":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "failed":
      return "bg-red-100 text-red-800 border-red-200";
    case "cancelled":
      return "bg-slate-100 text-slate-700 border-slate-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

function formatDateTime(value: string | null) {
  if (!value) return "-";

  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
      <h2 className="text-lg font-semibold text-slate-900">
        No growth leads yet
      </h2>
      <p className="mt-2 text-sm text-slate-600">
        Once the prospecting agent runs, discovered brokers, advisors, attorneys,
        CPAs, SBA lenders, and associations will appear here.
      </p>
      <p className="mt-4 text-sm text-slate-500">
        Next step: connect the search API and lead generation workflow.
      </p>
    </div>
  );
}

function getBestEmail(row: GrowthLeadDashboardRow) {
  return row.contact_email ?? row.general_email;
}

function getBestLinkedIn(row: GrowthLeadDashboardRow) {
  return row.contact_linkedin_url ?? row.organization_linkedin_url;
}

function leadHasDraft(row: GrowthLeadDashboardRow) {
  return Boolean(
    row.latest_cold_email_body ||
      row.latest_linkedin_message_body ||
      row.latest_linkedin_followup_body ||
      row.latest_contact_form_body ||
      row.latest_partnership_message_body
  );
}

function leadIsAnalyzed(row: GrowthLeadDashboardRow) {
  const fitReason = (row.fit_reason ?? "").toLowerCase();
  const looksFastImportedOnly = fitReason.includes(
    "imported from search results"
  );

  return (
    leadHasDraft(row) ||
    row.outreach_status === "email_drafted" ||
    row.outreach_status === "linkedin_drafted" ||
    row.outreach_status === "message_drafted" ||
    !looksFastImportedOnly
  );
}

function leadMatchesSearch(row: GrowthLeadDashboardRow, searchTerm: string) {
  const value = searchTerm.trim().toLowerCase();

  if (!value) return true;

  const searchableText = [
    row.company_name,
    row.website_domain,
    row.website_url,
    row.city,
    row.state,
    row.category,
    row.contact_name,
    row.contact_title,
    row.contact_email,
    row.general_email,
    row.fit_reason,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return searchableText.includes(value);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getPendingAnalysisRows(rows: GrowthLeadDashboardRow[]) {
  return rows.filter((row) => {
    if (leadIsAnalyzed(row)) return false;

    if (
      row.outreach_status === "do_not_contact" ||
      row.outreach_status === "disqualified" ||
      row.category === "excluded"
    ) {
      return false;
    }

    return Boolean(row.website_url || row.website_domain);
  });
}

export default function GrowthDashboardClient({
  initialRows,
  initialSearchRuns,
  initialAnalysisJobs,
  summary,
}: Props) {

  const router = useRouter();

  const [rows, setRows] = useState<GrowthLeadDashboardRow[]>(initialRows);
  const [searchRuns, setSearchRuns] = useState<GrowthSearchRunDashboardRow[]>(
    initialSearchRuns ?? []
  );
  const [analysisJobs, setAnalysisJobs] = useState<
    GrowthAnalysisJobDashboardRow[]
  >(initialAnalysisJobs ?? []);

  useEffect(() => {
    setRows(initialRows);
  }, [initialRows]);

  useEffect(() => {
    setSearchRuns(initialSearchRuns ?? []);
  }, [initialSearchRuns]);

  useEffect(() => {
    setAnalysisJobs(initialAnalysisJobs ?? []);
  }, [initialAnalysisJobs]);

  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(
    initialRows[0]?.lead_id ?? null
  );
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [keyword, setKeyword] = useState("business broker");
  const [location, setLocation] = useState("Dallas, TX");
  const [category, setCategory] = useState("business_broker");
  const [maxResults, setMaxResults] = useState(50);
  const [isRunningSearch, setIsRunningSearch] = useState(false);
  const [searchMessage, setSearchMessage] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [analyzingLeadId, setAnalyzingLeadId] = useState<string | null>(null);
  const [analyzeMessage, setAnalyzeMessage] = useState<string | null>(null);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [leadSearch, setLeadSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [channelFilter, setChannelFilter] = useState("all");
  const [emailOnly, setEmailOnly] = useState(false);
  const [unanalyzedOnly, setUnanalyzedOnly] = useState(false);
  const [draftedOnly, setDraftedOnly] = useState(false);
  const [hideDisqualified, setHideDisqualified] = useState(true);
  const [isAnalyzingBatch, setIsAnalyzingBatch] = useState(false);
  const [batchAnalyzeMessage, setBatchAnalyzeMessage] = useState<string | null>(
    null
  );
  const [batchAnalyzeError, setBatchAnalyzeError] = useState<string | null>(
    null
  );

  const [isQueueingAnalysis, setIsQueueingAnalysis] = useState(false);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const [queueMessage, setQueueMessage] = useState<string | null>(null);
  const [queueError, setQueueError] = useState<string | null>(null);
    
  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (!leadMatchesSearch(row, leadSearch)) return false;

      if (gradeFilter !== "all" && row.fit_grade !== gradeFilter) {
        return false;
      }

      if (statusFilter !== "all" && row.outreach_status !== statusFilter) {
        return false;
      }

      if (categoryFilter !== "all" && row.category !== categoryFilter) {
        return false;
      }

      if (channelFilter !== "all" && row.suggested_channel !== channelFilter) {
        return false;
      }

      if (emailOnly && !getBestEmail(row)) {
        return false;
      }

      if (unanalyzedOnly && leadIsAnalyzed(row)) {
        return false;
      }

      if (draftedOnly && !leadHasDraft(row)) {
        return false;
      }

      if (
        hideDisqualified &&
        (row.outreach_status === "do_not_contact" ||
          row.outreach_status === "disqualified" ||
          row.category === "excluded")
      ) {
        return false;
      }

      return true;
    });
  }, [
    rows,
    leadSearch,
    gradeFilter,
    statusFilter,
    categoryFilter,
    channelFilter,
    emailOnly,
    unanalyzedOnly,
    draftedOnly,
    hideDisqualified,
  ]);

  const pendingAnalysisRows = useMemo(() => {
    return getPendingAnalysisRows(filteredRows);
  }, [filteredRows]);

  const queuedAnalysisJobCount = useMemo(() => {
    return analysisJobs.filter((job) => job.status === "queued").length;
  }, [analysisJobs]);

  const runningAnalysisJobCount = useMemo(() => {
    return analysisJobs.filter((job) => job.status === "running").length;
  }, [analysisJobs]);

  const failedAnalysisJobCount = useMemo(() => {
    return analysisJobs.filter((job) => job.status === "failed").length;
  }, [analysisJobs]);

  useEffect(() => {
    if (filteredRows.length === 0) {
      setSelectedLeadId(null);
      return;
    }

    if (!selectedLeadId) {
      setSelectedLeadId(filteredRows[0].lead_id);
      return;
    }

    const selectedLeadStillVisible = filteredRows.some(
      (row) => row.lead_id === selectedLeadId
    );

    if (!selectedLeadStillVisible) {
      setSelectedLeadId(filteredRows[0].lead_id);
    }
  }, [filteredRows, selectedLeadId]);

  const selectedLead = useMemo(() => {
    return filteredRows.find((row) => row.lead_id === selectedLeadId) ?? null;
  }, [filteredRows, selectedLeadId]);

  async function copyText(label: string, text: string | null) {
    if (!text) return;

    await navigator.clipboard.writeText(text);
    setCopiedLabel(label);

    window.setTimeout(() => {
      setCopiedLabel(null);
    }, 1500);
  }

  async function updateStatus(status: GrowthOutreachStatus) {
    if (!selectedLead) return;

    setUpdatingStatus(true);
    setStatusError(null);

    try {
      const response = await fetch(
        `/api/admin/growth/leads/${selectedLead.lead_id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Failed to update status");
      }

      setRows((currentRows) =>
        currentRows.map((row) =>
          row.lead_id === selectedLead.lead_id
            ? {
                ...row,
                outreach_status: status,
                updated_at: new Date().toISOString(),
                last_contacted_at:
                  status === "contacted_via_email" ||
                  status === "contacted_via_linkedin" ||
                  status === "contacted_via_contact_form"
                    ? new Date().toISOString()
                    : row.last_contacted_at,
              }
            : row
        )
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update status";
      setStatusError(message);
    } finally {
      setUpdatingStatus(false);
    }
  }

    async function runSearch(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setIsRunningSearch(true);
        setSearchMessage(null);
        setSearchError(null);

        try {
        const response = await fetch("/api/admin/growth/search-runs", {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify({
            keyword,
            location,
            category,
            maxResults,
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error ?? "Failed to create search run");
        }

            setSearchMessage(
             `Search run queued for "${keyword}"${location ? ` in ${location}` : ""}. Processing search results...`
            );

            const processResponse = await fetch(
             `/api/admin/growth/search-runs/${result.searchRun.id}/process`,
             {
                method: "POST",
             }
            );

            const processResult = await processResponse.json();

            if (!processResponse.ok) {
                throw new Error(processResult.error ?? "Failed to process search run");
            }

        setSearchMessage(
          `Fast import completed. Found ${processResult.totalFound}, saved ${processResult.saved}, duplicates ${processResult.duplicates}, skipped ${processResult.skipped}. Website analysis, AI scoring, and message drafts are pending.`
        );

        setSearchRuns((currentRuns) => [
          {
            id: result.searchRun.id,
            campaign_id: result.campaign.id,
            keyword,
            location: location || null,
            category_filter: category as GrowthSearchRunDashboardRow["category_filter"],
            search_provider: "serpapi",
            search_query: [keyword, location].filter(Boolean).join(" "),
            max_results: maxResults,
            status: "completed",
            started_at: null,
            completed_at: new Date().toISOString(),
            total_found: processResult.totalFound ?? 0,
            total_saved: processResult.saved ?? 0,
            total_duplicates: processResult.duplicates ?? 0,
            total_errors: processResult.errors ?? 0,
            error_message: null,
            raw_response: {
              mode: processResult.mode,
              analyzed: processResult.analyzed,
              ai_scored: processResult.aiScored,
              messages_generated: processResult.messagesGenerated,
              skipped: processResult.skipped,
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          ...currentRuns,
        ]);

        router.refresh();
        } catch (error) {
        const message =
            error instanceof Error ? error.message : "Failed to create search run";
        setSearchError(message);
        } finally {
        setIsRunningSearch(false);
        }
    }

    async function analyzeSelectedLead() {
      if (!selectedLead) return;

      setAnalyzingLeadId(selectedLead.lead_id);
      setAnalyzeMessage(null);
      setAnalyzeError(null);

      try {
        const response = await fetch(
          `/api/admin/growth/leads/${selectedLead.lead_id}/analyze`,
          {
            method: "POST",
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error ?? "Failed to analyze lead");
        }

        setAnalyzeMessage(
          `Analysis completed. Grade ${result.fitGrade}, score ${result.fitScore}, generated ${result.messagesGenerated} messages.`
        );

        router.refresh();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to analyze lead";
        setAnalyzeError(message);
      } finally {
        setAnalyzingLeadId(null);
      }
    }

    async function analyzeTopPendingLeads() {
      const targets = pendingAnalysisRows.slice(0, 3);

      if (targets.length === 0) {
        setBatchAnalyzeMessage(null);
        setBatchAnalyzeError("There are no pending leads to analyze in the current filtered list.");
        return;
      }

      setIsAnalyzingBatch(true);
      setBatchAnalyzeMessage(
        `Starting batch analysis for ${targets.length} pending lead${
          targets.length === 1 ? "" : "s"
        }...`
      );
      setBatchAnalyzeError(null);
      setAnalyzeMessage(null);
      setAnalyzeError(null);

      let completed = 0;
      let failed = 0;

      try {
        for (const [index, lead] of targets.entries()) {
          setBatchAnalyzeMessage(
            `Analyzing ${index + 1} of ${targets.length}: ${lead.company_name}`
          );

          const response = await fetch(
            `/api/admin/growth/leads/${lead.lead_id}/analyze`,
            {
              method: "POST",
            }
          );

          const result = await response.json();

          if (!response.ok) {
            failed += 1;
            console.error("Batch analyze failed", {
              leadId: lead.lead_id,
              companyName: lead.company_name,
              error: result.error,
            });
          } else {
            completed += 1;
          }

          if (index < targets.length - 1) {
            await sleep(1200);
          }
        }

        setBatchAnalyzeMessage(
          `Batch analysis completed. ${completed} completed, ${failed} failed. Filters were reset so you can review the updated leads.`
        );

        resetLeadFilters();
        router.refresh();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Batch analysis failed";
        setBatchAnalyzeError(message);
      } finally {
        setIsAnalyzingBatch(false);
      }
    }

    async function refreshAnalysisJobs() {
      const response = await fetch("/api/admin/growth/analysis-jobs");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Failed to refresh analysis jobs");
      }

      setAnalysisJobs(result.jobs ?? []);
    }

    async function queueTopPendingLeads() {
      const targets = pendingAnalysisRows.slice(0, 10);

      if (targets.length === 0) {
        setQueueMessage(null);
        setQueueError(
          "There are no pending leads to queue in the current filtered list."
        );
        return;
      }

      setIsQueueingAnalysis(true);
      setQueueMessage(null);
      setQueueError(null);

      try {
        const response = await fetch("/api/admin/growth/analysis-jobs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            leadIds: targets.map((lead) => lead.lead_id),
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error ?? "Failed to queue analysis jobs");
        }

        setAnalysisJobs(result.jobs ?? []);

        setQueueMessage(
          `Queued ${result.created} lead${
            result.created === 1 ? "" : "s"
          }. Skipped ${result.skipped}, errors ${result.errors}.`
        );

        router.refresh();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to queue analysis jobs";
        setQueueError(message);
      } finally {
        setIsQueueingAnalysis(false);
      }
    }

    async function processAnalysisQueue() {
      setIsProcessingQueue(true);
      setQueueMessage("Processing analysis queue on the server...");
      setQueueError(null);

      try {
        const response = await fetch(
          "/api/admin/growth/analysis-jobs/process-batch",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              limit: 5,
            }),
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error ?? "Failed to process analysis queue");
        }

        setAnalysisJobs(result.jobs ?? []);

        setQueueMessage(
          `Queue processing finished. Processed ${result.processed}, completed ${result.completed}, failed ${result.failed}, requeued ${result.requeued}. Filters were reset so you can review the updated leads.`
        );

        resetLeadFilters();
        await refreshAnalysisJobs();
        router.refresh();
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to process analysis queue";

        setQueueError(message);
      } finally {
        setIsProcessingQueue(false);
      }
    }

    function resetLeadFilters() {
      setLeadSearch("");
      setGradeFilter("all");
      setStatusFilter("all");
      setCategoryFilter("all");
      setChannelFilter("all");
      setEmailOnly(false);
      setUnanalyzedOnly(false);
      setDraftedOnly(false);
      setHideDisqualified(true);
    }

    return (
    <>
      <form
        onSubmit={runSearch}
        className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="mb-4">
          <h2 className="text-base font-semibold text-slate-900">
            Run Prospect Search
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Create a search run for brokers, advisors, attorneys, CPAs, SBA lenders,
            escrow providers, or associations. This will quickly import matching organizations from SerpAPI. Website analysis, AI scoring, and message drafts will be handled in a separate step.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_220px_140px]">
          <div>
            <label className="text-xs font-medium text-slate-600">
              Keyword
            </label>
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="business broker"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600">
              Location
            </label>
            <input
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Dallas, TX"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600">
              Category
            </label>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="business_broker">Business Broker</option>
              <option value="m_and_a_advisor">M&A Advisor</option>
              <option value="transaction_attorney">Transaction Attorney</option>
              <option value="cpa_tax_advisor">CPA / Tax Advisor</option>
              <option value="sba_lender">SBA Lender</option>
              <option value="escrow_closing_provider">Escrow / Closing Provider</option>
              <option value="business_broker_association">
                Business Broker Association
              </option>
              <option value="chamber_of_commerce">Chamber of Commerce</option>
              <option value="score_chapter">SCORE Chapter</option>
              <option value="sbdc">SBDC</option>
              <option value="entrepreneur_group">Entrepreneur Group</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600">
              Max Results
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={maxResults}
              onChange={(event) => setMaxResults(Number(event.target.value))}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            {searchMessage ? (
              <p className="text-sm text-green-700">{searchMessage}</p>
            ) : null}

            {searchError ? (
              <p className="text-sm text-red-600">{searchError}</p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={isRunningSearch || !keyword.trim()}
            className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isRunningSearch ? "Searching..." : "Run Search"}
          </button>
        </div>
      </form>

      <section className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Search Run History
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Recent prospecting searches, processing status, imported leads, and
                error tracking.
              </p>
            </div>

            <span className="text-xs text-slate-500">
              Showing latest {searchRuns.length} runs
            </span>
          </div>
        </div>

        {searchRuns.length === 0 ? (
          <div className="px-5 py-6 text-sm text-slate-500">
            No search runs yet. Use the form above to create the first run.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">
                    Created
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">
                    Keyword
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">
                    Location
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-slate-600">
                    Found
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-slate-600">
                    Saved
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-slate-600">
                    Duplicates
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-slate-600">
                    Errors
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">
                    Provider
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">
                {searchRuns.map((run) => (
                  <tr key={run.id} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                      {formatDateTime(run.created_at)}
                    </td>

                    <td className="max-w-xs px-4 py-4">
                      <div className="font-medium text-slate-900">
                        {run.keyword}
                      </div>

                      {run.search_query ? (
                        <div className="mt-1 truncate text-xs text-slate-500">
                          {run.search_query}
                        </div>
                      ) : null}

                      {run.error_message ? (
                        <div className="mt-2 rounded-lg bg-red-50 px-2 py-1 text-xs text-red-700">
                          {run.error_message}
                        </div>
                      ) : null}
                    </td>

                    <td className="px-4 py-4 text-slate-700">
                      {run.location || "-"}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getSearchRunStatusClass(
                          run.status
                        )}`}
                      >
                        {formatLabel(run.status)}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-right text-slate-700">
                      {run.total_found}
                    </td>

                    <td className="px-4 py-4 text-right text-slate-700">
                      {run.total_saved}
                    </td>

                    <td className="px-4 py-4 text-right text-slate-700">
                      {run.total_duplicates}
                    </td>

                    <td className="px-4 py-4 text-right text-slate-700">
                      {run.total_errors}
                    </td>

                    <td className="px-4 py-4 text-slate-700">
                      {run.search_provider}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <SummaryCard label="Total Leads" value={summary.total} />
        <SummaryCard label="A Grade" value={summary.gradeA} />
        <SummaryCard label="B Grade" value={summary.gradeB} />
        <SummaryCard label="Drafted" value={summary.messageDrafted} />
        <SummaryCard label="Follow-up" value={summary.followUpNeeded} />
        <SummaryCard label="Demo Requested" value={summary.demoRequested} />
      </div>

      {rows.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    Prospect Pipeline
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Click a lead to review fit reason, outreach drafts, and status.
                  </p>
                </div>

                <div className="flex flex-col items-start gap-2 md:items-end">
                  <div className="text-sm text-slate-500">
                    Showing{" "}
                    <span className="font-semibold text-slate-900">
                      {filteredRows.length}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-slate-900">{rows.length}</span>{" "}
                    leads
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                      {pendingAnalysisRows.length} pending analysis
                    </span>

                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                      Queue: {queuedAnalysisJobCount} queued / {runningAnalysisJobCount} running /{" "}
                      {failedAnalysisJobCount} failed
                    </span>

                    <button
                      type="button"
                      onClick={analyzeTopPendingLeads}
                      disabled={isAnalyzingBatch || pendingAnalysisRows.length === 0}
                      className="rounded-lg bg-blue-700 px-3 py-2 text-xs font-medium text-white shadow-sm hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isAnalyzingBatch ? "Analyzing Batch..." : "Analyze Top 3 Pending"}
                    </button>

                    <button
                      type="button"
                      onClick={queueTopPendingLeads}
                      disabled={isQueueingAnalysis || pendingAnalysisRows.length === 0}
                      className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-medium text-blue-700 shadow-sm hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isQueueingAnalysis ? "Queueing..." : "Queue Top 10"}
                    </button>

                    <button
                      type="button"
                      onClick={processAnalysisQueue}
                      disabled={isProcessingQueue || queuedAnalysisJobCount === 0}
                      className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isProcessingQueue ? "Processing..." : "Process Queue Batch"}
                    </button>
                  </div>
                </div>
              </div>

              {batchAnalyzeMessage ? (
                <p className="mt-3 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700">
                  {batchAnalyzeMessage}
                </p>
              ) : null}

              {batchAnalyzeError ? (
                <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                  {batchAnalyzeError}
                </p>
              ) : null}

              {queueMessage ? (
                <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-700">
                  {queueMessage}
                </p>
              ) : null}

              {queueError ? (
                <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                  {queueError}
                </p>
              ) : null}
            </div>

            <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_120px_180px_180px_160px]">
                <div>
                  <label className="text-xs font-medium text-slate-600">
                    Search Leads
                  </label>
                  <input
                    type="text"
                    value={leadSearch}
                    onChange={(event) => setLeadSearch(event.target.value)}
                    placeholder="Company, domain, email, city..."
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-600">Grade</label>
                  <select
                    value={gradeFilter}
                    onChange={(event) => setGradeFilter(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="all">All</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-600">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="all">All</option>
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {formatLabel(status)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-600">Category</label>
                  <select
                    value={categoryFilter}
                    onChange={(event) => setCategoryFilter(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="all">All</option>
                    <option value="business_broker">Business Broker</option>
                    <option value="m_and_a_advisor">M&A Advisor</option>
                    <option value="transaction_attorney">Transaction Attorney</option>
                    <option value="cpa_tax_advisor">CPA / Tax Advisor</option>
                    <option value="sba_lender">SBA Lender</option>
                    <option value="escrow_closing_provider">Escrow / Closing Provider</option>
                    <option value="business_broker_association">
                      Broker Association
                    </option>
                    <option value="chamber_of_commerce">Chamber of Commerce</option>
                    <option value="score_chapter">SCORE Chapter</option>
                    <option value="sbdc">SBDC</option>
                    <option value="entrepreneur_group">Entrepreneur Group</option>
                    <option value="other">Other</option>
                    <option value="excluded">Excluded</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-600">Channel</label>
                  <select
                    value={channelFilter}
                    onChange={(event) => setChannelFilter(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="all">All</option>
                    <option value="email">Email</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="contact_form">Contact Form</option>
                    <option value="manual_review">Manual Review</option>
                    <option value="do_not_contact">Do Not Contact</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={emailOnly}
                    onChange={(event) => setEmailOnly(event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  Email only
                </label>

                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={unanalyzedOnly}
                    onChange={(event) => setUnanalyzedOnly(event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  Unanalyzed only
                </label>

                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={draftedOnly}
                    onChange={(event) => setDraftedOnly(event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  Drafted only
                </label>

                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={hideDisqualified}
                    onChange={(event) => setHideDisqualified(event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  Hide disqualified / DNC
                </label>

                <button
                  type="button"
                  onClick={resetLeadFilters}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-white"
                >
                  Reset Filters
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">
                      Company
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">
                      Location
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">
                      Fit
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">
                      Channel
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">
                      Contact
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-500">
                        No leads match the current filters.
                      </td>
                    </tr>
                  ) : null}

                  {filteredRows.map((row) => {
                    const email = getBestEmail(row);
                    const isSelected = row.lead_id === selectedLeadId;

                    return (
                      <tr
                        key={row.lead_id}
                        onClick={() => setSelectedLeadId(row.lead_id)}
                        className={`cursor-pointer hover:bg-slate-50 ${
                          isSelected ? "bg-blue-50" : ""
                        }`}
                      >
                        <td className="max-w-xs px-4 py-4">
                          <div className="font-medium text-slate-900">
                            {row.company_name}
                          </div>

                          {row.fit_reason ? (
                            <div className="mt-1 max-w-xs truncate text-xs text-slate-500">
                              {row.fit_reason}
                            </div>
                          ) : null}
                        </td>

                        <td className="px-4 py-4 text-slate-700">
                          {formatLabel(row.category)}
                        </td>

                        <td className="px-4 py-4 text-slate-700">
                          {[row.city, row.state].filter(Boolean).join(", ") ||
                            "-"}
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getGradeClass(
                                row.fit_grade
                              )}`}
                            >
                              {row.fit_grade}
                            </span>
                            <span className="text-slate-600">
                              {row.fit_score}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-4 text-slate-700">
                          {formatLabel(row.suggested_channel)}
                        </td>

                        <td className="px-4 py-4">
                          <div className="text-slate-900">
                            {row.contact_name || "-"}
                          </div>

                          <div className="text-xs text-slate-500">
                            {row.contact_title || ""}
                          </div>

                          {email ? (
                            <div className="mt-1 text-xs text-slate-600">
                              {email}
                            </div>
                          ) : null}
                        </td>

                        <td className="px-4 py-4">
                          <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                            {formatLabel(row.outreach_status)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>


              </table>
            </div>
          </div>

          {selectedLead ? (
            <aside className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-4">
                <p className="text-xs font-medium uppercase tracking-wide text-blue-700">
                  Lead Detail
                </p>

                <div className="mt-1 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-950">
                      {selectedLead.company_name}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {[selectedLead.city, selectedLead.state]
                        .filter(Boolean)
                        .join(", ") || "Location unknown"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={analyzeSelectedLead}
                    disabled={analyzingLeadId === selectedLead.lead_id}
                    className="rounded-lg bg-blue-700 px-3 py-2 text-xs font-medium text-white shadow-sm hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {analyzingLeadId === selectedLead.lead_id
                      ? "Analyzing..."
                      : "Analyze Lead"}
                  </button>
                </div>

                {analyzeMessage ? (
                  <p className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-xs text-green-700">
                    {analyzeMessage}
                  </p>
                ) : null}

                {analyzeError ? (
                  <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                    {analyzeError}
                  </p>
                ) : null}
              </div>

              <div className="space-y-5 px-5 py-5">
                <section>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Fit Analysis
                  </h3>

                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getGradeClass(
                        selectedLead.fit_grade
                      )}`}
                    >
                      Grade {selectedLead.fit_grade}
                    </span>
                    <span className="text-sm text-slate-700">
                      Score {selectedLead.fit_score}
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-slate-700">
                    {selectedLead.fit_reason || "No fit reason available."}
                  </p>
                </section>

                <section>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Contact
                  </h3>

                  <div className="mt-2 space-y-1 text-sm text-slate-700">
                    <p>
                      <span className="font-medium">Name:</span>{" "}
                      {selectedLead.contact_name || "-"}
                    </p>
                    <p>
                      <span className="font-medium">Title:</span>{" "}
                      {selectedLead.contact_title || "-"}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {getBestEmail(selectedLead) || "-"}
                    </p>
                    <p>
                      <span className="font-medium">Phone:</span>{" "}
                      {selectedLead.contact_phone ||
                        selectedLead.organization_phone ||
                        "-"}
                    </p>
                  </div>
                </section>

                <section>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Quick Links
                  </h3>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedLead.website_url ? (
                      <a
                        href={selectedLead.website_url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Open Website
                      </a>
                    ) : null}

                    {getBestLinkedIn(selectedLead) ? (
                      <a
                        href={getBestLinkedIn(selectedLead) ?? ""}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Open LinkedIn
                      </a>
                    ) : null}

                    {selectedLead.contact_page_url ? (
                      <a
                        href={selectedLead.contact_page_url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Contact Page
                      </a>
                    ) : null}
                  </div>
                </section>

                <section>
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-slate-900">
                      Cold Email Draft
                    </h3>

                    <button
                      type="button"
                      onClick={() =>
                        copyText("Cold email", selectedLead.latest_cold_email_body)
                      }
                      disabled={!selectedLead.latest_cold_email_body}
                      className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {copiedLabel === "Cold email" ? "Copied" : "Copy"}
                    </button>
                  </div>

                  {selectedLead.latest_cold_email_subject ? (
                    <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
                      <span className="font-semibold">Subject:</span>{" "}
                      {selectedLead.latest_cold_email_subject}
                    </div>
                  ) : null}

                  <div className="mt-3 max-h-64 overflow-y-auto whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700">
                    {selectedLead.latest_cold_email_body ||
                      "No cold email draft available."}
                  </div>
                </section>

                <section>
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-slate-900">
                      LinkedIn Draft
                    </h3>

                    <button
                      type="button"
                      onClick={() =>
                        copyText(
                          "LinkedIn",
                          selectedLead.latest_linkedin_message_body
                        )
                      }
                      disabled={!selectedLead.latest_linkedin_message_body}
                      className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {copiedLabel === "LinkedIn" ? "Copied" : "Copy"}
                    </button>
                  </div>

                  <div className="mt-3 whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700">
                    {selectedLead.latest_linkedin_message_body ||
                      "No LinkedIn draft available."}
                  </div>
                </section>

                <section>
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-slate-900">
                      LinkedIn Follow-up
                    </h3>

                    <button
                      type="button"
                      onClick={() =>
                        copyText(
                          "LinkedIn follow-up",
                          selectedLead.latest_linkedin_followup_body
                        )
                      }
                      disabled={!selectedLead.latest_linkedin_followup_body}
                      className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {copiedLabel === "LinkedIn follow-up" ? "Copied" : "Copy"}
                    </button>
                  </div>

                  <div className="mt-3 whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700">
                    {selectedLead.latest_linkedin_followup_body ||
                      "No LinkedIn follow-up draft available."}
                  </div>
                </section>

                <section>
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-slate-900">
                      Contact Form Message
                    </h3>

                    <button
                      type="button"
                      onClick={() =>
                        copyText("Contact form", selectedLead.latest_contact_form_body)
                      }
                      disabled={!selectedLead.latest_contact_form_body}
                      className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {copiedLabel === "Contact form" ? "Copied" : "Copy"}
                    </button>
                  </div>

                  <div className="mt-3 whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700">
                    {selectedLead.latest_contact_form_body ||
                      "No contact form draft available."}
                  </div>
                </section>

                <section>
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-slate-900">
                      Partnership Message
                    </h3>

                    <button
                      type="button"
                      onClick={() =>
                        copyText("Partnership", selectedLead.latest_partnership_message_body)
                      }
                      disabled={!selectedLead.latest_partnership_message_body}
                      className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {copiedLabel === "Partnership" ? "Copied" : "Copy"}
                    </button>
                  </div>

                  <div className="mt-3 whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700">
                    {selectedLead.latest_partnership_message_body ||
                      "No partnership message available."}
                  </div>
                </section>

                <section>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Outreach Status
                  </h3>

                  <select
                    value={selectedLead.outreach_status}
                    onChange={(event) =>
                      updateStatus(event.target.value as GrowthOutreachStatus)
                    }
                    disabled={updatingStatus}
                    className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {formatLabel(status)}
                      </option>
                    ))}
                  </select>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => updateStatus("contacted_via_email")}
                      disabled={updatingStatus}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                      Mark Email Sent
                    </button>

                    <button
                      type="button"
                      onClick={() => updateStatus("contacted_via_linkedin")}
                      disabled={updatingStatus}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                      Mark LinkedIn Sent
                    </button>

                    <button
                      type="button"
                      onClick={() => updateStatus("follow_up_needed")}
                      disabled={updatingStatus}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                      Follow-up Needed
                    </button>

                    <button
                      type="button"
                      onClick={() => updateStatus("do_not_contact")}
                      disabled={updatingStatus}
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
                    >
                      Do Not Contact
                    </button>
                  </div>

                  {statusError ? (
                    <p className="mt-2 text-xs text-red-600">{statusError}</p>
                  ) : null}
                </section>
              </div>
            </aside>
          ) : null}
        </div>
      )}
    </>
  );
}

