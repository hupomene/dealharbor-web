export function normalizeDomain(inputUrl: string | null | undefined) {
  if (!inputUrl) return null;

  try {
    const url = new URL(inputUrl.startsWith("http") ? inputUrl : `https://${inputUrl}`);

    let hostname = url.hostname.toLowerCase().trim();

    if (hostname.startsWith("www.")) {
      hostname = hostname.slice(4);
    }

    return hostname || null;
  } catch {
    return null;
  }
}

export function normalizeWebsiteUrl(inputUrl: string | null | undefined) {
  if (!inputUrl) return null;

  try {
    const url = new URL(inputUrl.startsWith("http") ? inputUrl : `https://${inputUrl}`);

    url.hash = "";

    return url.toString();
  } catch {
    return null;
  }
}

export function normalizeCompanyName(title: string | null | undefined) {
  if (!title) return "Unknown Organization";

  return title
    .replace(/\s*[-|–]\s*.*$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function shouldSkipDomain(domain: string | null) {
  if (!domain) return true;

  const blockedDomains = [
    "google.com",
    "facebook.com",
    "instagram.com",
    "linkedin.com",
    "youtube.com",
    "yelp.com",
    "bbb.org",
    "mapquest.com",
    "yellowpages.com",
    "manta.com",
    "zoominfo.com",
    "crunchbase.com",
    "bizbuysell.com",
    "businessesforsale.com",
    "loopnet.com",
    "crexi.com",
    "realtor.com",
    "zillow.com",
  ];

  return blockedDomains.some(
    (blocked) => domain === blocked || domain.endsWith(`.${blocked}`)
  );
}