import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/growth/growth-db";
import {
  normalizeCompanyName,
  normalizeDomain,
  normalizeWebsiteUrl,
  shouldSkipDomain,
} from "@/lib/growth/domain-normalizer";
import { searchWithSerpApi } from "@/lib/growth/search-provider";
import { requireGrowthAdmin } from "@/lib/growth/growth-auth";

type SearchRunRow = {
  id: string;
  campaign_id: string | null;
  keyword: string;
  location: string | null;
  category_filter: string | null;
  search_query: string | null;
  max_results: number;
};

function buildFitReasonFromSnippet(snippet: string | null) {
  if (!snippet) {
    return "Imported from search results. Detailed website analysis and AI fit scoring have not been completed yet.";
  }

  return `Imported from search results. Initial snippet: ${snippet.slice(
    0,
    240
  )}`;
}

function getInitialFitScore(params: {
  title: string;
  snippet: string | null;
  query: string;
}) {
  const text = `${params.title} ${params.snippet ?? ""} ${
    params.query
  }`.toLowerCase();

  let score = 45;

  const strongSignals = [
    "business broker",
    "business brokers",
    "business brokerage",
    "sell your business",
    "sell a business",
    "buy a business",
    "business sales",
    "seller representation",
    "buyer representation",
    "main street",
  ];

  const mediumSignals = [
    "m&a",
    "mergers and acquisitions",
    "business valuation",
    "acquisition",
    "sba",
    "franchise",
    "exit planning",
    "transaction advisory",
  ];

  const negativeSignals = [
    "commercial real estate",
    "residential real estate",
    "homes for sale",
    "apartments",
    "property management",
    "jobs",
    "directory",
  ];

  for (const signal of strongSignals) {
    if (text.includes(signal)) score += 8;
  }

  for (const signal of mediumSignals) {
    if (text.includes(signal)) score += 4;
  }

  for (const signal of negativeSignals) {
    if (text.includes(signal)) score -= 12;
  }

  return Math.max(0, Math.min(score, 100));
}

function getInitialFitGrade(score: number) {
  if (score >= 80) return "A";
  if (score >= 65) return "B";
  if (score >= 40) return "C";
  return "D";
}

function parseLocation(location: string | null) {
  if (!location) {
    return {
      city: null,
      state: null,
    };
  }

  const parts = location.split(",").map((part) => part.trim());

  return {
    city: parts[0] || null,
    state: parts[1] || null,
  };
}

export async function POST(
  request: Request,
  context: { params: Promise<{ searchRunId: string }> }
) {
  const auth = await requireGrowthAdmin(request);

  if (!auth.ok) {
    return auth.response;
  }

  const { searchRunId } = await context.params;

  if (!searchRunId) {
    return NextResponse.json(
      { error: "Missing search run id" },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdminClient();

  try {
    const { data: searchRun, error: searchRunError } = await supabase
      .from("growth_search_runs")
      .select(
        "id, campaign_id, keyword, location, category_filter, search_query, max_results"
      )
      .eq("id", searchRunId)
      .single();

    if (searchRunError || !searchRun) {
      return NextResponse.json(
        { error: searchRunError?.message ?? "Search run not found" },
        { status: 404 }
      );
    }

    const run = searchRun as SearchRunRow;

    await supabase
      .from("growth_search_runs")
      .update({
        search_provider: "serpapi",
        status: "running",
        started_at: new Date().toISOString(),
        error_message: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", run.id);

    const query =
      run.search_query ||
      [run.keyword, run.location].filter(Boolean).join(" ");

    const { results, rawResponse } = await searchWithSerpApi({
      query,
      maxResults: run.max_results,
    });

    let saved = 0;
    let duplicates = 0;
    let skipped = 0;
    let errors = 0;

    const { city, state } = parseLocation(run.location);

    for (const result of results) {
      try {
        const websiteUrl = normalizeWebsiteUrl(result.link);
        const domain = normalizeDomain(result.link);

        if (!websiteUrl || !domain || shouldSkipDomain(domain)) {
          skipped += 1;
          continue;
        }

        const companyName = normalizeCompanyName(result.title);
        const fitScore = getInitialFitScore({
          title: result.title,
          snippet: result.snippet,
          query,
        });
        const fitGrade = getInitialFitGrade(fitScore);

        const { data: doNotContact } = await supabase
          .from("growth_do_not_contact")
          .select("id")
          .or(`domain.eq.${domain},company_name.eq.${companyName}`)
          .limit(1);

        if (doNotContact && doNotContact.length > 0) {
          skipped += 1;
          continue;
        }

        const { data: organization, error: orgError } = await supabase
          .from("growth_organizations")
          .upsert(
            {
              company_name: companyName,
              normalized_company_name: companyName.toLowerCase(),
              website_url: websiteUrl,
              website_domain: domain,
              city,
              state,
              category: run.category_filter || "other",
              source_url: result.link,
              description: result.snippet,
              notes: `Fast imported from SerpAPI organic result. Position: ${
                result.position ?? "unknown"
              }. Website analyzer and AI scoring pending.`,
              website_title: result.title,
              website_meta_description: result.snippet,
            },
            {
              onConflict: "website_domain",
            }
          )
          .select("id")
          .single();

        if (orgError || !organization) {
          errors += 1;
          continue;
        }

        const { data: existingLead, error: existingLeadError } = await supabase
          .from("growth_leads")
          .select("id")
          .eq("organization_id", organization.id)
          .eq("campaign_id", run.campaign_id)
          .is("contact_id", null)
          .limit(1);

        if (existingLeadError) {
          errors += 1;
          continue;
        }

        if (existingLead && existingLead.length > 0) {
          duplicates += 1;
          continue;
        }

        const { error: leadError } = await supabase.from("growth_leads").insert({
          campaign_id: run.campaign_id,
          search_run_id: run.id,
          organization_id: organization.id,
          contact_id: null,
          category: run.category_filter || "other",
          fit_score: fitScore,
          fit_grade: fitGrade,
          fit_reason: buildFitReasonFromSnippet(result.snippet),
          fit_signals: {
            source: "serpapi",
            fast_import_only: true,
            website_analyzed: false,
            ai_scored: false,
            messages_generated: false,
            title: result.title,
            snippet: result.snippet,
            position: result.position,
          },
          suggested_channel: "manual_review",
          outreach_status: "not_contacted",
          priority: fitGrade === "A" ? 1 : fitGrade === "B" ? 2 : 3,
          reply_status: "no_reply",
          internal_notes:
            "Fast imported from search provider. Website analyzer, AI fit scorer, and outreach drafts pending.",
        });

        if (leadError) {
          errors += 1;
          continue;
        }

        saved += 1;
      } catch {
        errors += 1;
      }
    }

    const { error: updateRunError } = await supabase
      .from("growth_search_runs")
      .update({
        search_provider: "serpapi",
        status: "completed",
        completed_at: new Date().toISOString(),
        total_found: results.length,
        total_saved: saved,
        total_duplicates: duplicates,
        total_errors: errors,
        raw_response: {
          provider: "serpapi",
          mode: "fast_import_only",
          analyzed: 0,
          ai_scored: 0,
          messages_generated: 0,
          skipped,
          raw: rawResponse,
        },
        updated_at: new Date().toISOString(),
      })
      .eq("id", run.id);

    if (updateRunError) {
      return NextResponse.json(
        { error: updateRunError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      mode: "fast_import_only",
      searchRunId: run.id,
      totalFound: results.length,
      saved,
      duplicates,
      skipped,
      errors,
      analyzed: 0,
      aiScored: 0,
      messagesGenerated: 0,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error";

    await supabase
      .from("growth_search_runs")
      .update({
        search_provider: "serpapi",
        status: "failed",
        error_message: message,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", searchRunId);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}