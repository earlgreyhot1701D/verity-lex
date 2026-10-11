/** Exercises retrieval failures with mocked HTTP, without contacting paid providers. */
import assert from "node:assert/strict";
import test from "node:test";
import { discoverOfficialSources } from "./discover.ts";
import { fetchPublicSource } from "./fetch.ts";
test("search authentication errors propagate instead of looking like no evidence", async () => {
  const saved = globalThis.fetch;
  globalThis.fetch = async () => new Response("", { status: 401 });
  try { await assert.rejects(discoverOfficialSources("policy", "example.gov"), /401/); }
  finally { globalThis.fetch = saved; }
});
test("extract refuses successful HTTP with no document content", async () => {
  const saved = globalThis.fetch;
  globalThis.fetch = async () => Response.json({ results: [], failed_results: [{ url: "https://example.gov/policy" }] });
  try { assert.equal((await fetchPublicSource("https://example.gov/policy")).ok, false); }
  finally { globalThis.fetch = saved; }
});
