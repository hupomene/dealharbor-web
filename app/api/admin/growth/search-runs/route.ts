import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/growth/growth-db";
import type { GrowthCategory } from "@/types/growth";

const VALID_CATEGORIES: GrowthCategory[] = [
  "business_broker",
  "main_street_business_broker",
  "ma_advisor",
  "franchise_resale_broker",
  "business_transaction_attorney",
  "small_business_attorney",
  "cpa_tax_advisor",
  "sba_loan_broker",
  "sba_lender",
  "escrow_closing_provider",
  "business_broker_association",
  "chamber_of_commerce",
  "score_chapter",
  "sbdc",
  "entrepreneur_group",
  "other",
  "excluded",
];

function normalizeText(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function buildCampaignName(keyword: string, location: string) {
  const cleanLocation = location || "General";
  return `${cleanLocation} - ${keyword}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const keyword = normalizeText(body.keyword);
    const location = normalizeText(body.location);
    const rawCategory = normalizeText(body.category);
    const rawMaxResults = Number(body.maxResults);

    const maxResults =
      Number.isFinite(rawMaxResults) && rawMaxResults > 0
        ? Math.min(Math.floor(rawMaxResults), 100)
        : 50;

    if (!keyword) {
      return NextResponse.json(
        { error: "Keyword is required." },
        { status: 400 }
      );
    }

    const category: GrowthCategory = VALID_CATEGORIES.includes(
      rawCategory as GrowthCategory
    )
      ? (rawCategory as GrowthCategory)
      : "business_broker";

    const supabase = getSupabaseAdminClient();

    const campaignName = buildCampaignName(keyword, location);

    const { data: campaign, error: campaignError } = await supabase
      .from("growth_campaigns")
      .insert({
        name: campaignName,
        description: `Growth search campaign created from /admin/growth for keyword "${keyword}"${
          location ? ` in ${location}` : ""
        }.`,
        target_region: location || null,
        target_category: category,
        default_keyword: keyword,
        status: "active",
      })
      .select("id, name")
      .single();

    if (campaignError) {
      return NextResponse.json(
        { error: campaignError.message },
        { status: 500 }
      );
    }

    const searchQuery = [keyword, location].filter(Boolean).join(" ");

    const { data: searchRun, error: searchRunError } = await supabase
      .from("growth_search_runs")
      .insert({
        campaign_id: campaign.id,
        keyword,
        location: location || null,
        category_filter: category,
        search_provider: "serpapi",
        search_query: searchQuery,
        max_results: maxResults,
        status: "queued",
        total_found: 0,
        total_saved: 0,
        total_duplicates: 0,
        total_errors: 0,
      })
      .select("id, keyword, location, status, max_results")
      .single();

    if (searchRunError) {
      return NextResponse.json(
        { error: searchRunError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      campaign,
      searchRun,
      message:
        "Search run was created. Search provider integration will process this in the next phase.",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}