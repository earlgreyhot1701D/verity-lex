/** Prevents the shipped sample from drifting away from the published registry and audit math. */
import assert from "node:assert/strict";
import test from "node:test";
import { cachedSantaBarbaraScan as scan } from "./mockScan.ts";
import registry from "./registry.v1.json" with { type: "json" };
import { evaluate } from "../lib/ruleEngine/evaluate.ts";
test("sample covers every registry artifact and recomputes exactly", () => {
  assert.deepEqual(scan.findings.map((finding) => finding.artifactId), registry.artifacts.map((artifact) => artifact.id));
  const scored = evaluate(scan.institution, scan.findings.map((finding) => ({
    artifactId: finding.artifactId, present: finding.status === "found", hasSource: Boolean(finding.source), elementsPresent: finding.elementsPresent,
  })), registry);
  assert.deepEqual(scan.score, scored.score);
  assert.deepEqual(scan.unseen, scored.unseen);
  assert.equal(scan.score.points, 37.2);
  assert.ok(scan.findings.every((finding) => finding.status !== "verified"));
});
