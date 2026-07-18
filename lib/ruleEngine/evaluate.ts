/** Pure rule-engine evaluator for Themis Atlas artifact signals; it assigns deterministic readiness scores without model input. */

import type { Artifact, Finding, ScanResult } from "../types";

export interface RuleSignal {
  artifactId: string;
  present: boolean;
  hasSource: boolean;
  elementsPresent?: string[];
}

export interface Registry {
  artifacts: Artifact[];
}

const DIMENSIONS = ["A", "B", "C"] as const;

export function evaluate(
  institution: string,
  signals: RuleSignal[],
  registry: Registry,
): Pick<ScanResult, "institution" | "findings" | "unseen" | "score"> {
  const signalByArtifact = new Map(signals.map((signal) => [signal.artifactId, signal]));
  const findings = registry.artifacts.map((artifact) => buildFinding(artifact, signalByArtifact.get(artifact.id)));
  const unseen = findings.filter((finding) => finding.status === "not_located").map((finding) => finding.artifactId);
  const byDimension = Object.fromEntries(
    DIMENSIONS.map((dimension) => [
      dimension,
      roundOne(
        findings.reduce((sum, finding) => {
          const artifact = registry.artifacts.find((item) => item.id === finding.artifactId);
          return artifact?.dimension === dimension ? sum + pointsFor(artifact, finding) : sum;
        }, 0),
      ),
    ]),
  ) as ScanResult["score"]["byDimension"];

  return {
    institution,
    findings,
    unseen,
    score: {
      points: roundOne(Object.values(byDimension).reduce((sum, points) => sum + points, 0)),
      outOf: 100,
      byDimension,
    },
  };
}

function buildFinding(artifact: Artifact, signal?: RuleSignal): Finding {
  const hasLocatedSource = signal?.present === true && signal.hasSource === true;
  const elementsPresent = signal?.elementsPresent ?? [];
  const coverage = artifact.elements ? elementCoverage(elementsPresent, artifact.elements) : hasLocatedSource ? 1 : 0;

  return {
    artifactId: artifact.id,
    status: hasLocatedSource ? "found" : "not_located",
    coverage: hasLocatedSource ? coverage : 0,
    ...(elementsPresent.length > 0 ? { elementsPresent } : {}),
  };
}

function elementCoverage(elementsPresent: string[], requiredElements: string[]): number {
  const present = new Set(elementsPresent);
  const matchingCount = requiredElements.filter((element) => present.has(element)).length;
  return matchingCount / requiredElements.length;
}

function pointsFor(artifact: Artifact, finding: Finding): number {
  return finding.status === "found" || finding.status === "verified" ? artifact.weight * finding.coverage : 0;
}

function roundOne(value: number): number {
  return Math.round((value + Number.EPSILON) * 10) / 10;
}
