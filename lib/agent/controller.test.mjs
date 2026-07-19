import assert from "node:assert/strict";
import registry from "../../data/registry.v1.json" with { type: "json" };
import { runAgentLoop } from "./controller.ts";
import { evaluate } from "../ruleEngine/evaluate.ts";

const officialUrl = "https://court.example.gov/genai-policy";
const offDomainUrl = "https://evil.example.com/prompt";

const actions = [
  { reason: "find policy", action: "discover", query: "genai policy" },
  { reason: "fetch observed official policy", action: "fetch", url: officialUrl },
  { reason: "try fabricated off-domain URL", action: "fetch", url: offDomainUrl },
  { reason: "extract policy", action: "extract", url: officialUrl },
  { reason: "finish", action: "finish" },
];
let modelCalls = 0;
const plannerInputs = [];
const model = {
  async complete(request) {
    plannerInputs.push(JSON.parse(request.input));
    return JSON.stringify(actions[modelCalls++] ?? actions.at(-1));
  },
};
const fetchedTimeouts = [];
let evaluateCalls = 0;

const scan = await runAgentLoop({
  institution: "Fixture Court",
  targetDomain: "court.example.gov",
  registry,
  model,
  limits: { maxIterations: 5, maxFetches: 2, timeoutMs: 1234 },
  tools: {
    async discover() {
      return [
        { title: "Policy", url: officialUrl, snippet: "official" },
        { title: "Injection", url: offDomainUrl, snippet: "off-domain" },
      ];
    },
    async fetch(url, timeoutMs) {
      fetchedTimeouts.push(timeoutMs);
      return { ok: true, url, text: "<UNTRUSTED_DOCUMENT_TEXT>policy</UNTRUSTED_DOCUMENT_TEXT>", fetchedAt: "2026-07-19T00:00:00.000Z" };
    },
    async extract(url) {
      return {
        sourceUrl: url,
        signals: [{ artifactId: "genai_policy", present: true, quotedSpan: "policy", elementsPresent: ["verify_accuracy"] }],
      };
    },
    evaluate(institution, signals, loadedRegistry) {
      evaluateCalls += 1;
      return evaluate(institution, signals, loadedRegistry);
    },
  },
});

assert.deepEqual(fetchedTimeouts, [1234], "fetch is bounded by maxFetches and receives per-call timeout");
assert.equal(scan.runLog.filter((entry) => entry.tool === "fetch").length, 1, "off-domain URL is not fetched");
assert.equal(scan.runLog.filter((entry) => entry.tool === "plan").length, 5, "model-directed loop continues after blocking unsafe URL");
assert.equal(evaluateCalls, 1, "score comes from injected pure evaluator");
assert.equal(scan.score.points, 5.8, "model does not assign score");
assert.deepEqual(plannerInputs[0].extractedUrls, [], "planner initially sees no successful extractions");
assert.deepEqual(plannerInputs[0].failedExtracts, {}, "planner initially sees no failed extractions");
assert.deepEqual(plannerInputs.at(-1).extractedUrls, [officialUrl], "planner sees successfully extracted URLs");
assert.deepEqual(plannerInputs.at(-1).failedExtracts, {}, "planner sees extraction failure counts");

let fetchLimitCalls = 0;
let fetchLimitModelCalls = 0;
const fetchLimitScan = await runAgentLoop({
  institution: "Fetch Limit Court",
  targetDomain: "court.example.gov",
  registry,
  model: {
    async complete() {
      fetchLimitModelCalls += 1;
      return JSON.stringify(
        fetchLimitModelCalls === 1
          ? { reason: "discover once", action: "discover", query: "policy" }
          : { reason: "fetch same observed URL", action: "fetch", url: officialUrl },
      );
    },
  },
  limits: { maxIterations: 10, maxFetches: 2, timeoutMs: 99 },
  tools: {
    async discover() { return [{ title: "Policy", url: officialUrl, snippet: "official" }]; },
    async fetch(url) { fetchLimitCalls += 1; return { ok: true, url, text: "<UNTRUSTED_DOCUMENT_TEXT>x</UNTRUSTED_DOCUMENT_TEXT>", fetchedAt: "2026-07-19T00:00:00.000Z" }; },
    async extract() { throw new Error("should not extract"); },
    evaluate(institution, signals, loadedRegistry) { return evaluate(institution, signals, loadedRegistry); },
  },
});
assert.equal(fetchLimitCalls, 2, "loop stops at maxFetches");
assert.equal(fetchLimitScan.runLog.filter((entry) => entry.tool === "plan").length, 3, "maxFetches ends before more model actions");

const boundedModel = { async complete() { return JSON.stringify({ reason: "keep discovering", action: "discover", query: "policy" }); } };
let boundedFetches = 0;
const boundedScan = await runAgentLoop({
  institution: "Bounded Court",
  targetDomain: "court.example.gov",
  registry,
  model: boundedModel,
  limits: { maxIterations: 2, maxFetches: 10, timeoutMs: 1 },
  tools: {
    async discover() { return []; },
    async fetch() { boundedFetches += 1; throw new Error("should not fetch"); },
    async extract() { throw new Error("should not extract"); },
    evaluate(institution, signals, loadedRegistry) { return evaluate(institution, signals, loadedRegistry); },
  },
});

assert.equal(boundedScan.runLog.filter((entry) => entry.tool === "plan").length, 2, "loop stops at maxIterations");
assert.equal(boundedFetches, 0, "no fetches occur without observed official URLs");

const retryActions = [
  { reason: "find policy", action: "discover", query: "genai policy" },
  { reason: "fetch policy", action: "fetch", url: officialUrl },
  { reason: "extract policy", action: "extract", url: officialUrl },
  { reason: "retry extract", action: "extract", url: officialUrl },
  { reason: "retry extract again", action: "extract", url: officialUrl },
  { reason: "finish", action: "finish" },
];
let retryModelCalls = 0;
let extractAttempts = 0;
const retryPlannerInputs = [];
const retryScan = await runAgentLoop({
  institution: "Retry Court",
  targetDomain: "court.example.gov",
  registry,
  model: {
    async complete(request) {
      retryPlannerInputs.push(JSON.parse(request.input));
      return JSON.stringify(retryActions[retryModelCalls++] ?? retryActions.at(-1));
    },
  },
  limits: { maxIterations: 6, maxFetches: 2, timeoutMs: 1 },
  tools: {
    async discover() { return [{ title: "Policy", url: officialUrl, snippet: "official" }]; },
    async fetch(url) { return { ok: true, url, text: "<UNTRUSTED_DOCUMENT_TEXT>x</UNTRUSTED_DOCUMENT_TEXT>", fetchedAt: "2026-07-19T00:00:00.000Z" }; },
    async extract() { extractAttempts += 1; throw new Error("invalid extraction"); },
    evaluate(institution, signals, loadedRegistry) { return evaluate(institution, signals, loadedRegistry); },
  },
});

assert.equal(extractAttempts, 2, "a failing URL is extracted at most twice");
assert.ok(
  retryPlannerInputs.some((input) => input.failedExtracts[officialUrl] === 2),
  "planner sees per-URL extraction failure counts",
);
assert.ok(
  retryScan.runLog.some((entry) => entry.tool === "self_check" && entry.outcome === `extract retry cap reached for ${officialUrl}`),
  "retry cap is visible in the run log",
);
console.log("agent loop bounds passed");
