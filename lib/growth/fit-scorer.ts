import type {
  GrowthCategory,
  GrowthFitGrade,
  GrowthSuggestedChannel,
} from "@/types/growth";
import { callOpenAiJson } from "@/lib/growth/openai-client";

export type GrowthFitScoreInput = {
  companyName: string;
  websiteUrl: string | null;
  websiteDomain: string | null;
  categoryHint: string | null;
  location: string | null;
  searchQuery: string;
  searchTitle: string;
  searchSnippet: string | null;
  websiteTitle: string | null;
  websiteMetaDescription: string | null;
  homepageText: string | null;
  discoveredEmails: string[];
  discoveredPhones: string[];
  discoveredLinkedinUrls: string[];
};

export type GrowthFitScoreResult = {
  category: GrowthCategory;
  fit_score: number;
  fit_grade: GrowthFitGrade;
  fit_reason: string;
  suggested_channel: GrowthSuggestedChannel;
  exclude_reason: string | null;
  fit_signals: {
    positive: string[];
    negative: string[];
    document_relevance: string[];
    icp_match: string[];
    risks: string[];
  };
};

const FALLBACK_RESULT: GrowthFitScoreResult = {
  category: "other",
  fit_score: 45,
  fit_grade: "C",
  fit_reason:
    "Initial fit scoring fallback was used because AI scoring was unavailable.",
  suggested_channel: "manual_review",
  exclude_reason: null,
  fit_signals: {
    positive: [],
    negative: [],
    document_relevance: [],
    icp_match: [],
    risks: ["AI scoring unavailable"],
  },
};

function truncate(value: string | null | undefined, maxLength: number) {
  if (!value) return "";

  return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
}

function getFallbackSuggestedChannel(input: GrowthFitScoreInput) {
  if (input.discoveredEmails.length > 0) return "email";
  if (input.discoveredLinkedinUrls.length > 0) return "linkedin";
  return "manual_review";
}

function validateCategory(value: unknown): GrowthCategory {
  const allowed: GrowthCategory[] = [
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

  return allowed.includes(value as GrowthCategory)
    ? (value as GrowthCategory)
    : "other";
}

function validateGrade(value: unknown): GrowthFitGrade {
  if (value === "A" || value === "B" || value === "C" || value === "D") {
    return value;
  }

  return "C";
}

function validateSuggestedChannel(value: unknown): GrowthSuggestedChannel {
  const allowed: GrowthSuggestedChannel[] = [
    "email",
    "linkedin",
    "contact_form",
    "phone",
    "partnership",
    "manual_review",
    "do_not_contact",
  ];

  return allowed.includes(value as GrowthSuggestedChannel)
    ? (value as GrowthSuggestedChannel)
    : "manual_review";
}

function clampScore(value: unknown) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) return 45;

  return Math.max(0, Math.min(100, Math.round(numberValue)));
}

function asStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 10);
}

function normalizeAiResult(
  value: unknown,
  input: GrowthFitScoreInput
): GrowthFitScoreResult {
  const record = value && typeof value === "object" ? (value as Record<string, unknown>) : {};

  const fitSignals =
    record.fit_signals && typeof record.fit_signals === "object"
      ? (record.fit_signals as Record<string, unknown>)
      : {};

  const category = validateCategory(record.category);
  const fitScore = clampScore(record.fit_score);
  const fitGrade = validateGrade(record.fit_grade);

  let suggestedChannel = validateSuggestedChannel(record.suggested_channel);

  if (suggestedChannel === "email" && input.discoveredEmails.length === 0) {
    suggestedChannel = getFallbackSuggestedChannel(input);
  }

  if (suggestedChannel === "linkedin" && input.discoveredLinkedinUrls.length === 0) {
    suggestedChannel = getFallbackSuggestedChannel(input);
  }

  return {
    category,
    fit_score: fitScore,
    fit_grade: fitGrade,
    fit_reason:
      typeof record.fit_reason === "string" && record.fit_reason.trim()
        ? record.fit_reason.trim()
        : "AI fit scoring completed, but no detailed reason was returned.",
    suggested_channel: suggestedChannel,
    exclude_reason:
      typeof record.exclude_reason === "string" && record.exclude_reason.trim()
        ? record.exclude_reason.trim()
        : null,
    fit_signals: {
      positive: asStringArray(fitSignals.positive),
      negative: asStringArray(fitSignals.negative),
      document_relevance: asStringArray(fitSignals.document_relevance),
      icp_match: asStringArray(fitSignals.icp_match),
      risks: asStringArray(fitSignals.risks),
    },
  };
}

function buildPrompt(input: GrowthFitScoreInput) {
  return `
You are scoring B2B prospects for PactAnchor.

PactAnchor:
- Product: SaaS document automation platform for small business sale transactions.
- Core message: "One Intake. A Full Small Business Sale Document Package."
- Documents supported: Asset Purchase Agreement, Bill of Sale, Promissory Note, Non-Compete Agreement, IRS Form 8594 support.
- Best customers: small business brokers, main street business brokers, M&A advisors for small businesses, franchise resale brokers, business transaction attorneys, small business attorneys, CPAs/tax advisors supporting business sales, SBA loan brokers/lenders, escrow/closing support providers, broker associations, chambers, SCORE chapters, SBDCs, local entrepreneur groups.

Scoring rules:
- A: Very strong ICP fit. Clearly works with small business sale transactions, business brokerage, buyer/seller representation, M&A advisory for small businesses, acquisition closing support, or business sale legal/tax/SBA work.
- B: Good potential fit but less direct. Mentions business acquisition, business valuation, exit planning, SBA financing, franchise resale, business law, tax advisory, or M&A but small-business-sale specificity is not fully clear.
- C: Weak/uncertain fit. Adjacent business services but limited evidence of small business sale transactions.
- D: Poor fit or likely exclude. Residential real estate, commercial real estate only, generic accounting without business sale work, generic legal without transaction work, directories/listing sites, job boards, media pages.

Important exclusion logic:
- If the company appears to be only commercial real estate, property leasing, residential real estate, insurance, staffing, marketing agency, or a directory/listing site, downgrade strongly.
- If there is clear business brokerage, buy/sell business, seller representation, buyer representation, exit planning, SBA acquisition financing, due diligence, closing, APA, or business transaction law, score higher.

Return ONLY valid JSON with this exact structure:
{
  "category": "business_broker | main_street_business_broker | ma_advisor | franchise_resale_broker | business_transaction_attorney | small_business_attorney | cpa_tax_advisor | sba_loan_broker | sba_lender | escrow_closing_provider | business_broker_association | chamber_of_commerce | score_chapter | sbdc | entrepreneur_group | other | excluded",
  "fit_score": 0,
  "fit_grade": "A | B | C | D",
  "fit_reason": "1-3 sentence reason",
  "suggested_channel": "email | linkedin | contact_form | phone | partnership | manual_review | do_not_contact",
  "exclude_reason": null,
  "fit_signals": {
    "positive": [],
    "negative": [],
    "document_relevance": [],
    "icp_match": [],
    "risks": []
  }
}

Prospect data:
Company name: ${input.companyName}
Website URL: ${input.websiteUrl ?? ""}
Website domain: ${input.websiteDomain ?? ""}
Category hint: ${input.categoryHint ?? ""}
Location: ${input.location ?? ""}
Search query: ${input.searchQuery}
Search result title: ${input.searchTitle}
Search result snippet: ${input.searchSnippet ?? ""}
Website title: ${input.websiteTitle ?? ""}
Website meta description: ${input.websiteMetaDescription ?? ""}
Discovered emails: ${input.discoveredEmails.join(", ")}
Discovered phones: ${input.discoveredPhones.join(", ")}
Discovered LinkedIn URLs: ${input.discoveredLinkedinUrls.join(", ")}

Homepage text:
${truncate(input.homepageText, 8000)}
`.trim();
}

export async function scoreGrowthFit(
  input: GrowthFitScoreInput
): Promise<GrowthFitScoreResult> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return {
      ...FALLBACK_RESULT,
      suggested_channel: getFallbackSuggestedChannel(input),
      fit_signals: {
        ...FALLBACK_RESULT.fit_signals,
        risks: ["Missing OPENAI_API_KEY"],
      },
    };
  }

  const result = await callOpenAiJson({
    prompt: buildPrompt(input),
    model: "gpt-4.1-mini",
    temperature: 0.1,
    maxRetries: 3,
    baseDelayMs: 3000,
  });

  if (!result.ok) {
    return {
      ...FALLBACK_RESULT,
      suggested_channel: getFallbackSuggestedChannel(input),
      fit_reason: `AI scoring failed: ${result.error}. Fallback scoring was used.`,
      fit_signals: {
        ...FALLBACK_RESULT.fit_signals,
        risks: [
          result.error,
          result.status ? `OpenAI status ${result.status}` : "OpenAI request failed",
          `Attempts: ${result.attempts}`,
        ],
      },
    };
  }

  return normalizeAiResult(result.data, input);
}