/** Shared product contracts copied without widening from the supplied source of truth. */

export type Tier = "required" | "recommended";
export type FindingStatus = "found" | "not_located" | "verified";

export interface Artifact {
  id: string;
  name: string;
  authority: {
    name: string;
    url: string;
    citation: string;
  };
  tier: Tier;
  dimension: "A" | "B" | "C";
  weight: number;
  elements?: string[];
  canShow: string;
  cantShow: string;
}

export interface Source {
  url: string;
  quotedSpan: string;
  fetchedAt: string;
}

export interface Finding {
  artifactId: string;
  status: FindingStatus;
  source?: Source;
  coverage: number;
  elementsPresent?: string[];
  note?: string;
}

export interface RunStep {
  tool:
    | "plan"
    | "discover"
    | "fetch"
    | "extract"
    | "evaluate"
    | "explain"
    | "self_check";
  input?: string;
  outcome: string;
  ok: boolean;
  ts: string;
}

export interface ScanResult {
  institution: string;
  state: "draft" | "verified";
  findings: Finding[];
  unseen: string[];
  score: {
    points: number;
    outOf: 100;
    byDimension: { A: number; B: number; C: number };
  };
  coverageCaveat: string;
  generatedAt: string;
  runLog: RunStep[];
}
