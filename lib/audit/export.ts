/** Builds a self-contained, JSON-serializable audit record from one deterministic scan. */

import registryData from "../../data/registry.v1.json" with { type: "json" };
import type { Artifact, Finding, ScanResult } from "../types.ts";

interface AuditArtifact {
  artifactId: string;
  name: string;
  dimension: Artifact["dimension"];
  weight: number;
  authority: Artifact["authority"];
}

export interface AuditBundle {
  institution: string;
  state: ScanResult["state"];
  findings: Finding[];
  unseen: string[];
  score: ScanResult["score"];
  registry: {
    version: string;
    artifacts: AuditArtifact[];
  };
  generatedAt: string;
}

export interface AuditDownload {
  filename: string;
  blobText: string;
}

const artifacts = registryData.artifacts as Artifact[];

export function buildAuditBundle(scan: ScanResult, registryVersion: string): AuditBundle {
  return {
    institution: scan.institution,
    state: scan.state,
    findings: scan.findings.map((finding) => ({
      ...finding,
      ...(finding.source ? { source: { ...finding.source } } : {}),
      ...(finding.elementsPresent ? { elementsPresent: [...finding.elementsPresent] } : {}),
    })),
    unseen: [...scan.unseen],
    score: {
      ...scan.score,
      byDimension: { ...scan.score.byDimension },
    },
    registry: {
      version: registryVersion,
      artifacts: artifacts.map((artifact) => ({
        artifactId: artifact.id,
        name: artifact.name,
        dimension: artifact.dimension,
        weight: artifact.weight,
        authority: { ...artifact.authority },
      })),
    },
    generatedAt: scan.generatedAt,
  };
}

export function toDownload(bundle: AuditBundle): AuditDownload {
  const institution = bundle.institution
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const date = bundle.generatedAt.slice(0, 10);
  return {
    filename: `verity-lex-${institution || "audit"}-${date}.json`,
    blobText: `${JSON.stringify(bundle, null, 2)}\n`,
  };
}
