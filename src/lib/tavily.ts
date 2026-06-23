export type TavilySearchResult = {
  title: string;
  url: string;
  content: string;
  score?: number;
};

export type TavilySearchResponse = {
  query: string;
  results: TavilySearchResult[];
  answer?: string;
};

function getTavilyApiKey() {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    throw new Error("TAVILY_API_KEY is not configured");
  }
  return apiKey;
}

export function isTavilyConfigured() {
  return Boolean(process.env.TAVILY_API_KEY);
}

export async function searchWeb(
  query: string,
  maxResults = 10,
): Promise<TavilySearchResponse> {
  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      api_key: getTavilyApiKey(),
      query,
      search_depth: "advanced",
      max_results: maxResults,
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Tavily search request failed");
  }

  const data = (await response.json()) as {
    query?: string;
    results?: TavilySearchResult[];
    answer?: string;
  };

  return {
    query: data.query ?? query,
    results: data.results ?? [],
    answer: data.answer,
  };
}
