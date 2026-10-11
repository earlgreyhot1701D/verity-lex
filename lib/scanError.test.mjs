/** Verifies actionable provider errors never expose raw provider messages or credentials. */
import assert from "node:assert/strict";
import test from "node:test";
import { scanError } from "./scanError.ts";
test("quota exhaustion is distinguished from temporary rate limits", () => {
  assert.equal(scanError(new Error("openai 429: You have no credits remaining.")).code, "PROVIDER_QUOTA");
  assert.equal(scanError(new Error("openai 429: rate limit")).code, "PROVIDER_BUSY");
});
test("authentication, deadlines, and unknown errors are safe", () => {
  assert.equal(scanError(new Error("Tavily search failed: 401")).status, 503);
  assert.equal(scanError(new Error("Scan deadline exceeded")).status, 504);
  assert.ok(!scanError(new Error("private provider detail")).message.includes("private"));
});
