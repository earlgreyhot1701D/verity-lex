/** Verifies the deterministic fixed-window limiter without clocks or network calls. */

import assert from "node:assert/strict";
import test from "node:test";
import { createRateLimiter } from "./rateLimit.ts";

test("rejects requests over the per-IP limit", () => {
  const limiter = createRateLimiter({ limit: 2, windowMs: 1_000 });
  assert.equal(limiter.check("192.0.2.1", 0).allowed, true);
  assert.equal(limiter.check("192.0.2.1", 1).allowed, true);
  assert.equal(limiter.check("192.0.2.1", 2).allowed, false);
});

test("starts a new allowance after the window", () => {
  const limiter = createRateLimiter({ limit: 1, windowMs: 1_000 });
  assert.equal(limiter.check("192.0.2.2", 0).allowed, true);
  assert.equal(limiter.check("192.0.2.2", 999).allowed, false);
  assert.equal(limiter.check("192.0.2.2", 1_000).allowed, true);
});
