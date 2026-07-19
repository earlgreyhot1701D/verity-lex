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

test("POST runs a valid scan through the stubbed agent", async () => {
  const response = await POST(jsonRequest(validBody));
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.institution, validBody.institution);
  assert.equal(body.state, "draft");
  assert.ok(body.runLog.some((step) => step.tool === "evaluate"));
});

test("POST rejects empty input", async () => {
  const response = await POST(jsonRequest({ institution: " ", targetDomain: "" }));
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.error.code, "INVALID_INPUT");
  assert.match(body.error.message, /institution/i);
});

test("POST rejects a malformed target domain", async () => {
  const response = await POST(jsonRequest({ ...validBody, targetDomain: "https://example.com/path" }));
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.error.code, "INVALID_INPUT");
  assert.match(body.error.message, /domain/i);
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

function jsonRequest(body) {
  return new Request("http://localhost/api/scan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
