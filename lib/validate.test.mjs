/** Verifies shared scan-input validation for both browser and server callers. */

import assert from "node:assert/strict";
import test from "node:test";
import { validateScanInput } from "./validate.ts";

test("accepts and normalizes valid scan input", () => {
  assert.deepEqual(validateScanInput(" Santa Barbara Superior Court ", "SantaBarbara.Courts.CA.GOV "), {
    ok: true,
    value: { institution: "Santa Barbara Superior Court", targetDomain: "santabarbara.courts.ca.gov" },
  });
});

test("rejects an empty institution", () => {
  assert.match(validateScanInput(" ", "example.gov").error, /institution/i);
});

test("rejects malformed domains, protocols, and paths", () => {
  for (const domain of ["localhost", "https://example.gov", "example.gov/path", "-bad.gov"]) {
    const result = validateScanInput("Court", domain);
    assert.equal(result.ok, false, domain);
    assert.match(result.error, /domain/i);
  }
});
