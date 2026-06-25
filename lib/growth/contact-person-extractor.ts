import { callOpenAiJson } from "@/lib/growth/openai-client";

export type ContactPersonExtractionInput = {
  companyName: string;
  websiteUrl: string | null;
  websiteDomain: string | null;
  location: string | null;
  category: string | null;
  websiteTitle: string | null;
  websiteMetaDescription: string | null;
  homepageText: string | null;
  discoveredEmails: string[];
  discoveredPhones: string[];
  discoveredLinkedinUrls: string[];
  existingEmail: string | null;
  existingPhone: string | null;
  existingLinkedinUrl: string | null;
};

export type ExtractedContactPerson = {
  contactName: string | null;
  contactTitle: string | null;
  email: string | null;
  phone: string | null;
  linkedinUrl: string | null;
  confidence: number;
  reason: string;
  isPersonLevel: boolean;
};

const GENERIC_EMAIL_PREFIXES = new Set([
  "info",
  "sales",
  "contact",
  "hello",
  "admin",
  "support",
  "office",
  "team",
  "broker",
  "brokers",
  "inquiries",
  "service",
]);

function safeString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function clampConfidence(value: unknown) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(numberValue)));
}

function getEmailPrefix(email: string | null) {
  if (!email || !email.includes("@")) return null;
  return email.split("@")[0]?.toLowerCase() ?? null;
}

function isGenericEmail(email: string | null) {
  const prefix = getEmailPrefix(email);

  if (!prefix) return true;

  return (
    GENERIC_EMAIL_PREFIXES.has(prefix) ||
    prefix.includes("info") ||
    prefix.includes("sales") ||
    prefix.includes("contact") ||
    prefix.includes("support")
  );
}

function pickBestEmail(params: {
  extractedEmail: string | null;
  existingEmail: string | null;
  discoveredEmails: string[];
}) {
  if (params.extractedEmail) return params.extractedEmail;
  if (params.existingEmail) return params.existingEmail;

  const personLikeEmail = params.discoveredEmails.find(
    (email) => !isGenericEmail(email)
  );

  return personLikeEmail ?? params.discoveredEmails[0] ?? null;
}

function pickBestLinkedIn(params: {
  extractedLinkedinUrl: string | null;
  existingLinkedinUrl: string | null;
  discoveredLinkedinUrls: string[];
}) {
  if (params.extractedLinkedinUrl) return params.extractedLinkedinUrl;
  if (params.existingLinkedinUrl) return params.existingLinkedinUrl;

  const personLinkedin = params.discoveredLinkedinUrls.find((url) =>
    url.includes("/in/")
  );

  return personLinkedin ?? params.discoveredLinkedinUrls[0] ?? null;
}

function buildPrompt(input: ContactPersonExtractionInput) {
  const text = (input.homepageText ?? "").slice(0, 12000);

  return `
You are extracting the best outreach contact person for PactAnchor.

PactAnchor is a SaaS platform for small business sale transaction document automation.
Best contacts are:
- business broker
- managing broker
- owner
- founder
- principal
- president
- M&A advisor
- transaction advisor
- business intermediary
- franchise resale broker
- business development contact

Company:
${input.companyName}

Website:
${input.websiteUrl ?? "Unknown"}

Domain:
${input.websiteDomain ?? "Unknown"}

Location:
${input.location ?? "Unknown"}

Category hint:
${input.category ?? "Unknown"}

Website title:
${input.websiteTitle ?? "Unknown"}

Meta description:
${input.websiteMetaDescription ?? "Unknown"}

Existing email:
${input.existingEmail ?? "None"}

Existing phone:
${input.existingPhone ?? "None"}

Existing LinkedIn:
${input.existingLinkedinUrl ?? "None"}

Discovered emails:
${input.discoveredEmails.length ? input.discoveredEmails.join(", ") : "None"}

Discovered phones:
${input.discoveredPhones.length ? input.discoveredPhones.join(", ") : "None"}

Discovered LinkedIn URLs:
${
  input.discoveredLinkedinUrls.length
    ? input.discoveredLinkedinUrls.join(", ")
    : "None"
}

Website text:
${text || "No website text available."}

Return only valid JSON with this exact structure:
{
  "contact_name": string | null,
  "contact_title": string | null,
  "email": string | null,
  "phone": string | null,
  "linkedin_url": string | null,
  "confidence": number,
  "reason": string,
  "is_person_level": boolean
}

Rules:
- Prefer a real person over a generic company contact.
- Do not invent a person name.
- Do not infer a full name only from a generic email like info@ or sales@.
- If the website only provides a company-level contact, return contact_name null and contact_title null.
- If a person name appears with a role like Managing Broker, Owner, Founder, President, Principal, or M&A Advisor, select that person.
- If there are multiple people, select the person most likely to respond to a SaaS tool for business sale document automation.
- Use confidence 80-100 only if a person name and relevant title are clearly present.
- Use confidence 50-79 if there is a likely person but some fields are missing.
- Use confidence below 50 if only company-level contact info is available.
`;
}

function fallbackContact(input: ContactPersonExtractionInput): ExtractedContactPerson {
  const email = pickBestEmail({
    extractedEmail: null,
    existingEmail: input.existingEmail,
    discoveredEmails: input.discoveredEmails,
  });

  const linkedinUrl = pickBestLinkedIn({
    extractedLinkedinUrl: null,
    existingLinkedinUrl: input.existingLinkedinUrl,
    discoveredLinkedinUrls: input.discoveredLinkedinUrls,
  });

  return {
    contactName: null,
    contactTitle: null,
    email,
    phone: input.existingPhone ?? input.discoveredPhones[0] ?? null,
    linkedinUrl,
    confidence: email ? 40 : 20,
    reason:
      "No reliable person-level contact was extracted. Using company-level contact information.",
    isPersonLevel: false,
  };
}

function normalizeExtraction(
  data: unknown,
  input: ContactPersonExtractionInput
): ExtractedContactPerson {
  const raw = data as Record<string, unknown>;

  const extractedEmail = safeString(raw.email);
  const extractedLinkedinUrl = safeString(raw.linkedin_url);

  const email = pickBestEmail({
    extractedEmail,
    existingEmail: input.existingEmail,
    discoveredEmails: input.discoveredEmails,
  });

  const linkedinUrl = pickBestLinkedIn({
    extractedLinkedinUrl,
    existingLinkedinUrl: input.existingLinkedinUrl,
    discoveredLinkedinUrls: input.discoveredLinkedinUrls,
  });

  const contactName = safeString(raw.contact_name);
  const contactTitle = safeString(raw.contact_title);
  const confidence = clampConfidence(raw.confidence);
  const isPersonLevel = Boolean(raw.is_person_level && contactName);

  return {
    contactName,
    contactTitle,
    email,
    phone:
      safeString(raw.phone) ??
      input.existingPhone ??
      input.discoveredPhones[0] ??
      null,
    linkedinUrl,
    confidence,
    reason:
      safeString(raw.reason) ??
      "Contact person extraction completed with limited explanation.",
    isPersonLevel,
  };
}

export async function extractContactPerson(
  input: ContactPersonExtractionInput
): Promise<ExtractedContactPerson> {
  const result = await callOpenAiJson({
    prompt: buildPrompt(input),
    model: "gpt-4.1-mini",
    temperature: 0.1,
    maxRetries: 1,
    baseDelayMs: 1500,
  });

  if (!result.ok) {
    return {
      ...fallbackContact(input),
      reason: `Contact person extraction fallback used because OpenAI failed: ${result.error}`,
    };
  }

  return normalizeExtraction(result.data, input);
}