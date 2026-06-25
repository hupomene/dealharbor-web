export type SearchProviderResult = {
  title: string;
  link: string;
  snippet: string | null;
  position: number | null;
  source: string | null;
};

type SerpApiOrganicResult = {
  position?: number;
  title?: string;
  link?: string;
  snippet?: string;
  source?: string;
};

type SerpApiResponse = {
  organic_results?: SerpApiOrganicResult[];
  search_metadata?: {
    status?: string;
    google_url?: string;
  };
  error?: string;
};

export async function searchWithSerpApi(params: {
  query: string;
  location?: string | null;
  maxResults?: number;
}): Promise<{
  results: SearchProviderResult[];
  rawResponse: SerpApiResponse;
}> {
  const apiKey = process.env.SERPAPI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing SERPAPI_API_KEY");
  }

  const maxResults = Math.min(Math.max(params.maxResults ?? 10, 1), 100);

  const searchParams = new URLSearchParams({
  engine: "google",
  q: params.query,
  api_key: apiKey,
  hl: "en",
  gl: "us",
  num: String(maxResults),
});

// Do not send SerpAPI location for now.
// Some plain values like "Frisco, TX" or "Plano, TX" can cause SerpAPI 400.
// The location is already included in the search query itself.

  const response = await fetch(`https://serpapi.com/search.json?${searchParams.toString()}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`SerpAPI request failed with status ${response.status}`);
  }

  const json = (await response.json()) as SerpApiResponse;

  if (json.error) {
    throw new Error(json.error);
  }

  const results =
    json.organic_results
      ?.filter((item) => item.link && item.title)
      .map((item) => ({
        title: item.title ?? "Untitled result",
        link: item.link ?? "",
        snippet: item.snippet ?? null,
        position: item.position ?? null,
        source: item.source ?? null,
      })) ?? [];

  return {
    results: results.slice(0, maxResults),
    rawResponse: json,
  };
}