/** Discovery tool for finding public official-domain source URLs via Tavily Search; provenance remains the source URL, never Tavily. */

import { logFailure } from "../../failureLog";

export interface DiscoveryResult {
  title: string;
  url: string;
  snippet: string;
}

const TAVILY_SEARCH_URL = "https://api.tavily.com/search";

export async function discoverOfficialSources(query: string, targetDomain: string, maxResults = 5): Promise<DiscoveryResult[]> {
  try {
    const response = await fetch(TAVILY_SEARCH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.TAVILY_API_KEY ?? ""}`,
      },
      body: JSON.stringify({ query: `${query} site:${targetDomain}`, max_results: maxResults }),
    });

    if (!response.ok) {
      throw new Error(`Tavily search failed: ${response.status}`);
    }

    const payload = (await response.json()) as { results?: Array<{ title?: string; url?: string; content?: string }> };
    return (payload.results ?? []).filter(isOfficial(targetDomain)).map((result) => ({
      title: result.title ?? result.url ?? "Untitled source",
      url: result.url ?? "",
      snippet: result.content ?? "",
    }));
  } catch (error) {
    logFailure("discover", error, { query, targetDomain });
    return [];
  }
}

function isOfficial(targetDomain: string) {
  return (result: { url?: string }) => {
    if (!result.url) {
      return false;
    }

    const hostname = new URL(result.url).hostname;
    return hostname === targetDomain || hostname.endsWith(`.${targetDomain}`);
  };
}
