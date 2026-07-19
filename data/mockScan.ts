/** Supplies the pre-cached Santa Barbara public-evidence scan for instant, demo-safe rendering. */

import type { ScanResult } from "@/lib/types";

const fetchedAt = "2026-07-18T14:00:00.000Z";

export const cachedSantaBarbaraScan: ScanResult = {
  institution: "Santa Barbara Superior Court",
  state: "draft",
  findings: [
    {
      artifactId: "genai_policy",
      status: "found",
      coverage: 5 / 6,
      elementsPresent: [
        "no_nonpublic_data",
        "no_discrimination",
        "verify_accuracy",
        "remove_harmful",
        "comply_laws_ethics",
      ],
      source: {
        url: "https://www.santabarbara.courts.ca.gov/system/files/general/genai-policy-12152025.pdf",
        quotedSpan:
          "Court users shall not enter confidential, personal identifying, or other nonpublic information into a public generative AI system.",
        fetchedAt,
      },
      note: "Five of six Rule 10.430 elements were located in the cited policy.",
    },
    {
      artifactId: "strategic_plan",
      status: "found",
      coverage: 1,
      source: {
        url: "https://www.santabarbara.courts.ca.gov/system/files/general/01-sb-sup-ct-strategic-plan-final-111224.pdf",
        quotedSpan: "Strategic Plan 2025–2029",
        fetchedAt,
      },
    },
    {
      artifactId: "published_budget",
      status: "found",
      coverage: 1,
      source: {
        url: "https://www.santabarbara.courts.ca.gov/system/files/general/superior-court-santa-barbara-fy-2025-26-budget.pdf",
        quotedSpan: "Superior Court of California, County of Santa Barbara FY 2025–26 Budget",
        fetchedAt,
      },
    },
    {
      artifactId: "records_retention",
      status: "not_located",
      coverage: 0,
      note: "Not located in the public sources searched. This is not a finding of absence.",
    },
    {
      artifactId: "public_access_records",
      status: "not_located",
      coverage: 0,
      note: "A Rule 10.500 access process was not located and remains unverified.",
    },
    {
      artifactId: "language_access",
      status: "verified",
      coverage: 1,
      source: {
        url: "https://www.santabarbara.courts.ca.gov/general-information/language-access",
        quotedSpan: "Language Access Services",
        fetchedAt,
      },
      note: "Confirmed through human review of the cited court page.",
    },
  ],
  unseen: ["records_retention", "public_access_records"],
  score: {
    points: 62,
    outOf: 100,
    byDimension: { A: 31, B: 15, C: 16 },
  },
  coverageCaveat:
    "This surface describes public evidence posture, not the institution's true operational readiness.",
  generatedAt: fetchedAt,
  runLog: [
    {
      tool: "plan",
      outcome: "plan · 6 required artifacts to locate for this court",
      ok: true,
      ts: "2026-07-18T14:00:01.000Z",
    },
    {
      tool: "discover",
      outcome: "search · official Santa Barbara Superior Court domain",
      ok: true,
      ts: "2026-07-18T14:00:02.000Z",
    },
    {
      tool: "fetch",
      outcome: "fetch · court orders, policies, and rules",
      ok: true,
      ts: "2026-07-18T14:00:03.000Z",
    },
    {
      tool: "extract",
      outcome: "extract · Generative AI Use Policy · genai policy 12152025.pdf",
      ok: true,
      ts: "2026-07-18T14:00:04.000Z",
    },
    {
      tool: "self_check",
      outcome: "self check · source present · parsing Rule 10.430 elements",
      ok: true,
      ts: "2026-07-18T14:00:05.000Z",
    },
    {
      tool: "evaluate",
      outcome: "evaluate · GenAI policy · 5 of 6 elements · deterministic",
      ok: true,
      ts: "2026-07-18T14:00:06.000Z",
    },
    {
      tool: "discover",
      outcome: "search · records retention schedule",
      ok: true,
      ts: "2026-07-18T14:00:07.000Z",
    },
    {
      tool: "self_check",
      outcome: "not located · flagged for verification",
      ok: false,
      ts: "2026-07-18T14:00:08.000Z",
    },
    {
      tool: "fetch",
      outcome: "fetch · strategic plan and FY25–26 budget",
      ok: true,
      ts: "2026-07-18T14:00:09.000Z",
    },
    {
      tool: "evaluate",
      outcome: "evaluate · rule engine · surface 62 of 100 · weights published",
      ok: true,
      ts: "2026-07-18T14:00:10.000Z",
    },
    {
      tool: "explain",
      outcome: "explain · plain language narrative from result only",
      ok: true,
      ts: "2026-07-18T14:00:11.000Z",
    },
    {
      tool: "self_check",
      outcome: "complete · draft ready · absence never asserted",
      ok: true,
      ts: "2026-07-18T14:00:12.000Z",
    },
  ],
};
