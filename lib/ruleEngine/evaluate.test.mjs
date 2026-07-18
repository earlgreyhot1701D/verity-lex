import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { evaluate } from "./evaluate.ts";

const registry = JSON.parse(await readFile(new URL("../../data/registry.v1.json", import.meta.url), "utf8"));
const acceptance = JSON.parse(await readFile(new URL("../../data/rule-engine.fixtures.json", import.meta.url), "utf8"));

for (const fixture of acceptance.fixtures) {
  const result = evaluate(fixture.input.institution, fixture.input.signals, registry);
  const expected = fixture.expected;

  assert.deepEqual(result.score, expected.score, `${fixture.name}: score`);

  if (expected.statuses) {
    for (const [artifactId, status] of Object.entries(expected.statuses)) {
      assert.equal(statusFor(result, artifactId), status, `${fixture.name}: status ${artifactId}`);
    }
  }

  if (expected.coverage) {
    for (const [artifactId, coverage] of Object.entries(expected.coverage)) {
      assert.equal(coverageFor(result, artifactId), coverage, `${fixture.name}: coverage ${artifactId}`);
    }
  }

  if (expected.unseen) {
    assert.deepEqual(result.unseen, expected.unseen, `${fixture.name}: unseen`);
  }

  if (expected.unseen_includes) {
    for (const artifactId of expected.unseen_includes) {
      assert.ok(result.unseen.includes(artifactId), `${fixture.name}: unseen includes ${artifactId}`);
    }
  }

  if (expected.unseen_count !== undefined) {
    assert.equal(result.unseen.length, expected.unseen_count, `${fixture.name}: unseen count`);
  }
}

console.log(`rule engine fixtures passed: ${acceptance.fixtures.length}`);

function statusFor(result, artifactId) {
  return result.findings.find((finding) => finding.artifactId === artifactId)?.status;
}

function coverageFor(result, artifactId) {
  return result.findings.find((finding) => finding.artifactId === artifactId)?.coverage;
}
