/** Proves an audit bundle contains enough registry evidence to recompute its deterministic score. */

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { evaluate } from "../ruleEngine/evaluate.ts";
import { buildAuditBundle, toDownload } from "./export.ts";

const registry = JSON.parse(await readFile(new URL("../../data/registry.v1.json", import.meta.url), "utf8"));
const fixtures = JSON.parse(await readFile(new URL("../../data/rule-engine.fixtures.json", import.meta.url), "utf8"));
const fixture = fixtures.fixtures[0];
const evaluated = evaluate(fixture.input.institution, fixture.input.signals, registry);
const generatedAt = "2026-07-19T12:00:00.000Z";
const scan = {
  ...evaluated,
  state: "draft",
  findings: evaluated.findings.map((finding) => finding.status === "found"
    ? { ...finding, source: { url: `https://example.gov/${finding.artifactId}`, quotedSpan: "Public evidence", fetchedAt: generatedAt } }
    : finding),
  coverageCaveat: "Public evidence only.",
  generatedAt,
  runLog: [],
};

test("bundle includes every finding, source, registry weight, and authority", () => {
  const bundle = buildAuditBundle(scan, registry.version);

  assert.deepEqual(bundle.findings, scan.findings);
  assert.deepEqual(bundle.unseen, scan.unseen);
  assert.equal(bundle.registry.version, registry.version);
  assert.equal(bundle.generatedAt, generatedAt);
  assert.equal(bundle.registry.artifacts.length, registry.artifacts.length);
  for (const artifact of registry.artifacts) {
    const bundled = bundle.registry.artifacts.find((item) => item.artifactId === artifact.id);
    assert.equal(bundled.weight, artifact.weight);
    assert.deepEqual(bundled.authority, artifact.authority);
  }
});

test("bundled score matches evaluate and can be recomputed from bundle fields", () => {
  const bundle = buildAuditBundle(scan, registry.version);
  const recomputed = { A: 0, B: 0, C: 0 };
  for (const finding of bundle.findings) {
    if (finding.status !== "found" && finding.status !== "verified") continue;
    const artifact = bundle.registry.artifacts.find((item) => item.artifactId === finding.artifactId);
    recomputed[artifact.dimension] += artifact.weight * finding.coverage;
  }

  assert.deepEqual(bundle.score, evaluated.score);
  assert.deepEqual(recomputed, evaluated.score.byDimension);
  assert.equal(Object.values(recomputed).reduce((sum, value) => sum + value, 0), evaluated.score.points);
});

test("download payload is named JSON containing the bundle", () => {
  const bundle = buildAuditBundle(scan, registry.version);
  const download = toDownload(bundle);

  assert.match(download.filename, /^verity-lex-santa-barbara-superior-court-.*\.json$/);
  assert.deepEqual(JSON.parse(download.blobText), bundle);
});
