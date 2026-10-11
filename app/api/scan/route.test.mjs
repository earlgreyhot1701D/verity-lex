/** Verifies the scan API contract, validation gate, cached default, and structured failures. */

import assert from "node:assert/strict";
import test from "node:test";
import { GET, POST } from "./route.ts";

const validBody = {
  institution: "Santa Barbara Superior Court",
  targetDomain: "santabarbara.courts.ca.gov",
};

test("GET returns the cached Santa Barbara scan", async () => {
  const response = await GET();
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.institution, validBody.institution);
  assert.ok(body.findings.length > 0);
});

test("POST reports missing configuration instead of scoring a stub scan", async () => {
  const savedKey = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;
  const response = await POST(jsonRequest(validBody, "192.0.2.10"));
  if (savedKey === undefined) delete process.env.OPENAI_API_KEY;
  else process.env.OPENAI_API_KEY = savedKey;
  const body = await response.json();

  assert.equal(response.status, 503);
  assert.equal(body.error.code, "SCAN_NOT_CONFIGURED");
});

test("POST exposes quota exhaustion without raw provider details", async () => {
  const savedFetch = globalThis.fetch;
  const savedOpenAI = process.env.OPENAI_API_KEY;
  const savedTavily = process.env.TAVILY_API_KEY;
  process.env.OPENAI_API_KEY = "test-only-placeholder";
  process.env.TAVILY_API_KEY = "test-only-placeholder";
  globalThis.fetch = async () => Response.json({ error: { message: "You have no credits remaining.", type: "insufficient_quota", code: "insufficient_quota" } }, { status: 429 });
  try {
    const response = await POST(jsonRequest(validBody, "192.0.2.14"));
    assert.equal(response.status, 503);
    const body = await response.json();
    assert.equal(body.error.code, "PROVIDER_QUOTA");
    assert.match(body.error.message, /cached sample/);
    assert.ok(!body.error.message.includes("test-only-placeholder"));
  } finally {
    globalThis.fetch = savedFetch;
    if (savedOpenAI === undefined) delete process.env.OPENAI_API_KEY; else process.env.OPENAI_API_KEY = savedOpenAI;
    if (savedTavily === undefined) delete process.env.TAVILY_API_KEY; else process.env.TAVILY_API_KEY = savedTavily;
  }
});

test("POST rejects empty input", async () => {
  const response = await POST(jsonRequest({ institution: " ", targetDomain: "" }, "192.0.2.11"));
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.error.code, "INVALID_INPUT");
  assert.match(body.error.message, /institution/i);
});

test("POST rejects a malformed target domain", async () => {
  const response = await POST(jsonRequest({ ...validBody, targetDomain: "https://example.com/path" }, "192.0.2.12"));
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.error.code, "INVALID_INPUT");
  assert.match(body.error.message, /domain/i);
});

test("POST blocks unsupported courts before calling providers", async () => {
  const response = await POST(jsonRequest({ ...validBody, targetDomain: "example.com" }, "192.0.2.13"));
  assert.equal(response.status, 400);
  assert.equal((await response.json()).error.code, "UNSUPPORTED_COURT");
});

test("POST returns structured JSON 429 over the per-IP limit", async () => {
  let response;
  for (let request = 0; request < 6; request += 1) {
    response = await POST(jsonRequest(validBody, "192.0.2.99"));
  }
  const body = await response.json();

  assert.equal(response.status, 429);
  assert.equal(body.error.code, "RATE_LIMITED");
  assert.match(body.error.message, /too many/i);
});

test("POST returns meaningful JSON for an unreadable request", async () => {
  const response = await POST(new Request("http://localhost/api/scan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{",
  }));
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.error.code, "INVALID_JSON");
  assert.ok(body.error.message.length > 0);
});

function jsonRequest(body, ip = "192.0.2.20") {
  return new Request("http://localhost/api/scan", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify(body),
  });
}
