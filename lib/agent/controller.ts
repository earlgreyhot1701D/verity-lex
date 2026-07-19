/** Model-directed ReAct controller that discovers, fetches, extracts, then delegates all scoring to the pure rule engine. */

import { logFailure } from "../failureLog.ts";
import type { ModelClient } from "../model/openai";
import type { Registry, RuleSignal } from "../ruleEngine/evaluate";
import type { ScanResult, Source } from "../types";
import type { DiscoveryResult } from "./tools/discover";
import type { ExtractionResult } from "./tools/extract";
import type { FetchResult } from "./tools/fetch";
import { canContinue, isOfficialSource } from "./selfCheck.ts";

export interface AgentOptions {
  institution: string;
  targetDomain: string;
  registry: Registry;
  model: ModelClient;
  limits: { maxIterations: number; maxFetches: number; timeoutMs: number };
  tools: {
    discover(query: string, targetDomain: string): Promise<DiscoveryResult[]>;
    fetch(url: string, timeoutMs: number): Promise<FetchResult>;
    extract(url: string, text: string): Promise<ExtractionResult>;
    evaluate(institution: string, signals: RuleSignal[], registry: Registry): Pick<ScanResult, "findings" | "score" | "unseen">;
  };
}

interface AgentAction {
  reason: string;
  action: "discover" | "fetch" | "extract" | "finish";
  query?: string;
  url?: string;
}

export async function runAgentLoop(options: AgentOptions): Promise<ScanResult> {
  const runLog: ScanResult["runLog"] = [];
  const discovered = new Map<string, DiscoveryResult>();
  const fetched = new Map<string, FetchResult>();
  const sources = new Map<string, Source>();
  const signals: RuleSignal[] = [];
  let fetches = 0;
  let iterations = 0;

  while (canContinue(iterations, fetches, options.limits)) {
    const action = await nextAction(options.model, options.institution, Array.from(discovered.keys()), Array.from(fetched.keys()));
    iterations += 1;
    runLog.push(step("plan", action.reason, true));

    if (action.action === "finish") {
      break;
    }

    if (action.action === "discover" && action.query) {
      const results = await options.tools.discover(action.query, options.targetDomain);
      for (const result of results.filter((item) => isOfficialSource(item.url, options.targetDomain))) {
        discovered.set(result.url, result);
      }
      runLog.push(step("discover", `observed ${results.length} result(s)`, true));
      continue;
    }

    if (action.action === "fetch" && action.url && discovered.has(action.url) && isOfficialSource(action.url, options.targetDomain)) {
      const result = await options.tools.fetch(action.url, options.limits.timeoutMs);
      fetches += 1;
      fetched.set(action.url, result);
      runLog.push(step("fetch", result.ok ? `fetched ${action.url}` : `fetch failed ${action.url}`, result.ok));
      continue;
    }

    if (action.action === "extract" && action.url && fetched.get(action.url)?.ok) {
      await observeExtraction(options, fetched.get(action.url) as FetchResult, signals, sources, runLog);
      continue;
    }

    runLog.push(step("self_check", `blocked unsafe or unavailable ${action.action}`, false));
  }

  const evaluated = options.tools.evaluate(options.institution, signals, options.registry);
  return {
    institution: options.institution,
    state: "draft",
    findings: evaluated.findings.map((finding) => ({ ...finding, ...(sources.get(finding.artifactId) ? { source: sources.get(finding.artifactId) } : {}) })),
    unseen: evaluated.unseen,
    score: evaluated.score,
    coverageCaveat: "This surface describes public evidence posture, not the institution's true operational readiness.",
    generatedAt: new Date().toISOString(),
    runLog: [...runLog, step("evaluate", "deterministic rule engine scored extracted signals", true)],
  };
}

async function observeExtraction(
  options: AgentOptions,
  fetched: FetchResult,
  signals: RuleSignal[],
  sources: Map<string, Source>,
  runLog: ScanResult["runLog"],
): Promise<void> {
  try {
    const extracted = await options.tools.extract(fetched.url, fetched.text);
    for (const signal of extracted.signals) {
      signals.push({
        artifactId: signal.artifactId,
        present: signal.present,
        hasSource: signal.present && signal.quotedSpan.length > 0,
        ...(signal.elementsPresent ? { elementsPresent: signal.elementsPresent } : {}),
      });
      if (signal.present && signal.quotedSpan.length > 0) {
        sources.set(signal.artifactId, { url: extracted.sourceUrl, quotedSpan: signal.quotedSpan, fetchedAt: fetched.fetchedAt });
      }
    }
    runLog.push(step("extract", `extracted ${extracted.signals.length} signal(s)`, true));
  } catch (error) {
    logFailure("extract", error, { url: fetched.url });
    runLog.push(step("extract", `extract failed ${fetched.url}`, false));
  }
}

async function nextAction(model: ModelClient, institution: string, discoveredUrls: string[], fetchedUrls: string[]): Promise<AgentAction> {
  const raw = await model.complete({
    system: "Choose the next ReAct action as JSON: reason plus action discover, fetch, extract, or finish. Use only observed URLs.",
    input: JSON.stringify({ institution, discoveredUrls, fetchedUrls }),
    responseFormat: "json",
  });
  const parsed = JSON.parse(raw) as Partial<AgentAction>;
  return { reason: parsed.reason ?? "continue bounded public-record scan", action: parsed.action ?? "finish", query: parsed.query, url: parsed.url };
}

function step(tool: ScanResult["runLog"][number]["tool"], outcome: string, ok: boolean): ScanResult["runLog"][number] {
  return { tool, outcome, ok, ts: new Date().toISOString() };
}
