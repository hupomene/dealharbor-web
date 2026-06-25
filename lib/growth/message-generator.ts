import type {
  GrowthCategory,
  GrowthFitGrade,
  GrowthSuggestedChannel,
} from "@/types/growth";
import { callOpenAiJson } from "@/lib/growth/openai-client";

export type GrowthMessageGenerationInput = {
  companyName: string;
  websiteUrl: string | null;
  websiteDomain: string | null;
  category: GrowthCategory;
  fitScore: number;
  fitGrade: GrowthFitGrade;
  fitReason: string;
  suggestedChannel: GrowthSuggestedChannel;
  contactName: string | null;
  contactTitle: string | null;
  email: string | null;
  phone: string | null;
  linkedinUrl: string | null;
  contactPageUrl: string | null;
  city: string | null;
  state: string | null;
  websiteTitle: string | null;
  websiteMetaDescription: string | null;
  homepageText: string | null;
  fitSignals: Record<string, unknown>;
};

export type GeneratedGrowthMessages = {
  cold_email_subject: string;
  cold_email_body: string;
  linkedin_connection_message: string;
  linkedin_followup_message: string;
  contact_form_message: string;
  partnership_message: string;
  personalization_summary: string;
};

function truncate(value: string | null | undefined, maxLength: number) {
  if (!value) return "";

  return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
}

function getContactGreeting(input: GrowthMessageGenerationInput) {
  if (input.contactName) {
    return input.contactName.split(" ")[0];
  }

  return "there";
}

function getLocationText(input: GrowthMessageGenerationInput) {
  return [input.city, input.state].filter(Boolean).join(", ");
}

function fallbackMessages(
  input: GrowthMessageGenerationInput
): GeneratedGrowthMessages {
  const firstName = getContactGreeting(input);
  const locationText = getLocationText(input);
  const locationPhrase = locationText ? ` in ${locationText}` : "";

  const coldEmailBody = `Hi ${firstName},

I came across ${input.companyName} and noticed your work around ${
    input.category === "business_broker" ||
    input.category === "main_street_business_broker"
      ? "business brokerage and small business sale transactions"
      : "small business transactions"
  }${locationPhrase}.

I recently launched PactAnchor, a document automation platform built specifically for small business sale transactions. It turns one guided intake into a draft document package that can include an Asset Purchase Agreement, Bill of Sale, Promissory Note, Non-Compete Agreement, and IRS Form 8594 support.

I thought this may be useful for teams that want to reduce repetitive drafting work and keep deal documents more consistent.

Would you be open to taking a quick look and sharing feedback?

Best,
Dan
Covenant AI Solutions LLC
https://www.pactanchor.com`;

  return {
    cold_email_subject:
      "A faster way to prepare small business sale document packages",
    cold_email_body: coldEmailBody,
    linkedin_connection_message: `Hi ${firstName}, I’m the founder of PactAnchor, a document automation platform for small business sale transactions. I noticed your work with small business deals${locationPhrase} and would be glad to connect.`,
    linkedin_followup_message: `Thanks for connecting, ${firstName}. PactAnchor helps turn one guided deal intake into a draft small business sale document package, including APA, Bill of Sale, Promissory Note, Non-Compete, and IRS 8594 support. Would you be open to a quick look?`,
    contact_form_message: `Hello, I’m Dan from Covenant AI Solutions LLC. I recently launched PactAnchor, a document automation platform for small business sale transactions. It helps create a draft package from one guided intake, including APA, Bill of Sale, Promissory Note, Non-Compete, and IRS 8594 support. I’d appreciate the chance to share it with the right person on your team.`,
    partnership_message: `Hello, I’m Dan from Covenant AI Solutions LLC. I’d like to explore whether PactAnchor could be useful for ${input.companyName} or its network. PactAnchor helps small business sale professionals generate a coordinated draft document package from one guided intake.`,
    personalization_summary:
      "Fallback outreach copy generated from company name, category, and location.",
  };
}

function safeString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizeGeneratedMessages(
  value: unknown,
  input: GrowthMessageGenerationInput
): GeneratedGrowthMessages {
  const fallback = fallbackMessages(input);
  const record =
    value && typeof value === "object" ? (value as Record<string, unknown>) : {};

  return {
    cold_email_subject: safeString(
      record.cold_email_subject,
      fallback.cold_email_subject
    ),
    cold_email_body: safeString(record.cold_email_body, fallback.cold_email_body),
    linkedin_connection_message: safeString(
      record.linkedin_connection_message,
      fallback.linkedin_connection_message
    ).slice(0, 300),
    linkedin_followup_message: safeString(
      record.linkedin_followup_message,
      fallback.linkedin_followup_message
    ),
    contact_form_message: safeString(
      record.contact_form_message,
      fallback.contact_form_message
    ),
    partnership_message: safeString(
      record.partnership_message,
      fallback.partnership_message
    ),
    personalization_summary: safeString(
      record.personalization_summary,
      fallback.personalization_summary
    ),
  };
}

function buildPrompt(input: GrowthMessageGenerationInput) {
  const locationText = getLocationText(input);

  return `
You are writing outreach drafts for PactAnchor.

PactAnchor:
- Product: SaaS document automation platform for small business sale transactions.
- Core message: One Intake. A Full Small Business Sale Document Package.
- Documents supported: Asset Purchase Agreement, Bill of Sale, Promissory Note, Non-Compete Agreement, IRS Form 8594 support.
- Operator: Covenant AI Solutions LLC.
- Website: https://www.pactanchor.com

Audience:
- Small business brokers
- Main Street business brokers
- M&A advisors for small businesses
- Franchise resale brokers
- Business transaction attorneys
- Small business attorneys
- CPAs/tax advisors supporting business sales
- SBA loan brokers/lenders
- Escrow/closing support providers
- Broker associations, chambers, SCORE chapters, SBDCs, entrepreneur groups

Write concise, natural, non-hypey B2B outreach.
Do not claim the prospect has a problem unless the source data supports it.
Do not say "AI" unless it improves clarity.
Do not overpromise legal compliance.
Do not say PactAnchor replaces attorneys.
Do not say the documents are final legal documents.
Position PactAnchor as draft package automation for repetitive deal document preparation.
CTA should ask for a quick look, feedback, or a short demo.

Return ONLY valid JSON with this exact structure:
{
  "cold_email_subject": "subject line",
  "cold_email_body": "email body",
  "linkedin_connection_message": "under 300 characters",
  "linkedin_followup_message": "short follow-up after connection",
  "contact_form_message": "message suitable for website contact form",
  "partnership_message": "message suitable for associations/chambers/partner organizations",
  "personalization_summary": "brief note explaining how the message was personalized"
}

Prospect:
Company: ${input.companyName}
Website: ${input.websiteUrl ?? ""}
Domain: ${input.websiteDomain ?? ""}
Category: ${input.category}
Fit grade: ${input.fitGrade}
Fit score: ${input.fitScore}
Fit reason: ${input.fitReason}
Suggested channel: ${input.suggestedChannel}
Contact name: ${input.contactName ?? ""}
Contact title: ${input.contactTitle ?? ""}
Email: ${input.email ?? ""}
Phone: ${input.phone ?? ""}
LinkedIn URL: ${input.linkedinUrl ?? ""}
Contact page URL: ${input.contactPageUrl ?? ""}
Location: ${locationText}
Website title: ${input.websiteTitle ?? ""}
Website meta description: ${input.websiteMetaDescription ?? ""}
Fit signals JSON:
${JSON.stringify(input.fitSignals).slice(0, 3000)}

Website text:
${truncate(input.homepageText, 5000)}
`.trim();
}

export async function generateGrowthMessages(
  input: GrowthMessageGenerationInput
): Promise<GeneratedGrowthMessages> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return fallbackMessages(input);
  }

  const result = await callOpenAiJson({
    prompt: buildPrompt(input),
    model: "gpt-4.1-mini",
    temperature: 0.3,
    maxRetries: 3,
    baseDelayMs: 1500,
  });

  if (!result.ok) {
    return {
      ...fallbackMessages(input),
      personalization_summary: `Fallback outreach copy generated because OpenAI message generation failed: ${result.error}. Attempts: ${result.attempts}.`,
    };
  }

  return normalizeGeneratedMessages(result.data, input);
}