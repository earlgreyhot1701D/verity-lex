/** Fetch tool for reading public source documents as untrusted text through Tavily Extract, with bounded timeout and safe error states. */

import { logFailure } from "../../failureLog";

export interface FetchResult {
  ok: boolean;
  url: string;
  text: string;
  fetchedAt: string;
  error?: string;
}

const TAVILY_EXTRACT_URL = "https://api.tavily.com/extract";

export async function fetchPublicSource(url: string, timeoutMs = 10_000): Promise<FetchResult> {
  const fetchedAt = new Date().toISOString();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(TAVILY_EXTRACT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.TAVILY_API_KEY ?? ""}`,
      },
      body: JSON.stringify({ urls: [url], extract_depth: "basic" }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Tavily extract failed: ${response.status}`);
    }

    const payload = (await response.json()) as { results?: Array<{ raw_content?: string; content?: string }> };
    const text = payload.results?.[0]?.raw_content ?? payload.results?.[0]?.content ?? "";
    return { ok: true, url, text: wrapUntrusted(text), fetchedAt };
  } catch (error) {
    const failure = logFailure("fetch", error, { url });
    return { ok: false, url, text: "", fetchedAt, error: failure.message };
  } finally {
    clearTimeout(timeout);
  }
}

function wrapUntrusted(text: string): string {
  return `<UNTRUSTED_DOCUMENT_TEXT>\n${text}\n</UNTRUSTED_DOCUMENT_TEXT>`;
}
