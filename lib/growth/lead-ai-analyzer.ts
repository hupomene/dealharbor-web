import { callOpenAiJson } from "@/lib/growth/openai-client";

type GrowthFitGrade = "A" | "B" | "C" | "D";

type GrowthSuggestedChannel =
  | "email"
  | "linkedin"
  | "contact_form"
  | "manual_review"
  | "do_not_contact";

type GrowthCategory =
  | "business_broker"
  | "m_and_a_advisor"
  | "transaction_attorney"
  | "cpa_tax_advisor"
  | "sba_lender"
  | "escrow_closing_provider"
  | "business_broker_association"
  | "chamber_of_commerce"
  | "score_chapter"
  | "sbdc"
  | "entrepreneur_group"
  | "other"
  | "excluded";

export type LeadAiAnalyzerInput = {
  companyName: string;
  websiteUrl: string | null;
  websiteDomain: string | null;
  location: string | null;
  categoryHint: string | null;
  searchQuery: string | null;
  searchTitle: string | null;
  searchSnippet: string | null;
  websiteTitle: string | null;
  websiteMetaDescription: string | null;
  homepageText: string | null;
  discoveredEmails: string[];
  discoveredPhones: string[];
  discoveredLinkedinUrls: string[];
  existingContactName: string | null;
  existingContactTitle: string | null;
  existingEmail: string | null;
  existingPhone: string | null;
  existingLinkedinUrl: string | null;
};

export type LeadAiAnalyzerResult = {
  usedFallback: boolean;
  model: string;
  contactPerson: {
    contactName: string | null;
    contactTitle: string | null;
    email: string | null;
    phone: string | null;
    linkedinUrl: string | null;
    confidence: number;
    reason: string;
    isPersonLevel: boolean;
  };
  fit: {
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
  messages: {
    cold_email_subject: string;
    cold_email_body: string;
    linkedin_connection_message: string;
    linkedin_followup_message: string;
    contact_form_message: string;
    partnership_message: string;
    personalization_summary: string;
  };
};

const ALLOWED_CATEGORIES: GrowthCategory[] = [
  "business_broker",
  "m_and_a_advisor",
  "transaction_attorney",
  "cpa_tax_advisor",
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

const ALLOWED_CHANNELS: GrowthSuggestedChannel[] = [
  "email",
  "linkedin",
  "contact_form",
  "manual_review",
  "do_not_contact",
];

function safeString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function safeArray(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 12);
}

function clampNumber(value: unknown, fallback: number) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) return fallback;

  return Math.max(0, Math.min(100, Math.round(numberValue)));
}

function normalizeCategory(value: unknown): GrowthCategory {
  if (typeof value === "string" && ALLOWED_CATEGORIES.includes(value as GrowthCategory)) {
    return value as GrowthCategory;
  }

  return "other";
}

function normalizeChannel(value: unknown): GrowthSuggestedChannel {
  if (typeof value === "string" && ALLOWED_CHANNELS.includes(value as GrowthSuggestedChannel)) {
    return value as GrowthSuggestedChannel;
  }

  return "manual_review";
}

function getGradeFromScore(score: number): GrowthFitGrade {
  if (score >= 80) return "A";
  if (score >= 65) return "B";
  if (score >= 40) return "C";
  return "D";
}

function normalizeGrade(value: unknown, score: number): GrowthFitGrade {
  if (value === "A" || value === "B" || value === "C" || value === "D") {
    return value;
  }

  return getGradeFromScore(score);
}

function pickBestEmail(input: LeadAiAnalyzerInput, extractedEmail: string | null) {
  return (
    extractedEmail ??
    input.existingEmail ??
    input.discoveredEmails.find((email) => {
      const prefix = email.split("@")[0]?.toLowerCase() ?? "";
      return !["info", "sales", "contact", "hello", "admin", "support"].includes(prefix);
    }) ??
    input.discoveredEmails[0] ??
    null
  );
}

function pickBestPhone(input: LeadAiAnalyzerInput, extractedPhone: string | null) {
  return extractedPhone ?? input.existingPhone ?? input.discoveredPhones[0] ?? null;
}

function pickBestLinkedin(input: LeadAiAnalyzerInput, extractedLinkedin: string | null) {
  return (
    extractedLinkedin ??
    input.existingLinkedinUrl ??
    input.discoveredLinkedinUrls.find((url) => url.includes("/in/")) ??
    input.discoveredLinkedinUrls[0] ??
    null
  );
}

function buildPrompt(input: LeadAiAnalyzerInput) {
  const homepageText = (input.homepageText ?? "").slice(0, 14000);

  return `
You are an AI growth analyst for PactAnchor.

PactAnchor is a SaaS platform for small business sale transaction document automation.
It helps users create a coordinated document package from one intake, including Asset Purchase Agreement, Bill of Sale, Promissory Note, Non-Compete, and IRS Form 8594 support.

Your task:
1. Identify the best outreach contact person if clearly available.
2. Score the prospect's fit for PactAnchor.
3. Generate practical outreach drafts.

Best-fit prospects:
- small business brokers
- business brokerage firms
- M&A advisors serving small/main-street businesses
- business transaction attorneys
- CPAs/tax advisors involved in business sales
- SBA loan brokers/lenders
- escrow or closing support providers for business sales
- business broker associations
- local entrepreneur/SBDC/SCORE/chamber groups that can refer brokers or sellers

Poor-fit or excluded prospects:
- residential real estate agents
- commercial real estate only firms with no business sales
- generic directories
- unrelated marketing agencies
- job sites
- software vendors unrelated to business sale transactions

Company:
${input.companyName}

Website:
${input.websiteUrl ?? "Unknown"}

Domain:
${input.websiteDomain ?? "Unknown"}

Location:
${input.location ?? "Unknown"}

Category hint:
${input.categoryHint ?? "Unknown"}

Search query:
${input.searchQuery ?? "Unknown"}

Search title:
${input.searchTitle ?? "Unknown"}

Search snippet:
${input.searchSnippet ?? "Unknown"}

Website title:
${input.websiteTitle ?? "Unknown"}

Website meta description:
${input.websiteMetaDescription ?? "Unknown"}

Existing contact:
Name: ${input.existingContactName ?? "None"}
Title: ${input.existingContactTitle ?? "None"}
Email: ${input.existingEmail ?? "None"}
Phone: ${input.existingPhone ?? "None"}
LinkedIn: ${input.existingLinkedinUrl ?? "None"}

Discovered emails:
${input.discoveredEmails.length ? input.discoveredEmails.join(", ") : "None"}

Discovered phones:
${input.discoveredPhones.length ? input.discoveredPhones.join(", ") : "None"}

Discovered LinkedIn URLs:
${input.discoveredLinkedinUrls.length ? input.discoveredLinkedinUrls.join(", ") : "None"}

Website text:
${homepageText || "No website text available."}

Return only valid JSON with this exact structure:
{
  "contact_person": {
    "contact_name": string | null,
    "contact_title": string | null,
    "email": string | null,
    "phone": string | null,
    "linkedin_url": string | null,
    "confidence": number,
    "reason": string,
    "is_person_level": boolean
  },
  "fit": {
    "category": "business_broker" | "m_and_a_advisor" | "transaction_attorney" | "cpa_tax_advisor" | "sba_lender" | "escrow_closing_provider" | "business_broker_association" | "chamber_of_commerce" | "score_chapter" | "sbdc" | "entrepreneur_group" | "other" | "excluded",
    "fit_score": number,
    "fit_grade": "A" | "B" | "C" | "D",
    "fit_reason": string,
    "suggested_channel": "email" | "linkedin" | "contact_form" | "manual_review" | "do_not_contact",
    "exclude_reason": string | null,
    "fit_signals": {
      "positive": string[],
      "negative": string[],
      "document_relevance": string[],
      "icp_match": string[],
      "risks": string[]
    }
  },
  "messages": {
    "cold_email_subject": string,
    "cold_email_body": string,
    "linkedin_connection_message": string,
    "linkedin_followup_message": string,
    "contact_form_message": string,
    "partnership_message": string,
    "personalization_summary": string
  }
}

Rules:
- Do not invent a person name.
- If no clear person is available, return contact_name null and contact_title null.
- Prefer Managing Broker, Owner, Founder, Principal, President, M&A Advisor, Business Intermediary.
- Keep LinkedIn connection message under 300 characters.
- Outreach tone: concise, practical, non-hypey, professional.
- Do not claim PactAnchor replaces attorneys.
- Do not overstate legal compliance.
- Focus on small business sale document workflow.
- CTA should ask for quick feedback, a short look, or a brief demo.
`;
}

function fallbackMessages(input: LeadAiAnalyzerInput, fitReason: string) {
  const companyName = input.companyName;
  const website = input.websiteUrl ?? "your website";

  return {
    cold_email_subject: "Quick question about small business sale documents",
    cold_email_body: `Hi,

I came across ${companyName} and noticed your work around business sales and advisory services.

I’m building PactAnchor, a document automation platform for small business sale transactions. The goal is to help brokers and advisors turn one guided intake into a coordinated draft package, including documents like an asset purchase agreement, bill of sale, promissory note, non-compete, and IRS 8594 support.

Would you be open to taking a quick look and sharing feedback from a broker/advisor perspective?

Best,
Daniel
Covenant AI Solutions LLC
https://www.pactanchor.com`,
    linkedin_connection_message: `I came across ${companyName} through ${website}. I’m building PactAnchor for small business sale document workflows and would value your perspective.`,
    linkedin_followup_message: `Thanks for connecting. PactAnchor helps turn one deal intake into a coordinated small business sale document package. I’d value any quick feedback from your perspective.`,
    contact_form_message: `Hello, I’m reaching out about PactAnchor, a document automation platform for small business sale transactions. I came across ${companyName} and thought your team may have valuable feedback. Would someone be open to taking a quick look at https://www.pactanchor.com?`,
    partnership_message: `Hi,

I came across ${companyName} and wanted to introduce PactAnchor.

PactAnchor is a SaaS platform designed to help small business sale professionals generate coordinated draft document packages from one guided intake.

If your team works with business sellers, buyers, or transaction support partners, I’d be interested in exploring whether PactAnchor could be useful for your workflow or clients.

Best,
Daniel
Covenant AI Solutions LLC
https://www.pactanchor.com`,
    personalization_summary: `Fallback messages generated based on company name and general fit context. Fit context: ${fitReason}`,
  };
}

function fallbackAnalysis(input: LeadAiAnalyzerInput, reason: string): LeadAiAnalyzerResult {
  const email = pickBestEmail(input, null);
  const phone = pickBestPhone(input, null);
  const linkedinUrl = pickBestLinkedin(input, null);

  const score = 45;
  const fitReason = `Fallback analysis used. ${reason}`;

  return {
    usedFallback: true,
    model: "fallback",
    contactPerson: {
      contactName: input.existingContactName,
      contactTitle: input.existingContactTitle,
      email,
      phone,
      linkedinUrl,
      confidence: email ? 40 : 20,
      reason: "Using available company-level contact information.",
      isPersonLevel: Boolean(input.existingContactName),
    },
    fit: {
      category: "other",
      fit_score: score,
      fit_grade: getGradeFromScore(score),
      fit_reason: fitReason,
      suggested_channel: email ? "email" : "manual_review",
      exclude_reason: null,
      fit_signals: {
        positive: [],
        negative: [],
        document_relevance: [],
        icp_match: [],
        risks: [reason],
      },
    },
    messages: fallbackMessages(input, fitReason),
  };
}

function normalizeAnalysis(data: unknown, input: LeadAiAnalyzerInput): LeadAiAnalyzerResult {
  const raw = data as Record<string, any>;
  const rawContact = raw.contact_person ?? {};
  const rawFit = raw.fit ?? {};
  const rawMessages = raw.messages ?? {};

  const fitScore = clampNumber(rawFit.fit_score, 45);
  const category = normalizeCategory(rawFit.category);
  const suggestedChannel =
    category === "excluded" ? "do_not_contact" : normalizeChannel(rawFit.suggested_channel);

  const contactName =
    safeString(rawContact.contact_name) ?? input.existingContactName ?? null;

  const contactTitle =
    safeString(rawContact.contact_title) ?? input.existingContactTitle ?? null;

  const extractedEmail = safeString(rawContact.email);
  const extractedPhone = safeString(rawContact.phone);
  const extractedLinkedin = safeString(rawContact.linkedin_url);

  const fitReason =
    safeString(rawFit.fit_reason) ??
    `${input.companyName} was analyzed for PactAnchor fit.`;

  return {
    usedFallback: false,
    model: "gpt-4.1-mini",
    contactPerson: {
      contactName,
      contactTitle,
      email: pickBestEmail(input, extractedEmail),
      phone: pickBestPhone(input, extractedPhone),
      linkedinUrl: pickBestLinkedin(input, extractedLinkedin),
      confidence: clampNumber(rawContact.confidence, contactName ? 70 : 40),
      reason:
        safeString(rawContact.reason) ??
        "Contact person extraction completed.",
      isPersonLevel: Boolean(rawContact.is_person_level && contactName),
    },
    fit: {
      category,
      fit_score: fitScore,
      fit_grade: normalizeGrade(rawFit.fit_grade, fitScore),
      fit_reason: fitReason,
      suggested_channel: suggestedChannel,
      exclude_reason: safeString(rawFit.exclude_reason),
      fit_signals: {
        positive: safeArray(rawFit.fit_signals?.positive),
        negative: safeArray(rawFit.fit_signals?.negative),
        document_relevance: safeArray(rawFit.fit_signals?.document_relevance),
        icp_match: safeArray(rawFit.fit_signals?.icp_match),
        risks: safeArray(rawFit.fit_signals?.risks),
      },
    },
    messages: {
      cold_email_subject:
        safeString(rawMessages.cold_email_subject) ??
        "Quick question about small business sale documents",
      cold_email_body:
        safeString(rawMessages.cold_email_body) ??
        fallbackMessages(input, fitReason).cold_email_body,
      linkedin_connection_message:
        safeString(rawMessages.linkedin_connection_message)?.slice(0, 300) ??
        fallbackMessages(input, fitReason).linkedin_connection_message,
      linkedin_followup_message:
        safeString(rawMessages.linkedin_followup_message) ??
        fallbackMessages(input, fitReason).linkedin_followup_message,
      contact_form_message:
        safeString(rawMessages.contact_form_message) ??
        fallbackMessages(input, fitReason).contact_form_message,
      partnership_message:
        safeString(rawMessages.partnership_message) ??
        fallbackMessages(input, fitReason).partnership_message,
      personalization_summary:
        safeString(rawMessages.personalization_summary) ??
        "Messages generated from combined lead analysis.",
    },
  };
}

export async function analyzeLeadForGrowth(
  input: LeadAiAnalyzerInput
): Promise<LeadAiAnalyzerResult> {
  const result = await callOpenAiJson({
    prompt: buildPrompt(input),
    model: "gpt-4.1-mini",
    temperature: 0.2,
    maxRetries: 1,
    baseDelayMs: 1500,
  });

  if (!result.ok) {
    return fallbackAnalysis(
      input,
      `Combined AI lead analysis failed: ${result.error}. Attempts: ${result.attempts}.`
    );
  }

  return normalizeAnalysis(result.data, input);
}