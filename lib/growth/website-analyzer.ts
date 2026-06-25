import { normalizeWebsiteUrl } from "@/lib/growth/domain-normalizer";

export type WebsiteAnalysisResult = {
  websiteUrl: string;
  websiteTitle: string | null;
  websiteMetaDescription: string | null;
  analyzedHomepageText: string | null;
  contactPageUrl: string | null;
  discoveredEmails: string[];
  discoveredPhones: string[];
  discoveredLinkedinUrls: string[];
};

const DEFAULT_TIMEOUT_MS = 4000;
const MAX_TEXT_LENGTH = 8000;
const MAX_PAGES_TO_FETCH = 2;

function createTimeoutSignal(timeoutMs: number) {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  return {
    signal: controller.signal,
    clear: () => clearTimeout(timeout),
  };
}

async function fetchHtml(url: string) {
  const { signal, clear } = createTimeoutSignal(DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; PactAnchorGrowthAgent/1.0; +https://www.pactanchor.com)",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      signal,
      cache: "no-store",
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status}`);
    }

    const contentType = response.headers.get("content-type") ?? "";

    if (!contentType.toLowerCase().includes("text/html")) {
      throw new Error(`URL did not return HTML: ${url}`);
    }

    return await response.text();
  } finally {
    clear();
  }
}

function decodeBasicHtmlEntities(input: string) {
  return input
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function stripHtml(html: string) {
  return decodeBasicHtmlEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  ).slice(0, MAX_TEXT_LENGTH);
}

function extractTitle(html: string) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match?.[1] ? decodeBasicHtmlEntities(match[1].trim()) : null;
}

function extractMetaDescription(html: string) {
  const match =
    html.match(
      /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/i
    ) ??
    html.match(
      /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["'][^>]*>/i
    );

  return match?.[1] ? decodeBasicHtmlEntities(match[1].trim()) : null;
}

function uniqueValues(values: string[]) {
  return Array.from(
    new Set(values.map((value) => value.trim()).filter(Boolean))
  );
}

function extractEmails(text: string) {
  const matches =
    text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) ?? [];

  return uniqueValues(
    matches
      .map((email) => email.toLowerCase())
      .filter((email) => {
        const blockedFragments = [
          ".png",
          ".jpg",
          ".jpeg",
          ".gif",
          ".webp",
          "example.com",
          "domain.com",
          "email.com",
          "yourname",
        ];

        return !blockedFragments.some((fragment) => email.includes(fragment));
      })
  );
}

function extractPhones(text: string) {
  const matches =
    text.match(
      /(?:\+?1[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}/g
    ) ?? [];

  return uniqueValues(matches);
}

function extractLinkedInUrls(html: string) {
  const matches =
    html.match(/https?:\/\/(?:www\.)?linkedin\.com\/[^"' <>)]+/gi) ?? [];

  return uniqueValues(
    matches.map((url) =>
      url
        .replace(/\/$/, "")
        .replace(/&amp;/g, "&")
        .trim()
    )
  );
}

function extractHrefValues(html: string) {
  const hrefs: string[] = [];
  const regex = /href=["']([^"']+)["']/gi;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(html)) !== null) {
    if (match[1]) hrefs.push(match[1]);
  }

  return hrefs;
}

function toAbsoluteUrl(href: string, baseUrl: string) {
  try {
    return new URL(href, baseUrl).toString();
  } catch {
    return null;
  }
}

function findLikelyContactPages(html: string, baseUrl: string) {
  const hrefs = extractHrefValues(html);

  const contactCandidates = hrefs
    .map((href) => toAbsoluteUrl(href, baseUrl))
    .filter((url): url is string => Boolean(url))
    .filter((url) => {
      const lower = url.toLowerCase();

      return (
        lower.includes("/contact") ||
        lower.includes("/about") ||
        lower.includes("/team") ||
        lower.includes("/our-team") ||
        lower.includes("/staff") ||
        lower.includes("/leadership")
      );
    });

  const base = new URL(baseUrl);
  const commonPaths = [
    "/contact",
    "/contact-us",
    "/about",
    "/about-us",
    "/team",
    "/our-team",
  ].map((path) => `${base.origin}${path}`);

  return uniqueValues([...contactCandidates, ...commonPaths]).slice(
    0,
    MAX_PAGES_TO_FETCH
  );
}

function chooseContactPageUrl(urls: string[]) {
  return (
    urls.find((url) => url.toLowerCase().includes("/contact")) ??
    urls[0] ??
    null
  );
}

export async function analyzeWebsite(
  inputUrl: string
): Promise<WebsiteAnalysisResult> {
  const websiteUrl = normalizeWebsiteUrl(inputUrl);

  if (!websiteUrl) {
    throw new Error("Invalid website URL");
  }

  const homepageHtml = await fetchHtml(websiteUrl);

  const websiteTitle = extractTitle(homepageHtml);
  const websiteMetaDescription = extractMetaDescription(homepageHtml);
  const homepageText = stripHtml(homepageHtml);

  const discoveredEmails = new Set<string>();
  const discoveredPhones = new Set<string>();
  const discoveredLinkedinUrls = new Set<string>();

  for (const email of extractEmails(`${homepageHtml} ${homepageText}`)) {
    discoveredEmails.add(email);
  }

  for (const phone of extractPhones(`${homepageHtml} ${homepageText}`)) {
    discoveredPhones.add(phone);
  }

  for (const linkedinUrl of extractLinkedInUrls(homepageHtml)) {
    discoveredLinkedinUrls.add(linkedinUrl);
  }

  const candidatePages = findLikelyContactPages(homepageHtml, websiteUrl);
  const fetchedContactPages: string[] = [];

  for (const pageUrl of candidatePages) {
    try {
      const html = await fetchHtml(pageUrl);
      const text = stripHtml(html);

      fetchedContactPages.push(pageUrl);

      for (const email of extractEmails(`${html} ${text}`)) {
        discoveredEmails.add(email);
      }

      for (const phone of extractPhones(`${html} ${text}`)) {
        discoveredPhones.add(phone);
      }

      for (const linkedinUrl of extractLinkedInUrls(html)) {
        discoveredLinkedinUrls.add(linkedinUrl);
      }
    } catch {
      // Some websites block /contact or /team. Continue with whatever we can extract.
    }
  }

  return {
    websiteUrl,
    websiteTitle,
    websiteMetaDescription,
    analyzedHomepageText: homepageText,
    contactPageUrl: chooseContactPageUrl(fetchedContactPages) ?? chooseContactPageUrl(candidatePages),
    discoveredEmails: Array.from(discoveredEmails).slice(0, 10),
    discoveredPhones: Array.from(discoveredPhones).slice(0, 10),
    discoveredLinkedinUrls: Array.from(discoveredLinkedinUrls).slice(0, 10),
  };
}