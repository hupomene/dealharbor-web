"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import type {
  GrowthAnalysisJobDashboardRow,
  GrowthDashboardSummary,
  GrowthLeadDashboardRow,
  GrowthOutreachEventDashboardRow,
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

async function growthAdminFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
) {
  const authHeaders = await getGrowthAdminAuthHeaders();

  const headers = new Headers(init.headers);

  for (const [key, value] of Object.entries(authHeaders)) {
    headers.set(key, value);
  }

  return fetch(input, {
    ...init,
    credentials: "include",
    headers,
  });
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

type FollowUpTaskFilter =
  "all" | "overdue" | "due_today" | "upcoming" | "replied" | "demo_requested";

function getLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDateKey(value: string | null) {
  if (!value) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return getLocalDateKey(date);
}

function getFollowUpTaskType(row: GrowthLeadDashboardRow) {
  if (row.outreach_status === "replied") return "replied";
  if (row.outreach_status === "demo_requested") return "demo_requested";

  const followUpDateKey = getDateKey(row.follow_up_date ?? null);

  if (!followUpDateKey) {
    return null;
  }

  const todayKey = getLocalDateKey(new Date());

  if (followUpDateKey < todayKey) return "overdue";
  if (followUpDateKey === todayKey) return "due_today";

  return "upcoming";
}

function getFollowUpTaskLabel(taskType: string | null) {
  if (taskType === "overdue") return "Overdue";
  if (taskType === "due_today") return "Due Today";
  if (taskType === "upcoming") return "Upcoming";
  if (taskType === "replied") return "Replied";
  if (taskType === "demo_requested") return "Demo Requested";

  return "Task";
}

function getFollowUpTaskBadgeClass(taskType: string | null) {
  if (taskType === "overdue") {
    return "bg-red-50 text-red-700";
  }

  if (taskType === "due_today") {
    return "bg-amber-50 text-amber-700";
  }

  if (taskType === "upcoming") {
    return "bg-blue-50 text-blue-700";
  }

  if (taskType === "replied" || taskType === "demo_requested") {
    return "bg-green-50 text-green-700";
  }

  return "bg-slate-100 text-slate-700";
}

function leadHasFollowUpTask(row: GrowthLeadDashboardRow) {
  return Boolean(
    row.follow_up_date ||
    row.outreach_status === "follow_up_needed" ||
    row.outreach_status === "replied" ||
    row.outreach_status === "demo_requested",
  );
}

function formatEventType(eventType: string) {
  return eventType
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatTimelineDate(value: string | null) {
  if (!value) return "Unknown time";

  try {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function getEventBadgeClass(eventType: string) {
  if (
    eventType.includes("email") ||
    eventType === "email_sent" ||
    eventType === "contacted_via_email"
  ) {
    return "bg-blue-50 text-blue-700";
  }

  if (
    eventType.includes("linkedin") ||
    eventType === "linkedin_sent_manually"
  ) {
    return "bg-sky-50 text-sky-700";
  }

  if (eventType.includes("follow") || eventType === "follow_up_scheduled") {
    return "bg-amber-50 text-amber-700";
  }

  if (
    eventType.includes("do_not_contact") ||
    eventType.includes("not_interested") ||
    eventType.includes("disqualified")
  ) {
    return "bg-red-50 text-red-700";
  }

  if (
    eventType.includes("demo") ||
    eventType.includes("reply") ||
    eventType === "fit_scored"
  ) {
    return "bg-green-50 text-green-700";
  }

  return "bg-slate-100 text-slate-700";
}

function summarizeEventMetadata(metadata: Record<string, unknown> | null) {
  if (!metadata) return null;

  const status = typeof metadata.status === "string" ? metadata.status : null;

  const followUpDate =
    typeof metadata.follow_up_date === "string"
      ? metadata.follow_up_date
      : null;

  const messagesGenerated =
    typeof metadata.messages_generated === "number"
      ? metadata.messages_generated
      : null;

  const fitScore =
    typeof metadata.fit_score === "number" ? metadata.fit_score : null;

  const fitGrade =
    typeof metadata.fit_grade === "string" ? metadata.fit_grade : null;

  const parts = [
    status ? `Status: ${formatLabel(status)}` : null,
    followUpDate ? `Follow-up: ${followUpDate}` : null,
    messagesGenerated !== null
      ? `Messages generated: ${messagesGenerated}`
      : null,
    fitGrade ? `Grade: ${fitGrade}` : null,
    fitScore !== null ? `Score: ${fitScore}` : null,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(" · ") : null;
}

type DuplicateLeadGroup = {
  key: string;
  label: string;
  reason: "same_domain" | "same_company_location";
  leads: GrowthLeadDashboardRow[];
};

function normalizeDuplicateText(value: string | null | undefined) {
  return (value ?? "")
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/$/, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\b(llc|inc|corp|corporation|company|co|the|home|homepage)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractComparableDomain(value: string | null | undefined) {
  if (!value) return null;

  try {
    const url = value.includes("://")
      ? new URL(value)
      : new URL(`https://${value}`);

    const host = url.hostname.toLowerCase().replace(/^www\./, "");

    if (!host || host.includes("linkedin.com")) return null;

    return host;
  } catch {
    const cleaned = value
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .split("/")[0]
      ?.trim();

    if (!cleaned || cleaned.includes("linkedin.com")) return null;

    return cleaned;
  }
}

function getDuplicateLeadKey(row: GrowthLeadDashboardRow) {
  const domain = extractComparableDomain(row.website_domain ?? row.website_url);

  if (domain) {
    return {
      key: `domain:${domain}`,
      label: domain,
      reason: "same_domain" as const,
    };
  }

  const companyName = normalizeDuplicateText(row.company_name);

  if (companyName.length < 8) {
    return null;
  }

  const locationKey = normalizeDuplicateText(
    [row.city, row.state].filter(Boolean).join(" "),
  );

  return {
    key: `company:${companyName}:${locationKey}`,
    label: row.company_name,
    reason: "same_company_location" as const,
  };
}

function buildDuplicateLeadGroups(rows: GrowthLeadDashboardRow[]) {
  const groups = new Map<string, DuplicateLeadGroup>();

  for (const row of rows) {
    const duplicateKey = getDuplicateLeadKey(row);

    if (!duplicateKey) continue;

    const existingGroup = groups.get(duplicateKey.key);

    if (existingGroup) {
      existingGroup.leads.push(row);
    } else {
      groups.set(duplicateKey.key, {
        key: duplicateKey.key,
        label: duplicateKey.label,
        reason: duplicateKey.reason,
        leads: [row],
      });
    }
  }

  return Array.from(groups.values())
    .filter((group) => group.leads.length > 1)
    .sort((a, b) => b.leads.length - a.leads.length);
}

function getLeadQualityFlags(
  row: GrowthLeadDashboardRow,
  duplicateLeadIds: Set<string>,
) {
  const hasEmail = Boolean(getBestEmail(row));
  const hasDraft = leadHasDraft(row);
  const isAnalyzed = leadIsAnalyzed(row);
  const isDuplicate = duplicateLeadIds.has(row.lead_id);
  const isDisqualified =
    row.outreach_status === "disqualified" ||
    row.outreach_status === "do_not_contact" ||
    row.category === "excluded";

  return {
    hasEmail,
    hasDraft,
    isAnalyzed,
    isDuplicate,
    isDisqualified,
    isReady:
      hasEmail &&
      hasDraft &&
      isAnalyzed &&
      !isDuplicate &&
      !isDisqualified &&
      row.fit_grade !== "D",
  };
}

type OutreachReadinessStatus =
  | "ready_to_email"
  | "ready_for_linkedin"
  | "ready_for_contact_form"
  | "needs_analysis"
  | "needs_draft"
  | "missing_contact"
  | "low_fit"
  | "duplicate"
  | "do_not_contact"
  | "already_contacted"
  | "follow_up_active"
  | "needs_review";

type OutreachReadinessResult = {
  status: OutreachReadinessStatus;
  label: string;
  summary: string;
  blockingReasons: string[];
  positiveSignals: string[];
  recommendedAction: string;
  badgeClass: string;
};

function getOutreachReadiness(
  row: GrowthLeadDashboardRow,
  duplicateLeadIds: Set<string>,
): OutreachReadinessResult {
  const quality = getLeadQualityFlags(row, duplicateLeadIds);
  const email = getBestEmail(row);
  const linkedin = getBestLinkedIn(row);
  const contactPage = row.contact_page_url;
  const fitScore = row.fit_score ?? 0;
  const fitGrade = row.fit_grade;

  const positiveSignals = [
    quality.isAnalyzed ? "Analyzed" : null,
    quality.hasDraft ? "Message draft available" : null,
    email ? "Email available" : null,
    linkedin ? "LinkedIn available" : null,
    contactPage ? "Contact form/page available" : null,
    fitGrade === "A" || fitGrade === "B"
      ? `Strong fit: Grade ${fitGrade}`
      : null,
  ].filter(Boolean) as string[];

  if (
    row.outreach_status === "do_not_contact" ||
    row.outreach_status === "not_interested" ||
    row.category === "excluded"
  ) {
    return {
      status: "do_not_contact",
      label: "Do Not Contact",
      summary: "This lead should not be contacted.",
      blockingReasons: [
        "Lead is marked as Do Not Contact, Not Interested, or Excluded.",
      ],
      positiveSignals,
      recommendedAction: "Do not send outreach. Keep this lead excluded.",
      badgeClass: "bg-red-50 text-red-700",
    };
  }

  if (row.outreach_status === "disqualified") {
    return {
      status: "do_not_contact",
      label: "Disqualified",
      summary: "This lead has been disqualified.",
      blockingReasons: ["Lead is marked as Disqualified."],
      positiveSignals,
      recommendedAction:
        "Do not prioritize this lead unless manually reviewed.",
      badgeClass: "bg-red-50 text-red-700",
    };
  }

  if (quality.isDuplicate) {
    return {
      status: "duplicate",
      label: "Duplicate",
      summary: "This lead appears to be a duplicate.",
      blockingReasons: ["Potential duplicate lead detected."],
      positiveSignals,
      recommendedAction:
        "Review duplicate group and keep only the best record for outreach.",
      badgeClass: "bg-purple-50 text-purple-700",
    };
  }

  if (
    row.outreach_status === "follow_up_needed" ||
    row.outreach_status === "replied" ||
    row.outreach_status === "demo_requested"
  ) {
    return {
      status: "follow_up_active",
      label: "Follow-up Active",
      summary: "This lead is already in an active follow-up workflow.",
      blockingReasons: [],
      positiveSignals,
      recommendedAction:
        "Use the Follow-up Queue and Outreach Timeline to continue the conversation.",
      badgeClass: "bg-green-50 text-green-700",
    };
  }

  if (
    row.outreach_status === "contacted_via_email" ||
    row.outreach_status === "contacted_via_linkedin" ||
    row.outreach_status === "contacted_via_contact_form"
  ) {
    return {
      status: "already_contacted",
      label: "Already Contacted",
      summary: "This lead has already been contacted.",
      blockingReasons: [],
      positiveSignals,
      recommendedAction:
        "Set a follow-up date or wait for a reply before contacting again.",
      badgeClass: "bg-slate-100 text-slate-700",
    };
  }

  if (!quality.isAnalyzed) {
    return {
      status: "needs_analysis",
      label: "Needs Analysis",
      summary: "This lead was imported but has not been fully analyzed yet.",
      blockingReasons: ["Website analysis and AI scoring are not complete."],
      positiveSignals,
      recommendedAction:
        "Click Analyze Lead or queue this lead for analysis before outreach.",
      badgeClass: "bg-amber-50 text-amber-700",
    };
  }

  if (!quality.hasDraft) {
    return {
      status: "needs_draft",
      label: "Needs Draft",
      summary: "This lead needs outreach message drafts.",
      blockingReasons: ["No generated outreach draft is available."],
      positiveSignals,
      recommendedAction:
        "Run Analyze Lead again to generate email, LinkedIn, and contact form drafts.",
      badgeClass: "bg-blue-50 text-blue-700",
    };
  }

  if (fitGrade === "D" || fitScore < 40) {
    return {
      status: "low_fit",
      label: "Low Fit",
      summary: "This lead has low PactAnchor fit.",
      blockingReasons: [`Fit is low: Grade ${fitGrade}, score ${fitScore}.`],
      positiveSignals,
      recommendedAction:
        "Skip this lead unless there is a strong manual reason to contact.",
      badgeClass: "bg-orange-50 text-orange-700",
    };
  }

  if (email) {
    return {
      status: "ready_to_email",
      label: "Ready to Email",
      summary: "This lead is ready for reviewed cold email outreach.",
      blockingReasons: [],
      positiveSignals,
      recommendedAction:
        "Review the Cold Email Draft, send manually, then click Mark Email Sent.",
      badgeClass: "bg-green-50 text-green-700",
    };
  }

  if (linkedin) {
    return {
      status: "ready_for_linkedin",
      label: "Ready for LinkedIn",
      summary: "This lead is ready for LinkedIn outreach.",
      blockingReasons: ["No usable email found."],
      positiveSignals,
      recommendedAction:
        "Copy the LinkedIn message, send manually on LinkedIn, then click Mark LinkedIn Sent.",
      badgeClass: "bg-sky-50 text-sky-700",
    };
  }

  if (contactPage) {
    return {
      status: "ready_for_contact_form",
      label: "Ready for Contact Form",
      summary: "This lead can be contacted through its website contact form.",
      blockingReasons: ["No email or LinkedIn profile found."],
      positiveSignals,
      recommendedAction:
        "Copy the Contact Form Message and submit it manually through the website.",
      badgeClass: "bg-indigo-50 text-indigo-700",
    };
  }

  return {
    status: "missing_contact",
    label: "Missing Contact",
    summary: "This lead does not have enough contact information yet.",
    blockingReasons: ["No email, LinkedIn, or contact form URL is available."],
    positiveSignals,
    recommendedAction:
      "Manually review the website or search for a better contact before outreach.",
    badgeClass: "bg-red-50 text-red-700",
  };
}

type DailyWorkMode =
  | "ready_to_contact"
  | "email_ready"
  | "linkedin_ready"
  | "contact_form_ready"
  | "follow_up"
  | "high_fit_uncontacted"
  | "needs_review";

function getDailyWorkModeLabel(mode: DailyWorkMode) {
  if (mode === "ready_to_contact") return "Ready to Contact";
  if (mode === "email_ready") return "Email Ready";
  if (mode === "linkedin_ready") return "LinkedIn Ready";
  if (mode === "contact_form_ready") return "Contact Form Ready";
  if (mode === "follow_up") return "Follow-up";
  if (mode === "high_fit_uncontacted") return "High-fit Uncontacted";
  if (mode === "needs_review") return "Needs Review";

  return "Daily Work";
}

function getDailyWorkModeDescription(mode: DailyWorkMode) {
  if (mode === "ready_to_contact") {
    return "Leads that are ready for email, LinkedIn, or contact form outreach.";
  }

  if (mode === "email_ready") {
    return "Leads with usable email, analysis, draft, and acceptable fit.";
  }

  if (mode === "linkedin_ready") {
    return "Leads that are best handled through LinkedIn outreach.";
  }

  if (mode === "contact_form_ready") {
    return "Leads that can be contacted through a website contact form.";
  }

  if (mode === "follow_up") {
    return "Leads with active follow-up, replies, demos, or scheduled next steps.";
  }

  if (mode === "high_fit_uncontacted") {
    return "A/B grade leads that have not been contacted yet.";
  }

  if (mode === "needs_review") {
    return "Leads that need manual review before outreach.";
  }

  return "Daily work list.";
}

function getLeadLocationLabel(row: GrowthLeadDashboardRow) {
  return [row.city, row.state].filter(Boolean).join(", ") || "Location unknown";
}

function getLeadPrimaryContactMethod(row: GrowthLeadDashboardRow) {
  const email = getBestEmail(row);
  const linkedin = getBestLinkedIn(row);

  if (email) return `Email: ${email}`;
  if (linkedin) return `LinkedIn: ${linkedin}`;
  if (row.contact_page_url) return `Contact Form: ${row.contact_page_url}`;

  return "No contact method";
}

function normalizeExternalUrl(value: string | null | undefined) {
  if (!value) return null;

  const trimmed = value.trim();

  if (!trimmed) return null;

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

function escapeCsvValue(value: string | number | null | undefined) {
  const text = String(value ?? "");

  if (text.includes('"') || text.includes(",") || text.includes("\n")) {
    return `"${text.replaceAll('"', '""')}"`;
  }

  return text;
}

function buildDailyWorkText(
  rows: GrowthLeadDashboardRow[],
  duplicateLeadIds: Set<string>,
) {
  if (rows.length === 0) {
    return "No leads in this daily work list.";
  }

  return rows
    .map((row, index) => {
      const readiness = getOutreachReadiness(row, duplicateLeadIds);
      const email = getBestEmail(row);
      const linkedin = getBestLinkedIn(row);

      return [
        `${index + 1}. ${row.company_name}`,
        `   Readiness: ${readiness.label}`,
        `   Category: ${formatLabel(row.category)}`,
        `   Status: ${formatLabel(row.outreach_status)}`,
        `   Fit: Grade ${row.fit_grade} / Score ${row.fit_score}`,
        `   Location: ${getLeadLocationLabel(row)}`,
        `   Domain: ${row.website_domain ?? "No domain"}`,
        `   Email: ${email ?? "No email"}`,
        `   LinkedIn: ${linkedin ?? "No LinkedIn"}`,
        `   Contact Page: ${row.contact_page_url ?? "No contact page"}`,
        `   Recommended Action: ${readiness.recommendedAction}`,
      ].join("\n");
    })
    .join("\n\n");
}

function buildDailyWorkCsv(
  rows: GrowthLeadDashboardRow[],
  duplicateLeadIds: Set<string>,
) {
  const headers = [
    "Company",
    "Readiness",
    "Category",
    "Status",
    "Fit Grade",
    "Fit Score",
    "Email",
    "LinkedIn",
    "Contact Page",
    "Domain",
    "Location",
    "Follow Up Date",
    "Recommended Action",
    "Internal Notes",
  ];

  const lines = rows.map((row) => {
    const readiness = getOutreachReadiness(row, duplicateLeadIds);

    return [
      row.company_name,
      readiness.label,
      formatLabel(row.category),
      formatLabel(row.outreach_status),
      row.fit_grade,
      row.fit_score,
      getBestEmail(row),
      getBestLinkedIn(row),
      row.contact_page_url,
      row.website_domain,
      getLeadLocationLabel(row),
      row.follow_up_date,
      readiness.recommendedAction,
      row.internal_notes,
    ]
      .map(escapeCsvValue)
      .join(",");
  });

  return [headers.map(escapeCsvValue).join(","), ...lines].join("\n");
}

function downloadClientTextFile(filename: string, content: string) {
  const blob = new Blob([content], {
    type: "text/plain;charset=utf-8",
  });

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(url);
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
        Once the prospecting agent runs, discovered brokers, advisors,
        attorneys, CPAs, SBA lenders, and associations will appear here.
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
    row.latest_partnership_message_body,
  );
}

function leadIsAnalyzed(row: GrowthLeadDashboardRow) {
  const fitReason = (row.fit_reason ?? "").toLowerCase();
  const looksFastImportedOnly = fitReason.includes(
    "imported from search results",
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
    initialSearchRuns ?? [],
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
    initialRows[0]?.lead_id ?? null,
  );
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [workflowStatus, setWorkflowStatus] =
    useState<GrowthOutreachStatus>("not_contacted");
  const [workflowFollowUpDate, setWorkflowFollowUpDate] = useState("");
  const [workflowInternalNotes, setWorkflowInternalNotes] = useState("");
  const [workflowEventNotes, setWorkflowEventNotes] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [leadEvents, setLeadEvents] = useState<
    GrowthOutreachEventDashboardRow[]
  >([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [followUpTaskFilter, setFollowUpTaskFilter] =
    useState<FollowUpTaskFilter>("all");
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
  const [duplicatesOnly, setDuplicatesOnly] = useState(false);
  const [readinessFilter, setReadinessFilter] = useState<
    OutreachReadinessStatus | "all"
  >("all");
  const [dailyWorkMode, setDailyWorkMode] =
    useState<DailyWorkMode>("ready_to_contact");
  const [dailyWorkLimit, setDailyWorkLimit] = useState(25);
  const [dailyWorkMessage, setDailyWorkMessage] = useState<string | null>(null);
  const [isAnalyzingBatch, setIsAnalyzingBatch] = useState(false);
  const [batchAnalyzeMessage, setBatchAnalyzeMessage] = useState<string | null>(
    null,
  );
  const [batchAnalyzeError, setBatchAnalyzeError] = useState<string | null>(
    null,
  );

  const [isQueueingAnalysis, setIsQueueingAnalysis] = useState(false);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const [queueMessage, setQueueMessage] = useState<string | null>(null);
  const [queueError, setQueueError] = useState<string | null>(null);

  const duplicateLeadGroups = useMemo(() => {
    return buildDuplicateLeadGroups(rows);
  }, [rows]);

  const duplicateLeadIds = useMemo(() => {
    return new Set(
      duplicateLeadGroups.flatMap((group) =>
        group.leads.map((lead) => lead.lead_id),
      ),
    );
  }, [duplicateLeadGroups]);

  const readinessCounts = useMemo(() => {
    const counts: Record<OutreachReadinessStatus, number> = {
      ready_to_email: 0,
      ready_for_linkedin: 0,
      ready_for_contact_form: 0,
      needs_analysis: 0,
      needs_draft: 0,
      missing_contact: 0,
      low_fit: 0,
      duplicate: 0,
      do_not_contact: 0,
      already_contacted: 0,
      follow_up_active: 0,
      needs_review: 0,
    };

    for (const row of rows) {
      const readiness = getOutreachReadiness(row, duplicateLeadIds);
      counts[readiness.status] += 1;
    }

    return counts;
  }, [rows, duplicateLeadIds]);

  const readyToContactCount =
    readinessCounts.ready_to_email +
    readinessCounts.ready_for_linkedin +
    readinessCounts.ready_for_contact_form;

  const dailyWorkRows = useMemo(() => {
    const filtered = rows.filter((row) => {
      const readiness = getOutreachReadiness(row, duplicateLeadIds);

      if (dailyWorkMode === "ready_to_contact") {
        return (
          readiness.status === "ready_to_email" ||
          readiness.status === "ready_for_linkedin" ||
          readiness.status === "ready_for_contact_form"
        );
      }

      if (dailyWorkMode === "email_ready") {
        return readiness.status === "ready_to_email";
      }

      if (dailyWorkMode === "linkedin_ready") {
        return readiness.status === "ready_for_linkedin";
      }

      if (dailyWorkMode === "contact_form_ready") {
        return readiness.status === "ready_for_contact_form";
      }

      if (dailyWorkMode === "follow_up") {
        return (
          readiness.status === "follow_up_active" ||
          row.outreach_status === "follow_up_needed" ||
          row.outreach_status === "replied" ||
          row.outreach_status === "demo_requested"
        );
      }

      if (dailyWorkMode === "high_fit_uncontacted") {
        return (
          (row.fit_grade === "A" || row.fit_grade === "B") &&
          row.outreach_status === "not_contacted" &&
          readiness.status !== "duplicate" &&
          readiness.status !== "do_not_contact"
        );
      }

      if (dailyWorkMode === "needs_review") {
        return (
          readiness.status === "needs_analysis" ||
          readiness.status === "needs_draft" ||
          readiness.status === "missing_contact" ||
          readiness.status === "low_fit" ||
          readiness.status === "needs_review"
        );
      }

      return false;
    });

    return filtered
      .sort((a, b) => {
        const aScore = a.fit_score ?? 0;
        const bScore = b.fit_score ?? 0;

        if (aScore !== bScore) {
          return bScore - aScore;
        }

        const aName = a.company_name ?? "";
        const bName = b.company_name ?? "";

        return aName.localeCompare(bName);
      })
      .slice(0, dailyWorkLimit);
  }, [rows, duplicateLeadIds, dailyWorkMode, dailyWorkLimit]);

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

      if (duplicatesOnly && !duplicateLeadIds.has(row.lead_id)) {
        return false;
      }

      if (readinessFilter !== "all") {
        const readiness = getOutreachReadiness(row, duplicateLeadIds);

        if (readiness.status !== readinessFilter) {
          return false;
        }
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
    duplicatesOnly,
    readinessFilter,
    duplicateLeadIds,
    hideDisqualified,
  ]);

  const pendingAnalysisRows = useMemo(() => {
    return getPendingAnalysisRows(filteredRows);
  }, [filteredRows]);

  const followUpTasks = useMemo(() => {
    return rows
      .filter((row) => leadHasFollowUpTask(row))
      .map((row) => ({
        row,
        taskType: getFollowUpTaskType(row),
        dateKey: getDateKey(row.follow_up_date ?? null),
      }))
      .sort((a, b) => {
        const aDate = a.dateKey ?? "9999-12-31";
        const bDate = b.dateKey ?? "9999-12-31";

        if (aDate !== bDate) {
          return aDate.localeCompare(bDate);
        }

        return (a.row.priority ?? 999) - (b.row.priority ?? 999);
      });
  }, [rows]);

  const visibleFollowUpTasks = useMemo(() => {
    if (followUpTaskFilter === "all") {
      return followUpTasks;
    }

    return followUpTasks.filter((task) => task.taskType === followUpTaskFilter);
  }, [followUpTasks, followUpTaskFilter]);

  const overdueFollowUpCount = useMemo(() => {
    return followUpTasks.filter((task) => task.taskType === "overdue").length;
  }, [followUpTasks]);

  const dueTodayFollowUpCount = useMemo(() => {
    return followUpTasks.filter((task) => task.taskType === "due_today").length;
  }, [followUpTasks]);

  const upcomingFollowUpCount = useMemo(() => {
    return followUpTasks.filter((task) => task.taskType === "upcoming").length;
  }, [followUpTasks]);

  const repliedLeadCount = useMemo(() => {
    return followUpTasks.filter((task) => task.taskType === "replied").length;
  }, [followUpTasks]);

  const demoRequestedLeadCount = useMemo(() => {
    return followUpTasks.filter((task) => task.taskType === "demo_requested")
      .length;
  }, [followUpTasks]);

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
      (row) => row.lead_id === selectedLeadId,
    );

    if (!selectedLeadStillVisible) {
      setSelectedLeadId(filteredRows[0].lead_id);
    }
  }, [filteredRows, selectedLeadId]);

  const selectedLead = useMemo(() => {
    return filteredRows.find((row) => row.lead_id === selectedLeadId) ?? null;
  }, [filteredRows, selectedLeadId]);

  const selectedDuplicateGroup = useMemo(() => {
    if (!selectedLead) return null;

    return (
      duplicateLeadGroups.find((group) =>
        group.leads.some((lead) => lead.lead_id === selectedLead.lead_id),
      ) ?? null
    );
  }, [duplicateLeadGroups, selectedLead]);

  const selectedReadiness = useMemo(() => {
    if (!selectedLead) return null;

    return getOutreachReadiness(selectedLead, duplicateLeadIds);
  }, [selectedLead, duplicateLeadIds]);

  useEffect(() => {
    if (!selectedLead) {
      setWorkflowStatus("not_contacted");
      setWorkflowFollowUpDate("");
      setWorkflowInternalNotes("");
      setWorkflowEventNotes("");
      return;
    }

    setWorkflowStatus(selectedLead.outreach_status);
    setWorkflowFollowUpDate(selectedLead.follow_up_date ?? "");
    setWorkflowInternalNotes(selectedLead.internal_notes ?? "");
  }, [
    selectedLead?.lead_id,
    selectedLead?.outreach_status,
    selectedLead?.follow_up_date,
    selectedLead?.internal_notes,
  ]);

  useEffect(() => {
    setWorkflowEventNotes("");
    setStatusMessage(null);
    setStatusError(null);
  }, [selectedLeadId]);

  useEffect(() => {
    if (!selectedLead?.lead_id) {
      setLeadEvents([]);
      setEventsError(null);
      setEventsLoading(false);
      return;
    }

    void loadLeadEvents(selectedLead.lead_id);
  }, [selectedLead?.lead_id]);

  async function copyText(label: string, text: string | null) {
    if (!text) return;

    await navigator.clipboard.writeText(text);
    setCopiedLabel(label);

    window.setTimeout(() => {
      setCopiedLabel(null);
    }, 1500);
  }

  async function loadLeadEvents(leadId: string) {
    setEventsLoading(true);
    setEventsError(null);

    try {
      const response = await growthAdminFetch(
        `/api/admin/growth/leads/${leadId}/events`,
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Failed to load outreach events");
      }

      setLeadEvents(result.events ?? []);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to load outreach events";
      setEventsError(message);
      setLeadEvents([]);
    } finally {
      setEventsLoading(false);
    }
  }

  async function updateStatus(
    status: GrowthOutreachStatus,
    options?: {
      followUpDate?: string;
      internalNotes?: string;
      eventNotes?: string;
    },
  ) {
    if (!selectedLead) return;

    setUpdatingStatus(true);
    setStatusError(null);
    setStatusMessage(null);

    try {
      const response = await growthAdminFetch(
        `/api/admin/growth/leads/${selectedLead.lead_id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
            follow_up_date:
              options?.followUpDate ?? workflowFollowUpDate ?? null,
            internal_notes:
              options?.internalNotes ?? workflowInternalNotes ?? null,
            event_notes: options?.eventNotes ?? workflowEventNotes ?? null,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Failed to update lead status");
      }

      setRows((currentRows) =>
        currentRows.map((row) =>
          row.lead_id === selectedLead.lead_id
            ? {
                ...row,
                outreach_status: status,
                follow_up_date:
                  options?.followUpDate ?? workflowFollowUpDate ?? null,
                internal_notes:
                  options?.internalNotes ?? workflowInternalNotes ?? null,
              }
            : row,
        ),
      );

      setWorkflowStatus(status);
      setStatusMessage(`Workflow saved. Status: ${formatLabel(status)}.`);
      setWorkflowEventNotes("");

      await loadLeadEvents(selectedLead.lead_id);

      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update lead status";
      setStatusError(message);
    } finally {
      setUpdatingStatus(false);
    }
  }

  async function saveWorkflowUpdate() {
    await updateStatus(workflowStatus, {
      followUpDate: workflowFollowUpDate,
      internalNotes: workflowInternalNotes,
      eventNotes: workflowEventNotes,
    });
  }

  async function markEmailSent() {
    await updateStatus("contacted_via_email", {
      eventNotes: "Email outreach was marked as sent manually.",
    });
  }

  async function markLinkedInSent() {
    await updateStatus("contacted_via_linkedin", {
      eventNotes: "LinkedIn outreach was marked as sent manually.",
    });
  }

  async function markFollowUpNeeded() {
    await updateStatus("follow_up_needed", {
      eventNotes: "Follow-up was scheduled from the Growth dashboard.",
    });
  }

  async function markDoNotContact() {
    await updateStatus("do_not_contact", {
      eventNotes: "Lead was manually marked as Do Not Contact.",
    });
  }

  async function markSelectedLeadAsDuplicate() {
    if (!selectedLead) return;

    const duplicateNote = selectedDuplicateGroup
      ? `Marked as duplicate during lead quality review. Duplicate group: ${selectedDuplicateGroup.label}.`
      : "Marked as duplicate during lead quality review.";

    const nextInternalNotes = workflowInternalNotes.trim()
      ? `${workflowInternalNotes.trim()}\n\n${duplicateNote}`
      : duplicateNote;

    await updateStatus("disqualified", {
      internalNotes: nextInternalNotes,
      eventNotes: duplicateNote,
    });
  }

  function showDuplicateLeadsInPipeline() {
    resetLeadFilters();
    setDuplicatesOnly(true);
  }
  async function runSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsRunningSearch(true);
    setSearchMessage(null);
    setSearchError(null);

    try {
      const response = await growthAdminFetch("/api/admin/growth/search-runs", {
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
        `Search run queued for "${keyword}"${location ? ` in ${location}` : ""}. Processing search results...`,
      );

      const processResponse = await growthAdminFetch(
        `/api/admin/growth/search-runs/${result.searchRun.id}/process`,
        {
          method: "POST",
        },
      );

      const processResult = await processResponse.json();

      if (!processResponse.ok) {
        throw new Error(processResult.error ?? "Failed to process search run");
      }

      setSearchMessage(
        `Fast import completed. Found ${processResult.totalFound}, saved ${processResult.saved}, duplicates ${processResult.duplicates}, skipped ${processResult.skipped}. Website analysis, AI scoring, and message drafts are pending.`,
      );

      setSearchRuns((currentRuns) => [
        {
          id: result.searchRun.id,
          campaign_id: result.campaign.id,
          keyword,
          location: location || null,
          category_filter:
            category as GrowthSearchRunDashboardRow["category_filter"],
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

  function showDailyWorkRowsInPipeline() {
    resetLeadFilters();

    if (dailyWorkMode === "email_ready") {
      setReadinessFilter("ready_to_email");
      return;
    }

    if (dailyWorkMode === "linkedin_ready") {
      setReadinessFilter("ready_for_linkedin");
      return;
    }

    if (dailyWorkMode === "contact_form_ready") {
      setReadinessFilter("ready_for_contact_form");
      return;
    }

    if (dailyWorkMode === "follow_up") {
      setReadinessFilter("follow_up_active");
      return;
    }

    if (dailyWorkMode === "needs_review") {
      setReadinessFilter("needs_analysis");
      return;
    }

    if (dailyWorkMode === "high_fit_uncontacted") {
      setGradeFilter("A");
      setStatusFilter("not_contacted");
      return;
    }

    setReadinessFilter("ready_to_email");
  }

  async function copyDailyWorkList() {
    setDailyWorkMessage(null);

    try {
      const text = buildDailyWorkText(dailyWorkRows, duplicateLeadIds);

      await navigator.clipboard.writeText(text);

      setDailyWorkMessage(`Copied ${dailyWorkRows.length} leads to clipboard.`);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to copy daily work list.";

      setDailyWorkMessage(message);
    }
  }

  function exportDailyWorkCsv() {
    const csv = buildDailyWorkCsv(dailyWorkRows, duplicateLeadIds);
    const dateKey = getLocalDateKey(new Date());
    const mode = dailyWorkMode.replaceAll("_", "-");

    downloadClientTextFile(
      `pactanchor-growth-${mode}-${dateKey}.csv`,
      csv
    );

    setDailyWorkMessage(`Exported ${dailyWorkRows.length} leads to CSV.`);
  }

  function selectDailyWorkLead(row: GrowthLeadDashboardRow) {
    setSelectedLeadId(row.lead_id);
  }


  async function analyzeSelectedLead() {
    if (!selectedLead) return;

    setAnalyzingLeadId(selectedLead.lead_id);
    setAnalyzeMessage(null);
    setAnalyzeError(null);

    try {
      const response = await growthAdminFetch(
        `/api/admin/growth/leads/${selectedLead.lead_id}/analyze`,
        {
          method: "POST",
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Failed to analyze lead");
      }

      setAnalyzeMessage(
        `Analysis completed. Grade ${result.fitGrade}, score ${result.fitScore}, generated ${result.messagesGenerated} messages.`,
      );

      await loadLeadEvents(selectedLead.lead_id);

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
      setBatchAnalyzeError(
        "There are no pending leads to analyze in the current filtered list.",
      );
      return;
    }

    setIsAnalyzingBatch(true);
    setBatchAnalyzeMessage(
      `Starting batch analysis for ${targets.length} pending lead${
        targets.length === 1 ? "" : "s"
      }...`,
    );
    setBatchAnalyzeError(null);
    setAnalyzeMessage(null);
    setAnalyzeError(null);

    let completed = 0;
    let failed = 0;

    try {
      for (const [index, lead] of targets.entries()) {
        setBatchAnalyzeMessage(
          `Analyzing ${index + 1} of ${targets.length}: ${lead.company_name}`,
        );

        const response = await growthAdminFetch(
          `/api/admin/growth/leads/${lead.lead_id}/analyze`,
          {
            method: "POST",
          },
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
        `Batch analysis completed. ${completed} completed, ${failed} failed. Filters were reset so you can review the updated leads.`,
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
    const response = await growthAdminFetch("/api/admin/growth/analysis-jobs");
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
        "There are no pending leads to queue in the current filtered list.",
      );
      return;
    }

    setIsQueueingAnalysis(true);
    setQueueMessage(null);
    setQueueError(null);

    try {
      const response = await growthAdminFetch(
        "/api/admin/growth/analysis-jobs",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            leadIds: targets.map((lead) => lead.lead_id),
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Failed to queue analysis jobs");
      }

      setAnalysisJobs(result.jobs ?? []);

      setQueueMessage(
        `Queued ${result.created} lead${
          result.created === 1 ? "" : "s"
        }. Skipped ${result.skipped}, errors ${result.errors}.`,
      );

      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to queue analysis jobs";
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
      const response = await growthAdminFetch(
        "/api/admin/growth/analysis-jobs/process-batch",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            limit: 5,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Failed to process analysis queue");
      }

      setAnalysisJobs(result.jobs ?? []);

      setQueueMessage(
        `Queue processing finished. Processed ${result.processed}, completed ${result.completed}, failed ${result.failed}, requeued ${result.requeued}. Filters were reset so you can review the updated leads.`,
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
    setReadinessFilter("all");
    setDuplicatesOnly(false);
  }

  function selectFollowUpTask(row: GrowthLeadDashboardRow) {
    setSelectedLeadId(row.lead_id);
  }

  function showFollowUpNeededInPipeline() {
    resetLeadFilters();
    setStatusFilter("follow_up_needed");
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
            Create a search run for brokers, advisors, attorneys, CPAs, SBA
            lenders, escrow providers, or associations. This will quickly import
            matching organizations from SerpAPI. Website analysis, AI scoring,
            and message drafts will be handled in a separate step.
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
              <option value="main_street_business_broker">
                Main Street Business Broker
              </option>
              <option value="ma_advisor">M&A Advisor</option>
              <option value="franchise_resale_broker">
                Franchise Resale Broker
              </option>
              <option value="business_transaction_attorney">
                Business Transaction Attorney
              </option>
              <option value="small_business_attorney">
                Small Business Attorney
              </option>
              <option value="cpa_tax_advisor">CPA / Tax Advisor</option>
              <option value="sba_loan_broker">SBA Loan Broker</option>
              <option value="sba_lender">SBA Lender</option>
              <option value="escrow_closing_provider">
                Escrow / Closing Provider
              </option>
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
                Recent prospecting searches, processing status, imported leads,
                and error tracking.
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
                          run.status,
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

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Today&apos;s Follow-up Queue
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Leads that need follow-up, replies, demos, or next-step action.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setFollowUpTaskFilter("all")}
                className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                  followUpTaskFilter === "all"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                All {followUpTasks.length}
              </button>

              <button
                type="button"
                onClick={() => setFollowUpTaskFilter("overdue")}
                className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                  followUpTaskFilter === "overdue"
                    ? "bg-red-700 text-white"
                    : "bg-red-50 text-red-700 hover:bg-red-100"
                }`}
              >
                Overdue {overdueFollowUpCount}
              </button>

              <button
                type="button"
                onClick={() => setFollowUpTaskFilter("due_today")}
                className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                  followUpTaskFilter === "due_today"
                    ? "bg-amber-700 text-white"
                    : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                }`}
              >
                Today {dueTodayFollowUpCount}
              </button>

              <button
                type="button"
                onClick={() => setFollowUpTaskFilter("upcoming")}
                className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                  followUpTaskFilter === "upcoming"
                    ? "bg-blue-700 text-white"
                    : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                }`}
              >
                Upcoming {upcomingFollowUpCount}
              </button>

              <button
                type="button"
                onClick={() => setFollowUpTaskFilter("replied")}
                className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                  followUpTaskFilter === "replied"
                    ? "bg-green-700 text-white"
                    : "bg-green-50 text-green-700 hover:bg-green-100"
                }`}
              >
                Replied {repliedLeadCount}
              </button>

              <button
                type="button"
                onClick={() => setFollowUpTaskFilter("demo_requested")}
                className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                  followUpTaskFilter === "demo_requested"
                    ? "bg-green-700 text-white"
                    : "bg-green-50 text-green-700 hover:bg-green-100"
                }`}
              >
                Demo {demoRequestedLeadCount}
              </button>
            </div>
          </div>
        </div>

        <div className="px-5 py-4">
          {visibleFollowUpTasks.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center">
              <p className="text-sm font-medium text-slate-700">
                No follow-up tasks in this view.
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Use the Outreach Workflow panel to set follow-up dates or mark
                replies and demo requests.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {visibleFollowUpTasks.slice(0, 12).map(({ row, taskType }) => (
                <button
                  key={row.lead_id}
                  type="button"
                  onClick={() => selectFollowUpTask(row)}
                  className={`w-full rounded-xl border px-4 py-3 text-left transition hover:border-blue-300 hover:bg-blue-50 ${
                    row.lead_id === selectedLeadId
                      ? "border-blue-300 bg-blue-50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex flex-col justify-between gap-2 md:flex-row md:items-start">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${getFollowUpTaskBadgeClass(
                            taskType,
                          )}`}
                        >
                          {getFollowUpTaskLabel(taskType)}
                        </span>

                        <span className="text-xs text-slate-500">
                          {row.follow_up_date
                            ? `Follow-up: ${row.follow_up_date}`
                            : formatLabel(row.outreach_status)}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-slate-900">
                          {row.company_name}
                        </p>

                        {duplicateLeadIds.has(row.lead_id) ? (
                          <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[11px] font-medium text-purple-700">
                            Duplicate
                          </span>
                        ) : null}
                      </div>

                      <p className="mt-1 text-xs text-slate-500">
                        {[row.city, row.state].filter(Boolean).join(", ") ||
                          "Location unknown"}{" "}
                        · {row.website_domain ?? "No domain"}
                      </p>

                      {row.internal_notes ? (
                        <p className="mt-2 line-clamp-2 text-xs text-slate-600">
                          {row.internal_notes}
                        </p>
                      ) : null}
                    </div>

                    <div className="text-left md:text-right">
                      <p className="text-xs text-slate-500">Status</p>
                      <p className="mt-1 text-xs font-medium text-slate-700">
                        {formatLabel(row.outreach_status)}
                      </p>

                      <p className="mt-2 text-xs text-slate-500">Fit</p>
                      <p className="mt-1 text-xs font-medium text-slate-700">
                        Grade {row.fit_grade} · {row.fit_score}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {followUpTasks.length > 12 ? (
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={showFollowUpNeededInPipeline}
                className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                View Follow-up Needed in Pipeline
              </button>
            </div>
          ) : null}
        </div>
      </section>

            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-4">
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">
                      Daily Work Mode
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Build a focused outreach list for today and export it for manual
                      email, LinkedIn, or contact-form work.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={copyDailyWorkList}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Copy Work List
                    </button>

                    <button
                      type="button"
                      onClick={exportDailyWorkCsv}
                      className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800"
                    >
                      Export CSV
                    </button>

                    <button
                      type="button"
                      onClick={showDailyWorkRowsInPipeline}
                      className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 hover:bg-blue-100"
                    >
                      Show in Pipeline
                    </button>
                  </div>
                </div>

                {dailyWorkMessage ? (
                  <p className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-xs text-green-700">
                    {dailyWorkMessage}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-4 px-5 py-4 lg:grid-cols-[280px_minmax(0,1fr)]">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <label className="text-xs font-medium text-slate-600">
                    Work Mode
                  </label>
                  <select
                    value={dailyWorkMode}
                    onChange={(event) =>
                      setDailyWorkMode(event.target.value as DailyWorkMode)
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="ready_to_contact">Ready to Contact</option>
                    <option value="email_ready">Email Ready</option>
                    <option value="linkedin_ready">LinkedIn Ready</option>
                    <option value="contact_form_ready">Contact Form Ready</option>
                    <option value="follow_up">Follow-up</option>
                    <option value="high_fit_uncontacted">
                      High-fit Uncontacted
                    </option>
                    <option value="needs_review">Needs Review</option>
                  </select>

                  <label className="mt-4 block text-xs font-medium text-slate-600">
                    Limit
                  </label>
                  <select
                    value={dailyWorkLimit}
                    onChange={(event) =>
                      setDailyWorkLimit(Number(event.target.value))
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value={10}>10 leads</option>
                    <option value={25}>25 leads</option>
                    <option value={50}>50 leads</option>
                    <option value={100}>100 leads</option>
                  </select>

                  <div className="mt-4 rounded-lg bg-white px-3 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Current List
                    </p>
                    <p className="mt-1 text-2xl font-semibold text-slate-900">
                      {dailyWorkRows.length}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {getDailyWorkModeDescription(dailyWorkMode)}
                    </p>
                  </div>
                </div>

                <div>
                  {dailyWorkRows.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
                      <p className="text-sm font-medium text-slate-700">
                        No leads in this daily work mode.
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Try another mode or analyze more leads first.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {dailyWorkRows.map((row) => {
                        const readiness = getOutreachReadiness(
                          row,
                          duplicateLeadIds,
                        );
                        const websiteUrl = normalizeExternalUrl(row.website_domain);
                        const contactPageUrl = normalizeExternalUrl(
                          row.contact_page_url,
                        );
                        const linkedinUrl = normalizeExternalUrl(
                          getBestLinkedIn(row),
                        );

                        return (
                          <div
                            key={row.lead_id}
                            className={`rounded-xl border px-4 py-3 ${
                              row.lead_id === selectedLeadId
                                ? "border-blue-300 bg-blue-50"
                                : "border-slate-200 bg-white"
                            }`}
                          >
                            <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-start">
                              <button
                                type="button"
                                onClick={() => selectDailyWorkLead(row)}
                                className="min-w-0 text-left"
                              >
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="font-semibold text-slate-900">
                                    {row.company_name}
                                  </p>
                                  <span
                                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${readiness.badgeClass}`}
                                  >
                                    {readiness.label}
                                  </span>
                                </div>

                                <p className="mt-1 text-xs text-slate-500">
                                  {getLeadLocationLabel(row)} ·{" "}
                                  {row.website_domain ?? "No domain"} · Grade{" "}
                                  {row.fit_grade} / {row.fit_score}
                                </p>

                                <p className="mt-2 text-sm text-slate-700">
                                  {readiness.recommendedAction}
                                </p>

                                <p className="mt-2 text-xs text-slate-500">
                                  {getLeadPrimaryContactMethod(row)}
                                </p>
                              </button>

                              <div className="flex flex-wrap gap-2 lg:justify-end">
                                {getBestEmail(row) ? (
                                  <a
                                    href={`mailto:${getBestEmail(row)}`}
                                    className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                                  >
                                    Email
                                  </a>
                                ) : null}

                                {linkedinUrl ? (
                                  <a
                                    href={linkedinUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                                  >
                                    LinkedIn
                                  </a>
                                ) : null}

                                {contactPageUrl ? (
                                  <a
                                    href={contactPageUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                                  >
                                    Contact Page
                                  </a>
                                ) : null}

                                {websiteUrl ? (
                                  <a
                                    href={websiteUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                                  >
                                    Website
                                  </a>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </section>

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
                    Click a lead to review fit reason, outreach drafts, and
                    status.
                  </p>
                </div>

                <div className="flex flex-col items-start gap-2 md:items-end">
                  <div className="text-sm text-slate-500">
                    Showing{" "}
                    <span className="font-semibold text-slate-900">
                      {filteredRows.length}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-slate-900">
                      {rows.length}
                    </span>{" "}
                    leads
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                      {pendingAnalysisRows.length} pending analysis
                    </span>

                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                      Queue: {queuedAnalysisJobCount} queued /{" "}
                      {runningAnalysisJobCount} running /{" "}
                      {failedAnalysisJobCount} failed
                    </span>

                    <span className="rounded-full bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700">
                      {duplicateLeadIds.size} duplicate leads
                    </span>

                    <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                      {readyToContactCount} ready to contact
                    </span>

                    <button
                      type="button"
                      onClick={analyzeTopPendingLeads}
                      disabled={
                        isAnalyzingBatch || pendingAnalysisRows.length === 0
                      }
                      className="rounded-lg bg-blue-700 px-3 py-2 text-xs font-medium text-white shadow-sm hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isAnalyzingBatch
                        ? "Analyzing Batch..."
                        : "Analyze Top 3 Pending"}
                    </button>

                    <button
                      type="button"
                      onClick={queueTopPendingLeads}
                      disabled={
                        isQueueingAnalysis || pendingAnalysisRows.length === 0
                      }
                      className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-medium text-blue-700 shadow-sm hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isQueueingAnalysis ? "Queueing..." : "Queue Top 10"}
                    </button>

                    <button
                      type="button"
                      onClick={processAnalysisQueue}
                      disabled={
                        isProcessingQueue || queuedAnalysisJobCount === 0
                      }
                      className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isProcessingQueue
                        ? "Processing..."
                        : "Process Queue Batch"}
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
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                <div className="min-w-0">
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

                <div className="min-w-0">
                  <label className="text-xs font-medium text-slate-600">
                    Grade
                  </label>
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

                <div className="min-w-0">
                  <label className="text-xs font-medium text-slate-600">
                    Status
                  </label>
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

                <div className="min-w-0">
                  <label className="text-xs font-medium text-slate-600">
                    Category
                  </label>
                  <select
                    value={categoryFilter}
                    onChange={(event) => setCategoryFilter(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="all">All</option>
                    <option value="business_broker">Business Broker</option>
                    <option value="main_street_business_broker">
                      Main Street Business Broker
                    </option>
                    <option value="ma_advisor">M&A Advisor</option>
                    <option value="franchise_resale_broker">
                      Franchise Resale Broker
                    </option>
                    <option value="business_transaction_attorney">
                      Business Transaction Attorney
                    </option>
                    <option value="small_business_attorney">
                      Small Business Attorney
                    </option>
                    <option value="cpa_tax_advisor">CPA / Tax Advisor</option>
                    <option value="sba_loan_broker">SBA Loan Broker</option>
                    <option value="sba_lender">SBA Lender</option>
                    <option value="escrow_closing_provider">
                      Escrow / Closing Provider
                    </option>
                    <option value="business_broker_association">
                      Broker Association
                    </option>
                    <option value="chamber_of_commerce">
                      Chamber of Commerce
                    </option>
                    <option value="score_chapter">SCORE Chapter</option>
                    <option value="sbdc">SBDC</option>
                    <option value="entrepreneur_group">
                      Entrepreneur Group
                    </option>
                    <option value="other">Other</option>
                    <option value="excluded">Excluded</option>
                  </select>
                </div>

                <div className="min-w-0">
                  <label className="text-xs font-medium text-slate-600">
                    Channel
                  </label>
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

                <div className="min-w-0">
                  <label className="text-xs font-medium text-slate-600">
                    Readiness
                  </label>
                  <select
                    value={readinessFilter}
                    onChange={(event) =>
                      setReadinessFilter(
                        event.target.value as OutreachReadinessStatus | "all",
                      )
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="all">All</option>
                    <option value="ready_to_email">Ready to Email</option>
                    <option value="ready_for_linkedin">
                      Ready for LinkedIn
                    </option>
                    <option value="ready_for_contact_form">
                      Ready for Contact Form
                    </option>
                    <option value="needs_analysis">Needs Analysis</option>
                    <option value="needs_draft">Needs Draft</option>
                    <option value="missing_contact">Missing Contact</option>
                    <option value="low_fit">Low Fit</option>
                    <option value="duplicate">Duplicate</option>
                    <option value="do_not_contact">Do Not Contact</option>
                    <option value="already_contacted">Already Contacted</option>
                    <option value="follow_up_active">Follow-up Active</option>
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
                    onChange={(event) =>
                      setUnanalyzedOnly(event.target.checked)
                    }
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
                    checked={duplicatesOnly}
                    onChange={(event) =>
                      setDuplicatesOnly(event.target.checked)
                    }
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  Duplicates only
                </label>

                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={hideDisqualified}
                    onChange={(event) =>
                      setHideDisqualified(event.target.checked)
                    }
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
                      <td
                        colSpan={7}
                        className="px-4 py-8 text-center text-sm text-slate-500"
                      >
                        No leads match the current filters.
                      </td>
                    </tr>
                  ) : null}

                  {filteredRows.map((row) => {
                    const email = getBestEmail(row);
                    const isSelected = row.lead_id === selectedLeadId;
                    const readiness = getOutreachReadiness(
                      row,
                      duplicateLeadIds,
                    );

                    return (
                      <tr
                        key={row.lead_id}
                        onClick={() => setSelectedLeadId(row.lead_id)}
                        className={`cursor-pointer hover:bg-slate-50 ${
                          isSelected ? "bg-blue-50" : ""
                        }`}
                      >
                        <td className="max-w-xs px-4 py-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium text-slate-900">
                              {row.company_name}
                            </p>

                            <span
                              className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${readiness.badgeClass}`}
                            >
                              {readiness.label}
                            </span>

                            {duplicateLeadIds.has(row.lead_id) ? (
                              <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[11px] font-medium text-purple-700">
                                Duplicate
                              </span>
                            ) : null}
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
                                row.fit_grade,
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
                        selectedLead.fit_grade,
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

                <section className="rounded-xl border border-slate-200 bg-white p-4">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Lead Quality
                  </h3>

                  {(() => {
                    const quality = getLeadQualityFlags(
                      selectedLead,
                      duplicateLeadIds,
                    );

                    return (
                      <div className="mt-3 space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {quality.isReady ? (
                            <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                              Ready to Contact
                            </span>
                          ) : null}

                          {!quality.hasEmail ? (
                            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                              Missing Email
                            </span>
                          ) : null}

                          {!quality.isAnalyzed ? (
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                              Needs Analysis
                            </span>
                          ) : null}

                          {!quality.hasDraft ? (
                            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                              Needs Draft
                            </span>
                          ) : null}

                          {quality.isDuplicate ? (
                            <span className="rounded-full bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700">
                              Potential Duplicate
                            </span>
                          ) : null}

                          {quality.isDisqualified ? (
                            <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
                              Disqualified / DNC
                            </span>
                          ) : null}
                        </div>

                        {selectedDuplicateGroup ? (
                          <div className="rounded-lg border border-purple-100 bg-purple-50 px-3 py-3">
                            <p className="text-xs font-semibold text-purple-800">
                              Duplicate Group: {selectedDuplicateGroup.label}
                            </p>
                            <p className="mt-1 text-xs text-purple-700">
                              Reason:{" "}
                              {selectedDuplicateGroup.reason === "same_domain"
                                ? "Same website domain"
                                : "Similar company and location"}
                            </p>

                            <div className="mt-3 space-y-2">
                              {selectedDuplicateGroup.leads.map((lead) => (
                                <button
                                  key={lead.lead_id}
                                  type="button"
                                  onClick={() =>
                                    setSelectedLeadId(lead.lead_id)
                                  }
                                  className={`w-full rounded-lg px-3 py-2 text-left text-xs ${
                                    lead.lead_id === selectedLead.lead_id
                                      ? "bg-white font-semibold text-purple-900"
                                      : "bg-purple-100 text-purple-800 hover:bg-white"
                                  }`}
                                >
                                  <span className="block">
                                    {lead.company_name}
                                  </span>
                                  <span className="mt-0.5 block text-purple-700">
                                    {lead.website_domain ?? "No domain"} ·{" "}
                                    {formatLabel(lead.outreach_status)}
                                  </span>
                                </button>
                              ))}
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={showDuplicateLeadsInPipeline}
                                className="rounded-lg border border-purple-200 bg-white px-3 py-2 text-xs font-medium text-purple-700 hover:bg-purple-100"
                              >
                                Show Duplicates
                              </button>

                              <button
                                type="button"
                                onClick={markSelectedLeadAsDuplicate}
                                disabled={updatingStatus}
                                className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                Mark Selected as Duplicate
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500">
                            No duplicate group detected for this lead.
                          </p>
                        )}
                      </div>
                    );
                  })()}
                </section>

                {selectedReadiness ? (
                  <section className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">
                          Outreach Readiness
                        </h3>
                        <p className="mt-1 text-xs text-slate-500">
                          Final checklist before email, LinkedIn, or contact
                          form outreach.
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${selectedReadiness.badgeClass}`}
                      >
                        {selectedReadiness.label}
                      </span>
                    </div>

                    <p className="mt-3 text-sm text-slate-700">
                      {selectedReadiness.summary}
                    </p>

                    {selectedReadiness.positiveSignals.length > 0 ? (
                      <div className="mt-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                          Positive Signals
                        </p>
                        <ul className="mt-2 space-y-1">
                          {selectedReadiness.positiveSignals.map((signal) => (
                            <li
                              key={signal}
                              className="flex gap-2 text-sm text-slate-700"
                            >
                              <span className="text-green-600">✓</span>
                              <span>{signal}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {selectedReadiness.blockingReasons.length > 0 ? (
                      <div className="mt-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-red-700">
                          Blocking Reasons
                        </p>
                        <ul className="mt-2 space-y-1">
                          {selectedReadiness.blockingReasons.map((reason) => (
                            <li
                              key={reason}
                              className="flex gap-2 text-sm text-slate-700"
                            >
                              <span className="text-red-600">!</span>
                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    <div className="mt-4 rounded-lg bg-slate-50 px-3 py-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Recommended Next Action
                      </p>
                      <p className="mt-1 text-sm text-slate-700">
                        {selectedReadiness.recommendedAction}
                      </p>
                    </div>
                  </section>
                ) : null}

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
                        copyText(
                          "Cold email",
                          selectedLead.latest_cold_email_body,
                        )
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
                          selectedLead.latest_linkedin_message_body,
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
                          selectedLead.latest_linkedin_followup_body,
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
                        copyText(
                          "Contact form",
                          selectedLead.latest_contact_form_body,
                        )
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
                        copyText(
                          "Partnership",
                          selectedLead.latest_partnership_message_body,
                        )
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

                <section className="rounded-xl border border-slate-200 bg-white p-4">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Outreach Workflow
                  </h3>

                  <div className="mt-3 space-y-3">
                    <div>
                      <label className="text-xs font-medium text-slate-600">
                        Outreach Status
                      </label>
                      <select
                        value={workflowStatus}
                        onChange={(event) =>
                          setWorkflowStatus(
                            event.target.value as GrowthOutreachStatus,
                          )
                        }
                        disabled={updatingStatus}
                        className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {formatLabel(status)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-600">
                        Follow-up Date
                      </label>
                      <input
                        type="date"
                        value={workflowFollowUpDate}
                        onChange={(event) =>
                          setWorkflowFollowUpDate(event.target.value)
                        }
                        disabled={updatingStatus}
                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-600">
                        Internal Notes
                      </label>
                      <textarea
                        value={workflowInternalNotes}
                        onChange={(event) =>
                          setWorkflowInternalNotes(event.target.value)
                        }
                        rows={4}
                        disabled={updatingStatus}
                        placeholder="Private notes about this lead, outreach context, reply details, or next step..."
                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-600">
                        Event Note
                      </label>
                      <textarea
                        value={workflowEventNotes}
                        onChange={(event) =>
                          setWorkflowEventNotes(event.target.value)
                        }
                        rows={3}
                        disabled={updatingStatus}
                        placeholder="Optional note for this specific status update..."
                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={saveWorkflowUpdate}
                      disabled={updatingStatus}
                      className={`w-full rounded-lg px-3 py-2 text-sm font-medium text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-50 ${
                        statusMessage
                          ? "bg-green-700 hover:bg-green-800"
                          : "bg-blue-700 hover:bg-blue-800"
                      }`}
                    >
                      {updatingStatus
                        ? "Saving..."
                        : statusMessage
                          ? "Saved"
                          : "Save Workflow Update"}
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={markEmailSent}
                        disabled={updatingStatus}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Mark Email Sent
                      </button>

                      <button
                        type="button"
                        onClick={markLinkedInSent}
                        disabled={updatingStatus}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Mark LinkedIn Sent
                      </button>

                      <button
                        type="button"
                        onClick={markFollowUpNeeded}
                        disabled={updatingStatus}
                        className="rounded-lg border border-amber-300 px-3 py-2 text-xs font-medium text-amber-700 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Follow-up Needed
                      </button>

                      <button
                        type="button"
                        onClick={markDoNotContact}
                        disabled={updatingStatus}
                        className="rounded-lg border border-red-300 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Do Not Contact
                      </button>
                    </div>

                    {statusMessage ? (
                      <p className="rounded-lg bg-green-50 px-3 py-2 text-xs text-green-700">
                        {statusMessage}
                      </p>
                    ) : null}

                    {statusError ? (
                      <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                        {statusError}
                      </p>
                    ) : null}
                  </div>
                </section>
                <section className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">
                        Outreach Timeline
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        Recent status changes, analysis events, and outreach
                        activity.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        selectedLead && loadLeadEvents(selectedLead.lead_id)
                      }
                      disabled={!selectedLead || eventsLoading}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {eventsLoading ? "Loading..." : "Refresh"}
                    </button>
                  </div>

                  {eventsError ? (
                    <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                      {eventsError}
                    </p>
                  ) : null}

                  {!eventsLoading && !eventsError && leadEvents.length === 0 ? (
                    <p className="mt-4 rounded-lg bg-slate-50 px-3 py-3 text-sm text-slate-500">
                      No outreach events yet.
                    </p>
                  ) : null}

                  {leadEvents.length > 0 ? (
                    <ol className="mt-4 space-y-3">
                      {leadEvents.map((event) => {
                        const metadataSummary = summarizeEventMetadata(
                          event.metadata,
                        );

                        return (
                          <li
                            key={event.id}
                            className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-3"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <span
                                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getEventBadgeClass(
                                    event.event_type,
                                  )}`}
                                >
                                  {formatEventType(event.event_type)}
                                </span>

                                <p className="mt-2 text-xs text-slate-500">
                                  {formatTimelineDate(event.created_at)}
                                  {event.channel
                                    ? ` · ${formatLabel(event.channel)}`
                                    : ""}
                                </p>
                              </div>
                            </div>

                            {event.event_notes ? (
                              <p className="mt-2 text-sm text-slate-700">
                                {event.event_notes}
                              </p>
                            ) : null}

                            {metadataSummary ? (
                              <p className="mt-2 text-xs text-slate-500">
                                {metadataSummary}
                              </p>
                            ) : null}
                          </li>
                        );
                      })}
                    </ol>
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
